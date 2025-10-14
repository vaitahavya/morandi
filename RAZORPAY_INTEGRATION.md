# Razorpay Integration Guide

## ✅ Integration Status: COMPLETE

Your Morandi Lifestyle e-commerce store is now fully integrated with Razorpay payment gateway.

## 🔑 Configuration Details

### Environment Variables Configured

The following Razorpay credentials have been added to your `.env` file:

```env
RAZORPAY_KEY_ID="rzp_test_RMeE4biTu13IgC"
RAZORPAY_KEY_SECRET="Zrd6fFiFXXq2tG2JgnTsyxWf"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_RMeE4biTu13IgC"
```

### Key Breakdown

- **RAZORPAY_KEY_ID**: Used for server-side API calls to Razorpay (creating orders, verifying payments)
- **RAZORPAY_KEY_SECRET**: Used for server-side signature verification and secure operations
- **NEXT_PUBLIC_RAZORPAY_KEY_ID**: Used by the frontend to initialize the Razorpay checkout modal

> ⚠️ **Important**: These are TEST credentials (`rzp_test_`). For production, you'll need to replace them with LIVE credentials from your Razorpay dashboard.

## 🏗️ Architecture Overview

### Your payment flow consists of:

1. **Frontend** (`src/app/checkout/page.tsx`)
   - Collects customer information
   - Creates order via API
   - Initiates Razorpay payment modal

2. **Payment Intent API** (`src/app/api/payment/create-intent/route.ts`)
   - Creates Razorpay order
   - Validates order amount
   - Returns payment configuration to frontend

3. **Payment Confirmation API** (`src/app/api/payment/confirm/route.ts`)
   - Verifies payment signature
   - Updates order status to "paid" and "confirmed"
   - Updates inventory
   - Creates email notifications

4. **Client Library** (`src/lib/payment-api.ts`)
   - Helper functions for payment operations
   - Razorpay script loader
   - Payment processing workflow

## 🚀 How to Test

### Step 1: Start Your Development Server

```bash
npm run dev
```

### Step 2: Add Items to Cart and Proceed to Checkout

Navigate to `http://localhost:3000`, add products to cart, and go to checkout.

### Step 3: Test Payment

Use Razorpay's test card details:

**Test Credit Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

**Test UPI:**
- UPI ID: `success@razorpay`

**Other Test Methods:**
- Wallets: Use any test number/email
- NetBanking: Select any bank from the test list

### Step 4: Verify Success

After successful payment:
- Order status should change to "confirmed"
- Payment status should be "paid"
- Inventory should be reduced
- You'll be redirected to the order success page

## 📋 Payment Features Implemented

✅ **Order Creation**: Creates orders with billing and shipping details  
✅ **Razorpay Integration**: Full integration with Razorpay SDK  
✅ **Payment Verification**: Secure signature verification  
✅ **Inventory Management**: Automatic stock updates on payment confirmation  
✅ **Order Tracking**: Complete order status history  
✅ **Email Notifications**: Queued email notifications for order confirmation  
✅ **Multi-payment Methods**: Support for Cards, UPI, NetBanking, Wallets  
✅ **Mobile Responsive**: Works seamlessly on mobile devices  
✅ **Error Handling**: Comprehensive error handling and user feedback  

## 🔒 Security Features

1. **Signature Verification**: All payments are verified using HMAC SHA256 signature  
2. **Amount Validation**: Payment amount is validated against order total  
3. **Order State Checks**: Prevents double payment and validates order status  
4. **User Authorization**: Verifies user has permission to pay for the order  
5. **Environment Variables**: Sensitive credentials stored securely  
6. **Idempotent Operations**: Payment creation uses idempotency keys to prevent duplicate charges  
7. **CSRF Protection**: API endpoints validate CSRF tokens to prevent cross-site request forgery  
## 📊 Database Schema

Your payment flow uses these tables:

- `orders`: Main order table with payment status tracking
- `order_items`: Individual items in each order
- `order_status_history`: Tracks all status changes
- `inventory_transactions`: Records stock changes
- `email_notifications`: Queues email notifications

## 🌐 Going Live (Production)

When you're ready to accept real payments:

### Step 1: Get Live Credentials

1. Complete KYC on Razorpay dashboard
2. Activate your live account
3. Get your live API keys from https://dashboard.razorpay.com/app/keys

### Step 2: Update Environment Variables

Replace test credentials with live ones in your production `.env`:

```env
RAZORPAY_KEY_ID="rzp_live_YOUR_LIVE_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_LIVE_KEY_SECRET"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_YOUR_LIVE_KEY_ID"
```

### Step 3: Configure Webhooks (Recommended)

Set up webhook in Razorpay dashboard to handle:
- Payment failures
- Refunds
- Disputes

Webhook URL: `https://yourdomain.com/api/payment/webhook`

### Step 4: Test in Production

Before going fully live, test with a small real transaction.

## 🛠️ Troubleshooting

### Payment Modal Not Opening

**Issue**: Razorpay checkout modal doesn't appear  
**Solution**: 
- Check browser console for errors
- Ensure Razorpay script is loaded (should see it in Network tab)
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly

### Payment Fails with "Invalid Signature"

**Issue**: Payment fails during confirmation  
**Solution**: 
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check for extra spaces in the secret key
- Ensure you're using matching test/live credentials

### "Payment Service Not Configured" Error

**Issue**: Server returns configuration error  
**Solution**: 
- Restart your development server after adding .env variables
- Verify all three Razorpay environment variables are set
- Check `.env` file is in the project root

### Amount Mismatch Error

**Issue**: Payment fails with amount mismatch  
**Solution**: 
- Check tax calculation in checkout page
- Verify shipping cost logic
- Ensure currency conversion is correct (paise to rupees)

## 📞 Support Resources

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Payment Integration Guide**: https://razorpay.com/docs/payments/payment-gateway/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Razorpay Support**: https://razorpay.com/support/

## 🔍 Code Reference

### Key Files

- **Checkout Page**: `src/app/checkout/page.tsx`
- **Payment API Library**: `src/lib/payment-api.ts`
- **Create Payment Intent**: `src/app/api/payment/create-intent/route.ts`
- **Confirm Payment**: `src/app/api/payment/confirm/route.ts`
- **Webhook Handler**: `src/app/api/payment/webhook/route.ts`

### Example: Manual Payment Processing

```typescript
import { processPayment } from '@/lib/payment-api';

// Process payment for an order
await processPayment(
  orderId,
  totalAmount,
  (order) => {
    console.log('Payment successful!', order);
    // Handle success
  },
  (error) => {
    console.error('Payment failed:', error);
    // Handle error
  }
);
```

## ✨ Next Steps

1. **Test the payment flow** with test credentials
2. **Customize the theme** in payment modal (color in `payment-api.ts`)
3. **Set up email notifications** for order confirmations
4. **Configure webhooks** for production
5. **Complete Razorpay KYC** to go live

---

**Need Help?** Check the troubleshooting section above or refer to Razorpay's comprehensive documentation.

