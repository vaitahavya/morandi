import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/products/test
 * Diagnostic endpoint to test products API
 */
export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Get basic stats
    const totalProducts = await prisma.product.count();
    const publishedProducts = await prisma.product.count({
      where: { status: 'published' }
    });
    
    // Try to fetch one published product
    const sampleProduct = await prisma.product.findFirst({
      where: { status: 'published' },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Products API is working',
      data: {
        database: 'connected',
        totalProducts,
        publishedProducts,
        sampleProduct: sampleProduct || null,
        timestamp: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}










