-- Create shipping_rates table
CREATE TABLE "shipping_rates" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "pincode" TEXT,
    "pincode_prefix" TEXT,
    "zone" TEXT,
    "base_cost" DOUBLE PRECISION NOT NULL,
    "surcharge" DOUBLE PRECISION DEFAULT 0,
    "free_shipping_threshold" DOUBLE PRECISION,
    "estimated_delivery_min" INTEGER,
    "estimated_delivery_max" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "shipping_rates_pincode_idx" ON "shipping_rates" ("pincode");
CREATE INDEX "shipping_rates_pincode_prefix_idx" ON "shipping_rates" ("pincode_prefix");
CREATE INDEX "shipping_rates_zone_idx" ON "shipping_rates" ("zone");

-- Extend coupons for free shipping support
ALTER TABLE "coupons"
  ADD COLUMN "free_shipping" BOOLEAN DEFAULT false,
  ADD COLUMN "applies_to_zones" TEXT;

-- Extend orders with coupon and shipping rate references
ALTER TABLE "orders"
  ADD COLUMN "coupon_code" TEXT,
  ADD COLUMN "coupon_id" TEXT,
  ADD COLUMN "shipping_rate_id" TEXT;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_coupon_id_fkey"
  FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_shipping_rate_id_fkey"
  FOREIGN KEY ("shipping_rate_id") REFERENCES "shipping_rates"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Trigger to keep updated_at automatically current
CREATE OR REPLACE FUNCTION update_shipping_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_shipping_rates_updated_at
BEFORE UPDATE ON "shipping_rates"
FOR EACH ROW EXECUTE PROCEDURE update_shipping_rates_updated_at();

