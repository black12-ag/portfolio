import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Phone, 
  Building, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Info,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { PaymentForm as PaymentFormType, PaymentType } from '@/types/payment';
import { paymentService } from '@/lib/paymentService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EthiopianPaymentFormProps {
  amount: number;
  currency: string;
  bookingId: string;
  userId: string;
  selectedMethod: 'telebirr' | 'cbebe';
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

interface TeleBirrStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

const EthiopianPaymentForm: React.FC<EthiopianPaymentFormProps> = ({
  amount,
  currency,
  bookingId,
  userId,
  selectedMethod,
  onSuccess,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'verification' | 'success'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PaymentFormType>({
    defaultValues: {
      paymentMethod: selectedMethod,
      amount,
      currency,
      phoneNumber: '',
      operator: selectedMethod === 'telebirr' ? 'ethio_telecom' : 'cbe'
    }
  });

  const watchedValues = watch();

  const getTeleBirrSteps = (): TeleBirrStep[] => [
    {
      id: 'phone',
      title: 'Enter Phone Number',
      description: 'Provide your TeleBirr registered phone number',
      completed: paymentStep !== 'form',
      active: paymentStep === 'form',
    },
    {
      id: 'ussd',
      title: 'USSD Prompt',
      description: 'Approve the payment request on your phone',
      completed: paymentStep === 'success',
      active: paymentStep === 'processing' || paymentStep === 'verification',
    },
    {
      id: 'complete',
      title: 'Payment Complete',
      description: 'Your payment has been processed successfully',
      completed: paymentStep === 'success',
      active: paymentStep === 'success',
    },
  ];

  const getCBESteps = (): TeleBirrStep[] => [
    {
      id: 'account',
      title: 'Account Details',
      description: 'Enter your CBE Birr account information',
      completed: paymentStep !== 'form',
      active: paymentStep === 'form',
    },
    {
      id: 'verification',
      title: 'Bank Verification',
      description: 'Verify the transaction with your bank',
      completed: paymentStep === 'success',
      active: paymentStep === 'processing' || paymentStep === 'verification',
    },
    {
      id: 'complete',
      title: 'Payment Complete',
      description: 'Your payment has been processed successfully',
      completed: paymentStep === 'success',
      active: paymentStep === 'success',
    },
  ];

  const formatPhoneNumber = (value: string): string => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Ethiopian phone number
    if (digits.startsWith('251')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+251${digits.slice(1)}`;
    } else if (digits.length === 9) {
      return `+251${digits}`;
    }
    
    return value;
  };

  const onSubmit = async (data: PaymentFormType) => {
    setIsProcessing(true);
    setError(null);
    setPaymentStep('processing');

    try {
      // Format phone number for TeleBirr
      if (selectedMethod === 'telebirr' && data.phoneNumber) {
        data.phoneNumber = formatPhoneNumber(data.phoneNumber);
      }

      const transaction = await paymentService.processPayment(data, bookingId, userId);
      setTransactionRef(transaction.id);

      if (selectedMethod === 'telebirr') {
        // Simulate USSD prompt
        setTimeout(() => {
          setPaymentStep('verification');
          toast({
            title: "USSD Prompt Sent",
            description: "Please check your phone and approve the payment request.",
          });
        }, 2000);

        // Simulate payment completion
        setTimeout(() => {
          setPaymentStep('success');
          toast({
            title: "Payment Successful!",
            description: "Your TeleBirr payment has been processed successfully.",
          });
          onSuccess(transaction.id);
        }, 8000);
      } else {
        // CBE Birr processing
        setTimeout(() => {
          setPaymentStep('verification');
          toast({
            title: "Bank Verification",
            description: "Please verify the transaction with your bank.",
          });
        }, 3000);

        setTimeout(() => {
          setPaymentStep('success');
          toast({
            title: "Payment Successful!",
            description: "Your CBE Birr payment has been processed successfully.",
          });
          onSuccess(transaction.id);
        }, 10000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      setPaymentStep('form');
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTeleBirrForm = () => (
    <>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">TeleBirr Payment</h4>
              <p className="text-sm text-blue-700 mt-1">
                You'll receive a USSD prompt on your phone to authorize this payment.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="phoneNumber">TeleBirr Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="+251 9 12 34 56 78"
            {...register('phoneNumber', { 
              required: 'Phone number is required',
              pattern: {
                value: /^(\+251|0)?[9][0-9]{8}$/,
                message: 'Invalid Ethiopian phone number'
              }
            })}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setValue('phoneNumber', formatted);
            }}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Enter your TeleBirr registered phone number
          </p>
        </div>

        <div>
          <Label>Network Operator</Label>
          <Select onValueChange={(value) => setValue('operator', value)} defaultValue="ethio_telecom">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethio_telecom">Ethio Telecom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>How it works:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Pay with TeleBirr" below</li>
              <li>You'll receive a USSD prompt on your phone</li>
              <li>Enter your TeleBirr PIN to authorize</li>
              <li>Payment confirmation will be instant</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </>
  );

  const renderCBEForm = () => (
    <>
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <Building className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">CBE Birr Payment</h4>
              <p className="text-sm text-green-700 mt-1">
                Secure payment through Commercial Bank of Ethiopia's digital wallet.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="phoneNumber">CBE Birr Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="+251 9 12 34 56 78"
            {...register('phoneNumber', { 
              required: 'Phone number is required',
              pattern: {
                value: /^(\+251|0)?[9][0-9]{8}$/,
                message: 'Invalid Ethiopian phone number'
              }
            })}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setValue('phoneNumber', formatted);
            }}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="accountNumber">CBE Account Number (Optional)</Label>
          <Input
            id="accountNumber"
            placeholder="1234567890"
            {...register('bankAccount')}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Link to your CBE account for faster processing
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Processing time:</strong> CBE Birr payments typically take 5-10 minutes to process.
            You'll receive an SMS confirmation once completed.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );

  const renderProcessingStep = () => {
    const steps = selectedMethod === 'telebirr' ? getTeleBirrSteps() : getCBESteps();
    
    return (
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                step.completed ? 'bg-green-100 text-green-600' :
                step.active ? 'bg-blue-100 text-blue-600' :
                'bg-muted text-muted-foreground'
              )}>
                {step.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  "font-medium",
                  step.active ? 'text-blue-900' : 'text-muted-foreground'
                )}>
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        {paymentStep === 'processing' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              {selectedMethod === 'telebirr' 
                ? 'Sending USSD prompt to your phone...' 
                : 'Connecting to CBE Birr system...'
              }
            </AlertDescription>
          </Alert>
        )}

        {paymentStep === 'verification' && selectedMethod === 'telebirr' && (
          <Alert className="border-blue-200 bg-blue-50">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-blue-900">Check your phone now!</p>
                <p className="text-blue-800">
                  A USSD prompt has been sent to <strong>{watchedValues.phoneNumber}</strong>.
                  Enter your TeleBirr PIN to complete the payment.
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">Waiting for authorization...</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {paymentStep === 'verification' && selectedMethod === 'cbebe' && (
          <Alert className="border-green-200 bg-green-50">
            <Building className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-green-900">Bank Verification in Progress</p>
                <p className="text-green-800">
                  Your payment is being verified with CBE. This may take up to 10 minutes.
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  <span className="text-sm text-green-700">Processing with bank...</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {transactionRef && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Transaction Reference</p>
            <p className="font-mono text-sm font-medium">{transactionRef}</p>
          </div>
        )}
      </div>
    );
  };

  const getMethodIcon = () => {
    return selectedMethod === 'telebirr' ? (
      <Phone className="h-5 w-5" />
    ) : (
      <Building className="h-5 w-5" />
    );
  };

  const getMethodName = () => {
    return selectedMethod === 'telebirr' ? 'TeleBirr' : 'CBE Birr';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getMethodIcon()}
          <span>{getMethodName()} Payment</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Bank Grade Security
          </Badge>
          <Badge variant="outline">
            Ethiopian Payment System
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {paymentStep === 'form' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Amount Summary */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <span className="text-lg font-bold">{amount.toLocaleString()} {currency}</span>
              </div>
            </div>

            {/* Payment Method Form */}
            {selectedMethod === 'telebirr' ? renderTeleBirrForm() : renderCBEForm()}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
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
                  `Pay with ${getMethodName()}`
                )}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {renderProcessingStep()}
            
            {paymentStep !== 'success' && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={paymentStep === 'verification'}
                >
                  Cancel Payment
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EthiopianPaymentForm;
