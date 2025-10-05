'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  RefreshCw,
  Download,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
  Star,
  Activity
} from 'lucide-react';
import { CustomerStats } from './CustomerStats';
import { CustomerDetails } from './CustomerDetails';
import { useCustomers } from '@/hooks/useCustomers';

interface Customer {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  city?: string;
  country?: string;
  userId?: string;
  totalSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  segment: string;
  customerLifetimeValue: number;
  daysSinceFirstOrder: number;
  daysSinceLastOrder: number;
  isActive: boolean;
  firstOrderDate: string;
  lastOrderDate: string;
}

interface CustomerFilters {
  page: number;
  limit: number;
  search?: string;
  segment?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface CustomerManagerProps {
  initialCustomers?: Customer[];
}

export default function CustomerManager({ initialCustomers = [] }: CustomerManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 20,
    sortBy: 'lastOrderDate',
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

  // Load customers using TanStack Query
  const { data: customersData, isLoading, error: queryError } = useCustomers(filters);
  
  // Update local state when query data changes
  useEffect(() => {
    if (customersData) {
      setCustomers(customersData.data || []);
      setPagination(customersData.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      setStats(customersData.stats || null);
    }
  }, [customersData]);
  
  // Update loading and error states
  useEffect(() => {
    setLoading(isLoading);
    setError(queryError ? 'Failed to load customers' : null);
  }, [isLoading, queryError]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    loadCustomers(updatedFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    loadCustomers(updatedFilters);
  };

  // Handle customer details view
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
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
      day: 'numeric'
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

  const getActivityIcon = (segment: string) => {
    switch (segment) {
      case 'VIP':
        return <Star className="h-4 w-4 text-purple-600" />;
      case 'Loyal':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'High-Spending':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Stats */}
      <CustomerStats stats={stats} />

      {/* Main Customer Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Management
              </CardTitle>
              <CardDescription>
                View and manage customer profiles, order history, and segments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCustomers()}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* TODO: Export customers */}}
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
                  placeholder="Search customers by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.segment || ''}
                onChange={(e) => handleFilterChange({ segment: e.target.value })}
              >
                <option value="">All Segments</option>
                <option value="vip">VIP</option>
                <option value="loyal">Loyal</option>
                <option value="high-spending">High-Spending</option>
                <option value="regular">Regular</option>
                <option value="new">New</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                }}
              >
                <option value="lastOrderDate-desc">Recently Active</option>
                <option value="totalSpent-desc">Highest Spending</option>
                <option value="totalOrders-desc">Most Orders</option>
                <option value="firstOrderDate-desc">Recently Joined</option>
                <option value="fullName-asc">Name A-Z</option>
                <option value="avgOrderValue-desc">Highest AOV</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Customers Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No customers found. Customers will appear here once orders are placed.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getActivityIcon(customer.segment)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.fullName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.city && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {customer.city}, {customer.country}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSegmentBadge(customer.segment)}
                        <div className="text-xs text-gray-500 mt-1">
                          CLV: {formatCurrency(customer.customerLifetimeValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.totalOrders} orders
                        </div>
                        <div className="text-xs text-gray-500">
                          AOV: {formatCurrency(customer.avgOrderValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(customer.totalSpent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(customer.lastOrderDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.daysSinceLastOrder} days ago
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          customer.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                          title="View Customer Details"
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
                {pagination.total} customers
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

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerDetails(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}