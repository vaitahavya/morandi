'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function CollectionsPage() {
  const collections = [
    {
      id: 1,
      name: "Baby Products",
      description: "Comfortable baby clothing and essentials",
      image: "/images/banners/pexels-lucasmendesph-3094441.jpg", // Using the same image as shown in the design
      href: "/products?category=baby"
    },
    {
      id: 2,
      name: "Home Bedding",
      description: "Neutral and cozy bedding sets",
      image: "/images/banners/pexels-lucasmendesph-3094441.jpg", // Using the same image as shown in the design
      href: "/products?category=bedding"
    },
    {
      id: 3,
      name: "Feeding Aprons",
      description: "Practical and stylish feeding essentials",
      image: "/images/banners/pexels-lucasmendesph-3094441.jpg", // Using the same image as shown in the design
      href: "/products?category=feeding"
    }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/banners/pexels-lucasmendesph-3094441.jpg"
          alt="Collections - Morandi Lifestyle"
          fill
          priority
          className="object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal/70 via-deep-charcoal/50 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 text-morandi-white leading-tight">
                Our Collections
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl lg:text-2xl mb-8 text-morandi-white/90 font-sans leading-relaxed max-w-2xl">
                Discover our carefully curated collections designed for every stage of motherhood and home comfort
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-20 bg-morandi-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
              Explore Our Collections
            </h2>
            <p className="text-lg text-deep-charcoal/70 font-sans max-w-2xl mx-auto">
              Each collection is thoughtfully designed to bring comfort, style, and joy to your everyday moments
            </p>
            <div className="w-24 h-1 bg-clay-pink mx-auto rounded-full mt-6"></div>
          </div>
          
          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {collections.map((collection) => (
              <Link 
                key={collection.id}
                href={collection.href}
                className="group block"
              >
                <div className="bg-morandi-white rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 hover:transform hover:scale-105">
                  {/* Collection Image */}
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal/60 via-transparent to-transparent"></div>
                    
                    {/* Collection Name Overlay */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-morandi-white mb-2">
                        {collection.name}
                      </h3>
                      <p className="text-morandi-white/90 font-sans text-sm md:text-base">
                        {collection.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Shop Now Button */}
                  <div className="p-6 text-center bg-gradient-to-br from-earthy-beige/30 to-soft-sage/20">
                    <span className="inline-flex items-center text-clay-pink font-medium group-hover:text-soft-sage transition-colors text-sm md:text-base">
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
          
          {/* View All Products CTA */}
          <div className="mt-16 text-center">
            <Link href="/products" className="btn-outline">
              View All Products
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

      {/* Storytelling Section */}
      <section className="py-20 bg-gradient-to-br from-earthy-beige to-soft-sage/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Section Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-8 text-deep-charcoal">
              Crafted with Love
            </h2>
            
            {/* Story Content */}
            <div className="space-y-6 text-lg md:text-xl text-deep-charcoal/80 font-sans leading-relaxed">
              <p className="font-medium">
                Every collection tells a story of comfort, care, and beautiful moments.
              </p>
              
              <p>
                From the first tender moments of motherhood to the peaceful comfort of home, 
                our collections are designed to enhance your journey. Each piece is carefully 
                selected and crafted to bring joy, comfort, and style to your everyday life.
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="mt-12 flex justify-center items-center space-x-8">
              {/* Heart Icon */}
              <div className="w-16 h-16 rounded-full bg-clay-pink/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-clay-pink" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
                </svg>
              </div>
              
              {/* Home Icon */}
              <div className="w-16 h-16 rounded-full bg-soft-sage/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-soft-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              
              {/* Star Icon */}
              <div className="w-16 h-16 rounded-full bg-clay-pink/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-clay-pink" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
