'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product, getProducts } from '@/lib/wordpress-api';
import { useSearchParams } from 'next/navigation';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');

  useEffect(() => {
    (async () => {
      const data = await getProducts();
      // If a category filter is requested, filter client-side by WP category slug
      const filtered = categorySlug
        ? data.filter((p) =>
            p.categories?.some((cat) => cat.slug === categorySlug)
          )
        : data;
      setProducts(filtered);
      setLoading(false);
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
