#!/bin/bash

# Morandi Lifestyle - Vercel Deployment Script
# This script helps deploy your e-commerce site to Vercel

set -e  # Exit on error

echo "🚀 Morandi Lifestyle - Vercel Deployment"
echo "========================================"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check git status
echo "📋 Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        git push origin main
        echo "✅ Changes committed and pushed!"
    else
        echo "⚠️  Continuing with uncommitted changes (they won't be deployed)"
    fi
fi

# Pre-deployment checks
echo ""
echo "🔍 Running pre-deployment checks..."

# Check if build works locally
echo "📦 Testing build..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

# Check for lint errors
echo "🔍 Running linter..."
if npm run lint; then
    echo "✅ No lint errors!"
else
    echo "⚠️  Lint warnings found (continuing anyway)"
fi

# Deployment options
echo ""
echo "🎯 Deployment Options:"
echo "1) Deploy to preview (test deployment)"
echo "2) Deploy to production (live site)"
echo "3) Deploy with environment variables setup"
echo "4) Cancel"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to preview environment..."
        vercel
        ;;
    2)
        echo ""
        read -p "⚠️  Deploy to PRODUCTION? This will update the live site! (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🚀 Deploying to production..."
            vercel --prod
        else
            echo "❌ Production deployment cancelled."
            exit 0
        fi
        ;;
    3)
        echo ""
        echo "📝 Setting up environment variables..."
        echo "You'll need to enter these values:"
        echo ""
        vercel env add NEXT_PUBLIC_SUPABASE_URL production
        vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
        vercel env add NEXTAUTH_URL production
        vercel env add NEXTAUTH_SECRET production
        vercel env add GOOGLE_CLIENT_ID production
        vercel env add GOOGLE_CLIENT_SECRET production
        vercel env add EMAIL_USER production
        vercel env add EMAIL_PASSWORD production
        echo ""
        echo "✅ Environment variables added!"
        echo "Now deploying to production..."
        vercel --prod
        ;;
    4)
        echo "❌ Deployment cancelled."
        exit 0
        ;;
    *)
        echo "❌ Invalid option."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site should be live shortly."
echo ""
echo "📊 Useful commands:"
echo "  vercel ls           - List all deployments"
echo "  vercel logs         - View deployment logs"
echo "  vercel domains ls   - List domains"
echo ""

