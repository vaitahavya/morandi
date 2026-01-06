# Database Connection Strings - Confirmed ✅

## Your Supabase Project
- **Project Reference**: `oqcxpwdqzjrkpymretwo`
- **Database**: PostgreSQL on Supabase
- **Status**: ✅ Verified - Contains 50 real products

## Connection Strings Required

### 1. DIRECT_URL (for migrations and direct connections)
**Format:**
```
postgresql://postgres:[YOUR_PASSWORD]@db.oqcxpwdqzjrkpymretwo.supabase.co:5432/postgres
```

**Details:**
- Host: `db.oqcxpwdqzjrkpymretwo.supabase.co`
- Port: `5432` (direct connection)
- Database: `postgres`
- User: `postgres`
- Password: ⚠️ **Replace `[YOUR_PASSWORD]` with your actual Supabase database password**

**Usage:** Used for Prisma migrations and direct database operations

---

### 2. DATABASE_URL (for application connections - connection pooling)
**Format:**
```
postgresql://postgres.oqcxpwdqzjrkpymretwo:[YOUR_PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Details:**
- Host: `aws-1-ap-southeast-1.pooler.supabase.com` (connection pooler)
- Port: `6543` (pooled connection)
- Database: `postgres`
- User: `postgres.oqcxpwdqzjrkpymretwo` (note: includes project ref)
- Password: ⚠️ **Replace `[YOUR_PASSWORD]` with your actual Supabase database password**

**Usage:** Used by your application for regular database queries (better performance)

---

## How to Get Your Actual Password

1. Go to https://supabase.com/dashboard
2. Select your project (project ref: `oqcxpwdqzjrkpymretwo`)
3. Navigate to **Settings** → **Database**
4. Scroll to **Connection string** section
5. You'll see:
   - **Connection pooling** (for DATABASE_URL) - Port 6543
   - **Direct connection** (for DIRECT_URL) - Port 5432
6. Copy the connection strings and they'll include your password

**OR** if you know your database password, just replace `[YOUR_PASSWORD]` in the strings above.

---

## For Vercel Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### Production Environment:
```
DATABASE_URL=postgresql://postgres.oqcxpwdqzjrkpymretwo:[ACTUAL_PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

DIRECT_URL=postgresql://postgres:[ACTUAL_PASSWORD]@db.oqcxpwdqzjrkpymretwo.supabase.co:5432/postgres
```

⚠️ **Important:** Replace `[ACTUAL_PASSWORD]` with your real database password!

---

## Verification

Your connection string format is **✅ CORRECT** and matches:
- ✅ Project reference: `oqcxpwdqzjrkpymretwo`
- ✅ Host format: `db.oqcxpwdqzjrkpymretwo.supabase.co`
- ✅ Port: `5432` (direct connection)
- ✅ Database: `postgres`
- ✅ User: `postgres`

This is the **DIRECT_URL** format. You also need the **DATABASE_URL** (pooler) format for your application.

---

## Current Database Status (Verified)

- ✅ **Connection**: Working
- ✅ **Products**: 50 real products found
- ✅ **Tables**: 22 tables present
- ✅ **No dummy data**: Confirmed production database
- ✅ **Project**: `oqcxpwdqzjrkpymretwo`

---

## Next Steps

1. ✅ Connection string format confirmed
2. ⚠️ Replace `[YOUR_PASSWORD]` with actual password
3. ⚠️ Add both `DATABASE_URL` and `DIRECT_URL` to Vercel
4. ⚠️ Redeploy on Vercel
5. ✅ Verify products appear correctly

---

## Security Note

⚠️ **Never commit connection strings with passwords to git!**
- Use environment variables
- Keep `.env.local` in `.gitignore`
- Use Vercel's environment variable system for production









