'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/wordpress-api';
import { useCartStore } from '@/store/cart-store';
import { ShoppingCart } from 'lucide-react';
import WishlistButton from './WishlistButton';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(0);

  const handleQuickBuy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // stay on the same page, don't follow the link
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      image: product.images[0]?.src || '',
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleMouseEnter = () => {
    // Show second image if available, otherwise keep first image
    if (product.images && product.images.length > 1) {
      setHoveredImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setHoveredImageIndex(0);
  };

  // Add a subtle zoom effect on hover
  const [isHovered, setIsHovered] = useState(false);

  const currentImage = product.images?.[hoveredImageIndex] || product.images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => {
        handleMouseEnter();
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        handleMouseLeave();
        setIsHovered(false);
      }}
    >
      {/* Image wrapper */}
      <div className="aspect-square w-full overflow-hidden relative">
        <Image
          src={currentImage?.src || '/placeholder.png'}
          alt={product.name}
          width={300}
          height={300}
          className={`h-full w-full object-cover transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Wishlist button */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton product={product} />
        </div>

        {/* Quick buy button - positioned at bottom right */}
        <button
          onClick={handleQuickBuy}
          className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
        >
          <ShoppingCart size={16} className="text-gray-700" />
        </button>

        {/* Add to Cart button - positioned at bottom left */}
        <button
          onClick={handleQuickBuy}
          className="absolute bottom-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-primary-600 text-white rounded-full px-3 py-2 text-xs font-medium shadow-lg hover:bg-primary-700"
        >
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 text-base font-medium text-gray-900">
          {product.name}
        </h3>
        <p className="text-lg font-semibold text-primary-700">₹{product.price}</p>
      </div>
    </Link>
  );
}
