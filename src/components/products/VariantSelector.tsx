'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

export interface VariantOption {
  name: string;
  value: string;
  available: boolean;
  price?: string;
}

interface VariantSelectorProps {
  type: 'color' | 'size';
  options: VariantOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  label: string;
}

export default function VariantSelector({ type, options, selectedValue, onSelect, label }: VariantSelectorProps) {
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);

  const getColorValue = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#10b981',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'pink': '#ec4899',
      'orange': '#f97316',
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#6b7280',
      'brown': '#a16207',
      'navy': '#1e3a8a',
      'maroon': '#991b1b',
      'olive': '#65a30d',
      'lime': '#84cc16',
      'teal': '#0d9488',
      'cyan': '#0891b2',
      'indigo': '#4338ca',
      'violet': '#7c3aed',
      'fuchsia': '#c026d3',
      'rose': '#e11d48',
      'amber': '#d97706',
      'emerald': '#059669',
      'sky': '#0284c7',
      'slate': '#475569',
      'zinc': '#71717a',
      'neutral': '#737373',
      'stone': '#78716c',
      'red-500': '#ef4444',
      'blue-500': '#3b82f6',
      'green-500': '#10b981',
      'yellow-500': '#f59e0b',
      'purple-500': '#8b5cf6',
      'pink-500': '#ec4899',
      'orange-500': '#f97316',
    };
    
    return colorMap[colorName.toLowerCase()] || colorName;
  };

  const isColor = type === 'color';

  return (
    <div>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg font-semibold">{label}</h3>
        {type === 'size' && (
          <button className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 active:text-primary-800">
            Size Guide
          </button>
        )}
      </div>
      
      <div className={`grid gap-2 ${
        isColor ? 'grid-cols-5 sm:grid-cols-6 md:grid-cols-8' : 'grid-cols-3 sm:grid-cols-4'
      }`}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const isHovered = hoveredValue === option.value;
          
          if (isColor) {
            const colorValue = getColorValue(option.value);
            const isHexColor = colorValue.startsWith('#');
            
            return (
              <button
                key={option.value}
                onClick={() => option.available && onSelect(option.value)}
                onMouseEnter={() => setHoveredValue(option.value)}
                onMouseLeave={() => setHoveredValue(null)}
                disabled={!option.available}
                className={`relative aspect-square rounded-full border-2 transition-all ${
                  isSelected
                    ? 'border-primary-600 ring-2 ring-primary-200'
                    : isHovered
                    ? 'border-gray-400'
                    : 'border-gray-300'
                } ${
                  !option.available
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95'
                }`}
                style={{
                  backgroundColor: isHexColor ? colorValue : 'transparent',
                  backgroundImage: !isHexColor ? `url(${colorValue})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                title={option.name}
                aria-label={`Select ${option.name}`}
              >
                {isSelected && (
                  <Check
                    size={12}
                    className="absolute inset-0 m-auto text-white drop-shadow-sm sm:w-4 sm:h-4"
                  />
                )}
                {!option.available && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                  </div>
                )}
              </button>
            );
          }
          
          return (
            <button
              key={option.value}
              onClick={() => option.available && onSelect(option.value)}
              onMouseEnter={() => setHoveredValue(option.value)}
              onMouseLeave={() => setHoveredValue(null)}
              disabled={!option.available}
              className={`py-1.5 sm:py-2 px-2 sm:px-4 rounded-md border text-xs sm:text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : isHovered
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400 active:bg-gray-100'
              } ${
                !option.available
                  ? 'opacity-50 cursor-not-allowed line-through'
                  : ''
              }`}
              aria-label={`Select size ${option.name}`}
            >
              {option.name}
              {option.price && (
                <span className="ml-1 text-[10px] sm:text-xs text-gray-500">
                  (+₹{option.price})
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedValue && (
        <p className="mt-2 text-xs sm:text-sm text-gray-600">
          Selected: {options.find(opt => opt.value === selectedValue)?.name}
        </p>
      )}
    </div>
  );
} 