import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/categories - List categories with hierarchy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const includeProductCount = searchParams.get('includeProductCount') === 'true';
    const onlyVisible = searchParams.get('onlyVisible') !== 'false'; // Default to true
    const parentId = searchParams.get('parentId');
    const flat = searchParams.get('flat') === 'true'; // Return flat list instead of hierarchy

    // Build where conditions
    const whereConditions: any = {};
    
    if (onlyVisible) {
      whereConditions.is_visible = true;
    }

    if (parentId !== null) {
      whereConditions.parent_id = parentId === 'null' || parentId === '' ? null : parentId;
    }

    // Fetch categories
    const categories = await prisma.category.findMany({
      where: whereConditions,
      include: {
        children: onlyVisible ? {
          where: { is_visible: true },
          orderBy: { display_order: 'asc' }
        } : {
          orderBy: { display_order: 'asc' }
        },
        parent: true
      },
      orderBy: [
        { display_order: 'asc' },
        { name: 'asc' }
      ]
    });

    // Get product counts if requested
    let productCounts: Record<string, number> = {};
    if (includeProductCount) {
      const categoryIds = categories.map(cat => cat.id);
      const productCountResults = await prisma.product.count({
        where: {
          product_categories: {
            some: {
              category_id: {
                in: categoryIds
              }
            }
          },
          status: 'published'
        }
      });
      
      // For now, we'll get the count per category in a separate query
      for (const category of categories) {
        const count = await prisma.product.count({
          where: {
            product_categories: {
              some: {
                category_id: category.id
              }
            },
            status: 'published'
          }
        });
        productCounts[category.id] = count;
      }
    }

    // Transform data
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parent_id,
      parent: category.parent,
      metaTitle: category.meta_title,
      metaDescription: category.meta_description,
      displayOrder: category.display_order,
      isVisible: category.is_visible,
      children: flat ? undefined : category.children.map(child => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        image: child.image,
        displayOrder: child.display_order,
        isVisible: child.is_visible
      })),
      productCount: includeProductCount 
        ? productCounts[category.id] || 0
        : undefined,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    }));

    // Build hierarchy if not flat
    let result = transformedCategories;
    if (!flat && parentId === null) {
      // Return only root categories with their children
      result = transformedCategories.filter(cat => cat.parentId === null);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories'
    }, { status: 500 });
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name } = body;
    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Name is required'
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
      const existingCategory = await prisma.category.findUnique({
        where: { slug }
      });
      if (existingCategory) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Validate parent category if provided
    if (body.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: body.parentId }
      });
      if (!parentCategory) {
        return NextResponse.json({
          success: false,
          error: 'Parent category not found'
        }, { status: 400 });
      }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: body.description,
        image: body.image,
        parent_id: body.parentId || null,
        meta_title: body.metaTitle,
        meta_description: body.metaDescription,
        display_order: body.displayOrder || 0,
        is_visible: body.isVisible !== false
      },
      include: {
        parent: true,
        children: true
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    
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
      error: 'Failed to create category'
    }, { status: 500 });
  }
}