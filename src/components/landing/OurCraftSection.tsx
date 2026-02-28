'use client';

import Image from 'next/image';

const craftItems = [
  {
    src: '/images/our-craft/embroidery.png',
    alt: 'Craftsmanship at our embroidery unit – intricate work and quality',
    title: 'Craftsmanship in Every Stitch',
    description:
      'Our artisans work alongside precision machinery to create unique, embroidered textiles with care and attention to detail.',
  },
  {
    src: '/images/our-craft/factory-floor.png',
    alt: 'Our production floor – skilled hands behind every piece',
    title: 'Where It All Comes Together',
    description:
      'A dedicated team brings together tradition and modern production, ensuring every piece meets our standards before it reaches you.',
  },
  {
    src: '/images/our-craft/textile-process.png',
    alt: 'Hands-on quality in our textile process',
    title: 'Handpicked Quality',
    description:
      'We focus on the process behind the product – from fabric to finish – so you receive only what we stand behind.',
  },
];

export default function OurCraftSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="section-container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-deep-charcoal mb-4">
            Handpicked with Care
          </h2>
          <p className="text-lg text-deep-charcoal/70 max-w-2xl mx-auto">
            We don’t just make products – we craft them. Here’s a glimpse of the people and process behind what we do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {craftItems.map((item, index) => (
            <div
              key={index}
              className="group rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-semibold text-deep-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-deep-charcoal/70 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
