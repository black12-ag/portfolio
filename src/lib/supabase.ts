import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_key_for_development'

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo') || supabaseAnonKey.includes('demo')) {
  console.warn('⚠️ Using demo Supabase configuration. Database features will be limited.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export types for better TypeScript support
export type Database = any // You can generate proper types from your Supabase schema later

// Basic types
interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface BookingData {
  userId: string;
  propertyId: string;
  propertyTitle?: string;
  propertyImage?: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
  totalGuests?: number;
  totalNights?: number;
  basePrice?: number;
  taxes?: number;
  serviceFee?: number;
  totalPrice: number;
  status?: string;
  [key: string]: any;
}

interface SearchData {
  query?: string;
  filters?: any;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  type?: string;
  resultCount?: number;
  userId?: string;
  context?: string;
  responseTime?: number;
  clickedResultId?: string;
  clickedResultPosition?: number;
  sessionId?: string;
  [key: string]: any;
}

// Helper functions for common operations
export const supabaseHelpers = {
  // ====================================
  // USER PROFILE MANAGEMENT
  // ====================================
  
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ====================================
  // BOOKING MANAGEMENT
  // ====================================
  
  // Create a new booking
  async createBooking(bookingData: BookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: bookingData.userId,
        property_id: bookingData.propertyId,
        property_title: bookingData.propertyTitle,
        property_image: bookingData.propertyImage,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        adults: bookingData.adults,
        children: bookingData.children,
        total_guests: bookingData.totalGuests,
        total_nights: bookingData.totalNights,
        base_price: bookingData.basePrice,
        taxes: bookingData.taxes,
        service_fee: bookingData.serviceFee,
        total_price: bookingData.totalPrice,
        status: bookingData.status || 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get user's bookings
  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update booking status
  async updateBookingStatus(bookingId: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ====================================
  // SEARCH MANAGEMENT
  // ====================================
  
  // Get user's saved searches
  async getSavedSearches(userId: string) {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Save a new search
  async saveSearch(userId: string, searchData: SearchData) {
    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: userId,
        search_query: searchData.query,
        search_filters: searchData.filters,
        search_location: searchData.location,
        search_data: searchData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete saved search
  async deleteSavedSearch(searchId: string, userId: string) {
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', searchId)
      .eq('user_id', userId)
    
    if (error) throw error
  },

  // ====================================
  // SEARCH ANALYTICS
  // ====================================
  
  // Get search analytics
  async getSearchAnalytics(userId?: string) {
    let query = supabase
      .from('search_analytics')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // Record search analytics
  async recordSearchAnalytics(searchData: SearchData) {
    const { data, error } = await supabase
      .from('search_analytics')
      .insert({
        search_query: searchData.query,
        search_filters: searchData.filters,
        results_count: searchData.resultsCount,
        user_id: searchData.userId,
        search_context: searchData.context,
        response_time: searchData.responseTime,
        clicked_result_id: searchData.clickedResultId,
        clicked_result_position: searchData.clickedResultPosition,
        session_id: searchData.sessionId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ====================================
  // WISHLIST MANAGEMENT
  // ====================================
  
  // Get user's wishlist
  async getWishlist(userId: string) {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Add item to wishlist
  async addToWishlist(userId: string, propertyData: any) {
    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        property_id: propertyData.id,
        property_data: propertyData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Remove item from wishlist
  async removeFromWishlist(userId: string, propertyId: string) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId)
    
    if (error) throw error
  },

  // Check if property is in wishlist
  async isInWishlist(userId: string, propertyId: string) {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
    return !!data
  },

  // ====================================
  // REVIEWS MANAGEMENT
  // ====================================
  
  // Get property reviews
  async getPropertyReviews(propertyId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create a review
  async createReview(reviewData: any) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: reviewData.userId,
        property_id: reviewData.propertyId,
        booking_id: reviewData.bookingId,
        rating: reviewData.rating,
        review_text: reviewData.reviewText,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ====================================
  // NOTIFICATIONS MANAGEMENT
  // ====================================
  
  // Get user notifications
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create notification
  async createNotification(notificationData: any) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ====================================
  // SEARCH CACHE MANAGEMENT (replaces localStorage)
  // ====================================
  
  // Cache search results
  async cacheSearchResults(userId: string, searchData: any) {
    const { data, error } = await supabase
      .from('search_cache')
      .upsert({
        user_id: userId,
        search_params: searchData.searchData || searchData,
        results: searchData.results || [],
        location: searchData.location,
        search_type: searchData.type || 'hotels',
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get recent search results from cache
  async getRecentSearchResults(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('search_cache')
      .select('results, location, search_params')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error || !data?.length) return []
    
    // Return the results from the most recent search
    return data[0]?.results || []
  },

  // ====================================
  // PROPERTY CACHE MANAGEMENT (replaces localStorage)
  // ====================================
  
  // Cache property data
  async cacheProperty(property: any) {
    const { data, error } = await supabase
      .from('cached_properties')
      .upsert({
        property_id: property.id,
        source: property.isLiteApiHotel ? 'liteapi' : (property.source || 'user'),
        property_data: property,
        city: property.location?.split(',')[0]?.trim() || property.city,
        country: property.location?.split(',')[1]?.trim() || property.country,
        price_usd: property.price || 0,
        rating: property.rating || 0,
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get cached properties
  async getCachedProperties(source?: string, limit = 100) {
    try {
      let query = supabase
        .from('cached_properties')
        .select('property_data')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('cached_at', { ascending: false })
        .limit(limit)
      
      if (source) {
        query = query.eq('source', source)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.warn('⚠️ Error fetching cached properties:', error)
        
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST205' || error?.message?.includes('does not exist')) {
          console.log('📋 Cached properties table not found, returning empty array')
          return []
        }
        throw error
      }
      
      return data?.map(item => 
        typeof item.property_data === 'string' 
          ? JSON.parse(item.property_data) 
          : item.property_data
      ) || []
    } catch (error: any) {
      console.warn('⚠️ Error in getCachedProperties:', error)
      return []
    }
  },

  // ====================================
  // FEATURED HOTELS (replaces hardcoded fallback data)
  // ====================================
  
  // Get featured hotels
  async getFeaturedHotels(limit = 12) {
    try {
      // First try to get from featured_hotels table
      const { data: featured, error: featuredError } = await supabase
        .from('featured_hotels')
        .select('property_data')
        .eq('is_active', true)
        .gte('featured_until', new Date().toISOString())
        .order('display_order', { ascending: true })
        .limit(limit)
      
      if (!featuredError && featured?.length) {
        console.log('🏨 Loaded featured hotels from Supabase database')
        return featured.map(item => 
          typeof item.property_data === 'string' 
            ? JSON.parse(item.property_data) 
            : item.property_data
        )
      }
      
      // If featured_hotels table is empty, try cached properties with high ratings
      if (!featured?.length) {
        console.log('🏨 Featured hotels table empty, trying cached properties...')
        const cached = await this.getCachedProperties('liteapi', limit)
        if (cached.length > 0) {
          return cached
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Error fetching featured hotels:', error)
    }
    
    // Final fallback to hardcoded data
    console.log('📋 Using fallback featured hotels data')
    return this.getFallbackFeaturedHotels(limit)
  },

  // Add property to featured hotels
  async addToFeaturedHotels(property: any, displayOrder = 0) {
    const { data, error } = await supabase
      .from('featured_hotels')
      .insert({
        property_id: property.id,
        source: property.source || 'liteapi',
        property_data: property,
        display_order: displayOrder,
        is_active: true,
        featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ====================================
  // USER PREFERENCES (replaces localStorage preferences)
  // ====================================
  
  // Get user preferences
  async getUserPreferences(userId: string, preferenceType: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .eq('preference_type', preferenceType)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.preferences || null
  },

  // Save user preferences
  async saveUserPreferences(userId: string, preferenceType: string, preferences: any) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preference_type: preferenceType,
        preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // ====================================
  // RECENT SEARCHES (replaces localStorage search history)
  // ====================================
  
  // Save recent search
  async saveRecentSearch(userId: string | null, searchData: any) {
    const { data, error } = await supabase
      .from('recent_searches')
      .insert({
        user_id: userId,
        search_query: searchData.query || searchData.location || '',
        location: searchData.location,
        check_in: searchData.checkIn,
        check_out: searchData.checkOut,
        guests: searchData.guests || 2,
        search_type: searchData.type || 'hotels',
        result_count: searchData.resultCount || 0
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get recent searches
  async getRecentSearches(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('recent_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // ====================================
  // REAL PROPERTIES (replaces sample data)
  // ====================================
  
  // Get all real properties (user + cached)
  async getAllRealProperties(limit = 100) {
    // Get user-created properties
    const { data: userProperties, error: userError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .limit(Math.floor(limit / 2))
    
    // Get cached API properties
    const cachedProperties = await this.getCachedProperties(undefined, Math.floor(limit / 2))
    
    const allProperties = [
      ...(userProperties || []).map(this.mapUserPropertyToProperty),
      ...cachedProperties
    ]
    
    return allProperties
  },

  // Helper function to map user property to Property interface
  mapUserPropertyToProperty(userProp: any) {
    return {
      id: userProp.id,
      title: userProp.title || userProp.name,
      location: `${userProp.city}, ${userProp.country}`,
      price: userProp.price_per_night,
      rating: userProp.average_rating,
      reviews: userProp.review_count,
      images: userProp.images || [],
      type: userProp.property_type,
      amenities: userProp.amenities || [],
      area: userProp.area || userProp.city,
      distance: userProp.address || '1 km from center',
      description: userProp.description || '',
      isVerified: userProp.is_verified,
      isSuperhost: userProp.is_superhost,
      isUserProperty: true
    }
  },

  // Record discount usage
  async recordDiscountUsage(discountId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('discount_usage')
        .insert({
          discount_id: discountId,
          user_id: userId,
          used_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording discount usage:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to record discount usage:', error);
      // Don't throw error to avoid breaking the discount application flow
    }
  },

  // ====================================
  // FALLBACK DATA (when tables don't exist)
  // ====================================
  
  // Fallback featured hotels data
  getFallbackFeaturedHotels(limit = 12) {
    const fallbackHotels = [
      {
        id: 'fallback-hotel-1',
        title: 'Grand Hotel Ethiopia',
        name: 'Grand Hotel Ethiopia',
        location: 'Addis Ababa, Ethiopia',
        price: 120,
        rating: 4.5,
        reviews: 234,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600'
        ],
        amenities: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa'],
        area: 'Bole',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        distance: '2.5 km from center',
        description: 'Luxury hotel in the heart of Addis Ababa with modern amenities and excellent service.',
        isVerified: true,
        isSuperhost: true,
        isLiteApiHotel: true
      },
      {
        id: 'fallback-hotel-2',
        title: 'Bahir Dar Resort',
        name: 'Bahir Dar Resort',
        location: 'Bahir Dar, Ethiopia',
        price: 85,
        rating: 4.2,
        reviews: 156,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600'
        ],
        amenities: ['wifi', 'pool', 'restaurant', 'spa', 'parking'],
        area: 'Lake Tana',
        city: 'Bahir Dar',
        country: 'Ethiopia',
        distance: '1.2 km from center',
        description: 'Beautiful resort by Lake Tana offering stunning views and comfortable accommodations.',
        isVerified: true,
        isSuperhost: false,
        isLiteApiHotel: true
      },
      {
        id: 'fallback-hotel-3',
        title: 'Dire Dawa Palace',
        name: 'Dire Dawa Palace',
        location: 'Dire Dawa, Ethiopia',
        price: 95,
        rating: 4.3,
        reviews: 89,
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600'
        ],
        amenities: ['wifi', 'breakfast', 'parking', 'restaurant'],
        area: 'City Center',
        city: 'Dire Dawa',
        country: 'Ethiopia',
        distance: '0.8 km from center',
        description: 'Historic hotel with traditional Ethiopian hospitality and modern comfort.',
        isVerified: true,
        isSuperhost: true,
        isLiteApiHotel: true
      },
      {
        id: 'fallback-hotel-4',
        title: 'Mountain View Lodge',
        name: 'Mountain View Lodge',
        location: 'Lalibela, Ethiopia',
        price: 110,
        rating: 4.6,
        reviews: 178,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600'
        ],
        amenities: ['wifi', 'restaurant', 'spa', 'parking', 'breakfast'],
        area: 'Historic Quarter',
        city: 'Lalibela',
        country: 'Ethiopia',
        distance: '1.5 km from Rock Churches',
        description: 'Perfect location for exploring the famous rock-hewn churches of Lalibela.',
        isVerified: true,
        isSuperhost: true,
        isLiteApiHotel: true
      }
    ]
    
    return fallbackHotels.slice(0, limit)
  }
}

export default supabase
