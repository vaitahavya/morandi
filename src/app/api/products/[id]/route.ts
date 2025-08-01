import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/products/[id] - Get individual product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Try to find by ID first, then by slug if ID is not a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const product = await prisma.product.findFirst({
      where: isUUID ? { id } : { slug: id },
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        recommendations: {
          include: {
            recommendedProduct: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                salePrice: true,
                images: true,
                featuredImage: true,
                stockStatus: true
              }
            }
          },
          orderBy: { score: 'desc' },
          take: 6
        }
      }
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    // Get effective price
    const effectivePrice = product.salePrice || product.price;

    // Transform data
    const transformedProduct = {
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
      manageStock: product.manageStock,
      lowStockThreshold: product.lowStockThreshold,
      weight: product.weight,
      dimensions: product.dimensions,
      status: product.status,
      featured: product.featured,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      woocommerceId: product.woocommerceId,
      categories: product.categories.map(pc => pc.category),
      variants: product.variants,
      attributes: product.attributes.reduce((acc, attr) => {
        if (!acc[attr.name]) acc[attr.name] = [];
        acc[attr.name].push(attr.value);
        return acc;
      }, {} as Record<string, string[]>),
      reviews: product.reviews,
      recommendations: product.recommendations.map(rec => rec.recommendedProduct),
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Legacy fields for compatibility
      category: product.category,
      tags: product.tags,
      inStock: product.stockStatus === 'instock'
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch product'
    }, { status: 500 });
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // Only update provided fields
    const updateableFields = [
      'name', 'slug', 'description', 'shortDescription', 'sku',
      'price', 'regularPrice', 'salePrice', 'images', 'featuredImage',
      'stockQuantity', 'stockStatus', 'manageStock', 'lowStockThreshold',
      'weight', 'dimensions', 'status', 'featured', 'metaTitle', 'metaDescription',
      'category', 'tags'
    ];

    updateableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (['price', 'regularPrice', 'salePrice', 'weight'].includes(field) && body[field] !== null) {
          updateData[field] = parseFloat(body[field]);
        } else if (['stockQuantity', 'lowStockThreshold'].includes(field)) {
          updateData[field] = parseInt(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Update inStock based on stockQuantity and stockStatus
    if (updateData.stockQuantity !== undefined || updateData.stockStatus !== undefined) {
      const newStockQuantity = updateData.stockQuantity ?? existingProduct.stockQuantity;
      const newStockStatus = updateData.stockStatus ?? existingProduct.stockStatus;
      updateData.inStock = newStockQuantity > 0 && newStockStatus === 'instock';
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
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

    // Create inventory transaction if stock quantity changed
    if (updateData.stockQuantity !== undefined && updateData.stockQuantity !== existingProduct.stockQuantity) {
      const quantityChange = updateData.stockQuantity - existingProduct.stockQuantity;
      
      await prisma.inventoryTransaction.create({
        data: {
          productId: id,
          type: quantityChange > 0 ? 'restock' : 'adjustment',
          quantity: quantityChange,
          reason: 'Manual update via API',
          stockAfter: updateData.stockQuantity,
          notes: `Stock updated from ${existingProduct.stockQuantity} to ${updateData.stockQuantity}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
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
      error: 'Failed to update product'
    }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        wishlist: true,
        reviews: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Check if product has associated orders
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete product that has been ordered. Consider marking it as inactive instead.'
      }, { status: 400 });
    }

    // Soft delete by updating status instead of hard delete to preserve data integrity
    const deletedProduct = await prisma.product.update({
      where: { id },
      data: {
        status: 'deleted',
        slug: `${existingProduct.slug}-deleted-${Date.now()}` // Prevent slug conflicts
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      data: { id: deletedProduct.id }
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete product'
    }, { status: 500 });
  }
}