'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, X, Heart, User, LogOut, ShoppingBag } from 'lucide-react';
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
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
      <header className="sticky top-0 z-40 w-full glass border-b border-border/40 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
          {/* Mobile menu */}
          <MobileMenu />

          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex items-center">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/collections" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Collections
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative hidden md:flex"
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground border-0 px-1 text-[10px]">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            <div className="relative hidden md:block">
              {status === 'loading' ? (
                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin"></div>
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm hidden lg:inline">{session.user?.name || session.user?.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/signin">
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-clay-pink hover:bg-clay-pink/90" asChild>
                    <Link href="/auth/signup">
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Shop Now CTA */}
            <Button 
              asChild
              size="sm"
              className="hidden lg:flex bg-clay-pink hover:bg-clay-pink/90 text-white"
            >
              <Link href="/products">
                Shop Now
              </Link>
            </Button>

            {/* Currency selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex gap-1">
                  <span className="text-sm">₹ INR</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>₹ INR</DropdownMenuItem>
                <DropdownMenuItem>$ USD</DropdownMenuItem>
                <DropdownMenuItem>€ EUR</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart Drawer */}
            <CartDrawer />
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="pl-10 pr-4 h-12 text-base"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-clay-pink hover:bg-clay-pink/90"
              size="lg"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
