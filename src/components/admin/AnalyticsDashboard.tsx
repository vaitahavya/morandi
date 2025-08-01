'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  Target,
  Award,
  AlertCircle,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  // Overview metrics
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  
  // Growth metrics
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  
  // Performance metrics
  conversionRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  returnCustomerRate: number;
  
  // Product analytics
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    units: number;
  }>;
  
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    threshold: number;
  }>;
  
  categoryPerformance: Array<{
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  
  // Sales analytics
  salesTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  
  hourlyPatterns: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  
  // Customer analytics
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    averageOrder: number;
  }>;
  
  // Geographic data
  topRegions: Array<{
    region: string;
    orders: number;
    revenue: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sales' | 'customers'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would be a dedicated analytics API endpoint
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products?limit=1000'),
        fetch('/api/orders?limit=1000')
      ]);
      
      const [productsData, ordersData] = await Promise.all([
        productsRes.json(),
        ordersRes.json()
      ]);
      
      if (productsData.success && ordersData.success) {
        const products = productsData.data;
        const orders = ordersData.data;
        
        // Calculate analytics
        const analyticsData = calculateAnalytics(products, orders, timeRange);
        setAnalytics(analyticsData);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (products: any[], orders: any[], range: string): AnalyticsData => {
    // Filter orders by time range
    const now = new Date();
    const startDate = new Date();
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const filteredOrders = orders.filter(order => 
      new Date(order.createdAt) >= startDate
    );
    
    // Basic metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const totalProducts = products.filter(p => p.status === 'published').length;
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customerEmail)).size;
    
    // Calculate previous period for growth
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    const rangeDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    prevStartDate.setDate(prevStartDate.getDate() - rangeDays);
    
    const prevOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= prevStartDate && orderDate < startDate;
    });
    
    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.total, 0);
    const prevOrderCount = prevOrders.length;
    const prevCustomers = new Set(prevOrders.map(o => o.customerEmail)).size;
    
    // Growth calculations
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const orderGrowth = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0;
    const customerGrowth = prevCustomers > 0 ? ((uniqueCustomers - prevCustomers) / prevCustomers) * 100 : 0;
    
    // Performance metrics
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = 45; // Mock conversion rate
    const customerLifetimeValue = averageOrderValue * 2.5; // Mock CLV calculation
    const returnCustomerRate = 35; // Mock return rate
    
    // Top products analysis
    const productSales: { [id: string]: { sales: number; revenue: number; units: number; name: string } } = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            sales: 0,
            revenue: 0,
            units: 0,
            name: item.productName
          };
        }
        productSales[item.productId].sales += 1;
        productSales[item.productId].revenue += item.totalPrice;
        productSales[item.productId].units += item.quantity;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Low stock products
    const lowStockProducts = products
      .filter(p => p.stockQuantity <= (p.lowStockThreshold || 5) && p.status === 'published')
      .map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stockQuantity,
        threshold: p.lowStockThreshold || 5
      }))
      .slice(0, 10);
    
    // Category performance
    const categoryData: { [name: string]: { sales: number; revenue: number } } = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = { sales: 0, revenue: 0 };
      }
      
      // Find sales for this product
      const productStats = productSales[product.id];
      if (productStats) {
        categoryData[category].sales += productStats.sales;
        categoryData[category].revenue += productStats.revenue;
      }
    });
    
    const categoryPerformance = Object.entries(categoryData)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        revenue: data.revenue,
        growth: Math.random() * 20 - 10 // Mock growth data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
    
    // Sales trends (daily)
    const salesTrends = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
      
      salesTrends.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length
      });
    }
    
    // Hourly patterns
    const hourlyPatterns = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = filteredOrders.filter(order => 
        new Date(order.createdAt).getHours() === hour
      );
      return {
        hour,
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, order) => sum + order.total, 0)
      };
    });
    
    // Customer segments (mock data)
    const customerSegments = [
      { segment: 'VIP', count: Math.floor(uniqueCustomers * 0.05), revenue: totalRevenue * 0.3, averageOrder: averageOrderValue * 2.5 },
      { segment: 'Regular', count: Math.floor(uniqueCustomers * 0.25), revenue: totalRevenue * 0.4, averageOrder: averageOrderValue * 1.2 },
      { segment: 'New', count: Math.floor(uniqueCustomers * 0.7), revenue: totalRevenue * 0.3, averageOrder: averageOrderValue * 0.8 }
    ];
    
    // Top regions (mock data based on orders)
    const regions = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];
    const topRegions = regions.map(region => {
      const regionOrders = Math.floor(totalOrders * (Math.random() * 0.3 + 0.05));
      return {
        region,
        orders: regionOrders,
        revenue: regionOrders * averageOrderValue * (Math.random() * 0.5 + 0.75)
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    
    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers: uniqueCustomers,
      revenueGrowth,
      orderGrowth,
      customerGrowth,
      conversionRate,
      averageOrderValue,
      customerLifetimeValue,
      returnCustomerRate,
      topProducts,
      lowStockProducts,
      categoryPerformance,
      salesTrends,
      hourlyPatterns,
      customerSegments,
      topRegions
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    // Create CSV export
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', formatCurrency(analytics.totalRevenue)],
      ['Total Orders', analytics.totalOrders.toString()],
      ['Total Products', analytics.totalProducts.toString()],
      ['Total Customers', analytics.totalCustomers.toString()],
      ['Average Order Value', formatCurrency(analytics.averageOrderValue)],
      ['Revenue Growth', formatPercentage(analytics.revenueGrowth)],
      ['Order Growth', formatPercentage(analytics.orderGrowth)],
      ['Customer Growth', formatPercentage(analytics.customerGrowth)]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error || 'Failed to load analytics'}</p>
          <Button onClick={loadAnalytics} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? '7 Days' :
                 range === '30d' ? '30 Days' :
                 range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
          
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span className="text-xs font-medium">{formatPercentage(analytics.revenueGrowth)}</span>
                  </div>
                  <span className="text-xs text-gray-500">vs previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${analytics.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.orderGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span className="text-xs font-medium">{formatPercentage(analytics.orderGrowth)}</span>
                  </div>
                  <span className="text-xs text-gray-500">vs previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.averageOrderValue)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    {analytics.totalOrders} orders total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalCustomers}</p>
                  </div>
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${analytics.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.customerGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span className="text-xs font-medium">{formatPercentage(analytics.customerGrowth)}</span>
                  </div>
                  <span className="text-xs text-gray-500">vs previous period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.conversionRate}%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.customerLifetimeValue)}
                </div>
                <div className="text-sm text-gray-600">Customer LTV</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.returnCustomerRate}%</div>
                <div className="text-sm text-gray-600">Return Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics.totalProducts}</div>
                <div className="text-sm text-gray-600">Active Products</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topProducts.slice(0, 8).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.units} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sales} orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {analytics.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Threshold: {product.threshold}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {product.stock} left
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  All products are well stocked! 🎉
                </p>
              )}
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.categoryPerformance.map((category) => (
                  <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{category.name}</h4>
                      <div className={`flex items-center gap-1 ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {category.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span className="text-xs font-medium">{formatPercentage(category.growth)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">{formatCurrency(category.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sales:</span>
                        <span className="font-medium">{category.sales}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Sales Trend Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Sales Trends
              </CardTitle>
              <CardDescription>
                Revenue and order trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Sales trend chart would be rendered here</p>
                  <p className="text-sm text-gray-500">Using a charting library like Recharts or Chart.js</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales by Hour and Region */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.hourlyPatterns
                    .sort((a, b) => b.orders - a.orders)
                    .slice(0, 6)
                    .map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between py-2">
                      <span className="text-sm">
                        {hour.hour.toString().padStart(2, '0')}:00 - {(hour.hour + 1).toString().padStart(2, '0')}:00
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{hour.orders} orders</p>
                        <p className="text-xs text-gray-500">{formatCurrency(hour.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topRegions.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                        <span className="text-sm font-medium">{region.region}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(region.revenue)}</p>
                        <p className="text-xs text-gray-500">{region.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.customerSegments.map((segment) => (
                  <div key={segment.segment} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{segment.segment} Customers</h4>
                      <Badge variant="outline">{segment.count} customers</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Revenue:</span>
                        <p className="font-medium">{formatCurrency(segment.revenue)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Order:</span>
                        <p className="font-medium">{formatCurrency(segment.averageOrder)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Customer Lifetime Value</h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(analytics.customerLifetimeValue)}
                  </p>
                  <p className="text-sm text-blue-600">Average per customer</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Return Customer Rate</h4>
                  <p className="text-2xl font-bold text-green-700">{analytics.returnCustomerRate}%</p>
                  <p className="text-sm text-green-600">Customers who return</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Conversion Rate</h4>
                  <p className="text-2xl font-bold text-purple-700">{analytics.conversionRate}%</p>
                  <p className="text-sm text-purple-600">Visitors who purchase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}