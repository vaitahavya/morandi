'use client';

import { useState, useEffect } from 'react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { ProductFilters } from '@/interfaces/IProductRepository';
import { ProductManagerUI } from './ProductManagerUI';
import { ProductFiltersComponent } from './ProductFiltersComponent';
import { ProductTableComponent } from './ProductTableComponent';
import { ProductPaginationComponent } from './ProductPaginationComponent';
import { ProductForm } from './ProductForm';
import { ProductBulkActions } from './ProductBulkActions';
import { ProductStats } from './ProductStats';
import { ProductBulkUpload } from './ProductBulkUpload';

interface ProductManagerProps {
  initialProducts?: any[];
}

export default function ProductManager({ initialProducts = [] }: ProductManagerProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    // Use 'all' to show all products regardless of status in admin
    status: 'all' as any,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  // Use TanStack Query for products
  const { data: productsData, isLoading, error: queryError } = useProducts(filters);
  const deleteProductMutation = useDeleteProduct();

  // Extract data from query result
  const products = productsData?.data || initialProducts;
  const pagination = productsData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProductMutation.mutateAsync(productId);
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Handle product selection
  const handleProductSelect = (productId: string, selected: boolean) => {
    setSelectedProducts(prev => 
      selected 
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedProducts(selected ? products.map(p => p.id) : []);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
  };

  // Handle product form success
  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    // TanStack Query will automatically refetch
  };

  // Handle bulk upload success
  const handleBulkUploadSuccess = () => {
    setShowBulkUpload(false);
    // TanStack Query will automatically refetch
  };

  return (
    <ProductManagerUI
      loading={isLoading}
      error={queryError ? 'Failed to load products' : null}
      onRefresh={() => window.location.reload()}
      onAddProduct={() => setShowProductForm(true)}
      onBulkUpload={() => setShowBulkUpload(true)}
    >
      <ProductStats />
      
      <ProductFiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {selectedProducts.length > 0 && (
        <ProductBulkActions
          selectedProducts={selectedProducts}
          onSuccess={() => {
            setSelectedProducts([]);
            // TanStack Query will automatically refetch
          }}
        />
      )}

      <ProductTableComponent
        products={products}
        loading={isLoading}
        selectedProducts={selectedProducts}
        onProductSelect={handleProductSelect}
        onSelectAll={handleSelectAll}
        onEditProduct={(product) => {
          setEditingProduct(product);
          setShowProductForm(true);
        }}
        onDeleteProduct={handleDeleteProduct}
        onViewProduct={(product) => {
          window.open(`/products/${product.slug}`, '_blank');
        }}
      />

      {pagination.totalPages > 1 && (
        <ProductPaginationComponent
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSuccess={handleProductFormSuccess}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showBulkUpload && (
        <ProductBulkUpload
          onSuccess={handleBulkUploadSuccess}
          onCancel={() => setShowBulkUpload(false)}
        />
      )}
    </ProductManagerUI>
  );
}
