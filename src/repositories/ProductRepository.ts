import { PrismaClient, Product } from '@prisma/client';
import { BaseRepository, FindManyOptions, PaginatedResult } from './base/BaseRepository';

/**
 * Extended Product type with parsed arrays for application use
 */
export type ProductWithArrays = Omit<Product, 'tags' | 'images'> & {
  tags: string[];
  images: string[];
  productCategories?: Array<{
    id: string;
    productId: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image: string | null;
    };
  }>;
  variants?: Array<any>;
};

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
  create(data: CreateProductInput): Promise<ProductWithArrays>;
  findById(id: string): Promise<ProductWithArrays | null>;
  findBySlug(slug: string): Promise<ProductWithArrays | null>;
  findMany(filters?: ProductFilters, options?: FindManyOptions): Promise<PaginatedResult<ProductWithArrays>>;
  update(id: string, data: UpdateProductInput): Promise<ProductWithArrays>;
  delete(id: string): Promise<void>;
  search(query: string, filters?: ProductFilters, options?: FindManyOptions): Promise<PaginatedResult<ProductWithArrays>>;
  getFeaturedProducts(limit?: number): Promise<ProductWithArrays[]>;
  getProductsByCategory(categoryId: string, options?: FindManyOptions): Promise<PaginatedResult<ProductWithArrays>>;
  updateInventory(id: string, quantity: number): Promise<ProductWithArrays>;
}

/**
 * Product repository implementation
 */
export class ProductRepository extends BaseRepository<ProductWithArrays, CreateProductInput, UpdateProductInput, ProductFilters> 
  implements IProductRepository {

  /**
   * Convert tags array to JSON string for database storage
   */
  private tagsToString(tags?: string[]): string {
    return tags && tags.length > 0 ? JSON.stringify(tags) : '[]';
  }

  /**
   * Convert tags JSON string to array for application use
   */
  private tagsToArray(tags: string): string[] {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Convert images array to JSON string for database storage
   */
  private imagesToString(images?: any[]): string {
    if (!images || images.length === 0) return '[]';
    
    // Convert image objects to simple URLs or keep as strings
    const imageUrls = images.map(img => {
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && img.src) return img.src;
      return img;
    });
    
    return JSON.stringify(imageUrls);
  }

  /**
   * Convert images JSON string to array for application use
   */
  private imagesToArray(images: string): string[] {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async create(data: CreateProductInput): Promise<ProductWithArrays> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        regularPrice: (data as any).regularPrice || data.compareAtPrice || data.price,
        salePrice: (data as any).salePrice,
        sku: data.sku,
        manageStock: data.trackQuantity,
        stockQuantity: data.quantity,
        weight: data.weight,
        status: data.status,
        featured: data.featured,
        tags: this.tagsToString(data.tags),
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        images: this.imagesToString(data.images),
        productCategories: data.categoryIds ? {
          create: data.categoryIds.map(categoryId => ({
            categoryId: categoryId,
          }))
        } : undefined,
        variants: (data as any).variants && (data as any).variants.length > 0 ? {
          create: (data as any).variants.filter((v: any) => !v.id?.startsWith('temp-')).map((variant: any) => ({
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            regularPrice: variant.regularPrice,
            salePrice: variant.salePrice,
            stockQuantity: variant.stockQuantity,
            stockStatus: variant.stockStatus,
            attributes: typeof variant.attributes === 'string' ? variant.attributes : JSON.stringify(variant.attributes || []),
            images: typeof variant.images === 'string' ? variant.images : JSON.stringify(variant.images || []),
            weight: variant.weight,
            dimensions: typeof variant.dimensions === 'string' ? variant.dimensions : JSON.stringify(variant.dimensions),
          }))
        } : undefined,
      },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    
    // Transform tags and images from JSON strings to arrays
    (product as any).tags = this.tagsToArray(product.tags);
    (product as any).images = this.imagesToArray(product.images);
    
    return product as unknown as ProductWithArrays;
  }

  async findById(id: string): Promise<ProductWithArrays | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    
    if (product) {
      // Convert tags from JSON string to array
      (product as any).tags = this.tagsToArray(product.tags);
      // Convert images from JSON string to array
      (product as any).images = this.imagesToArray(product.images);
      
      // Parse variant attributes from JSON strings
      if (product.variants) {
        (product as any).variants = product.variants.map((variant: any) => ({
          ...variant,
          attributes: typeof variant.attributes === 'string' ? JSON.parse(variant.attributes || '[]') : variant.attributes,
          images: typeof variant.images === 'string' ? JSON.parse(variant.images || '[]') : variant.images,
        }));
      }
      
      return product as unknown as ProductWithArrays;
    }
    
    return null;
  }

  async findBySlug(slug: string): Promise<ProductWithArrays | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    
    if (product) {
      // Convert tags from JSON string to array
      (product as any).tags = this.tagsToArray(product.tags);
      // Convert images from JSON string to array
      (product as any).images = this.imagesToArray(product.images);
      
      // Parse variant attributes from JSON strings
      if (product.variants) {
        (product as any).variants = product.variants.map((variant: any) => ({
          ...variant,
          attributes: typeof variant.attributes === 'string' ? JSON.parse(variant.attributes || '[]') : variant.attributes,
          images: typeof variant.images === 'string' ? JSON.parse(variant.images || '[]') : variant.images,
        }));
      }
      
      return product as unknown as ProductWithArrays;
    }
    
    return null;
  }

  async findMany(filters: ProductFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<ProductWithArrays>> {
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
      where.productCategories = {
        some: {
          categoryId: filters.categoryId,
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
      // For SQLite, we need to search within the JSON string
      where.tags = {
        contains: JSON.stringify(filters.tags),
      };
    }
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        where.OR = [
          { manageStock: false },
          { AND: [{ manageStock: true }, { stockQuantity: { gt: 0 } }] },
        ];
      } else {
        where.AND = [
          { manageStock: true },
          { stockQuantity: { lte: 0 } },
        ];
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          productCategories: {
            include: {
              category: true,
            },
          },
          variants: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Convert tags and images from JSON strings to arrays for all products
    const productsWithArrayData = products.map(product => ({
      ...product,
      tags: this.tagsToArray(product.tags),
      images: this.imagesToArray(product.images)
    })) as unknown as ProductWithArrays[];

    return {
      data: productsWithArrayData,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, data: UpdateProductInput): Promise<ProductWithArrays> {
    const updateData: any = { ...data };
    
    // Map camelCase to Prisma field names (no need for snake_case mapping since Prisma handles it)
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.compareAtPrice !== undefined) updateData.regularPrice = data.compareAtPrice;
    if (data.costPrice !== undefined) updateData.costPrice = data.costPrice;
    if (data.trackQuantity !== undefined) updateData.manageStock = data.trackQuantity;
    if (data.allowBackorder !== undefined) updateData.allowBackorder = data.allowBackorder;
    if (data.weightUnit !== undefined) updateData.weightUnit = data.weightUnit;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.tags !== undefined) updateData.tags = this.tagsToString(data.tags);
    if (data.images !== undefined) updateData.images = this.imagesToString(data.images);
    
    // Handle variants if provided
    if ((data as any).variants !== undefined) {
      const variants = (data as any).variants;
      
      // Delete all existing variants and create new ones (simpler approach)
      await this.prisma.productVariant.deleteMany({
        where: { productId: id }
      });
      
      // Create new variants (filter out temp IDs)
      if (variants && variants.length > 0) {
        updateData.variants = {
          create: variants.filter((v: any) => !v.id?.startsWith('temp-')).map((variant: any) => ({
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            regularPrice: variant.regularPrice,
            salePrice: variant.salePrice,
            stockQuantity: variant.stockQuantity,
            stockStatus: variant.stockStatus,
            attributes: typeof variant.attributes === 'string' ? variant.attributes : JSON.stringify(variant.attributes || []),
            images: typeof variant.images === 'string' ? variant.images : JSON.stringify(variant.images || []),
            weight: variant.weight,
            dimensions: typeof variant.dimensions === 'string' ? variant.dimensions : JSON.stringify(variant.dimensions),
          }))
        };
      }
    }
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });

    // Convert tags and images from JSON string to array
    (updatedProduct as any).tags = this.tagsToArray(updatedProduct.tags);
    (updatedProduct as any).images = this.imagesToArray(updatedProduct.images);
    return updatedProduct as unknown as ProductWithArrays;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async search(query: string, filters: ProductFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<ProductWithArrays>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

    // Build search where clause
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { tags: { contains: query } },
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
      where.productCategories = {
        some: {
          categoryId: filters.categoryId,
        },
      };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          productCategories: {
            include: {
              category: true,
            },
          },
          variants: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Convert tags and images from JSON strings to arrays for all products
    const productsWithArrayData = products.map(product => ({
      ...product,
      tags: this.tagsToArray(product.tags),
      images: this.imagesToArray(product.images)
    })) as unknown as ProductWithArrays[];

    return {
      data: productsWithArrayData,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getFeaturedProducts(limit: number = 10): Promise<ProductWithArrays[]> {
    const products = await this.prisma.product.findMany({
      where: {
        featured: true,
        status: 'published',
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });

    // Convert tags and images from JSON strings to arrays for all products
    return products.map(product => ({
      ...product,
      tags: this.tagsToArray(product.tags),
      images: this.imagesToArray(product.images)
    })) as unknown as ProductWithArrays[];
  }

  async getProductsByCategory(categoryId: string, options: FindManyOptions = {}): Promise<PaginatedResult<ProductWithArrays>> {
    return await this.findMany(
      { categoryId },
      options
    );
  }

  async updateInventory(id: string, quantity: number): Promise<ProductWithArrays> {
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        stockQuantity: quantity,
        updatedAt: new Date(),
      },
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });

    // Convert tags and images from JSON string to array
    (updatedProduct as any).tags = this.tagsToArray(updatedProduct.tags);
    (updatedProduct as any).images = this.imagesToArray(updatedProduct.images);
    return updatedProduct as unknown as ProductWithArrays;
  }
}

// Export singleton instance
export const productRepository = new ProductRepository(new PrismaClient());