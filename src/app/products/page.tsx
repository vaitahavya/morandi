'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import SearchBar from '@/components/products/SearchBar';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSorting, { SortOption } from '@/components/products/ProductSorting';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import VariationFilters from '@/components/products/VariationFilters';
import { Product, getProductsWithPagination } from '@/lib/products-api';

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [currentSort, setCurrentSort] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchParam = searchParams.get('search');

  // Function to fetch products with current filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build filter object for native API
      const filters = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sortBy: currentSort.split('-')[0],
        sortOrder: currentSort.split('-')[1] as 'asc' | 'desc',
        minPrice: priceRange.min > 0 ? priceRange.min : undefined,
        maxPrice: priceRange.max < Infinity ? priceRange.max : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if ((filters as any)[key] === undefined) {
          delete (filters as any)[key];
        }
      });

      const response = await getProductsWithPagination(filters);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success && data.data) {
        // Extract category names from the API response
        const categoryNames = data.data.map((cat: any) => cat.name);
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory, currentSort, priceRange]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Set initial filters from URL params
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [categorySlug, searchParam]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    setCurrentPage(1); // Reset to first page when price changes
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSize('');
    setSelectedColor('');
    setPriceRange({ min: 0, max: Infinity });
    setCurrentSort('name-asc');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Products are already paginated by the server

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">All Products</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Stylish Variation Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {loadingCategories ? (
            <div className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-md">
              Loading categories...
            </div>
          ) : categories.length > 0 ? (
            <VariationFilters
              title="Category"
              options={categories.map(cat => ({ name: cat, value: cat }))}
              selectedValue={selectedCategory}
              onSelect={setSelectedCategory}
              onClear={() => setSelectedCategory('')}
            />
          ) : null}
          
          {/* TODO: Add size and color filters with separate API calls */}
          
          {selectedCategory && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Products grid */}
        <div className="lg:col-span-3">
          <ProductSorting
            currentSort={currentSort}
            onSortChange={handleSortChange}
            totalProducts={pagination.total}
          />

          {products.length === 0 ? (
            searchQuery || selectedCategory || priceRange.max !== Infinity ? (
              <EmptyState
                title="No products found"
                description="Try adjusting your search criteria or filters to find what you're looking for."
                icon="search"
                action={{
                  label: 'Clear all filters',
                  onClick: handleClearFilters,
                }}
              />
            ) : (
              <EmptyState
                title="No products available"
                description="We're currently updating our product catalog. Please check back soon!"
                icon="package"
              />
            )
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
