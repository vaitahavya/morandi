import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug/db-status
 * Diagnostic endpoint to check database connection and product status
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      urlConfigured: !!process.env.DATABASE_URL,
      urlPreview: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.split('@')[0]}@***` 
        : 'NOT SET',
      connected: false,
      error: null as string | null,
    },
    products: {
      total: 0,
      byStatus: {} as Record<string, number>,
      sampleIds: [] as string[],
      error: null as string | null,
    }
  };

  try {
    // Test database connection
    await prisma.$connect();
    diagnostics.database.connected = true;

    // Get product counts
    const totalProducts = await prisma.product.count();
    diagnostics.products.total = totalProducts;

    // Get products by status
    const statuses = ['published', 'draft', 'archived'];
    for (const status of statuses) {
      const count = await prisma.product.count({
        where: { status }
      });
      diagnostics.products.byStatus[status] = count;
    }

    // Also check null/undefined status
    const nullStatusCount = await prisma.product.count({
      where: { status: null }
    });
    diagnostics.products.byStatus['null'] = nullStatusCount;

    // Get sample product IDs
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        slug: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    diagnostics.products.sampleIds = sampleProducts;

    // Try to fetch products with the same query as the API
    const publishedProducts = await prisma.product.findMany({
      where: { status: 'published' },
      take: 5,
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });
    diagnostics.products.publishedSample = publishedProducts.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      slug: p.slug,
      categories: p.productCategories.map(pc => pc.category.name),
    }));

    return NextResponse.json({
      success: true,
      ...diagnostics,
    });

  } catch (error: any) {
    diagnostics.database.connected = false;
    diagnostics.database.error = error.message;
    diagnostics.products.error = error.message;

    return NextResponse.json({
      success: false,
      error: error.message,
      ...diagnostics,
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}



