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

  // Get subtle color variation for card identification
  const getCardColorVariant = (index: number) => {
    const variants = [
      'bg-clay-pink/8 border-clay-pink/20', // Clay pink tint
      'bg-soft-sage/8 border-soft-sage/20', // Soft sage tint
      'bg-amber-200/8 border-amber-200/20', // Warm amber tint
      'bg-rose-200/8 border-rose-200/20', // Rose tint
      'bg-teal-200/8 border-teal-200/20', // Teal tint
      'bg-violet-200/8 border-violet-200/20', // Violet tint
    ];
    return variants[index % variants.length];
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
    <section className="section-spacing bg-background relative overflow-hidden w-full">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-accent/20" />
      
      <div className="section-container relative z-10 w-full max-w-full">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4 w-full">
          <h2 className="heading-lg text-foreground px-2">
            Our Products
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Discover our carefully curated collections designed for every stage of motherhood
          </p>
          <div className="w-16 sm:w-20 lg:w-24 h-0.5 sm:h-1 bg-primary mx-auto rounded-full mt-3 sm:mt-4 lg:mt-6" />
        </div>
        
        {/* Categories Grid - Responsive 3-column on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 w-full">
          {categories.map((category, index) => (
            <Link 
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group block min-w-0 w-full"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className={`overflow-hidden border shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-2 ${getCardColorVariant(index)} backdrop-blur-sm min-w-0 w-full flex flex-col`}>
                {/* Category Image */}
                <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] w-full overflow-hidden flex-shrink-0">
                  <Image
                    src={getCategoryImage(category)}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Modern Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Category Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-6 min-w-0 w-full">
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-serif font-bold text-white mb-2 sm:mb-2 lg:mb-2 transform group-hover:translate-y-0 transition-transform min-w-0 break-words line-clamp-2 leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-white/90 font-sans text-xs sm:text-sm lg:text-base mb-3 sm:mb-3 lg:mb-4 opacity-90 group-hover:opacity-100 transition-opacity line-clamp-2 min-w-0 break-words leading-snug">
                      {category.description || `Explore ${category.name.toLowerCase()} for every stage of motherhood`}
                    </p>
                    
                    {/* Shop Now Button */}
                    <div className="flex items-center text-white font-medium text-xs sm:text-sm lg:text-base group-hover:text-clay-pink transition-colors">
                      <span className="mr-2">Shop Now</span>
                      <ArrowRight className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* View All Categories CTA */}
        <div className="mt-6 sm:mt-8 lg:mt-12 text-center w-full">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg rounded-xl w-full sm:w-auto"
          >
            <Link href="/products">
              View All Categories
            </Link>
          </Button>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-8 sm:mt-12 lg:mt-16 flex justify-center items-center gap-3 sm:gap-4">
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
