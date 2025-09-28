'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import Logo from '@/components/ui/Logo';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.getItemCount());

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 text-gray-700 hover:text-primary-700"
      >
        <Menu size={24} />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleMenu}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <Logo />
              <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <nav className="p-4">
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    onClick={toggleMenu}
                    className="block text-lg text-gray-700 hover:text-primary-700"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    onClick={toggleMenu}
                    className="block text-lg text-gray-700 hover:text-primary-700"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections"
                    onClick={toggleMenu}
                    className="block text-lg text-gray-700 hover:text-primary-700"
                  >
                    Collections
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={toggleMenu}
                    className="block text-lg text-gray-700 hover:text-primary-700"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    onClick={toggleMenu}
                    className="block text-lg text-gray-700 hover:text-primary-700"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={toggleMenu}
                    className="block text-lg text-gray-700 hover:text-primary-700"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <Link
                href="/wishlist"
                onClick={toggleMenu}
                className="flex items-center justify-center space-x-2 rounded-md border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50"
              >
                <Heart size={20} />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
              <Link
                href="/cart"
                onClick={toggleMenu}
                className="flex items-center justify-center space-x-2 rounded-md bg-primary-600 px-4 py-3 text-white"
              >
                <ShoppingCart size={20} />
                <span>Cart ({itemCount})</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 