'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface VariationOption {
  name: string;
  value: string;
  count?: number;
}

interface VariationFilterProps {
  title: string;
  options: VariationOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClear: () => void;
}

export default function VariationFilter({ 
  title, 
  options, 
  selectedValue, 
  onSelect, 
  onClear 
}: VariationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-500">{title}:</span>
        <span className="font-medium">
          {selectedOption ? selectedOption.name : `Select ${title}`}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
              <span className="text-sm font-medium text-gray-700">{title}</span>
              {selectedValue && (
                <button
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedValue === option.value
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.name}</span>
                    {option.count && (
                      <span className="text-xs text-gray-500">({option.count})</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 