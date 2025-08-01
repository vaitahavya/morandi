-- Enhanced Order Management System Migration
-- This migration transforms the basic order system into a comprehensive e-commerce order management system

-- 1. Enhance Orders Table with comprehensive e-commerce fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS customer_email VARCHAR,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR,
ADD COLUMN IF NOT EXISTS billing_first_name VARCHAR,
ADD COLUMN IF NOT EXISTS billing_last_name VARCHAR,
ADD COLUMN IF NOT EXISTS billing_company VARCHAR,
ADD COLUMN IF NOT EXISTS billing_address1 VARCHAR,
ADD COLUMN IF NOT EXISTS billing_address2 VARCHAR,
ADD COLUMN IF NOT EXISTS billing_city VARCHAR,
ADD COLUMN IF NOT EXISTS billing_state VARCHAR,
ADD COLUMN IF NOT EXISTS billing_postcode VARCHAR,
ADD COLUMN IF NOT EXISTS billing_country VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_first_name VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_last_name VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_company VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_address1 VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_address2 VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_postcode VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_country VARCHAR,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR,
ADD COLUMN IF NOT EXISTS payment_method_title VARCHAR,
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR,
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR,
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR,
ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_method_title VARCHAR,
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR,
ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR,
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS source_channel VARCHAR DEFAULT 'website';

-- Allow null user_id for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Update status column comment
COMMENT ON COLUMN orders.status IS 'Order status: pending, confirmed, processing, shipped, delivered, cancelled, refunded';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed, refunded, partially_refunded';

-- 2. Enhance Order Items Table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS variant_id UUID,
ADD COLUMN IF NOT EXISTS product_name VARCHAR,
ADD COLUMN IF NOT EXISTS product_sku VARCHAR,
ADD COLUMN IF NOT EXISTS variant_name VARCHAR,
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS attributes JSONB,
ADD COLUMN IF NOT EXISTS product_image VARCHAR;

-- Update existing order_items to have unit_price and total_price
UPDATE order_items 
SET 
  unit_price = price,
  total_price = price * quantity,
  product_name = (SELECT name FROM products WHERE id = order_items.product_id)
WHERE unit_price IS NULL;

-- 3. Create Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR UNIQUE NOT NULL,
  type VARCHAR NOT NULL, -- 'percentage', 'fixed_amount'
  value DECIMAL(10,2) NOT NULL,
  minimum_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  user_limit INTEGER,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Shipping Methods Table
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) NOT NULL,
  min_days INTEGER,
  max_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  countries TEXT[], -- Array of country codes
  min_weight DECIMAL(8,2),
  max_weight DECIMAL(8,2),
  min_amount DECIMAL(10,2), -- Minimum order amount for this method
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_name ON order_items(product_name);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

CREATE INDEX IF NOT EXISTS idx_shipping_methods_is_active ON shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_cost ON shipping_methods(cost);

-- 7. Enable Row Level Security on new tables
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for new tables

-- Order Status History - users can view their own order history, admin can view all
CREATE POLICY "Users can view own order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_status_history.order_id 
      AND (user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "System can manage order status history" ON order_status_history
  FOR ALL USING (true);

-- Coupons - publicly readable (for validation), admin manageable
CREATE POLICY "Coupons are publicly readable" ON coupons
  FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

CREATE POLICY "System can manage coupons" ON coupons
  FOR ALL USING (true);

-- Shipping Methods - publicly readable if active
CREATE POLICY "Active shipping methods are publicly readable" ON shipping_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "System can manage shipping methods" ON shipping_methods
  FOR ALL USING (true);

-- 9. Create triggers for updated_at
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_methods_updated_at BEFORE UPDATE ON shipping_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_number TEXT;
  counter INTEGER;
BEGIN
  -- Generate order number in format: ORD-YYYYMMDD-NNNN
  order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  -- Get today's order count
  SELECT COUNT(*) + 1 INTO counter
  FROM orders 
  WHERE created_at >= CURRENT_DATE;
  
  -- Pad with zeros to make it 4 digits
  order_number := order_number || LPAD(counter::TEXT, 4, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = order_number) LOOP
    counter := counter + 1;
    order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  END LOOP;
  
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- 11. Create function to automatically create order status history
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert status history for new orders
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Order created');
    RETURN NEW;
  END IF;
  
  -- Insert status history when status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status);
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status history
CREATE TRIGGER trigger_order_status_history 
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_order_status_history();

-- 12. Create function to update inventory on order confirmation
CREATE OR REPLACE FUNCTION update_inventory_on_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When order status changes to 'confirmed', reduce inventory
  IF TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
    -- Create inventory transactions for each order item
    INSERT INTO inventory_transactions (product_id, type, quantity, reason, reference, stock_after)
    SELECT 
      oi.product_id,
      'sale',
      -oi.quantity,
      'Order confirmed: ' || NEW.order_number,
      NEW.id,
      GREATEST(p.stock_quantity - oi.quantity, 0)
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = NEW.id;
  END IF;
  
  -- When order is cancelled, restore inventory
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    -- Create inventory transactions to restore stock
    INSERT INTO inventory_transactions (product_id, type, quantity, reason, reference, stock_after)
    SELECT 
      oi.product_id,
      'return',
      oi.quantity,
      'Order cancelled: ' || NEW.order_number,
      NEW.id,
      p.stock_quantity + oi.quantity
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory management
CREATE TRIGGER trigger_order_inventory_management 
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_inventory_on_order_status();

-- 13. Insert default shipping methods
INSERT INTO shipping_methods (name, description, cost, min_days, max_days, countries) VALUES
('Standard Shipping', 'Standard delivery within 5-7 business days', 50.00, 5, 7, '{"IN"}'),
('Express Shipping', 'Express delivery within 2-3 business days', 150.00, 2, 3, '{"IN"}'),
('Same Day Delivery', 'Same day delivery within metro cities', 300.00, 0, 1, '{"IN"}')
ON CONFLICT DO NOTHING;

-- 14. Update existing orders to have order numbers
UPDATE orders 
SET order_number = generate_order_number() 
WHERE order_number IS NULL;