import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Phone, 
  Building, 
  Wallet, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Globe
} from 'lucide-react';
import { PaymentMethod, PaymentType } from '@/types/payment';
import { paymentService } from '@/lib/paymentService';
import { isStripeConfigured } from '@/lib/stripeConfig';
import { isPayPalConfigured } from '@/lib/paypalConfig';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentType | null;
  onMethodSelect: (method: PaymentType) => void;
  amount: number;
  currency: string;
  className?: string;
}

interface PaymentMethodInfo extends PaymentMethod {
  processingTime: string;
  fees: string;
  popularity: number;
  securityLevel: 'high' | 'medium' | 'low';
  availability: 'available' | 'unavailable' | 'limited';
  features: string[];
  recommended?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  amount,
  currency,
  className
}) => {
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, [amount, currency]);

  const loadPaymentMethods = async () => {
    setLoading(true);
    
    const baseMethods = paymentService.getAvailablePaymentMethods();
    
    // Enhanced method information
    const enhancedMethods: PaymentMethodInfo[] = baseMethods.map((method): PaymentMethodInfo => {
      const baseInfo = {
        ...method,
        processingTime: '2-3 minutes',
        fees: 'No fees',
        popularity: 3,
        securityLevel: 'high' as const,
        availability: 'available' as const,
        features: ['Secure', 'Fast'],
      };

      switch (method.type) {
        case 'credit_card':
          return {
            ...baseInfo,
            processingTime: 'Instant',
            fees: '2.9% + $0.30',
            popularity: 5,
            features: ['Instant confirmation', 'Fraud protection', 'Chargeback protection'],
            availability: isStripeConfigured() ? 'available' : 'unavailable',
            recommended: true,
          };

        case 'debit_card':
          return {
            ...baseInfo,
            processingTime: 'Instant',
            fees: '2.9% + $0.30',
            popularity: 4,
            features: ['Instant confirmation', 'Direct bank debit', 'Lower fees'],
            availability: isStripeConfigured() ? 'available' : 'unavailable',
          };

        case 'paypal':
          return {
            ...baseInfo,
            processingTime: 'Instant',
            fees: '2.9% + $0.30',
            popularity: 4,
            features: ['Buyer protection', 'No card required', 'Global acceptance'],
            availability: isPayPalConfigured() ? 'available' : 'unavailable',
          };

        case 'telebirr':
          return {
            ...baseInfo,
            name: 'TeleBirr',
            icon: '📱',
            processingTime: '1-2 minutes',
            fees: '1% (max 50 ETB)',
            popularity: 5,
            features: ['Most popular in Ethiopia', 'Mobile wallet', 'USSD support'],
            availability: currency === 'ETB' ? 'available' : 'limited',
            recommended: currency === 'ETB',
          };

        case 'cbebe':
          return {
            ...baseInfo,
            name: 'CBE Birr',
            icon: '🏦',
            processingTime: '5-10 minutes',
            fees: 'Free',
            popularity: 4,
            features: ['Bank-backed', 'No transaction fees', 'High limits'],
            availability: currency === 'ETB' ? 'available' : 'limited',
          };

        case 'mpesa':
          return {
            ...baseInfo,
            processingTime: '1-2 minutes',
            fees: '1-3%',
            popularity: 3,
            features: ['East Africa popular', 'Mobile money', 'SMS confirmation'],
            availability: ['KES', 'TZS', 'UGX'].includes(currency) ? 'available' : 'limited',
          };

        case 'airtel_money':
          return {
            ...baseInfo,
            processingTime: '1-2 minutes',
            fees: '1-2%',
            popularity: 3,
            features: ['Multi-country', 'Mobile wallet', 'USSD access'],
            availability: ['KES', 'TZS', 'UGX', 'ZMW'].includes(currency) ? 'available' : 'limited',
          };

        case 'bank_transfer':
          return {
            ...baseInfo,
            processingTime: '1-3 business days',
            fees: 'Free',
            popularity: 2,
            securityLevel: 'high',
            features: ['No fees', 'High security', 'Large amounts'],
            availability: 'available',
          };

        case 'cash':
          return {
            ...baseInfo,
            processingTime: 'At check-in',
            fees: 'Free',
            popularity: 2,
            securityLevel: 'medium',
            features: ['Pay at hotel', 'No online fees', 'Local currency'],
            availability: 'available',
          };

        default:
          return baseInfo;
      }
    });

    // Sort by availability, recommendation, and popularity
    const sortedMethods = enhancedMethods.sort((a, b) => {
      if (a.availability === 'available' && b.availability !== 'available') return -1;
      if (b.availability === 'available' && a.availability !== 'available') return 1;
      if (a.recommended && !b.recommended) return -1;
      if (b.recommended && !a.recommended) return 1;
      return b.popularity - a.popularity;
    });

    setAvailableMethods(sortedMethods);
    setLoading(false);
  };

  const getMethodIcon = (type: PaymentType) => {
    const iconMap = {
      credit_card: CreditCard,
      debit_card: CreditCard,
      telebirr: Phone,
      cbebe: Building,
      mpesa: Phone,
      airtel_money: Phone,
      bank_transfer: Building,
      paypal: Globe,
      cash: Wallet,
    };

    const IconComponent = iconMap[type] || Wallet;
    return <IconComponent className="h-5 w-5" />;
  };

  const getAvailabilityBadge = (availability: PaymentMethodInfo['availability']) => {
    switch (availability) {
      case 'available':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      case 'limited':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Limited
          </Badge>
        );
      case 'unavailable':
        return (
          <Badge variant="destructive" className="opacity-60">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unavailable
          </Badge>
        );
    }
  };

  const getSecurityBadge = (level: PaymentMethodInfo['securityLevel']) => {
    const colors = {
      high: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <Badge variant="outline" className={colors[level]}>
        <Shield className="h-3 w-3 mr-1" />
        {level.charAt(0).toUpperCase() + level.slice(1)} Security
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Choose Payment Method</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select your preferred payment method for {currency} {amount.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableMethods.map((method) => (
          <div
            key={method.id}
            className={cn(
              "relative border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedMethod === method.type
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50",
              method.availability === 'unavailable' && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => {
              if (method.availability !== 'unavailable') {
                onMethodSelect(method.type);
              }
            }}
          >
            {/* Recommended Badge */}
            {method.recommended && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}

            <div className="flex items-start space-x-4">
              {/* Method Icon */}
              <div className="flex-shrink-0 mt-1">
                {getMethodIcon(method.type)}
              </div>

              {/* Method Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-sm">{method.name}</h3>
                  {method.popularity >= 4 && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {getAvailabilityBadge(method.availability)}
                  {getSecurityBadge(method.securityLevel)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{method.processingTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wallet className="h-3 w-3" />
                    <span>{method.fees}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {method.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {method.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{method.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedMethod === method.type && (
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>

            {/* Unavailable Overlay */}
            {method.availability === 'unavailable' && (
              <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                <Alert className="w-full max-w-xs">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Not available for {currency} payments
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        ))}

        {/* Payment Security Notice */}
        <Alert className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            All payments are secured with 256-bit SSL encryption and PCI DSS compliance.
            Your financial information is never stored on our servers.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
