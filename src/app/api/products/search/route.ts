import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/products/search - Advanced product search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const q = searchParams.get('q') || ''; // Search query
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const attributes = searchParams.get('attributes'); // JSON string of attribute filters

    if (!q.trim() && !categoryId && !attributes) {
      return NextResponse.json({
        success: false,
        error: 'Search query, category, or attributes required'
      }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    // Build search conditions
    const whereConditions: any = {
      status: 'published'
    };

    // Text search across multiple fields
    if (q.trim()) {
      const searchTerms = q.trim().split(' ').filter(term => term.length > 0);
      whereConditions.OR = [
        {
          name: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          shortDescription: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          sku: {
            contains: q,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            hasSome: searchTerms
          }
        },
        {
          category: {
            contains: q,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Category filter
    if (categoryId) {
      whereConditions.categories = {
        some: {
          categoryId: categoryId
        }
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price.gte = parseFloat(minPrice);
      if (maxPrice) whereConditions.price.lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock !== null) {
      whereConditions.stockStatus = inStock === 'true' ? 'instock' : { not: 'instock' };
    }

    // Featured filter
    if (featured !== null) {
      whereConditions.featured = featured === 'true';
    }

    // Attribute filters
    if (attributes) {
      try {
        const attributeFilters = JSON.parse(attributes);
        const attributeConditions: any[] = [];
        
        Object.entries(attributeFilters).forEach(([name, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            attributeConditions.push({
              attributes: {
                some: {
                  name: name,
                  value: { in: values }
                }
              }
            });
          }
        });

        if (attributeConditions.length > 0) {
          whereConditions.AND = attributeConditions;
        }
      } catch (error) {
        console.error('Error parsing attributes filter:', error);
      }
    }

    // Build order by clause
    let orderBy: any = {};
    if (sortBy === 'relevance' && q.trim()) {
      // For relevance, we'll sort by multiple factors
      orderBy = [
        { featured: 'desc' }, // Featured products first
        { createdAt: 'desc' } // Then by newest
      ];
    } else {
      const validSortFields = ['name', 'price', 'createdAt', 'stockQuantity'];
      if (validSortFields.includes(sortBy)) {
        orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }
    }

    // Execute search
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
            orderBy: { price: 'asc' },
            take: 3 // Limit variants in search results
          },
          attributes: true,
          reviews: {
            select: { rating: true }
          }
        }
      }),
      prisma.product.count({ where: whereConditions })
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Transform results
    const transformedProducts = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      const effectivePrice = product.salePrice || product.price;

      // Calculate search relevance score if we have a query
      let relevanceScore = 0;
      if (q.trim()) {
        const query = q.toLowerCase();
        if (product.name.toLowerCase().includes(query)) relevanceScore += 10;
        if (product.sku?.toLowerCase().includes(query)) relevanceScore += 8;
        if (product.description?.toLowerCase().includes(query)) relevanceScore += 5;
        if (product.shortDescription?.toLowerCase().includes(query)) relevanceScore += 5;
        if (product.featured) relevanceScore += 3;
        if (product.stockStatus === 'instock') relevanceScore += 2;
      }

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
        images: product.images,
        featuredImage: product.featuredImage,
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
        featured: product.featured,
        categories: product.categories.map(pc => pc.category),
        variants: product.variants,
        attributes: product.attributes.reduce((acc, attr) => {
          if (!acc[attr.name]) acc[attr.name] = [];
          acc[attr.name].push(attr.value);
          return acc;
        }, {} as Record<string, string[]>),
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        relevanceScore: relevanceScore,
        // Legacy compatibility
        category: product.category,
        tags: product.tags,
        inStock: product.stockStatus === 'instock'
      };
    });

    // Sort by relevance if applicable
    if (sortBy === 'relevance' && q.trim()) {
      transformedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

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
      searchParams: {
        query: q,
        categoryId,
        minPrice,
        maxPrice,
        inStock,
        featured,
        attributes: attributes ? JSON.parse(attributes) : null,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search products'
    }, { status: 500 });
  }
}