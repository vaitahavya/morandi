'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SecondHero() {
  return (
    <section className="relative h-[75vh] w-full">
      <Image
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
        alt="Second hero banner"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold tracking-wide mb-4">
            Summer Collection
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover our latest arrivals with premium quality and timeless design
          </p>
          <Link 
            href="/products" 
            className="inline-block bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
} 