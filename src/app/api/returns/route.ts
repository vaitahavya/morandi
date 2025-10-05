import { NextRequest, NextResponse } from 'next/server';
import { returnRepository } from '@/repositories';
import { prisma } from '@/lib/db';

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

    const result = await returnRepository.findMany(
      {
        status: status || undefined,
        orderId: orderId || undefined,
        customerEmail: customerEmail || undefined,
      },
      {
        page,
        limit,
        sortBy: sortBy || 'created_at',
        sortOrder: sortOrder as 'asc' | 'desc',
      }
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
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
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { order_items: true },
    });

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
        product_id: orderItem.product_id || '',
        product_name: orderItem.product_name || '',
        quantity_returned: item.quantity,
        unit_price: Number(orderItem.unit_price || orderItem.price),
        total_refund_amount: itemRefundAmount
      });
    }

    // Create return record
    const newReturn = await returnRepository.create({
      returnNumber: `RET-${Date.now()}`,
      orderId: orderId,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      returnReason: returnReason,
      returnDescription: returnDescription,
      status: 'pending',
      returnType: returnType || 'refund',
      refundAmount: totalRefundAmount,
      images,
      videos,
      items: validItems.map(item => ({
        orderItemId: item.order_item_id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity_returned,
        unitPrice: item.unit_price,
        totalRefundAmount: item.total_refund_amount,
        restockable: true
      }))
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