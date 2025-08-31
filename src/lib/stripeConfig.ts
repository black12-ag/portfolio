/**
 * Stripe Configuration and Integration
 * Enhanced Stripe payment processing for METAH booking platform
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG as ENV_STRIPE_CONFIG } from '@/config/environment';

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: ENV_STRIPE_CONFIG.publishableKey,
  secretKey: ENV_STRIPE_CONFIG.secretKey,
  
  // Stripe environment (test for development, live for production)
  environment: ENV_STRIPE_CONFIG.environment,
  
  // Supported currencies
  supportedCurrencies: {
    global: 'usd',
    ethiopia: 'usd', // Stripe doesn't support ETB directly
    europe: 'eur',
    uk: 'gbp',
    canada: 'cad',
    australia: 'aud',
    japan: 'jpy'
  },

  // Payment intent options
  paymentIntentOptions: {
    automatic_payment_methods: {
      enabled: true,
    },
    capture_method: 'automatic',
    confirmation_method: 'automatic',
  },

  // Stripe Elements appearance
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#667eea',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        boxShadow: 'none',
      },
      '.Input:focus': {
        border: '1px solid #667eea',
        boxShadow: '0 0 0 1px #667eea',
      },
      '.Label': {
        color: '#374151',
        fontSize: '14px',
        fontWeight: '500',
      },
    },
  },
};

// Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
};

// Stripe payment processing functions
export const createPaymentIntent = async (
  amount: number,
  currency: string,
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  try {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        ...STRIPE_CONFIG.paymentIntentOptions,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return {
      clientSecret: data.client_secret,
      paymentIntentId: data.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPayment = async (
  stripe: Stripe,
  clientSecret: string,
  paymentMethodId?: string
): Promise<{ success: boolean; error?: string; paymentIntent?: any }> => {
  try {
    const result = await stripe.confirmPayment({
      clientSecret,
      confirmParams: paymentMethodId ? { payment_method: paymentMethodId } : {},
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      paymentIntent: result.paymentIntent,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment confirmation failed',
    };
  }
};

export const retrievePaymentIntent = async (paymentIntentId: string) => {
  try {
    const response = await fetch(`/api/payments/retrieve/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

// Format amount for Stripe (convert to cents)
export const formatStripeAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

// Format amount for display
export const formatDisplayAmount = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

// Check if Stripe is configured
export const isStripeConfigured = (): boolean => {
  return Boolean(STRIPE_CONFIG.publishableKey && STRIPE_CONFIG.publishableKey !== 'pk_test_51234567890');
};

// Supported payment methods for Stripe
export const STRIPE_PAYMENT_METHODS = [
  'card',
  'klarna',
  'afterpay_clearpay',
  'affirm',
  'us_bank_account',
  'sepa_debit',
  'sofort',
  'giropay',
  'eps',
  'p24',
  'ideal',
  'bancontact',
];

// Currency conversion helper (in a real app, this would call an API)
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  // Mock conversion rates - in production, use a real currency API
  const conversionRates: Record<string, Record<string, number>> = {
    ETB: { USD: 0.018, EUR: 0.017, GBP: 0.014 },
    USD: { ETB: 55.5, EUR: 0.92, GBP: 0.79 },
    EUR: { ETB: 60.3, USD: 1.09, GBP: 0.86 },
    GBP: { ETB: 70.1, USD: 1.27, EUR: 1.16 },
  };

  const fromUpper = fromCurrency.toUpperCase();
  const toUpper = toCurrency.toUpperCase();

  if (fromUpper === toUpper) return amount;

  const rate = conversionRates[fromUpper]?.[toUpper] || 1;
  return amount * rate;
};

export default {
  getStripe,
  createPaymentIntent,
  confirmPayment,
  retrievePaymentIntent,
  formatStripeAmount,
  formatDisplayAmount,
  isStripeConfigured,
  convertCurrency,
  STRIPE_CONFIG,
  STRIPE_PAYMENT_METHODS,
};
