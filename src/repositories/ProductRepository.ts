import { PrismaClient, Product } from '@prisma/client';
import { BaseRepository, FindManyOptions, PaginatedResult } from './base/BaseRepository';

/**
 * Product creation input type
 */
export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity?: number;
  allowBackorder: boolean;
  weight?: number;
  weightUnit?: string;
  status: string;
  featured: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  images?: string[];
  categoryIds?: string[];
  variantIds?: string[];
}

/**
 * Product update input type
 */
export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  trackQuantity?: boolean;
  quantity?: number;
  allowBackorder?: boolean;
  weight?: number;
  weightUnit?: string;
  status?: string;
  featured?: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  images?: string[];
}

/**
 * Product filter input type
 */
export interface ProductFilters {
  name?: string;
  slug?: string;
  status?: string;
  featured?: boolean;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
}

/**
 * Product repository interface
 */
export interface IProductRepository {
  create(data: CreateProductInput): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(filters?: ProductFilters, options?: FindManyOptions): Promise<PaginatedResult<Product>>;
  update(id: string, data: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
  search(query: string, filters?: ProductFilters, options?: FindManyOptions): Promise<PaginatedResult<Product>>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProductsByCategory(categoryId: string, options?: FindManyOptions): Promise<PaginatedResult<Product>>;
  updateInventory(id: string, quantity: number): Promise<Product>;
}

/**
 * Product repository implementation
 */
export class ProductRepository extends BaseRepository<Product, CreateProductInput, UpdateProductInput, ProductFilters> 
  implements IProductRepository {

  async create(data: CreateProductInput): Promise<Product> {
    return await this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        short_description: data.shortDescription,
        price: data.price,
        regular_price: data.compareAtPrice,
        sku: data.sku,
        manage_stock: data.trackQuantity,
        stock_quantity: data.quantity,
        weight: data.weight,
        status: data.status,
        featured: data.featured,
        tags: data.tags,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        images: data.images,
        product_categories: data.categoryIds ? {
          create: data.categoryIds.map(categoryId => ({
            category_id: categoryId,
          }))
        } : undefined,
      },
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        variants: true,
      },
    });
  }

  async findById(id: string): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        variants: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: { slug },
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        variants: true,
      },
    });
  }

  async findMany(filters: ProductFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<Product>> {
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
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }
    if (filters.categoryId) {
      where.product_categories = {
        some: {
          category_id: filters.categoryId,
        },
      };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        where.OR = [
          { track_quantity: false },
          { AND: [{ track_quantity: true }, { quantity: { gt: 0 } }] },
        ];
      } else {
        where.AND = [
          { track_quantity: true },
          { quantity: { lte: 0 } },
        ];
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { created_at: 'desc' },
        include: {
          product_categories: {
            include: {
              categories: true,
            },
          },
          variants: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const updateData: any = { ...data };
    
    // Map camelCase to snake_case for database fields
    if (data.shortDescription !== undefined) updateData.short_description = data.shortDescription;
    if (data.compareAtPrice !== undefined) updateData.compare_at_price = data.compareAtPrice;
    if (data.costPrice !== undefined) updateData.cost_price = data.costPrice;
    if (data.trackQuantity !== undefined) updateData.track_quantity = data.trackQuantity;
    if (data.allowBackorder !== undefined) updateData.allow_backorder = data.allowBackorder;
    if (data.weightUnit !== undefined) updateData.weight_unit = data.weightUnit;
    if (data.metaTitle !== undefined) updateData.meta_title = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.meta_description = data.metaDescription;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    return await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        variants: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async search(query: string, filters: ProductFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<Product>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

    // Build search where clause
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { short_description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ],
    };

    // Apply additional filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }
    if (filters.categoryId) {
      where.product_categories = {
        some: {
          category_id: filters.categoryId,
        },
      };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { created_at: 'desc' },
        include: {
          product_categories: {
            include: {
              categories: true,
            },
          },
          variants: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: {
        featured: true,
        status: 'published',
      },
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        variants: true,
      },
    });
  }

  async getProductsByCategory(categoryId: string, options: FindManyOptions = {}): Promise<PaginatedResult<Product>> {
    return await this.findMany(
      { categoryId },
      options
    );
  }

  async updateInventory(id: string, quantity: number): Promise<Product> {
    return await this.prisma.product.update({
      where: { id },
      data: {
        stock_quantity: quantity,
        updated_at: new Date(),
      },
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        variants: true,
      },
    });
  }
}

// Export singleton instance
export const productRepository = new ProductRepository(new PrismaClient());