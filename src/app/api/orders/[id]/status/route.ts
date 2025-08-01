import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/orders/[id]/status - Update order status with proper workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    const body = await request.json();
    const { status, notes, notify = true } = body;

    if (!status) {
      return NextResponse.json({
        success: false,
        error: 'Status is required'
      }, { status: 400 });
    }

    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
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

    if (!existingOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['confirmed', 'cancelled', 'failed'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['refunded'],
      'cancelled': ['refunded'],
      'failed': ['pending', 'cancelled'],
      'refunded': []
    };

    const allowedNextStatuses = validTransitions[existingOrder.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status transition from ${existingOrder.status} to ${status}`,
        allowedStatuses: allowedNextStatuses
      }, { status: 400 });
    }

    // Perform status update with side effects
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = { status };

      // Set appropriate timestamps
      switch (status) {
        case 'confirmed':
          if (!existingOrder.confirmedAt) {
            updateData.confirmedAt = new Date();
          }
          break;
        case 'shipped':
          if (!existingOrder.shippedAt) {
            updateData.shippedAt = new Date();
          }
          break;
        case 'delivered':
          if (!existingOrder.deliveredAt) {
            updateData.deliveredAt = new Date();
          }
          break;
      }

      // Update the order
      const order = await tx.order.update({
        where: { id },
        data: updateData,
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

      // Create status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          notes: notes || `Status changed to ${status}`,
          changedBy: session?.user?.id
        }
      });

      // Handle inventory changes based on status
      await handleInventoryChanges(tx, existingOrder, status);

      // Handle automatic payment status updates
      if (status === 'cancelled' || status === 'failed') {
        if (existingOrder.paymentStatus === 'paid') {
          await tx.order.update({
            where: { id },
            data: { paymentStatus: 'refunded' }
          });
        } else if (existingOrder.paymentStatus === 'pending') {
          await tx.order.update({
            where: { id },
            data: { paymentStatus: 'failed' }
          });
        }
      }

      return order;
    });

    // TODO: Send notifications (email, SMS, etc.) if notify is true
    if (notify) {
      await sendOrderStatusNotification(updatedOrder, status);
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update order status'
    }, { status: 500 });
  }
}

// Helper function to handle inventory changes
async function handleInventoryChanges(tx: any, order: any, newStatus: string) {
  const orderNumber = order.orderNumber;

  switch (newStatus) {
    case 'confirmed':
      // Reduce inventory when order is confirmed
      if (order.status !== 'confirmed') {
        for (const item of order.items) {
          const currentStock = item.product.stockQuantity;
          const newStock = Math.max(0, currentStock - item.quantity);

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'sale',
              quantity: -item.quantity,
              reason: `Order confirmed: ${orderNumber}`,
              reference: order.id,
              stockAfter: newStock
            }
          });

          // Update product stock and status
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: newStock,
              stockStatus: newStock <= 0 ? 'outofstock' : 
                          newStock <= (item.product.lowStockThreshold || 5) ? 'lowstock' : 'instock'
            }
          });
        }
      }
      break;

    case 'cancelled':
      // Restore inventory if order was previously confirmed
      if (order.status === 'confirmed' || order.status === 'processing') {
        for (const item of order.items) {
          const currentStock = item.product.stockQuantity;
          const newStock = currentStock + item.quantity;

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'return',
              quantity: item.quantity,
              reason: `Order cancelled: ${orderNumber}`,
              reference: order.id,
              stockAfter: newStock
            }
          });

          // Update product stock and status
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: newStock,
              stockStatus: 'instock'
            }
          });
        }
      }
      break;

    case 'refunded':
      // Handle refund inventory restoration if needed
      if (order.status === 'delivered') {
        for (const item of order.items) {
          const currentStock = item.product.stockQuantity;
          const newStock = currentStock + item.quantity;

          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'return',
              quantity: item.quantity,
              reason: `Order refunded: ${orderNumber}`,
              reference: order.id,
              stockAfter: newStock
            }
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: newStock,
              stockStatus: 'instock'
            }
          });
        }
      }
      break;
  }
}

// Helper function to send status notifications
async function sendOrderStatusNotification(order: any, status: string) {
  try {
    // Only send email notifications for specific status updates
    const emailStatuses = ['shipped', 'delivered', 'cancelled'];
    
    if (emailStatuses.includes(status)) {
      // Determine the customer email
      const customerEmail = order.user?.email || order.customerEmail;
      
      if (!customerEmail) {
        console.warn(`No email found for order ${order.orderNumber}`);
        return;
      }

      // Determine email type based on status
      let emailType = 'custom';
      let emailSubject = `Order ${order.orderNumber} - Status Update`;
      let emailContent = '';

      if (status === 'shipped') {
        emailType = 'order_shipped';
      } else {
        // For other statuses, create custom email content
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Order Status Update</h2>
            <p>Hi ${order.user?.name || 'Customer'},</p>
            <p>Your order status has been updated.</p>
            
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
              <h3>Order #${order.orderNumber}</h3>
              <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
              <p><strong>Total:</strong> ₹${order.total}</p>
              <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Thank you for your business!</p>
            <p>Best regards,<br>Your Store Team</p>
          </div>
        `;
      }

      // Send the email via our notification API
      const emailPayload = emailType === 'order_shipped' 
        ? {
            type: emailType,
            recipient: customerEmail,
            orderId: order.id,
            userId: order.userId,
            data: {
              userName: order.user?.name
            }
          }
        : {
            type: 'custom',
            recipient: customerEmail,
            orderId: order.id,
            userId: order.userId,
            data: {
              subject: emailSubject,
              html: emailContent
            }
          };

      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!emailResponse.ok) {
        console.error(`Failed to send ${status} notification email:`, await emailResponse.text());
      } else {
        console.log(`${status.charAt(0).toUpperCase() + status.slice(1)} notification email sent for order ${order.orderNumber}`);
      }
    }
  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
}

// GET /api/orders/[id]/status - Get order status history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Verify order exists and user has permission
    const order = await prisma.order.findUnique({
      where: { id },
      select: { userId: true, status: true, paymentStatus: true }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    if (order.userId && order.userId !== session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Get status history
    const statusHistory = await prisma.orderStatusHistory.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true,
            paymentStatus: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        currentStatus: order.status,
        currentPaymentStatus: order.paymentStatus,
        history: statusHistory
      }
    });

  } catch (error) {
    console.error('Error fetching order status history:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order status history'
    }, { status: 500 });
  }
}