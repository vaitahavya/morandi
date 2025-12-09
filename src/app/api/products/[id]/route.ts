import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cleanupSupabaseImages, getRemovedImageUrls, parseImageUrls } from '@/lib/image-cleanup';

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
        productCategories: {
          include: {
            category: true
          }
        },
        variants: {
          orderBy: { price: 'asc' },
          include: {
            variantAttributes: {
              include: {
                attribute: true
              }
            }
          }
        },
        attributes: true
      }
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Get effective price
    const effectivePrice = product.salePrice || product.price;
    
    // Parse images from JSON string to array
    const parseImages = (imagesStr: string) => {
      try {
        // Handle empty or invalid input
        if (!imagesStr || imagesStr.trim() === '' || imagesStr === '[' || imagesStr === '[]') {
          return [];
        }
        
        // If already an array, use it directly
        if (Array.isArray(imagesStr)) {
          return imagesStr.map((img: any, index: number) => {
            const src = typeof img === 'string' ? img : (img?.src || img);
            // Validate src is a valid URL or path
            if (!src || typeof src !== 'string' || src.trim() === '') {
              return null;
            }
            return {
              id: index + 1,
              src: src,
              alt: img?.alt || product.name
            };
          }).filter(Boolean); // Remove null entries
        }
        
        // Try to parse as JSON
        const parsed = JSON.parse(imagesStr);
        if (Array.isArray(parsed)) {
          return parsed.map((img: any, index: number) => {
            const src = typeof img === 'string' ? img : (img?.src || img);
            // Validate src is a valid URL or path
            if (!src || typeof src !== 'string' || src.trim() === '') {
              return null;
            }
            return {
              id: index + 1,
              src: src,
              alt: img?.alt || product.name
            };
          }).filter(Boolean); // Remove null entries
        }
        return [];
      } catch (error) {
        console.error('Error parsing images:', error, 'Input:', imagesStr);
        return [];
      }
    };
    
    // Parse tags from JSON string to array
    const parseTags = (tagsStr: string) => {
      try {
        const parsed = JSON.parse(tagsStr);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

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
      images: parseImages(product.images),
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
      categories: product.productCategories.map((pc: any) => pc.category),
      variants: product.variants.map((variant: any) => {
        // Reconstruct attributes object from variantAttributes junction table
        const attributes: Record<string, string> = {};
        if (variant.variantAttributes && Array.isArray(variant.variantAttributes)) {
          variant.variantAttributes.forEach((va: any) => {
            if (va.attribute && va.value) {
              attributes[va.attribute.name] = va.value;
            }
          });
        }
        
        // Parse variant images
        let variantImages: any[] = [];
        try {
          if (variant.images) {
            const parsed = typeof variant.images === 'string' ? JSON.parse(variant.images) : variant.images;
            variantImages = Array.isArray(parsed) ? parsed : [];
          }
        } catch {
          variantImages = [];
        }
        
        return {
          ...variant,
          attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
          images: variantImages
        };
      }),
      attributes: product.attributes.map((attr: any) => {
        // Parse values from JSON string
        let values: string[] = [];
        try {
          if (attr.values) {
            values = typeof attr.values === 'string' ? JSON.parse(attr.values) : attr.values;
          }
        } catch {
          values = [];
        }
        return {
          id: attr.id,
          name: attr.name,
          values: Array.isArray(values) ? values : []
        };
      }),
      avgRating: 0,
      reviewCount: 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Legacy fields for compatibility
      tags: parseTags(product.tags),
      inStock: product.stockStatus === 'instock',
      category: product.productCategories[0]?.category.name || 'Uncategorized'
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
      'tags'
    ];

    updateableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (['price', 'regularPrice', 'salePrice', 'weight'].includes(field) && body[field] !== null) {
          updateData[field] = parseFloat(body[field]);
        } else if (['stockQuantity', 'lowStockThreshold'].includes(field)) {
          updateData[field] = parseInt(body[field]);
        } else if (field === 'images') {
          // Convert images array to JSON string
          if (Array.isArray(body[field])) {
            // Extract just the src URLs from image objects
            const imageSrcs = body[field].map((img: any) => {
              if (typeof img === 'string') return img;
              if (typeof img === 'object' && img.src) return img.src;
              return '';
            }).filter((src: string) => src && !src.startsWith('blob:')); // Filter out blob URLs
            
            updateData[field] = JSON.stringify(imageSrcs);
          } else if (typeof body[field] === 'string') {
            updateData[field] = body[field];
          } else {
            // If it's not an array or string, skip it
            console.warn('Invalid images format received:', body[field]);
          }
        } else if (field === 'tags') {
          // Convert tags array to JSON string
          if (Array.isArray(body[field])) {
            updateData[field] = JSON.stringify(body[field]);
          } else {
            updateData[field] = body[field];
          }
        } else if (field === 'dimensions') {
          // Convert dimensions object to JSON string
          if (body[field] && typeof body[field] === 'object') {
            updateData[field] = JSON.stringify(body[field]);
          } else {
            updateData[field] = body[field];
          }
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

    // Handle image cleanup and validation
    if (updateData.images !== undefined) {
      // Parse existing images for comparison
      const existingImages = parseImageUrls(existingProduct.images);
      
      // Parse new images
      let newImages: string[] = [];
      if (typeof updateData.images === 'string') {
        newImages = parseImageUrls(updateData.images);
      } else if (Array.isArray(updateData.images)) {
        newImages = updateData.images.map((img: any) => 
          typeof img === 'string' ? img : (img?.src || '')
        ).filter((src: string) => src && !src.startsWith('blob:'));
      }
      
      // Find removed images and clean them up from Supabase
      const removedImages = getRemovedImageUrls(existingImages, newImages);
      if (removedImages.length > 0) {
        try {
          const cleanupResult = await cleanupSupabaseImages(removedImages, 'products');
          if (!cleanupResult.success) {
            console.warn('Some images could not be cleaned up:', cleanupResult.errors);
          }
        } catch (error) {
          console.error('Error cleaning up images:', error);
        }
      }
      
      // Convert to string for database storage
      updateData.images = JSON.stringify(newImages);
    }

    // Handle category updates (many-to-many relationship)
    if (body.selectedCategories !== undefined) {
      // Delete existing category associations
      await prisma.productCategory.deleteMany({
        where: { productId: id }
      });

      // Create new category associations
      if (Array.isArray(body.selectedCategories) && body.selectedCategories.length > 0) {
        await prisma.productCategory.createMany({
          data: body.selectedCategories.map((categoryId: string) => ({
            productId: id,
            categoryId
          }))
        });
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        productCategories: {
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
      const quantityChange = updateData.stockQuantity - (existingProduct.stockQuantity || 0);
      
      await prisma.inventoryTransaction.create({
        data: {
          productId: id,
          type: quantityChange > 0 ? 'restock' : 'adjustment',
          quantity: quantityChange,
          reason: 'Manual update via API',
          stockAfter: updateData.stockQuantity,
          notes: `Stock updated from ${existingProduct.stockQuantity || 0} to ${updateData.stockQuantity}`
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
        orderItems: true
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

    // Clean up images from Supabase Storage before soft delete
    const existingImages = parseImageUrls(existingProduct.images);
    if (existingImages.length > 0) {
      try {
        const cleanupResult = await cleanupSupabaseImages(existingImages, 'products');
        if (!cleanupResult.success) {
          console.warn('Some images could not be cleaned up during product deletion:', cleanupResult.errors);
        }
      } catch (error) {
        console.error('Error cleaning up images during product deletion:', error);
      }
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