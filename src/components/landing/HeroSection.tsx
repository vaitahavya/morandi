'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image with parallax effect */}
      <div className="absolute inset-0">
        <Image
          src="/images/banners/hero-main.jpg"
          alt="Maternity Wear - Where Every Mother Blooms"
          fill
          priority
          className="object-cover object-right scale-110 transition-transform duration-700 hover:scale-105"
        />
      </div>
      
      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-charcoal/70 via-deep-charcoal/50 to-transparent" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-clay-pink/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-soft-sage/20 rounded-full blur-3xl" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl md:max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Badge */}
            <Badge variant="secondary" className="glass px-4 py-2 text-sm font-medium border-none">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Maternity Collection 2025
            </Badge>
            
            {/* Main Heading */}
            <h1 className="heading-xl text-white leading-tight drop-shadow-2xl">
              Where Every Mother
              <span className="block text-clay-pink mt-2">Blooms</span>
            </h1>
            
            {/* Subtext */}
            <p className="text-xl md:text-2xl text-white/95 font-sans leading-relaxed max-w-2xl drop-shadow-lg">
              Comfortable maternity and baby apparel crafted for every stage. 
              <span className="block mt-2 text-lg text-white/80">
                Shop postpartum wear, babywear, and stylish women's wear you'll love to live in.
              </span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-clay-pink hover:bg-clay-pink/90 text-white shadow-2xl hover:shadow-clay-pink/50 transition-all duration-300 text-lg px-8 py-6 rounded-xl"
              >
                <Link href="/products">
                  Shop Maternity Wear
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="glass border-2 border-white/30 text-white hover:bg-white hover:text-deep-charcoal shadow-xl transition-all duration-300 text-lg px-8 py-6 rounded-xl"
              >
                <Link href="/products">
                  Explore Collections
                </Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-6 text-white/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-soft-sage rounded-full" />
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-clay-pink rounded-full" />
                <span className="text-sm font-medium">Sustainable Fabrics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-soft-sage rounded-full" />
                <span className="text-sm font-medium">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modern Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-white/70 text-xs font-medium tracking-wider uppercase">Scroll</span>
        <div className="animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/90" strokeWidth={2} />
        </div>
      </div>
    </section>
  );
}
