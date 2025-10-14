'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export default function FeaturedProductsSection() {
  const featuredProducts = [
    {
      id: 1,
      name: "Maternity Kurta Set",
      price: "₹2,499",
      image: "/images/banners/hero-main.jpg",
      category: "Maternity Wear",
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      name: "Feeding Aprons",
      price: "₹1,299",
      image: "/images/banners/hero-main.jpg",
      category: "Feeding Essentials",
      rating: 4.9,
      reviews: 89
    },
    {
      id: 3,
      name: "Baby Sleeping Bag",
      price: "₹1,899",
      image: "/images/banners/hero-main.jpg",
      category: "Baby Products",
      rating: 4.7,
      reviews: 156
    },
    {
      id: 4,
      name: "Co-ord Lounge Set",
      price: "₹3,299",
      image: "/images/banners/hero-main.jpg",
      category: "Lounge Wear",
      rating: 4.9,
      reviews: 203
    }
  ];

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
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <Button size="sm" className="flex-1 bg-white text-deep-charcoal hover:bg-white/90">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Quick Add
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
              </div>
              
              {/* Product Info */}
              <CardContent className="p-5 space-y-3">
                <div>
                  <h3 className="font-serif font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium text-foreground">{product.rating}</span>
                    </div>
                    <span className="text-muted-foreground">({product.reviews})</span>
                  </div>
                  
                  <p className="text-2xl font-bold text-foreground">
                    {product.price}
                  </p>
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
