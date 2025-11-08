/**
 * Service layer exports
 * This file provides a clean interface to all services
 */

// Business logic services
export * from './UserService';
export * from './ProductService';
export * from './OrderService';
export * from './ShippingService';
export * from './CouponService';

// Service instances (singletons)
export { userService } from './UserService';
export { productService } from './ProductService';
export { orderService } from './OrderService';
export { shippingService } from './ShippingService';
export { couponService } from './CouponService';
