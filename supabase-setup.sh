#!/bin/bash

echo "🚀 Supabase Setup Script"
echo "========================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please run ./setup-env.sh first"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if user is logged in
echo "🔐 Checking Supabase login status..."
if ! supabase status &> /dev/null; then
    echo "Please login to Supabase:"
    supabase login
    echo ""
fi

echo "📋 Next steps:"
echo ""
echo "1. Create a Supabase project at https://supabase.com/dashboard"
echo "2. Get your project reference (found in project URL)"
echo "3. Update .env.local with your Supabase credentials"
echo "4. Run the following commands:"
echo ""
echo "   # Link your project (replace YOUR_PROJECT_REF)"
echo "   supabase link --project-ref YOUR_PROJECT_REF"
echo ""
echo "   # Deploy database schema"
echo "   supabase db push"
echo ""
echo "   # Reset database and seed with sample data"
echo "   supabase db reset"
echo ""
echo "   # Start development server"
echo "   npm run dev"
echo ""

# Check if project is linked
if [ -f "supabase/.temp/project_id" ]; then
    echo "✅ Project is linked!"
    echo ""
    echo "Would you like to deploy the database schema now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Deploying database schema..."
        supabase db push
        echo ""
        echo "Would you like to reset the database and seed with sample data? (y/n)"
        read -r reset_response
        if [[ "$reset_response" =~ ^[Yy]$ ]]; then
            echo "Resetting database..."
            supabase db reset
            echo "✅ Database setup complete!"
        fi
    fi
else
    echo "❌ Project not linked yet"
    echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
fi

echo ""
echo "🎉 Setup complete! Run 'npm run dev' to start the development server" 