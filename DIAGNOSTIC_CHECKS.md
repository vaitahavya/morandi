# Diagnostic Checks Added

This document explains the diagnostic logging and test scripts added to help identify the issues with product pages and image uploads.

## 1. Supabase Initialization Check

**Location:** `src/app/api/upload-image/route.ts`

Added console logging to check:
- Whether Supabase client is initialized (not null)
- Whether environment variables are set
- Upload folder and file information
- Upload result details

**What to check:**
1. Start your development server
2. Try uploading an image through the admin panel
3. Check the server console logs for messages starting with `[UPLOAD-DIAGNOSTIC]`
4. Look for:
   - `Supabase initialized: true/false`
   - `Supabase URL: SET/NOT SET`
   - `Supabase Key: SET/NOT SET`
   - Any error messages in the upload result

**Common issues:**
- If `Supabase initialized: false`, check your `.env` file for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- If variables show "SET" but initialization is false, the URL might be invalid or contain placeholders

## 2. Product Page Params Check

**Location:** `src/app/products/[slug]/page.tsx`

Added console logging to check:
- Whether params are being received correctly
- The type of params object
- Whether params.slug exists
- Whether params is a Promise (shouldn't be in Next.js 14)

**What to check:**
1. Navigate to a product page (e.g., `/products/some-product-slug`)
2. Open browser console (F12)
3. Look for messages starting with `[PRODUCT-PAGE-DIAGNOSTIC]`
4. Check:
   - If `Params received` shows the correct object
   - If `Params.slug` has a value
   - If `Is params a Promise?` is false (should be false in Next.js 14)

**Common issues:**
- If `Params.slug` is undefined, the route might not be matching correctly
- If params is a Promise, you might need to await it (Next.js 15+ behavior)

## 3. Test Upload Endpoint Directly

**Scripts created:**
- `test-upload.sh` - Bash script for testing (requires ImageMagick)
- `test-upload.js` - Node.js script for testing (requires node-fetch and form-data)

**To use the Node.js script:**
```bash
# Install dependencies if needed
npm install node-fetch form-data

# Run the test
node test-upload.js http://localhost:3000
```

**To use the Bash script:**
```bash
# Make sure ImageMagick is installed
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Run the test
./test-upload.sh http://localhost:3000
```

**What to check:**
- HTTP status code (should be 200 for success)
- Response body for error messages
- Check server logs for diagnostic messages

## 4. Environment Variables Check

**Quick check command:**
```bash
# Check if environment variables are set (in your terminal, not in code)
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Or check in your .env file:**
```bash
grep SUPABASE .env
```

**What to verify:**
- Variables are set (not empty)
- URL starts with `https://` (not a placeholder)
- Key is a valid Supabase anon key (starts with `eyJ`)

## 5. Supabase Bucket Check

**In Supabase Dashboard:**
1. Go to Storage section
2. Check if "products" bucket exists
3. Verify bucket is set to **Public**
4. Check RLS policies if enabled

**Common issues:**
- Bucket doesn't exist → Create it
- Bucket is private → Set to public
- RLS policies blocking uploads → Adjust policies or disable RLS for public bucket

## Next Steps

1. **Run your dev server** and check the console logs when:
   - Uploading an image
   - Opening a product page

2. **Check browser console** when:
   - Opening a product page
   - Uploading an image (check Network tab)

3. **Run the test script** to test upload endpoint directly:
   ```bash
   node test-upload.js
   ```

4. **Review the diagnostic output** and identify:
   - Is Supabase initialized?
   - Are params being received correctly?
   - What's the exact error message?

## Removing Diagnostic Logs

Once you've identified the issues, you can remove the diagnostic console.log statements by searching for:
- `[UPLOAD-DIAGNOSTIC]`
- `[PRODUCT-PAGE-DIAGNOSTIC]`

Or keep them for debugging in development.


