// Google Analytics 4 (GA4) Service
// Comprehensive analytics service with e-commerce tracking, conversions, and GDPR compliance

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent' | 'set',
      targetId: string | object,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

// Event interfaces
export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface GAEcommerceItem {
  item_id: string;
  item_name: string;
  category: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  quantity: number;
  price: number;
  currency?: string;
  item_brand?: string;
  item_variant?: string;
  location_id?: string;
  discount?: number;
}

export interface GAEcommerceEvent {
  currency: string;
  value: number;
  transaction_id?: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
  items: GAEcommerceItem[];
}

export interface GABookingEvent extends GAEcommerceEvent {
  checkin_date: string;
  checkout_date: string;
  number_of_nights: number;
  number_of_rooms: number;
  number_of_guests: number;
  hotel_id: string;
  hotel_name: string;
  hotel_location: string;
  room_type: string;
  booking_method: 'web' | 'mobile' | 'api';
  payment_method: string;
  user_type: 'guest' | 'returning' | 'business';
}

export interface GASearchEvent {
  search_term: string;
  location?: string;
  checkin_date?: string;
  checkout_date?: string;
  guests?: number;
  rooms?: number;
  results_count?: number;
  filters_applied?: string[];
  sort_order?: string;
}

export interface GAUserProperties {
  user_id?: string;
  customer_type?: 'guest' | 'host' | 'business';
  preferred_currency?: string;
  preferred_language?: string;
  signup_method?: 'email' | 'google' | 'facebook' | 'apple';
  total_bookings?: number;
  account_created_date?: string;
  is_premium_member?: boolean;
  location_country?: string;
  location_city?: string;
}

// Analytics configuration
export interface GAConfig {
  enabled: boolean;
  trackingId: string;
  debug: boolean;
  anonymize_ip: boolean;
  cookie_domain: 'auto' | string;
  cookie_expires: number;
  send_page_view: boolean;
  enhanced_ecommerce: boolean;
  custom_dimensions: Record<string, string>;
  custom_metrics: Record<string, string>;
}

// Main Google Analytics service
export class GoogleAnalyticsService {
  private config: GAConfig;
  private isInitialized = false;
  private consentGiven = false;
  private queuedEvents: Array<() => void> = [];

  constructor(config?: Partial<GAConfig>) {
    this.config = {
      enabled: true,
      trackingId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
      debug: import.meta.env.VITE_GA_DEBUG === 'true',
      anonymize_ip: true,
      cookie_domain: 'auto',
      cookie_expires: 63072000, // 2 years
      send_page_view: true,
      enhanced_ecommerce: true,
      custom_dimensions: {},
      custom_metrics: {},
      ...config
    };

    if (this.config.enabled && this.config.trackingId) {
      this.initialize();
    }
  }

  // Initialize Google Analytics
  private async initialize(): Promise<void> {
    if (this.isInitialized || !this.config.trackingId) return;

    try {
      // Load gtag script
      await this.loadGtagScript();
      
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      // Set default consent state
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted'
      });

      // Configure GA4
      window.gtag('config', this.config.trackingId, {
        anonymize_ip: this.config.anonymize_ip,
        cookie_domain: this.config.cookie_domain,
        cookie_expires: this.config.cookie_expires,
        send_page_view: this.config.send_page_view,
        debug_mode: this.config.debug,
        // Enhanced ecommerce
        enhanced_ecommerce: this.config.enhanced_ecommerce,
        // Custom dimensions and metrics
        ...this.config.custom_dimensions,
        ...this.config.custom_metrics
      });

      this.isInitialized = true;
      
      if (this.config.debug) {
        console.log('✅ Google Analytics initialized:', this.config.trackingId);
      }

    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  // Load gtag script dynamically
  private loadGtagScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src*="gtag/js"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Consent management
  grantConsent(consentTypes: {
    analytics?: boolean;
    marketing?: boolean;
    preferences?: boolean;
  }): void {
    if (!this.isInitialized) return;

    window.gtag('consent', 'update', {
      analytics_storage: consentTypes.analytics ? 'granted' : 'denied',
      ad_storage: consentTypes.marketing ? 'granted' : 'denied',
      ad_user_data: consentTypes.marketing ? 'granted' : 'denied',
      ad_personalization: consentTypes.marketing ? 'granted' : 'denied'
    });

    this.consentGiven = consentTypes.analytics || false;

    // Process queued events if analytics consent given
    if (this.consentGiven && this.queuedEvents.length > 0) {
      this.queuedEvents.forEach(event => event());
      this.queuedEvents = [];
    }

    if (this.config.debug) {
      console.log('🍪 GA Consent updated:', consentTypes);
    }
  }

  revokeConsent(): void {
    if (!this.isInitialized) return;

    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    this.consentGiven = false;
  }

  // User identification
  setUserId(userId: string): void {
    if (!this.executeOrQueue(() => this.setUserId(userId))) return;
    
    window.gtag('config', this.config.trackingId, {
      user_id: userId
    });

    if (this.config.debug) {
      console.log('👤 GA User ID set:', userId);
    }
  }

  setUserProperties(properties: GAUserProperties): void {
    if (!this.executeOrQueue(() => this.setUserProperties(properties))) return;

    // Set user properties
    const userProps: Record<string, any> = {};
    
    Object.entries(properties).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        userProps[key] = value;
      }
    });

    window.gtag('set', userProps);

    if (this.config.debug) {
      console.log('🏷️ GA User properties set:', userProps);
    }
  }

  // Page tracking
  trackPageView(page_path: string, page_title?: string, page_location?: string): void {
    if (!this.executeOrQueue(() => this.trackPageView(page_path, page_title, page_location))) return;

    const pageData: Record<string, any> = {
      page_path,
      page_title: page_title || document.title,
      page_location: page_location || window.location.href
    };

    window.gtag('config', this.config.trackingId, pageData);

    if (this.config.debug) {
      console.log('📄 GA Page view:', pageData);
    }
  }

  // Event tracking
  trackEvent(event: GAEvent): void {
    if (!this.executeOrQueue(() => this.trackEvent(event))) return;

    const eventData: Record<string, any> = {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    };

    window.gtag('event', event.action, eventData);

    if (this.config.debug) {
      console.log('📊 GA Event:', event.action, eventData);
    }
  }

  // Hotel search tracking
  trackHotelSearch(searchData: GASearchEvent): void {
    this.trackEvent({
      action: 'search',
      category: 'hotels',
      label: searchData.search_term,
      value: searchData.results_count,
      custom_parameters: {
        search_term: searchData.search_term,
        destination: searchData.location,
        check_in_date: searchData.checkin_date,
        check_out_date: searchData.checkout_date,
        guests: searchData.guests,
        rooms: searchData.rooms,
        results_count: searchData.results_count,
        filters_applied: searchData.filters_applied?.join(','),
        sort_order: searchData.sort_order
      }
    });
  }

  // Hotel view tracking
  trackHotelView(hotelId: string, hotelName: string, location: string, price?: number): void {
    this.trackEvent({
      action: 'view_item',
      category: 'hotels',
      label: hotelName,
      value: price,
      custom_parameters: {
        item_id: hotelId,
        item_name: hotelName,
        item_category: 'hotel',
        item_location: location,
        price,
        currency: 'ETB'
      }
    });
  }

  // Booking funnel tracking
  trackBookingStep(step: 'initiate' | 'details' | 'payment' | 'confirmation', bookingData: Partial<GABookingEvent>): void {
    let action = '';
    switch (step) {
      case 'initiate':
        action = 'begin_checkout';
        break;
      case 'details':
        action = 'add_shipping_info';
        break;
      case 'payment':
        action = 'add_payment_info';
        break;
      case 'confirmation':
        action = 'purchase';
        break;
    }

    this.trackEvent({
      action,
      category: 'booking',
      label: bookingData.hotel_name,
      value: bookingData.value,
      custom_parameters: {
        currency: bookingData.currency || 'ETB',
        transaction_id: bookingData.transaction_id,
        hotel_id: bookingData.hotel_id,
        hotel_name: bookingData.hotel_name,
        checkin_date: bookingData.checkin_date,
        checkout_date: bookingData.checkout_date,
        number_of_nights: bookingData.number_of_nights,
        number_of_rooms: bookingData.number_of_rooms,
        number_of_guests: bookingData.number_of_guests,
        room_type: bookingData.room_type,
        booking_method: bookingData.booking_method,
        payment_method: bookingData.payment_method
      }
    });
  }

  // E-commerce events
  trackPurchase(purchase: GABookingEvent): void {
    if (!this.executeOrQueue(() => this.trackPurchase(purchase))) return;

    window.gtag('event', 'purchase', {
      transaction_id: purchase.transaction_id,
      value: purchase.value,
      currency: purchase.currency,
      coupon: purchase.coupon,
      shipping: purchase.shipping,
      tax: purchase.tax,
      items: purchase.items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        currency: item.currency || purchase.currency,
        item_brand: item.item_brand,
        item_variant: item.item_variant
      })),
      // Booking-specific data
      checkin_date: purchase.checkin_date,
      checkout_date: purchase.checkout_date,
      number_of_nights: purchase.number_of_nights,
      number_of_rooms: purchase.number_of_rooms,
      number_of_guests: purchase.number_of_guests,
      hotel_id: purchase.hotel_id,
      hotel_name: purchase.hotel_name,
      hotel_location: purchase.hotel_location,
      room_type: purchase.room_type,
      booking_method: purchase.booking_method,
      payment_method: purchase.payment_method,
      user_type: purchase.user_type
    });

    if (this.config.debug) {
      console.log('💰 GA Purchase tracked:', purchase);
    }
  }

  trackRefund(transactionId: string, value?: number, currency?: string): void {
    if (!this.executeOrQueue(() => this.trackRefund(transactionId, value, currency))) return;

    window.gtag('event', 'refund', {
      transaction_id: transactionId,
      value,
      currency: currency || 'ETB'
    });
  }

  // User interaction tracking
  trackButtonClick(buttonName: string, location: string): void {
    this.trackEvent({
      action: 'click',
      category: 'engagement',
      label: buttonName,
      custom_parameters: {
        button_name: buttonName,
        button_location: location
      }
    });
  }

  trackFormSubmission(formName: string, formType: 'contact' | 'booking' | 'registration' | 'search'): void {
    this.trackEvent({
      action: 'form_submit',
      category: 'engagement',
      label: formName,
      custom_parameters: {
        form_name: formName,
        form_type: formType
      }
    });
  }

  trackFileDownload(fileName: string, fileType: string): void {
    this.trackEvent({
      action: 'file_download',
      category: 'engagement',
      label: fileName,
      custom_parameters: {
        file_name: fileName,
        file_type: fileType
      }
    });
  }

  trackOutboundLink(url: string, linkText?: string): void {
    this.trackEvent({
      action: 'click',
      category: 'outbound_link',
      label: linkText || url,
      custom_parameters: {
        outbound_url: url,
        link_text: linkText
      }
    });
  }

  trackSocialShare(platform: string, content: string): void {
    this.trackEvent({
      action: 'share',
      category: 'social',
      label: platform,
      custom_parameters: {
        social_platform: platform,
        content_type: content
      }
    });
  }

  trackVideoPlay(videoTitle: string, videoDuration?: number): void {
    this.trackEvent({
      action: 'video_play',
      category: 'media',
      label: videoTitle,
      custom_parameters: {
        video_title: videoTitle,
        video_duration: videoDuration
      }
    });
  }

  // Error tracking
  trackError(error: string, category: 'js_error' | 'api_error' | 'user_error' = 'js_error', location?: string): void {
    this.trackEvent({
      action: 'exception',
      category: 'error',
      label: error,
      custom_parameters: {
        error_type: category,
        error_location: location || window.location.pathname,
        error_message: error
      }
    });
  }

  // Performance tracking
  trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.trackEvent({
      action: 'timing_complete',
      category: 'performance',
      label: label || variable,
      value: time,
      custom_parameters: {
        timing_category: category,
        timing_variable: variable,
        timing_value: time
      }
    });
  }

  // Custom conversions
  trackConversion(conversionName: string, value?: number, currency?: string): void {
    this.trackEvent({
      action: conversionName,
      category: 'conversion',
      value,
      custom_parameters: {
        conversion_name: conversionName,
        conversion_value: value,
        currency: currency || 'ETB'
      }
    });
  }

  // Helper method to execute events or queue them if consent not given
  private executeOrQueue(eventFunction: () => void): boolean {
    if (!this.isInitialized) {
      if (this.config.debug) {
        console.warn('GA not initialized yet, queuing event');
      }
      this.queuedEvents.push(eventFunction);
      return false;
    }

    if (!this.consentGiven) {
      if (this.config.debug) {
        console.warn('GA consent not given, queuing event');
      }
      this.queuedEvents.push(eventFunction);
      return false;
    }

    return true;
  }

  // Utility methods
  isReady(): boolean {
    return this.isInitialized && this.consentGiven;
  }

  getTrackingId(): string {
    return this.config.trackingId;
  }

  isDebugMode(): boolean {
    return this.config.debug;
  }

  // Cleanup
  destroy(): void {
    this.queuedEvents = [];
    this.consentGiven = false;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const googleAnalytics = new GoogleAnalyticsService();

// Convenience functions
export const trackPageView = (page_path: string, page_title?: string) => {
  googleAnalytics.trackPageView(page_path, page_title);
};

export const trackEvent = (event: GAEvent) => {
  googleAnalytics.trackEvent(event);
};

export const trackHotelSearch = (searchData: GASearchEvent) => {
  googleAnalytics.trackHotelSearch(searchData);
};

export const trackBooking = (bookingData: GABookingEvent) => {
  googleAnalytics.trackPurchase(bookingData);
};

export const trackButtonClick = (buttonName: string, location: string) => {
  googleAnalytics.trackButtonClick(buttonName, location);
};

export const setUserId = (userId: string) => {
  googleAnalytics.setUserId(userId);
};

export const setUserProperties = (properties: GAUserProperties) => {
  googleAnalytics.setUserProperties(properties);
};

export const grantAnalyticsConsent = (consent: { analytics?: boolean; marketing?: boolean; preferences?: boolean }) => {
  googleAnalytics.grantConsent(consent);
};

export const revokeAnalyticsConsent = () => {
  googleAnalytics.revokeConsent();
};

export default googleAnalytics;
