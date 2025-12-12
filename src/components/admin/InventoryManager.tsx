'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  Edit, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  History,
  BarChart3,
  Archive,
  ShoppingCart,
  Truck,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minThreshold: number;
  maxThreshold: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  lastUpdated: string;
  location?: string;
  supplier?: string;
  category: string;
  reservedStock: number;
  availableStock: number;
}

interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'sale' | 'restock' | 'adjustment' | 'return' | 'reservation' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string;
  stockBefore: number;
  stockAfter: number;
  createdAt: string;
  createdBy?: string;
}

interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstocked' | 'expiry_warning';
  currentStock: number;
  threshold: number;
  severity: 'high' | 'medium' | 'low';
  createdAt: string;
  acknowledged: boolean;
}

export default function InventoryManager() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'transactions' | 'alerts'>('overview');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    location: ''
  });

  // Read URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam === 'lowStock') {
      setFilters(prev => ({ ...prev, status: 'low_stock' }));
      setActiveTab('alerts');
    }
  }, []);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch products with inventory data
      const response = await fetch('/api/products?limit=1000');
      const data = await response.json();
      
      if (data.success) {
        const products = data.data;
        
        // Transform products to inventory items
        const items: InventoryItem[] = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          sku: product.sku || `SKU-${product.id.slice(-6).toUpperCase()}`,
          currentStock: product.stockQuantity || 0,
          minThreshold: product.lowStockThreshold || 5,
          maxThreshold: (product.lowStockThreshold || 5) * 10,
          reorderPoint: (product.lowStockThreshold || 5) * 2,
          unitCost: product.price * 0.6, // Assume 40% margin
          totalValue: (product.stockQuantity || 0) * product.price * 0.6,
          status: getStockStatus(product.stockQuantity || 0, product.lowStockThreshold || 5),
          lastUpdated: product.updatedAt,
          location: 'Main Warehouse',
          supplier: 'Default Supplier',
          category: product.category || 'Uncategorized',
          reservedStock: Math.floor((product.stockQuantity || 0) * 0.1), // Mock reserved stock
          availableStock: Math.floor((product.stockQuantity || 0) * 0.9)
        }));
        
        setInventoryItems(items);
        
        // Generate mock stock alerts
        const stockAlerts: StockAlert[] = items
          .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
          .map(item => ({
            id: `alert-${item.id}`,
            productId: item.id,
            productName: item.name,
            alertType: item.status === 'out_of_stock' ? 'out_of_stock' : 'low_stock',
            currentStock: item.currentStock,
            threshold: item.minThreshold,
            severity: item.status === 'out_of_stock' ? 'high' : 'medium',
            createdAt: new Date().toISOString(),
            acknowledged: false
          }));
        
        setAlerts(stockAlerts);
        
        // Generate mock transactions
        const mockTransactions: StockTransaction[] = [];
        for (let i = 0; i < 20; i++) {
          const item = items[Math.floor(Math.random() * items.length)];
          const types: StockTransaction['type'][] = ['sale', 'restock', 'adjustment', 'return'];
          const type = types[Math.floor(Math.random() * types.length)];
          const quantity = Math.floor(Math.random() * 10) + 1;
          const isDecrease = type === 'sale';
          
          mockTransactions.push({
            id: `trans-${Date.now()}-${i}`,
            productId: item.id,
            productName: item.name,
            type,
            quantity: isDecrease ? -quantity : quantity,
            reason: getTransactionReason(type),
            stockBefore: item.currentStock,
            stockAfter: item.currentStock + (isDecrease ? -quantity : quantity),
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'Admin User'
          });
        }
        
        setTransactions(mockTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setError('Failed to load inventory data');
      }
    } catch (err) {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number, threshold: number): InventoryItem['status'] => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= threshold) return 'low_stock';
    if (stock > threshold * 10) return 'overstocked';
    return 'in_stock';
  };

  const getTransactionReason = (type: StockTransaction['type']): string => {
    switch (type) {
      case 'sale': return 'Order fulfillment';
      case 'restock': return 'Supplier delivery';
      case 'adjustment': return 'Stock count correction';
      case 'return': return 'Customer return';
      default: return 'Manual adjustment';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const getStatusBadge = (status: InventoryItem['status']) => {
    const variants = {
      in_stock: 'bg-green-100 text-green-800 border-green-200',
      low_stock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      out_of_stock: 'bg-red-100 text-red-800 border-red-200',
      overstocked: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const labels = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
      overstocked: 'Overstocked'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${variants[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getAlertIcon = (alertType: StockAlert['alertType']) => {
    switch (alertType) {
      case 'out_of_stock':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'overstocked':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionIcon = (type: StockTransaction['type']) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-red-600" />;
      case 'restock':
        return <Truck className="h-4 w-4 text-green-600" />;
      case 'return':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      case 'adjustment':
        return <Edit className="h-4 w-4 text-purple-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !item.sku.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && item.status !== filters.status) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.location && item.location !== filters.location) return false;
    return true;
  });

  const inventoryStats = {
    totalItems: inventoryItems.length,
    totalValue: inventoryItems.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockItems: inventoryItems.filter(item => item.status === 'low_stock').length,
    outOfStockItems: inventoryItems.filter(item => item.status === 'out_of_stock').length,
    totalStock: inventoryItems.reduce((sum, item) => sum + item.currentStock, 0),
    totalReserved: inventoryItems.reduce((sum, item) => sum + item.reservedStock, 0)
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'stock', label: 'Stock Levels', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: alerts.filter(a => !a.acknowledged).length }
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">
            Track stock levels, manage inventory, and monitor alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={loadInventoryData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(inventoryStats.totalValue)}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {inventoryStats.totalItems} products tracked
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock Units</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalStock}</p>
              </div>
              <Archive className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {inventoryStats.totalReserved} reserved
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {inventoryStats.outOfStockItems} out of stock
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => !a.acknowledged).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Require attention
              </p>
            </div>
          </CardContent>
        </Card>
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
                {tab.badge && tab.badge > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Categories by Value */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Categories by Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    inventoryItems.reduce((acc, item) => {
                      acc[item.category] = (acc[item.category] || 0) + item.totalValue;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, value]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-gray-600">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    inventoryItems.reduce((acc, item) => {
                      acc[item.status] = (acc[item.status] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status as InventoryItem['status'])}
                      </div>
                      <span className="text-sm font-medium">{count} items</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Stock Movements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Stock Movements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="text-sm font-medium">{transaction.productName}</p>
                        <p className="text-xs text-gray-500">{transaction.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="overstocked">Overstocked</option>
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">All Categories</option>
                    {Array.from(new Set(inventoryItems.map(item => item.category))).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                            <div className="text-xs text-gray-400">{item.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.currentStock}</div>
                          <div className="text-xs text-gray-500">Min: {item.minThreshold}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.availableStock}</div>
                          <div className="text-xs text-gray-500">{item.reservedStock} reserved</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalValue)}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{formatCurrency(item.unitCost)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.lastUpdated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Stock Transactions
            </CardTitle>
            <CardDescription>
              Complete history of all stock movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="text-sm font-medium">{transaction.productName}</p>
                      <p className="text-xs text-gray-500">{transaction.reason}</p>
                      {transaction.reference && (
                        <p className="text-xs text-gray-400">Ref: {transaction.reference}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.stockBefore} → {transaction.stockAfter}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>
              Stock alerts requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAlertIcon(alert.alertType)}
                        <div>
                          <p className="text-sm font-medium">{alert.productName}</p>
                          <p className="text-xs text-gray-600">
                            {alert.alertType === 'out_of_stock' 
                              ? 'Product is out of stock' 
                              : `Stock level (${alert.currentStock}) is below threshold (${alert.threshold})`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'outline'}>
                          {alert.severity}
                        </Badge>
                        {!alert.acknowledged && (
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-600">
                  All inventory levels are within acceptable ranges.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}