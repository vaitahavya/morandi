import { 
  productRepository, 
  CreateProductInput, 
  UpdateProductInput, 
  ProductFilters,
  FindManyOptions,
  PaginatedResult 
} from '@/repositories';
import { Product } from '@prisma/client';

/**
 * Product Service - Business logic layer
 */
export class ProductService {
  /**
   * Create a new product with business validation
   */
  async createProduct(productData: CreateProductInput): Promise<Product> {
    // Business validation
    if (!productData.name || !productData.slug) {
      throw new Error('Product name and slug are required');
    }

    if (productData.price <= 0) {
      throw new Error('Product price must be greater than 0');
    }

    if (productData.trackQuantity && (productData.quantity || 0) < 0) {
      throw new Error('Product quantity cannot be negative');
    }

    // Check if slug already exists
    const existingProduct = await productRepository.findBySlug(productData.slug);
    if (existingProduct) {
      throw new Error('Product with this slug already exists');
    }

    // Create product
    return await productRepository.create(productData);
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    return await productRepository.findById(id);
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!slug) {
      throw new Error('Product slug is required');
    }

    return await productRepository.findBySlug(slug);
  }

  /**
   * Get paginated products with filters
   */
  async getProducts(filters?: ProductFilters, options?: FindManyOptions): Promise<PaginatedResult<Product>> {
    return await productRepository.findMany(filters, options);
  }

  /**
   * Search products
   */
  async searchProducts(query: string, filters?: ProductFilters, options?: FindManyOptions): Promise<PaginatedResult<Product>> {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    return await productRepository.search(query, filters, options);
  }

  /**
   * Update product with business validation
   */
  async updateProduct(id: string, productData: UpdateProductInput): Promise<Product> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Check if product exists
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Validate slug uniqueness if slug is being updated
    if (productData.slug && productData.slug !== existingProduct.slug) {
      const slugExists = await productRepository.findBySlug(productData.slug);
      if (slugExists) {
        throw new Error('Product with this slug already exists');
      }
    }

    // Validate price if being updated
    if (productData.price !== undefined && productData.price <= 0) {
      throw new Error('Product price must be greater than 0');
    }

    return await productRepository.update(id, productData);
  }

  /**
   * Delete product with business validation
   */
  async deleteProduct(id: string): Promise<void> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Check if product exists
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Check if product has orders (business rule)
    // This would require checking order items - implement as needed

    await productRepository.delete(id);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    return await productRepository.getFeaturedProducts(limit);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string, options?: FindManyOptions): Promise<PaginatedResult<Product>> {
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    return await productRepository.getProductsByCategory(categoryId, options);
  }

  /**
   * Update product inventory
   */
  async updateInventory(id: string, quantity: number): Promise<Product> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    // Check if product exists
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    if (!existingProduct.manage_stock) {
      throw new Error('Product does not track quantity');
    }

    return await productRepository.updateInventory(id, quantity);
  }

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<{
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    featuredProducts: number;
    outOfStockProducts: number;
    totalInventoryValue: number;
  }> {
    const [totalResult, publishedResult, draftResult, featuredResult, outOfStockResult] = await Promise.all([
      productRepository.findMany(),
      productRepository.findMany({ status: 'published' }),
      productRepository.findMany({ status: 'draft' }),
      productRepository.findMany({ featured: true }),
      productRepository.findMany({ inStock: false }),
    ]);

    // Calculate total inventory value
    const allProducts = await productRepository.findMany({});
    const totalInventoryValue = allProducts.data.reduce((sum, product) => {
      return sum + (Number(product.price) * (product.stock_quantity || 0));
    }, 0);

    return {
      totalProducts: totalResult.pagination.total,
      publishedProducts: publishedResult.pagination.total,
      draftProducts: draftResult.pagination.total,
      featuredProducts: featuredResult.pagination.total,
      outOfStockProducts: outOfStockResult.pagination.total,
      totalInventoryValue,
    };
  }
}

// Export singleton instance
export const productService = new ProductService();