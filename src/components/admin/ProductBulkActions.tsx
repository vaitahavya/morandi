'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Download, 
  Upload,
  Star,
  StarOff,
  Package,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';

interface ProductBulkActionsProps {
  selectedProducts: string[];
  onSuccess: () => void;
}

export function ProductBulkActions({ selectedProducts, onSuccess }: ProductBulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBulkAction = async (action: string, value?: any) => {
    if (selectedProducts.length === 0) return;

    let confirmMessage = '';
    switch (action) {
      case 'delete':
        confirmMessage = `Are you sure you want to delete ${selectedProducts.length} product(s)?`;
        break;
      case 'publish':
        confirmMessage = `Publish ${selectedProducts.length} product(s)?`;
        break;
      case 'draft':
        confirmMessage = `Move ${selectedProducts.length} product(s) to draft?`;
        break;
      case 'feature':
        confirmMessage = `Mark ${selectedProducts.length} product(s) as featured?`;
        break;
      case 'unfeature':
        confirmMessage = `Remove featured status from ${selectedProducts.length} product(s)?`;
        break;
      default:
        confirmMessage = `Apply this action to ${selectedProducts.length} product(s)?`;
    }

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    setError(null);

    try {
      const promises = selectedProducts.map(async (productId) => {
        let updateData: any = {};
        
        switch (action) {
          case 'delete':
            return fetch(`/api/products/${productId}`, {
              method: 'DELETE',
            });
          case 'publish':
            updateData = { status: 'published' };
            break;
          case 'draft':
            updateData = { status: 'draft' };
            break;
          case 'private':
            updateData = { status: 'private' };
            break;
          case 'feature':
            updateData = { featured: true };
            break;
          case 'unfeature':
            updateData = { featured: false };
            break;
          case 'instock':
            updateData = { stockStatus: 'instock' };
            break;
          case 'outofstock':
            updateData = { stockStatus: 'outofstock' };
            break;
          case 'category':
            updateData = { category: value };
            break;
          case 'stock':
            updateData = { stockQuantity: parseInt(value) };
            break;
          default:
            return Promise.resolve();
        }

        if (Object.keys(updateData).length > 0) {
          return fetch(`/api/products/${productId}`, {
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

  const handleBulkStockUpdate = () => {
    const stockQuantity = prompt('Enter new stock quantity for all selected products:');
    if (stockQuantity !== null && !isNaN(parseInt(stockQuantity))) {
      handleBulkAction('stock', stockQuantity);
    }
  };

  const handleBulkCategoryUpdate = () => {
    const category = prompt('Enter category name for all selected products:');
    if (category) {
      handleBulkAction('category', category);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      // Fetch selected products data
      const productPromises = selectedProducts.map(id => 
        fetch(`/api/products/${id}`).then(res => res.json())
      );
      
      const products = await Promise.all(productPromises);
      const validProducts = products.filter(p => p.success).map(p => p.data);

      // Generate CSV
      const headers = [
        'ID', 'Name', 'SKU', 'Price', 'Stock Quantity', 'Status', 
        'Featured', 'Category', 'Description', 'Created At'
      ];
      
      const csvContent = [
        headers.join(','),
        ...validProducts.map(product => [
          product.id,
          `"${product.name}"`,
          product.sku || '',
          product.price,
          product.stockQuantity,
          product.status,
          product.featured,
          product.category || '',
          `"${(product.shortDescription || '').replace(/"/g, '""')}"`,
          new Date(product.createdAt).toISOString().split('T')[0]
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
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

  if (selectedProducts.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-sm">
            {selectedProducts.length} selected
          </Badge>
          <span className="text-sm text-gray-600">Bulk Actions:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('publish')}
            disabled={loading}
          >
            <Eye className="h-3 w-3 mr-1" />
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('draft')}
            disabled={loading}
          >
            <EyeOff className="h-3 w-3 mr-1" />
            Draft
          </Button>

          {/* Featured Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('feature')}
            disabled={loading}
          >
            <Star className="h-3 w-3 mr-1" />
            Feature
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('unfeature')}
            disabled={loading}
          >
            <StarOff className="h-3 w-3 mr-1" />
            Unfeature
          </Button>

          {/* Stock Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('instock')}
            disabled={loading}
          >
            <Package className="h-3 w-3 mr-1" />
            In Stock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('outofstock')}
            disabled={loading}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Out of Stock
          </Button>

          {/* Update Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkStockUpdate}
            disabled={loading}
          >
            <Edit className="h-3 w-3 mr-1" />
            Update Stock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkCategoryUpdate}
            disabled={loading}
          >
            <Edit className="h-3 w-3 mr-1" />
            Update Category
          </Button>

          {/* Export/Import Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading}
          >
            <Download className="h-3 w-3 mr-1" />
            Export CSV
          </Button>

          {/* Delete Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('delete')}
            disabled={loading}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-2 text-sm text-blue-600">
          Processing bulk action...
        </div>
      )}
    </div>
  );
}