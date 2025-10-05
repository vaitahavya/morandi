import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Time before inactive queries are garbage collected (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    search: (query: string, filters?: Record<string, any>) => 
      [...queryKeys.products.all, 'search', query, filters] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    status: (id: string) => [...queryKeys.orders.detail(id), 'status'] as const,
  },
  
  // Customers
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (email: string) => [...queryKeys.customers.details(), email] as const,
  },
  
  // Returns
  returns: {
    all: ['returns'] as const,
    lists: () => [...queryKeys.returns.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.returns.lists(), filters] as const,
    details: () => [...queryKeys.returns.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.returns.details(), id] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  
  // Recommendations
  recommendations: {
    all: ['recommendations'] as const,
    product: (productId: string, userId?: string, limit?: number) => 
      [...queryKeys.recommendations.all, 'product', productId, userId, limit] as const,
    personalized: (userId: string, limit?: number) => 
      [...queryKeys.recommendations.all, 'personalized', userId, limit] as const,
    similar: (productId: string, limit?: number) => 
      [...queryKeys.recommendations.all, 'similar', productId, limit] as const,
    popular: (limit?: number) => 
      [...queryKeys.recommendations.all, 'popular', limit] as const,
  },
  
  // Marketing
  marketing: {
    all: ['marketing'] as const,
    banners: (filters?: Record<string, any>) => [...queryKeys.marketing.all, 'banners', filters] as const,
    coupons: (filters?: Record<string, any>) => [...queryKeys.marketing.all, 'coupons', filters] as const,
  },
  
  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: (timeRange: string) => [...queryKeys.analytics.all, 'dashboard', timeRange] as const,
    products: () => [...queryKeys.analytics.all, 'products'] as const,
    orders: () => [...queryKeys.analytics.all, 'orders'] as const,
    customers: () => [...queryKeys.analytics.all, 'customers'] as const,
  },
} as const;
