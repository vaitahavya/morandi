'use client';

import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">My Wishlist</h1>
        </div>
        <EmptyState
          title="Your wishlist is empty"
          description="Start adding products to your wishlist to save them for later."
          icon="package"
          action={{
            label: 'Browse Products',
            onClick: () => window.location.href = '/products',
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearWishlist}
          className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Trash2 size={16} />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group relative rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
            {/* Image */}
            <div className="aspect-square w-full overflow-hidden rounded-t-lg relative">
              <Image
                src={item.image}
                alt={item.name}
                width={300}
                height={300}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Remove from wishlist button */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
                aria-label="Remove from wishlist"
              >
                <Heart size={16} className="fill-current" />
              </button>
            </div>

            {/* Product info */}
            <div className="p-4 space-y-3">
              <Link href={`/products/${item.slug}`}>
                <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary-700">
                  {item.name}
                </h3>
              </Link>
              
              <p className="text-lg font-semibold text-primary-700">₹{item.price}</p>
              
              <button
                onClick={() => handleAddToCart(item)}
                className="flex w-full items-center justify-center space-x-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 