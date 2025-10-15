'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image covering full section */}
      <div className="absolute inset-0 -right-[5%] sm:-right-[8%] md:-right-[10%] lg:-right-[12%]">
        <Image
          src="/images/banners/hero-main.jpg"
          alt="Maternity Wear - Where Every Mother Blooms"
          fill
          priority
          className="object-cover object-[70%] sm:object-[75%] md:object-[78%] lg:object-[80%] scale-110 transition-transform duration-700 hover:scale-105"
        />
      </div>
      
      {/* Gradient Overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-800/65 to-transparent" />
      
      {/* Split Layout for Content Only */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 h-full">
            {/* Left Section - Text Content (2/3 width) */}
            <div className="col-span-2 flex items-center">
              <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
                {/* Premium Badge */}
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm border-none text-white px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Premium Maternity Collection 2025
                </Badge>
                
                {/* Main Heading */}
                <h1 className="heading-xl text-white leading-tight drop-shadow-2xl text-left">
                  Maternity Wear – Where Every Mother Blooms
                </h1>
                
                {/* Subtext */}
                <p className="text-xl md:text-2xl text-white font-sans leading-relaxed drop-shadow-lg text-left">
                  Comfortable maternity and baby apparel crafted for every stage. Shop postpartum wear, babywear, and stylish women's wear you'll love to live in.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-clay-pink hover:bg-clay-pink/90 text-white shadow-2xl hover:shadow-clay-pink/50 transition-all duration-300 text-lg px-8 py-6 rounded-xl border-0"
                  >
                    <Link href="/products">
                      Shop Maternity Wear
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-amber-200 text-amber-200 hover:bg-amber-200 hover:text-gray-800 shadow-xl transition-all duration-300 text-lg px-8 py-6 rounded-xl bg-transparent"
                  >
                    <Link href="/products">
                      Explore Collections
                    </Link>
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 pt-6 text-white/90">
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
            
            {/* Right Section - Empty space for image visibility (1/3 width) */}
            <div className="col-span-1">
              {/* This space is intentionally left empty to show the background image */}
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
