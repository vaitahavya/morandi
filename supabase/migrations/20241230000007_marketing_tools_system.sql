-- Marketing Tools System Migration
-- This migration creates comprehensive marketing management functionality

-- 1. Create Banners/Sliders Table
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  title VARCHAR,
  subtitle VARCHAR,
  description TEXT,
  
  -- Media
  image_url VARCHAR NOT NULL,
  mobile_image_url VARCHAR,
  alt_text VARCHAR,
  
  -- Link and CTA
  button_text VARCHAR,
  button_url VARCHAR,
  external_link BOOLEAN DEFAULT false,
  
  -- Display settings
  position VARCHAR DEFAULT 'hero', -- 'hero', 'featured', 'category', 'sidebar'
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Targeting
  target_audience VARCHAR[], -- Array of audience segments
  target_pages VARCHAR[], -- Array of page URLs where banner should appear
  
  -- Analytics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  
  -- Campaign type
  type VARCHAR NOT NULL, -- 'email', 'sms', 'push', 'banner', 'social'
  status VARCHAR DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
  
  -- Content
  subject VARCHAR, -- For email campaigns
  content TEXT,
  html_content TEXT,
  
  -- Targeting
  target_audience VARCHAR[], -- Array of audience segments
  target_customers TEXT[], -- Array of customer emails/IDs
  exclude_customers TEXT[], -- Array of customer emails/IDs to exclude
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Limits and rules
  max_sends INTEGER,
  send_limit_per_customer INTEGER DEFAULT 1,
  
  -- Analytics
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Campaign Recipients Table
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_email VARCHAR NOT NULL,
  customer_name VARCHAR,
  
  -- Status tracking
  status VARCHAR DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking data
  message_id VARCHAR, -- Email/SMS message ID for tracking
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_reason VARCHAR,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Featured Products Table
CREATE TABLE IF NOT EXISTS featured_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Display settings
  position VARCHAR DEFAULT 'homepage', -- 'homepage', 'category', 'sidebar', 'checkout'
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Custom display
  custom_title VARCHAR,
  custom_description TEXT,
  custom_image_url VARCHAR,
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Targeting
  target_audience VARCHAR[], -- Array of audience segments
  target_pages VARCHAR[], -- Array of page URLs
  
  -- Analytics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  
  -- Subscription preferences
  is_active BOOLEAN DEFAULT true,
  subscription_source VARCHAR, -- 'website', 'checkout', 'admin', 'api'
  
  -- Preferences
  email_preferences JSONB DEFAULT '{"marketing": true, "promotions": true, "news": true, "product_updates": true}',
  
  -- Tracking
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics
  total_emails_received INTEGER DEFAULT 0,
  total_emails_opened INTEGER DEFAULT 0,
  total_emails_clicked INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Marketing Templates Table
CREATE TABLE IF NOT EXISTS marketing_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- 'email', 'sms', 'banner', 'social'
  
  -- Content
  subject VARCHAR, -- For email templates
  content TEXT,
  html_content TEXT,
  
  -- Template settings
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Variables
  variables JSONB, -- Template variables like {{customer_name}}, {{order_number}}, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_start_date ON banners(start_date);
CREATE INDEX IF NOT EXISTS idx_banners_end_date ON banners(end_date);

CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_customer_email ON campaign_recipients(customer_email);

CREATE INDEX IF NOT EXISTS idx_featured_products_position ON featured_products(position);
CREATE INDEX IF NOT EXISTS idx_featured_products_is_active ON featured_products(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON featured_products(product_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active ON newsletter_subscribers(is_active);

CREATE INDEX IF NOT EXISTS idx_marketing_templates_type ON marketing_templates(type);
CREATE INDEX IF NOT EXISTS idx_marketing_templates_is_active ON marketing_templates(is_active);

-- 8. Enable Row Level Security
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_templates ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies

-- Banners - publicly readable if active, admin manageable
CREATE POLICY "Active banners are publicly readable" ON banners
  FOR SELECT USING (
    is_active = true AND 
    (start_date IS NULL OR start_date <= NOW()) AND 
    (end_date IS NULL OR end_date >= NOW())
  );

CREATE POLICY "System can manage banners" ON banners
  FOR ALL USING (true);

-- Campaigns - admin manageable
CREATE POLICY "System can manage campaigns" ON campaigns
  FOR ALL USING (true);

-- Campaign Recipients - admin manageable
CREATE POLICY "System can manage campaign recipients" ON campaign_recipients
  FOR ALL USING (true);

-- Featured Products - publicly readable if active, admin manageable
CREATE POLICY "Active featured products are publicly readable" ON featured_products
  FOR SELECT USING (
    is_active = true AND 
    (start_date IS NULL OR start_date <= NOW()) AND 
    (end_date IS NULL OR end_date >= NOW())
  );

CREATE POLICY "System can manage featured products" ON featured_products
  FOR ALL USING (true);

-- Newsletter Subscribers - admin manageable
CREATE POLICY "System can manage newsletter subscribers" ON newsletter_subscribers
  FOR ALL USING (true);

-- Marketing Templates - admin manageable
CREATE POLICY "System can manage marketing templates" ON marketing_templates
  FOR ALL USING (true);

-- 10. Create triggers for updated_at
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_recipients_updated_at BEFORE UPDATE ON campaign_recipients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_products_updated_at BEFORE UPDATE ON featured_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_templates_updated_at BEFORE UPDATE ON marketing_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Create function to track banner impressions
CREATE OR REPLACE FUNCTION track_banner_impression(banner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE banners 
  SET impressions = impressions + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Create function to track banner clicks
CREATE OR REPLACE FUNCTION track_banner_click(banner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE banners 
  SET clicks = clicks + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql;

-- 13. Create function to track featured product impressions
CREATE OR REPLACE FUNCTION track_featured_product_impression(featured_product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE featured_products 
  SET impressions = impressions + 1
  WHERE id = featured_product_id;
END;
$$ LANGUAGE plpgsql;

-- 14. Create function to track featured product clicks
CREATE OR REPLACE FUNCTION track_featured_product_click(featured_product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE featured_products 
  SET clicks = clicks + 1
  WHERE id = featured_product_id;
END;
$$ LANGUAGE plpgsql;

-- 15. Insert default marketing templates
INSERT INTO marketing_templates (name, type, subject, content, html_content, is_default, variables) VALUES
('Welcome Email', 'email', 'Welcome to Morandi Lifestyle!', 'Welcome {{customer_name}}! Thank you for joining our community.', '<h1>Welcome {{customer_name}}!</h1><p>Thank you for joining our community.</p>', true, '{"customer_name": "string"}'),
('Order Confirmation', 'email', 'Order Confirmed - {{order_number}}', 'Your order {{order_number}} has been confirmed. Total: {{order_total}}', '<h1>Order Confirmed</h1><p>Order: {{order_number}}</p><p>Total: {{order_total}}</p>', true, '{"order_number": "string", "order_total": "currency"}'),
('Abandoned Cart', 'email', 'Complete Your Purchase - {{cart_total}}', 'You left items in your cart worth {{cart_total}}. Complete your purchase now!', '<h1>Complete Your Purchase</h1><p>Items worth {{cart_total}} are waiting for you.</p>', true, '{"cart_total": "currency"}'),
('Newsletter Welcome', 'email', 'Welcome to Our Newsletter!', 'Thank you for subscribing to our newsletter. You''ll receive updates about new products and exclusive offers.', '<h1>Welcome to Our Newsletter!</h1><p>Thank you for subscribing.</p>', true, '{}')
ON CONFLICT DO NOTHING;

-- 16. Insert sample banner
INSERT INTO banners (name, title, subtitle, description, image_url, button_text, button_url, position, priority) VALUES
('Summer Sale Banner', 'Summer Collection', 'Up to 50% off on selected items', 'Discover our latest summer collection with amazing discounts', '/images/banners/hero-main.jpg', 'Shop Now', '/products', 'hero', 1)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE banners IS 'Manages promotional banners and sliders for the website';
COMMENT ON TABLE campaigns IS 'Email, SMS, and other marketing campaigns';
COMMENT ON TABLE campaign_recipients IS 'Tracks individual campaign recipients and their engagement';
COMMENT ON TABLE featured_products IS 'Products featured in promotional positions';
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscription management';
COMMENT ON TABLE marketing_templates IS 'Reusable templates for marketing communications';

COMMENT ON COLUMN banners.position IS 'Banner position: hero, featured, category, sidebar';
COMMENT ON COLUMN campaigns.type IS 'Campaign type: email, sms, push, banner, social';
COMMENT ON COLUMN campaigns.status IS 'Campaign status: draft, scheduled, active, paused, completed, cancelled';
COMMENT ON COLUMN featured_products.position IS 'Featured product position: homepage, category, sidebar, checkout'; 