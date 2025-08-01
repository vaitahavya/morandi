// Admin Authentication and Authorization utilities
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'viewer';

export interface AdminUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: AdminRole;
  permissions: AdminPermission[];
}

export type AdminPermission = 
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'orders.view'
  | 'orders.edit'
  | 'orders.cancel'
  | 'orders.refund'
  | 'inventory.view'
  | 'inventory.adjust'
  | 'customers.view'
  | 'customers.edit'
  | 'analytics.view'
  | 'settings.view'
  | 'settings.edit'
  | 'integrations.view'
  | 'integrations.manage'
  | 'users.view'
  | 'users.manage';

// Role-based permission mapping
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

// Admin user emails (in a real app, this would be in a database)
const ADMIN_USERS: Record<string, AdminRole> = {
  'admin@example.com': 'super_admin',  // Updated to match seeded user
  'admin@morandi.com': 'super_admin',
  'manager@morandi.com': 'admin',
  'staff@morandi.com': 'manager',
  'viewer@morandi.com': 'viewer'
};

/**
 * Get current admin user with role and permissions
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const role = ADMIN_USERS[session.user.email];
  if (!role) {
    return null;
  }

  return {
    id: session.user.id || session.user.email,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role,
    permissions: ROLE_PERMISSIONS[role]
  };
}

/**
 * Check if current user has admin access
 */
export async function isAdmin(): Promise<boolean> {
  const adminUser = await getAdminUser();
  return adminUser !== null;
}

/**
 * Check if current user has specific permission
 */
export async function hasPermission(permission: AdminPermission): Promise<boolean> {
  const adminUser = await getAdminUser();
  return adminUser?.permissions.includes(permission) || false;
}

/**
 * Check if current user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: AdminPermission[]): Promise<boolean> {
  const adminUser = await getAdminUser();
  if (!adminUser) return false;
  
  return permissions.some(permission => adminUser.permissions.includes(permission));
}

/**
 * Require admin access - redirect to signin if not authorized
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser();
  
  if (!adminUser) {
    redirect('/auth/signin?callbackUrl=/admin');
  }
  
  return adminUser;
}

/**
 * Require specific permission - redirect if not authorized
 */
export async function requirePermission(permission: AdminPermission): Promise<AdminUser> {
  const adminUser = await requireAdmin();
  
  if (!adminUser.permissions.includes(permission)) {
    redirect('/admin?error=insufficient_permissions');
  }
  
  return adminUser;
}

/**
 * Client-side hook for checking permissions
 */
export function useAdminPermissions() {
  // This would be implemented with a React context in a full implementation
  // For now, we'll create a basic implementation
  return {
    hasPermission: (permission: AdminPermission) => {
      // In a real app, this would check the current user's permissions from context
      return true; // Simplified for demo
    },
    hasAnyPermission: (permissions: AdminPermission[]) => {
      return true; // Simplified for demo
    },
    role: 'admin' as AdminRole,
    isLoading: false
  };
}

/**
 * Get human-readable permission labels
 */
export function getPermissionLabel(permission: AdminPermission): string {
  const labels: Record<AdminPermission, string> = {
    'products.view': 'View Products',
    'products.create': 'Create Products',
    'products.edit': 'Edit Products',
    'products.delete': 'Delete Products',
    'orders.view': 'View Orders',
    'orders.edit': 'Edit Orders',
    'orders.cancel': 'Cancel Orders',
    'orders.refund': 'Refund Orders',
    'inventory.view': 'View Inventory',
    'inventory.adjust': 'Adjust Inventory',
    'customers.view': 'View Customers',
    'customers.edit': 'Edit Customers',
    'analytics.view': 'View Analytics',
    'settings.view': 'View Settings',
    'settings.edit': 'Edit Settings',
    'integrations.view': 'View Integrations',
    'integrations.manage': 'Manage Integrations',
    'users.view': 'View Users',
    'users.manage': 'Manage Users'
  };
  
  return labels[permission] || permission;
}

/**
 * Get human-readable role labels
 */
export function getRoleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    super_admin: 'Super Administrator',
    admin: 'Administrator',
    manager: 'Manager',
    viewer: 'Viewer'
  };
  
  return labels[role] || role;
}

/**
 * API route protection middleware
 */
export async function withAdminAuth<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  requiredPermission?: AdminPermission
) {
  return async (...args: T): Promise<Response> => {
    try {
      const adminUser = await getAdminUser();
      
      if (!adminUser) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Admin access required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (requiredPermission && !adminUser.permissions.includes(requiredPermission)) {
        return new Response(
          JSON.stringify({ 
            error: 'Forbidden - Insufficient permissions',
            required: requiredPermission
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return handler(...args);
    } catch (error) {
      console.error('Admin auth error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/**
 * Add user to admin role (for testing/setup)
 */
export function addAdminUser(email: string, role: AdminRole): void {
  ADMIN_USERS[email] = role;
  console.log(`Added admin user: ${email} with role: ${role}`);
}

/**
 * Remove user from admin role
 */
export function removeAdminUser(email: string): void {
  delete ADMIN_USERS[email];
  console.log(`Removed admin user: ${email}`);
}

/**
 * Get all admin users (for management interface)
 */
export function getAllAdminUsers(): Array<{ email: string; role: AdminRole }> {
  return Object.entries(ADMIN_USERS).map(([email, role]) => ({ email, role }));
}