# How to Add Sample Data to Your Database

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ohipggwnmnypiubsbcvu
2. Sign in if needed

### Step 2: Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New query" button

### Step 3: Copy and Paste the Sample Data
Copy this entire SQL code and paste it into the SQL Editor:

```sql
-- Clear existing data (if any)
DELETE FROM email_notifications;
DELETE FROM product_recommendations;
DELETE FROM reviews;
DELETE FROM wishlist_items;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM users;

-- Insert sample users
INSERT INTO users (id, email, name, password, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', 'John Doe', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSJgW.', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'jane@example.com', 'Jane Smith', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSJgW.', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@example.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSJgW.', NOW());

-- Insert sample products
INSERT INTO products (id, name, description, price, images, category, tags, in_stock) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Classic White T-Shirt', 'Premium cotton t-shirt with a comfortable fit', 29.99, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'], 'clothing', ARRAY['cotton', 'casual', 'white'], true),
  ('660e8400-e29b-41d4-a716-446655440002', 'Denim Jeans', 'High-quality denim jeans with perfect fit', 89.99, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'], 'clothing', ARRAY['denim', 'casual', 'blue'], true),
  ('660e8400-e29b-41d4-a716-446655440003', 'Leather Wallet', 'Genuine leather wallet with multiple card slots', 49.99, ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'], 'accessories', ARRAY['leather', 'wallet', 'brown'], true),
  ('660e8400-e29b-41d4-a716-446655440004', 'Wireless Headphones', 'Premium wireless headphones with noise cancellation', 199.99, ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'], 'electronics', ARRAY['wireless', 'audio', 'black'], true),
  ('660e8400-e29b-41d4-a716-446655440005', 'Running Shoes', 'Comfortable running shoes for all terrains', 129.99, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], 'footwear', ARRAY['running', 'sports', 'comfortable'], true),
  ('660e8400-e29b-41d4-a716-446655440006', 'Smart Watch', 'Feature-rich smartwatch with health tracking', 299.99, ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'], 'electronics', ARRAY['smartwatch', 'fitness', 'black'], true),
  ('660e8400-e29b-41d4-a716-446655440007', 'Backpack', 'Durable backpack with laptop compartment', 79.99, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], 'accessories', ARRAY['backpack', 'laptop', 'durable'], true),
  ('660e8400-e29b-41d4-a716-446655440008', 'Sunglasses', 'Stylish sunglasses with UV protection', 159.99, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f2812f3d?w=500'], 'accessories', ARRAY['sunglasses', 'style', 'protection'], true);

-- Insert sample orders
INSERT INTO orders (id, user_id, status, total) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'delivered', 119.98),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'shipped', 299.99),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'pending', 79.99);

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 2, 29.99),
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 1, 49.99),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440006', 1, 299.99),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 1, 79.99);

-- Insert sample wishlist items
INSERT INTO wishlist_items (user_id, product_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004'),
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005'),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440008');

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 5, 'Great quality t-shirt, very comfortable!'),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 4, 'Good fit and material, would recommend.'),
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 5, 'Excellent leather quality, perfect size.'),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440006', 4, 'Great features, battery life could be better.');

-- Insert sample product recommendations
INSERT INTO product_recommendations (product_id, recommended_product_id, score, reason) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 0.8, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 0.7, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 0.8, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440008', 0.6, 'tag_similarity'),
  ('660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440006', 0.9, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 0.9, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 0.5, 'tag_similarity'),
  ('660e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 0.6, 'tag_similarity');

-- Insert sample email notifications
INSERT INTO email_notifications (user_id, order_id, type, subject, content, sent, sent_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'order_confirmation', 'Order Confirmed', 'Your order has been confirmed and is being processed.', true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'shipping_update', 'Your Order Has Shipped', 'Your order is on its way! Track your package here.', true, NOW());

SELECT 'Database seeded successfully!' as status;
```

### Step 4: Execute the SQL
1. Click the "Run" button (or press Ctrl+Enter)
2. You should see "Database seeded successfully!" message

## What You'll Get:

### Test Users (Password: `password123`)
- **john@example.com** - John Doe
- **jane@example.com** - Jane Smith  
- **admin@example.com** - Admin User

### Sample Products
- Classic White T-Shirt ($29.99)
- Denim Jeans ($89.99)
- Leather Wallet ($49.99)
- Wireless Headphones ($199.99)
- Running Shoes ($129.99)
- Smart Watch ($299.99)
- Backpack ($79.99)
- Sunglasses ($159.99)

### Sample Data
- 3 orders with different statuses
- Product reviews and ratings
- Wishlist items
- Product recommendations
- Email notifications

## Test Your Application

After adding the sample data:

1. **Visit**: http://localhost:3001
2. **Browse Products**: Go to `/products` to see all products
3. **Test Login**: Use any of the test users above
4. **Check Account**: Visit `/account` to see order history
5. **Test Recommendations**: Browse different products to see recommendations

## Method 2: Quick Copy-Paste

If you want to quickly copy just the SQL, here's the direct link to your Supabase SQL Editor:

**https://supabase.com/dashboard/project/ohipggwnmnypiubsbcvu/sql**

Just paste the SQL code above and run it! 