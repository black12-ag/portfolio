import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Apple,
  Smartphone,
  Building,
  User,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';
import { 
  Elements, 
  CardElement, 
  PaymentElement,
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { stripeIntegrationService, PaymentResult, PaymentMethod } from '@/services/payment/stripeIntegrationService';

export interface BookingData {
  hotelId: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  totalAmount: number;
  currency: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface RealPaymentProcessorProps {
  amount: number;
  currency: string;
  bookingData: BookingData;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

// Stripe configuration
const stripeConfig = {
  publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
  apiVersion: '2023-10-16' as const,
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
};

// Initialize Stripe
const stripePromise = loadStripe(stripeConfig.publishableKey);

// Payment form component
const PaymentForm: React.FC<{
  amount: number;
  currency: string;
  bookingData: BookingData;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
  clientSecret: string;
}> = ({ amount, currency, bookingData, onSuccess, onError, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { theme } = useTheme();
  const { formatPrice } = useCurrency();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'bank'>('card');
  const [billingDetails, setBillingDetails] = useState({
    name: `${bookingData.guestInfo.firstName} ${bookingData.guestInfo.lastName}`,
    email: bookingData.guestInfo.email,
    phone: bookingData.guestInfo.phone,
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  });
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);

  // Check Apple Pay availability
  useEffect(() => {
    const checkApplePay = async () => {
      const available = await stripeIntegrationService.isApplePayAvailable();
      setIsApplePayAvailable(available);
    };
    checkApplePay();
  }, []);

  // Handle payment submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      onError('Payment system not ready');
      return;
    }

    setIsProcessing(true);

    try {
      let result: PaymentResult;

      if (paymentMethod === 'card') {
        // Get the CardElement or PaymentElement
        const cardElement = elements.getElement(CardElement);
        const paymentElement = elements.getElement(PaymentElement);

        if (paymentElement) {
          // Use PaymentElement (newer approach)
          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/booking-confirmation`,
              payment_method_data: {
                billing_details: billingDetails,
              },
            },
            redirect: 'if_required',
          });

          if (error) {
            result = { success: false, error: error.message };
          } else {
            result = { success: true };
          }
        } else if (cardElement) {
          // Use CardElement (classic approach)
          result = await stripeIntegrationService.confirmPayment(
            clientSecret,
            undefined,
            billingDetails
          );
        } else {
          throw new Error('No payment element found');
        }
      } else {
        // Handle other payment methods (Apple Pay, Google Pay, etc.)
        result = await handleAlternativePayment();
      }

      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.error || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle alternative payment methods
  const handleAlternativePayment = async (): Promise<PaymentResult> => {
    if (!stripe) {
      return { success: false, error: 'Stripe not initialized' };
    }

    try {
      if (paymentMethod === 'apple_pay') {
        const paymentRequest = await stripeIntegrationService.createPaymentRequest({
          country: 'US',
          currency: currency.toLowerCase(),
          total: {
            label: `${bookingData.hotelName} - ${bookingData.roomType}`,
            amount: amount,
          },
          displayItems: [
            {
              label: `${bookingData.hotelName}`,
              amount: amount * 0.9, // Room cost
            },
            {
              label: 'Taxes & Fees',
              amount: amount * 0.1, // Taxes
            },
          ],
        });

        if (!paymentRequest) {
          return { success: false, error: 'Apple Pay not available' };
        }

        return new Promise((resolve) => {
          paymentRequest.on('paymentmethod', async (event) => {
            const { error } = await stripe.confirmPayment({
              clientSecret,
              confirmParams: {
                payment_method: event.paymentMethod.id,
              },
              redirect: 'if_required',
            });

            if (error) {
              event.complete('fail');
              resolve({ success: false, error: error.message });
            } else {
              event.complete('success');
              resolve({ success: true });
            }
          });

          paymentRequest.show();
        });
      }

      return { success: false, error: 'Payment method not supported' };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Alternative payment failed' 
      };
    }
  };

  // Handle billing details change
  const handleBillingChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBillingDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value,
        },
      }));
    } else {
      setBillingDetails(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Payment Method
        </h3>
        
        <Tabs value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Card
            </TabsTrigger>
            {isApplePayAvailable && (
              <TabsTrigger value="apple_pay" className="flex items-center gap-2">
                <Apple className="w-4 h-4" />
                Apple Pay
              </TabsTrigger>
            )}
            <TabsTrigger value="google_pay" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Google Pay
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Bank
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4">
            {/* Card Payment Element */}
            <div className={`p-4 border rounded-lg ${
              theme === 'dark' ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-white'
            }`}>
              <PaymentElement 
                options={{
                  layout: 'tabs',
                  defaultValues: {
                    billingDetails: billingDetails,
                  },
                }}
              />
            </div>

            {/* Save Payment Method */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="save-payment"
                checked={savePaymentMethod}
                onChange={(e) => setSavePaymentMethod(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="save-payment" className="text-sm">
                Save this payment method for future bookings
              </label>
            </div>
          </TabsContent>

          <TabsContent value="apple_pay">
            <div className={`p-8 text-center border-2 border-dashed rounded-lg ${
              theme === 'dark' ? 'border-slate-600' : 'border-gray-300'
            }`}>
              <Apple className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Apple Pay will be available at checkout
              </p>
            </div>
          </TabsContent>

          <TabsContent value="google_pay">
            <div className={`p-8 text-center border-2 border-dashed rounded-lg ${
              theme === 'dark' ? 'border-slate-600' : 'border-gray-300'
            }`}>
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Google Pay will be available at checkout
              </p>
            </div>
          </TabsContent>

          <TabsContent value="bank">
            <div className={`p-8 text-center border-2 border-dashed rounded-lg ${
              theme === 'dark' ? 'border-slate-600' : 'border-gray-300'
            }`}>
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Bank transfer option coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Billing Information */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Billing Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name on Card</label>
              <Input
                value={billingDetails.name}
                onChange={(e) => handleBillingChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={billingDetails.email}
                onChange={(e) => handleBillingChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address Line 1</label>
              <Input
                value={billingDetails.address.line1}
                onChange={(e) => handleBillingChange('address.line1', e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address Line 2</label>
              <Input
                value={billingDetails.address.line2}
                onChange={(e) => handleBillingChange('address.line2', e.target.value)}
                placeholder="Apt 4B (optional)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input
                value={billingDetails.address.city}
                onChange={(e) => handleBillingChange('address.city', e.target.value)}
                placeholder="New York"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Postal Code</label>
              <Input
                value={billingDetails.address.postal_code}
                onChange={(e) => handleBillingChange('address.postal_code', e.target.value)}
                placeholder="10001"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-gray-50'
      }`}>
        <h4 className="font-semibold mb-3">Payment Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Room Cost</span>
            <span>{formatPrice(amount * 0.9)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & Fees</span>
            <span>{formatPrice(amount * 0.1)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(amount)}</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50'
      }`}>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Secure Payment
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your payment information is encrypted and processed securely by Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-lg"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay {formatPrice(amount)}
          </>
        )}
      </Button>
    </form>
  );
};

// Main component
export const RealPaymentProcessor: React.FC<RealPaymentProcessorProps> = ({
  amount,
  currency,
  bookingData,
  onSuccess,
  onError,
  onCancel,
  className = '',
}) => {
  const { theme } = useTheme();
  const { formatPrice } = useCurrency();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stripe Elements options
  const elementsOptions: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: clientSecret || undefined,
      appearance: {
        theme: theme === 'dark' ? 'night' : 'stripe',
        variables: {
          colorPrimary: '#0570de',
          colorBackground: theme === 'dark' ? '#1e293b' : '#ffffff',
          colorText: theme === 'dark' ? '#f1f5f9' : '#30313d',
          colorDanger: '#df1b41',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px',
        },
      },
    }),
    [clientSecret, theme]
  );

  // Initialize payment intent
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Stripe
        await stripeIntegrationService.initialize(stripeConfig);

        // Create payment intent
        const paymentIntent = await stripeIntegrationService.createPaymentIntent(
          amount,
          currency,
          {
            booking_id: `booking_${Date.now()}`,
            hotel_id: bookingData.hotelId,
            hotel_name: bookingData.hotelName,
            guest_email: bookingData.guestInfo.email,
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
          }
        );

        setClientSecret(paymentIntent.clientSecret);

      } catch (error) {
        console.error('Payment initialization error:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [amount, currency, bookingData]);

  if (isLoading) {
    return (
      <Card className={`${className} ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Preparing Payment</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Setting up secure payment processing...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
        <CardContent className="p-8">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full mt-4">
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className={`${className} ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Payment Setup Failed</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to initialize payment processing. Please try again.
            </p>
            {onCancel && (
              <Button onClick={onCancel} variant="outline" className="mt-4">
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Secure Payment
        </CardTitle>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Complete your booking for {bookingData.hotelName}
        </div>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={elementsOptions}>
          <PaymentForm
            amount={amount}
            currency={currency}
            bookingData={bookingData}
            onSuccess={onSuccess}
            onError={onError}
            clientSecret={clientSecret}
          />
        </Elements>
      </CardContent>
    </Card>
  );
};

export default RealPaymentProcessor;
