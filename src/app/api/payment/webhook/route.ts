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
      where: { razorpay_order_id: payment.order_id },
      include: {
        orderItems: {
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
    if (order.payment_status === 'paid') {
      console.log(`Payment already processed for order: ${order.order_number}`);
      return;
    }

    // Verify payment amount
    const paidAmount = payment.amount / 100; // Convert from paise
    if (Math.abs(paidAmount - Number(order.total)) > 0.01) {
      console.error(`Amount mismatch for order ${order.order_number}: expected ${order.total}, got ${paidAmount}`);
      return;
    }

    // Process payment confirmation
    await prisma.$transaction(async (tx) => {
      // Update order
      await tx.order.update({
        where: { id: order.id },
        data: {
          payment_status: 'paid',
          status: order.status === 'pending' ? 'confirmed' : order.status,
          razorpay_payment_id: payment.id,
          transaction_id: payment.id
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          order_id: order.id,
          status: 'confirmed',
          notes: `Payment captured via webhook - Payment ID: ${payment.id}`
        }
      });

      // Update inventory if order is being confirmed
      if (order.status === 'pending') {
        for (const item of order.order_items) {
          const currentStock = item.products?.stockQuantity || 0;
          const newStock = Math.max(0, currentStock - item.quantity);

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              product_id: item.product_id,
              type: 'sale',
              quantity: -item.quantity,
              reason: `Order confirmed via webhook: ${order.order_number}`,
              reference: order.id,
              stockAfter: newStock
            }
          });

          // Update product stock
          if (item.product_id) {
            await tx.product.update({
              where: { id: item.product_id },
              data: {
                stockQuantity: newStock,
                stockStatus: newStock <= 0 ? 'outofstock' : 
                            newStock <= 5 ? 'lowstock' : 'instock'
              }
            });
          }
        }
      }

      // Create email notification
      await tx.emailNotification.create({
        data: {
          user_id: order.user_id,
          order_id: order.id,
          type: 'payment_confirmed',
          subject: `Payment Confirmed - ${order.order_number}`,
          content: `Payment for order ${order.order_number} has been confirmed.`,
          sent: false
        }
      });
    });

    console.log(`Successfully processed payment captured for order: ${order.order_number}`);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

// Handle payment failed event
async function handlePaymentFailed(payment: any) {
  try {
    console.log(`Processing payment failed: ${payment.id}`);

    const order = await prisma.order.findFirst({
      where: { razorpay_order_id: payment.order_id }
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
          payment_status: 'failed',
          razorpay_payment_id: payment.id
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          order_id: order.id,
          status: order.status || 'pending',
          notes: `Payment failed - Payment ID: ${payment.id}, Reason: ${payment.error_description || 'Unknown'}`
        }
      });

      // Create notification
      await tx.emailNotification.create({
        data: {
          user_id: order.user_id,
          order_id: order.id,
          type: 'payment_failed',
          subject: `Payment Failed - ${order.order_number}`,
          content: `Payment for order ${order.order_number} has failed. Please try again.`,
          sent: false
        }
      });
    });

    console.log(`Successfully processed payment failed for order: ${order.order_number}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Handle order paid event
async function handleOrderPaid(razorpayOrder: any) {
  try {
    console.log(`Processing order paid: ${razorpayOrder.id}`);

    const order = await prisma.order.findFirst({
      where: { razorpay_order_id: razorpayOrder.id }
    });

    if (!order) {
      console.error(`Order not found for Razorpay order: ${razorpayOrder.id}`);
      return;
    }

    // This event is fired when an order is fully paid
    // Usually follows payment.captured for the same transaction
    await prisma.orderStatusHistory.create({
      data: {
        order_id: order.id,
        status: order.status || 'pending',
        notes: `Order marked as paid by Razorpay - Order ID: ${razorpayOrder.id}`
      }
    });

    console.log(`Successfully processed order paid for: ${order.order_number}`);
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

// Handle payment authorized event (for manual capture scenarios)
async function handlePaymentAuthorized(payment: any) {
  try {
    console.log(`Processing payment authorized: ${payment.id}`);

    const order = await prisma.order.findFirst({
      where: { razorpay_order_id: payment.order_id }
    });

    if (!order) {
      console.error(`Order not found for authorized payment: ${payment.id}`);
      return;
    }

    // For auto-capture, this will be followed by payment.captured
    // For manual capture, this indicates payment is ready to be captured
    await prisma.orderStatusHistory.create({
      data: {
        order_id: order.id,
        status: order.status || 'pending',
        notes: `Payment authorized - Payment ID: ${payment.id}`
      }
    });

    console.log(`Successfully processed payment authorized for order: ${order.order_number}`);
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
      where: { razorpay_payment_id: refund.payment_id }
    });

    if (!order) {
      console.error(`Order not found for refund: ${refund.id}`);
      return;
    }

    const refundAmount = refund.amount / 100; // Convert from paise
    const isFullRefund = Math.abs(refundAmount - Number(order.total)) < 0.01;

    await prisma.$transaction(async (tx) => {
      // Update order payment status
      await tx.order.update({
        where: { id: order.id },
        data: {
          payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
          status: isFullRefund ? 'refunded' : order.status
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          order_id: order.id,
          status: isFullRefund ? 'refunded' : (order.status || 'pending'),
          notes: `${isFullRefund ? 'Full' : 'Partial'} refund processed - Amount: ₹${refundAmount}, Refund ID: ${refund.id}`
        }
      });

      // Create notification
      await tx.emailNotification.create({
        data: {
          user_id: order.user_id,
          order_id: order.id,
          type: 'refund_processed',
          subject: `Refund Processed - ${order.order_number}`,
          content: `A refund of ₹${refundAmount} has been processed for order ${order.order_number}.`,
          sent: false
        }
      });
    });

    console.log(`Successfully processed refund for order: ${order.order_number}`);
  } catch (error) {
    console.error('Error handling refund created:', error);
  }
}