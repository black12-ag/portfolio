-- ====================================
-- REAL DATA TABLES - NO MORE MOCKS!
-- ====================================
-- Complete database schema to replace all mock/localStorage data

-- 1. Search cache table (replaces localStorage search caching)
CREATE TABLE IF NOT EXISTS public.search_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    search_params JSONB NOT NULL,
    results JSONB NOT NULL,
    location TEXT,
    search_type TEXT DEFAULT 'hotels',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 hours')
);

-- 2. Property cache table (replaces localStorage property caching)
CREATE TABLE IF NOT EXISTS public.cached_properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id TEXT NOT NULL,
    source TEXT NOT NULL, -- 'liteapi', 'user', 'booking_com', etc.
    property_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    city TEXT,
    country TEXT,
    price_usd DECIMAL(10,2),
    rating DECIMAL(2,1),
    UNIQUE(property_id, source)
);

-- 3. User properties table (user-created listings)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT DEFAULT 'apartment',
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    area TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    price_per_night DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    max_guests INTEGER DEFAULT 4,
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    is_verified BOOLEAN DEFAULT false,
    is_superhost BOOLEAN DEFAULT false,
    average_rating DECIMAL(2,1) DEFAULT 4.0,
    review_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Featured hotels table (replaces hardcoded featured data)
CREATE TABLE IF NOT EXISTS public.featured_hotels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id TEXT NOT NULL,
    source TEXT NOT NULL,
    property_data JSONB NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    featured_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User preferences table (replaces localStorage preferences)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    preference_type TEXT NOT NULL, -- 'search_filters', 'currency', 'language', etc.
    preferences JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, preference_type)
);

-- 6. Recent searches table (replaces localStorage recent searches)
CREATE TABLE IF NOT EXISTS public.recent_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    location TEXT,
    check_in DATE,
    check_out DATE,
    guests INTEGER DEFAULT 2,
    search_type TEXT DEFAULT 'hotels',
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Search cache policies
CREATE POLICY "Users can manage own search cache" ON public.search_cache
    FOR ALL USING (auth.uid() = user_id);

-- Property cache policies (public read, system write)
CREATE POLICY "Anyone can read cached properties" ON public.cached_properties
    FOR SELECT USING (true);

CREATE POLICY "System can manage cached properties" ON public.cached_properties
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update cached properties" ON public.cached_properties
    FOR UPDATE USING (true);

-- User properties policies
CREATE POLICY "Users can manage own properties" ON public.properties
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read active properties" ON public.properties
    FOR SELECT USING (status = 'active');

-- Featured hotels policies (public read)
CREATE POLICY "Anyone can read featured hotels" ON public.featured_hotels
    FOR SELECT USING (is_active = true);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Recent searches policies
CREATE POLICY "Users can manage own searches" ON public.recent_searches
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for performance
CREATE INDEX search_cache_user_id_idx ON public.search_cache(user_id);
CREATE INDEX search_cache_expires_idx ON public.search_cache(expires_at);
CREATE INDEX search_cache_location_idx ON public.search_cache(location);

CREATE INDEX cached_properties_source_idx ON public.cached_properties(source);
CREATE INDEX cached_properties_city_idx ON public.cached_properties(city);
CREATE INDEX cached_properties_expires_idx ON public.cached_properties(expires_at);
CREATE INDEX cached_properties_price_idx ON public.cached_properties(price_usd);

CREATE INDEX properties_city_idx ON public.properties(city);
CREATE INDEX properties_status_idx ON public.properties(status);
CREATE INDEX properties_user_idx ON public.properties(user_id);
CREATE INDEX properties_location_idx ON public.properties(city, country);

CREATE INDEX featured_hotels_order_idx ON public.featured_hotels(display_order);
CREATE INDEX featured_hotels_active_idx ON public.featured_hotels(is_active);

CREATE INDEX user_preferences_type_idx ON public.user_preferences(user_id, preference_type);
CREATE INDEX recent_searches_user_idx ON public.recent_searches(user_id, created_at DESC);

-- Create functions to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Clean up expired search cache
    DELETE FROM public.search_cache WHERE expires_at < NOW();
    
    -- Clean up expired property cache
    DELETE FROM public.cached_properties WHERE expires_at < NOW();
    
    -- Clean up old recent searches (keep last 50 per user)
    DELETE FROM public.recent_searches 
    WHERE id NOT IN (
        SELECT id FROM public.recent_searches 
        WHERE user_id IS NOT NULL
        ORDER BY created_at DESC 
        LIMIT 50
    ) AND user_id IS NOT NULL;
    
    -- Clean up expired featured hotels
    DELETE FROM public.featured_hotels WHERE featured_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert some initial featured hotels from cache (if any exist)
-- This will be populated by the application when real hotels are cached

-- Success message
SELECT 'Real data tables created successfully! Ready to remove all mock data.' as status;
