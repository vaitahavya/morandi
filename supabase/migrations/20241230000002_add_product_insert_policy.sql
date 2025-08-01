-- Add INSERT policy for products table to allow sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'System can insert products'
  ) THEN
    CREATE POLICY "System can insert products" ON products
      FOR INSERT WITH CHECK (true);
  END IF;
END $$; 