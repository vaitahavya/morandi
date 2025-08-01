import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { createClient };

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  email_verified?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ProductRecommendation {
  id: string;
  product_id: string;
  recommended_product_id: string;
  score: number;
  reason?: string;
  created_at: string;
}

export interface EmailNotification {
  id: string;
  user_id?: string;
  order_id?: string;
  type: string;
  subject: string;
  content: string;
  sent: boolean;
  sent_at?: string;
  created_at: string;
} 