-- Returns & Refunds Management System Migration
-- This migration creates comprehensive returns and refunds management functionality

-- 1. Create Returns Table
CREATE TABLE IF NOT EXISTS returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_number VARCHAR UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_email VARCHAR NOT NULL,
  customer_phone VARCHAR,
  
  -- Return basic info
  return_reason VARCHAR NOT NULL, -- 'defective', 'wrong_item', 'not_as_described', 'changed_mind', 'damaged_shipping', 'other'
  return_description TEXT,
  status VARCHAR DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'received', 'processed', 'refunded', 'cancelled'
  
  -- Return details
  return_type VARCHAR DEFAULT 'refund', -- 'refund', 'exchange', 'store_credit'
  refund_amount DECIMAL(10,2),
  refund_method VARCHAR, -- 'original_payment', 'store_credit', 'bank_transfer'
  
  -- Media attachments
  images TEXT[], -- Array of image URLs
  videos TEXT[], -- Array of video URLs
  
  -- Return shipping
  return_label_url VARCHAR,
  tracking_number VARCHAR,
  carrier VARCHAR,
  return_shipping_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Processing info
  admin_notes TEXT,
  customer_notes TEXT,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Quality control
  qc_status VARCHAR, -- 'pending', 'passed', 'failed'
  qc_notes TEXT,
  qc_by UUID REFERENCES users(id) ON DELETE SET NULL,
  qc_at TIMESTAMP WITH TIME ZONE,
  
  -- Refund details
  refund_transaction_id VARCHAR,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Return Items Table
CREATE TABLE IF NOT EXISTS return_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR,
  product_sku VARCHAR,
  variant_name VARCHAR,
  
  -- Quantity and pricing
  quantity_returned INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2),
  total_refund_amount DECIMAL(10,2),
  
  -- Item condition
  condition_received VARCHAR, -- 'new', 'good', 'fair', 'poor', 'damaged'
  condition_notes TEXT,
  
  -- Restocking
  restockable BOOLEAN DEFAULT true,
  restocked BOOLEAN DEFAULT false,
  restocked_at TIMESTAMP WITH TIME ZONE,
  restocked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Return Status History Table
CREATE TABLE IF NOT EXISTS return_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Return Policies Table
CREATE TABLE IF NOT EXISTS return_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  
  -- Policy rules
  return_window_days INTEGER DEFAULT 30,
  exchange_window_days INTEGER DEFAULT 30,
  
  -- Conditions
  original_condition_required BOOLEAN DEFAULT true,
  original_packaging_required BOOLEAN DEFAULT false,
  receipt_required BOOLEAN DEFAULT true,
  
  -- Cost policies
  return_shipping_paid_by VARCHAR DEFAULT 'customer', -- 'customer', 'store', 'conditional'
  restocking_fee_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Eligible categories/products
  applies_to_all BOOLEAN DEFAULT true,
  eligible_categories TEXT[], -- Array of category IDs
  eligible_products TEXT[], -- Array of product IDs
  excluded_categories TEXT[], -- Array of category IDs
  excluded_products TEXT[], -- Array of product IDs
  
  -- Policy status
  is_active BOOLEAN DEFAULT true,
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effective_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_returns_return_number ON returns(return_number);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer_email ON returns(customer_email);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_requested_at ON returns(requested_at);
CREATE INDEX IF NOT EXISTS idx_returns_processed_at ON returns(processed_at);

CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_return_items_order_item_id ON return_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_return_items_product_id ON return_items(product_id);

CREATE INDEX IF NOT EXISTS idx_return_status_history_return_id ON return_status_history(return_id);
CREATE INDEX IF NOT EXISTS idx_return_status_history_created_at ON return_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_return_policies_is_active ON return_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_return_policies_effective_from ON return_policies(effective_from);

-- 6. Enable Row Level Security
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_policies ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- Returns - customers can view/manage their own returns, admin can view all
CREATE POLICY "Users can view own returns" ON returns
  FOR SELECT USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    auth.uid() IS NULL
  );

CREATE POLICY "Users can create returns for their orders" ON returns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = returns.order_id 
      AND (user_id = auth.uid() OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "System can manage returns" ON returns
  FOR ALL USING (true);

-- Return Items - follow same pattern as returns
CREATE POLICY "Users can view own return items" ON return_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE id = return_items.return_id 
      AND (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "System can manage return items" ON return_items
  FOR ALL USING (true);

-- Return Status History - users can view their own return history
CREATE POLICY "Users can view own return status history" ON return_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE id = return_status_history.return_id 
      AND (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "System can manage return status history" ON return_status_history
  FOR ALL USING (true);

-- Return Policies - publicly readable if active
CREATE POLICY "Active return policies are publicly readable" ON return_policies
  FOR SELECT USING (is_active = true AND effective_from <= NOW() AND (effective_until IS NULL OR effective_until >= NOW()));

CREATE POLICY "System can manage return policies" ON return_policies
  FOR ALL USING (true);

-- 8. Create triggers for updated_at
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON returns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_return_items_updated_at BEFORE UPDATE ON return_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_return_policies_updated_at BEFORE UPDATE ON return_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Create function to generate return numbers
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TEXT AS $$
DECLARE
  return_number TEXT;
  counter INTEGER;
BEGIN
  -- Generate return number in format: RET-YYYYMMDD-NNNN
  return_number := 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  -- Get today's return count
  SELECT COUNT(*) + 1 INTO counter
  FROM returns 
  WHERE created_at >= CURRENT_DATE;
  
  -- Pad with zeros to make it 4 digits
  return_number := return_number || LPAD(counter::TEXT, 4, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM returns WHERE return_number = return_number) LOOP
    counter := counter + 1;
    return_number := 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  END LOOP;
  
  RETURN return_number;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to automatically create return status history
CREATE OR REPLACE FUNCTION create_return_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert status history for new returns
  IF TG_OP = 'INSERT' THEN
    INSERT INTO return_status_history (return_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Return request created');
    RETURN NEW;
  END IF;
  
  -- Insert status history when status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO return_status_history (return_id, status, notes, changed_by)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status, NEW.processed_by);
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for return status history
CREATE TRIGGER trigger_return_status_history 
  AFTER INSERT OR UPDATE ON returns
  FOR EACH ROW EXECUTE FUNCTION create_return_status_history();

-- 11. Create function to handle inventory when returns are processed
CREATE OR REPLACE FUNCTION update_inventory_on_return_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When return status changes to 'received' and items are restockable, add back to inventory
  IF TG_OP = 'UPDATE' AND OLD.status != 'received' AND NEW.status = 'received' THEN
    -- Update inventory for restockable items
    UPDATE products 
    SET stock_quantity = stock_quantity + ri.quantity_returned
    FROM return_items ri
    WHERE ri.return_id = NEW.id 
    AND ri.product_id = products.id 
    AND ri.restockable = true 
    AND ri.restocked = false;
    
    -- Mark items as restocked
    UPDATE return_items 
    SET restocked = true, restocked_at = NOW(), restocked_by = NEW.processed_by
    WHERE return_id = NEW.id AND restockable = true AND restocked = false;
    
    -- Create inventory transactions
    INSERT INTO inventory_transactions (product_id, type, quantity, reason, reference, stock_after)
    SELECT 
      ri.product_id,
      'return',
      ri.quantity_returned,
      'Return received: ' || NEW.return_number,
      NEW.id,
      p.stock_quantity
    FROM return_items ri
    JOIN products p ON p.id = ri.product_id
    WHERE ri.return_id = NEW.id AND ri.restockable = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory management on returns
CREATE TRIGGER trigger_return_inventory_management 
  AFTER UPDATE ON returns
  FOR EACH ROW EXECUTE FUNCTION update_inventory_on_return_status();

-- 12. Insert default return policy
INSERT INTO return_policies (
  name, 
  description, 
  return_window_days, 
  exchange_window_days,
  original_condition_required,
  original_packaging_required,
  receipt_required,
  return_shipping_paid_by,
  restocking_fee_percent
) VALUES (
  'Standard Return Policy',
  'Our standard 30-day return policy for most products',
  30,
  30,
  true,
  false,
  false,
  'customer',
  0
) ON CONFLICT DO NOTHING;

-- 13. Add return-related columns to orders if not exists
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS return_eligible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS return_deadline TIMESTAMP WITH TIME ZONE;

-- Update existing orders to set return deadline
UPDATE orders 
SET return_deadline = created_at + INTERVAL '30 days'
WHERE return_deadline IS NULL AND status IN ('delivered', 'completed');

-- Comments for documentation
COMMENT ON TABLE returns IS 'Manages customer return requests and refund processing';
COMMENT ON TABLE return_items IS 'Individual items within a return request';
COMMENT ON TABLE return_status_history IS 'Tracks status changes for return requests';
COMMENT ON TABLE return_policies IS 'Configurable return policies for different product categories';

COMMENT ON COLUMN returns.status IS 'Return status: pending, approved, rejected, received, processed, refunded, cancelled';
COMMENT ON COLUMN returns.return_type IS 'Type of return: refund, exchange, store_credit';
COMMENT ON COLUMN returns.return_reason IS 'Reason for return: defective, wrong_item, not_as_described, changed_mind, damaged_shipping, other';
COMMENT ON COLUMN return_items.condition_received IS 'Condition when received: new, good, fair, poor, damaged';