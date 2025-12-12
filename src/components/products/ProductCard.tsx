'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/products-api';
import { useCartStore } from '@/store/cart-store';
import { ShoppingCart } from 'lucide-react';
import WishlistButton from './WishlistButton';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickBuy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: typeof product.price === 'number' ? product.price : parseFloat(product.price),
      quantity: 1,
      image: product.images?.[0]?.src || product.featuredImage || '',
    });
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '12px',
        background: '#D6A8A0',
        color: '#fff',
      },
    });
  };

  const handleMouseEnter = () => {
    if (product.images && product.images.length > 1) {
      setHoveredImageIndex(1);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setHoveredImageIndex(0);
    setIsHovered(false);
  };

  // Safely extract image with validation
  const getValidImageSrc = (img: any): string | null => {
    if (!img) return null;
    const src = typeof img === 'string' ? img : img?.src;
    if (!src || typeof src !== 'string' || src.trim() === '' || src === '[') {
      return null;
    }
    return src;
  };

  const currentImage = 
    getValidImageSrc(product.images?.[hoveredImageIndex]) ||
    getValidImageSrc(product.images?.[0]) ||
    (product.featuredImage && typeof product.featuredImage === 'string' && product.featuredImage !== '[' ? product.featuredImage : null) ||
    '/placeholder.svg';
  const hasDiscount = product.salePrice && product.regularPrice && product.salePrice < product.regularPrice;
  const discountPercent = hasDiscount && product.regularPrice && product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  return (
    <Card
      className="group relative overflow-hidden border-0 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-1 bg-card h-full flex flex-col min-w-0 w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full min-w-0 w-full">
        {/* Image wrapper - Consistent aspect ratio */}
        <div className="aspect-square w-full overflow-hidden relative bg-muted/20">
          <Image
            src={currentImage || '/placeholder.svg'}
            alt={product.images?.[hoveredImageIndex]?.alt || product.images?.[0]?.alt || product.name}
            fill
            className={`object-cover transition-all duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
              <Badge className="bg-destructive text-destructive-foreground border-0 shadow-lg text-xs px-1.5 py-0.5 sm:text-sm sm:px-2 sm:py-1">
                {discountPercent}% OFF
              </Badge>
            </div>
          )}

          {/* Wishlist button */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            <WishlistButton product={product} />
          </div>

          {/* Hover Overlay with Actions - Hidden on mobile, shown on hover for desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                size="sm"
                onClick={handleQuickBuy}
                className="w-full bg-clay-pink hover:bg-clay-pink/90 text-white shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <CardContent className="p-3 sm:p-4 lg:p-5 space-y-1.5 sm:space-y-2 flex-grow flex flex-col min-w-0 w-full">
          <h3 className="line-clamp-2 text-sm sm:text-base lg:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug flex-grow min-w-0 break-words">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap min-w-0 w-full">
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-primary truncate">
              ₹{product.salePrice || product.price}
            </p>
            {hasDiscount && (
              <p className="text-xs sm:text-sm text-muted-foreground line-through truncate">
                ₹{product.regularPrice}
              </p>
            )}
          </div>
        </CardContent>
      </Link>
      
      {/* Quick add button for mobile - Outside Link to prevent navigation */}
      <div className="p-3 sm:p-4 lg:p-5 pt-0 sm:hidden">
        <Button
          size="sm"
          onClick={handleQuickBuy}
          className="w-full bg-clay-pink hover:bg-clay-pink/90 text-white text-sm min-w-0"
        >
          <ShoppingCart className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Add to Cart</span>
        </Button>
      </div>
    </Card>
  );
}
