'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle, 
  Download, 
  Mail,
  AlertTriangle,
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface OrderBulkActionsProps {
  selectedOrders: string[];
  onSuccess: () => void;
}

export function OrderBulkActions({ selectedOrders, onSuccess }: OrderBulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBulkAction = async (action: string, value?: any) => {
    if (selectedOrders.length === 0) return;

    let confirmMessage = '';
    switch (action) {
      case 'confirm':
        confirmMessage = `Confirm ${selectedOrders.length} order(s)?`;
        break;
      case 'ship':
        confirmMessage = `Mark ${selectedOrders.length} order(s) as shipped?`;
        break;
      case 'deliver':
        confirmMessage = `Mark ${selectedOrders.length} order(s) as delivered?`;
        break;
      case 'cancel':
        confirmMessage = `Cancel ${selectedOrders.length} order(s)? This action cannot be undone.`;
        break;
      case 'mark_paid':
        confirmMessage = `Mark payment as received for ${selectedOrders.length} order(s)?`;
        break;
      case 'refund':
        confirmMessage = `Mark ${selectedOrders.length} order(s) as refunded?`;
        break;
      default:
        confirmMessage = `Apply this action to ${selectedOrders.length} order(s)?`;
    }

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    setError(null);

    try {
      const promises = selectedOrders.map(async (orderId) => {
        let updateData: any = {};
        
        switch (action) {
          case 'confirm':
            updateData = { status: 'confirmed' };
            break;
          case 'process':
            updateData = { status: 'processing' };
            break;
          case 'ship':
            updateData = { status: 'shipped', shippedAt: new Date().toISOString() };
            break;
          case 'deliver':
            updateData = { status: 'delivered', deliveredAt: new Date().toISOString() };
            break;
          case 'cancel':
            updateData = { status: 'cancelled' };
            break;
          case 'mark_paid':
            updateData = { paymentStatus: 'paid' };
            break;
          case 'mark_failed':
            updateData = { paymentStatus: 'failed' };
            break;
          case 'refund':
            updateData = { paymentStatus: 'refunded' };
            break;
          case 'add_tracking':
            const trackingNumber = prompt('Enter tracking number:');
            if (!trackingNumber) return Promise.resolve();
            updateData = { trackingNumber };
            break;
          case 'set_carrier':
            const carrier = prompt('Enter shipping carrier:');
            if (!carrier) return Promise.resolve();
            updateData = { shippingCarrier: carrier };
            break;
          default:
            return Promise.resolve();
        }

        if (Object.keys(updateData).length > 0) {
          return fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });
        }
        
        return Promise.resolve();
      });

      const results = await Promise.allSettled(promises);
      
      // Check for any failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        setError(`${failures.length} operation(s) failed`);
      }

      onSuccess();
    } catch (err) {
      setError('Bulk operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExportOrders = async () => {
    setLoading(true);
    try {
      // Fetch selected orders data
      const orderPromises = selectedOrders.map(id => 
        fetch(`/api/orders/${id}`).then(res => res.json())
      );
      
      const orders = await Promise.all(orderPromises);
      const validOrders = orders.filter(o => o.success).map(o => o.data);

      // Generate CSV
      const headers = [
        'Order Number', 'Date', 'Customer Name', 'Customer Email', 'Status', 
        'Payment Status', 'Total', 'Currency', 'Items', 'Shipping Address', 'Payment Method'
      ];
      
      const csvContent = [
        headers.join(','),
        ...validOrders.map(order => [
          order.orderNumber,
          new Date(order.createdAt).toISOString().split('T')[0],
          `"${order.billingFirstName} ${order.billingLastName}"`,
          order.customerEmail,
          order.status,
          order.paymentStatus,
          order.total,
          order.currency,
          order.items.length,
          `"${order.shippingAddress1 || order.billingAddress1}, ${order.shippingCity || order.billingCity}"`,
          order.paymentMethodTitle || order.paymentMethod || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = () => {
    const action = prompt(
      'Select email type:\n' +
      '1. Order confirmation\n' +
      '2. Shipping notification\n' +
      '3. Delivery confirmation\n' +
      '4. Custom message\n\n' +
      'Enter number (1-4):'
    );

    if (!action || !['1', '2', '3', '4'].includes(action)) return;

    let emailType = '';
    switch (action) {
      case '1':
        emailType = 'order_confirmation';
        break;
      case '2':
        emailType = 'shipping_notification';
        break;
      case '3':
        emailType = 'delivery_confirmation';
        break;
      case '4':
        const customMessage = prompt('Enter custom message:');
        if (!customMessage) return;
        emailType = 'custom';
        break;
    }

    // In a real application, you'd call an API to send emails
    // For now, just show a confirmation
    if (confirm(`Send ${emailType.replace('_', ' ')} emails to ${selectedOrders.length} customer(s)?`)) {
      alert('Emails would be sent in a real implementation');
    }
  };

  if (selectedOrders.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-sm">
            {selectedOrders.length} selected
          </Badge>
          <span className="text-sm text-gray-600">Bulk Actions:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Order Status Actions */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('confirm')}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('process')}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              <Package className="h-3 w-3 mr-1" />
              Process
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('ship')}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              <Truck className="h-3 w-3 mr-1" />
              Ship
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('deliver')}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Deliver
            </Button>
          </div>

          {/* Payment Actions */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
            <span className="text-xs font-medium text-gray-500">Payment:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('mark_paid')}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Mark Paid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('refund')}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refund
            </Button>
          </div>

          {/* Shipping Actions */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
            <span className="text-xs font-medium text-gray-500">Shipping:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('add_tracking')}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              <Truck className="h-3 w-3 mr-1" />
              Add Tracking
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('set_carrier')}
              disabled={loading}
              className="h-6 px-2 text-xs"
            >
              <Package className="h-3 w-3 mr-1" />
              Set Carrier
            </Button>
          </div>

          {/* Communication Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmail}
            disabled={loading}
          >
            <Mail className="h-3 w-3 mr-1" />
            Send Email
          </Button>

          {/* Export Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportOrders}
            disabled={loading}
          >
            <Download className="h-3 w-3 mr-1" />
            Export CSV
          </Button>

          {/* Danger Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('cancel')}
            disabled={loading}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Processing bulk action...
        </div>
      )}

      {/* Quick Actions Help */}
      <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border">
        <strong>Quick Actions:</strong>
        <span className="ml-2">
          Confirm orders → Process → Ship → Deliver | Mark payments as Paid/Refunded | Add tracking info | Send customer emails
        </span>
      </div>
    </div>
  );
}