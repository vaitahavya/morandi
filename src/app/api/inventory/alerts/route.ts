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
              { stockQuantity: { lte: 5 } }, // Default threshold for products without custom threshold
              { manageStock: true },
              { lowStockThreshold: null }
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

    // Also get products with custom low stock thresholds
    const customThresholdProducts = await prisma.product.findMany({
      where: {
        status: 'published',
        manageStock: true,
        lowStockThreshold: { not: null },
        stockQuantity: { lte: 50 } // Reasonable upper bound for filtering
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

    // Filter custom threshold products that are actually low stock
    const filteredCustomProducts = customThresholdProducts.filter(product => 
      (product.stockQuantity || 0) <= (product.lowStockThreshold || 5)
    );

    // Combine and deduplicate products
    const allLowStockProducts = [...lowStockProducts, ...filteredCustomProducts];
    const uniqueProducts = allLowStockProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );

    // Categorize alerts by severity
    const alerts = uniqueProducts.map(product => {
      const threshold = product.lowStockThreshold || 5;
      let severity: 'critical' | 'warning' = 'warning';
      let message = '';

      if ((product.stockQuantity || 0) <= 0) {
        severity = 'critical';
        message = 'Out of stock';
      } else if ((product.stockQuantity || 0) <= threshold) {
        severity = 'warning';
        message = `Low stock: ${product.stockQuantity || 0} remaining`;
      }

      return {
        id: product.id,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productSlug: product.slug,
        currentStock: product.stockQuantity || 0,
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
        productId: { in: uniqueProducts.map(p => p.id) },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
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
        const adjustment = newStock - (product.stockQuantity || 0);

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