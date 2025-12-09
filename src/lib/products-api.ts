// Products API - Native e-commerce product management
// This library provides functions to interact with our native product APIs

export interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  stockQuantity: number;
  stockStatus: string;
  attributes: Record<string, any>;
  images: string[];
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  description?: string;
  shortDescription?: string;
  images: ProductImage[];
  featuredImage?: string;
  categories: ProductCategory[];
  stockStatus: string;
  stockQuantity: number;
  manageStock: boolean;
  lowStockThreshold?: number;
  inStock: boolean;
  featured: boolean;
  status: string;
  variants?: ProductVariant[];
  attributes?: Record<string, string[]>;
  avgRating?: number;
  reviewCount?: number;
  sku?: string;
  weight?: number;
  dimensions?: any;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for compatibility
  tags: string[];
  category: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryId?: string;
  status?: string;
  featured?: boolean;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  attributes?: Record<string, string[]>;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: ProductFilters;
}

export interface ProductResponse {
  success: boolean;
  data?: Product;
  error?: string;
}

export interface CategoryResponse {
  success: boolean;
  data?: ProductCategory;
  error?: string;
}

export interface CategoryListResponse {
  success: boolean;
  data: ProductCategory[];
}

// Base API URL
const API_BASE = '/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => {
      throw new Error(`Failed to parse response from ${url}`);
    });

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
}

// Product API Functions

export const getProducts = async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
  const response = await getProductsWithPagination(filters);
  return response;
};

export const getProductsWithPagination = async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    // Allow 'all' for status to explicitly request all products
    if (value !== undefined && value !== null && (value !== '' || key === 'status')) {
      if (typeof value === 'object') {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, value.toString());
      }
    }
  });

  const response = await apiCall<ProductListResponse>(`/products?${params.toString()}`);
  return response;
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const response = await apiCall<ProductResponse>(`/products/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    // If it's a 404, the product doesn't exist - return null
    if (error instanceof Error && error.message.includes('404')) {
      console.log(`Product not found: ${id}`);
      return null;
    }
    
    console.error('Error fetching product:', error);
    return null;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  return getProduct(slug);
};

export const searchProducts = async (
  query: string,
  filters: ProductFilters = {}
): Promise<Product[]> => {
  try {
    const params = new URLSearchParams({ q: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiCall<ProductListResponse>(`/products/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await apiCall<ProductResponse>('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create product');
  }

  return response.data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const response = await apiCall<ProductResponse>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update product');
  }

  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const response = await apiCall<{ success: boolean; error?: string }>(`/products/${id}`, {
    method: 'DELETE',
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete product');
  }
};

// Category API Functions

export const getCategories = async (options: {
  includeProductCount?: boolean;
  onlyVisible?: boolean;
  parentId?: string;
  flat?: boolean;
} = {}): Promise<ProductCategory[]> => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await apiCall<CategoryListResponse>(`/categories?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Return basic categories as fallback
    return [
      { id: '1', name: 'Clothing', slug: 'clothing' },
      { id: '2', name: 'Footwear', slug: 'footwear' },
      { id: '3', name: 'Accessories', slug: 'accessories' }
    ];
  }
};

export const getCategory = async (id: string): Promise<ProductCategory | null> => {
  try {
    const response = await apiCall<CategoryResponse>(`/categories/${id}`);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const createCategory = async (categoryData: Partial<ProductCategory>): Promise<ProductCategory> => {
  const response = await apiCall<CategoryResponse>('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create category');
  }

  return response.data;
};

export const updateCategory = async (id: string, categoryData: Partial<ProductCategory>): Promise<ProductCategory> => {
  const response = await apiCall<CategoryResponse>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update category');
  }

  return response.data;
};

export const deleteCategory = async (id: string, moveProductsTo?: string): Promise<void> => {
  const params = moveProductsTo ? `?moveProducts=${moveProductsTo}` : '';
  
  const response = await apiCall<{ success: boolean; error?: string }>(`/categories/${id}${params}`, {
    method: 'DELETE',
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete category');
  }
};

// Legacy compatibility functions
export const getProductVariations = async (productId: string): Promise<ProductVariant[]> => {
  const product = await getProduct(productId);
  return product?.variants || [];
};