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
        product_categories: {
          include: {
            categories: true
          }
        },
        variants: {
          orderBy: { price: 'asc' }
        },
        attributes: true,
        reviews: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: { created_at: 'desc' }
        },
        product_recommendations_product_recommendations_product_idToproducts: {
          include: {
            products_product_recommendations_recommended_product_idToproducts: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                sale_price: true,
                images: true,
                featured_image: true,
                stock_status: true
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
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
      : 0;

    // Get effective price
    const effectivePrice = product.sale_price || product.price;

    // Transform data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description,
      sku: product.sku,
      price: effectivePrice,
      regular_price: product.regular_price || product.price,
      sale_price: product.sale_price,
      images: product.images,
      featured_image: product.featured_image,
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      manage_stock: product.manage_stock,
      low_stock_threshold: product.low_stock_threshold,
      weight: product.weight,
      dimensions: product.dimensions,
      status: product.status,
      featured: product.featured,
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      woocommerce_id: product.woocommerce_id,
      categories: product.product_categories.map((pc: any) => pc.categories),
      variants: product.variants,
      attributes: product.attributes.reduce((acc: Record<string, string[]>, attr: any) => {
        if (!acc[attr.name]) acc[attr.name] = [];
        acc[attr.name].push(attr.value);
        return acc;
      }, {} as Record<string, string[]>),
      reviews: product.reviews,
      recommendations: product.product_recommendations_product_recommendations_product_idToproducts.map((rec: any) => rec.products_product_recommendations_recommended_product_idToproducts),
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
      created_at: product.created_at,
      updated_at: product.updated_at,
      // Legacy fields for compatibility
      tags: product.tags,
      inStock: product.stock_status === 'instock'
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
      'name', 'slug', 'description', 'short_description', 'sku',
      'price', 'regular_price', 'sale_price', 'images', 'featured_image',
      'stock_quantity', 'stock_status', 'manage_stock', 'low_stock_threshold',
      'weight', 'dimensions', 'status', 'featured', 'meta_title', 'meta_description',
      'category', 'tags'
    ];

    updateableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (['price', 'regular_price', 'sale_price', 'weight'].includes(field) && body[field] !== null) {
          updateData[field] = parseFloat(body[field]);
        } else if (['stock_quantity', 'low_stock_threshold'].includes(field)) {
          updateData[field] = parseInt(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Update inStock based on stock_quantity and stock_status
    if (updateData.stock_quantity !== undefined || updateData.stock_status !== undefined) {
      const newStockQuantity = updateData.stock_quantity ?? existingProduct.stock_quantity;
      const newStockStatus = updateData.stock_status ?? existingProduct.stock_status;
      updateData.inStock = newStockQuantity > 0 && newStockStatus === 'instock';
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        product_categories: {
          include: {
            categories: true
          }
        },
        variants: true,
        attributes: true
      }
    });

    // Create inventory transaction if stock quantity changed
    if (updateData.stock_quantity !== undefined && updateData.stock_quantity !== existingProduct.stock_quantity) {
      const quantityChange = updateData.stock_quantity - (existingProduct.stock_quantity || 0);
      
      await prisma.inventoryTransaction.create({
        data: {
          product_id: id,
          type: quantityChange > 0 ? 'restock' : 'adjustment',
          quantity: quantityChange,
          reason: 'Manual update via API',
          stock_after: updateData.stock_quantity,
          notes: `Stock updated from ${existingProduct.stock_quantity || 0} to ${updateData.stock_quantity}`
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
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const field = (error as any).meta?.target?.[0];
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
        order_items: true,
        wishlist_items: true,
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
    if (existingProduct.order_items.length > 0) {
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