# Fix Supabase Storage RLS Policy Error

## Error Message
```
Permission error: new row violates row-level security policy
```

## What This Means
Supabase Storage has Row Level Security (RLS) enabled, but there are no policies allowing uploads to the "products" bucket.

## Solution: Create RLS Policies

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run the SQL Policies
Copy and paste the SQL from `supabase-storage-policies.sql` into the SQL Editor and run it.

Or use this quick fix:

```sql
-- Allow public read access
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');

-- Allow public uploads (for admin/product uploads)
CREATE POLICY "Allow public uploads to products bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'products');

-- Allow public updates
CREATE POLICY "Allow public updates to product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Allow public deletes
CREATE POLICY "Allow public deletes from products bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'products');
```

### Step 3: Verify Bucket Settings
1. Go to **Storage** → **Buckets**
2. Click on **"products"** bucket
3. Ensure:
   - ✅ Bucket is **Public**
   - ✅ RLS is enabled (this is fine, we just added policies)

### Step 4: Test Upload
Try uploading an image again. It should work now.

## Alternative: Disable RLS (Not Recommended)
If you want to disable RLS entirely (less secure):

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning:** This makes all storage objects accessible without any security. Only use if you understand the security implications.

## Verify Policies Are Working
Run this query to see your policies:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

You should see 4 policies for the "products" bucket.

## Troubleshooting

### If you get "policy already exists" error:
Drop the existing policy first:
```sql
DROP POLICY IF EXISTS "Allow public uploads to products bucket" ON storage.objects;
```
Then create it again.

### If uploads still fail:
1. Check bucket name is exactly "products" (case-sensitive)
2. Verify bucket is set to **Public**
3. Check Supabase logs for more detailed error messages
4. Ensure your Supabase credentials are correct





