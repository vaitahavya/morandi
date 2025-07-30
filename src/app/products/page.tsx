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
import MockDataNotice from '@/components/ui/MockDataNotice';
import VariationFilters from '@/components/products/VariationFilters';
import { Product, getProducts } from '@/lib/wordpress-api';

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [currentSort, setCurrentSort] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchParam = searchParams.get('search');

  // Extract unique categories from products
  const categories = Array.from(
    new Set(products.flatMap(product => product.categories?.map(cat => cat.name) || []))
  );

  // Extract unique sizes and colors from products
  const sizes = Array.from(
    new Set(products.flatMap(product => 
      product.attributes?.find(attr => attr.name === 'Size')?.options || []
    ))
  );

  const colors = Array.from(
    new Set(products.flatMap(product => 
      product.attributes?.find(attr => attr.name === 'Color')?.options || []
    ))
  );

  useEffect(() => {
    (async () => {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    // Set initial category from URL params
    if (categorySlug) {
      const category = products.find(p => 
        p.categories?.some(cat => cat.slug === categorySlug)
      )?.categories?.find(cat => cat.slug === categorySlug)?.name || '';
      setSelectedCategory(category);
    }
  }, [categorySlug, products]);

  useEffect(() => {
    // Set initial search from URL params
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    // Filter products based on search, category, size, color, and price
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.categories?.some(cat => cat.name === selectedCategory)
      );
    }

    // Size filter
    if (selectedSize) {
      filtered = filtered.filter(product =>
        product.attributes?.some(attr => 
          attr.name === 'Size' && attr.options.includes(selectedSize)
        )
      );
    }

    // Color filter
    if (selectedColor) {
      filtered = filtered.filter(product =>
        product.attributes?.some(attr => 
          attr.name === 'Color' && attr.options.includes(selectedColor)
        )
      );
    }

    // Price filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'date-newest':
          return b.id - a.id; // Assuming higher ID = newer
        case 'date-oldest':
          return a.id - b.id;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchQuery, selectedCategory, selectedSize, selectedColor, priceRange, currentSort]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSize('');
    setSelectedColor('');
    setPriceRange({ min: 0, max: Infinity });
    setCurrentSort('name-asc');
  };

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
      <MockDataNotice />
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">All Products</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Stylish Variation Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <VariationFilters
            title="Category"
            options={categories.map(cat => ({ name: cat, value: cat }))}
            selectedValue={selectedCategory}
            onSelect={setSelectedCategory}
            onClear={() => setSelectedCategory('')}
          />
          
          {sizes.length > 0 && (
            <VariationFilters
              title="Size"
              options={sizes.map(size => ({ name: size, value: size }))}
              selectedValue={selectedSize}
              onSelect={setSelectedSize}
              onClear={() => setSelectedSize('')}
            />
          )}
          
          {colors.length > 0 && (
            <VariationFilters
              title="Color"
              options={colors.map(color => ({ name: color, value: color }))}
              selectedValue={selectedColor}
              onSelect={setSelectedColor}
              onClear={() => setSelectedColor('')}
            />
          )}
          
          {(selectedCategory || selectedSize || selectedColor) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
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
            totalProducts={filteredProducts.length}
          />

          {filteredProducts.length === 0 ? (
            searchQuery || selectedCategory || selectedSize || selectedColor || priceRange.max !== Infinity ? (
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
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
