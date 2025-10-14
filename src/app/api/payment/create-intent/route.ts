import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Razorpay instance (only if credentials are available)
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// POST /api/payment/create-intent - Create Razorpay payment order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { orderId, amount, currency = 'INR' } = body;

    if (!orderId || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Order ID and amount are required'
      }, { status: 400 });
    }

    // Verify the order exists and get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Verify user has permission to pay for this order
    if (order.userId && order.userId !== session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Verify order amount matches
    const orderAmount = Math.round(Number(order.total) * 100); // Convert to paise
    const requestAmount = Math.round(amount * 100);

    if (orderAmount !== requestAmount) {
      return NextResponse.json({
        success: false,
        error: 'Amount mismatch'
      }, { status: 400 });
    }

    // Check if order is in valid state for payment
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return NextResponse.json({
        success: false,
        error: `Cannot pay for order with status: ${order.status}`
      }, { status: 400 });
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Order is already paid'
      }, { status: 400 });
    }

    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: orderAmount, // Amount in paise
      currency: currency.toUpperCase(),
      receipt: order.orderNumber,
      notes: {
        order_id: order.id,
        order_number: order.orderNumber,
        customer_email: order.customerEmail,
        customer_name: `${order.billingFirstName} ${order.billingLastName}`
      }
    };

    if (!razorpay) {
      return NextResponse.json({
        success: false,
        error: 'Payment service not configured'
      }, { status: 500 });
    }

    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions as any);

    // Update our order with Razorpay order ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: 'pending'
      }
    });

    // Prepare response for frontend
    const paymentData = {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status,
      // Data for Razorpay checkout
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: razorpayOrder.id,
      prefill: {
          name: `${order.billingFirstName} ${order.billingLastName}`,
        email: order.customerEmail,
        contact: order.customerPhone || ''
      },
      theme: {
        color: '#3B82F6' // Primary blue color
      },
      notes: razorpayOrder.notes
    };

    return NextResponse.json({
      success: true,
      data: paymentData,
      message: 'Payment intent created successfully'
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Check for specific Razorpay errors
    if (error && typeof error === 'object' && 'error' in error && error.error) {
      return NextResponse.json({
        success: false,
        error: (error as any).error.description || 'Payment service error'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create payment intent'
    }, { status: 500 });
  }
}

// GET /api/payment/create-intent - Get payment status for an order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const razorpayOrderId = searchParams.get('razorpayOrderId');

    if (!orderId && !razorpayOrderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID or Razorpay Order ID is required'
      }, { status: 400 });
    }

    // Find order
    const whereClause = orderId 
      ? { id: orderId }
      : { razorpayOrderId: razorpayOrderId };

    const order = await prisma.order.findFirst({
      where: whereClause,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        total: true,
        currency: true
      }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Get Razorpay order status if we have the ID
    let razorpayStatus = null;
    if (order.razorpayOrderId && razorpay) {
      try {
        const razorpayOrder = await razorpay.orders.fetch(order.razorpayOrderId);
        razorpayStatus = {
          id: razorpayOrder.id,
          status: razorpayOrder.status,
          amount: razorpayOrder.amount,
          amount_paid: razorpayOrder.amount_paid,
          currency: razorpayOrder.currency
        };
      } catch (error) {
        console.error('Error fetching Razorpay order:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: order.total,
          currency: order.currency
        },
        razorpay: razorpayStatus
      }
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payment status'
    }, { status: 500 });
  }
}