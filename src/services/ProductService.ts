import { IProductRepository } from '@/interfaces/IProductRepository';
import { IEmailService } from '@/interfaces/IEmailService';

export class ProductService {
  constructor(
    private productRepository: IProductRepository,
    private emailService: IEmailService
  ) {}

  async getProduct(id: string) {
    return this.productRepository.findById(id);
  }

  async getProductBySlug(slug: string) {
    return this.productRepository.findBySlug(slug);
  }

  async getProducts(filters: any) {
    return this.productRepository.findMany(filters);
  }

  async createProduct(productData: any) {
    // Validate product data
    this.validateProductData(productData);

    // Check if slug is unique
    const existingProduct = await this.productRepository.findBySlug(productData.slug);
    if (existingProduct) {
      throw new Error('Product with this slug already exists');
    }

    // Create the product
    const product = await this.productRepository.create(productData);

    // Send notification email to admin (if needed)
    // await this.emailService.sendProductCreatedNotification(product);

    return product;
  }

  async updateProduct(id: string, productData: any) {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Validate product data
    this.validateProductData(productData, true);

    // Check slug uniqueness if slug is being updated
    if (productData.slug && productData.slug !== existingProduct.slug) {
      const slugExists = await this.productRepository.findBySlug(productData.slug);
      if (slugExists) {
        throw new Error('Product with this slug already exists');
      }
    }

    return this.productRepository.update(id, productData);
  }

  async deleteProduct(id: string) {
    // Check if product exists
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if product has orders (business rule)
    // This would require checking order items
    // const hasOrders = await this.checkProductHasOrders(id);
    // if (hasOrders) {
    //   throw new Error('Cannot delete product with existing orders');
    // }

    await this.productRepository.delete(id);
  }

  async searchProducts(query: string, filters?: any) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    return this.productRepository.search(query, filters);
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const updatedProduct = await this.productRepository.update(id, {
      stockQuantity: quantity,
      stockStatus: quantity > 0 ? 'instock' : 'outofstock'
    });

    // Check if stock is low and send alert
    if (quantity <= (product.lowStockThreshold || 5)) {
      // await this.emailService.sendLowStockAlert(product, quantity);
    }

    return updatedProduct;
  }

  async toggleFeatured(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    return this.productRepository.update(id, {
      featured: !product.featured
    });
  }

  async updateStatus(id: string, status: 'published' | 'draft' | 'private') {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    return this.productRepository.update(id, { status });
  }

  private validateProductData(productData: any, isUpdate = false) {
    const requiredFields = ['name', 'slug', 'price', 'stockQuantity'];
    
    for (const field of requiredFields) {
      if (!isUpdate && (productData[field] === undefined || productData[field] === null)) {
        throw new Error(`${field} is required`);
      }
    }

    if (productData.price !== undefined && productData.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (productData.stockQuantity !== undefined && productData.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    if (productData.salePrice !== undefined && productData.salePrice >= productData.price) {
      throw new Error('Sale price must be less than regular price');
    }

    // Validate slug format
    if (productData.slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(productData.slug)) {
        throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
      }
    }
  }
}
