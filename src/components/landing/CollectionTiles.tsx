'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Tile {
  title: string;
  image: string;
  slug: string;
}

const tiles: Tile[] = [
  {
    title: 'Maternity & Baby Care',
    image:
      'https://images.unsplash.com/photo-1581804928342-4e34039f4c25?auto=format&fit=crop&w=900&q=60',
    slug: 'maternity-baby-care',
  },
  {
    title: 'Hospital & Healthcare',
    image:
      'https://images.unsplash.com/photo-1530023367847-a683933f4175?auto=format&fit=crop&w=900&q=60',
    slug: 'hospital-healthcare-textiles',
  },
  {
    title: 'Home & Bedding',
    image:
      'https://images.unsplash.com/photo-1616627986113-3c98158e8b3c?auto=format&fit=crop&w=900&q=60',
    slug: 'home-bedding',
  },
  {
    title: 'Hospitality Solutions',
    image:
      'https://images.unsplash.com/photo-1600585154780-0253e3ae1115?auto=format&fit=crop&w=900&q=60',
    slug: 'hospitality-solutions',
  },
];

export default function CollectionTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold">Shop by Category</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.slug}
            href={`/products?category=${tile.slug}`}
            className="group relative block aspect-[4/5] overflow-hidden rounded-lg"
          >
            <Image
              src={tile.image}
              alt={tile.title}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30" />
            <span className="absolute inset-x-0 bottom-4 text-center text-lg font-semibold text-white drop-shadow-sm">
              {tile.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
