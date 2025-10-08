import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/orders/[id] - Get individual order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                featured_image: true,
                sku: true
              }
            }
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Check if user has permission to view this order
    if (order.user_id && order.user_id !== session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order'
    }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;
    const body = await request.json();

    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        order_items: true
      }
    });

    if (!existingOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Check permissions
    const isOwner = existingOrder.user_id === session?.user?.id;
    const isAdmin = false; // Role-based auth not implemented yet
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Prepare update data based on what's allowed to be updated
    const updateData: any = {};
    const allowedUpdates = [
      'status', 'payment_status', 'customerNotes', 'admin_notes',
      'shippingMethod', 'shippingMethodTitle', 'trackingNumber',
      'shippingCarrier', 'estimatedDelivery', 'transactionId',
      'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'
    ];

    // Regular users can only update limited fields
    const userAllowedUpdates = ['customerNotes'];
    const updatesAllowed = isAdmin ? allowedUpdates : userAllowedUpdates;

    updatesAllowed.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Handle special status updates
    if (updateData.status && updateData.status !== existingOrder.status) {
      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered', 'cancelled'],
        delivered: [],
        cancelled: [],
        refunded: []
      };

      const allowedNextStatuses = validTransitions[existingOrder.status || 'pending'] || [];
      if (!allowedNextStatuses.includes(updateData.status)) {
        return NextResponse.json({
          success: false,
          error: `Cannot change status from ${existingOrder.status} to ${updateData.status}`
        }, { status: 400 });
      }

      // Set timestamps for certain status changes
      if (updateData.status === 'shipped' && !existingOrder.shipped_at) {
        updateData.shipped_at = new Date();
      }
      if (updateData.status === 'delivered' && !existingOrder.delivered_at) {
        updateData.delivered_at = new Date();
      }
    }

    // Handle payment status updates
    if (updateData.payment_status === 'paid' && existingOrder.payment_status !== 'paid') {
      // Auto-confirm order when payment is successful
      if (existingOrder.status === 'pending') {
        updateData.status = 'confirmed';
      }
    }

    // Update order
    const updatedOrder = await prisma.$transaction(async (tx) => {
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
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // Create status history entry if status changed
      if (updateData.status && updateData.status !== existingOrder.status) {
        await tx.orderStatusHistory.create({
          data: {
            order_id: id,
            status: updateData.status,
            notes: body.statusNote || `Status changed to ${updateData.status}`,
            changed_by: session?.user?.id
          }
        });
      }

      // Handle inventory updates based on status changes
      if (updateData.status === 'confirmed' && existingOrder.status !== 'confirmed') {
        // Reduce inventory when order is confirmed
        for (const item of existingOrder.order_items) {
          if (item.product_id) {
            await tx.inventoryTransaction.create({
              data: {
                product_id: item.product_id,
                type: 'sale',
                quantity: -item.quantity,
                reason: `Order confirmed: ${existingOrder.order_number}`,
                reference: id,
                stock_after: Math.max(0, await getProductStock(tx, item.product_id) - item.quantity)
              }
            });

            // Update product stock
            await tx.product.update({
              where: { id: item.product_id },
              data: {
                stock_quantity: {
                  decrement: item.quantity
                },
                stock_status: await getProductStock(tx, item.product_id) - item.quantity <= 0 ? 'outofstock' : 'instock'
              }
            });
          }
        }
      }

      // Restore inventory if order is cancelled from confirmed status
      if (updateData.status === 'cancelled' && existingOrder.status === 'confirmed') {
        for (const item of existingOrder.order_items) {
          if (item.product_id) {
            await tx.inventoryTransaction.create({
              data: {
                product_id: item.product_id,
                type: 'return',
                quantity: item.quantity,
                reason: `Order cancelled: ${existingOrder.order_number}`,
                reference: id,
                stock_after: await getProductStock(tx, item.product_id) + item.quantity
              }
            });

            // Update product stock
            await tx.product.update({
              where: { id: item.product_id },
              data: {
                stock_quantity: {
                  increment: item.quantity
                },
                stock_status: 'instock'
              }
            });
          }
        }
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update order'
    }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - Cancel order (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { order_items: true }
    });

    if (!existingOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Check permissions
    const isOwner = existingOrder.user_id === session?.user?.id;
    const isAdmin = false; // Role-based auth not implemented yet
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Only allow cancellation of certain statuses
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(existingOrder.status || 'pending')) {
      return NextResponse.json({
        success: false,
        error: `Cannot cancel order with status: ${existingOrder.status}`
      }, { status: 400 });
    }

    // Cancel the order
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Update order status to cancelled
      const order = await tx.order.update({
        where: { id },
        data: {
          status: 'cancelled',
          admin_notes: `Order cancelled by ${isOwner ? 'customer' : 'admin'}`
        }
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          order_id: id,
          status: 'cancelled',
          notes: `Order cancelled by ${isOwner ? 'customer' : 'admin'}`,
          changed_by: session?.user?.id
        }
      });

      // Restore inventory if order was confirmed
      if (existingOrder.status === 'confirmed') {
        for (const item of existingOrder.order_items) {
          if (item.product_id) {
            await tx.inventoryTransaction.create({
              data: {
                product_id: item.product_id,
                type: 'return',
                quantity: item.quantity,
                reason: `Order cancelled: ${existingOrder.order_number}`,
                reference: id,
                stock_after: await getProductStock(tx, item.product_id) + item.quantity
              }
            });

            await tx.product.update({
              where: { id: item.product_id },
              data: {
                stock_quantity: { increment: item.quantity },
                stock_status: 'instock'
              }
            });
          }
        }
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { id: cancelledOrder.id, status: cancelledOrder.status }
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel order'
    }, { status: 500 });
  }
}

// Helper function to get current product stock
async function getProductStock(tx: any, product_id: string): Promise<number> {
  const product = await tx.product.findUnique({
    where: { id: product_id },
    select: { stock_quantity: true }
  });
  return product?.stock_quantity || 0;
}