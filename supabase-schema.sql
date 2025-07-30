-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  password VARCHAR,
  image VARCHAR,
  email_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[],
  category VARCHAR NOT NULL,
  tags TEXT[],
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_recommendations table
CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommended_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  score DECIMAL(3,2) NOT NULL,
  reason VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, recommended_product_id)
);

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  content TEXT NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_product_id ON product_recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Products are publicly readable
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT USING (true);

-- Orders are user-specific
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items follow order policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- Wishlist items are user-specific
CREATE POLICY "Users can view own wishlist" ON wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist" ON wishlist_items
  FOR ALL USING (auth.uid() = user_id);

-- Reviews are publicly readable but user-specific for creation
CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Product recommendations are publicly readable
CREATE POLICY "Product recommendations are publicly readable" ON product_recommendations
  FOR SELECT USING (true);

-- Email notifications are user-specific
CREATE POLICY "Users can view own notifications" ON email_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON email_notifications
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 