# 🚀 Razorpay Quick Start Guide

## ✅ Integration Complete!

Your Razorpay payment gateway is now fully configured and ready to test.

---

## 🔑 Your Credentials (Configured)

```
Key ID:     rzp_test_RMeE4biTu13IgC
Key Secret: Zrd6fFiFXXq2tG2JgnTsyxWf
Mode:       TEST (Safe for development)
```

---

## 🎯 Test Your Payment Flow - 3 Steps

### 1️⃣ Start the Dev Server

```bash
npm run dev
```

### 2️⃣ Go to Checkout

1. Open `http://localhost:3000`
2. Add products to cart
3. Click "Checkout"
4. Fill in customer details

### 3️⃣ Test Payment with These Details

**💳 Test Card (Always Works):**
```
Card Number: 4111 1111 1111 1111
CVV:         123
Expiry:      12/25
Name:        Any Name
```

**📱 Test UPI:**
```
UPI ID: success@razorpay
```

---

## ✨ What Happens After Payment?

1. ✅ Order status → **Confirmed**
2. ✅ Payment status → **Paid**
3. ✅ Inventory → **Reduced automatically**
4. ✅ Redirect → **Order success page**
5. ✅ Email → **Queued for sending**

---

## 🔍 View Payment Flow in Action

### Order Creation
`POST /api/orders` → Creates pending order

### Payment Intent
`POST /api/payment/create-intent` → Razorpay order created

### Razorpay Modal
Customer completes payment in Razorpay's secure modal

### Payment Confirmation
`POST /api/payment/confirm` → Verifies signature & updates order

---

## 🛠️ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Modal doesn't open | Restart dev server (need to reload .env) |
| "Invalid signature" | Check RAZORPAY_KEY_SECRET is correct |
| "Not configured" | Verify all 3 env vars are set |

---

## 📁 Where Everything Lives

```
morandi/
├── .env                                    # 🔑 Your credentials (NEVER commit!)
├── src/
│   ├── app/
│   │   ├── checkout/page.tsx              # Checkout form
│   │   └── api/payment/
│   │       ├── create-intent/route.ts     # Creates Razorpay order
│   │       └── confirm/route.ts           # Confirms payment
│   └── lib/
│       └── payment-api.ts                 # Payment helper functions
└── RAZORPAY_INTEGRATION.md                # Full documentation
```

---

## 🌐 Going Live Checklist

When ready for production:

- [ ] Complete Razorpay KYC verification
- [ ] Get live API credentials from dashboard
- [ ] Update `.env` with live credentials
- [ ] Test with a real ₹1 transaction
- [ ] Set up webhook for payment events
- [ ] Enable 2FA on Razorpay dashboard

---

## 🎨 Customization Options

### Change Payment Modal Color

Edit `src/lib/payment-api.ts` line 141:

```typescript
theme: {
  color: '#3B82F6'  // Change to your brand color
}
```

### Adjust Free Shipping Threshold

Edit `src/app/checkout/page.tsx` line 106:

```typescript
const shippingCost = subtotal >= 500 ? 0 : 50;  // Adjust 500
```

### Modify Tax Rate

Edit `src/app/checkout/page.tsx` line 107:

```typescript
const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;  // 18% GST
```

---

## 📞 Need Help?

- **Full Documentation**: See `RAZORPAY_INTEGRATION.md`
- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/

---

**Status**: ✅ Ready to test  
**Next**: Run `npm run dev` and test a payment!

