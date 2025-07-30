'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'date-newest' | 'date-oldest';

interface ProductSortingProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalProducts: number;
}

const sortOptions = [
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'date-newest', label: 'Newest First' },
  { value: 'date-oldest', label: 'Oldest First' },
] as const;

export default function ProductSorting({ currentSort, onSortChange, totalProducts }: ProductSortingProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = sortOptions.find(option => option.value === currentSort);

  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-gray-600">
        Showing {totalProducts} product{totalProducts !== 1 ? 's' : ''}
      </p>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span>Sort by: {currentOption?.label}</span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value as SortOption);
                    setIsOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    currentSort === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 