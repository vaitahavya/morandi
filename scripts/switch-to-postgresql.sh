#!/bin/bash

# Switch back to PostgreSQL
echo "Switching back to PostgreSQL..."

# Restore PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Update .env.local for PostgreSQL
echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/morandi_vait\"" > .env.local
echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.local
echo "NEXTAUTH_SECRET=\"your-secret-key-here\"" >> .env.local

echo "✅ Switched back to PostgreSQL configuration"
echo "📝 Updated .env.local with PostgreSQL settings"
echo ""
echo "Next steps:"
echo "1. Run: npx prisma generate"
echo "2. Run: npx prisma db push"
echo "3. Run: npm run dev"
