# Setup Guide for Email Notifications, Product Recommendations, and Customer Accounts

## Prerequisites

1. **Supabase Setup**: Create a Supabase project for database and authentication
2. **Email Service**: Configure an email service (Gmail recommended for testing)
3. **Google OAuth**: Set up Google OAuth for social login

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# WordPress API (if using)
WORDPRESS_API_URL="https://your-wordpress-site.com/wp-json/wp/v2"
WORDPRESS_CONSUMER_KEY="your-consumer-key"
WORDPRESS_CONSUMER_SECRET="your-consumer-secret"
```

## Installation Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Go to [Supabase](https://supabase.com/) and create a new project
   - Copy your project URL and anon key from Settings → API
   - Add them to your `.env.local` file

3. **Set up Database Schema**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase-schema.sql` to create all tables and policies

4. **Generate NextAuth Secret**:
   ```bash
   openssl rand -base64 32
   ```
   Use the output as your `NEXTAUTH_SECRET`

5. **Configure Email Service**:
   - For Gmail: Enable 2-factor authentication and generate an app password
   - Use the app password as `EMAIL_PASSWORD`

6. **Set up Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Copy the Client ID and Client Secret to your `.env.local` file

## Features Implemented

### 1. Email Notifications
- **Order Confirmation**: Sent when an order is placed
- **Order Shipped**: Sent when order status changes to shipped
- **Product Recommendations**: Personalized product suggestions via email
- **Email Templates**: Professional HTML email templates
- **Notification Tracking**: All emails are logged in the database

### 2. Product Recommendations
- **Collaborative Filtering**: Based on user purchase history
- **Content-Based Filtering**: Based on product categories and tags
- **Popular Products**: Fallback for new users
- **Similar Products**: Products in the same category
- **Real-time Updates**: Recommendations update based on user behavior

### 3. Customer Account System
- **User Registration**: Secure sign-up with password hashing
- **Google OAuth**: Sign in with Google account
- **User Authentication**: NextAuth.js integration
- **Account Dashboard**: Order history, profile, and settings
- **Session Management**: Persistent login sessions
- **Profile Management**: View and edit account information

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints (includes Google OAuth)

### Orders
- `GET /api/orders` - Fetch user orders

### Recommendations
- `GET /api/recommendations` - Get product recommendations
  - Query params: `type`, `productId`, `limit`

### Notifications
- `POST /api/notifications/send` - Send email notifications
  - Body: `{ type, userId, orderId, email }`

## Database Schema (Supabase)

The system includes the following tables:
- **users**: Customer accounts with authentication
- **products**: Product catalog with recommendations
- **orders**: Order management with status tracking
- **order_items**: Individual items in orders
- **wishlist_items**: User wishlist functionality
- **reviews**: Product reviews and ratings
- **product_recommendations**: Recommendation relationships
- **email_notifications**: Email tracking and history

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Products are publicly readable
- Reviews are publicly readable but user-specific for creation
- Recommendations are publicly readable

## Usage Examples

### Sending Email Notifications
```javascript
// Order confirmation
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'order_confirmation',
    orderId: 'order-id',
    email: 'customer@example.com'
  })
});

// Product recommendations
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'product_recommendation',
    userId: 'user-id',
    email: 'customer@example.com'
  })
});
```

### Getting Recommendations
```javascript
// Personalized recommendations
const response = await fetch('/api/recommendations?type=personalized&limit=5');

// Similar products
const response = await fetch('/api/recommendations?type=similar&productId=product-id&limit=4');

// Popular products
const response = await fetch('/api/recommendations?type=popular&limit=10');
```

## Components

### ProductRecommendations
```jsx
import ProductRecommendations from '@/components/products/ProductRecommendations';

// Personalized recommendations
<ProductRecommendations type="personalized" limit={4} title="Recommended for you" />

// Similar products
<ProductRecommendations 
  productId="product-id" 
  type="similar" 
  limit={4} 
  title="Similar products" 
/>
```

## Authentication Methods

### 1. Email/Password Authentication
- Traditional sign-up and sign-in
- Password hashing with bcryptjs
- Email validation

### 2. Google OAuth
- One-click sign-in with Google
- Automatic account creation
- Profile picture and name from Google
- No password required

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Session Management**: JWT-based sessions with NextAuth
- **OAuth Security**: Google OAuth with proper redirect URIs
- **Row Level Security**: Supabase RLS policies for data protection
- **Email Validation**: Proper email format validation
- **SQL Injection Protection**: Supabase client with parameterized queries
- **CSRF Protection**: NextAuth built-in CSRF protection

## Testing

1. **Create a test user**:
   - Visit `/auth/signup` for email/password registration
   - Or use "Sign in with Google" for OAuth

2. **Test authentication**:
   - Sign in at `/auth/signin`
   - Access account dashboard at `/account`

3. **Test recommendations**:
   - Browse products to generate recommendations
   - Check personalized recommendations on product pages

4. **Test email notifications**:
   - Place a test order
   - Check email notifications in the database

## Troubleshooting

### Common Issues

1. **Supabase Connection**: Ensure your Supabase URL and anon key are correct
2. **Database Schema**: Make sure you've run the SQL schema in Supabase
3. **Email Sending**: Check email credentials and enable "less secure apps" for Gmail
4. **NextAuth Issues**: Verify NEXTAUTH_SECRET is set and unique
5. **Google OAuth Issues**: 
   - Check redirect URIs in Google Cloud Console
   - Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
   - Verify the domain is authorized in Google Cloud Console
6. **RLS Policies**: Check that RLS policies are properly configured in Supabase

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
DEBUG="next-auth:*"
```

## Supabase Benefits

- **Built-in Authentication**: Supabase Auth with multiple providers
- **Real-time Features**: Live updates with subscriptions
- **Row Level Security**: Fine-grained access control
- **Auto-generated APIs**: REST and GraphQL APIs
- **Database Backups**: Automatic backups and point-in-time recovery
- **Edge Functions**: Serverless functions for custom logic
- **Storage**: File storage with CDN
- **Analytics**: Built-in analytics and monitoring 