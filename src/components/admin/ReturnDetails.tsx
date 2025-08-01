'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  RotateCcw, 
  Package, 
  DollarSign, 
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Truck,
  AlertCircle,
  Save,
  Mail,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Return {
  id: string;
  return_number: string;
  order_id: string;
  customer_email: string;
  customer_phone?: string;
  return_reason: string;
  return_description?: string;
  status: string;
  return_type: string;
  refund_amount: number;
  requested_at: string;
  orders: {
    order_number: string;
    total: number;
    order_date: string;
  };
}

interface ReturnDetailsData {
  id: string;
  return_number: string;
  order_id: string;
  customer_email: string;
  customer_phone?: string;
  return_reason: string;
  return_description?: string;
  status: string;
  return_type: string;
  refund_amount: number;
  refund_method?: string;
  admin_notes?: string;
  customer_notes?: string;
  qc_status?: string;
  qc_notes?: string;
  tracking_number?: string;
  carrier?: string;
  images?: string[];
  videos?: string[];
  requested_at: string;
  processed_at?: string;
  refunded_at?: string;
  return_items: any[];
  orders: any;
  return_status_history: any[];
}

interface ReturnDetailsProps {
  returnItem: Return;
  onClose: () => void;
  onUpdate: () => void;
}

export function ReturnDetails({ returnItem, onClose, onUpdate }: ReturnDetailsProps) {
  const [returnData, setReturnData] = useState<ReturnDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'history' | 'actions'>('details');
  
  // Form state for updates
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMethod, setRefundMethod] = useState('');
  const [qcStatus, setQcStatus] = useState('');
  const [qcNotes, setQcNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  useEffect(() => {
    loadReturnDetails();
  }, [returnItem.id]);

  const loadReturnDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/returns/${returnItem.id}`);
      const data = await response.json();
      
      if (data.success) {
        setReturnData(data.data);
        // Initialize form values
        setNewStatus(data.data.status);
        setAdminNotes(data.data.admin_notes || '');
        setRefundAmount(data.data.refund_amount || 0);
        setRefundMethod(data.data.refund_method || '');
        setQcStatus(data.data.qc_status || '');
        setQcNotes(data.data.qc_notes || '');
        setTrackingNumber(data.data.tracking_number || '');
        setCarrier(data.data.carrier || '');
      } else {
        setError(data.error || 'Failed to load return details');
      }
    } catch (err) {
      setError('Failed to load return details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReturn = async () => {
    if (!returnData) return;
    
    setUpdating(true);
    try {
      const updateData = {
        status: newStatus,
        adminNotes,
        refundAmount,
        refundMethod,
        qcStatus,
        qcNotes,
        trackingNumber,
        carrier,
        processedBy: 'admin' // TODO: Get actual admin user ID
      };

      const response = await fetch(`/api/returns/${returnData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Return updated successfully');
        onUpdate();
      } else {
        toast.error(data.error || 'Failed to update return');
      }
    } catch (err) {
      toast.error('Failed to update return');
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!returnData) return;

    setUpdating(true);
    try {
      let updateData: any = {
        processedBy: 'admin'
      };

      switch (action) {
        case 'approve':
          updateData.status = 'approved';
          updateData.adminNotes = 'Return approved by admin';
          break;
        case 'reject':
          updateData.status = 'rejected';
          updateData.adminNotes = 'Return rejected by admin';
          break;
        case 'receive':
          updateData.status = 'received';
          updateData.adminNotes = 'Items received for inspection';
          break;
        case 'process':
          updateData.status = 'processed';
          updateData.adminNotes = 'Return processed and ready for refund';
          break;
        case 'refund':
          updateData.status = 'refunded';
          updateData.adminNotes = 'Refund processed';
          updateData.refundMethod = 'original_payment';
          break;
      }

      const response = await fetch(`/api/returns/${returnData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Return ${action}ed successfully`);
        loadReturnDetails(); // Reload to show updated data
      } else {
        toast.error(data.error || `Failed to ${action} return`);
      }
    } catch (err) {
      toast.error(`Failed to ${action} return`);
    } finally {
      setUpdating(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'received': 'bg-purple-100 text-purple-800 border-purple-200',
      'processed': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'refunded': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${variants[status] || variants.pending}`}>
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
                <RotateCcw className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Return {returnItem.return_number}
                </h3>
                <p className="text-sm text-gray-500">Order: {returnItem.orders.order_number}</p>
              </div>
              {getStatusBadge(returnItem.status)}
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
                <span className="ml-3 text-gray-600">Loading return details...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={loadReturnDetails} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : returnData ? (
              <div>
                {/* Tab Navigation */}
                <div className="border-b mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'details', label: 'Details', icon: FileText },
                      { id: 'items', label: 'Items', icon: Package },
                      { id: 'history', label: 'History', icon: Clock },
                      { id: 'actions', label: 'Actions', icon: CheckCircle }
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
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Return Information */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Return Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Return Number</label>
                              <p className="text-sm font-mono">{returnData.return_number}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Return Type</label>
                              <p className="text-sm">{returnData.return_type.charAt(0).toUpperCase() + returnData.return_type.slice(1)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Reason</label>
                              <p className="text-sm">{returnData.return_reason.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Requested</label>
                              <p className="text-sm">{formatDate(returnData.requested_at)}</p>
                            </div>
                          </div>
                          {returnData.return_description && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Description</label>
                              <p className="text-sm text-gray-700">{returnData.return_description}</p>
                            </div>
                          )}
                          {returnData.customer_notes && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Customer Notes</label>
                              <p className="text-sm text-gray-700">{returnData.customer_notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Customer Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Customer Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{returnData.customer_email}</span>
                          </div>
                          {returnData.customer_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{returnData.customer_phone}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Media Attachments */}
                      {(returnData.images?.length > 0 || returnData.videos?.length > 0) && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <ImageIcon className="h-5 w-5" />
                              Media Attachments
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              {returnData.images?.map((image, index) => (
                                <div key={index} className="border rounded-lg p-2">
                                  <img src={image} alt={`Return attachment ${index + 1}`} className="w-full h-32 object-cover rounded" />
                                </div>
                              ))}
                              {returnData.videos?.map((video, index) => (
                                <div key={index} className="border rounded-lg p-2">
                                  <video src={video} controls className="w-full h-32 rounded" />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Order & Refund Information */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Original Order
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Order Number</label>
                              <p className="text-sm font-mono">{returnData.orders.order_number}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Order Total</label>
                              <p className="text-sm">{formatCurrency(returnData.orders.total)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Order Date</label>
                              <p className="text-sm">{formatDate(returnData.orders.created_at)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Order Status</label>
                              <p className="text-sm">{returnData.orders.status}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Refund Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Refund Amount</label>
                              <p className="text-lg font-semibold text-green-600">{formatCurrency(returnData.refund_amount)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Refund Method</label>
                              <p className="text-sm">{returnData.refund_method || 'Not set'}</p>
                            </div>
                            {returnData.processed_at && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Processed Date</label>
                                <p className="text-sm">{formatDate(returnData.processed_at)}</p>
                              </div>
                            )}
                            {returnData.refunded_at && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Refunded Date</label>
                                <p className="text-sm">{formatDate(returnData.refunded_at)}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quality Control */}
                      {returnData.qc_status && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              Quality Control
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-600">QC Status</label>
                              <p className="text-sm">{returnData.qc_status}</p>
                            </div>
                            {returnData.qc_notes && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">QC Notes</label>
                                <p className="text-sm text-gray-700">{returnData.qc_notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Admin Notes */}
                      {returnData.admin_notes && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Admin Notes
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700">{returnData.admin_notes}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'items' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Returned Items</h4>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Unit Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Refund Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Condition
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Restockable
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {returnData.return_items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.product_name}
                                  </div>
                                  {item.variant_name && (
                                    <div className="text-sm text-gray-500">
                                      {item.variant_name}
                                    </div>
                                  )}
                                  {item.product_sku && (
                                    <div className="text-xs text-gray-400">
                                      SKU: {item.product_sku}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity_returned}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(item.total_refund_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.condition_received ? (
                                  <span className="text-sm">{item.condition_received}</span>
                                ) : (
                                  <span className="text-sm text-gray-400">Not inspected</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  item.restockable 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.restockable ? 'Yes' : 'No'}
                                </span>
                                {item.restocked && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Restocked
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Status History</h4>
                    
                    <div className="space-y-4">
                      {returnData.return_status_history.map((history) => (
                        <div key={history.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                Status changed to: {getStatusBadge(history.status)}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDate(history.created_at)}
                              </span>
                            </div>
                            {history.notes && (
                              <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                          Perform common return management actions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {returnData.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleQuickAction('approve')}
                                disabled={updating}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleQuickAction('reject')}
                                disabled={updating}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          {returnData.status === 'approved' && (
                            <Button
                              onClick={() => handleQuickAction('receive')}
                              disabled={updating}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Mark Received
                            </Button>
                          )}
                          {returnData.status === 'received' && (
                            <Button
                              onClick={() => handleQuickAction('process')}
                              disabled={updating}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Process Return
                            </Button>
                          )}
                          {returnData.status === 'processed' && (
                            <Button
                              onClick={() => handleQuickAction('refund')}
                              disabled={updating}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Issue Refund
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Advanced Updates */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Updates</CardTitle>
                        <CardDescription>
                          Update return status and details manually
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="received">Received</option>
                              <option value="processed">Processed</option>
                              <option value="refunded">Refunded</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Refund Amount
                            </label>
                            <input
                              type="number"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Refund Method
                            </label>
                            <select
                              value={refundMethod}
                              onChange={(e) => setRefundMethod(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select method</option>
                              <option value="original_payment">Original Payment</option>
                              <option value="store_credit">Store Credit</option>
                              <option value="bank_transfer">Bank Transfer</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              QC Status
                            </label>
                            <select
                              value={qcStatus}
                              onChange={(e) => setQcStatus(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select QC status</option>
                              <option value="pending">Pending</option>
                              <option value="passed">Passed</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Notes
                          </label>
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add notes about this return..."
                          />
                        </div>

                        <Button
                          onClick={handleUpdateReturn}
                          disabled={updating}
                          className="w-full"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updating ? 'Updating...' : 'Update Return'}
                        </Button>
                      </CardContent>
                    </Card>
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