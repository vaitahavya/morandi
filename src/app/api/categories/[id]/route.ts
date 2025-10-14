import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/categories/[id] - Get individual category by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    
    // Try to find by ID first, then by slug if ID is not a valid UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const category = await prisma.category.findFirst({
      where: isUUID ? { id } : { slug: id },
      include: {
        parent: true,
        children: {
          where: { isVisible: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Get products for this category if requested
    let products = undefined;
    let productCount = 0;
    
    if (includeProducts) {
      const categoryProducts = await prisma.product.findMany({
        where: {
          productCategories: {
            some: {
              categoryId: category.id
            }
          },
          status: 'published'
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          images: true,
          featuredImage: true,
          stockStatus: true,
          featured: true,
          shortDescription: true
        }
      });
      
      products = categoryProducts;
      productCount = categoryProducts.length;
    }

    // Transform data
    const transformedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      parent: category.parent,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      displayOrder: category.displayOrder,
      isVisible: category.isVisible,
      children: category.children,
      products: products,
      productCount: productCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: transformedCategory
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch category'
    }, { status: 500 });
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Validate parent category if being updated
    if (body.parentId && body.parentId !== existingCategory.parentId) {
      // Check if parent exists
      const parentCategory = await prisma.category.findUnique({
        where: { id: body.parentId }
      });
      if (!parentCategory) {
        return NextResponse.json({
          success: false,
          error: 'Parent category not found'
        }, { status: 400 });
      }

      // Prevent circular references
      if (body.parentId === id) {
        return NextResponse.json({
          success: false,
          error: 'Category cannot be its own parent'
        }, { status: 400 });
      }

      // Check if the new parent is not a child of this category
      const isChildOfCategory = await checkIfChildCategory(body.parentId, id);
      if (isChildOfCategory) {
        return NextResponse.json({
          success: false,
          error: 'Cannot set a child category as parent (circular reference)'
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    const updateableFields = [
      'name', 'slug', 'description', 'image', 'parentId',
      'metaTitle', 'metaDescription', 'displayOrder', 'isVisible'
    ];

    updateableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'displayOrder') {
          updateData[field] = parseInt(body[field]);
        } else if (field === 'parentId' && body[field] === '') {
          updateData[field] = null;
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Error updating category:', error);
    
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
      error: 'Failed to update category'
    }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const moveProducts = searchParams.get('moveProducts'); // Category ID to move products to

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        productCategories: {
          include: {
            product: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Check for child categories
    if (existingCategory.children.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete category with child categories. Please delete or move child categories first.'
      }, { status: 400 });
    }

    // Handle products in this category
    if (existingCategory.productCategories.length > 0) {
      if (moveProducts) {
        // Verify destination category exists
        const destinationCategory = await prisma.category.findUnique({
          where: { id: moveProducts }
        });
        if (!destinationCategory) {
          return NextResponse.json({
            success: false,
            error: 'Destination category not found'
          }, { status: 400 });
        }

        // Move products to new category
        await prisma.productCategory.updateMany({
          where: { categoryId: id },
          data: { categoryId: moveProducts }
        });
      } else {
        // Remove category associations from products
        await prisma.productCategory.deleteMany({
          where: { categoryId: id }
        });
      }
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: `Category deleted successfully${moveProducts ? ' and products moved to new category' : ''}`,
      data: { id }
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete category'
    }, { status: 500 });
  }
}

// Helper function to check if a category is a child of another category
async function checkIfChildCategory(potentialChildId: string, parentId: string): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { id: potentialChildId },
    select: { parentId: true }
  });

  if (!category || !category.parentId) {
    return false;
  }

  if (category.parentId === parentId) {
    return true;
  }

  // Recursively check up the hierarchy
  return checkIfChildCategory(category.parentId, parentId);
}