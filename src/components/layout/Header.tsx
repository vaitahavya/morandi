'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, X, Heart, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import MobileMenu from './MobileMenu';
import CartDrawer from '@/components/cart/CartDrawer';
import { useWishlistStore } from '@/store/wishlist-store';
import Logo from '@/components/ui/Logo';

// Admin user emails mapping (should match AdminAuthGuard)
const ADMIN_USERS: Record<string, string> = {
  'admin@morandi.com': 'super_admin',
  'admin@example.com': 'super_admin',
  'manager@morandi.com': 'admin',
  'staff@morandi.com': 'manager',
  'viewer@morandi.com': 'viewer'
};

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { data: session, status } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-morandi-white/95 backdrop-blur-sm shadow-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
          {/* Mobile menu */}
          <MobileMenu />

          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex">
            <Link href="/" className="text-deep-charcoal hover:text-clay-pink transition-colors font-medium">
              Home
            </Link>
            <Link href="/products" className="text-deep-charcoal hover:text-clay-pink transition-colors font-medium">
              Shop
            </Link>
            <Link href="/collections" className="text-deep-charcoal hover:text-clay-pink transition-colors font-medium">
              Collections
            </Link>
            <Link href="/about" className="text-deep-charcoal hover:text-clay-pink transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-deep-charcoal hover:text-clay-pink transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center text-gray-700 hover:text-primary-700"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative hidden md:flex items-center text-gray-700 hover:text-primary-700">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-medium text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative hidden md:block">
              {status === 'loading' ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-700"
                  >
                    <User size={20} />
                    <span className="text-sm">{session.user?.name || session.user?.email}</span>
                    <ChevronDown size={16} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-gray-700 hover:text-primary-700"
                  >
                    Sign In
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href="/auth/signup"
                    className="text-sm bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Shop Now CTA */}
            <Link 
              href="/products" 
              className="hidden md:block bg-clay-pink text-morandi-white px-4 py-2 rounded-lg font-medium hover:bg-clay-pink/90 transition-colors text-sm"
            >
              Shop Now
            </Link>

            {/* Currency selector */}
            <div className="relative hidden md:block">
              <button className="flex items-center space-x-1 text-sm text-deep-charcoal hover:text-clay-pink">
                <span>₹ INR</span>
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Cart Drawer */}
            <CartDrawer />
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsSearchOpen(false)}>
          <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-md">
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    autoFocus
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary-600 px-3 py-1 text-sm text-white hover:bg-primary-700"
                  >
                    Search
                  </button>
                </form>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute -right-12 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
}
