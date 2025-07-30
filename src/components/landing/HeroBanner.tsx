'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroBanner() {
  return (
    <section className="relative h-screen w-full">
      <Image
        src="/images/banners/hero-main.jpg"
        alt="Maternity Wear - Where Every Mother Blooms"
        fill
        priority
        className="object-cover"
      />
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center md:justify-start px-4 md:px-0">
        <div className="w-full md:w-1/2 flex justify-center text-center md:text-left">
          <div className="max-w-lg md:max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
              Maternity Wear – Where Every Mother Blooms
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white font-medium leading-relaxed drop-shadow-lg">
              Comfortable maternity and baby apparel crafted for every stage. Shop postpartum wear, babywear, and stylish women's wear you'll love to live in.
            </p>
            
            <Link href="/products">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3 text-lg shadow-lg">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
