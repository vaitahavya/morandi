# NextAuth.js Implementation Guide

This document outlines the comprehensive NextAuth.js implementation for the Morandi Lifestyle e-commerce application, following all best practices for security, scalability, and user experience.

## 🚀 Features Implemented

### ✅ Authentication Providers
- **Email/Password**: Traditional credential-based authentication
- **Google OAuth**: Social authentication with Google
- **Magic Links**: Passwordless email authentication
- **Password Reset**: Secure password reset via email

### ✅ Security Features
- **CSRF Protection**: Built-in CSRF protection
- **Secure Cookies**: HTTP-only, secure cookies in production
- **Security Headers**: Comprehensive security headers implementation
- **Role-Based Access Control**: Admin, customer, and staff roles
- **Route Protection**: Middleware-based route protection

### ✅ User Experience
- **Custom Auth Pages**: Beautiful, branded authentication pages
- **User Onboarding**: Guided setup for new users
- **Profile Management**: User profile and preferences
- **Session Management**: Persistent sessions with automatic refresh

### ✅ Database Integration
- **Prisma Adapter**: Full NextAuth.js Prisma adapter integration
- **Database Sessions**: Secure database-stored sessions
- **Account Linking**: OAuth account linking with existing users

## 📁 File Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/route.ts     # NextAuth API route
│   │   ├── register/route.ts          # User registration
│   │   ├── forgot-password/route.ts   # Password reset request
│   │   ├── reset-password/route.ts    # Password reset confirmation
│   │   └── onboarding/route.ts        # User onboarding
│   ├── auth/
│   │   ├── signin/page.tsx           # Sign in page
│   │   ├── signup/page.tsx           # Sign up page
│   │   ├── error/page.tsx            # Auth error page
│   │   ├── verify-request/page.tsx   # Email verification
│   │   ├── forgot-password/page.tsx  # Forgot password
│   │   └── reset-password/page.tsx   # Reset password
│   └── account/
│       └── onboarding/page.tsx       # User onboarding
├── components/auth/
│   ├── AuthGuard.tsx                 # Route protection component
│   ├── UserProfile.tsx               # User profile dropdown
│   └── RoleGuard.tsx                 # Role-based access component
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── email.ts                      # Email utilities
│   └── security.ts                   # Security headers
├── middleware.ts                     # Route protection middleware
└── types/
    └── next-auth.d.ts               # TypeScript declarations
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/morandi_vait"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@morandilifestyle.com"
```

### Database Schema

The implementation includes the following NextAuth.js tables:

- **users**: Extended user table with roles and preferences
- **accounts**: OAuth provider accounts
- **sessions**: Database-stored sessions
- **verification_tokens**: Email verification tokens

## 🛡️ Security Implementation

### Middleware Protection

```typescript
// src/middleware.ts
export default withAuth(
  function middleware(req) {
    // Route protection logic
    // Admin routes require admin role
    // Account routes require authentication
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Authorization logic
      },
    },
  }
);
```

### Security Headers

```typescript
// src/lib/security.ts
export function securityHeaders(request: NextRequest) {
  // Comprehensive security headers
  // CSP, HSTS, XSS protection, etc.
}
```

### Role-Based Access Control

```typescript
// Usage in components
<RoleGuard roles={['admin']}>
  <AdminPanel />
</RoleGuard>

<AdminOnly>
  <AdminFeatures />
</AdminOnly>
```

## 🎨 Authentication Pages

### Sign In Page
- Email/password authentication
- Google OAuth integration
- Forgot password link
- Responsive design

### Sign Up Page
- User registration with validation
- Password strength requirements
- Terms and conditions
- Email verification

### Password Reset Flow
1. User requests password reset
2. System sends reset email with secure token
3. User clicks link and sets new password
4. Session invalidation for security

## 📧 Email Integration

### Email Templates
- Welcome emails for new users
- Password reset emails
- Magic link emails
- Order confirmations

### Email Configuration
- SMTP configuration for production
- Development email testing
- Email delivery tracking

## 🔄 Session Management

### Database Sessions
- Sessions stored in database for security
- Automatic session refresh
- Session invalidation on password change

### Session Configuration
```typescript
session: {
  strategy: 'database',
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
}
```

## 🚦 Route Protection

### Public Routes
- `/` - Home page
- `/products/*` - Product pages
- `/collections/*` - Collection pages
- `/about`, `/contact`, `/blog` - Static pages

### Protected Routes
- `/account/*` - User account pages
- `/admin/*` - Admin panel (admin role required)
- `/wishlist` - User wishlist
- `/cart` - Shopping cart

### Middleware Configuration
```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

## 🧩 Component Usage

### AuthGuard Component
```typescript
import AuthGuard from '@/components/auth/AuthGuard';

<AuthGuard roles={['admin']}>
  <AdminContent />
</AuthGuard>
```

### UserProfile Component
```typescript
import UserProfile from '@/components/auth/UserProfile';

// Automatically shows sign in/sign up or user dropdown
<UserProfile />
```

### Role-Based Components
```typescript
import { AdminOnly, CustomerOnly, StaffOnly } from '@/components/auth/RoleGuard';

<AdminOnly>
  <AdminPanel />
</AdminOnly>

<CustomerOnly>
  <CustomerFeatures />
</CustomerOnly>
```

## 🔐 API Security

### Protected API Routes
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your API logic here
}
```

### Role-Based API Protection
```typescript
if (session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## 📱 User Experience

### Onboarding Flow
1. User signs up
2. Redirected to onboarding page
3. Profile setup and preferences
4. Welcome to the platform

### Error Handling
- Custom error pages for auth failures
- User-friendly error messages
- Graceful fallbacks

### Loading States
- Authentication loading indicators
- Form submission states
- Session loading handling

## 🚀 Deployment

### Production Checklist
- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Configure production `NEXTAUTH_URL`
- [ ] Set up email service
- [ ] Configure OAuth providers
- [ ] Enable HTTPS
- [ ] Set up monitoring

### Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

## 🔍 Monitoring & Analytics

### Authentication Events
```typescript
events: {
  async signIn({ user, account, profile, isNewUser }) {
    console.log(`User ${user.email} signed in via ${account?.provider}`);
  },
  async signOut({ session, token }) {
    console.log(`User ${session?.user?.email} signed out`);
  },
}
```

### Security Monitoring
- Failed login attempts
- Password reset requests
- Session anomalies
- Admin access logs

## 📚 Best Practices Implemented

1. **Security First**: Comprehensive security headers and CSRF protection
2. **Database Sessions**: Secure session storage in database
3. **Role-Based Access**: Granular permission system
4. **Email Verification**: Secure email-based authentication
5. **Password Security**: Strong password requirements and secure reset
6. **User Experience**: Smooth onboarding and error handling
7. **Performance**: Optimized session management
8. **Scalability**: Database-driven architecture
9. **Monitoring**: Comprehensive logging and analytics
10. **Documentation**: Clear implementation guide

## 🆘 Troubleshooting

### Common Issues

1. **Session not persisting**
   - Check database connection
   - Verify session configuration
   - Check middleware configuration

2. **OAuth not working**
   - Verify OAuth credentials
   - Check redirect URLs
   - Ensure HTTPS in production

3. **Email not sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check spam folder

4. **Route protection issues**
   - Verify middleware configuration
   - Check role assignments
   - Review route patterns

### Debug Mode
```typescript
// Enable in development
debug: process.env.NODE_ENV === 'development'
```

## 📞 Support

For issues or questions about the NextAuth.js implementation:

1. Check the troubleshooting section
2. Review the NextAuth.js documentation
3. Check the Prisma documentation
4. Review the security configuration

---

This implementation provides a robust, secure, and scalable authentication system that follows all NextAuth.js best practices while maintaining excellent user experience and developer productivity.
