'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  roles?: string[];
}

export default function AuthGuard({ 
  children, 
  fallback = null, 
  redirectTo = '/auth/signin',
  roles = []
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Check role-based access
    if (roles.length > 0 && !roles.includes(session.user.role)) {
      router.push('/'); // Redirect to home if user doesn't have required role
      return;
    }
  }, [session, status, router, redirectTo, roles]);

  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return fallback || null;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(session.user.role)) {
    return fallback || null;
  }

  return <>{children}</>;
}
