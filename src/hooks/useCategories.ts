import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
}

interface CategoryOptions {
  includeProductCount?: boolean;
  onlyVisible?: boolean;
  parentId?: string;
  flat?: boolean;
}

// API functions
async function fetchCategories(options: CategoryOptions = {}) {
  const params = new URLSearchParams();
  
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/categories?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch categories');
  }
  
  return data.data || [];
}

async function fetchCategory(id: string) {
  const response = await fetch(`/api/categories/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch category');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch category');
  }
  
  return data.data;
}

async function createCategory(categoryData: Partial<ProductCategory>) {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create category');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to create category');
  }
  
  return data.data;
}

async function updateCategory(id: string, categoryData: Partial<ProductCategory>) {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update category');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to update category');
  }
  
  return data.data;
}

async function deleteCategory(id: string, moveProductsTo?: string) {
  const params = moveProductsTo ? `?moveProducts=${moveProductsTo}` : '';
  
  const response = await fetch(`/api/categories/${id}${params}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete category');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete category');
  }
}

// Get categories
export function useCategories(options: CategoryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.categories.list(options),
    queryFn: () => fetchCategories(options),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Get single category
export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => fetchCategory(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Create category mutation
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      
      // Add the new category to cache
      queryClient.setQueryData(
        queryKeys.categories.detail(newCategory.id),
        newCategory
      );
    },
  });
}

// Update category mutation
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductCategory> }) => 
      updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      // Update the category in cache
      queryClient.setQueryData(
        queryKeys.categories.detail(updatedCategory.id),
        updatedCategory
      );
      
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });
}

// Delete category mutation
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, moveProductsTo }: { id: string; moveProductsTo?: string }) => 
      deleteCategory(id, moveProductsTo),
    onSuccess: (_, { id }) => {
      // Remove the category from cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) });
      
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });
}
