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
    productCategories: number;
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
        parentId: data.parentId,
        image: data.image,
        isVisible: data.isVisible,
        displayOrder: data.displayOrder,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            children: true,
            productCategories: true,
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
            productCategories: true,
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
            productCategories: true,
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
      where.parentId = filters.parentId;
    }
    if (filters.isVisible !== undefined) {
      where.isVisible = filters.isVisible;
    }
    if (filters.hasProducts !== undefined) {
      where.productCategories = filters.hasProducts ? 
        { some: {} } : { none: {} };
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { displayOrder: 'asc' },
        include: {
          children: true,
          parent: true,
          _count: {
            select: {
              children: true,
              productCategories: true,
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
    
    // Map camelCase to Prisma field names (no need for snake_case mapping since Prisma handles it)
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    
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
            productCategories: true,
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
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
            _count: {
              select: {
                children: true,
                productCategories: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            productCategories: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
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
            productCategories: true,
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
        productCategories: {
          include: {
            product: {
              include: {
                variants: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            productCategories: true,
          },
        },
      },
    });
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository(new PrismaClient());
