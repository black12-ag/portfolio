import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Lock, 
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react';
import { PaymentType, PaymentMethod, PaymentTransaction } from '@/types/payment';
import { paymentService } from '@/lib/paymentService';
import PaymentMethodCard from './PaymentMethodCard';
import PaymentForm from './PaymentForm';
import PaymentVerification from './PaymentVerification';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CompletePaymentFlowProps {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  breakdown?: {
    roomCost: number;
    taxes: number;
    fees: number;
    discounts: number;
  };
  onComplete: (transactionId: string) => void;
  onCancel: () => void;
}

type FlowStep = 'methods' | 'form' | 'processing' | 'verification' | 'complete';

export default function CompletePaymentFlow({
  bookingId,
  userId,
  amount,
  currency,
  breakdown,
  onComplete,
  onCancel
}: CompletePaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('methods');
  const [selectedMethod, setSelectedMethod] = useState<PaymentType | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const methods = paymentService.getEnabledPaymentMethods();
    setAvailableMethods(methods);
    
    // Auto-select default method if available
    const defaultMethod = methods.find(m => m.isDefault);
    if (defaultMethod && methods.length === 1) {
      setSelectedMethod(defaultMethod.type);
    }
  }, []);

  const handleMethodSelect = (method: PaymentType) => {
    setSelectedMethod(method);
    setCurrentStep('form');
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    setIsLoading(true);
    try {
      const tx = paymentService.getTransactionById(transactionId);
      if (tx) {
        setTransaction(tx);
        
        if (tx.status === 'completed' || tx.status === 'verified') {
          setCurrentStep('complete');
          setTimeout(() => onComplete(transactionId), 2000);
        } else if (tx.status === 'requires_verification') {
          setCurrentStep('verification');
        } else {
          setCurrentStep('processing');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMethods = () => {
    setCurrentStep('methods');
    setSelectedMethod(null);
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'methods': return 25;
      case 'form': return 50;
      case 'processing': return 75;
      case 'verification': return 85;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'methods': return 'Choose Payment Method';
      case 'form': return 'Payment Details';
      case 'processing': return 'Processing Payment';
      case 'verification': return 'Payment Verification';
      case 'complete': return 'Payment Complete';
      default: return 'Payment';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span>{getStepTitle()}</span>
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
          </div>
          <Progress value={getStepProgress()} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {breakdown ? (
              <>
                <div className="flex justify-between">
                  <span>Room Cost</span>
                  <span>{breakdown.roomCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>{breakdown.taxes.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fees</span>
                  <span>{breakdown.fees.toLocaleString()} {currency}</span>
                </div>
                {breakdown.discounts > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{breakdown.discounts.toLocaleString()} {currency}</span>
                  </div>
                )}
                <Separator />
              </>
            ) : null}
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>{amount.toLocaleString()} {currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'methods' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {availableMethods.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No payment methods are currently available. Please contact support.
                  </AlertDescription>
                </Alert>
              ) : (
                availableMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    selected={selectedMethod === method.type}
                    onSelect={() => handleMethodSelect(method.type)}
                    disabled={!method.enabled || (method.config.maxAmount && amount > method.config.maxAmount)}
                  />
                ))
              )}
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                disabled={!selectedMethod}
                onClick={() => selectedMethod && setCurrentStep('form')}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'form' && selectedMethod && (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={handleBackToMethods}
            className="self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payment Methods
          </Button>
          
          <PaymentForm
            amount={amount}
            currency={currency}
            bookingId={bookingId}
            userId={userId}
            selectedMethod={selectedMethod}
            onSuccess={handlePaymentSuccess}
            onCancel={handleBackToMethods}
          />
        </div>
      )}

      {currentStep === 'processing' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Processing Your Payment</h3>
            <p className="text-muted-foreground">
              Please wait while we process your payment securely...
            </p>
          </CardContent>
        </Card>
      )}

      {currentStep === 'verification' && transaction && (
        <div className="space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your payment has been submitted and is being verified. You will receive a confirmation once the verification is complete.
            </AlertDescription>
          </Alert>
          
          <PaymentVerification
            transaction={transaction}
            onUpdate={() => {
              const updatedTx = paymentService.getTransactionById(transaction.id);
              if (updatedTx) {
                setTransaction(updatedTx);
                if (updatedTx.status === 'verified' || updatedTx.status === 'completed') {
                  setCurrentStep('complete');
                  setTimeout(() => onComplete(updatedTx.id), 2000);
                }
              }
            }}
          />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Continue to Booking
            </Button>
            <Button onClick={() => onComplete(transaction.id)}>
              I'll Wait for Verification
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'complete' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-4">
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>
            {transaction && (
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm">
                  <strong>Transaction ID:</strong> {transaction.id}
                </p>
                <p className="text-sm">
                  <strong>Amount:</strong> {transaction.amount.toLocaleString()} {transaction.currency}
                </p>
              </div>
            )}
            <Button onClick={() => transaction && onComplete(transaction.id)}>
              Continue to Booking Confirmation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center space-x-1">
          <Shield className="h-4 w-4" />
          <span>Your payment information is encrypted and secure</span>
        </div>
      </div>
    </div>
  );
}
