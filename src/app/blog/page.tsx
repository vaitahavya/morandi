import Link from 'next/link';
import Image from 'next/image';

const blogPosts = [
  {
    id: 1,
    title: 'Creating the Perfect Nursery: A Complete Guide',
    excerpt: 'Designing a nursery that\'s both beautiful and functional requires careful planning. From choosing the right colors to selecting safe furniture, here\'s everything you need to know.',
    image: 'https://images.unsplash.com/photo-1581804928342-4e34039f4c25?auto=format&fit=crop&w=600&q=60',
    date: '2024-01-15',
    category: 'Baby Care',
    slug: 'creating-perfect-nursery-guide',
  },
  {
    id: 2,
    title: 'The Benefits of Organic Cotton in Baby Products',
    excerpt: 'Why choosing organic cotton for your baby\'s clothing and bedding is not just a trend, but a smart choice for their health and comfort.',
    image: 'https://images.unsplash.com/photo-1616627986113-3c98158e8b3c?auto=format&fit=crop&w=600&q=60',
    date: '2024-01-10',
    category: 'Materials',
    slug: 'benefits-organic-cotton-baby-products',
  },
  {
    id: 3,
    title: 'Hospital Bedding: Comfort Meets Hygiene',
    excerpt: 'How modern hospital textiles are designed to provide both comfort for patients and maintain the highest standards of hygiene and durability.',
    image: 'https://images.unsplash.com/photo-1530023367847-a683933f4175?auto=format&fit=crop&w=600&q=60',
    date: '2024-01-05',
    category: 'Healthcare',
    slug: 'hospital-bedding-comfort-hygiene',
  },
  {
    id: 4,
    title: 'Luxury Bedding for Hotels: What Makes the Difference',
    excerpt: 'Discover the key elements that transform ordinary hotel bedding into a luxurious experience that guests remember long after their stay.',
    image: 'https://images.unsplash.com/photo-1600585154780-0253e3ae1115?auto=format&fit=crop&w=600&q=60',
    date: '2023-12-28',
    category: 'Hospitality',
    slug: 'luxury-bedding-hotels-difference',
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="mb-4 text-4xl font-bold">Blog</h1>
        <p className="text-lg text-gray-600">
          Insights, tips, and stories from the world of lifestyle and care products
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/blog/${post.slug}`}>
              <div className="mb-4 overflow-hidden rounded-lg">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={250}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700">
                    {post.category}
                  </span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <span className="inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                  Read more
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600">More articles coming soon...</p>
      </div>
    </div>
  );
} 