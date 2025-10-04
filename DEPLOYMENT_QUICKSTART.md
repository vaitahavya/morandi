# 🚀 Quick Deployment to Vercel

## Fastest Way to Deploy (5 minutes)

### Step 1: Commit Your Changes
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy via Browser (Easiest!)

1. **Go to:** [vercel.com/new](https://vercel.com/new)
2. **Sign in** with GitHub
3. **Import** repository: `vaitahavya/morandi`
4. **Add Environment Variables** (click "Environment Variables" before deploying):

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generate-random-32-char-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<your-app-password>
```

5. **Click "Deploy"**
6. **Wait 2-5 minutes** ☕
7. **Done!** 🎉 Your site is live!

---

## OR Use Our Deployment Script

```bash
# Simple one-command deployment
./deploy.sh
```

The script will:
- ✅ Check for uncommitted changes
- ✅ Test your build locally
- ✅ Run lint checks
- ✅ Guide you through deployment options

---

## Generate NEXTAUTH_SECRET

```bash
# Mac/Linux
openssl rand -base64 32

# Or visit: https://generate-secret.vercel.app/32
```

---

## Get Your Supabase Credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Update Google OAuth (Important!)

After deployment:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. Add to **Authorized redirect URIs**:
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```
5. **Save**

---

## Verify Deployment

After deployment, test these:

- [ ] Homepage loads
- [ ] Products display
- [ ] Images load
- [ ] Sign in works
- [ ] Google OAuth works
- [ ] Cart functionality
- [ ] Database connection works

---

## Troubleshooting

**Build fails?**
- Run `npm run build` locally to see errors
- Fix TypeScript/ESLint errors
- Commit and redeploy

**Images not loading?**
- Add Supabase domain to `next.config.js`
- Redeploy

**OAuth not working?**
- Add Vercel URL to Google OAuth redirect URIs
- Update `NEXTAUTH_URL` environment variable

---

## Need More Help?

See the complete guide: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

**Ready to deploy? Let's go! 🚀**

