import { PrismaClient } from '@prisma/client';
import { ProductRepository } from '@/repositories/ProductRepository';
import { OrderRepository } from '@/repositories/OrderRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { ProductService } from '@/services/ProductService';
import { OrderService } from '@/services/OrderService';
import { AuthService } from '@/services/AuthService';
import { EmailService } from '@/services/EmailService';

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeServices() {
    // Database
    const prisma = new PrismaClient();
    this.register('prisma', prisma);

    // Repositories
    this.register('productRepository', new ProductRepository(prisma));
    this.register('orderRepository', new OrderRepository(prisma));
    this.register('userRepository', new UserRepository(prisma));

    // Services
    this.register('emailService', new EmailService());
    this.register('productService', new ProductService(
      this.get('productRepository'),
      this.get('emailService')
    ));
    this.register('orderService', new OrderService(
      this.get('orderRepository'),
      this.get('productRepository'),
      this.get('emailService')
    ));
    this.register('authService', new AuthService(
      this.get('userRepository'), // This would need to be implemented
      this.get('emailService'),
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      '7d'
    ));
  }

  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in container`);
    }
    return service;
  }

  // Convenience methods for common services
  getProductService(): ProductService {
    return this.get('productService');
  }

  getOrderService(): OrderService {
    return this.get('orderService');
  }

  getAuthService(): AuthService {
    return this.get('authService');
  }

  getEmailService(): EmailService {
    return this.get('emailService');
  }

  getPrisma(): PrismaClient {
    return this.get('prisma');
  }
}

// Export singleton instance
export const container = Container.getInstance();
