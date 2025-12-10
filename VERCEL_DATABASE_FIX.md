# Vercel Database Connection Fix

## Problem
After redeploying from Vercel, all your products are missing and dummy products are visible. This indicates Vercel is connecting to a different database than your local environment.

## Verification Results

✅ **Local Database Connection**: Working correctly
- Database: Supabase project `oqcxpwdqzjrkpymretwo`
- Products: 50 products found (real production data)
- Connection String: `postgresql://postgres.oqcxpwdqzjrkpymretwo:***@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`

## Root Cause

The `DATABASE_URL` environment variable is either:
1. Not set in Vercel
2. Set to a different database connection string
3. Pointing to a different Supabase project

## Solution

### Step 1: Get Your Database Connection String

Your current database connection string (from local `.env.local`):
```
DATABASE_URL=postgresql://postgres.oqcxpwdqzjrkpymretwo:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.oqcxpwdqzjrkpymretwo.supabase.co:5432/postgres
```

**Note**: Replace `[PASSWORD]` with your actual Supabase database password.

### Step 2: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add or update the following variables:

   **For Production:**
   - `DATABASE_URL` = Your pooler connection string (port 6543)
   - `DIRECT_URL` = Your direct connection string (port 5432)

   **For Preview/Development (if needed):**
   - Same values as production, or use a separate database

### Step 3: Verify Connection String Format

Your connection strings should be:
- **Pooler URL** (for regular queries): `postgresql://postgres.oqcxpwdqzjrkpymretwo:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`
- **Direct URL** (for migrations): `postgresql://postgres:[PASSWORD]@db.oqcxpwdqzjrkpymretwo.supabase.co:5432/postgres`

### Step 4: Get Connection String from Supabase

If you need to get the connection string from Supabase:

1. Go to https://supabase.com/dashboard
2. Select your project (project ref: `oqcxpwdqzjrkpymretwo`)
3. Go to **Settings** → **Database**
4. Find **Connection string** section
5. Copy the **Connection pooling** URL for `DATABASE_URL`
6. Copy the **Direct connection** URL for `DIRECT_URL`

### Step 5: Redeploy

After updating environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a new deployment

### Step 6: Verify After Deployment

After redeployment, check your Vercel deployment logs to ensure:
- Build completes successfully
- No database connection errors
- Application starts correctly

You can also add a temporary API endpoint to verify the connection:

```typescript
// app/api/test-db/route.ts
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const count = await prisma.product.count();
    return Response.json({ 
      success: true, 
      productCount: count,
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

Then visit: `https://your-app.vercel.app/api/test-db`

## Prevention

1. ✅ **Already Fixed**: Added `DATABASE_URL` and `DIRECT_URL` to `vercel.json`
2. Always verify environment variables match between local and production
3. Use the verification script before deploying: `node scripts/verify-database-connection.js`
4. Document which Supabase project is used for production

## Verification Script

Run this locally to verify your database connection:
```bash
node scripts/verify-database-connection.js
```

This will show:
- Connection status
- Database information
- Product count
- Whether sample products are detected
- Connection string details (masked)

## Important Notes

⚠️ **Never commit `.env.local` to git** - it contains sensitive credentials
⚠️ **Always use environment variables in Vercel** - don't hardcode connection strings
⚠️ **Verify the Supabase project** - Make sure you're using the correct project for production

## Current Status

- ✅ Local database connection: Working
- ✅ Database has 50 real products
- ✅ No sample/dummy products detected locally
- ⚠️ Vercel environment variables: Need to be updated
- ⚠️ Vercel deployment: Connecting to wrong database

## Next Steps

1. Update Vercel environment variables with correct `DATABASE_URL` and `DIRECT_URL`
2. Redeploy the application
3. Verify products appear correctly on the deployed site
4. Remove this document or update it once fixed


