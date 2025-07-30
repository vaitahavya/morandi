#!/bin/bash

echo "🔧 Fixing WooCommerce URL configuration..."

# Update .env.local with correct WooCommerce URL
sed -i '' 's|WORDPRESS_API_URL="https://morandilifestyle.com/wp-json/wp/v2"|WORDPRESS_API_URL="https://morandilifestyle.com/wp-json"|' .env.local

echo "✅ Updated WORDPRESS_API_URL to correct format"
echo ""
echo "📋 Current configuration:"
echo "WORDPRESS_API_URL=https://morandilifestyle.com/wp-json"
echo ""
echo "🔍 Please verify you have these in your .env.local:"
echo "WC_CONSUMER_KEY=your_consumer_key"
echo "WC_CONSUMER_SECRET=your_consumer_secret"
echo ""
echo "🎯 Next steps:"
echo "1. Make sure your WooCommerce API credentials are set"
echo "2. Visit http://localhost:3000/admin"
echo "3. Click 'Test Connection' again"
echo ""
echo "💡 If you still get errors, check:"
echo "- Your WordPress site is accessible"
echo "- WooCommerce is installed and activated"
echo "- Your API keys have correct permissions" 