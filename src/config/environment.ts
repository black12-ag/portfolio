/**
 * Environment Configuration
 * Centralized environment variable management with defaults
 */

// App Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'METAH Travel',
  version: import.meta.env.VITE_APP_VERSION || '1.1.2',
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
};

// Stripe Configuration with safe defaults
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef_placeholder',
  secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
  environment: import.meta.env.VITE_STRIPE_ENVIRONMENT || 'test',
};

// API Configuration with safe defaults
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_BASE_URL || '/api',
  liteApiUrl: import.meta.env.VITE_LITEAPI_URL || 'https://api.liteapi.travel/v3.0',
  liteApiKey: import.meta.env.VITE_LITEAPI_KEY || 'demo_key',
  liteApiPrivateKey: import.meta.env.VITE_LITEAPI_PRIVATE_KEY || '',
  // Vercel serverless function URLs
  liteApiProxy: '/api/liteapi',
  healthCheck: '/api/health',
  webhook: '/api/webhook'
};

// Supabase Configuration with safe defaults
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key',
};

// Feature Flags with safe defaults
export const FEATURE_FLAGS = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableAiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false', // Default true
  enableArTours: import.meta.env.VITE_ENABLE_AR_TOURS !== 'false', // Default true
  enableIotControl: import.meta.env.VITE_ENABLE_IOT_CONTROL !== 'false', // Default true
  enableConcierge: import.meta.env.VITE_ENABLE_CONCIERGE !== 'false', // Default true
  enableServiceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER !== 'false',
  enablePwa: import.meta.env.VITE_PWA_DEV === 'true',
};

// Social Media Configuration
export const SOCIAL_CONFIG = {
  facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};

// Development Configuration
export const DEV_CONFIG = {
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  mockApi: import.meta.env.VITE_MOCK_API === 'true',
  debugLiteApi: import.meta.env.DEBUG_LITEAPI === '1',
};

// Mobile/Capacitor Configuration
export const MOBILE_CONFIG = {
  isMobileBuild: import.meta.env.VITE_MOBILE_BUILD === 'true',
  isCapacitor: typeof window !== 'undefined' && !!(window as any).Capacitor,
};

// Environment Validation
export const isDevelopment = () => APP_CONFIG.environment === 'development';
export const isProduction = () => APP_CONFIG.environment === 'production';
export const isMobile = () => MOBILE_CONFIG.isMobileBuild || MOBILE_CONFIG.isCapacitor;

// Stripe validation
export const isStripeConfigured = () => {
  return STRIPE_CONFIG.publishableKey && 
         !STRIPE_CONFIG.publishableKey.includes('placeholder') &&
         STRIPE_CONFIG.publishableKey.startsWith('pk_');
};

// API validation
export const isLiteApiConfigured = () => {
  return API_CONFIG.liteApiKey && API_CONFIG.liteApiKey !== 'demo_key';
};

// Supabase validation  
export const isSupabaseConfigured = () => {
  return SUPABASE_CONFIG.url && 
         !SUPABASE_CONFIG.url.includes('placeholder') &&
         SUPABASE_CONFIG.anonKey && 
         !SUPABASE_CONFIG.anonKey.includes('placeholder');
};

// Export all configurations
export const ENV = {
  APP: APP_CONFIG,
  STRIPE: STRIPE_CONFIG,
  API: API_CONFIG,
  SUPABASE: SUPABASE_CONFIG,
  FEATURES: FEATURE_FLAGS,
  SOCIAL: SOCIAL_CONFIG,
  DEV: DEV_CONFIG,
  MOBILE: MOBILE_CONFIG,
};

// Helper functions for auth URLs
export const getAuthRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'https://app.metahtravel.com/auth/callback';
};

export const getResetPasswordUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/reset-password`;
  }
  return 'https://app.metahtravel.com/reset-password';
};

// Logging utility
export const log = {
  info: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.debugMode) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.debugMode) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.debugMode) {
      console.error(`❌ ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.debugMode) {
      console.debug(`🐛 ${message}`, ...args);
    }
  },
};

// Debug logging in development
if (isDevelopment() && DEV_CONFIG.debugMode) {
  log.info('Environment Configuration loaded:', {
    app: APP_CONFIG,
    features: FEATURE_FLAGS,
    mobile: MOBILE_CONFIG,
    stripeConfigured: isStripeConfigured(),
    liteApiConfigured: isLiteApiConfigured(),
    supabaseConfigured: isSupabaseConfigured(),
  });
}

export default ENV;