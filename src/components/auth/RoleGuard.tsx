'use client';

import { useSession } from 'next-auth/react';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { data: session } = useSession();

  if (!session) {
    return fallback;
  }

  if (!roles.includes(session.user.role)) {
    return fallback;
  }

  return <>{children}</>;
}

// Convenience components for common roles
export function AdminOnly({ children, fallback = null }: Omit<RoleGuardProps, 'roles'>) {
  return (
    <RoleGuard roles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function CustomerOnly({ children, fallback = null }: Omit<RoleGuardProps, 'roles'>) {
  return (
    <RoleGuard roles={['customer']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function StaffOnly({ children, fallback = null }: Omit<RoleGuardProps, 'roles'>) {
  return (
    <RoleGuard roles={['admin', 'staff']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
