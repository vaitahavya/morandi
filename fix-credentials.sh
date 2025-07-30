#!/bin/bash

echo "🔧 Fixing WooCommerce credential variable names..."

# Update the variable names to match what the code expects
sed -i '' 's/WORDPRESS_CONSUMER_KEY/WC_CONSUMER_KEY/g' .env.local
sed -i '' 's/WORDPRESS_CONSUMER_SECRET/WC_CONSUMER_SECRET/g' .env.local

echo "✅ Updated credential variable names"
echo ""
echo "📋 Current configuration:"
echo "WORDPRESS_API_URL=https://morandilifestyle.com/wp-json"
echo "WC_CONSUMER_KEY=ck_f1956b60f8412b676907e7b6a3e43829d1e430ab"
echo "WC_CONSUMER_SECRET=cs_898aa0140695b8b67cfa85ab7ade626016a12f2a"
echo ""
echo "🎯 Now let's test the connection..."
echo "1. Visit http://localhost:3000/admin"
echo "2. Click 'Test Connection'"
echo "3. If successful, click 'Sync Products'" 