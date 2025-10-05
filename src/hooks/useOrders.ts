import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  updateOrderStatus, 
  cancelOrder,
  getOrderStatusHistory,
  type Order,
  type OrderFilters,
  type CreateOrderData 
} from '@/lib/orders-api';

// Get orders with filters
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => getOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single order by ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrder(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get order status history
export function useOrderStatusHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.status(id),
    queryFn: () => getOrderStatusHistory(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (newOrder) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      
      // Add the new order to cache
      queryClient.setQueryData(
        queryKeys.orders.detail(newOrder.id),
        newOrder
      );
      
      // Invalidate customer data if user is logged in
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() });
    },
  });
}

// Update order mutation
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) => 
      updateOrder(id, data),
    onSuccess: (updatedOrder) => {
      // Update the order in cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );
      
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      status, 
      notes, 
      notify = true 
    }: { 
      id: string; 
      status: string; 
      notes?: string; 
      notify?: boolean; 
    }) => updateOrderStatus(id, status, notes, notify),
    onSuccess: (updatedOrder) => {
      // Update the order in cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );
      
      // Invalidate orders list and status history
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.status(updatedOrder.id) });
    },
  });
}

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (_, orderId) => {
      // Invalidate the specific order
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
}

// Prefetch order (useful for admin dashboard)
export function usePrefetchOrder() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.orders.detail(id),
      queryFn: () => getOrder(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}
