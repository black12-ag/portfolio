import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStripe, STRIPE_CONFIG, formatDisplayAmount } from '@/lib/stripeConfig';
import { paymentService } from '@/lib/paymentService';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  bookingId: string;
  userId: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
  clientSecret?: string;
}

// Internal payment form component
const StripePaymentFormInner: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  bookingId,
  userId,
  onSuccess,
  onCancel,
  clientSecret
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'succeeded' | 'failed'>('initial');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait and try again.');
      return;
    }

    if (!clientSecret) {
      setError('Payment setup incomplete. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      // Confirm the payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setPaymentStatus('failed');
        toast({
          title: "Payment Failed",
          description: confirmError.message || 'An error occurred during payment',
          variant: "destructive"
        });
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create transaction record in our system
        const transaction = await paymentService.processPayment({
          paymentMethod: 'credit_card',
          amount,
          currency,
          stripePaymentIntentId: paymentIntent.id,
          stripePaymentMethodId: paymentIntent.payment_method as string,
          savePaymentMethod: false
        }, bookingId, userId);

        setPaymentStatus('succeeded');
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });

        onSuccess(transaction.id);
      } else {
        setError('Payment was not completed. Please try again.');
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      setPaymentStatus('failed');
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
    paymentMethodOrder: ['card', 'klarna', 'afterpay_clearpay'],
    fields: {
      billingDetails: {
        name: 'auto',
        email: 'auto',
        phone: 'auto',
        address: {
          country: 'auto',
          city: 'auto',
          postalCode: 'auto',
          state: 'auto',
          line1: 'auto',
          line2: 'auto',
        },
      },
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Secure Payment</span>
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>256-bit SSL encryption</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Payment Amount Summary */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Amount:</span>
            <span className="text-lg font-bold">
              {formatDisplayAmount(amount, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">Booking ID:</span>
            <span className="text-xs font-mono">{bookingId}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stripe Payment Element */}
          <div className="space-y-4">
            <PaymentElement 
              options={paymentElementOptions}
              className="stripe-payment-element"
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Status */}
          {paymentStatus === 'processing' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Processing your payment...</AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'succeeded' && (
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment successful! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>Your payment information is secure and encrypted</span>
            </div>
            <div>• PCI DSS Level 1 compliant</div>
            <div>• No card details stored on our servers</div>
            <div>• Powered by Stripe</div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || !elements || isProcessing || paymentStatus === 'succeeded'}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatDisplayAmount(amount, currency)}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Main component with Stripe Elements provider
const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    setStripePromise(getStripe());
  }, []);

  if (!stripePromise) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading secure payment form...</p>
        </CardContent>
      </Card>
    );
  }

  const elementsOptions = {
    clientSecret: props.clientSecret,
    appearance: STRIPE_CONFIG.appearance,
    loader: 'auto' as const,
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <StripePaymentFormInner {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
