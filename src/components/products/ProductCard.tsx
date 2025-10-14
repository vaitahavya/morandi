'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/products-api';
import { useCartStore } from '@/store/cart-store';
import { ShoppingCart, Eye } from 'lucide-react';
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

  const currentImage = product.images?.[hoveredImageIndex]?.src || product.images?.[0]?.src || product.featuredImage;
  const hasDiscount = product.salePrice && product.regularPrice && product.salePrice < product.regularPrice;
  const discountPercent = hasDiscount && product.regularPrice && product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  return (
    <Card
      className="group relative overflow-hidden border-0 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-1 bg-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image wrapper */}
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
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-destructive text-destructive-foreground border-0 shadow-lg">
                {discountPercent}% OFF
              </Badge>
            </div>
          )}

          {/* Wishlist button */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton product={product} />
          </div>

          {/* Hover Overlay with Actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <Button
                size="sm"
                onClick={handleQuickBuy}
                className="flex-1 bg-clay-pink hover:bg-clay-pink/90 text-white shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="px-3"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <CardContent className="p-4 space-y-2">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-primary">
              ₹{product.salePrice || product.price}
            </p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{product.regularPrice}
              </p>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
