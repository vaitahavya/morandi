'use client';

import { useState, useEffect } from 'react';
import { useCustomerDetails } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ShoppingCart,
  TrendingUp,
  Package,
  Star,
  Activity,
  User,
  Home,
  CreditCard,
  Clock,
  Eye
} from 'lucide-react';

interface Customer {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  segment: string;
  totalSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  customerLifetimeValue: number;
  daysSinceFirstOrder: number;
  daysSinceLastOrder: number;
  isActive: boolean;
  firstOrderDate: string;
  lastOrderDate: string;
}

interface CustomerDetailsData {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  userId?: string;
  billingAddress: any;
  shippingAddress?: any;
  totalSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  segment: string;
  customerLifetimeValue: number;
  daysSinceFirstOrder: number;
  daysSinceLastOrder: number;
  orderFrequency: number;
  isActive: boolean;
  firstOrderDate: string;
  lastOrderDate: string;
  joinDate: string;
  topProducts: any[];
  statusCounts: Record<string, number>;
  monthlySpending: Record<string, number>;
  orders: any[];
  activityLog: any[];
}

interface CustomerDetailsProps {
  customer: Customer;
  onClose: () => void;
}

export function CustomerDetails({ customer, onClose }: CustomerDetailsProps) {
  const [customerData, setCustomerData] = useState<CustomerDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'activity'>('overview');

  // Remove the old useEffect since we're using TanStack Query

  // Use TanStack Query for customer details
  const { data: customerDetails, isLoading, error: queryError, refetch } = useCustomerDetails(customer.email);
  
  // Update local state when query data changes
  useEffect(() => {
    if (customerDetails) {
      setCustomerData(customerDetails);
    }
  }, [customerDetails]);
  
  // Update loading and error states
  useEffect(() => {
    setLoading(isLoading);
    setError(queryError ? 'Failed to load customer details' : null);
  }, [isLoading, queryError]);

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSegmentBadge = (segment: string) => {
    const variants = {
      'VIP': 'bg-purple-100 text-purple-800 border-purple-200',
      'Loyal': 'bg-green-100 text-green-800 border-green-200',
      'High-Spending': 'bg-blue-100 text-blue-800 border-blue-200',
      'Regular': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'New': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${(variants as any)[segment] || variants.New}`}>
        {segment}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'processing': 'bg-purple-100 text-purple-800 border-purple-200',
      'shipped': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'refunded': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${(variants as any)[status] || variants.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {customer.fullName}
                </h3>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
              {getSegmentBadge(customer.segment)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading customer details...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={() => refetch()} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : customerData ? (
              <div>
                {/* Tab Navigation */}
                <div className="border-b mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview', icon: User },
                      { id: 'orders', label: 'Orders', icon: ShoppingCart },
                      { id: 'activity', label: 'Activity Log', icon: Activity }
                    ].map((tab) => {
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

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-6">
                      {/* Contact Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{customerData.email}</span>
                          </div>
                          {customerData.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{customerData.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              Customer since {formatDate(customerData.joinDate)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Addresses */}
                      {customerData.billingAddress && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Home className="h-5 w-5" />
                              Billing Address
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm space-y-1">
                              <p className="font-medium">
                                {customerData.billingAddress.firstName} {customerData.billingAddress.lastName}
                              </p>
                              {customerData.billingAddress.company && (
                                <p>{customerData.billingAddress.company}</p>
                              )}
                              <p>{customerData.billingAddress.address1}</p>
                              {customerData.billingAddress.address2 && (
                                <p>{customerData.billingAddress.address2}</p>
                              )}
                              <p>
                                {customerData.billingAddress.city}, {customerData.billingAddress.state} {customerData.billingAddress.postcode}
                              </p>
                              <p>{customerData.billingAddress.country}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Top Products */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Top Purchased Products
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {customerData.topProducts.length > 0 ? (
                            <div className="space-y-3">
                              {customerData.topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                  <div>
                                    <p className="text-sm font-medium">{product.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {product.quantity} units purchased
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {formatCurrency(product.revenue)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No products purchased yet</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Customer Metrics */}
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {customerData.totalOrders}
                            </div>
                            <div className="text-sm text-gray-600">Total Orders</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(customerData.totalSpent)}
                            </div>
                            <div className="text-sm text-gray-600">Total Spent</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {formatCurrency(customerData.avgOrderValue)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Order Value</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {formatCurrency(customerData.customerLifetimeValue)}
                            </div>
                            <div className="text-sm text-gray-600">Lifetime Value</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Order Status Distribution */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order Status Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(customerData.statusCounts).map(([status, count]) => (
                              <div key={status} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(status)}
                                </div>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Customer Insights */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Customer Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Order Frequency:</span>
                            <span className="text-sm font-medium">
                              {customerData.orderFrequency.toFixed(1)} orders/month
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Days since first order:</span>
                            <span className="text-sm font-medium">{customerData.daysSinceFirstOrder} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Days since last order:</span>
                            <span className="text-sm font-medium">{customerData.daysSinceLastOrder} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Customer Status:</span>
                            <span className={`text-sm font-medium ${customerData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {customerData.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">Order History</h4>
                      <p className="text-sm text-gray-500">
                        {customerData.orders.length} total orders
                      </p>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customerData.orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {order.orderNumber}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatDate(order.date)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(order.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatCurrency(order.total, order.currency)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">Activity Log</h4>
                      <p className="text-sm text-gray-500">
                        Recent customer activity
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {customerData.activityLog.length > 0 ? (
                        customerData.activityLog.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{activity.description}</p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(activity.date)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Status: {activity.action}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">
                          No activity recorded yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}