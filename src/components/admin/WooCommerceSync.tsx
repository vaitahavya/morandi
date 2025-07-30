'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';

interface SyncStatus {
  success: boolean;
  message: string;
  syncedCount?: number;
  totalProducts?: number;
  woocommerceProducts?: number;
  supabaseProducts?: number;
  sampleProduct?: {
    id: string;
    name: string;
    price: number;
    category?: string;
  };
  error?: string;
}

export default function WooCommerceSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<SyncStatus | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/woocommerce/sync-products');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Failed to test connection',
        error: 'Network error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/woocommerce/sync-products', {
        method: 'POST',
      });
      const data = await response.json();
      setSyncStatus(data);
      
      // Refresh connection status after sync
      if (data.success) {
        setTimeout(testConnection, 1000);
      }
    } catch (error) {
      setSyncStatus({
        success: false,
        message: 'Failed to sync products',
        error: 'Network error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            WooCommerce Integration
          </CardTitle>
          <CardDescription>
            Sync products from your WooCommerce store to your local database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Connection Status</h3>
              <p className="text-sm text-gray-600">
                Test your WooCommerce API connection
              </p>
            </div>
            <Button
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>

          {connectionStatus && (
            <div className={`p-4 rounded-lg border ${
              connectionStatus.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  {connectionStatus.success ? 'Connected' : 'Connection Failed'}
                </span>
              </div>
              <p className="text-sm mt-1">{connectionStatus.message}</p>
              
              {connectionStatus.success && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">
                      WooCommerce: {connectionStatus.woocommerceProducts || 0} products
                    </Badge>
                    <Badge variant="secondary">
                      Supabase: {connectionStatus.supabaseProducts || 0} products
                    </Badge>
                  </div>
                  {connectionStatus.sampleProduct && (
                    <div className="text-xs text-gray-600">
                      Sample: {connectionStatus.sampleProduct.name} - ${connectionStatus.sampleProduct.price}
                    </div>
                  )}
                </div>
              )}
              
              {connectionStatus.error && (
                <div className="mt-2 text-sm text-red-600">
                  Error: {connectionStatus.error}
                </div>
              )}
            </div>
          )}

          {/* Sync Products */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sync Products</h3>
              <p className="text-sm text-gray-600">
                Import all products from WooCommerce to your database
              </p>
            </div>
            <Button
              onClick={syncProducts}
              disabled={isLoading || !connectionStatus?.success}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync Products
            </Button>
          </div>

          {syncStatus && (
            <div className={`p-4 rounded-lg border ${
              syncStatus.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {syncStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  {syncStatus.success ? 'Sync Complete' : 'Sync Failed'}
                </span>
              </div>
              <p className="text-sm mt-1">{syncStatus.message}</p>
              
              {syncStatus.success && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">
                      Synced: {syncStatus.syncedCount || 0} products
                    </Badge>
                    <Badge variant="secondary">
                      Total: {syncStatus.totalProducts || 0} products
                    </Badge>
                  </div>
                  {syncStatus.sampleProduct && (
                    <div className="text-xs text-gray-600">
                      Sample: {syncStatus.sampleProduct.name} - ${syncStatus.sampleProduct.price}
                      {syncStatus.sampleProduct.category && (
                        <span className="ml-2">({syncStatus.sampleProduct.category})</span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {syncStatus.error && (
                <div className="mt-2 text-sm text-red-600">
                  Error: {syncStatus.error}
                </div>
              )}
            </div>
          )}

          {/* Setup Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>1. Configure your WooCommerce API credentials in <code className="bg-blue-100 px-1 rounded">.env.local</code>:</p>
              <div className="ml-4 space-y-1">
                <p><code>WORDPRESS_API_URL=https://your-site.com/wp-json</code></p>
                <p><code>WC_CONSUMER_KEY=your_consumer_key</code></p>
                <p><code>WC_CONSUMER_SECRET=your_consumer_secret</code></p>
              </div>
              <p>2. Test the connection using the button above</p>
              <p>3. Sync products to import them into your database</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 