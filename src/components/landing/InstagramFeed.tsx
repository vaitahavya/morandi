'use client';

import Image from 'next/image';

const instagramPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1581804928342-4e34039f4c25?auto=format&fit=crop&w=400&q=60',
    alt: 'Baby care products',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1616627986113-3c98158e8b3c?auto=format&fit=crop&w=400&q=60',
    alt: 'Home bedding collection',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600585154780-0253e3ae1115?auto=format&fit=crop&w=400&q=60',
    alt: 'Hospitality solutions',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1530023367847-a683933f4175?auto=format&fit=crop&w=400&q=60',
    alt: 'Healthcare textiles',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=60',
    alt: 'Lifestyle products',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=60',
    alt: 'Home décor',
  },
];

export default function InstagramFeed() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Follow us on Instagram</h2>
        <p className="mb-8 text-gray-600">@morandilifestyle</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {instagramPosts.map((post) => (
          <div key={post.id} className="aspect-square overflow-hidden rounded-lg">
            <Image
              src={post.image}
              alt={post.alt}
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
} 