'use client';

import { Info } from 'lucide-react';

export default function MockDataNotice() {
  // Check if we're using mock data
  const isUsingMockData = !process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL === 'https://your-actual-wordpress-site.com/wp-json' ||
    !process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || 
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY === 'your_actual_consumer_key';

  if (!isUsingMockData) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
        <div>
          <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
          <p className="text-sm text-blue-700 mt-1">
            This application is currently running with sample data. To connect to your WordPress/WooCommerce store, 
            update the environment variables in <code className="bg-blue-100 px-1 rounded">.env.local</code>.
          </p>
        </div>
      </div>
    </div>
  );
} 