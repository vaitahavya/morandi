-- Enhanced E-commerce Schema Migration
-- This migration adds comprehensive e-commerce functionality to replace WooCommerce dependencies

-- 1. Enhance Products Table with missing WooCommerce fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS sku VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS regular_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS featured_image VARCHAR,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_status VARCHAR DEFAULT 'instock',
ADD COLUMN IF NOT EXISTS manage_stock BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'published',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meta_title VARCHAR,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 2. Create Categories Table with hierarchical support
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  meta_title VARCHAR,
  meta_description TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Product-Category Junction Table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- 4. Create Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  sku VARCHAR UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  regular_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  stock_status VARCHAR DEFAULT 'instock',
  attributes JSONB, -- {color: "red", size: "large"}
  images TEXT[],
  weight DECIMAL(8,2),
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Product Attributes Table (flexible attribute system)
CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL, -- "Color", "Size", "Material"
  value VARCHAR NOT NULL, -- "Red", "Large", "Cotton"
  UNIQUE(product_id, name, value)
);

-- 6. Create Inventory Transactions Table (stock tracking)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL, -- 'sale', 'restock', 'adjustment', 'return'
  quantity INTEGER NOT NULL, -- positive for increase, negative for decrease
  reason VARCHAR, -- "Order #123", "Manual adjustment", "Supplier restock"
  reference VARCHAR, -- Order ID, Purchase Order ID, etc.
  stock_after INTEGER NOT NULL, -- snapshot of stock after transaction
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_visible ON categories(is_visible);

CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_name ON product_attributes(name);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);

-- 8. Enable Row Level Security on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for new tables

-- Categories are publicly readable
CREATE POLICY "Categories are publicly readable" ON categories
  FOR SELECT USING (is_visible = true);

-- Allow system to manage categories
CREATE POLICY "System can manage categories" ON categories
  FOR ALL USING (true);

-- Product categories follow product visibility
CREATE POLICY "Product categories are publicly readable" ON product_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_categories.product_id
    )
  );

-- System can manage product categories
CREATE POLICY "System can manage product categories" ON product_categories
  FOR ALL USING (true);

-- Product variants are publicly readable
CREATE POLICY "Product variants are publicly readable" ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_variants.product_id
    )
  );

-- System can manage product variants
CREATE POLICY "System can manage product variants" ON product_variants
  FOR ALL USING (true);

-- Product attributes are publicly readable
CREATE POLICY "Product attributes are publicly readable" ON product_attributes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products WHERE id = product_attributes.product_id
    )
  );

-- System can manage product attributes
CREATE POLICY "System can manage product attributes" ON product_attributes
  FOR ALL USING (true);

-- Inventory transactions - read only for authenticated users, write for system
CREATE POLICY "Authenticated users can view inventory transactions" ON inventory_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage inventory transactions" ON inventory_transactions
  FOR ALL USING (true);

-- 10. Create triggers for updated_at on new tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Create helper functions for inventory management

-- Function to update product stock when inventory transaction is created
CREATE OR REPLACE FUNCTION update_product_stock_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's stock_quantity
  UPDATE products 
  SET 
    stock_quantity = NEW.stock_after,
    stock_status = CASE 
      WHEN NEW.stock_after <= 0 THEN 'outofstock'
      WHEN NEW.stock_after <= COALESCE(low_stock_threshold, 5) THEN 'lowstock'
      ELSE 'instock'
    END,
    updated_at = NOW()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update product stock
CREATE TRIGGER trigger_update_product_stock 
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION update_product_stock_on_transaction();

-- 12. Create function to generate product slug from name
CREATE OR REPLACE FUNCTION generate_product_slug(product_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert name to slug format
  base_slug := lower(trim(regexp_replace(product_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM products WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 13. Update existing products to have slugs if they don't already
UPDATE products 
SET slug = generate_product_slug(name) 
WHERE slug IS NULL;