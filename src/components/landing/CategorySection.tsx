'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function CategorySection() {
  const categories = [
    {
      id: 1,
      name: "Baby Products",
      description: "Comfortable baby clothing and essentials",
      image: "/images/banners/hero-main.jpg",
      href: "/products?category=baby"
    },
    {
      id: 2,
      name: "Home Bedding",
      description: "Neutral and cozy bedding sets",
      image: "/images/banners/hero-main.jpg",
      href: "/products?category=bedding"
    },
    {
      id: 3,
      name: "Feeding Aprons",
      description: "Practical and stylish feeding essentials",
      image: "/images/banners/hero-main.jpg",
      href: "/products?category=feeding"
    }
  ];

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
              href={category.href}
              className="group block"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className="overflow-hidden border-0 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-2 bg-card/80 backdrop-blur-sm">
                {/* Category Image */}
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={category.image}
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
                    <p className="text-white/90 font-sans mb-4 opacity-90 group-hover:opacity-100 transition-opacity">
                      {category.description}
                    </p>
                    
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
