-- Add woocommerce_id field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS woocommerce_id VARCHAR;

-- Create index for woocommerce_id for better performance
CREATE INDEX IF NOT EXISTS idx_products_woocommerce_id ON products(woocommerce_id);

-- Add unique constraint to prevent duplicate WooCommerce products
ALTER TABLE products ADD CONSTRAINT unique_woocommerce_id UNIQUE (woocommerce_id); 