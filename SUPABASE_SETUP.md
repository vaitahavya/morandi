# Supabase Setup Guide

## 🚀 Quick Start

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `morandi-ecommerce`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### 2. Get Project Credentials
1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Update Environment Variables
Update your `.env.local` file with the actual values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="y8guFchyAjZ1sqUyk9xNgyaE/kuVqR1NBl9xQRl4ZQU="

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

### 4. Link Local Project to Supabase
```bash
# Login to Supabase CLI
supabase login

# Link your local project to Supabase
supabase link --project-ref YOUR_PROJECT_REF
```

### 5. Deploy Database Schema
```bash
# Push the database schema
supabase db push

# Reset database and seed with sample data
supabase db reset
```

### 6. Start Development Server
```bash
npm run dev
```

## 📊 Database Schema

The project includes the following tables:

### Core Tables
- **users**: Customer accounts and authentication
- **products**: Product catalog with images and metadata
- **orders**: Order management with status tracking
- **order_items**: Individual items in orders
- **wishlist_items**: User wishlist functionality
- **reviews**: Product reviews and ratings
- **product_recommendations**: Recommendation relationships
- **email_notifications**: Email tracking and history

### Security Features
- **Row Level Security (RLS)**: All tables have RLS enabled
- **User Isolation**: Users can only access their own data
- **Public Read Access**: Products and reviews are publicly readable
- **Secure Policies**: Proper authorization for all operations

## 🔧 Configuration Options

### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3001/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Copy Client ID and Client Secret to `.env.local`

### Email Configuration
1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate app password
   - Use app password as `EMAIL_PASSWORD`

2. **Other Providers**:
   - Update `EMAIL_USER` and `EMAIL_PASSWORD`
   - Modify email service in `src/lib/email.ts`

## 🧪 Testing the Setup

### 1. Test Database Connection
Visit `http://localhost:3001` and check the console for any connection errors.

### 2. Test Authentication
- Visit `/auth/signup` to create an account
- Visit `/auth/signin` to sign in
- Test Google OAuth if configured

### 3. Test Features
- Browse products at `/products`
- Add items to cart
- Test wishlist functionality
- Check account dashboard at `/account`

### 4. Test Recommendations
- Browse different products
- Check for personalized recommendations
- Verify similar products are shown

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: Invalid API key
   ```
   - Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Ensure project is active in Supabase dashboard

2. **RLS Policy Errors**
   ```
   Error: new row violates row-level security policy
   ```
   - Check that RLS policies are properly applied
   - Verify user authentication is working

3. **Migration Errors**
   ```
   Error: relation already exists
   ```
   - Run `supabase db reset` to start fresh
   - Check migration files for conflicts

4. **NextAuth Errors**
   ```
   Error: Invalid NEXTAUTH_SECRET
   ```
   - Generate new secret: `openssl rand -base64 32`
   - Update `.env.local` with new value

### Debug Mode
Enable debug logging by adding to `.env.local`:
```env
DEBUG="next-auth:*,supabase:*"
```

## 📈 Production Deployment

### 1. Environment Variables
Update `.env.local` for production:
```env
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
```

### 2. Database Migrations
```bash
# Deploy to production
supabase db push --db-url "postgresql://postgres:[password]@[host]:5432/postgres"
```

### 3. Build and Deploy
```bash
npm run build
npm start
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **RLS Policies**: Always enable RLS on sensitive tables
3. **API Keys**: Use anon key for client-side, service role for server-side
4. **Password Hashing**: bcryptjs is used for password hashing
5. **Session Management**: JWT tokens with proper expiration

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal for build errors
3. Verify all environment variables are set correctly
4. Ensure Supabase project is active and accessible
5. Check RLS policies in Supabase dashboard 