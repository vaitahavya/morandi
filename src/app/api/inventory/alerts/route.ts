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
          { stock_status: 'lowstock' },
          { stock_status: 'outofstock' },
          {
            AND: [
              { stock_quantity: { lte: 5 } }, // Default threshold for products without custom threshold
              { manage_stock: true },
              { low_stock_threshold: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        stock_quantity: true,
        stock_status: true,
        low_stock_threshold: true,
        featured_image: true,
        price: true
      },
      orderBy: [
        { stock_quantity: 'asc' },
        { name: 'asc' }
      ]
    });

    // Also get products with custom low stock thresholds
    const customThresholdProducts = await prisma.product.findMany({
      where: {
        status: 'published',
        manage_stock: true,
        low_stock_threshold: { not: null },
        stock_quantity: { lte: 50 } // Reasonable upper bound for filtering
      },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        stock_quantity: true,
        stock_status: true,
        low_stock_threshold: true,
        featured_image: true,
        price: true
      },
      orderBy: [
        { stock_quantity: 'asc' },
        { name: 'asc' }
      ]
    });

    // Filter custom threshold products that are actually low stock
    const filteredCustomProducts = customThresholdProducts.filter(product => 
      (product.stock_quantity || 0) <= (product.low_stock_threshold || 5)
    );

    // Combine and deduplicate products
    const allLowStockProducts = [...lowStockProducts, ...filteredCustomProducts];
    const uniqueProducts = allLowStockProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );

    // Categorize alerts by severity
    const alerts = uniqueProducts.map(product => {
      const threshold = product.low_stock_threshold || 5;
      let severity: 'critical' | 'warning' = 'warning';
      let message = '';

      if ((product.stock_quantity || 0) <= 0) {
        severity = 'critical';
        message = 'Out of stock';
      } else if ((product.stock_quantity || 0) <= threshold) {
        severity = 'warning';
        message = `Low stock: ${product.stock_quantity || 0} remaining`;
      }

      return {
        id: product.id,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productSlug: product.slug,
        currentStock: product.stock_quantity || 0,
        threshold: threshold,
        severity,
        message,
        productImage: product.featured_image,
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
        product_id: { in: uniqueProducts.map(p => p.id) },
        created_at: {
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
      orderBy: { created_at: 'desc' },
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
          low_stock_threshold: newThreshold
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
        select: { id: true, name: true, low_stock_threshold: true, stock_quantity: true }
      });

      const results = [];
      for (const product of products) {
        const newStock = (product.low_stock_threshold || 5) + 10;
        const adjustment = newStock - (product.stock_quantity || 0);

        const result = await prisma.$transaction(async (tx) => {
          // Update stock
          const updatedProduct = await tx.product.update({
            where: { id: product.id },
            data: {
              stock_quantity: newStock,
              stock_status: 'instock'
            }
          });

          // Create transaction
          await tx.inventoryTransaction.create({
            data: {
              product_id: product.id,
              type: 'restock',
              quantity: adjustment,
              reason: 'Quick restock via alerts',
              stock_after: newStock,
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