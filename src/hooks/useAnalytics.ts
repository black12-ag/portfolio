// React hooks for Google Analytics integration
// Provides automatic page tracking, user identification, and event tracking

import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { 
  googleAnalytics, 
  trackPageView, 
  trackEvent, 
  setUserId, 
  setUserProperties,
  GAEvent,
  GAUserProperties 
} from '@/lib/googleAnalytics';
import { logger } from '@/lib/enterpriseLogger';

// Hook for automatic page view tracking
export const usePageTracking = (options: {
  trackPageViews?: boolean;
  trackPerformance?: boolean;
  excludeRoutes?: string[];
} = {}) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef<string>('');
  const startTime = useRef<number>(0);
  const {
    trackPageViews = true,
    trackPerformance = true,
    excludeRoutes = []
  } = options;

  useEffect(() => {
    // Skip tracking for excluded routes
    if (excludeRoutes.some(route => location.pathname.startsWith(route))) {
      return;
    }

    if (trackPageViews && googleAnalytics.isReady()) {
      const pagePath = location.pathname + location.search;
      const pageTitle = document.title;
      
      // Track page view
      trackPageView(pagePath, pageTitle);
      
      // Track page performance if enabled
      if (trackPerformance && previousPath.current) {
        const timeOnPage = Date.now() - startTime.current;
        if (timeOnPage > 1000) { // Only track if user spent more than 1 second
          trackEvent({
            action: 'page_timing',
            category: 'engagement',
            label: previousPath.current,
            value: Math.round(timeOnPage / 1000), // Convert to seconds
            custom_parameters: {
              time_on_page: timeOnPage,
              previous_page: previousPath.current,
              current_page: pagePath,
              navigation_type: navigationType
            }
          });
        }
      }

      // Update tracking state
      previousPath.current = pagePath;
      startTime.current = Date.now();
      
      if (import.meta.env.DEV) {
        logger.debug('Page view tracked', { pagePath, pageTitle });
      }
    }
  }, [location, navigationType, trackPageViews, trackPerformance, excludeRoutes]);

  // Return analytics ready state
  return {
    isReady: googleAnalytics.isReady(),
    trackingId: googleAnalytics.getTrackingId()
  };
};

// Hook for user identification and properties
export const useAnalyticsUser = () => {
  const identifyUser = useCallback((userId: string, properties?: GAUserProperties) => {
    if (googleAnalytics.isReady()) {
      setUserId(userId);
      if (properties) {
        setUserProperties(properties);
      }
      logger.info('Analytics user identified', { userId, hasProperties: !!properties });
    }
  }, []);

  const updateUserProperties = useCallback((properties: GAUserProperties) => {
    if (googleAnalytics.isReady()) {
      setUserProperties(properties);
      logger.debug('User properties updated', properties);
    }
  }, []);

  const clearUser = useCallback(() => {
    if (googleAnalytics.isReady()) {
      setUserId('');
      logger.info('Analytics user cleared');
    }
  }, []);

  return {
    identifyUser,
    updateUserProperties,
    clearUser,
    isReady: googleAnalytics.isReady()
  };
};

// Hook for event tracking
export const useAnalyticsEvents = () => {
  const track = useCallback((event: GAEvent) => {
    if (googleAnalytics.isReady()) {
      trackEvent(event);
      if (import.meta.env.DEV) {
        logger.debug('Event tracked', event);
      }
    }
  }, []);

  const trackButtonClick = useCallback((buttonName: string, location: string, additionalData?: Record<string, any>) => {
    track({
      action: 'click',
      category: 'engagement',
      label: buttonName,
      custom_parameters: {
        button_name: buttonName,
        button_location: location,
        ...additionalData
      }
    });
  }, [track]);

  const trackFormSubmission = useCallback((formName: string, formType: 'contact' | 'booking' | 'registration' | 'search', success = true) => {
    track({
      action: 'form_submit',
      category: 'engagement',
      label: formName,
      custom_parameters: {
        form_name: formName,
        form_type: formType,
        form_success: success
      }
    });
  }, [track]);

  const trackSearch = useCallback((searchTerm: string, resultsCount: number, filters?: string[]) => {
    track({
      action: 'search',
      category: 'search',
      label: searchTerm,
      value: resultsCount,
      custom_parameters: {
        search_term: searchTerm,
        results_count: resultsCount,
        filters_applied: filters?.join(',') || '',
        search_source: 'website'
      }
    });
  }, [track]);

  const trackError = useCallback((error: string, errorType: 'js_error' | 'api_error' | 'user_error' = 'js_error') => {
    track({
      action: 'exception',
      category: 'error',
      label: error,
      custom_parameters: {
        error_type: errorType,
        error_location: window.location.pathname,
        error_message: error,
        user_agent: navigator.userAgent
      }
    });
  }, [track]);

  const trackDownload = useCallback((fileName: string, fileType: string) => {
    track({
      action: 'file_download',
      category: 'engagement',
      label: fileName,
      custom_parameters: {
        file_name: fileName,
        file_type: fileType,
        download_location: window.location.pathname
      }
    });
  }, [track]);

  const trackSocialShare = useCallback((platform: string, contentType: string, contentId?: string) => {
    track({
      action: 'share',
      category: 'social',
      label: platform,
      custom_parameters: {
        social_platform: platform,
        content_type: contentType,
        content_id: contentId,
        share_location: window.location.pathname
      }
    });
  }, [track]);

  const trackVideoPlay = useCallback((videoTitle: string, videoId?: string, videoDuration?: number) => {
    track({
      action: 'video_play',
      category: 'media',
      label: videoTitle,
      custom_parameters: {
        video_title: videoTitle,
        video_id: videoId,
        video_duration: videoDuration,
        video_location: window.location.pathname
      }
    });
  }, [track]);

  return {
    track,
    trackButtonClick,
    trackFormSubmission,
    trackSearch,
    trackError,
    trackDownload,
    trackSocialShare,
    trackVideoPlay,
    isReady: googleAnalytics.isReady()
  };
};

// Hook for e-commerce tracking
export const useAnalyticsEcommerce = () => {
  const track = useCallback((event: GAEvent) => {
    if (googleAnalytics.isReady()) {
      trackEvent(event);
      if (import.meta.env.DEV) {
        logger.debug('Event tracked', event);
      }
    }
  }, []);
  const trackPurchase = useCallback((transactionData: {
    transaction_id: string;
    value: number;
    currency: string;
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
    coupon?: string;
    shipping?: number;
    tax?: number;
  }) => {
    if (googleAnalytics.isReady()) {
      const bookingEvent = {
        ...transactionData,
        checkin_date: '',
        checkout_date: '',
        number_of_nights: 0,
        number_of_rooms: 0,
        number_of_guests: 0,
        hotel_id: '',
        hotel_name: '',
        hotel_location: '',
        room_type: '',
        booking_method: 'web' as const,
        payment_method: '',
        user_type: 'guest' as const
      };
      
      googleAnalytics.trackPurchase(bookingEvent);
      logger.info('Purchase tracked', { transaction_id: transactionData.transaction_id, value: transactionData.value });
    }
  }, []);

  const trackHotelBooking = useCallback((bookingData: {
    transaction_id: string;
    hotel_id: string;
    hotel_name: string;
    hotel_location: string;
    room_type: string;
    checkin_date: string;
    checkout_date: string;
    number_of_nights: number;
    number_of_rooms: number;
    number_of_guests: number;
    total_amount: number;
    currency: string;
    payment_method: string;
    coupon?: string;
  }) => {
    if (googleAnalytics.isReady()) {
      const bookingEvent = {
        transaction_id: bookingData.transaction_id,
        value: bookingData.total_amount,
        currency: bookingData.currency,
        coupon: bookingData.coupon,
        items: [{
          item_id: bookingData.hotel_id,
          item_name: bookingData.hotel_name,
          category: 'accommodation',
          quantity: bookingData.number_of_rooms,
          price: bookingData.total_amount / bookingData.number_of_rooms,
          currency: bookingData.currency
        }],
        checkin_date: bookingData.checkin_date,
        checkout_date: bookingData.checkout_date,
        number_of_nights: bookingData.number_of_nights,
        number_of_rooms: bookingData.number_of_rooms,
        number_of_guests: bookingData.number_of_guests,
        hotel_id: bookingData.hotel_id,
        hotel_name: bookingData.hotel_name,
        hotel_location: bookingData.hotel_location,
        room_type: bookingData.room_type,
        booking_method: 'web' as const,
        payment_method: bookingData.payment_method,
        user_type: 'guest' as const
      };
      
      googleAnalytics.trackPurchase(bookingEvent);
      logger.info('Hotel booking tracked', { 
        transaction_id: bookingData.transaction_id, 
        hotel_name: bookingData.hotel_name, 
        value: bookingData.total_amount 
      });
    }
  }, []);

  const trackBookingStep = useCallback((step: 'initiate' | 'details' | 'payment' | 'confirmation', bookingData: {
    hotel_id?: string;
    hotel_name?: string;
    value?: number;
    currency?: string;
  }) => {
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackBookingStep(step, bookingData);
      logger.debug('Booking step tracked', { step, hotel_name: bookingData.hotel_name });
    }
  }, []);

  const trackHotelView = useCallback((hotelId: string, hotelName: string, location: string, price?: number) => {
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackHotelView(hotelId, hotelName, location, price);
      logger.debug('Hotel view tracked', { hotelId, hotelName, price });
    }
  }, []);

  const trackAddToWishlist = useCallback((hotelId: string, hotelName: string, price?: number) => {
    track({
      action: 'add_to_wishlist',
      category: 'engagement',
      label: hotelName,
      value: price,
      custom_parameters: {
        item_id: hotelId,
        item_name: hotelName,
        item_category: 'hotel',
        price,
        currency: 'ETB'
      }
    });
  }, [track]);

  return {
    trackPurchase,
    trackHotelBooking,
    trackBookingStep,
    trackHotelView,
    trackAddToWishlist,
    isReady: googleAnalytics.isReady()
  };
};

// Hook for performance tracking
export const useAnalyticsPerformance = () => {
  const trackTiming = useCallback((category: string, variable: string, time: number, label?: string) => {
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackTiming(category, variable, time, label);
      logger.debug('Timing tracked', { category, variable, time });
    }
  }, []);

  const trackAPICall = useCallback((endpoint: string, method: string, responseTime: number, success: boolean) => {
    trackTiming('API', endpoint, responseTime, `${method}_${success ? 'success' : 'error'}`);
  }, [trackTiming]);

  const trackPageLoad = useCallback((loadTime: number) => {
    trackTiming('Page Load', 'full_page_load', loadTime, window.location.pathname);
  }, [trackTiming]);

  const trackSearchPerformance = useCallback((searchTerm: string, responseTime: number, resultsCount: number) => {
    trackTiming('Search', 'search_response', responseTime, searchTerm);
    
    // Also track as event
    trackEvent({
      action: 'search_performance',
      category: 'performance',
      label: searchTerm,
      value: responseTime,
      custom_parameters: {
        search_term: searchTerm,
        response_time: responseTime,
        results_count: resultsCount
      }
    });
  }, [trackTiming]);

  return {
    trackTiming,
    trackAPICall,
    trackPageLoad,
    trackSearchPerformance,
    isReady: googleAnalytics.isReady()
  };
};

// Combined analytics hook - provides all functionality
export const useAnalytics = () => {
  const pageTracking = usePageTracking();
  const user = useAnalyticsUser();
  const events = useAnalyticsEvents();
  const ecommerce = useAnalyticsEcommerce();
  const performance = useAnalyticsPerformance();

  return {
    ...pageTracking,
    user,
    events,
    ecommerce,
    performance,
    isReady: googleAnalytics.isReady(),
    service: googleAnalytics
  };
};

export default useAnalytics;
