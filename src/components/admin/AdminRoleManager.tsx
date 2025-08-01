'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Crown,
  UserCog,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { AdminRole, AdminPermission } from '@/lib/admin-auth';
import { PermissionGuard, RoleGuard } from './AdminAuthGuard';

interface AdminUser {
  email: string;
  role: AdminRole;
  name?: string;
  lastActive?: string;
  status: 'active' | 'inactive' | 'pending';
}

interface RoleDefinition {
  role: AdminRole;
  label: string;
  description: string;
  permissions: AdminPermission[];
  color: string;
  icon: any;
}

export default function AdminRoleManager() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminRole>('viewer');

  // Mock data - in a real app, this would come from an API
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      email: 'admin@morandi.com',
      role: 'super_admin',
      name: 'Super Admin',
      lastActive: '2024-01-15T10:30:00Z',
      status: 'active'
    },
    {
      email: 'manager@morandi.com',
      role: 'admin',
      name: 'Admin User',
      lastActive: '2024-01-15T09:15:00Z',
      status: 'active'
    },
    {
      email: 'staff@morandi.com',
      role: 'manager',
      name: 'Store Manager',
      lastActive: '2024-01-14T16:45:00Z',
      status: 'active'
    },
    {
      email: 'viewer@morandi.com',
      role: 'viewer',
      name: 'Read Only User',
      lastActive: '2024-01-13T14:20:00Z',
      status: 'inactive'
    }
  ]);

  const roleDefinitions: RoleDefinition[] = [
    {
      role: 'super_admin',
      label: 'Super Administrator',
      description: 'Full system access including user management',
      permissions: [
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'orders.view', 'orders.edit', 'orders.cancel', 'orders.refund',
        'inventory.view', 'inventory.adjust',
        'customers.view', 'customers.edit',
        'analytics.view',
        'settings.view', 'settings.edit',
        'integrations.view', 'integrations.manage',
        'users.view', 'users.manage'
      ],
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Crown
    },
    {
      role: 'admin',
      label: 'Administrator',
      description: 'Full store management without user management',
      permissions: [
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'orders.view', 'orders.edit', 'orders.cancel', 'orders.refund',
        'inventory.view', 'inventory.adjust',
        'customers.view', 'customers.edit',
        'analytics.view',
        'settings.view',
        'integrations.view', 'integrations.manage'
      ],
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: UserCog
    },
    {
      role: 'manager',
      label: 'Manager',
      description: 'Product and order management with limited settings',
      permissions: [
        'products.view', 'products.create', 'products.edit',
        'orders.view', 'orders.edit',
        'inventory.view', 'inventory.adjust',
        'customers.view',
        'analytics.view'
      ],
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Settings
    },
    {
      role: 'viewer',
      label: 'Viewer',
      description: 'Read-only access to reports and data',
      permissions: [
        'products.view',
        'orders.view',
        'inventory.view',
        'customers.view',
        'analytics.view'
      ],
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Eye
    }
  ];

  const permissionLabels: Record<AdminPermission, string> = {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: AdminRole) => {
    const roleDef = roleDefinitions.find(r => r.role === role);
    if (!roleDef) return null;

    const Icon = roleDef.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${roleDef.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {roleDef.label}
      </span>
    );
  };

  const getStatusBadge = (status: AdminUser['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${variants[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleAddUser = () => {
    if (newUserEmail && newUserRole) {
      const newUser: AdminUser = {
        email: newUserEmail,
        role: newUserRole,
        name: newUserEmail.split('@')[0],
        lastActive: new Date().toISOString(),
        status: 'active'
      };
      setAdminUsers(prev => [...prev, newUser]);
      setNewUserEmail('');
      setNewUserRole('viewer');
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = (email: string) => {
    if (confirm(`Remove admin access for ${email}?`)) {
      setAdminUsers(prev => prev.filter(user => user.email !== email));
    }
  };

  const handleChangeRole = (email: string, newRole: AdminRole) => {
    setAdminUsers(prev => 
      prev.map(user => 
        user.email === email ? { ...user, role: newRole } : user
      )
    );
  };

  const tabs = [
    { id: 'users', label: 'Admin Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'permissions', label: 'Permission Matrix', icon: Settings }
  ];

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']} fallback={
      <Card className="border-red-200">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Access Restricted</h3>
          <p className="text-red-700">
            You need administrator privileges to manage user roles and permissions.
          </p>
        </CardContent>
      </Card>
    }>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role & Permission Management</h2>
          <p className="text-gray-600 mt-1">
            Manage admin users, roles, and permissions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Add User Section */}
            <PermissionGuard permission="users.manage">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Admin User
                      </CardTitle>
                      <CardDescription>
                        Grant admin access to a new user
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsAddingUser(!isAddingUser)}
                      variant={isAddingUser ? "outline" : "default"}
                    >
                      {isAddingUser ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {isAddingUser && (
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="email"
                          placeholder="user@example.com"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as AdminRole)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {roleDefinitions.map(role => (
                          <option key={role.role} value={role.role}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <Button onClick={handleAddUser} disabled={!newUserEmail}>
                        <Check className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </PermissionGuard>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Admin Users ({adminUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {adminUsers.map((user) => (
                        <tr key={user.email} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <PermissionGuard permission="users.manage">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleChangeRole(user.email, e.target.value as AdminRole)}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                >
                                  {roleDefinitions.map(role => (
                                    <option key={role.role} value={role.role}>
                                      {role.label}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUser(user.email)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </PermissionGuard>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roleDefinitions.map((roleDef) => {
              const Icon = roleDef.icon;
              return (
                <Card key={roleDef.role}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {roleDef.label}
                    </CardTitle>
                    <CardDescription>{roleDef.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Permissions ({roleDef.permissions.length})
                        </h4>
                        <div className="space-y-1">
                          {roleDef.permissions.map(permission => (
                            <div key={permission} className="flex items-center text-sm text-gray-600">
                              <Check className="h-3 w-3 text-green-600 mr-2" />
                              {permissionLabels[permission]}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Users with this role:</span>
                          <Badge variant="outline">
                            {adminUsers.filter(user => user.role === roleDef.role).length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Permission Matrix
              </CardTitle>
              <CardDescription>
                Overview of permissions for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 border-b">
                        Permission
                      </th>
                      {roleDefinitions.map(role => (
                        <th key={role.role} className="text-center py-2 px-4 font-medium text-gray-900 border-b">
                          {role.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(permissionLabels).map(([permission, label]) => (
                      <tr key={permission} className="border-b border-gray-100">
                        <td className="py-2 px-4 text-sm text-gray-900">{label}</td>
                        {roleDefinitions.map(role => (
                          <td key={role.role} className="text-center py-2 px-4">
                            {role.permissions.includes(permission as AdminPermission) ? (
                              <Check className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-gray-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}