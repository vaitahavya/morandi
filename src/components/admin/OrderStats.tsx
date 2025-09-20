'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Users,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';

interface OrderStatsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingPayments: number;
  paidOrders: number;
  failedPayments: number;
  todayOrders: number;
  todayRevenue: number;
  yesterdayOrders: number;
  yesterdayRevenue: number;
  topCustomers: Array<{
    customerEmail: string;
    orderCount: number;
    totalSpent: number;
  }>;
  recentActivity: Array<{
    type: 'order_placed' | 'payment_received' | 'order_shipped' | 'order_delivered';
    orderNumber: string;
    customerName: string;
    amount?: number;
    timestamp: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
}

export function OrderStats() {
  const [stats, setStats] = useState<OrderStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch orders with date filtering based on timeRange
      const params = new URLSearchParams({ limit: '1000' });
      
      // Add date filters based on timeRange
      const now = new Date();
      switch (timeRange) {
        case 'today':
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          params.append('fromDate', startOfDay.toISOString());
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.append('fromDate', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          params.append('fromDate', monthAgo.toISOString());
          break;
        // 'all' - no date filter
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        const orders = data.data;
        
        // Calculate basic stats
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Status counts
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
        const confirmedOrders = orders.filter((o: any) => o.status === 'confirmed').length;
        const shippedOrders = orders.filter((o: any) => o.status === 'shipped').length;
        const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
        const cancelledOrders = orders.filter((o: any) => o.status === 'cancelled').length;
        
        // Payment stats
        const pendingPayments = orders.filter((o: any) => o.paymentStatus === 'pending').length;
        const paidOrders = orders.filter((o: any) => o.paymentStatus === 'paid').length;
        const failedPayments = orders.filter((o: any) => o.paymentStatus === 'failed').length;
        
        // Today vs yesterday comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        const todayOrders = orders.filter((o: any) => 
          new Date(o.createdAt) >= today
        );
        const yesterdayOrders = orders.filter((o: any) => 
          new Date(o.createdAt) >= yesterday && new Date(o.createdAt) < today
        );
        
        const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + order.total, 0);
        const yesterdayRevenue = yesterdayOrders.reduce((sum: number, order: any) => sum + order.total, 0);
        
        // Top customers (group by email)
        const customerStats: { [email: string]: { orderCount: number; totalSpent: number; name: string } } = {};
        orders.forEach((order: any) => {
          const email = order.customerEmail;
          if (!customerStats[email]) {
            customerStats[email] = {
              orderCount: 0,
              totalSpent: 0,
              name: `${order.billingFirstName} ${order.billingLastName}`
            };
          }
          customerStats[email].orderCount++;
          customerStats[email].totalSpent += order.total;
        });
        
        const topCustomers = Object.entries(customerStats)
          .map(([email, stats]) => ({
            customerEmail: email,
            customerName: stats.name,
            orderCount: stats.orderCount,
            totalSpent: stats.totalSpent
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 5);
        
        // Recent activity (mock for now - in real app, this would come from an activity log)
        const recentActivity = orders
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map((order: any) => ({
            type: order.status === 'delivered' ? 'order_delivered' :
                  order.status === 'shipped' ? 'order_shipped' :
                  order.paymentStatus === 'paid' ? 'payment_received' : 'order_placed',
            orderNumber: order.orderNumber,
            customerName: `${order.billingFirstName} ${order.billingLastName}`,
            amount: order.total,
            timestamp: order.createdAt
          }));
        
        // Monthly trends (last 6 months)
        const monthlyTrends = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthOrders = orders.filter((o: any) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= monthStart && orderDate <= monthEnd;
          });
          
          monthlyTrends.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            orders: monthOrders.length,
            revenue: monthOrders.reduce((sum: number, order: any) => sum + order.total, 0)
          });
        }

        setStats({
          totalOrders,
          totalRevenue,
          averageOrderValue,
          pendingOrders,
          confirmedOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          pendingPayments,
          paidOrders,
          failedPayments,
          todayOrders: todayOrders.length,
          todayRevenue,
          yesterdayOrders: yesterdayOrders.length,
          yesterdayRevenue,
          topCustomers,
          recentActivity,
          monthlyTrends
        });
      } else {
        setError('Failed to load order stats');
      }
    } catch (err) {
      setError('Failed to load order stats');
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

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = calculatePercentageChange(stats.todayRevenue, stats.yesterdayRevenue);
  const ordersChange = calculatePercentageChange(stats.todayOrders, stats.yesterdayOrders);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order Analytics</h3>
        <div className="flex items-center gap-2">
          {(['today', 'week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`flex items-center gap-1 ${ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ordersChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="text-xs font-medium">{Math.abs(ordersChange).toFixed(1)}%</span>
              </div>
              <span className="text-xs text-gray-500">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`flex items-center gap-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="text-xs font-medium">{Math.abs(revenueChange).toFixed(1)}%</span>
              </div>
              <span className="text-xs text-gray-500">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.averageOrderValue)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {stats.totalOrders} orders total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {stats.pendingPayments} pending payments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Pending', count: stats.pendingOrders, color: 'bg-yellow-500', icon: Clock },
                { label: 'Confirmed', count: stats.confirmedOrders, color: 'bg-blue-500', icon: CheckCircle },
                { label: 'Shipped', count: stats.shippedOrders, color: 'bg-indigo-500', icon: Truck },
                { label: 'Delivered', count: stats.deliveredOrders, color: 'bg-green-500', icon: CheckCircle },
                { label: 'Cancelled', count: stats.cancelledOrders, color: 'bg-red-500', icon: XCircle }
              ].map((status) => {
                const Icon = status.icon;
                const percentage = stats.totalOrders > 0 ? (status.count / stats.totalOrders) * 100 : 0;
                return (
                  <div key={status.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{status.count}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCustomers.length > 0 ? (
              <div className="space-y-3">
                {stats.topCustomers.map((customer, index) => (
                  <div key={customer.customerEmail} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {customer.customerEmail.split('@')[0] || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {customer.customerEmail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No customer data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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
              {stats.recentActivity.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${
                      activity.type === 'order_delivered' ? 'bg-green-100 text-green-600' :
                      activity.type === 'order_shipped' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'payment_received' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'order_delivered' ? <CheckCircle className="h-3 w-3" /> :
                       activity.type === 'order_shipped' ? <Truck className="h-3 w-3" /> :
                       activity.type === 'payment_received' ? <DollarSign className="h-3 w-3" /> :
                       <ShoppingCart className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.type === 'order_delivered' ? 'Order Delivered' :
                         activity.type === 'order_shipped' ? 'Order Shipped' :
                         activity.type === 'payment_received' ? 'Payment Received' :
                         'Order Placed'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.orderNumber} • {activity.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-medium">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
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
  );
}