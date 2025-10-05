import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const customerEmail = searchParams.get('customerEmail');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const result = await DatabaseService.getReturns({
      page,
      limit,
      status,
      orderId,
      customerEmail,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    return NextResponse.json({
      success: true,
      data: result.returns,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
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
    const order = await DatabaseService.getOrderById(orderId);

    if (!order || order.customer_email !== customerEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found or access denied' 
      }, { status: 404 });
    }

    // Check if order is eligible for returns
    const orderDate = new Date(order.created_at!);
    const daysSinceOrder = Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceOrder > 30) { // 30-day return policy
      return NextResponse.json({ 
        success: false, 
        error: 'Return window has expired (30 days)' 
      }, { status: 400 });
    }

    // Check if order status allows returns
    if (!['delivered', 'completed'].includes(order.status || '')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order must be delivered to initiate a return' 
      }, { status: 400 });
    }

    // Calculate refund amount and validate items
    let totalRefundAmount = 0;
    const validItems = [];

    for (const item of items) {
      const orderItem = order.order_items.find((oi) => oi.id === item.orderItemId);
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

      const itemRefundAmount = Number(orderItem.unit_price || orderItem.price) * item.quantity;
      totalRefundAmount += itemRefundAmount;

      validItems.push({
        order_item_id: item.orderItemId,
        product_id: orderItem.product_id,
        product_name: orderItem.product_name,
        quantity_returned: item.quantity,
        unit_price: orderItem.unit_price || orderItem.price,
        total_refund_amount: itemRefundAmount
      });
    }

    // Create return record
    const newReturn = await DatabaseService.createReturn({
      order_id: orderId,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      return_reason: returnReason,
      return_description: returnDescription,
      return_type: returnType,
      refund_amount: totalRefundAmount,
      images,
      videos,
      items: validItems
    });

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