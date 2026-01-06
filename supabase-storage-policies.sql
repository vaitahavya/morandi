-- Supabase Storage RLS Policies for "products" bucket
-- Run this in your Supabase SQL Editor

-- First, ensure the bucket exists and is public
-- (Do this manually in Supabase Dashboard → Storage → Create bucket "products" and set to Public)

-- Policy 1: Allow public read access to product images
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');

-- Policy 2: Allow anyone to upload product images (for admin use)
-- If you want to restrict to authenticated users only, use the alternative policy below
CREATE POLICY "Allow public uploads to products bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'products');

-- Policy 3: Allow anyone to update product images
CREATE POLICY "Allow public updates to product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Policy 4: Allow anyone to delete product images
CREATE POLICY "Allow public deletes from products bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'products');

-- ============================================
-- ALTERNATIVE: If you want authenticated-only uploads
-- ============================================
-- Uncomment these if you want to restrict uploads to authenticated users only:

-- DROP POLICY IF EXISTS "Allow public uploads to products bucket" ON storage.objects;
-- 
-- CREATE POLICY "Allow authenticated uploads to products bucket"
-- ON storage.objects
-- FOR INSERT
-- WITH CHECK (
--   bucket_id = 'products' 
--   AND auth.role() = 'authenticated'
-- );

-- ============================================
-- To check existing policies:
-- ============================================
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- To remove all policies and start fresh:
-- ============================================
-- DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public uploads to products bucket" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public updates to product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public deletes from products bucket" ON storage.objects;











