# Image Upload Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check Server Logs
Look for `[UPLOAD-DIAGNOSTIC]` messages in your server console:
- `Supabase initialized: true/false`
- `Supabase URL: SET/NOT SET`
- `Supabase Key: SET/NOT SET`
- Upload result details

### 2. Check Browser Console
Open browser DevTools (F12) → Network tab:
- Look for failed requests to `/api/upload-image`
- Check the response body for error messages
- Check HTTP status codes (400, 500, etc.)

### 3. Check Supabase Dashboard
1. Go to Storage → Buckets
2. Verify "products" bucket exists
3. Check if bucket is **Public**
4. Check RLS policies if enabled

## Common Error Messages & Solutions

### Error: "Supabase is not configured"
**Solution:**
- Set `NEXT_PUBLIC_SUPABASE_URL` in environment variables
- Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` in environment variables
- Restart your dev server after adding variables

### Error: "Invalid file type"
**Solution:**
- Only upload: JPEG, PNG, WebP, or GIF files
- Check file extension matches actual file type

### Error: "File too large"
**Solution:**
- Maximum file size: 10MB
- Compress image before uploading
- Use image optimization tools

### Error: "Bucket not found" or "Bucket access denied"
**Solution:**
1. Create "products" bucket in Supabase Storage
2. Set bucket to **Public**
3. Verify bucket name is exactly "products" (case-sensitive)

### Error: "new row violates row-level security policy"
**Solution:**
1. Go to Supabase Dashboard → Storage → Policies
2. Create policy allowing INSERT operations:
   ```sql
   CREATE POLICY "Allow public uploads" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'products');
   ```
3. Or disable RLS for the bucket (if public access is acceptable)

### Error: "Duplicate key" or "File already exists"
**Solution:**
- The code uses `upsert: false`, so duplicate filenames will fail
- This is normal - try uploading with a different filename

### Error: Network timeout or CORS
**Solution:**
- Check internet connection
- Verify Supabase service is operational
- Check if firewall/proxy is blocking requests

## Step-by-Step Verification

### Step 1: Verify Environment Variables
```bash
# Check if variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Or check in .env file
grep SUPABASE .env
```

### Step 2: Test Supabase Connection
Run the diagnostic script:
```bash
node check-supabase.js
```

### Step 3: Verify Bucket Configuration
1. Login to Supabase Dashboard
2. Go to Storage
3. Check if "products" bucket exists
4. Click on bucket → Settings
5. Verify "Public bucket" is enabled

### Step 4: Check RLS Policies
1. Go to Storage → Policies
2. Check if any policies exist for "products" bucket
3. If RLS is enabled, ensure INSERT policy exists

### Step 5: Test Upload Manually
Use the test script:
```bash
node test-upload.js http://localhost:3000
```

## Expected Behavior

### Successful Upload
- Server logs show: `[UPLOAD-DIAGNOSTIC] Upload result: { success: true, url: '...' }`
- Response contains: `{ success: true, url: 'https://...supabase.co/...' }`
- Image appears in Supabase Storage dashboard

### Failed Upload
- Server logs show error details
- Response contains: `{ success: false, error: '...' }`
- Check the error message for specific issue

## Still Having Issues?

1. **Check exact error message** from server logs or browser console
2. **Verify Supabase credentials** are correct (not placeholders)
3. **Test with a small image** (< 1MB) to rule out size issues
4. **Check Supabase dashboard** for any service alerts
5. **Review RLS policies** if authentication is required





