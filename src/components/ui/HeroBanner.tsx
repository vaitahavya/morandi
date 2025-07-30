'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './button';
import { getHeroImage, HeroImage } from '@/lib/hero-images';

interface HeroBannerProps {
  heroId?: string;
  heroImage?: HeroImage;
  className?: string;
  height?: string;
}

export function HeroBanner({ 
  heroId, 
  heroImage, 
  className = '',
  height = 'h-96'
}: HeroBannerProps) {
  // Get hero image by ID or use provided image
  const image = heroImage || (heroId ? getHeroImage(heroId) : null);
  
  if (!image) {
    return (
      <div className={`${height} ${className} bg-gray-200 flex items-center justify-center`}>
        <p className="text-gray-500">Hero image not found</p>
      </div>
    );
  }

  return (
    <div className={`relative ${height} ${className} overflow-hidden`}>
      {/* Background Image */}
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        priority={image.priority}
        sizes="100vw"
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
        <div className="max-w-4xl">
          {image.title && (
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
              {image.title}
            </h1>
          )}
          
          {image.subtitle && (
            <p className="text-lg md:text-xl mb-8 text-white font-medium leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
              {image.subtitle}
            </p>
          )}
          
          {image.ctaText && image.ctaLink && (
            <Link href={image.ctaLink}>
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3 text-lg shadow-lg">
                {image.ctaText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Preset hero banners
export function MainHeroBanner({ className }: { className?: string }) {
  return <HeroBanner heroId="hero-main" className={className} height="h-screen" />;
}

export function SaleHeroBanner({ className }: { className?: string }) {
  return <HeroBanner heroId="hero-sale" className={className} height="h-80" />;
}

export function NewArrivalHeroBanner({ className }: { className?: string }) {
  return <HeroBanner heroId="hero-new-arrival" className={className} height="h-80" />;
}
