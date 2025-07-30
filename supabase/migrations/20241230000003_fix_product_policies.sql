-- Drop existing policies for products table
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "System can insert products" ON products;

-- Create comprehensive policies for products table
-- Allow public read access
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT USING (true);

-- Allow system to insert products (for sync)
CREATE POLICY "System can insert products" ON products
  FOR INSERT WITH CHECK (true);

-- Allow system to update products (for sync)
CREATE POLICY "System can update products" ON products
  FOR UPDATE USING (true);

-- Allow system to delete products (for sync)
CREATE POLICY "System can delete products" ON products
  FOR DELETE USING (true); 