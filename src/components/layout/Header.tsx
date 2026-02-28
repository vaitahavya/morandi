'use client';

import Link from 'next/link';
import { User, LogOut, ShoppingBag } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import MobileMenu from './MobileMenu';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ADMIN_USERS: Record<string, string> = {
  'admin@morandi.com': 'super_admin',
  'admin@example.com': 'super_admin',
  'manager@morandi.com': 'admin',
  'staff@morandi.com': 'manager',
  'viewer@morandi.com': 'viewer'
};

export default function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="section-container">
        <div className="flex items-center justify-between gap-2 py-4 lg:py-5">
          <div className="lg:hidden flex-shrink-0">
            <MobileMenu />
          </div>

          <div className="flex-1 lg:flex-initial flex justify-center lg:justify-start">
            <Logo />
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-deep-charcoal transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-deep-charcoal transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-deep-charcoal transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {status === 'loading' ? (
              <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 gap-2 px-3 rounded-full">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                      {session.user?.name || session.user?.email?.split('@')[0] || 'Account'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-semibold">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 font-normal">{session.user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
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
              <Button variant="outline" size="sm" asChild className="rounded-full">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
