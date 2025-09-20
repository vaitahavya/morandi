import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import Razorpay from 'razorpay';

// Initialize Razorpay instance (only if credentials are available)
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// POST /api/payment/webhook - Handle Razorpay webhooks
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('Missing Razorpay signature');
      return NextResponse.json({
        success: false,
        error: 'Missing signature'
      }, { status: 400 });
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(body, signature);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({
        success: false,
        error: 'Invalid signature'
      }, { status: 400 });
    }

    // Parse the webhook payload
    const webhookData = JSON.parse(body);
    const { event, payload } = webhookData;

    console.log(`Received Razorpay webhook: ${event}`);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
        
      case 'order.paid':
        await handleOrderPaid(payload.order.entity);
        break;
        
      case 'payment.authorized':
        await handlePaymentAuthorized(payload.payment.entity);
        break;
        
      case 'refund.created':
        await handleRefundCreated(payload.refund.entity);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}

// Verify webhook signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Handle payment captured event
async function handlePaymentCaptured(payment: any) {
  try {
    console.log(`Processing payment captured: ${payment.id}`);

    // Find order by Razorpay order ID
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: payment.order_id },
      include: {
        items: {
          include: {
            product: {
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
      console.error(`Order not found for payment: ${payment.id}`);
      return;
    }

    // Skip if already processed
    if (order.paymentStatus === 'paid') {
      console.log(`Payment already processed for order: ${order.orderNumber}`);
      return;
    }

    // Verify payment amount
    const paidAmount = payment.amount / 100; // Convert from paise
    if (Math.abs(paidAmount - order.total) > 0.01) {
      console.error(`Amount mismatch for order ${order.orderNumber}: expected ${order.total}, got ${paidAmount}`);
      return;
    }

    // Process payment confirmation
    await prisma.$transaction(async (tx) => {
      // Update order
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: order.status === 'pending' ? 'confirmed' : order.status,
          razorpayPaymentId: payment.id,
          transactionId: payment.id
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'confirmed',
          notes: `Payment captured via webhook - Payment ID: ${payment.id}`
        }
      });

      // Update inventory if order is being confirmed
      if (order.status === 'pending') {
        for (const item of order.items) {
          const currentStock = item.product.stockQuantity;
          const newStock = Math.max(0, currentStock - item.quantity);

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'sale',
              quantity: -item.quantity,
              reason: `Order confirmed via webhook: ${order.orderNumber}`,
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
      }

      // Create email notification
      await tx.emailNotification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'payment_confirmed',
          subject: `Payment Confirmed - ${order.orderNumber}`,
          content: `Payment for order ${order.orderNumber} has been confirmed.`,
          sent: false
        }
      });
    });

    console.log(`Successfully processed payment captured for order: ${order.orderNumber}`);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

// Handle payment failed event
async function handlePaymentFailed(payment: any) {
  try {
    console.log(`Processing payment failed: ${payment.id}`);

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: payment.order_id }
    });

    if (!order) {
      console.error(`Order not found for failed payment: ${payment.id}`);
      return;
    }

    // Update order payment status
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          razorpayPaymentId: payment.id
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: order.status,
          notes: `Payment failed - Payment ID: ${payment.id}, Reason: ${payment.error_description || 'Unknown'}`
        }
      });

      // Create notification
      await tx.emailNotification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'payment_failed',
          subject: `Payment Failed - ${order.orderNumber}`,
          content: `Payment for order ${order.orderNumber} has failed. Please try again.`,
          sent: false
        }
      });
    });

    console.log(`Successfully processed payment failed for order: ${order.orderNumber}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Handle order paid event
async function handleOrderPaid(razorpayOrder: any) {
  try {
    console.log(`Processing order paid: ${razorpayOrder.id}`);

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpayOrder.id }
    });

    if (!order) {
      console.error(`Order not found for Razorpay order: ${razorpayOrder.id}`);
      return;
    }

    // This event is fired when an order is fully paid
    // Usually follows payment.captured for the same transaction
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: order.status,
        notes: `Order marked as paid by Razorpay - Order ID: ${razorpayOrder.id}`
      }
    });

    console.log(`Successfully processed order paid for: ${order.orderNumber}`);
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

// Handle payment authorized event (for manual capture scenarios)
async function handlePaymentAuthorized(payment: any) {
  try {
    console.log(`Processing payment authorized: ${payment.id}`);

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: payment.order_id }
    });

    if (!order) {
      console.error(`Order not found for authorized payment: ${payment.id}`);
      return;
    }

    // For auto-capture, this will be followed by payment.captured
    // For manual capture, this indicates payment is ready to be captured
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: order.status,
        notes: `Payment authorized - Payment ID: ${payment.id}`
      }
    });

    console.log(`Successfully processed payment authorized for order: ${order.orderNumber}`);
  } catch (error) {
    console.error('Error handling payment authorized:', error);
  }
}

// Handle refund created event
async function handleRefundCreated(refund: any) {
  try {
    console.log(`Processing refund created: ${refund.id}`);

    // Find order by payment ID
    const order = await prisma.order.findFirst({
      where: { razorpayPaymentId: refund.payment_id }
    });

    if (!order) {
      console.error(`Order not found for refund: ${refund.id}`);
      return;
    }

    const refundAmount = refund.amount / 100; // Convert from paise
    const isFullRefund = Math.abs(refundAmount - order.total) < 0.01;

    await prisma.$transaction(async (tx) => {
      // Update order payment status
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
          status: isFullRefund ? 'refunded' : order.status
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: isFullRefund ? 'refunded' : order.status,
          notes: `${isFullRefund ? 'Full' : 'Partial'} refund processed - Amount: ₹${refundAmount}, Refund ID: ${refund.id}`
        }
      });

      // Create notification
      await tx.emailNotification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'refund_processed',
          subject: `Refund Processed - ${order.orderNumber}`,
          content: `A refund of ₹${refundAmount} has been processed for order ${order.orderNumber}.`,
          sent: false
        }
      });
    });

    console.log(`Successfully processed refund for order: ${order.orderNumber}`);
  } catch (error) {
    console.error('Error handling refund created:', error);
  }
}