import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Phone, Building, Wallet } from 'lucide-react';
import { PaymentForm as PaymentFormType, PaymentType } from '@/types/payment';
import { paymentService } from '@/lib/paymentService';
import { useToast } from '@/hooks/use-toast';
import { 
  loadPayPalSDK, 
  createPayPalOrder, 
  capturePayPalPayment, 
  isPayPalConfigured,
  formatPayPalAmount 
} from '@/lib/paypalConfig';

interface PaymentFormProps {
  amount: number;
  currency: string;
  bookingId: string;
  userId: string;
  selectedMethod: PaymentType;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({
  amount,
  currency,
  bookingId,
  userId,
  selectedMethod,
  onSuccess,
  onCancel
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalButtonsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PaymentFormType>({
    defaultValues: {
      paymentMethod: selectedMethod,
      amount,
      currency,
      savePaymentMethod: false
    }
  });

  const watchedValues = watch();

  // Initialize PayPal when component mounts and method is PayPal
  useEffect(() => {
    if (selectedMethod === 'paypal' && isPayPalConfigured()) {
      initializePayPal();
    }
  }, [selectedMethod, amount, currency]);

  const initializePayPal = async () => {
    if (!paypalButtonsRef.current) return;

    try {
      const paypal = await loadPayPalSDK();
      
      paypal.Buttons({
        createOrder: (data: unknown, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: currency,
                value: formatPayPalAmount(amount)
              },
              description: `METAH Booking - ${bookingId}`
            }],
            application_context: {
              brand_name: 'METAH Travel Platform',
              landing_page: 'NO_PREFERENCE',
              user_action: 'PAY_NOW'
            }
          });
        },
        onApprove: async (data: unknown, actions: any) => {
          setIsProcessing(true);
          try {
            const orderDetails = await actions.order.capture();
            
            // Create transaction record
            const transaction = await paymentService.processPayment({
              paymentMethod: 'paypal',
              amount,
              currency,
              paypalOrderId: orderDetails.id,
              paypalPayerId: orderDetails.payer.payer_id,
              savePaymentMethod: false
            }, bookingId, userId);

            toast({
              title: "Payment Successful!",
              description: "Your PayPal payment has been processed successfully.",
            });

            onSuccess(transaction.id);
          } catch (error) {
            console.error('PayPal payment processing error:', error);
            toast({
              title: "Payment Failed",
              description: "Failed to process PayPal payment. Please try again.",
              variant: "destructive"
            });
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err: Error | unknown) => {
          console.error('PayPal payment error:', err);
          toast({
            title: "Payment Error",
            description: "An error occurred with PayPal payment. Please try again.",
            variant: "destructive"
          });
          setIsProcessing(false);
        },
        onCancel: () => {
          toast({
            title: "Payment Cancelled",
            description: "PayPal payment was cancelled.",
          });
          setIsProcessing(false);
        }
      }).render(paypalButtonsRef.current);

      setPaypalLoaded(true);
    } catch (error) {
      console.error('Failed to load PayPal SDK:', error);
      setError('Failed to load PayPal. Please try another payment method.');
    }
  };

  const onSubmit = async (data: PaymentFormType) => {
    setIsProcessing(true);
    setError(null);

    try {
      const transaction = await paymentService.processPayment(data, bookingId, userId);
      
      toast({
        title: "Payment Submitted",
        description: transaction.status === 'completed' 
          ? "Your payment has been processed successfully!"
          : "Your payment is being processed. You will be notified once verified.",
      });

      onSuccess(transaction.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentFields = () => {
    switch (selectedMethod) {
      case 'credit_card':
      case 'debit_card':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  {...register('cardNumber', { 
                    required: 'Card number is required',
                    pattern: {
                      value: /^[0-9\s]{13,19}$/,
                      message: 'Invalid card number'
                    }
                  })}
                />
                {errors.cardNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.cardNumber.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Select onValueChange={(value) => setValue('expiryMonth', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Select onValueChange={(value) => setValue('expiryYear', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={4}
                    {...register('cvv', { 
                      required: 'CVV is required',
                      pattern: {
                        value: /^[0-9]{3,4}$/,
                        message: 'Invalid CVV'
                      }
                    })}
                  />
                  {errors.cvv && (
                    <p className="text-sm text-destructive mt-1">{errors.cvv.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cardHolderName">Cardholder Name</Label>
                  <Input
                    id="cardHolderName"
                    placeholder="John Doe"
                    {...register('cardHolderName', { required: 'Cardholder name is required' })}
                  />
                  {errors.cardHolderName && (
                    <p className="text-sm text-destructive mt-1">{errors.cardHolderName.message}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case 'telebirr':
      case 'cbebe':
      case 'mpesa':
      case 'airtel_money':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+251 9 12 34 56 78"
                  {...register('phoneNumber', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[0-9\s\-()]{10,15}$/,
                      message: 'Invalid phone number'
                    }
                  })}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>
              
              {selectedMethod === 'mpesa' && (
                <div>
                  <Label htmlFor="operator">Mobile Operator</Label>
                  <Select onValueChange={(value) => setValue('operator', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safaricom">Safaricom</SelectItem>
                      <SelectItem value="airtel">Airtel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </>
        );

      case 'bank_transfer':
        const methods = paymentService.getAvailablePaymentMethods();
        const bankMethod = methods.find(m => m.type === 'bank_transfer');
        const bankConfig = bankMethod?.config.bankConfig;
        
        return (
          <>
            <div className="space-y-4">
              <Alert>
                <Building className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Bank:</strong> {bankConfig?.bankName}</p>
                    <p><strong>Account Name:</strong> {bankConfig?.accountName}</p>
                    <p><strong>Account Number:</strong> {bankConfig?.accountNumber}</p>
                    <p><strong>Routing Number:</strong> {bankConfig?.routingNumber}</p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="accountHolderName">Your Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  placeholder="Full name as it appears on your account"
                  {...register('accountHolderName', { required: 'Account holder name is required' })}
                />
                {errors.accountHolderName && (
                  <p className="text-sm text-destructive mt-1">{errors.accountHolderName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="bankAccount">Your Account Number</Label>
                <Input
                  id="bankAccount"
                  placeholder="Your bank account number"
                  {...register('bankAccount', { required: 'Bank account number is required' })}
                />
                {errors.bankAccount && (
                  <p className="text-sm text-destructive mt-1">{errors.bankAccount.message}</p>
                )}
              </div>
            </div>
          </>
        );

      case 'paypal':
        return (
          <div className="space-y-4">
            {!isPayPalConfigured() ? (
              <Alert>
                <AlertDescription>
                  PayPal is currently not available. Please choose another payment method.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-center p-4 border border-dashed border-blue-300 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.05 4.46-.45 3.58-2.570 5.97-6.29 7.09-.62.18-1.29.29-2.010.29H9.11c-.44 0-.81.32-.9.75l-.44 2.8-.07.43c-.02.12-.06.22-.12.30-.14.17-.36.26-.59.26z"/>
                      <path d="M23.048 7.204c-.928 4.227-2.368 6.857-5.84 8.66-2.728 1.415-6.174 1.4-8.26 1.4l-.72.001c-.44 0-.81.32-.9.75l-.59 3.72-.065.42c-.02.12-.06.22-.12.3-.14.17-.36.26-.59.26H2.47a.641.641 0 0 1-.633-.74l.529-3.36.001-.01h4.21c.44 0 .81-.32.9-.75l.44-2.8.07-.43c.09-.43.46-.75.9-.75h2.789c3.71 0 6.61-1.51 7.061-5.09.06-.48.03-.96-.15-1.42-.41-1.03-1.29-1.82-2.48-2.32z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-blue-900 mb-1">Pay with PayPal</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Secure payment with your PayPal account or credit card
                  </p>
                  <div className="text-lg font-bold text-blue-900">
                    {currency} {formatPayPalAmount(amount)}
                  </div>
                </div>

                <div 
                  ref={paypalButtonsRef} 
                  className="min-h-[45px] flex items-center justify-center"
                >
                  {!paypalLoaded && !isProcessing && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading PayPal...</span>
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-yellow-800">Processing your PayPal payment...</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>• Secure encryption and fraud protection</p>
                  <p>• No PayPal account required - use any credit card</p>
                  <p>• Instant payment confirmation</p>
                </div>
              </>
            )}
          </div>
        );

      case 'cash':
        return (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              You have selected cash payment. Please bring the exact amount to the hotel reception upon check-in. 
              Our staff will provide you with a receipt.
            </AlertDescription>
          </Alert>
        );

      default:
        return (
          <Alert>
            <AlertDescription>
              Payment method configuration is in progress. Please contact support for assistance.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const getPaymentIcon = () => {
    switch (selectedMethod) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'telebirr':
      case 'cbebe':
      case 'mpesa':
      case 'airtel_money':
        return <Phone className="h-5 w-5" />;
      case 'bank_transfer':
        return <Building className="h-5 w-5" />;
      case 'paypal':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.05 4.46-.45 3.58-2.570 5.97-6.29 7.09-.62.18-1.29.29-2.010.29H9.11c-.44 0-.81.32-.9.75l-.44 2.8-.07.43c-.02.12-.06.22-.12.30-.14.17-.36.26-.59.26z"/>
            <path d="M23.048 7.204c-.928 4.227-2.368 6.857-5.84 8.66-2.728 1.415-6.174 1.4-8.26 1.4l-.72.001c-.44 0-.81.32-.9.75l-.59 3.72-.065.42c-.02.12-.06.22-.12.3-.14.17-.36.26-.59.26H2.47a.641.641 0 0 1-.633-.74l.529-3.36.001-.01h4.21c.44 0 .81-.32.9-.75l.44-2.8.07-.43c.09-.43.46-.75.9-.75h2.789c3.71 0 6.61-1.51 7.061-5.09.06-.48.03-.96-.15-1.42-.41-1.03-1.29-1.82-2.48-2.32z"/>
          </svg>
        );
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getPaymentIcon()}
          <span>Payment Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Payment Amount Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Amount:</span>
              <span className="text-lg font-bold">{amount.toLocaleString()} {currency}</span>
            </div>
          </div>

          {/* Payment Method Fields */}
          {renderPaymentFields()}

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes"
              {...register('notes')}
            />
          </div>

          {/* Save Payment Method */}
          {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="savePaymentMethod"
                checked={watchedValues.savePaymentMethod}
                onCheckedChange={(checked) => setValue('savePaymentMethod', checked as boolean)}
              />
              <Label htmlFor="savePaymentMethod" className="text-sm">
                Save this payment method for future use
              </Label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${amount.toLocaleString()} ${currency}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
