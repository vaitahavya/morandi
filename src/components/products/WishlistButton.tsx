'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore, WishlistItem } from '@/store/wishlist-store';
import { Product } from '@/lib/products-api';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export default function WishlistButton({ product, className = '' }: WishlistButtonProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeItem(product.id);
    } else {
      const wishlistItem: WishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.src || '',
        slug: product.slug,
      };
      addItem(wishlistItem);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`flex items-center justify-center rounded-full p-2 transition-colors ${
        isWishlisted
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white text-gray-600 hover:text-red-500 hover:bg-gray-50'
      } ${className}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={20}
        className={`transition-all ${
          isWishlisted ? 'fill-current' : 'hover:scale-110'
        }`}
      />
    </button>
  );
} 