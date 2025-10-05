import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { 
  getProducts, 
  getProduct, 
  getProductBySlug, 
  searchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  type Product,
  type ProductFilters 
} from '@/lib/products-api';

// Get products with filters
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get product by slug
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Search products
export function useSearchProducts(query: string, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.search(query, filters),
    queryFn: () => searchProducts(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      
      // Add the new product to the cache
      queryClient.setQueryData(
        queryKeys.products.detail(newProduct.id),
        newProduct
      );
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Update the product in cache
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
      
      // Invalidate products list to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, productId) => {
      // Remove the product from cache
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(productId) });
      
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}

// Prefetch product (useful for hover states, etc.)
export function usePrefetchProduct() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => getProduct(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}
