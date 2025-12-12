import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/notifications/count - Get unread notifications count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    const where: any = {
      sent: true, // Only count successfully sent notifications
    };

    if (userId) where.userId = userId;
    if (type) where.type = type;

    // Get total count of notifications
    const totalCount = await prisma.emailNotification.count({ where });

    // Get recent notifications (last 24 hours) for "unread" count
    const recentCount = await prisma.emailNotification.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    // Get low stock alerts count
    const lowStockCount = await prisma.product.count({
      where: {
        status: 'published',
        OR: [
          { stockStatus: 'lowstock' },
          { stockStatus: 'outofstock' }
        ]
      }
    });

    // Get pending orders count
    // Only count orders that are actually pending and have order items (real orders, not empty)
    // Also ensure they have valid customer email and total > 0
    const pendingOrdersCount = await prisma.order.count({
      where: {
        status: 'pending',
        customerEmail: {
          not: '' // Ensure customer email is not empty
        },
        total: {
          gt: 0
        },
        orderItems: {
          some: {} // Ensure order has at least one item
        }
      }
    });

    // Get failed notifications count
    const failedNotificationsCount = await prisma.emailNotification.count({
      where: {
        sent: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalNotifications: totalCount,
        recentNotifications: recentCount,
        lowStockAlerts: lowStockCount,
        pendingOrders: pendingOrdersCount,
        failedNotifications: failedNotificationsCount,
        totalUnread: recentCount + lowStockCount + pendingOrdersCount + failedNotificationsCount
      }
    });

  } catch (error) {
    console.error('Error fetching notification count:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

