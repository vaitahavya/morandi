import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/inventory/alerts - Get inventory alerts (low stock, out of stock)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity'); // 'critical', 'warning', 'all'

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        status: 'published',
        OR: [
          { stockStatus: 'lowstock' },
          { stockStatus: 'outofstock' },
          {
            AND: [
              { stockQuantity: { lte: prisma.raw('COALESCE(low_stock_threshold, 5)') } },
              { manageStock: true }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        stockQuantity: true,
        stockStatus: true,
        lowStockThreshold: true,
        featuredImage: true,
        price: true
      },
      orderBy: [
        { stockQuantity: 'asc' },
        { name: 'asc' }
      ]
    });

    // Categorize alerts by severity
    const alerts = lowStockProducts.map(product => {
      const threshold = product.lowStockThreshold || 5;
      let severity: 'critical' | 'warning' = 'warning';
      let message = '';

      if (product.stockQuantity <= 0) {
        severity = 'critical';
        message = 'Out of stock';
      } else if (product.stockQuantity <= threshold) {
        severity = 'warning';
        message = `Low stock: ${product.stockQuantity} remaining`;
      }

      return {
        id: product.id,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productSlug: product.slug,
        currentStock: product.stockQuantity,
        threshold: threshold,
        severity,
        message,
        productImage: product.featuredImage,
        price: product.price,
        createdAt: new Date().toISOString() // When alert was generated
      };
    });

    // Filter by severity if requested
    const filteredAlerts = severity && severity !== 'all' 
      ? alerts.filter(alert => alert.severity === severity)
      : alerts;

    // Get alert counts
    const alertCounts = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      total: alerts.length
    };

    // Get recent stock movements for context
    const recentTransactions = await prisma.inventoryTransaction.findMany({
      where: {
        productId: { in: lowStockProducts.map(p => p.id) },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        alerts: filteredAlerts,
        counts: alertCounts,
        recentActivity: recentTransactions
      }
    });

  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch inventory alerts'
    }, { status: 500 });
  }
}

// POST /api/inventory/alerts - Mark alerts as acknowledged or update thresholds
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productIds, newThreshold } = body;

    if (action === 'updateThreshold' && newThreshold !== undefined) {
      // Update low stock threshold for specified products
      const updatedProducts = await prisma.product.updateMany({
        where: {
          id: { in: productIds }
        },
        data: {
          lowStockThreshold: newThreshold
        }
      });

      return NextResponse.json({
        success: true,
        message: `Updated threshold for ${updatedProducts.count} products`,
        data: { updatedCount: updatedProducts.count }
      });
    }

    if (action === 'restock' && productIds?.length > 0) {
      // Quick restock action - set stock to threshold + 10
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, lowStockThreshold: true, stockQuantity: true }
      });

      const results = [];
      for (const product of products) {
        const newStock = (product.lowStockThreshold || 5) + 10;
        const adjustment = newStock - product.stockQuantity;

        const result = await prisma.$transaction(async (tx) => {
          // Update stock
          const updatedProduct = await tx.product.update({
            where: { id: product.id },
            data: {
              stockQuantity: newStock,
              stockStatus: 'instock'
            }
          });

          // Create transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: product.id,
              type: 'restock',
              quantity: adjustment,
              reason: 'Quick restock via alerts',
              stockAfter: newStock,
              notes: 'Automated restock from inventory alerts'
            }
          });

          return updatedProduct;
        });

        results.push(result);
      }

      return NextResponse.json({
        success: true,
        message: `Restocked ${results.length} products`,
        data: results
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action or missing parameters'
    }, { status: 400 });

  } catch (error) {
    console.error('Error processing inventory alert action:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process alert action'
    }, { status: 500 });
  }
}