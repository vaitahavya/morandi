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
      <div className="py-6 sm:py-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{title}</h3>
        <div className="card-grid">
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
    <div className="py-4 sm:py-6 md:py-8">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 px-1">{title}</h3>
      {/* Horizontal scroll on mobile, grid on desktop - like Amazon/Flipkart */}
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 min-w-max sm:min-w-0">
          {recommendations.map((product: Product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block flex-shrink-0 w-40 sm:w-full min-w-0"
            >
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md active:shadow-lg transition-shadow duration-200 overflow-hidden h-full min-w-0 w-full">
                <div className="relative aspect-square bg-gray-100 w-full">
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
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    );
                  })()}
                </div>
                <div className="p-3 sm:p-4 min-w-0 w-full overflow-hidden">
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-1 sm:mb-2 min-w-0 break-words">
                    {product.name}
                  </h4>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
                    ₹{product.price.toFixed(2)}
                  </p>
                  {product.description && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 hidden sm:block min-w-0 break-words">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 