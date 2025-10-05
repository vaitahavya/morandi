'use client';

import ProductCard from './ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const filters = categorySlug ? { category: categorySlug } : {};
  const { data: products = [], isLoading, error } = useProducts(filters);

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-600 mb-4">Failed to load products</p>
        <p className="text-gray-600 text-sm">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-600">No products found.</p>
        {categorySlug && (
          <p className="text-gray-500 text-sm mt-2">
            Try browsing other categories or check back later.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
