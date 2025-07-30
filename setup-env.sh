#!/bin/bash

echo "🚀 Setting up Supabase environment variables..."

# Create .env.local file
cat > .env.local << EOL
# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# WordPress API (if using)
WORDPRESS_API_URL="https://your-wordpress-site.com/wp-json/wp/v2"
WORDPRESS_CONSUMER_KEY="your-consumer-key"
WORDPRESS_CONSUMER_SECRET="your-consumer-secret"
EOL

echo "✅ Created .env.local file"
echo ""
echo "📝 Please update the following values in .env.local:"
echo ""
echo "1. Supabase Project URL and Anon Key:"
echo "   - Go to https://supabase.com/dashboard"
echo "   - Create a new project or select existing"
echo "   - Go to Settings → API"
echo "   - Copy Project URL and anon public key"
echo ""
echo "2. NextAuth Secret:"
echo "   - Run: openssl rand -base64 32"
echo "   - Copy the output to NEXTAUTH_SECRET"
echo ""
echo "3. Google OAuth (optional):"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Create OAuth 2.0 credentials"
echo "   - Add redirect URI: http://localhost:3001/api/auth/callback/google"
echo ""
echo "4. Email Configuration:"
echo "   - For Gmail: Enable 2FA and generate app password"
echo "   - Use app password as EMAIL_PASSWORD"
echo ""
echo "🔗 Next steps:"
echo "1. Update .env.local with your values"
echo "2. Run: supabase login"
echo "3. Run: supabase link --project-ref YOUR_PROJECT_REF"
echo "4. Run: supabase db push"
echo "5. Run: supabase db reset"
echo "6. Run: npm run dev" 