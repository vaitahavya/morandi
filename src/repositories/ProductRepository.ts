import { PrismaClient } from '@prisma/client';
import { 
  IProductRepository, 
  Product, 
  ProductFilters, 
  CreateProductData, 
  UpdateProductData,
  PaginationInfo 
} from '@/interfaces/IProductRepository';

export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        product_categories: {
          include: {
            categories: true
          }
        },
        variants: true,
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
          }
        }
      }
    });

    return product ? this.mapToProduct(product) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        product_categories: {
          include: {
            categories: true
          }
        },
        variants: true,
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
          }
        }
      }
    });

    return product ? this.mapToProduct(product) : null;
  }

  async findMany(filters: ProductFilters): Promise<{ products: Product[]; pagination: PaginationInfo }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    if (filters.status) {
      whereConditions.status = filters.status;
    }

    if (filters.search) {
      whereConditions.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { short_description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.category) {
      whereConditions.product_categories = {
        some: {
          categories: {
            name: { contains: filters.category, mode: 'insensitive' }
          }
        }
      };
    }

    if (filters.featured !== undefined) {
      whereConditions.featured = filters.featured;
    }

    if (filters.inStock !== undefined) {
      whereConditions.stock_status = filters.inStock ? 'instock' : { not: 'instock' };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      whereConditions.price = {};
      if (filters.minPrice !== undefined) {
        whereConditions.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        whereConditions.price.lte = filters.maxPrice;
      }
    }

    // Build order by
    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.created_at = 'desc';
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereConditions,
        include: {
          product_categories: {
            include: {
              categories: true
            }
          },
          variants: true,
          attributes: true,
          reviews: true
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      this.prisma.product.count({ where: whereConditions })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products: products.map(product => this.mapToProduct(product)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async create(productData: CreateProductData): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        short_description: productData.shortDescription,
        sku: productData.sku,
        price: productData.price,
        sale_price: productData.salePrice,
        stock_quantity: productData.stockQuantity,
        low_stock_threshold: productData.lowStockThreshold,
        status: productData.status,
        featured: productData.featured || false,
        featured_image: productData.featuredImage,
        images: productData.images || [],
        stock_status: productData.stockQuantity > 0 ? 'instock' : 'outofstock',
        product_categories: productData.categoryIds ? {
          create: productData.categoryIds.map(categoryId => ({
            categories: {
              connect: { id: categoryId }
            }
          }))
        } : undefined
      },
      include: {
        product_categories: {
          include: {
            categories: true
          }
        },
        variants: true,
        attributes: true,
        reviews: true
      }
    });

    return this.mapToProduct(product);
  }

  async update(id: string, productData: UpdateProductData): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(productData.name && { name: productData.name }),
        ...(productData.slug && { slug: productData.slug }),
        ...(productData.description !== undefined && { description: productData.description }),
        ...(productData.shortDescription !== undefined && { short_description: productData.shortDescription }),
        ...(productData.sku !== undefined && { sku: productData.sku }),
        ...(productData.price !== undefined && { price: productData.price }),
        ...(productData.salePrice !== undefined && { sale_price: productData.salePrice }),
        ...(productData.stockQuantity !== undefined && { 
          stock_quantity: productData.stockQuantity,
          stock_status: productData.stockQuantity > 0 ? 'instock' : 'outofstock'
        }),
        ...(productData.lowStockThreshold !== undefined && { low_stock_threshold: productData.lowStockThreshold }),
        ...(productData.status && { status: productData.status }),
        ...(productData.featured !== undefined && { featured: productData.featured }),
        ...(productData.featuredImage !== undefined && { featured_image: productData.featuredImage }),
        ...(productData.images !== undefined && { images: productData.images }),
        updated_at: new Date()
      },
      include: {
        product_categories: {
          include: {
            categories: true
          }
        },
        variants: true,
        attributes: true,
        reviews: true
      }
    });

    return this.mapToProduct(product);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id }
    });
  }

  async search(query: string, filters?: ProductFilters): Promise<Product[]> {
    const searchFilters: ProductFilters = {
      ...filters,
      search: query
    };

    const result = await this.findMany(searchFilters);
    return result.products;
  }

  private mapToProduct(prismaProduct: any): Product {
    return {
      id: prismaProduct.id,
      name: prismaProduct.name,
      slug: prismaProduct.slug,
      description: prismaProduct.description,
      shortDescription: prismaProduct.short_description,
      sku: prismaProduct.sku,
      price: Number(prismaProduct.price),
      salePrice: prismaProduct.sale_price ? Number(prismaProduct.sale_price) : undefined,
      regularPrice: Number(prismaProduct.price),
      stockQuantity: prismaProduct.stock_quantity || 0,
      stockStatus: prismaProduct.stock_status,
      lowStockThreshold: prismaProduct.low_stock_threshold,
      status: prismaProduct.status,
      featured: prismaProduct.featured,
      featuredImage: prismaProduct.featured_image,
      images: prismaProduct.images || [],
      categories: prismaProduct.product_categories?.map((pc: any) => ({
        id: pc.categories.id,
        name: pc.categories.name,
        slug: pc.categories.slug
      })),
      variants: prismaProduct.variants?.map((variant: any) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        price: Number(variant.price),
        salePrice: variant.sale_price ? Number(variant.sale_price) : undefined,
        stockQuantity: variant.stock_quantity || 0,
        attributes: variant.attributes
      })),
      attributes: prismaProduct.attributes?.map((attr: any) => ({
        id: attr.id,
        name: attr.name,
        value: attr.value
      })),
      reviews: prismaProduct.reviews?.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.user_id,
        createdAt: review.created_at.toISOString()
      })),
      createdAt: prismaProduct.created_at.toISOString(),
      updatedAt: prismaProduct.updated_at.toISOString()
    };
  }
}
