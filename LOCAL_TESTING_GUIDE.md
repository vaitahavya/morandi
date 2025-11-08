# Local Testing Guide

This guide helps you set up and test the Morandi Lifestyle e-commerce application locally using SQLite.

## 🚀 Quick Setup

### 1. Switch to SQLite for Local Testing
```bash
./scripts/switch-to-sqlite.sh
```

### 2. Generate Prisma Client and Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 3. Create Test Users
```bash
node scripts/create-test-admin.js
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Authentication
```bash
node scripts/test-auth.js
```

## 🔐 Test Credentials

### Admin User
- **Email:** `admin@morandi.com`
- **Password:** `admin123`
- **Role:** `admin`

### Customer User
- **Email:** `customer@test.com`
- **Password:** `customer123`
- **Role:** `customer`

## 🌐 Testing URLs

### Authentication
- **Sign In:** http://localhost:3000/auth/signin
- **Sign Up:** http://localhost:3000/auth/signup
- **Admin Panel:** http://localhost:3000/admin

### API Endpoints
- **Register:** `POST /api/auth/register`
- **NextAuth Providers:** `GET /api/auth/providers`
- **Products:** `GET /api/products`
- **Orders:** `GET /api/orders`

## 🚚 Shipping & Coupons

### Shipping Rates
- Run the latest Prisma migration after pulling updates:  
  ```bash
  npx prisma migrate deploy
  # or, for SQLite testing
  npx prisma db push
  ```
- Visit **Admin → Shipping Rates** to add rules by pincode, prefix, or zone.
- Each rule supports base cost, surcharge, and free-shipping thresholds. Disable or delete rules as needed.

### Coupon Validation
- Use **Admin → Marketing → Coupons** to configure discount or free-shipping coupons.
- At checkout, apply coupon codes and confirm the order summary updates with discounts and shipping changes.
- Orders now record `couponCode`, `couponId`, and `shippingRateId` so you can audit the applied incentives.

## 🧪 Testing Authentication Flow

### 1. Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"newuser@test.com","password":"test123"}'
```

### 2. Test Signup Flow via Browser
1. Visit: http://localhost:3000/auth/signup
2. Fill out the registration form
3. Should redirect to: http://localhost:3000/auth/signup-success
4. Click "Sign In to Your Account"

### 3. Test Sign In via Browser
1. Visit: http://localhost:3000/auth/signin
2. Use credentials: `admin@morandi.com` / `admin123`
3. Should redirect to admin panel

### 4. Test Admin Access
1. Sign in as admin
2. Visit: http://localhost:3000/admin
3. Should see admin dashboard

## 🔧 Troubleshooting

### Database Issues
```bash
# Reset database
rm dev.db
npx prisma db push

# Recreate test users
node scripts/create-test-admin.js
```

### Switch Back to PostgreSQL
```bash
./scripts/switch-to-postgresql.sh
npx prisma generate
npx prisma db push
```

### Clear NextAuth Sessions
```bash
# Clear browser cookies and localStorage
# Or restart the development server
```

## 📁 Database Files

- **SQLite Database:** `dev.db`
- **SQLite Schema:** `prisma/schema.sqlite.prisma`
- **PostgreSQL Schema:** `prisma/schema.postgresql.prisma`

## 🔍 Verification Commands

### Check Database Status
```bash
node scripts/test-auth.js
```

### View Database Schema
```bash
npx prisma studio
```

### Check Prisma Client
```bash
npx prisma generate
```

## 🎯 What's Working

✅ **User Registration** - API endpoint working  
✅ **User Authentication** - NextAuth.js configured  
✅ **Admin Panel Access** - Role-based access control  
✅ **Database Setup** - SQLite with all tables  
✅ **Middleware** - Properly configured for API routes  
✅ **Service Layer** - Repository pattern implemented  
✅ **Signup Flow** - Redirects to success page  
✅ **Email Notifications** - Working without SMTP (local mode)  
✅ **Database Field Mapping** - Fixed camelCase/snake_case issues  

## 🚨 Known Issues

- **Email Provider:** Not configured for local testing (optional)
- **Google OAuth:** Not configured for local testing (optional)
- **File Uploads:** May need configuration for local testing

## 📝 Next Steps

1. **Test Full E-commerce Flow:**
   - Create products
   - Add to cart
   - Checkout process
   - Order management

2. **Test Admin Functions:**
   - Product management
   - Order management
   - Customer management

3. **Test API Endpoints:**
   - All CRUD operations
   - Search and filtering
   - Pagination

---

**Happy Testing! 🎉**
