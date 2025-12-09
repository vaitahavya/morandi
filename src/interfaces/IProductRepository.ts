export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(filters: ProductFilters): Promise<{ products: Product[]; pagination: PaginationInfo }>;
  create(productData: CreateProductData): Promise<Product>;
  update(id: string, productData: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
  search(query: string, filters?: ProductFilters): Promise<Product[]>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  price: number;
  salePrice?: number;
  regularPrice?: number;
  stockQuantity: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  lowStockThreshold?: number;
  status: 'published' | 'draft' | 'private';
  featured: boolean;
  featuredImage?: string;
  images: string[];
  categories?: ProductCategory[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  attributes?: Record<string, string>; // Parsed from JSON string
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  createdAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductData {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  lowStockThreshold?: number;
  status: 'published' | 'draft' | 'private';
  featured?: boolean;
  featuredImage?: string;
  images?: string[];
  categoryIds?: string[];
  attributes?: Array<{ name: string; value: string } | { name: string; values: string[] }>; // Old structure: name-value pairs, or new: name-values array
  variants?: Array<{
    name: string;
    sku?: string;
    price: number;
    salePrice?: number;
    stockQuantity: number;
    attributes: Record<string, string>; // Attribute name -> value mapping
  }>;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
