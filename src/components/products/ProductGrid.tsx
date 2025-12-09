'use client';

import ProductCard from './ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const filters = categorySlug ? { category: categorySlug } : {};
  const { data: productsData, isLoading, error } = useProducts(filters);
  const products = productsData?.data || [];

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
        <p className="text-red-600 mb-4 font-semibold">Failed to load products</p>
        <p className="text-gray-600 text-sm mb-2">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left max-w-2xl mx-auto">
          <p className="text-sm font-semibold mb-2">Troubleshooting:</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Check browser console (F12) for detailed error messages</li>
            <li>Verify the API endpoint is accessible: <code className="bg-gray-200 px-1 rounded">/api/products</code></li>
            <li>Ensure your development server is running</li>
            <li>Check server logs for backend errors</li>
            <li>Run diagnostic: <code className="bg-gray-200 px-1 rounded">npm run test-api</code></li>
          </ul>
        </div>
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
