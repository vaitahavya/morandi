import { PrismaClient, Category } from '@prisma/client';
import { BaseRepository, FindManyOptions, PaginatedResult } from './base/BaseRepository';

/**
 * Category creation input type
 */
export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  isVisible: boolean;
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Category update input type
 */
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  image?: string;
  isVisible?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Category filter input type
 */
export interface CategoryFilters {
  name?: string;
  slug?: string;
  parentId?: string;
  isVisible?: boolean;
  hasProducts?: boolean;
}

/**
 * Category with children type (recursive)
 */
export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  _count?: {
    children: number;
    product_categories: number;
  };
}

/**
 * Category repository interface
 */
export interface ICategoryRepository {
  create(data: CreateCategoryInput): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findMany(filters?: CategoryFilters, options?: FindManyOptions): Promise<PaginatedResult<Category>>;
  update(id: string, data: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
  getCategoryTree(): Promise<CategoryWithChildren[]>;
  getCategoriesByParent(parentId?: string): Promise<Category[]>;
  getCategoryWithProducts(id: string): Promise<Category | null>;
}

/**
 * Category repository implementation
 */
export class CategoryRepository extends BaseRepository<Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters> 
  implements ICategoryRepository {

  async create(data: CreateCategoryInput): Promise<Category> {
    return await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parent_id: data.parentId,
        image: data.image,
        is_visible: data.isVisible,
        display_order: data.displayOrder,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
      },
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            children: true,
            product_categories: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            children: true,
            product_categories: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            children: true,
            product_categories: true,
          },
        },
      },
    });
  }

  async findMany(filters: CategoryFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<Category>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

    // Build where clause
    const where: any = {};
    
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.slug) {
      where.slug = { contains: filters.slug, mode: 'insensitive' };
    }
    if (filters.parentId !== undefined) {
      where.parent_id = filters.parentId;
    }
    if (filters.isVisible !== undefined) {
      where.is_visible = filters.isVisible;
    }
    if (filters.hasProducts !== undefined) {
      where.product_categories = filters.hasProducts ? 
        { some: {} } : { none: {} };
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { display_order: 'asc' },
        include: {
          children: true,
          parent: true,
          _count: {
            select: {
              children: true,
              product_categories: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    const updateData: any = { ...data };
    
    // Map camelCase to snake_case for database fields
    if (data.parentId !== undefined) updateData.parent_id = data.parentId;
    if (data.isVisible !== undefined) updateData.is_visible = data.isVisible;
    if (data.displayOrder !== undefined) updateData.display_order = data.displayOrder;
    if (data.metaTitle !== undefined) updateData.meta_title = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.meta_description = data.metaDescription;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    return await this.prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            children: true,
            product_categories: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    // Check if category has children
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (category && category.children.length > 0) {
      throw new Error('Cannot delete category with children. Please delete or move children first.');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  async getCategoryTree(): Promise<CategoryWithChildren[]> {
    const categories = await this.prisma.category.findMany({
      where: { parent_id: null },
      include: {
        children: {
          include: {
            children: true,
            _count: {
              select: {
                children: true,
                product_categories: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            product_categories: true,
          },
        },
      },
      orderBy: { display_order: 'asc' },
    });

    return categories as CategoryWithChildren[];
  }

  async getCategoriesByParent(parentId?: string): Promise<Category[]> {
    return await this.prisma.category.findMany({
      where: { parent_id: parentId || null },
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            children: true,
            product_categories: true,
          },
        },
      },
      orderBy: { display_order: 'asc' },
    });
  }

  async getCategoryWithProducts(id: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        product_categories: {
          include: {
            products: {
              include: {
                variants: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            product_categories: true,
          },
        },
      },
    });
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository(new PrismaClient());
