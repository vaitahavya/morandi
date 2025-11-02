import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Search, AlertCircle, Upload } from 'lucide-react';

interface ProductManagerUIProps {
  children: ReactNode;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onAddProduct: () => void;
  onBulkUpload?: () => void;
}

export function ProductManagerUI({ 
  children, 
  loading, 
  error, 
  onRefresh, 
  onAddProduct,
  onBulkUpload
}: ProductManagerUIProps) {
  return (
    <div className="space-y-6">
      {/* Main Product Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Management
              </CardTitle>
              <CardDescription>
                Manage your product catalog, inventory, and categories
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {onBulkUpload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkUpload}
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              )}
              <Button
                onClick={onAddProduct}
                size="sm"
              >
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {children}
        </CardContent>
      </Card>
    </div>
  );
}
