'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  Loader2, 
  Lock,
  UserX,
  ArrowLeft
} from 'lucide-react';
import { AdminRole, AdminPermission } from '@/lib/admin-auth';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermission;
  fallback?: React.ReactNode;
}

interface AdminAuthState {
  isLoading: boolean;
  isAdmin: boolean;
  hasPermission: boolean;
  role?: AdminRole;
  error?: string;
}

// Admin user emails mapping (in a real app, this would come from an API)
const ADMIN_USERS: Record<string, AdminRole> = {
  'admin@morandi.com': 'super_admin',
  'manager@morandi.com': 'admin',
  'staff@morandi.com': 'manager',
  'viewer@morandi.com': 'viewer'
};

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'orders.view', 'orders.edit', 'orders.cancel', 'orders.refund',
    'inventory.view', 'inventory.adjust',
    'customers.view', 'customers.edit',
    'analytics.view',
    'settings.view', 'settings.edit',
    'integrations.view', 'integrations.manage',
    'users.view', 'users.manage'
  ],
  admin: [
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'orders.view', 'orders.edit', 'orders.cancel', 'orders.refund',
    'inventory.view', 'inventory.adjust',
    'customers.view', 'customers.edit',
    'analytics.view',
    'settings.view',
    'integrations.view', 'integrations.manage'
  ],
  manager: [
    'products.view', 'products.create', 'products.edit',
    'orders.view', 'orders.edit',
    'inventory.view', 'inventory.adjust',
    'customers.view',
    'analytics.view'
  ],
  viewer: [
    'products.view',
    'orders.view',
    'inventory.view',
    'customers.view',
    'analytics.view'
  ]
};

export default function AdminAuthGuard({ 
  children, 
  requiredPermission,
  fallback 
}: AdminAuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authState, setAuthState] = useState<AdminAuthState>({
    isLoading: true,
    isAdmin: false,
    hasPermission: false
  });

  useEffect(() => {
    if (status === 'loading') {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (status === 'unauthenticated') {
      setAuthState({
        isLoading: false,
        isAdmin: false,
        hasPermission: false,
        error: 'Please sign in to access the admin panel'
      });
      return;
    }

    if (session?.user?.email) {
      const userRole = ADMIN_USERS[session.user.email];
      
      if (!userRole) {
        setAuthState({
          isLoading: false,
          isAdmin: false,
          hasPermission: false,
          error: 'You do not have admin access to this system'
        });
        return;
      }

      const userPermissions = ROLE_PERMISSIONS[userRole];
      const hasRequiredPermission = !requiredPermission || userPermissions.includes(requiredPermission);

      setAuthState({
        isLoading: false,
        isAdmin: true,
        hasPermission: hasRequiredPermission,
        role: userRole,
        error: hasRequiredPermission ? undefined : 'Insufficient permissions for this action'
      });
    }
  }, [session, status, requiredPermission]);

  // Loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-lg font-semibold mb-2">Authenticating...</h2>
            <p className="text-gray-600">Verifying admin access</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access the admin dashboard
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/auth/signin?callbackUrl=/admin')}
                className="w-full"
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not admin user
  if (!authState.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <UserX className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2 text-red-900">Access Denied</h2>
            <p className="text-red-700 mb-6">
              {authState.error || 'You do not have permission to access the admin panel'}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-900">Admin Access Required</p>
                  <p className="text-sm text-red-700 mt-1">
                    Contact your system administrator to request admin access.
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Current user: {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/auth/signin')}
                className="w-full text-sm"
              >
                Sign in with different account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Insufficient permissions for specific action
  if (!authState.hasPermission && requiredPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-yellow-200">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2 text-yellow-900">Insufficient Permissions</h2>
            <p className="text-yellow-700 mb-6">
              You don't have the required permissions to access this feature
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-900">Required Permission:</p>
                <p className="text-sm text-yellow-700 font-mono bg-yellow-100 px-2 py-1 rounded mt-1">
                  {requiredPermission}
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Your role: <span className="font-medium">{authState.role}</span>
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success - render protected content
  return <>{children}</>;
}

// Permission-based component wrapper
interface PermissionGuardProps {
  permission: AdminPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { data: session } = useSession();
  
  if (!session?.user?.email) {
    return fallback || null;
  }

  const userRole = ADMIN_USERS[session.user.email];
  if (!userRole) {
    return fallback || null;
  }

  const userPermissions = ROLE_PERMISSIONS[userRole];
  const hasPermission = userPermissions.includes(permission);

  return hasPermission ? <>{children}</> : (fallback || null);
}

// Role-based component wrapper
interface RoleGuardProps {
  allowedRoles: AdminRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { data: session } = useSession();
  
  if (!session?.user?.email) {
    return fallback || null;
  }

  const userRole = ADMIN_USERS[session.user.email];
  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || null;
  }

  return <>{children}</>;
}