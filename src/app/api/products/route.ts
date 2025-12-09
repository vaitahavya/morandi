import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services';
import { ProductFilters, FindManyOptions } from '@/repositories';
import { prisma } from '@/lib/db';

// GET /api/products - List products with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Handle category parameter - could be ID or slug
    let categoryId: string | undefined = undefined;
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // Check if it's a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryParam);
      if (isUUID) {
        categoryId = categoryParam;
      } else {
        // It's a slug, find the category by slug
        const category = await prisma.category.findUnique({
          where: { slug: categoryParam },
          select: { id: true }
        });
        if (category) {
          categoryId = category.id;
        }
      }
    }
    
    // Parse query parameters
    // Default to 'published' for public-facing requests, but allow 'all' or empty string for admin
    const statusParam = searchParams.get('status');
    let status: string | undefined;
    if (statusParam === 'all' || statusParam === '') {
      status = undefined; // Show all products
    } else if (statusParam) {
      status = statusParam; // Use the specified status
    } else {
      status = 'published'; // Default to published for public API
    }
    
    const filters: ProductFilters = {
      name: searchParams.get('name') || undefined,
      slug: searchParams.get('slug') || undefined,
      status: status,
      featured: searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined,
      categoryId: categoryId,
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.stack : String(error))
        : undefined
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
