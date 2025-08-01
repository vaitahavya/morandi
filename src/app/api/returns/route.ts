import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'requested_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';
    
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('returns')
      .select(`
        *,
        return_items (
          id,
          product_name,
          quantity_returned,
          unit_price,
          total_refund_amount,
          condition_received,
          restockable
        ),
        orders (
          order_number,
          total,
          created_at as order_date
        )
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`return_number.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (fromDate) {
      query = query.gte('requested_at', fromDate);
    }

    if (toDate) {
      query = query.lte('requested_at', toDate + 'T23:59:59');
    }

    const { data: returns, error: returnsError } = await query;
    
    if (returnsError) {
      console.error('Error fetching returns:', returnsError);
      return NextResponse.json({ success: false, error: 'Failed to fetch returns' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('returns')
      .select('id', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`return_number.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    if (fromDate) {
      countQuery = countQuery.gte('requested_at', fromDate);
    }
    if (toDate) {
      countQuery = countQuery.lte('requested_at', toDate + 'T23:59:59');
    }

    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error getting returns count:', countError);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Calculate summary stats
    const statsQuery = supabase
      .from('returns')
      .select('status, refund_amount');

    const { data: statsData } = await statsQuery;

    const stats = {
      totalReturns: total,
      pendingReturns: statsData?.filter(r => r.status === 'pending').length || 0,
      approvedReturns: statsData?.filter(r => r.status === 'approved').length || 0,
      processedReturns: statsData?.filter(r => r.status === 'processed').length || 0,
      refundedReturns: statsData?.filter(r => r.status === 'refunded').length || 0,
      totalRefundAmount: statsData?.reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0,
      avgRefundAmount: statsData && statsData.length > 0 
        ? statsData.reduce((sum, r) => sum + (r.refund_amount || 0), 0) / statsData.length 
        : 0
    };

    return NextResponse.json({
      success: true,
      data: returns,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('Error in returns API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const {
      orderId,
      customerEmail,
      customerPhone,
      returnReason,
      returnDescription,
      returnType = 'refund',
      items, // Array of { orderItemId, quantity, reason }
      images = [],
      videos = []
    } = body;

    // Validate required fields
    if (!orderId || !customerEmail || !returnReason || !items || !items.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Verify order exists and belongs to customer
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', orderId)
      .eq('customer_email', customerEmail)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found or access denied' 
      }, { status: 404 });
    }

    // Check if order is eligible for returns
    const orderDate = new Date(order.created_at);
    const daysSinceOrder = Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceOrder > 30) { // 30-day return policy
      return NextResponse.json({ 
        success: false, 
        error: 'Return window has expired (30 days)' 
      }, { status: 400 });
    }

    // Check if order status allows returns
    if (!['delivered', 'completed'].includes(order.status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order must be delivered to initiate a return' 
      }, { status: 400 });
    }

    // Calculate refund amount
    let totalRefundAmount = 0;
    const validItems = [];

    for (const item of items) {
      const orderItem = order.order_items.find(oi => oi.id === item.orderItemId);
      if (!orderItem) {
        return NextResponse.json({ 
          success: false, 
          error: `Order item ${item.orderItemId} not found` 
        }, { status: 400 });
      }

      if (item.quantity > orderItem.quantity) {
        return NextResponse.json({ 
          success: false, 
          error: `Cannot return more items than ordered for ${orderItem.product_name}` 
        }, { status: 400 });
      }

      const itemRefundAmount = orderItem.unit_price * item.quantity;
      totalRefundAmount += itemRefundAmount;

      validItems.push({
        orderItemId: item.orderItemId,
        productId: orderItem.product_id,
        productName: orderItem.product_name,
        quantity: item.quantity,
        unitPrice: orderItem.unit_price,
        totalRefundAmount: itemRefundAmount
      });
    }

    // Generate return number
    const { data: returnNumberData, error: returnNumberError } = await supabase
      .rpc('generate_return_number');

    if (returnNumberError) {
      console.error('Error generating return number:', returnNumberError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to generate return number' 
      }, { status: 500 });
    }

    // Create return record
    const returnData = {
      return_number: returnNumberData,
      order_id: orderId,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      return_reason: returnReason,
      return_description: returnDescription,
      return_type: returnType,
      refund_amount: totalRefundAmount,
      status: 'pending',
      images,
      videos,
      requested_at: new Date().toISOString()
    };

    const { data: newReturn, error: returnError } = await supabase
      .from('returns')
      .insert(returnData)
      .select()
      .single();

    if (returnError) {
      console.error('Error creating return:', returnError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create return request' 
      }, { status: 500 });
    }

    // Create return items
    const returnItems = validItems.map(item => ({
      return_id: newReturn.id,
      order_item_id: item.orderItemId,
      product_id: item.productId,
      product_name: item.productName,
      quantity_returned: item.quantity,
      unit_price: item.unitPrice,
      total_refund_amount: item.totalRefundAmount,
      restockable: true // Default to true, admin can update
    }));

    const { error: itemsError } = await supabase
      .from('return_items')
      .insert(returnItems);

    if (itemsError) {
      console.error('Error creating return items:', itemsError);
      // Rollback the return if items creation failed
      await supabase.from('returns').delete().eq('id', newReturn.id);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create return items' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        returnId: newReturn.id,
        returnNumber: newReturn.return_number,
        status: newReturn.status,
        refundAmount: totalRefundAmount
      }
    });

  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}