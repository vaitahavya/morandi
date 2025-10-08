import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

interface Return {
  id: string;
  returnNumber: string;
  orderId: string;
  customerEmail: string;
  customerPhone?: string;
  returnReason: string;
  returnDescription?: string;
  status: string;
  returnType: string;
  refundAmount?: number;
  images?: string;
  videos?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReturnFilters {
  page?: number;
  limit?: number;
  status?: string;
  orderId?: string;
  customerEmail?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API functions
async function fetchReturns(filters: ReturnFilters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/returns?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch returns');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch returns');
  }
  
  return data;
}

async function fetchReturn(id: string) {
  const response = await fetch(`/api/returns/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch return');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch return');
  }
  
  return data.data;
}

async function createReturn(returnData: any) {
  const response = await fetch('/api/returns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(returnData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create return');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to create return');
  }
  
  return data.data;
}

async function updateReturn(id: string, updateData: any) {
  const response = await fetch(`/api/returns/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update return');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to update return');
  }
  
  return data.data;
}

async function deleteReturn(id: string) {
  const response = await fetch(`/api/returns/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete return');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete return');
  }
}

// Get returns with filters
export function useReturns(filters: ReturnFilters = {}) {
  return useQuery({
    queryKey: queryKeys.returns.list(filters),
    queryFn: () => fetchReturns(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get single return by ID
export function useReturn(id: string) {
  return useQuery({
    queryKey: queryKeys.returns.detail(id),
    queryFn: () => fetchReturn(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create return mutation
export function useCreateReturn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createReturn,
    onSuccess: (newReturn) => {
      // Invalidate returns list
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.lists() });
      
      // Add the new return to cache
      queryClient.setQueryData(
        queryKeys.returns.detail(newReturn.id),
        newReturn
      );
    },
  });
}

// Update return mutation
export function useUpdateReturn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      updateReturn(id, data),
    onSuccess: (updatedReturn) => {
      // Update the return in cache
      queryClient.setQueryData(
        queryKeys.returns.detail(updatedReturn.id),
        updatedReturn
      );
      
      // Invalidate returns list
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.lists() });
    },
  });
}

// Delete return mutation
export function useDeleteReturn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteReturn,
    onSuccess: (_, returnId) => {
      // Remove the return from cache
      queryClient.removeQueries({ queryKey: queryKeys.returns.detail(returnId) });
      
      // Invalidate returns list
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.lists() });
    },
  });
}
