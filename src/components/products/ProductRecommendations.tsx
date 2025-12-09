'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
}

interface ProductRecommendationsProps {
  productId?: string;
  type?: 'personalized' | 'similar' | 'popular';
  limit?: number;
  title?: string;
}

export default function ProductRecommendations({
  productId,
  type = 'personalized',
  limit = 4,
  title = 'Recommended for you'
}: ProductRecommendationsProps) {
  const { data: session } = useSession();
  const { data: recommendations = [], isLoading, error } = useRecommendations({
    productId,
    type,
    limit,
  });

  if (isLoading) {
    return (
      <div className="py-8">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Failed to fetch recommendations:', error);
    return null; // Silently fail for recommendations
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product: Product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block"
          >
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {(() => {
                  // Safely extract and validate image
                  const firstImage: any = product.images?.[0];
                  let imageSrc: string | null = null;
                  
                  if (firstImage) {
                    if (typeof firstImage === 'string') {
                      imageSrc = firstImage && firstImage !== '[' ? firstImage : null;
                    } else if (firstImage && typeof firstImage === 'object' && firstImage.src) {
                      imageSrc = firstImage.src && firstImage.src !== '[' ? firstImage.src : null;
                    }
                  }
                  
                  // Validate it's a valid URL or path
                  if (imageSrc && (
                    imageSrc.startsWith('http://') || 
                    imageSrc.startsWith('https://') || 
                    imageSrc.startsWith('/')
                  )) {
                    return (
                      <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    );
                  }
                  
                  return (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  );
                })()}
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 truncate">
                  {product.name}
                </h4>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  ₹{product.price.toFixed(2)}
                </p>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 