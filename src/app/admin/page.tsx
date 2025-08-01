'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import WooCommerceSync from '@/components/admin/WooCommerceSync';
import ProductManager from '@/components/admin/ProductManager';
import OrderManager from '@/components/admin/OrderManager';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import InventoryManager from '@/components/admin/InventoryManager';
import AdminRoleManager from '@/components/admin/AdminRoleManager';
import CustomerManager from '@/components/admin/CustomerManager';
import ReturnManager from '@/components/admin/ReturnManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

// Overview Dashboard Component
function OverviewDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to your Admin Dashboard</h1>
          <p className="text-blue-100">
            Manage your e-commerce store, track performance, and grow your business
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹1,24,530</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">+12.5%</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">328</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">+8.2%</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">12 out of stock</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-2xl font-bold text-gray-900">1,249</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">+15.3%</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Add New Product</p>
                    <p className="text-sm text-blue-600">Create a new product listing</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Process Orders</p>
                    <p className="text-sm text-green-600">View and manage pending orders</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">View Analytics</p>
                    <p className="text-sm text-purple-600">Check business performance</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Links</CardTitle>
              <CardDescription>External system access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href="https://supabase.com/dashboard/project/ohipggwnmnypiubsbcvu"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-600 rounded"></div>
                    <div>
                      <p className="font-medium text-gray-900">Supabase Dashboard</p>
                      <p className="text-sm text-gray-600">Database management</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </a>
              
              <a 
                href="/api/test-wordpress"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-600 rounded"></div>
                    <div>
                      <p className="font-medium text-gray-900">WordPress API Test</p>
                      <p className="text-sm text-gray-600">Test integration status</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </a>
              
              <a 
                href="/products"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-600 rounded"></div>
                    <div>
                      <p className="font-medium text-gray-900">View Store</p>
                      <p className="text-sm text-gray-600">Customer-facing store</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Attention Required</p>
                <p className="text-sm text-orange-700">
                  You have 3 products running low on stock and 5 orders pending review.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewDashboard />;
      case 'analytics':
        return (
          <div className="container mx-auto px-4 py-8">
            <AnalyticsDashboard />
          </div>
        );
      case 'products':
        return (
          <div className="container mx-auto px-4 py-8">
            <ProductManager />
          </div>
        );
      case 'inventory':
        return (
          <div className="container mx-auto px-4 py-8">
            <InventoryManager />
          </div>
        );
      case 'orders':
        return (
          <div className="container mx-auto px-4 py-8">
            <OrderManager />
          </div>
        );
      case 'customers':
        return (
          <div className="container mx-auto px-4 py-8">
            <CustomerManager />
          </div>
        );
      case 'returns':
        return (
          <div className="container mx-auto px-4 py-8">
            <ReturnManager />
          </div>
        );
      case 'integrations':
        return (
          <div className="container mx-auto px-4 py-8">
            <WooCommerceSync />
          </div>
        );
      case 'settings':
        return (
          <div className="container mx-auto px-4 py-8">
            <AdminRoleManager />
          </div>
        );
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <AdminAuthGuard>
      <AdminLayout 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      >
        {renderContent()}
      </AdminLayout>
    </AdminAuthGuard>
  );
} 