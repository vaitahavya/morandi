'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Edit, 
  Download, 
  Package, 
  Truck, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Receipt,
  FileText
} from 'lucide-react';
import { 
  Order, 
  updateOrder,
  getOrderStatusColor, 
  getPaymentStatusColor,
  getOrderStatusLabel,
  getPaymentStatusLabel
} from '@/lib/orders-api';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderDetails({ order, onClose, onUpdate }: OrderDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'shipping' | 'history'>('details');

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${(variants as any)[color] || variants.gray}`}>
        {label}
      </span>
    );
  };

  const tabs = [
    { id: 'details', label: 'Order Details', icon: FileText },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'history', label: 'History', icon: Clock }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Order {order.orderNumber}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: Print invoice */}}
            >
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(order.id)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy ID
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-b px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                {getStatusBadge(order.status, 'order')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Payment:</span>
                {getStatusBadge(order.paymentStatus, 'payment')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(order.total, order.currency)}
              </div>
              <div className="text-sm text-gray-600">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
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

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Order Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {order.billingFirstName} {order.billingLastName}
                    </h4>
                    {order.billingCompany && (
                      <p className="text-sm text-gray-600">{order.billingCompany}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{order.customerEmail}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`mailto:${order.customerEmail}`)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {order.customerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{order.customerPhone}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`tel:${order.customerPhone}`)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {order.user && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">Registered Customer</p>
                      <p className="text-sm">User ID: {order.user.id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.billingFirstName} {order.billingLastName}
                    </p>
                    {order.billingCompany && <p>{order.billingCompany}</p>}
                    <p>{order.billingAddress1}</p>
                    {order.billingAddress2 && <p>{order.billingAddress2}</p>}
                    <p>
                      {order.billingCity}, {order.billingState} {order.billingPostcode}
                    </p>
                    <p>{order.billingCountry}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Method:</span>
                    <span className="text-sm font-medium">
                      {order.paymentMethodTitle || order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(order.paymentStatus, 'payment')}
                  </div>
                  {order.transactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Transaction ID:</span>
                      <span className="text-sm font-mono">{order.transactionId}</span>
                    </div>
                  )}
                  {order.razorpayOrderId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Razorpay Order:</span>
                      <span className="text-sm font-mono">{order.razorpayOrderId}</span>
                    </div>
                  )}
                  {order.razorpayPaymentId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Razorpay Payment:</span>
                      <span className="text-sm font-mono">{order.razorpayPaymentId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Totals */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm">{formatCurrency(order.subtotal, order.currency)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="text-sm">Discount:</span>
                      <span className="text-sm">-{formatCurrency(order.discountAmount, order.currency)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shipping:</span>
                    <span className="text-sm">{formatCurrency(order.shippingCost, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tax:</span>
                    <span className="text-sm">{formatCurrency(order.taxAmount, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 font-medium">
                    <span>Total:</span>
                    <span className="text-lg">{formatCurrency(order.total, order.currency)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        {item.variantName && (
                          <p className="text-sm text-gray-600">Variant: {item.variantName}</p>
                        )}
                        {item.productSku && (
                          <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                        )}
                        {item.attributes && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(item.attributes).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.unitPrice, order.currency)} × {item.quantity}
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(item.totalPrice, order.currency)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.shippingFirstName || order.billingFirstName}{' '}
                      {order.shippingLastName || order.billingLastName}
                    </p>
                    {(order.shippingCompany || order.billingCompany) && (
                      <p>{order.shippingCompany || order.billingCompany}</p>
                    )}
                    <p>{order.shippingAddress1 || order.billingAddress1}</p>
                    {(order.shippingAddress2 || order.billingAddress2) && (
                      <p>{order.shippingAddress2 || order.billingAddress2}</p>
                    )}
                    <p>
                      {order.shippingCity || order.billingCity},{' '}
                      {order.shippingState || order.billingState}{' '}
                      {order.shippingPostcode || order.billingPostcode}
                    </p>
                    <p>{order.shippingCountry || order.billingCountry}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.shippingMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="text-sm font-medium">
                        {order.shippingMethodTitle || order.shippingMethod}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(order.shippingCost, order.currency)}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tracking:</span>
                      <span className="text-sm font-mono">{order.trackingNumber}</span>
                    </div>
                  )}
                  {order.shippingCarrier && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Carrier:</span>
                      <span className="text-sm">{order.shippingCarrier}</span>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estimated Delivery:</span>
                      <span className="text-sm">{formatDate(order.estimatedDelivery)}</span>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shipped At:</span>
                      <span className="text-sm">{formatDate(order.shippedAt)}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Delivered At:</span>
                      <span className="text-sm">{formatDate(order.deliveredAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.customerNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Notes:</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {order.customerNotes}
                      </p>
                    </div>
                  )}
                  {order.adminNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Admin Notes:</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {order.adminNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  <div className="space-y-4">
                    {order.statusHistory.map((entry, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-3 h-3 rounded-full ${
                            entry.status === 'delivered' ? 'bg-green-500' :
                            entry.status === 'cancelled' ? 'bg-red-500' :
                            entry.status === 'shipped' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {getOrderStatusLabel(entry.status)}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No status history available</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => {/* TODO: Open edit form */}}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </div>
      </div>
    </div>
  );
}