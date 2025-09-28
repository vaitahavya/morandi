'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedProductsSection() {
  const featuredProducts = [
    {
      id: 1,
      name: "Maternity Kurta Set",
      price: "₹2,499",
      image: "/images/banners/hero-main.jpg", // Placeholder - replace with actual product images
      category: "Maternity Wear"
    },
    {
      id: 2,
      name: "Feeding Aprons",
      price: "₹1,299",
      image: "/images/banners/hero-main.jpg", // Placeholder - replace with actual product images
      category: "Feeding Essentials"
    },
    {
      id: 3,
      name: "Baby Sleeping Bag",
      price: "₹1,899",
      image: "/images/banners/hero-main.jpg", // Placeholder - replace with actual product images
      category: "Baby Products"
    },
    {
      id: 4,
      name: "Co-ord Lounge Set",
      price: "₹3,299",
      image: "/images/banners/hero-main.jpg", // Placeholder - replace with actual product images
      category: "Lounge Wear"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-earthy-beige/30 to-soft-sage/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
            Our Handpicked Favorites
          </h2>
          <p className="text-lg text-deep-charcoal/70 font-sans max-w-2xl mx-auto">
            Carefully curated pieces that blend comfort, style, and sustainability for every stage of motherhood
          </p>
          <div className="w-24 h-1 bg-clay-pink mx-auto rounded-full mt-6"></div>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              className="group bg-morandi-white rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden hover:transform hover:scale-105"
            >
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-clay-pink/90 text-morandi-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-serif font-semibold mb-2 text-deep-charcoal group-hover:text-clay-pink transition-colors">
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-deep-charcoal mb-4">
                  {product.price}
                </p>
                
                {/* Quick Add Button */}
                <button className="w-full bg-soft-sage text-deep-charcoal py-2 px-4 rounded-xl font-medium hover:bg-soft-sage/80 transition-colors">
                  Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Button */}
        <div className="text-center">
          <Link href="/products" className="btn-primary inline-block">
            Shop All Products
          </Link>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-16 flex justify-center space-x-8">
          <div className="w-2 h-2 rounded-full bg-clay-pink/40"></div>
          <div className="w-2 h-2 rounded-full bg-soft-sage/60"></div>
          <div className="w-2 h-2 rounded-full bg-clay-pink/40"></div>
          <div className="w-2 h-2 rounded-full bg-soft-sage/60"></div>
          <div className="w-2 h-2 rounded-full bg-clay-pink/40"></div>
        </div>
      </div>
    </section>
  );
}
