import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/payment/confirm - Confirm payment after successful Razorpay payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id // Our internal order ID
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({
        success: false,
        error: 'Missing required payment parameters'
      }, { status: 400 });
    }

    // Verify payment signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment signature'
      }, { status: 400 });
    }

    // Find the order
    const whereClause = order_id 
      ? { id: order_id }
      : { razorpayOrderId: razorpay_order_id };

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                stockQuantity: true
              }
            }
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

    // Verify user has permission
    if (order.userId && order.userId !== session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Check if payment is already processed
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Payment already processed'
      }, { status: 400 });
    }

    // Fetch payment details from Razorpay
    let paymentDetails;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to verify payment with Razorpay'
      }, { status: 500 });
    }

    // Verify payment status and amount
    if (paymentDetails.status !== 'captured') {
      return NextResponse.json({
        success: false,
        error: 'Payment not captured'
      }, { status: 400 });
    }

    const paidAmount = Number(paymentDetails.amount) / 100; // Convert from paise to rupees
    if (Math.abs(paidAmount - order.total) > 0.01) {
      return NextResponse.json({
        success: false,
        error: 'Payment amount mismatch'
      }, { status: 400 });
    }

    // Process the payment confirmation
    const confirmedOrder = await prisma.$transaction(async (tx) => {
      // Update order with payment details
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed', // Auto-confirm order on successful payment
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          transactionId: razorpay_payment_id
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create order status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'confirmed',
          notes: `Payment confirmed - Razorpay Payment ID: ${razorpay_payment_id}`,
          changedBy: session?.user?.id
        }
      });

      // Update inventory for confirmed order
      for (const item of order.order_items) {
        const currentStock = item.products?.stockQuantity || 0;
        const newStock = Math.max(0, currentStock - item.quantity);

        // Create inventory transaction
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: 'sale',
            quantity: -item.quantity,
            reason: `Order confirmed: ${order.orderNumber}`,
            reference: order.id,
            stockAfter: newStock
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: newStock,
            stockStatus: newStock <= 0 ? 'outofstock' : 
                        newStock <= 5 ? 'lowstock' : 'instock'
          }
        });
      }

      // Create email notification for order confirmation
      await tx.emailNotification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'order_confirmation',
          subject: `Order Confirmed - ${order.orderNumber}`,
          content: `Your order ${order.orderNumber} has been confirmed and payment received.`,
          sent: false
        }
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      data: {
        order: confirmedOrder,
        payment: {
          id: razorpay_payment_id,
          amount: paidAmount,
          currency: paymentDetails.currency,
          method: paymentDetails.method,
          status: paymentDetails.status
        }
      },
      message: 'Payment confirmed successfully'
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to confirm payment'
    }, { status: 500 });
  }
}

// Verify Razorpay signature
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

// GET /api/payment/confirm - Get payment confirmation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID or Payment ID is required'
      }, { status: 400 });
    }

    // Find order
    const whereClause = orderId 
      ? { id: orderId }
      : { razorpayPaymentId: paymentId };

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
        currency: true,
        createdAt: true
      }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Get payment details from Razorpay if payment ID exists
    let paymentDetails = null;
    if (order.razorpayPaymentId) {
      try {
        const payment = await razorpay.payments.fetch(order.razorpayPaymentId);
        paymentDetails = {
          id: payment.id,
          amount: Number(payment.amount) / 100, // Convert to rupees
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          created_at: payment.created_at
        };
      } catch (error) {
        console.error('Error fetching payment details:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order: order,
        payment: paymentDetails
      }
    });

  } catch (error) {
    console.error('Error fetching payment confirmation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payment confirmation'
    }, { status: 500 });
  }
}