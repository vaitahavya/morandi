'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  onPriceRangeChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const min = priceRange.min ? parseFloat(priceRange.min) : 0;
    const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
    onPriceRangeChange(min, max);
  };

  return (
    <div className="mb-6">
      {/* Mobile filter button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden"
      >
        <Filter size={16} />
        <span>Filters</span>
      </button>

      {/* Desktop filters */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:border-0 md:bg-transparent md:p-0">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Category filter */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-900">Category</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">All Categories</span>
              </label>
              {categories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="mr-2 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price range filter */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-900">Price Range</h4>
            <form onSubmit={handlePriceSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-primary-600 px-3 py-2 text-sm text-white hover:bg-primary-700"
              >
                Apply Price Filter
              </button>
            </form>
          </div>

          {/* Clear filters */}
          <button
            onClick={onClearFilters}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
} 