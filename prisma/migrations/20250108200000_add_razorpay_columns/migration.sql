-- Add Razorpay payment columns to orders table
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "razorpay_order_id" TEXT,
  ADD COLUMN IF NOT EXISTS "razorpay_payment_id" TEXT,
  ADD COLUMN IF NOT EXISTS "razorpay_signature" TEXT;







