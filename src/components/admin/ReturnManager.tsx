'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  Download,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  Calendar,
  AlertCircle,
  Truck,
  FileText
} from 'lucide-react';
import { ReturnStats } from './ReturnStats';
import { ReturnDetails } from './ReturnDetails';

interface Return {
  id: string;
  returnNumber: string;
  orderId: string;
  customerEmail: string;
  customerPhone?: string;
  returnReason: string;
  returnDescription?: string;
  status: string;
  returnType: string;
  refundAmount: number;
  createdAt: string;
  processedAt?: string;
  refundedAt?: string;
  returnItems: any[];
  order: {
    orderNumber: string;
    total: number;
    createdAt: string;
  };
}

interface ReturnFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
}

interface ReturnManagerProps {
  initialReturns?: Return[];
}

export default function ReturnManager({ initialReturns = [] }: ReturnManagerProps) {
  const [returns, setReturns] = useState<Return[]>(initialReturns);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [showReturnDetails, setShowReturnDetails] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<ReturnFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Load returns
  const loadReturns = async (newFilters?: ReturnFilters) => {
    setLoading(true);
    setError(null);
    try {
      const currentFilters = newFilters || filters;
      const response = await fetch(`/api/returns?${new URLSearchParams(
        Object.entries(currentFilters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString()}`);
      
      const data = await response.json();
      if (data.success) {
        setReturns(data.data);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load returns');
      }
    } catch (err) {
      setError('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ReturnFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    loadReturns(updatedFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    loadReturns(updatedFilters);
  };

  // Handle return details view
  const handleViewReturn = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setShowReturnDetails(true);
  };

  // Load returns on mount
  useEffect(() => {
    loadReturns();
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
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${(variants as any)[status] || variants.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'received':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'processed':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'refunded':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getReasonBadge = (reason: string) => {
    const variants = {
      'defective': 'bg-red-50 text-red-700',
      'wrong_item': 'bg-orange-50 text-orange-700',
      'not_as_described': 'bg-yellow-50 text-yellow-700',
      'changed_mind': 'bg-blue-50 text-blue-700',
      'damaged_shipping': 'bg-purple-50 text-purple-700',
      'other': 'bg-gray-50 text-gray-700'
    };

    const labels = {
      'defective': 'Defective',
      'wrong_item': 'Wrong Item',
      'not_as_described': 'Not as Described',
      'changed_mind': 'Changed Mind',
      'damaged_shipping': 'Damaged in Shipping',
      'other': 'Other'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${(variants as any)[reason] || variants.other}`}>
        {(labels as any)[reason] || reason}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Return Stats */}
      <ReturnStats stats={stats} />

      {/* Main Return Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Returns & Refunds Management
              </CardTitle>
              <CardDescription>
                Manage customer return requests, approve refunds, and track return status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadReturns()}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* TODO: Export returns */}}
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
                  placeholder="Search by return number, customer email..."
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="received">Received</option>
                <option value="processed">Processed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
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
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                }}
              >
                <option value="createdAt-desc">Recently Requested</option>
                <option value="refundAmount-desc">Highest Refund</option>
                <option value="returnNumber-asc">Return Number</option>
                <option value="status-asc">Status</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Returns Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Requested
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading returns...
                    </td>
                  </tr>
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No returns found. Return requests will appear here when customers request them.
                    </td>
                  </tr>
                ) : (
                  returns.map((returnItem) => (
                    <tr key={returnItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getStatusIcon(returnItem.status)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {returnItem.returnNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              Order: {returnItem.order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {returnItem.returnItems.length} item{returnItem.returnItems.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {returnItem.customerEmail}
                          </div>
                          {returnItem.customerPhone && (
                            <div className="text-sm text-gray-500">
                              {returnItem.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getReasonBadge(returnItem.returnReason)}
                        {returnItem.returnDescription && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {returnItem.returnDescription}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(returnItem.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          {returnItem.returnType.charAt(0).toUpperCase() + returnItem.returnType.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(returnItem.refundAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(returnItem.createdAt)}
                        </div>
                        {returnItem.processedAt && (
                          <div className="text-xs text-gray-500">
                            Processed: {formatDate(returnItem.processedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReturn(returnItem)}
                          title="View Return Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                {pagination.total} returns
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

      {/* Return Details Modal */}
      {showReturnDetails && selectedReturn && (
        <ReturnDetails
          returnItem={selectedReturn}
          onClose={() => {
            setShowReturnDetails(false);
            setSelectedReturn(null);
          }}
          onUpdate={() => {
            loadReturns();
            setShowReturnDetails(false);
            setSelectedReturn(null);
          }}
        />
      )}
    </div>
  );
}