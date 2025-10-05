import { ProductFilters } from '@/interfaces/IProductRepository';
import { Search } from 'lucide-react';

interface ProductFiltersComponentProps {
  filters: ProductFilters;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
}

export function ProductFiltersComponent({ filters, onFilterChange }: ProductFiltersComponentProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.status || 'published'}
          onChange={(e) => onFilterChange({ status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="private">Private</option>
        </select>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filters.inStock?.toString() || ''}
          onChange={(e) => onFilterChange({ 
            inStock: e.target.value === '' ? undefined : e.target.value === 'true' 
          })}
        >
          <option value="">All Stock</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            onFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
          }}
        >
          <option value="updatedAt-desc">Recently Updated</option>
          <option value="createdAt-desc">Recently Created</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Price Low-High</option>
          <option value="price-desc">Price High-Low</option>
          <option value="stockQuantity-asc">Stock Low-High</option>
          <option value="stockQuantity-desc">Stock High-Low</option>
        </select>
      </div>
    </div>
  );
}
