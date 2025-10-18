'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Settings, 
  Menu, 
  X, 
  Home,
  Users,
  TrendingUp,
  Bell,
  Search,
  HelpCircle,
  LogOut,
  RotateCcw,
  FolderTree
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationDropdown } from './NotificationDropdown';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminLayout({ children, activeSection, onSectionChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      id: 'overview',
      name: 'Overview',
      icon: Home,
      description: 'Dashboard overview'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'Business insights and reports',
      badge: 'New'
    },
    {
      id: 'products',
      name: 'Products',
      icon: Package,
      description: 'Product catalog management'
    },
    {
      id: 'categories',
      name: 'Categories',
      icon: FolderTree,
      description: 'Category management and organization'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: TrendingUp,
      description: 'Stock tracking and inventory management'
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: ShoppingCart,
      description: 'Order management and fulfillment'
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: Users,
      description: 'Customer management'
    },
    {
      id: 'returns',
      name: 'Returns & Refunds',
      icon: RotateCcw,
      description: 'Return requests and refund management'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: Settings,
      description: 'Third-party integrations and API connections'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'System settings and user management'
    }
  ];

  const quickActions = [
    { label: 'Add Product', action: () => onSectionChange('products') },
    { label: 'View Orders', action: () => onSectionChange('orders') },
    { label: 'Check Analytics', action: () => onSectionChange('analytics') }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="px-4 py-4 border-t">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <button className="flex items-center gap-2 hover:text-gray-700">
                <HelpCircle className="h-4 w-4" />
                Help
              </button>
              <button className="flex items-center gap-2 hover:text-gray-700">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page title */}
            <div className="flex-1 lg:ml-0 ml-4">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {navigation.find(item => item.id === activeSection)?.name || 'Admin Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">
                {navigation.find(item => item.id === activeSection)?.description || 'Manage your e-commerce store'}
              </p>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
              </div>

              {/* Notifications */}
              <NotificationDropdown />

              {/* User menu */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@morandi.com</p>
                </div>
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}