'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { queryKeys } from '@/lib/query-client';

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; product: string; error: string }>;
}

interface ProductBulkUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductBulkUpload({ onSuccess, onCancel }: ProductBulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.type === 'application/json' || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.json')) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please select a CSV or JSON file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data.result);

      if (data.result.success > 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.products.details() });

        // Auto-close after 2 seconds if successful
        setTimeout(() => {
          if (data.result.failed === 0) {
            onSuccess();
          }
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload products');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csvTemplate = `name,slug,sku,description,shortDescription,regularPrice,salePrice,stockQuantity,stockStatus,manageStock,status,featured,weight,category,images,tags
Sample Product 1,sample-product-1,SKU-001,"Full description here","Short description",1000,800,50,instock,true,published,false,0.5,Category Name,"https://example.com/image1.jpg;https://example.com/image2.jpg","tag1;tag2"
Sample Product 2,sample-product-2,SKU-002,"Another product description","Short desc",1500,,100,instock,true,published,true,0.3,Category Name,"https://example.com/image3.jpg",tag3`;

      const blob = new Blob([csvTemplate], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-bulk-upload-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonTemplate = [
        {
          name: 'Sample Product 1',
          slug: 'sample-product-1',
          sku: 'SKU-001',
          description: 'Full description here',
          shortDescription: 'Short description',
          regularPrice: 1000,
          salePrice: 800,
          stockQuantity: 50,
          stockStatus: 'instock',
          manageStock: true,
          status: 'published',
          featured: false,
          weight: '0.5',
          category: 'Category Name',
          selectedCategories: ['category-id-1'],
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
          tags: ['tag1', 'tag2']
        },
        {
          name: 'Sample Product 2',
          slug: 'sample-product-2',
          sku: 'SKU-002',
          description: 'Another product description',
          shortDescription: 'Short desc',
          regularPrice: 1500,
          stockQuantity: 100,
          stockStatus: 'instock',
          manageStock: true,
          status: 'published',
          featured: true,
          weight: '0.3',
          category: 'Category Name',
          selectedCategories: ['category-id-1'],
          images: ['https://example.com/image3.jpg'],
          tags: ['tag3']
        }
      ];

      const blob = new Blob([JSON.stringify(jsonTemplate, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-bulk-upload-template.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Product Upload
                </CardTitle>
                <CardDescription>
                  Upload multiple products at once using CSV or JSON format
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Downloads */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Download Template
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('csv')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('json')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  JSON Template
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-upload-file"
                disabled={uploading}
              />
              <label
                htmlFor="bulk-upload-file"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {file ? (
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload CSV or JSON file</p>
                    <p className="text-xs text-gray-500 mt-1">Accepted formats: .csv, .json</p>
                  </div>
                )}
              </label>
              {file && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setError(null);
                  }}
                  className="mt-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove File
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Successfully uploaded {result.success} product{result.success !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {result.failed > 0 && (
                    <p className="text-sm text-green-700">
                      {result.failed} product{result.failed !== 1 ? 's' : ''} failed to upload
                    </p>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Errors:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.errors.map((err, index) => (
                        <div key={index} className="text-sm text-yellow-700">
                          <span className="font-medium">Row {err.row}:</span> {err.product} - {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onCancel} disabled={uploading}>
                {result && result.failed === 0 ? 'Close' : 'Cancel'}
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Products
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

