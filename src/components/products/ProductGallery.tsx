'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ProductGalleryProps {
  images: Array<{ src: string; alt: string }>;
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Validate and normalize images array
  const validImages = (images || []).filter((img: any) => {
    if (!img) return false;
    const src = typeof img === 'string' ? img : img?.src;
    // Validate src is a valid string (URL or path)
    return src && typeof src === 'string' && src.trim() !== '' && src !== '[';
  }).map((img: any) => {
    // Normalize to { src, alt } format
    if (typeof img === 'string') {
      return { src: img, alt: productName };
    }
    return {
      src: img?.src || '',
      alt: img?.alt || productName
    };
  });

  if (!validImages || validImages.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={validImages[selectedImage]?.src || validImages[0]?.src || '/placeholder.svg'}
          alt={validImages[selectedImage]?.alt || productName}
          width={600}
          height={600}
          className={`h-full w-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {/* Zoom Controls - Hidden on mobile */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex space-x-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-md hover:bg-white active:bg-white/95 transition-colors"
            aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
          >
            {isZoomed ? <ZoomOut size={14} className="sm:w-4 sm:h-4" /> : <ZoomIn size={14} className="sm:w-4 sm:h-4" />}
          </button>
        </div>

        {/* Image Navigation Dots */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors ${
                  selectedImage === index ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Images - Horizontal scroll on mobile */}
      {validImages.length > 1 && (
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
          <div className="flex sm:grid sm:grid-cols-4 gap-2 min-w-max sm:min-w-0">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 aspect-square w-16 h-16 sm:w-full overflow-hidden rounded-md border-2 transition-colors ${
                  selectedImage === index
                    ? 'border-primary-600 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
                aria-label={`Select image ${index + 1}`}
              >
                <Image
                  src={image.src || '/placeholder.svg'}
                  alt={image.alt || `${productName} ${index + 1}`}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 