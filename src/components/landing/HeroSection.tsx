'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/banners/hero-main.jpg"
        alt="Maternity Wear - Where Every Mother Blooms"
        fill
        priority
        className="object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal/60 via-deep-charcoal/40 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Tagline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 text-morandi-white leading-tight">
              Maternity Wear – Where Every Mother Blooms
            </h1>
            
            {/* Subtext */}
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-morandi-white/90 font-sans leading-relaxed max-w-xl">
              Comfortable maternity and baby apparel crafted for every stage. Shop postpartum wear, babywear, and stylish women's wear you'll love to live in.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary text-center">
                Shop Maternity Wear
              </Link>
              <Link href="/products" className="btn-outline text-center border-morandi-white text-morandi-white hover:bg-morandi-white hover:text-deep-charcoal">
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-morandi-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
