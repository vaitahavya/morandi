-- Add INSERT policy for products table to allow sync
CREATE POLICY "System can insert products" ON products
  FOR INSERT WITH CHECK (true); 