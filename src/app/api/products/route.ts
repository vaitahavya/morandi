import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services';
import { ProductFilters, FindManyOptions } from '@/repositories';

// GET /api/products - List products with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: ProductFilters = {
      name: searchParams.get('name') || undefined,
      slug: searchParams.get('slug') || undefined,
      status: searchParams.get('status') || 'published',
      featured: searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined,
      categoryId: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined,
    };

    const options: FindManyOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await productService.getProducts(filters, options);

    // Transform images from string arrays to objects for frontend compatibility
    const transformedData = result.data.map(product => ({
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
      data: transformedData,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    }, { status: 500 });
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create product using service layer (includes all validation)
    const product = await productService.createProduct(body);

    return NextResponse.json({
      success: true,
      data: product
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product'
    }, { status: 500 });
  }
}
