#!/bin/bash

echo "🧪 Testing WooCommerce API connection..."

# Load environment variables
source .env.local

echo "📋 Configuration:"
echo "URL: $WORDPRESS_API_URL"
echo "Consumer Key: ${WC_CONSUMER_KEY:0:10}..."
echo "Consumer Secret: ${WC_CONSUMER_SECRET:0:10}..."
echo ""

# Test the connection
echo "🔍 Testing API connection..."
curl -s -u "$WC_CONSUMER_KEY:$WC_CONSUMER_SECRET" \
  "$WORDPRESS_API_URL/wc/v3/products?per_page=1" \
  | head -c 500

echo ""
echo ""
echo "✅ If you see product data above, your credentials are working!"
echo "❌ If you see an error, check your credentials and try again."
echo ""
echo "🎯 Next steps:"
echo "1. Visit http://localhost:3000/admin"
echo "2. Click 'Test Connection'"
echo "3. If successful, click 'Sync Products'" 