# Vercel Deployment Guide - Morandi Lifestyle

Complete guide to deploy your Next.js e-commerce application to Vercel.

## 🚀 Quick Deploy (Recommended Method)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `vaitahavya/morandi`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)
   - **Install Command:** `npm install` (auto-filled)

4. **Add Environment Variables** (Click "Environment Variables")
   
   Add these variables one by one:
   
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   
   # NextAuth
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=<generate-a-random-secret>
   
   # Google OAuth
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   
   # Email
   EMAIL_USER=<your-email@gmail.com>
   EMAIL_PASSWORD=<your-app-password>
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your site will be live at `https://your-project-name.vercel.app`

---

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Terminal**
   ```bash
   cd /Users/vaitahahavya/Projects/morandi
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time) or **Y** (subsequent deploys)
   - What's your project's name? `morandi` (or your choice)
   - In which directory is your code located? `./`
   - Want to override settings? **N**

5. **Add Environment Variables**
   ```bash
   # You can add env vars via CLI or dashboard (dashboard is easier)
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASSWORD
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 🔐 Environment Variables Setup

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGc...` |
| `NEXTAUTH_URL` | Your production URL | `https://morandi.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Generate using command below |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxxx` |
| `EMAIL_USER` | Email for notifications | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email app password | `your-app-password` |

### Generate NEXTAUTH_SECRET

```bash
# Using OpenSSL (Mac/Linux)
openssl rand -base64 32

# Or use this online tool:
# https://generate-secret.vercel.app/32
```

### Where to Find Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Setting Up Google OAuth for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create new one)
3. Go to "APIs & Services" → "Credentials"
4. Edit your OAuth 2.0 Client
5. Add **Authorized redirect URIs:**
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
6. Save changes
7. Copy Client ID and Client Secret to Vercel environment variables

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set in Vercel dashboard
- [ ] Supabase database is set up and accessible
- [ ] Google OAuth redirect URIs include your Vercel domain
- [ ] All Git changes are committed and pushed
- [ ] `.env` file is in `.gitignore` (already done)
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npm run lint`

---

## 🛠️ Build Configuration

### Next.js Configuration (`next.config.js`)

Your current config should work, but verify:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-url.supabase.co'], // Add your Supabase storage domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Enable if using standalone output
  output: 'standalone', // Optional: for faster deployments
};

module.exports = nextConfig;
```

---

## 🔄 Continuous Deployment

Once set up, Vercel automatically:

- **Deploys on every push** to `main` branch (production)
- **Creates preview deployments** for pull requests
- **Runs build checks** before deploying
- **Provides deployment URLs** for each commit

### Deploy Specific Branch

```bash
# Deploy current branch
vercel

# Deploy to production (main branch)
vercel --prod
```

---

## 🌐 Custom Domain Setup (Optional)

### Add Your Own Domain

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Domains"
   - Click "Add"
   - Enter your domain (e.g., `morandilifestyle.com`)

2. **Update DNS Records:**
   - Add `CNAME` record pointing to `cname.vercel-dns.com`
   - Or use Vercel nameservers for full DNS management

3. **Update Environment Variables:**
   - Change `NEXTAUTH_URL` to your custom domain
   - Update Google OAuth redirect URIs

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Free)

Enable in Vercel Dashboard:
- Go to your project → "Analytics"
- Enable "Vercel Analytics"
- Add `@vercel/analytics` to your project if not already added

### Check Deployment Status

```bash
# List all deployments
vercel ls

# Check specific deployment
vercel inspect <deployment-url>

# View logs
vercel logs <deployment-url>
```

---

## 🐛 Troubleshooting

### Common Issues

#### Build Fails

**Problem:** Build fails with TypeScript errors

**Solution:**
```bash
# Check locally first
npm run build

# Fix TypeScript errors
npm run lint
```

#### Environment Variables Not Working

**Problem:** Environment variables undefined in production

**Solution:**
- Check they're added in Vercel Dashboard
- Redeploy after adding env vars
- Verify variable names match exactly (case-sensitive)

#### Images Not Loading

**Problem:** Next.js Image component fails

**Solution:**
- Add Supabase domain to `next.config.js` `images.domains`
- Redeploy after config change

#### Database Connection Fails

**Problem:** Can't connect to Supabase

**Solution:**
- Verify Supabase credentials in env vars
- Check Supabase project is active
- Verify database tables are created

---

## 🔒 Security Checklist

Before going live:

- [ ] All secrets are in environment variables (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] Supabase RLS policies are enabled
- [ ] API routes have proper authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled for critical endpoints
- [ ] Input validation on all forms
- [ ] SQL injection protection (using Prisma/Supabase clients)

---

## 📈 Post-Deployment Tasks

After successful deployment:

1. **Test the Live Site**
   - [ ] Homepage loads correctly
   - [ ] Products display properly
   - [ ] Authentication works (sign up, sign in)
   - [ ] Google OAuth works
   - [ ] Cart functionality works
   - [ ] Checkout process works
   - [ ] Admin panel accessible (if applicable)

2. **Update OAuth Providers**
   - [ ] Add production URLs to Google OAuth
   - [ ] Test social login on production

3. **Configure Email**
   - [ ] Test email notifications work
   - [ ] Verify email templates render correctly

4. **Set Up Monitoring**
   - [ ] Enable Vercel Analytics
   - [ ] Set up error tracking (Sentry, etc.)
   - [ ] Configure uptime monitoring

5. **Performance Optimization**
   - [ ] Run Lighthouse audit
   - [ ] Optimize images further if needed
   - [ ] Check Core Web Vitals

---

## 📝 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Vercel CLI
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel env ls            # List environment variables
vercel env add           # Add environment variable
vercel logs              # View deployment logs
vercel ls                # List deployments
vercel domains ls        # List domains
vercel rollback          # Rollback to previous deployment
```

---

## 🎉 You're Ready to Deploy!

### Quick Start:

1. **Visit** [vercel.com](https://vercel.com)
2. **Sign in** with GitHub
3. **Import** your repository
4. **Add** environment variables
5. **Click** Deploy
6. **Done!** Your site is live 🚀

Your Morandi Lifestyle e-commerce store will be live at:
`https://your-project-name.vercel.app`

---

## 🔗 Helpful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

---

*Last Updated: October 1, 2025*

