'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ShoppingCart, Heart, User, LogOut, Package, Home, Search } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Admin user emails mapping
const ADMIN_USERS: Record<string, string> = {
  'admin@morandi.com': 'super_admin',
  'admin@example.com': 'super_admin',
  'manager@morandi.com': 'admin',
  'staff@morandi.com': 'manager',
  'viewer@morandi.com': 'viewer'
};

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const itemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { data: session, status } = useSession();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center h-9 w-9 text-gray-700 hover:text-primary-700 active:bg-gray-100 rounded-md transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" 
            onClick={toggleMenu}
          />
          
          {/* Side Menu */}
          <div 
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <Logo />
              <button 
                onClick={toggleMenu} 
                className="text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-md p-1 transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 h-10 bg-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </form>
            </div>

            {/* User Account Section */}
            {status === 'loading' ? (
              <div className="p-4 border-b border-gray-200 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : session ? (
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-600 truncate">{session.user?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    onClick={handleLinkClick}
                    className="flex-1 text-xs"
                  >
                    <Link href="/account">
                      <User className="mr-1.5 h-3.5 w-3.5" />
                      Account
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex-1 text-xs"
                  >
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-gray-200">
                <Button
                  asChild
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  onClick={handleLinkClick}
                >
                  <Link href="/auth/signin">
                    Sign In
                  </Link>
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  New customer?{' '}
                  <Link href="/auth/signup" className="text-primary-600 hover:underline" onClick={handleLinkClick}>
                    Start here
                  </Link>
                </p>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-2">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <Home className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Shop</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <Package className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlist"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <Heart className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Wishlist</span>
                    {isClient && wishlistCount > 0 && (
                      <Badge className="ml-auto bg-primary-600 text-white text-xs">
                        {wishlistCount}
                      </Badge>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <span className="font-medium">Collections</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <span className="font-medium">About</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <span className="font-medium">Contact</span>
                  </Link>
                </li>
                {session?.user?.email && ADMIN_USERS[session.user.email] && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors border-t border-gray-200 mt-2 pt-2"
                    >
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2 mt-auto">
              <Link
                href="/cart"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-3 text-white font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {isClient && itemCount > 0 && (
                  <Badge className="bg-white text-primary-600 text-xs font-semibold">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
