import { PrismaClient } from '@prisma/client';
import { ProductRepository } from '@/repositories/ProductRepository';
import { OrderRepository } from '@/repositories/OrderRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { productService, orderService, userService } from '@/services';
import { EmailService } from '@/services/EmailService';
import { prisma } from '@/lib/db';

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

    // Services (using singleton instances from the new architecture)
    this.register('emailService', new EmailService());
    this.register('productService', productService);
    this.register('orderService', orderService);
    this.register('userService', userService);
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
  getProductService() {
    return this.get('productService');
  }

  getOrderService() {
    return this.get('orderService');
  }

  getUserService() {
    return this.get('userService');
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
