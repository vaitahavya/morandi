'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function CategorySection() {
  const categories = [
    {
      id: 1,
      name: "Baby Products",
      description: "Comfortable baby clothing and essentials",
      image: "/images/banners/hero-main.jpg", // Placeholder - replace with actual category images
      href: "/products?category=baby"
    },
    {
      id: 2,
      name: "Home Bedding",
      description: "Neutral and cozy bedding sets",
      image: "/images/banners/hero-main.jpg", // Placeholder - replace with actual category images
      href: "/products?category=bedding"
    },
    {
      id: 3,
      name: "Feeding Aprons",
      description: "Practical and stylish feeding essentials",
      image: "/images/banners/hero-main.jpg", // Placeholder - replace with actual category images
      href: "/products?category=feeding"
    }
  ];

  return (
    <section className="py-20 bg-morandi-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
            Our Products
          </h2>
          <p className="text-lg text-deep-charcoal/70 font-sans max-w-2xl mx-auto">
            Discover our carefully curated collections designed for every stage of motherhood
          </p>
          <div className="w-24 h-1 bg-clay-pink mx-auto rounded-full mt-6"></div>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={category.href}
              className="group block"
            >
              <div className="bg-gradient-to-br from-earthy-beige/20 to-soft-sage/20 rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:transform hover:scale-105">
                {/* Category Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal/60 via-transparent to-transparent"></div>
                  
                  {/* Category Name Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-serif font-bold text-morandi-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-morandi-white/90 font-sans">
                      {category.description}
                    </p>
                  </div>
                </div>
                
                {/* Shop Now Button */}
                <div className="p-6 text-center">
                  <span className="inline-flex items-center text-clay-pink font-medium group-hover:text-soft-sage transition-colors">
                    Shop Now
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* View All Categories CTA */}
        <div className="mt-12 text-center">
          <Link href="/products" className="btn-outline">
            View All Categories
          </Link>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center items-center space-x-6">
          <div className="w-16 h-16 rounded-full bg-clay-pink/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-clay-pink/30"></div>
          </div>
          <div className="w-20 h-20 rounded-full bg-soft-sage/20 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-soft-sage/40"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-clay-pink/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-clay-pink/30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
