'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle, 
  CreditCard,
  AlertTriangle,
  Mail,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { 
  Order, 
  updateOrder,
  getOrderStatusColor, 
  getPaymentStatusColor,
  getOrderStatusLabel,
  getPaymentStatusLabel
} from '@/lib/orders-api';

interface OrderStatusUpdateProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderStatusUpdate({ order, onClose, onUpdate }: OrderStatusUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber || '',
    shippingCarrier: order.shippingCarrier || '',
    estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.split('T')[0] : '',
    adminNotes: order.adminNotes || '',
    statusNote: ''
  });

  const [sendNotification, setSendNotification] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        trackingNumber: formData.trackingNumber || null,
        shippingCarrier: formData.shippingCarrier || null,
        adminNotes: formData.adminNotes || null,
        statusNote: formData.statusNote || `Status updated to ${formData.status}`
      };

      // Add estimated delivery if provided
      if (formData.estimatedDelivery) {
        updateData.estimatedDelivery = new Date(formData.estimatedDelivery).toISOString();
      }

      // Set timestamps for status changes
      if (formData.status === 'shipped' && order.status !== 'shipped') {
        updateData.shippedAt = new Date().toISOString();
      }
      if (formData.status === 'delivered' && order.status !== 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      }

      await updateOrder(order.id, updateData);

      // In a real app, you might send email notifications here
      if (sendNotification && (formData.status !== order.status || formData.paymentStatus !== order.paymentStatus)) {
        console.log('Would send notification email to customer');
      }

      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
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
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const statusFlow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': [],
      'refunded': []
    };
    
    return (statusFlow as any)[currentStatus] || [];
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Update Order Status</h2>
              <p className="text-sm text-gray-600 mt-1">
                Order {order.orderNumber} • {formatCurrency(order.total, order.currency)}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Current Status Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Order Status:</span>
                    {getStatusBadge(order.status, 'order')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                    {getStatusBadge(order.paymentStatus, 'payment')}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Customer: {order.billingFirstName} {order.billingLastName}</p>
                  <p>Email: {order.customerEmail}</p>
                  <p>Items: {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value={order.status}>{getOrderStatusLabel(order.status)} (Current)</option>
                    {getAvailableStatuses(order.status).map((status: string) => (
                      <option key={status} value={status}>
                        {getOrderStatusLabel(status)}
                      </option>
                    ))}
                    {/* Allow all statuses for admin flexibility */}
                    {!getAvailableStatuses(order.status).includes('pending') && order.status !== 'pending' && (
                      <option value="pending">Pending</option>
                    )}
                    {!getAvailableStatuses(order.status).includes('confirmed') && order.status !== 'confirmed' && (
                      <option value="confirmed">Confirmed</option>
                    )}
                    {!getAvailableStatuses(order.status).includes('processing') && order.status !== 'processing' && (
                      <option value="processing">Processing</option>
                    )}
                    {!getAvailableStatuses(order.status).includes('shipped') && order.status !== 'shipped' && (
                      <option value="shipped">Shipped</option>
                    )}
                    {!getAvailableStatuses(order.status).includes('delivered') && order.status !== 'delivered' && (
                      <option value="delivered">Delivered</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="partially_refunded">Partially Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Update Note
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.statusNote}
                    onChange={(e) => setFormData(prev => ({ ...prev, statusNote: e.target.value }))}
                    placeholder="Optional note about this status change..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      placeholder="Enter tracking number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Carrier
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.shippingCarrier}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingCarrier: e.target.value }))}
                      placeholder="e.g., FedEx, UPS, DHL"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.adminNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Internal notes about this order..."
                />
              </CardContent>
            </Card>

            {/* Notification Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Customer Notification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Send email notification to customer about status changes</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Customer will be notified at: {order.customerEmail}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Changes will be saved to order history
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}