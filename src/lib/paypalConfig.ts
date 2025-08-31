/**
 * PayPal Configuration and Integration
 * Centralized PayPal payment processing for METAH booking platform
 */

// PayPal credentials from environment
export const PAYPAL_CONFIG = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  clientSecret: import.meta.env.VITE_PAYPAL_CLIENT_SECRET,
  
  // PayPal environment (sandbox for development, live for production)
  environment: import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox',
  
  // PayPal SDK configuration
  sdkOptions: {
    'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: 'USD',
    intent: 'capture',
    'data-client-token': '', // Will be set dynamically
    locale: 'en_US'
  },

  // Supported currencies for different regions
  supportedCurrencies: {
    global: 'USD',
    ethiopia: 'USD', // PayPal doesn't support ETB directly
    europe: 'EUR',
    uk: 'GBP',
    canada: 'CAD',
    australia: 'AUD',
    japan: 'JPY'
  },

  // PayPal API endpoints
  apiEndpoints: {
    sandbox: 'https://api.sandbox.paypal.com',
    live: 'https://api.paypal.com'
  },

  // Payment intent options
  paymentIntents: {
    capture: 'CAPTURE', // Immediate payment capture
    authorize: 'AUTHORIZE' // Authorize first, capture later
  }
};

// PayPal SDK loading promise
let paypalSDKPromise: Promise<any> | null = null;

/**
 * Load PayPal SDK dynamically
 */
export const loadPayPalSDK = (): Promise<any> => {
  if (paypalSDKPromise) {
    return paypalSDKPromise;
  }

  if (!PAYPAL_CONFIG.clientId) {
    return Promise.reject(new Error('PayPal Client ID not found in environment variables'));
  }

  paypalSDKPromise = new Promise((resolve, reject) => {
    // Check if PayPal SDK is already loaded
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    const params = new URLSearchParams({
      'client-id': PAYPAL_CONFIG.clientId!,
      currency: PAYPAL_CONFIG.sdkOptions.currency,
      intent: PAYPAL_CONFIG.sdkOptions.intent,
      locale: PAYPAL_CONFIG.sdkOptions.locale
    });

    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.paypal) {
        resolve(window.paypal);
      } else {
        reject(new Error('PayPal SDK failed to load'));
      }
    };

    script.onerror = () => reject(new Error('Failed to load PayPal SDK script'));

    document.head.appendChild(script);
  });

  return paypalSDKPromise;
};

/**
 * Create PayPal payment order
 */
export const createPayPalOrder = async (amount: number, currency = 'USD', description?: string) => {
  const paypal = await loadPayPalSDK();
  
  return paypal.Buttons.createOrder({
    intent: PAYPAL_CONFIG.paymentIntents.capture,
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2)
      },
      description: description || 'METAH Booking Payment'
    }],
    application_context: {
      brand_name: 'METAH Travel',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${window.location.origin}/payment/success`,
      cancel_url: `${window.location.origin}/payment/cancel`
    }
  });
};

/**
 * Capture PayPal payment
 */
export const capturePayPalPayment = async (orderID: string) => {
  const paypal = await loadPayPalSDK();
  
  return paypal.Buttons.captureOrder(orderID);
};

/**
 * Get PayPal access token for server-side operations
 */
export const getPayPalAccessToken = async (): Promise<string> => {
  if (!PAYPAL_CONFIG.clientId || !PAYPAL_CONFIG.clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const environment = PAYPAL_CONFIG.environment;
  const apiUrl = PAYPAL_CONFIG.apiEndpoints[environment as keyof typeof PAYPAL_CONFIG.apiEndpoints];

  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`)}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Verify PayPal payment on the server side
 */
export const verifyPayPalPayment = async (orderID: string): Promise<any> => {
  const accessToken = await getPayPalAccessToken();
  const environment = PAYPAL_CONFIG.environment;
  const apiUrl = PAYPAL_CONFIG.apiEndpoints[environment as keyof typeof PAYPAL_CONFIG.apiEndpoints];

  const response = await fetch(`${apiUrl}/v2/checkout/orders/${orderID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to verify PayPal payment');
  }

  return response.json();
};

/**
 * Get appropriate currency for user's region
 */
export const getRegionalCurrency = (countryCode?: string): string => {
  const currencies = PAYPAL_CONFIG.supportedCurrencies;
  
  if (!countryCode) return currencies.global;
  
  const country = countryCode.toLowerCase();
  
  // European Union countries
  const euCountries = ['at', 'be', 'cy', 'ee', 'fi', 'fr', 'de', 'gr', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pt', 'sk', 'si', 'es'];
  if (euCountries.includes(country)) return currencies.europe;
  
  // Specific country mappings
  const countryMappings: Record<string, string> = {
    'gb': currencies.uk,
    'ca': currencies.canada,
    'au': currencies.australia,
    'jp': currencies.japan,
    'et': currencies.ethiopia // Ethiopia uses USD for PayPal
  };
  
  return countryMappings[country] || currencies.global;
};

/**
 * Format amount for PayPal (ensuring 2 decimal places)
 */
export const formatPayPalAmount = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Check if PayPal is configured
 */
export const isPayPalConfigured = (): boolean => {
  return Boolean(PAYPAL_CONFIG.clientId);
};

/**
 * Create payment breakdown for PayPal order
 */
export const createPaymentBreakdown = (
  subtotal: number,
  tax = 0,
  shipping = 0,
  discount = 0
) => {
  return {
    item_total: {
      currency_code: 'USD',
      value: formatPayPalAmount(subtotal)
    },
    tax_total: {
      currency_code: 'USD',
      value: formatPayPalAmount(tax)
    },
    shipping: {
      currency_code: 'USD',
      value: formatPayPalAmount(shipping)
    },
    discount: {
      currency_code: 'USD',
      value: formatPayPalAmount(discount)
    }
  };
};

// Declare global PayPal types
declare global {
  interface Window {
    paypal: unknown;
  }
}

export default {
  PAYPAL_CONFIG,
  loadPayPalSDK,
  createPayPalOrder,
  capturePayPalPayment,
  getPayPalAccessToken,
  verifyPayPalPayment,
  getRegionalCurrency,
  formatPayPalAmount,
  isPayPalConfigured,
  createPaymentBreakdown
};
