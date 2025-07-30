# WordPress Payment Gateway Integration Guide

## Problem
The current Razorpay integration is client-side only and not connected to your WordPress/WooCommerce payment gateway setup.

## Solutions

### Solution 1: WordPress Checkout Redirect (Recommended)

This approach creates a pending order in WordPress and redirects to your WordPress checkout page where your existing Razorpay gateway is configured.

#### How it works:
1. **Create Pending Order**: Order is created in WordPress with `pending` status
2. **Redirect to WordPress**: User is redirected to `your-wordpress-site.com/checkout/?order_id=123`
3. **WordPress Handles Payment**: Your existing Razorpay gateway processes the payment
4. **Order Completion**: WordPress updates the order status after payment

#### Benefits:
- ✅ Uses your existing WordPress Razorpay setup
- ✅ Secure server-side payment processing
- ✅ All WordPress hooks and filters work
- ✅ Order management in WordPress admin
- ✅ Email notifications work
- ✅ Inventory management

### Solution 2: Direct API Integration

If you want to keep everything in your Next.js app, you can integrate directly with Razorpay API.

#### Requirements:
1. **Razorpay Account**: Get API keys from Razorpay dashboard
2. **Server-side Processing**: Create API routes for payment processing
3. **Webhook Handling**: Handle payment confirmations

### Solution 3: WooCommerce REST API with Payment

Use WooCommerce REST API to create orders with payment processing.

## Implementation Steps

### Step 1: WordPress Setup

1. **Ensure Razorpay Plugin is Active**
   ```php
   // In your WordPress site, verify Razorpay is configured
   // WooCommerce > Settings > Payments > Razorpay
   ```

2. **Create Custom Checkout Page** (Optional)
   ```php
   // Add to your WordPress theme's functions.php
   add_action('init', function() {
       if (isset($_GET['order_id'])) {
           // Handle order_id parameter
           $order_id = sanitize_text_field($_GET['order_id']);
           // Load order and redirect to WooCommerce checkout
       }
   });
   ```

### Step 2: Next.js Integration

The current implementation already handles:
- ✅ Creating pending orders in WordPress
- ✅ Redirecting to WordPress checkout
- ✅ Form validation and data collection

### Step 3: Testing

1. **Test Order Creation**:
   - Add items to cart
   - Fill checkout form
   - Select "Pay Online (Razorpay)"
   - Should redirect to WordPress checkout

2. **Test Payment Flow**:
   - WordPress should load with order details
   - Razorpay payment should work
   - Order status should update in WordPress

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json
NEXT_PUBLIC_WC_CONSUMER_KEY=your_consumer_key
NEXT_PUBLIC_WC_CONSUMER_SECRET=your_consumer_secret
```

## Troubleshooting

### Issue: "No products found"
- Check WordPress API credentials
- Verify WooCommerce REST API is enabled
- Check if products exist in WordPress

### Issue: Payment not processing
- Verify Razorpay plugin is active in WordPress
- Check Razorpay API keys in WordPress
- Ensure WordPress checkout page exists

### Issue: Order not created
- Check WooCommerce REST API permissions
- Verify consumer key/secret are correct
- Check WordPress site is accessible

## Alternative: Direct Razorpay Integration

If you prefer to handle payments directly in Next.js:

1. **Install Razorpay**: `npm install razorpay`
2. **Create API Routes**: Handle payment processing server-side
3. **Webhook Handling**: Process payment confirmations
4. **Order Updates**: Update WordPress orders after payment

This requires more setup but gives you full control over the payment flow.

## Recommended Approach

**Use Solution 1 (WordPress Checkout Redirect)** because:
- Leverages your existing WordPress setup
- Minimal code changes required
- Secure and reliable
- Uses WordPress's battle-tested payment processing
- Maintains all WordPress functionality (emails, inventory, etc.) 