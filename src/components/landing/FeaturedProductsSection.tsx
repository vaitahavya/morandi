'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { normalizeImagePath } from '@/lib/utils';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: Array<{ id: number; src: string; alt: string }>;
  category: string;
  slug?: string;
  featuredImage?: string;
  stockStatus?: string;
}

export default function FeaturedProductsSection() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/featured?limit=8');
        const data = await response.json();
        
        if (data.success) {
          setFeaturedProducts(data.data);
        } else {
          setError('Failed to load featured products');
        }
      } catch (err) {
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getProductImage = (product: FeaturedProduct) => {
    if (product.featuredImage) {
      return normalizeImagePath(product.featuredImage);
    }
    
    if (product.images && product.images.length > 0) {
      return normalizeImagePath(product.images[0].src);
    }
    
    return '/images/banners/hero-main.jpg'; // Fallback image
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-muted/50 via-background to-accent/20 relative overflow-hidden">
        <div className="section-container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="mb-4">
              Bestsellers
            </Badge>
            <h2 className="heading-lg text-foreground">
              Our Handpicked Favorites
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Carefully curated pieces that blend comfort, style, and sustainability for every stage of motherhood
            </p>
          </div>
          
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error || featuredProducts.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-br from-muted/50 via-background to-accent/20 relative overflow-hidden">
        <div className="section-container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="mb-4">
              Bestsellers
            </Badge>
            <h2 className="heading-lg text-foreground">
              Our Handpicked Favorites
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {error || 'No featured products available at the moment'}
            </p>
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" className="bg-clay-pink hover:bg-clay-pink/90 text-white shadow-lg px-12 py-6 text-lg rounded-xl">
              <Link href="/products">
                Shop All Products
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-spacing bg-gradient-to-br from-muted/50 via-background to-accent/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clay-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-soft-sage/10 rounded-full blur-3xl" />
      </div>
      
      <div className="section-container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            Bestsellers
          </Badge>
          <h2 className="heading-lg text-foreground">
            Our Handpicked Favorites
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Carefully curated pieces that blend comfort, style, and sustainability for every stage of motherhood
          </p>
          <div className="w-20 sm:w-24 h-1 bg-primary mx-auto rounded-full mt-4 sm:mt-6" />
        </div>
        
        {/* Products Grid - Auto-adjusting columns */}
        <div className="card-grid mb-8 sm:mb-12">
          {featuredProducts.map((product, index) => (
            <Card 
              key={product.id}
              className="group border-0 shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden hover:-translate-y-2 bg-card/80 backdrop-blur-sm min-w-0 w-full h-full flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Product Image */}
              <div className="relative aspect-square sm:h-72 lg:h-80 overflow-hidden bg-muted/30">
                <Image
                  src={getProductImage(product)}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex gap-1.5 sm:gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-white text-deep-charcoal hover:bg-white/90 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
                      asChild
                    >
                      <Link href={`/products/${product.slug || product.id}`}>
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Quick Add</span>
                        <span className="sm:hidden">Add</span>
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-deep-charcoal h-7 sm:h-9 w-7 sm:w-auto px-2 sm:px-3">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                  <Badge className="bg-clay-pink/90 text-white border-0 shadow-lg text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                    {product.category}
                  </Badge>
                </div>

                {/* Stock Status Badge */}
                {product.stockStatus === 'outofstock' && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                    <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <CardContent className="p-2.5 sm:p-4 lg:p-5 space-y-1.5 sm:space-y-3 min-w-0 w-full flex-grow flex flex-col">
                <div className="min-w-0 w-full">
                  <h3 className="font-serif font-semibold text-xs sm:text-base lg:text-lg mb-1 sm:mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2 min-w-0 break-words">
                    <Link href={`/products/${product.slug || product.id}`} className="hover:underline break-words">
                      {product.name}
                    </Link>
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-3 flex-wrap min-w-0 w-full">
                    {product.salePrice ? (
                      <>
                        <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-foreground truncate">
                          {formatPrice(product.salePrice)}
                        </p>
                        <p className="text-[10px] sm:text-base lg:text-lg text-muted-foreground line-through truncate">
                          {formatPrice(product.price)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-foreground truncate">
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* CTA Button */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-clay-pink hover:bg-clay-pink/90 text-white shadow-lg px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg rounded-xl">
            <Link href="/products">
              Shop All Products
            </Link>
          </Button>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-soft-sage/60' : 'bg-clay-pink/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
