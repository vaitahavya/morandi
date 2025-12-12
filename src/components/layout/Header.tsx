'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Heart, User, LogOut, ShoppingBag, Package } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import MobileMenu from './MobileMenu';
import CartDrawer from '@/components/cart/CartDrawer';
import { useWishlistStore } from '@/store/wishlist-store';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

// Admin user emails mapping (should match AdminAuthGuard)
const ADMIN_USERS: Record<string, string> = {
  'admin@morandi.com': 'super_admin',
  'admin@example.com': 'super_admin',
  'manager@morandi.com': 'admin',
  'staff@morandi.com': 'manager',
  'viewer@morandi.com': 'viewer'
};

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { data: session, status } = useSession();

  // Prevent hydration mismatch by only accessing store after client-side mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="section-container">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between gap-2 py-3 lg:hidden">
          <MobileMenu />
          <div className="flex-1 flex justify-center">
            <Logo />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9"
            >
              <Link href="/products">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <CartDrawer />
            {status === 'loading' ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            ) : session ? (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9"
              >
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9"
              >
                <Link href="/auth/signin">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0 mr-8">
            <Logo />
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 mr-8">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              Shop
            </Link>
            <Link href="/collections" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              Collections
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="max-w-xs mr-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-9 pl-3 pr-10"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-gray-500" />
              </Button>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 relative">
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {isClient && wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary-600 text-white text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Account Dropdown */}
            {status === 'loading' ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-3">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium text-gray-700 hidden xl:inline">
                      {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-semibold">{session.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 font-normal">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      My Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {session?.user?.email && ADMIN_USERS[session.user.email] && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}

            {/* Cart */}
            <CartDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
