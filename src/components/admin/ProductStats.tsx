'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Star,
  Eye,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';

interface ProductStatsData {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  featuredProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalValue: number;
  averagePrice: number;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    type: 'created' | 'updated' | 'sold';
    productName: string;
    timestamp: string;
    details?: string;
  }>;
}

export function ProductStats() {
  const [stats, setStats] = useState<ProductStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch products to calculate stats
      const response = await fetch('/api/products?limit=1000'); // Get all products for stats
      const data = await response.json();
      
      if (data.success) {
        const products = data.data;
        
        // Calculate stats
        const totalProducts = products.length;
        const publishedProducts = products.filter(p => p.status === 'published').length;
        const draftProducts = products.filter(p => p.status === 'draft').length;
        const featuredProducts = products.filter(p => p.featured).length;
        const outOfStockProducts = products.filter(p => p.stockStatus === 'outofstock').length;
        const lowStockProducts = products.filter(p => 
          p.stockQuantity <= (p.lowStockThreshold || 5) && p.stockStatus !== 'outofstock'
        ).length;
        
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
        const averagePrice = totalProducts > 0 ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;
        
        // Calculate top categories
        const categoryCount = {};
        products.forEach(product => {
          if (product.categories && product.categories.length > 0) {
            product.categories.forEach(cat => {
              categoryCount[cat.name] = (categoryCount[cat.name] || 0) + 1;
            });
          } else if (product.category) {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
          }
        });
        
        const topCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({
            name,
            count: count as number,
            percentage: totalProducts > 0 ? (count as number / totalProducts) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Mock recent activity (in real app, this would come from an activity log)
        const recentActivity = products
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
          .map(product => ({
            type: 'updated' as const,
            productName: product.name,
            timestamp: product.updatedAt,
            details: `Updated ${product.name}`
          }));

        setStats({
          totalProducts,
          publishedProducts,
          draftProducts,
          featuredProducts,
          outOfStockProducts,
          lowStockProducts,
          totalValue,
          averagePrice,
          topCategories,
          recentActivity
        });
      } else {
        setError('Failed to load product stats');
      }
    } catch (err) {
      setError('Failed to load product stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error || 'Failed to load stats'}</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {stats.publishedProducts} published
              </Badge>
              {stats.draftProducts > 0 && (
                <Badge variant="outline" className="text-xs">
                  {stats.draftProducts} drafts
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Avg: {formatCurrency(stats.averagePrice)} per product
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.outOfStockProducts + stats.lowStockProducts}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              {stats.outOfStockProducts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.outOfStockProducts} out of stock
                </Badge>
              )}
              {stats.lowStockProducts > 0 && (
                <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                  {stats.lowStockProducts} low stock
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Featured Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.featuredProducts}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {stats.totalProducts > 0 
                  ? `${((stats.featuredProducts / stats.totalProducts) * 100).toFixed(1)}% of total`
                  : '0% of total'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCategories.length > 0 ? (
              <div className="space-y-3">
                {stats.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{category.count} products</span>
                      <Badge variant="outline" className="text-xs">
                        {category.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No categories found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${
                        activity.type === 'created' ? 'bg-green-100 text-green-600' :
                        activity.type === 'updated' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'created' ? <Package className="h-3 w-3" /> :
                         activity.type === 'updated' ? <Eye className="h-3 w-3" /> :
                         <ShoppingCart className="h-3 w-3" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {activity.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.type === 'created' ? 'Created' :
                           activity.type === 'updated' ? 'Updated' :
                           'Sold'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      {(stats.outOfStockProducts > 0 || stats.lowStockProducts > 0 || stats.draftProducts > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.outOfStockProducts > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">{stats.outOfStockProducts}</p>
                  <p className="text-sm text-red-700">Products out of stock</p>
                </div>
              )}
              {stats.lowStockProducts > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600">{stats.lowStockProducts}</p>
                  <p className="text-sm text-orange-700">Products low in stock</p>
                </div>
              )}
              {stats.draftProducts > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{stats.draftProducts}</p>
                  <p className="text-sm text-blue-700">Draft products to publish</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}