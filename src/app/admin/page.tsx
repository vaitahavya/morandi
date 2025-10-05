'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
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
  console.log('OverviewDashboard - Rendering');
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

        {/* Test content */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Test Content</h2>
          <p>This is a test to see if content renders after the welcome banner.</p>
        </div>

        {/* Simple test content */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Dashboard Content</h2>
          <p className="mb-4">If you can see this, the component is rendering correctly.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-medium">Sample Card 1</h3>
              <p className="text-sm text-gray-600">This is test content</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-medium">Sample Card 2</h3>
              <p className="text-sm text-gray-600">This is test content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('overview');

  console.log('AdminPage - activeSection:', activeSection);

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
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold mb-4">Integrations</h2>
              <p>Integration settings and third-party connections will be available here.</p>
            </div>
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