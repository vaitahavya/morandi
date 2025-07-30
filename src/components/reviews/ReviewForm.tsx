'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  productId: number;
  onSubmit: (review: { rating: number; comment: string; name: string }) => void;
  onCancel: () => void;
}

export default function ReviewForm({ productId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      alert('Please write a review');
      return;
    }
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment.trim(), name: name.trim() });
      setRating(0);
      setComment('');
      setName('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your name"
          />
        </div>

        {/* Rating field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating *
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
              >
                <Star
                  size={24}
                  className={`${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : ''
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {rating === 0 && 'Click to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        </div>

        {/* Comment field */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Review *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Share your experience with this product..."
          />
        </div>

        {/* Submit buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 