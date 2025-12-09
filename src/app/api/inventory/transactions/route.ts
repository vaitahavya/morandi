import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/inventory/transactions - Get inventory transaction history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const product_id = searchParams.get('product_id');
    const type = searchParams.get('type'); // sale, restock, adjustment, return
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    if (product_id) {
      whereConditions.product_id = product_id;
    }

    if (type) {
      whereConditions.type = type;
    }

    if (fromDate || toDate) {
      whereConditions.createdAt = {};
      if (fromDate) whereConditions.createdAt.gte = new Date(fromDate);
      if (toDate) whereConditions.createdAt.lte = new Date(toDate);
    }

    // Get transactions with product information
    const [transactions, totalCount] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.inventoryTransaction.count({ where: whereConditions })
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get transaction summary by type
    const summary = await prisma.inventoryTransaction.groupBy({
      by: ['type'],
      _sum: {
        quantity: true
      },
      _count: {
        type: true
      },
      where: whereConditions
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        summary: summary.map(s => ({
          type: s.type,
          totalQuantity: s._sum.quantity || 0,
          transactionCount: s._count.type
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch inventory transactions'
    }, { status: 500 });
  }
}