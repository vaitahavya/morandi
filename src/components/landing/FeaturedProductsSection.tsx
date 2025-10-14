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
        console.error('Error fetching featured products:', err);
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
    <section className="py-24 bg-gradient-to-br from-muted/50 via-background to-accent/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clay-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-soft-sage/10 rounded-full blur-3xl" />
      </div>
      
      <div className="section-container relative z-10">
        {/* Section Header */}
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
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-6" />
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product, index) => (
            <Card 
              key={product.id}
              className="group border-0 shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden hover:-translate-y-2 bg-card/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Product Image */}
              <div className="relative h-80 overflow-hidden bg-muted/30">
                <Image
                  src={getProductImage(product)}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-white text-deep-charcoal hover:bg-white/90"
                      asChild
                    >
                      <Link href={`/products/${product.slug || product.id}`}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Quick Add
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-deep-charcoal">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-clay-pink/90 text-white border-0 shadow-lg">
                    {product.category}
                  </Badge>
                </div>

                {/* Stock Status Badge */}
                {product.stockStatus === 'outofstock' && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <CardContent className="p-5 space-y-3">
                <div>
                  <h3 className="font-serif font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    <Link href={`/products/${product.slug || product.id}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    {product.salePrice ? (
                      <>
                        <p className="text-2xl font-bold text-foreground">
                          {formatPrice(product.salePrice)}
                        </p>
                        <p className="text-lg text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-foreground">
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
          <Button asChild size="lg" className="bg-clay-pink hover:bg-clay-pink/90 text-white shadow-lg px-12 py-6 text-lg rounded-xl">
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
