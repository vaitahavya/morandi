'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';
import { normalizeImagePath } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  isVisible: boolean;
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories?onlyVisible=true&includeProductCount=true&flat=true');
        const data = await response.json();
        
        if (data.success) {
          // Show all visible categories, limit to 6 for display
          // Categories will show even if they have 0 products
          const visibleCategories = data.data
            .slice(0, 6);
          setCategories(visibleCategories);
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryImage = (category: Category) => {
    if (category.image) {
      return normalizeImagePath(category.image);
    }
    
    // Use category-specific images if available
    const categoryImages: Record<string, string> = {
      'baby': '/images/categories/category-baby.svg',
      'baby-products': '/images/categories/category-baby.svg',
      'bedding': '/images/categories/category-bedding.svg',
      'home-bedding': '/images/categories/category-bedding.svg',
      'feeding': '/images/categories/category-feeding.svg',
      'feeding-essentials': '/images/categories/category-feeding.svg',
      'maternity': '/images/categories/category-maternity.svg',
      'maternity-wear': '/images/categories/category-maternity.svg',
      'postpartum': '/images/categories/category-postpartum.svg',
      'postpartum-care': '/images/categories/category-postpartum.svg',
      'women': '/images/categories/category-women.svg',
      'lounge-wear': '/images/categories/category-women.svg',
    };
    
    return categoryImages[category.slug] || '/images/banners/hero-main.jpg';
  };

  if (loading) {
    return (
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-accent/20" />
        
        <div className="section-container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="heading-lg text-foreground">
              Our Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our carefully curated collections designed for every stage of motherhood
            </p>
          </div>
          
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return (
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-accent/20" />
        
        <div className="section-container relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="heading-lg text-foreground">
              Our Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {error || 'No categories available at the moment'}
            </p>
          </div>
          
          <div className="text-center">
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-12 py-6 text-lg rounded-xl"
            >
              <Link href="/products">
                View All Categories
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-accent/20" />
      
      <div className="section-container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="heading-lg text-foreground">
            Our Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover our carefully curated collections designed for every stage of motherhood
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-6" />
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link 
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group block"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className="overflow-hidden border-0 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-2 bg-card/80 backdrop-blur-sm">
                {/* Category Image */}
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={getCategoryImage(category)}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Modern Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Category Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-3xl font-serif font-bold text-white mb-2 transform group-hover:translate-y-0 transition-transform">
                      {category.name}
                    </h3>
                    <p className="text-white/90 font-sans mb-2 opacity-90 group-hover:opacity-100 transition-opacity">
                      {category.description || `Explore ${category.name.toLowerCase()} for every stage of motherhood`}
                    </p>
                    
                    {/* Product Count */}
                    {category.productCount && (
                      <p className="text-white/70 text-sm mb-4">
                        {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                      </p>
                    )}
                    
                    {/* Shop Now Button */}
                    <div className="flex items-center text-white font-medium group-hover:text-clay-pink transition-colors">
                      <span className="mr-2">Shop Now</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* View All Categories CTA */}
        <div className="mt-12 text-center">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-12 py-6 text-lg rounded-xl"
          >
            <Link href="/products">
              View All Categories
            </Link>
          </Button>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center items-center gap-4">
          {[16, 20, 16].map((size, i) => (
            <div 
              key={i} 
              className={`rounded-full ${i === 1 ? 'bg-soft-sage/20' : 'bg-clay-pink/10'} flex items-center justify-center transition-transform hover:scale-110`}
              style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
            >
              <div 
                className={`rounded-full ${i === 1 ? 'bg-soft-sage/40' : 'bg-clay-pink/30'}`}
                style={{ width: `${size * 2}px`, height: `${size * 2}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
