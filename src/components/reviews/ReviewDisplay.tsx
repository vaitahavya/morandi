'use client';

import { Star } from 'lucide-react';

export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewDisplayProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function ReviewDisplay({ reviews, averageRating, totalReviews }: ReviewDisplayProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Review summary */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {renderStars(averageRating)}
          </div>
          <div>
            <p className="text-lg font-semibold">{averageRating.toFixed(1)} out of 5</p>
            <p className="text-sm text-gray-600">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{review.name}</h4>
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 