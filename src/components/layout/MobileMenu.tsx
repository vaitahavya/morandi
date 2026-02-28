'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, Home } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';

const ADMIN_USERS: Record<string, string> = {
  'admin@morandi.com': 'super_admin',
  'admin@example.com': 'super_admin',
  'manager@morandi.com': 'admin',
  'staff@morandi.com': 'manager',
  'viewer@morandi.com': 'viewer'
};

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleLinkClick = () => setIsOpen(false);
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center h-9 w-9 text-gray-700 hover:text-deep-charcoal active:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Logo />
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 -m-2 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {status === 'loading' ? (
              <div className="p-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
              </div>
            ) : session ? (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-clay-pink/20 flex items-center justify-center text-clay-pink font-semibold">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1" onClick={handleLinkClick}>
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex-1 text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-gray-100">
                <Button asChild className="w-full" onClick={handleLinkClick}>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  <Link href="/auth/signup" className="text-primary-600 hover:underline" onClick={handleLinkClick}>
                    Create an account
                  </Link>
                </p>
              </div>
            )}

            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Home className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">About</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">Contact</span>
                  </Link>
                </li>
                {session?.user?.email && ADMIN_USERS[session.user.email] && (
                  <li className="pt-4 mt-4 border-t border-gray-100">
                    <Link
                      href="/admin"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
