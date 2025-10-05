/**
 * Repository layer exports
 * This file provides a clean interface to all repositories
 */

// Base repository
export * from './base/BaseRepository';

// Domain repositories
export * from './UserRepository';
export * from './ProductRepository';
export * from './OrderRepository';
export * from './CategoryRepository';
export * from './ReturnRepository';
export * from './CustomerRepository';

// Repository instances (singletons)
export { userRepository } from './UserRepository';
export { productRepository } from './ProductRepository';
export { orderRepository } from './OrderRepository';
export { categoryRepository } from './CategoryRepository';
export { returnRepository } from './ReturnRepository';
export { customerRepository } from './CustomerRepository';

// Types
export type {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  IUserRepository,
} from './UserRepository';

export type {
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  IProductRepository,
} from './ProductRepository';

export type {
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilters,
  OrderWithItems,
  IOrderRepository,
} from './OrderRepository';

export type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
  CategoryWithChildren,
  ICategoryRepository,
} from './CategoryRepository';

export type {
  CreateReturnInput,
  UpdateReturnInput,
  ReturnFilters,
  ReturnWithItems,
  IReturnRepository,
} from './ReturnRepository';

export type {
  Customer,
  CustomerFilters,
  CustomerDetails,
  ICustomerRepository,
} from './CustomerRepository';

export type {
  FindManyOptions,
  PaginatedResult,
  IBaseRepository,
} from './base/BaseRepository';
