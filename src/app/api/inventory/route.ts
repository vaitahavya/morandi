import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/inventory - Get inventory status and alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
    const outOfStockOnly = searchParams.get('outOfStockOnly') === 'true';
    const product_id = searchParams.get('product_id');

    // Build where conditions
    const whereConditions: any = {
      status: 'published'
    };

    if (product_id) {
      whereConditions.id = product_id;
    }

    if (lowStockOnly) {
      whereConditions.OR = [
        { stock_status: 'lowstock' },
        { stock_status: 'outofstock' }
      ];
    }

    if (outOfStockOnly) {
      whereConditions.stock_quantity = { lte: 0 };
    }

    // Get products with inventory information
    const products = await prisma.product.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        stock_quantity: true,
        stock_status: true,
        low_stock_threshold: true,
        price: true,
        featured_image: true,
        images: true
      },
      orderBy: [
        { stock_quantity: 'asc' },
        { name: 'asc' }
      ]
    });

    // Get inventory statistics
    const stats = await prisma.product.groupBy({
      by: ['stock_status'],
      _count: {
        stock_status: true
      },
      where: {
        status: 'published'
      }
    });

    const inventoryStats = {
      inStock: stats.find(s => s.stock_status === 'instock')?._count.stock_status || 0,
      lowStock: stats.find(s => s.stock_status === 'lowstock')?._count.stock_status || 0,
      outOfStock: stats.find(s => s.stock_status === 'outofstock')?._count.stock_status || 0,
      total: stats.reduce((sum, s) => sum + s._count.stock_status, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        products,
        stats: inventoryStats
      }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch inventory'
    }, { status: 500 });
  }
}

// POST /api/inventory - Update inventory (stock adjustment)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, adjustment, reason, notes } = body;

    if (!product_id || adjustment === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Product ID and adjustment amount are required'
      }, { status: 400 });
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: product_id },
      select: { stock_quantity: true, name: true, low_stock_threshold: true }
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    const newStock = Math.max(0, product.stock_quantity + adjustment);
    const lowThreshold = product.low_stock_threshold || 5;

    // Determine new stock status
    let newStockStatus = 'instock';
    if (newStock <= 0) {
      newStockStatus = 'outofstock';
    } else if (newStock <= lowThreshold) {
      newStockStatus = 'lowstock';
    }

    // Update product and create transaction in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: product_id },
        data: {
          stock_quantity: newStock,
          stock_status: newStockStatus
        }
      });

      // Create inventory transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          product_id,
          type: adjustment > 0 ? 'restock' : 'adjustment',
          quantity: adjustment,
          reason: reason || 'Manual stock adjustment',
          stock_after: newStock,
          notes
        }
      });

      return { product: updatedProduct, transaction };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Stock updated for ${product.name}. New stock: ${newStock}`
    });

  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update inventory'
    }, { status: 500 });
  }
}