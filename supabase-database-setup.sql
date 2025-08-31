-- =====================================================
-- SUPABASE DATABASE SETUP - COMPLETE SCHEMA
-- =====================================================
-- This script creates all necessary tables, policies, and functions
-- for the Metah booking platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  nationality TEXT,
  preferences JSONB DEFAULT '{
    "currency": "ETB",
    "language": "en",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "theme": "light"
  }'::jsonb,
  role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'host', 'admin', 'agent', 'senior_agent')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'senior_agent')
    )
  );

-- =====================================================
-- 2. SAVED SEARCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_data JSONB NOT NULL,
  search_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Saved searches policies
CREATE POLICY "Users can view own searches" ON saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches" ON saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own searches" ON saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own searches" ON saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. SEARCH ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  search_query TEXT,
  search_filters JSONB,
  results_count INTEGER,
  clicked_hotel_id TEXT,
  search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on search_analytics
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Search analytics policies
CREATE POLICY "Users can view own analytics" ON search_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON search_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics" ON search_analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'senior_agent')
    )
  );

-- =====================================================
-- 4. BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Hotel Information
  hotel_id TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  hotel_address TEXT,
  hotel_image TEXT,
  
  -- Booking Details
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER DEFAULT 0,
  rooms INTEGER DEFAULT 1,
  
  -- Pricing
  room_rate DECIMAL(10,2),
  total_nights INTEGER,
  subtotal DECIMAL(10,2),
  taxes DECIMAL(10,2),
  fees DECIMAL(10,2),
  total_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Guest Information
  guest_info JSONB DEFAULT '{}'::jsonb,
  
  -- Booking Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'cancelled', 'completed', 'refunded', 'no_show'
  )),
  confirmation_number TEXT UNIQUE,
  
  -- Payment Information
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  )),
  payment_method TEXT,
  payment_transaction_id TEXT,
  
  -- Cancellation
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  refund_amount DECIMAL(10,2),
  
  -- Special Requests
  special_requests TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_hotel_id_idx ON bookings(hotel_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_check_in_idx ON bookings(check_in);
CREATE INDEX IF NOT EXISTS bookings_confirmation_number_idx ON bookings(confirmation_number);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins and agents can view all bookings
CREATE POLICY "Staff can view all bookings" ON bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'agent', 'senior_agent')
    )
  );

-- =====================================================
-- 5. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN (
    'info', 'success', 'warning', 'error', 'booking', 'payment', 'system'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent'
  )),
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Related Data
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  action_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 6. WISHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Hotel Information
  hotel_id TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  hotel_image TEXT,
  hotel_location TEXT,
  hotel_rating DECIMAL(2,1),
  hotel_price DECIMAL(10,2),
  hotel_currency TEXT DEFAULT 'USD',
  
  -- Wishlist Metadata
  notes TEXT,
  is_price_alert_enabled BOOLEAN DEFAULT false,
  target_price DECIMAL(10,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique hotel per user
  UNIQUE(user_id, hotel_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS wishlist_hotel_id_idx ON wishlist(hotel_id);

-- Enable RLS on wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Wishlist policies
CREATE POLICY "Users can manage own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Hotel Information
  hotel_id TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT NOT NULL,
  
  -- Detailed Ratings
  ratings JSONB DEFAULT '{
    "cleanliness": 5,
    "service": 5,
    "location": 5,
    "value": 5,
    "amenities": 5
  }'::jsonb,
  
  -- Review Status
  status TEXT DEFAULT 'published' CHECK (status IN (
    'draft', 'published', 'hidden', 'flagged'
  )),
  
  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  
  -- Images
  review_images TEXT[], -- Array of image URLs
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one review per booking
  UNIQUE(user_id, booking_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_hotel_id_idx ON reviews(hotel_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews(status);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view published reviews" ON reviews
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can moderate all reviews
CREATE POLICY "Admins can moderate reviews" ON reviews
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'senior_agent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'senior_agent')
    )
  );

-- =====================================================
-- 8. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_updated_at
  BEFORE UPDATE ON wishlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking confirmation numbers
CREATE OR REPLACE FUNCTION generate_confirmation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_number IS NULL THEN
    NEW.confirmation_number = 'MTH-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for booking confirmation numbers
CREATE TRIGGER generate_booking_confirmation
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_confirmation_number();

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications 
  SET is_read = true, read_at = NOW()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$;

-- Function to get user's unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM notifications
  WHERE user_id = user_uuid 
    AND is_read = false
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN COALESCE(unread_count, 0);
END;
$$;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- =====================================================
-- 9. SAMPLE DATA (Optional - for development)
-- =====================================================

-- Insert sample notification for testing (only if no notifications exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM notifications LIMIT 1) THEN
    INSERT INTO notifications (
      user_id, title, message, type, priority
    )
    SELECT 
      id,
      'Welcome to Metah!',
      'Thank you for joining our booking platform. Start exploring amazing hotels around the world.',
      'info',
      'medium'
    FROM auth.users
    LIMIT 5; -- Only for first 5 users
  END IF;
END $$;

-- =====================================================
-- 10. VIEWS FOR ANALYTICS
-- =====================================================

-- View for booking statistics
CREATE OR REPLACE VIEW booking_stats AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
  SUM(total_price) as total_revenue,
  AVG(total_price) as average_booking_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM bookings
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- View for popular hotels
CREATE OR REPLACE VIEW popular_hotels AS
SELECT
  hotel_id,
  hotel_name,
  COUNT(*) as booking_count,
  AVG(total_price) as average_price,
  COUNT(DISTINCT user_id) as unique_customers,
  AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating END) as average_rating,
  COUNT(r.id) as review_count
FROM bookings b
LEFT JOIN reviews r ON b.hotel_id = r.hotel_id
WHERE b.created_at >= NOW() - INTERVAL '6 months'
  AND b.status IN ('confirmed', 'completed')
GROUP BY hotel_id, hotel_name
HAVING COUNT(*) >= 2
ORDER BY booking_count DESC, average_rating DESC;

-- =====================================================
-- 11. ROW LEVEL SECURITY SUMMARY
-- =====================================================

-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- This script creates:
-- ✅ 7 main tables with proper relationships
-- ✅ Row Level Security policies for data isolation
-- ✅ Indexes for better performance  
-- ✅ Triggers for automatic timestamps and confirmation numbers
-- ✅ Functions for common operations
-- ✅ Views for analytics
-- ✅ Automatic profile creation for new users
-- 
-- Next steps:
-- 1. Run this script in your Supabase SQL editor
-- 2. Test user registration and profile creation
-- 3. Test booking creation and notifications
-- 4. Set up your environment variables in .env
-- 
-- =====================================================
