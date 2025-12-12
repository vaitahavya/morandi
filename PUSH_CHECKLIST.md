# Pre-Deployment Checklist

## Files to Push (Important Fixes)

### ✅ Must Push - Critical Fixes:
1. **src/components/admin/ProductForm.tsx** - Improved error handling for uploads
2. **src/app/products/[slug]/page.tsx** - Fixed React hooks error (moved useMemo before returns)
3. **src/app/api/upload-image/route.ts** - Diagnostic logs (useful for production debugging)
4. **src/components/products/ProductRecommendations.tsx** - Fixed TypeScript error + currency
5. **src/components/products/ProductCard.tsx** - Image validation fixes
6. **src/components/products/ProductGallery.tsx** - Image validation fixes
7. **src/app/api/products/[id]/route.ts** - Image parsing improvements
8. **src/services/EmailService.ts** - Currency fix (₹ instead of $)
9. **src/lib/email.ts** - Currency fix

### ❌ Don't Push - Test/Diagnostic Files:
- `check-upload-issue.js` - Local diagnostic script
- `test-db-connection.js` - Local test script
- `test-direct-db.js` - Local test script
- `test-upload.js` - Local test script
- `test-upload.sh` - Local test script
- `check-supabase.js` - Local diagnostic script

### 📝 Optional - Documentation (can push):
- `UPLOAD_TROUBLESHOOTING.md` - Helpful documentation
- `DIAGNOSTIC_CHECKS.md` - Helpful documentation

## Before Pushing - Clean Up Diagnostic Logs

The diagnostic console.logs in the product page will show in browser console for users. Consider removing or making them conditional:

**Option 1: Remove client-side diagnostic logs** (Recommended for production)
- Remove `[PRODUCT-PAGE-DIAGNOSTIC]` logs from `src/app/products/[slug]/page.tsx`

**Option 2: Keep server-side diagnostic logs** (Useful for debugging)
- Keep `[UPLOAD-DIAGNOSTIC]` logs in `src/app/api/upload-image/route.ts` (server-side only)

## Recommended Steps:

1. **Remove client-side diagnostic logs** from product page
2. **Add test files to .gitignore** (optional)
3. **Commit the fixes**
4. **Push to trigger deployment**






