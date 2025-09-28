'use client';

import Image from 'next/image';

export default function SustainabilityBanner() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/banners/hero-main.jpg"
          alt="Sustainability at Morandi Lifestyle"
          fill
          className="object-cover"
        />
        {/* Stronger Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal/85 via-deep-charcoal/80 to-deep-charcoal/75"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Text */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 text-morandi-white drop-shadow-lg">
            Morandi Lifestyle – 100% Natural Fiber Products
          </h2>
          
          <p className="text-lg md:text-xl text-morandi-white font-sans leading-relaxed mb-8 drop-shadow-md">
            Ensuring purity and sustainability from sourcing to delivery.
          </p>
          
          {/* Sustainability Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-morandi-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-morandi-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-serif font-semibold text-morandi-white mb-2 drop-shadow-md">
                Eco-Friendly
              </h3>
              <p className="text-morandi-white text-sm drop-shadow-sm">
                Sustainable materials and processes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-morandi-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-morandi-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-serif font-semibold text-morandi-white mb-2 drop-shadow-md">
                Quality Assured
              </h3>
              <p className="text-morandi-white text-sm drop-shadow-sm">
                Rigorous testing and standards
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-morandi-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-morandi-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-serif font-semibold text-morandi-white mb-2 drop-shadow-md">
                Fast Delivery
              </h3>
              <p className="text-morandi-white text-sm drop-shadow-sm">
                Quick and reliable shipping
              </p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-12">
            <button className="bg-morandi-white text-deep-charcoal px-8 py-3 rounded-xl font-medium hover:bg-morandi-white/90 transition-all duration-300 shadow-card">
              Learn More About Our Mission
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-morandi-white/10"></div>
      <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-morandi-white/10"></div>
      <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full bg-morandi-white/10"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-morandi-white/10"></div>
    </section>
  );
}
