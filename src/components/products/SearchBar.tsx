'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search products...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary-600 px-3 py-1 text-sm text-white hover:bg-primary-700"
      >
        Search
      </button>
    </form>
  );
} 