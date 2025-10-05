import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

// Customer interface
interface Customer {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  city?: string;
  country?: string;
  userId?: string;
  totalSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  segment: string;
  customerLifetimeValue: number;
  daysSinceFirstOrder: number;
  daysSinceLastOrder: number;
  isActive: boolean;
  firstOrderDate: string;
  lastOrderDate: string;
}

interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  segment?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CustomerDetailsData extends Customer {
  billingAddress: {
    firstName?: string;
    lastName?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  statusCounts: Record<string, number>;
  monthlySpending: Record<string, number>;
  orders: Array<{
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    paymentStatus: string;
    total: number;
    currency: string;
    itemCount: number;
    items: any[];
  }>;
  activityLog: Array<{
    id: string;
    date: string;
    action: string;
    description?: string;
    orderId?: string;
    changedBy?: string;
  }>;
}

// API functions
async function fetchCustomers(filters: CustomerFilters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/customers?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch customers');
  }
  
  return data;
}

async function fetchCustomerDetails(email: string) {
  const response = await fetch(`/api/customers/${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch customer details');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch customer details');
  }
  
  return data.data;
}

// Get customers with filters
export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => fetchCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get customer details by email
export function useCustomerDetails(email: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(email),
    queryFn: () => fetchCustomerDetails(email),
    enabled: !!email,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Prefetch customer details
export function usePrefetchCustomerDetails() {
  const queryClient = useQueryClient();
  
  return (email: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.customers.detail(email),
      queryFn: () => fetchCustomerDetails(email),
      staleTime: 10 * 60 * 1000,
    });
  };
}
