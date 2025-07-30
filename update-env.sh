#!/bin/bash

echo "🔧 Updating environment variables with actual Supabase credentials..."

# Update .env.local with actual Supabase credentials
cat > .env.local << EOL
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://ohipggwnmnypiubsbcvu.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oaXBnZ3dubW55cGl1YnNiY3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODkxNDEsImV4cCI6MjA2OTQ2NTE0MX0.93kUs4BivPs922cUNWs5JiY6j-woYy7RqR-gGsXRwsg"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="y8guFchyAjZ1sqUyk9xNgyaE/kuVqR1NBl9xQRl4ZQU="

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# WooCommerce API (optional)
WORDPRESS_API_URL="https://your-wordpress-site.com/wp-json"
WC_CONSUMER_KEY="your_consumer_key"
WC_CONSUMER_SECRET="your_consumer_secret"

# WordPress API (if using)
WORDPRESS_CONSUMER_KEY="your-consumer-key"
WORDPRESS_CONSUMER_SECRET="your-consumer-secret"
EOL

echo "✅ Updated .env.local with actual Supabase credentials"
echo ""
echo "📋 Next steps:"
echo "1. Update Google OAuth credentials (optional)"
echo "2. Update email configuration"
echo "3. Update WooCommerce credentials (optional):"
echo "   - WORDPRESS_API_URL: Your WordPress site URL"
echo "   - WC_CONSUMER_KEY: WooCommerce consumer key"
echo "   - WC_CONSUMER_SECRET: WooCommerce consumer secret"
echo "4. Run: npm run dev"
echo "5. Visit: http://localhost:3001/admin to manage WooCommerce sync"
echo ""
echo "🎉 Your Supabase project 'morandi-ecommerce' is now connected!" 