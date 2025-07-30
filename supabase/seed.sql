-- Insert sample users
INSERT INTO users (id, email, name, password, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', 'John Doe', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSJgW.', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'jane@example.com', 'Jane Smith', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSJgW.', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@example.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gSJgW.', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, name, description, price, images, category, tags, in_stock) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Classic White T-Shirt', 'Premium cotton t-shirt with a comfortable fit', 29.99, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'], 'clothing', ARRAY['cotton', 'casual', 'white'], true),
  ('660e8400-e29b-41d4-a716-446655440002', 'Denim Jeans', 'High-quality denim jeans with perfect fit', 89.99, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'], 'clothing', ARRAY['denim', 'casual', 'blue'], true),
  ('660e8400-e29b-41d4-a716-446655440003', 'Leather Wallet', 'Genuine leather wallet with multiple card slots', 49.99, ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'], 'accessories', ARRAY['leather', 'wallet', 'brown'], true),
  ('660e8400-e29b-41d4-a716-446655440004', 'Wireless Headphones', 'Premium wireless headphones with noise cancellation', 199.99, ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'], 'electronics', ARRAY['wireless', 'audio', 'black'], true),
  ('660e8400-e29b-41d4-a716-446655440005', 'Running Shoes', 'Comfortable running shoes for all terrains', 129.99, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], 'footwear', ARRAY['running', 'sports', 'comfortable'], true),
  ('660e8400-e29b-41d4-a716-446655440006', 'Smart Watch', 'Feature-rich smartwatch with health tracking', 299.99, ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'], 'electronics', ARRAY['smartwatch', 'fitness', 'black'], true),
  ('660e8400-e29b-41d4-a716-446655440007', 'Backpack', 'Durable backpack with laptop compartment', 79.99, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], 'accessories', ARRAY['backpack', 'laptop', 'durable'], true),
  ('660e8400-e29b-41d4-a716-446655440008', 'Sunglasses', 'Stylish sunglasses with UV protection', 159.99, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f2812f3d?w=500'], 'accessories', ARRAY['sunglasses', 'style', 'protection'], true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, user_id, status, total) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'delivered', 119.98),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'shipped', 299.99),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'pending', 79.99)
ON CONFLICT (id) DO NOTHING;

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
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440008')
ON CONFLICT (user_id, product_id) DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 5, 'Great quality t-shirt, very comfortable!'),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 4, 'Good fit and material, would recommend.'),
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 5, 'Excellent leather quality, perfect size.'),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440006', 4, 'Great features, battery life could be better.')
ON CONFLICT DO NOTHING;

-- Insert sample product recommendations
INSERT INTO product_recommendations (product_id, recommended_product_id, score, reason) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 0.8, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 0.7, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 0.8, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440008', 0.6, 'tag_similarity'),
  ('660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440006', 0.9, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 0.9, 'category_similarity'),
  ('660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 0.5, 'tag_similarity'),
  ('660e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 0.6, 'tag_similarity')
ON CONFLICT (product_id, recommended_product_id) DO NOTHING; 