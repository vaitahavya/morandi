import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/container/Container';
import { ProductFilters } from '@/interfaces/IProductRepository';

// GET /api/products - List products with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const productService = container.getProductService();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: ProductFilters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || 'published',
      featured: searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined,
      inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    };

    const result = await productService.getProducts(filters);

    return NextResponse.json({
      success: true,
      data: result.products,
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
    const productService = container.getProductService();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.price) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, slug, price'
      }, { status: 400 });
    }

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
