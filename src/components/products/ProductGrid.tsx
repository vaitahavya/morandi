'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product, getProducts } from '@/lib/products-api';
import { useSearchParams } from 'next/navigation';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');

  useEffect(() => {
    (async () => {
      try {
        // Use the new native API with improved filtering
        const filters = categorySlug ? { category: categorySlug } : {};
        console.log('Loading products with filters:', filters);
        const data = await getProducts(filters);
        console.log('Products loaded:', data);
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    })();
  }, [categorySlug]);

  if (loading) {
    return <div className="py-10 text-center">Loading products...</div>;
  }

  if (!products.length) {
    return <div className="py-10 text-center">No products found.</div>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
