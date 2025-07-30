#!/bin/bash

echo "🔧 Fixing environment variable names..."

# Add NEXT_PUBLIC_ prefix to the WooCommerce variables
sed -i '' 's/WORDPRESS_API_URL/NEXT_PUBLIC_WORDPRESS_API_URL/g' .env.local
sed -i '' 's/WC_CONSUMER_KEY/NEXT_PUBLIC_WC_CONSUMER_KEY/g' .env.local
sed -i '' 's/WC_CONSUMER_SECRET/NEXT_PUBLIC_WC_CONSUMER_SECRET/g' .env.local

echo "✅ Updated environment variable names"
echo ""
echo "📋 Current configuration:"
echo "NEXT_PUBLIC_WORDPRESS_API_URL=https://morandilifestyle.com/wp-json"
echo "NEXT_PUBLIC_WC_CONSUMER_KEY=ck_f1956b60f8412b676907e7b6a3e43829d1e430ab"
echo "NEXT_PUBLIC_WC_CONSUMER_SECRET=cs_898aa0140695b8b67cfa85ab7ade626016a12f2a"
echo ""
echo "🔄 Restarting development server..."
pkill -f "next dev"
sleep 2
npm run dev &
echo ""
echo "⏳ Waiting for server to start..."
sleep 5
echo ""
echo "🎯 Now test the admin dashboard:"
echo "1. Visit http://localhost:3000/admin"
echo "2. Click 'Test Connection'"
echo "3. If successful, click 'Sync Products'" 