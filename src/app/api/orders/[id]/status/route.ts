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
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                stock_quantity: true
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
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
      failed: [],
      refunded: []
    };

    const allowedNextStatuses = validTransitions[existingOrder.status || 'pending'] || [];
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

      // Update status-specific fields
      switch (status) {
        case 'confirmed':
          // No specific timestamp field in schema
          break;
        case 'processing':
          // No specific timestamp field in schema
          break;
        case 'shipped':
          if (!existingOrder.shipped_at) {
            updateData.shipped_at = new Date();
          }
          break;
        case 'delivered':
          if (!existingOrder.delivered_at) {
            updateData.delivered_at = new Date();
          }
          break;
        case 'cancelled':
          // No specific timestamp field in schema
          break;
        case 'refunded':
          // No specific timestamp field in schema
          break;
      }

      // Update the order
      const order = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          order_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true
                }
              }
            }
          },
          users: {
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
          order_id: id,
          status,
          notes: notes || `Status changed to ${status}`,
          changed_by: session?.user?.id
        }
      });

      // Handle inventory changes based on status
      await handleInventoryChanges(tx, existingOrder, status);

      // Handle automatic payment status updates
      if (status === 'cancelled' || status === 'failed') {
        if (existingOrder.payment_status === 'paid') {
          await tx.order.update({
            where: { id },
            data: { payment_status: 'refunded' }
          });
        } else if (existingOrder.payment_status === 'pending') {
          await tx.order.update({
            where: { id },
            data: { payment_status: 'failed' }
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
  const order_number = order.order_number;

  switch (newStatus) {
    case 'confirmed':
      // Reduce inventory when order is confirmed
      if (order.status !== 'confirmed') {
        for (const item of order.items) {
          const currentStock = item.product.stock_quantity;
          const newStock = Math.max(0, currentStock - item.quantity);

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'sale',
              quantity: -item.quantity,
              reason: `Order confirmed: ${order_number}`,
              reference: order.id,
              stockAfter: newStock
            }
          });

          // Update product stock and status
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock_quantity: newStock,
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
          const currentStock = item.product.stock_quantity;
          const newStock = currentStock + item.quantity;

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'return',
              quantity: item.quantity,
              reason: `Order cancelled: ${order_number}`,
              reference: order.id,
              stockAfter: newStock
            }
          });

          // Update product stock and status
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock_quantity: newStock,
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
          const currentStock = item.product.stock_quantity;
          const newStock = currentStock + item.quantity;

          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'return',
              quantity: item.quantity,
              reason: `Order refunded: ${order_number}`,
              reference: order.id,
              stockAfter: newStock
            }
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock_quantity: newStock,
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
        console.warn(`No email found for order ${order.order_number}`);
        return;
      }

      // Determine email type based on status
      let emailType = 'custom';
      let emailSubject = `Order ${order.order_number} - Status Update`;
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
              <h3>Order #${order.order_number}</h3>
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
            order_id: order.id,
            user_id: order.user_id,
            data: {
              userName: order.user?.name
            }
          }
        : {
            type: 'custom',
            recipient: customerEmail,
            order_id: order.id,
            user_id: order.user_id,
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
        console.log(`${status.charAt(0).toUpperCase() + status.slice(1)} notification email sent for order ${order.order_number}`);
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
      select: { user_id: true, status: true, payment_status: true }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    if (order.user_id && order.user_id !== session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Get status history
    const statusHistory = await prisma.orderStatusHistory.findMany({
      where: { order_id: id },
      orderBy: { created_at: 'desc' },
      include: {
        order: {
          select: {
            order_number: true,
            status: true,
            payment_status: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        currentStatus: order.status,
        currentPaymentStatus: order.payment_status,
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