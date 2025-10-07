#!/bin/bash

# Switch to SQLite for local testing
echo "Switching to SQLite for local testing..."

# Backup current schema
cp prisma/schema.prisma prisma/schema.postgresql.prisma

# Use SQLite schema
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Update .env.local for SQLite
echo "DATABASE_URL=\"file:./dev.db\"" > .env.local
echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.local
echo "NEXTAUTH_SECRET=\"your-secret-key-for-local-testing-12345\"" >> .env.local

echo "✅ Switched to SQLite configuration"
echo "📝 Updated .env.local with SQLite settings"
echo ""
echo "Next steps:"
echo "1. Run: npx prisma generate"
echo "2. Run: npx prisma db push"
echo "3. Run: npm run dev"
