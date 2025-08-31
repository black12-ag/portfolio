import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PaymentMethod } from '@/types/payment';
import { cn } from '@/lib/utils';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export default function PaymentMethodCard({ 
  method, 
  selected, 
  onSelect, 
  disabled = false 
}: PaymentMethodCardProps) {
  const getMethodDetails = () => {
    switch (method.type) {
      case 'credit_card':
      case 'debit_card':
        return {
          description: 'Visa, Mastercard, American Express',
          processingTime: 'Instant',
          fees: 'No fees'
        };
      case 'telebirr':
        return {
          description: 'TeleBirr mobile wallet',
          processingTime: 'Instant',
          fees: 'No fees'
        };
      case 'cbebe':
        return {
          description: 'CBE Birr mobile banking',
          processingTime: '1-2 minutes',
          fees: 'No fees'
        };
      case 'mpesa':
        return {
          description: 'Safaricom M-Pesa',
          processingTime: 'Instant',
          fees: 'No fees'
        };
      case 'airtel_money':
        return {
          description: 'Airtel Money wallet',
          processingTime: 'Instant',
          fees: 'No fees'
        };
      case 'bank_transfer':
        return {
          description: 'Direct bank transfer',
          processingTime: '2-24 hours',
          fees: 'Bank charges may apply'
        };
      case 'paypal':
        return {
          description: 'PayPal account',
          processingTime: 'Instant',
          fees: 'PayPal fees apply'
        };
      case 'cash':
        return {
          description: 'Pay in cash at location',
          processingTime: 'Manual verification',
          fees: 'No fees'
        };
      default:
        return {
          description: 'Alternative payment method',
          processingTime: 'Varies',
          fees: 'Varies'
        };
    }
  };

  const details = getMethodDetails();

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-primary ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{method.icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-sm">{method.name}</h3>
                {method.isDefault && (
                  <Badge variant="secondary" className="text-xs">Default</Badge>
                )}
                {!method.enabled && (
                  <Badge variant="destructive" className="text-xs">Disabled</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {details.description}
              </p>
            </div>
          </div>
          
          {selected && (
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Processing:</span>
            <p className="font-medium">{details.processingTime}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Fees:</span>
            <p className="font-medium">{details.fees}</p>
          </div>
        </div>
        
        {method.config.maxAmount && (
          <div className="mt-2">
            <span className="text-xs text-muted-foreground">
              Max amount: {method.config.maxAmount.toLocaleString()} ETB
            </span>
          </div>
        )}
        
        {method.config.requiresManualVerification && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Manual verification required
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
