import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/products - List products with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 items
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {
      status: status
    };

    // Search in name, description, and short description
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Category filter (legacy string category for now)
    if (category) {
      whereConditions.category = { contains: category, mode: 'insensitive' };
    }

    // Featured filter
    if (featured !== null) {
      whereConditions.featured = featured === 'true';
    }

    // Stock filter
    if (inStock !== null) {
      whereConditions.stockStatus = inStock === 'true' ? 'instock' : { not: 'instock' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price.gte = parseFloat(minPrice);
      if (maxPrice) whereConditions.price.lte = parseFloat(maxPrice);
    }

    // Validate sort field
    const validSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'stockQuantity', 'featured'];
    const orderBy: any = {};
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Execute queries in parallel
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereConditions,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          categories: {
            include: {
              category: true
            }
          },
          variants: {
            orderBy: { price: 'asc' }
          },
          attributes: true,
          reviews: {
            select: {
              rating: true
            }
          }
        }
      }),
      prisma.product.count({ where: whereConditions })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Transform data to include calculated fields
    const transformedProducts = products.map(product => {
      // Calculate average rating
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      // Get effective price (sale price if available, otherwise regular price)
      const effectivePrice = product.salePrice || product.price;

      // Transform images from string array to object array
      const transformedImages = product.images.map((imageUrl, index) => ({
        id: index + 1,
        src: imageUrl,
        alt: `${product.name} ${index + 1}`
      }));

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        sku: product.sku,
        price: effectivePrice,
        regularPrice: product.regularPrice || product.price,
        salePrice: product.salePrice,
        images: transformedImages,
        featuredImage: product.featuredImage,
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
        weight: product.weight,
        dimensions: product.dimensions,
        status: product.status,
        featured: product.featured,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        categories: product.categories.map(pc => pc.category),
        variants: product.variants,
        attributes: product.attributes,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        reviewCount: product.reviews.length,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Legacy fields for compatibility
        category: product.category,
        tags: product.tags,
        inStock: product.stockStatus === 'instock'
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        category,
        status,
        featured,
        inStock,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products'
    }, { status: 500 });
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, price } = body;
    if (!name || !price) {
      return NextResponse.json({
        success: false,
        error: 'Name and price are required'
      }, { status: 400 });
    }

    // Generate slug if not provided
    let slug = body.slug;
    if (!slug) {
      slug = name.toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      // Ensure slug uniqueness
      const existingProduct = await prisma.product.findUnique({
        where: { slug }
      });
      if (existingProduct) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: body.description,
        shortDescription: body.shortDescription,
        sku: body.sku,
        price: parseFloat(price),
        regularPrice: body.regularPrice ? parseFloat(body.regularPrice) : parseFloat(price),
        salePrice: body.salePrice ? parseFloat(body.salePrice) : null,
        images: body.images || [],
        featuredImage: body.featuredImage,
        stockQuantity: body.stockQuantity || 0,
        stockStatus: body.stockStatus || 'instock',
        manageStock: body.manageStock !== false,
        lowStockThreshold: body.lowStockThreshold || 5,
        weight: body.weight ? parseFloat(body.weight) : null,
        dimensions: body.dimensions,
        status: body.status || 'published',
        featured: body.featured || false,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        // Legacy fields for backward compatibility
        category: body.category || 'uncategorized',
        tags: body.tags || [],
        inStock: (body.stockQuantity || 0) > 0
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        variants: true,
        attributes: true
      }
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json({
        success: false,
        error: `${field} must be unique`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create product'
    }, { status: 500 });
  }
}