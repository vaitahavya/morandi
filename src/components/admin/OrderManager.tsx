'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Download, 
  RefreshCw,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import { 
  Order, 
  OrderFilters, 
  getOrders, 
  getOrderStatusColor, 
  getPaymentStatusColor,
  getOrderStatusLabel,
  getPaymentStatusLabel
} from '@/lib/orders-api';
import { OrderDetails } from './OrderDetails';
import { OrderBulkActions } from './OrderBulkActions';
import { OrderStats } from './OrderStats';
import { OrderStatusUpdate } from './OrderStatusUpdate';
import { useOrders } from '@/hooks/useOrders';

interface OrderManagerProps {
  initialOrders?: Order[];
}

export default function OrderManager({ initialOrders = [] }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20,
    status: '',
    paymentStatus: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Load orders using TanStack Query
  const { data: ordersData, isLoading, error: queryError } = useOrders(filters);
  
  // Update local state when query data changes
  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData.data || []);
      setPagination(ordersData.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    }
  }, [ordersData]);
  
  // Update loading and error states
  useEffect(() => {
    setLoading(isLoading);
    setError(queryError ? 'Failed to load orders' : null);
  }, [isLoading, queryError]);

  // Handle order selection
  const handleOrderSelect = (orderId: string, selected: boolean) => {
    setSelectedOrders(prev => 
      selected 
        ? [...prev, orderId]
        : prev.filter(id => id !== orderId)
    );
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedOrders(selected ? orders.map(o => o.id) : []);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<OrderFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    loadOrders(updatedFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    loadOrders(updatedFilters);
  };

  // Handle order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle status update
  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusUpdate(true);
  };

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency
    }).format(amount);
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

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const color = type === 'order' ? getOrderStatusColor(status) : getPaymentStatusColor(status);
    const label = type === 'order' ? getOrderStatusLabel(status) : getPaymentStatusLabel(status);
    
    const variants = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${(variants as any)[color] || variants.gray}`}>
        {label}
      </span>
    );
  };

  const getOrderIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'processing':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-indigo-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <ShoppingCart className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Stats */}
      <OrderStats />

      {/* Main Order Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Management
              </CardTitle>
              <CardDescription>
                Track and manage customer orders, payments, and fulfillment
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadOrders()}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* TODO: Export orders */}}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.paymentStatus || ''}
                onChange={(e) => handleFilterChange({ paymentStatus: e.target.value })}
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.fromDate || ''}
                onChange={(e) => handleFilterChange({ fromDate: e.target.value })}
                placeholder="From Date"
              />
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.toDate || ''}
                onChange={(e) => handleFilterChange({ toDate: e.target.value })}
                placeholder="To Date"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <OrderBulkActions
              selectedOrders={selectedOrders}
              onSuccess={() => {
                setSelectedOrders([]);
                loadOrders();
              }}
            />
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Orders Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No orders found. Orders will appear here once customers start placing them.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => handleOrderSelect(order.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getOrderIcon(order.status)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.billingFirstName} {order.billingLastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {order.customerEmail}
                          </div>
                          {order.customerPhone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status, 'order')}
                        {order.trackingNumber && (
                          <div className="text-xs text-gray-500 mt-1">
                            Tracking: {order.trackingNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.paymentStatus, 'payment')}
                        {order.paymentMethod && (
                          <div className="text-xs text-gray-500 mt-1">
                            {order.paymentMethodTitle || order.paymentMethod}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total, order.currency)}
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="text-xs text-green-600">
                            -{formatCurrency(order.discountAmount, order.currency)} discount
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </div>
                        {order.deliveredAt && (
                          <div className="text-xs text-green-600">
                            Delivered: {formatDate(order.deliveredAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            title="View Order Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(order)}
                            title="Update Status"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Print invoice */}}
                            title="Print Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} orders
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          onUpdate={() => {
            loadOrders();
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Order Status Update Modal */}
      {showStatusUpdate && selectedOrder && (
        <OrderStatusUpdate
          order={selectedOrder}
          onClose={() => {
            setShowStatusUpdate(false);
            setSelectedOrder(null);
          }}
          onUpdate={() => {
            loadOrders();
            setShowStatusUpdate(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}