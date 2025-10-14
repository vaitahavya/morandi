import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services';

// GET /api/products/featured - Get featured products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);

    const featuredProducts = await productService.getFeaturedProducts(limit);

    // Transform images from string arrays to objects for frontend compatibility
    const transformedData = featuredProducts.map(product => ({
      ...product,
      images: Array.isArray(product.images) 
        ? product.images.map((img: any, index: number) => ({
            id: index + 1,
            src: typeof img === 'string' ? img : img.src || img,
            alt: product.name
          }))
        : [],
      categories: product.productCategories?.map((pc: any) => pc.category) || [],
      category: product.productCategories?.[0]?.category?.name || 'Uncategorized'
    }));

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch featured products'
    }, { status: 500 });
  }
}
