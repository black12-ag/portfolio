import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  Download,
  Eye,
  CreditCard,
  Shield,
  Bell
} from 'lucide-react';
import { PaymentTransaction, PaymentStatus } from '@/types/payment';
import { paymentService } from '@/lib/paymentService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PaymentStatusTrackerProps {
  transactionId: string;
  onStatusChange?: (status: PaymentStatus) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

interface PaymentStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp?: Date;
  icon: React.ComponentType<{ className?: string }>;
}

const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  transactionId,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 5000,
  className
}) => {
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadTransaction();
    
    if (autoRefresh) {
      const interval = setInterval(loadTransaction, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [transactionId, autoRefresh, refreshInterval]);

  const loadTransaction = async () => {
    try {
      setError(null);
      const tx = paymentService.getTransactionById(transactionId);
      
      if (!tx) {
        throw new Error('Transaction not found');
      }

      // Check for status changes
      if (transaction && transaction.status !== tx.status) {
        onStatusChange?.(tx.status);
        
        // Show notification for status changes
        if (tx.status === 'completed' || tx.status === 'verified') {
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          });
        } else if (tx.status === 'failed' || tx.status === 'declined') {
          toast({
            title: "Payment Failed",
            description: "There was an issue with your payment. Please try again.",
            variant: "destructive"
          });
        }
      }

      setTransaction(tx);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentSteps = (tx: PaymentTransaction): PaymentStep[] => {
    const steps: PaymentStep[] = [
      {
        id: 'initiated',
        label: 'Payment Initiated',
        description: 'Payment request created',
        status: 'completed',
        timestamp: tx.createdAt,
        icon: CreditCard,
      },
      {
        id: 'processing',
        label: 'Processing Payment',
        description: 'Verifying payment details',
        status: tx.status === 'pending' ? 'processing' : 
                tx.status === 'failed' || tx.status === 'declined' ? 'failed' : 'completed',
        timestamp: tx.processedAt,
        icon: RefreshCw,
      },
      {
        id: 'verification',
        label: 'Payment Verification',
        description: tx.verificationMethod === 'manual' ? 'Manual verification required' : 'Automatic verification',
        status: tx.status === 'requires_verification' ? 'processing' :
                tx.status === 'verified' || tx.status === 'completed' ? 'completed' :
                tx.status === 'failed' || tx.status === 'declined' ? 'failed' : 'pending',
        timestamp: tx.verifiedAt,
        icon: Shield,
      },
      {
        id: 'completed',
        label: 'Payment Completed',
        description: 'Payment successfully processed',
        status: tx.status === 'completed' || tx.status === 'verified' ? 'completed' :
                tx.status === 'failed' || tx.status === 'declined' ? 'failed' : 'pending',
        timestamp: tx.verifiedAt || tx.processedAt,
        icon: CheckCircle,
      },
    ];

    return steps;
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        label: 'Pending' 
      },
      processing: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: RefreshCw,
        label: 'Processing' 
      },
      requires_verification: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: AlertCircle,
        label: 'Verification Required' 
      },
      completed: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        label: 'Completed' 
      },
      verified: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        label: 'Verified' 
      },
      failed: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        label: 'Failed' 
      },
      declined: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        label: 'Declined' 
      },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getProgressPercentage = (steps: PaymentStep[]): number => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const handleDownloadReceipt = async () => {
    if (!transaction) return;

    try {
      const receiptUrl = paymentService.generateReceipt(transaction.id);
      window.open(receiptUrl, '_blank');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !transaction) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Transaction not found'}
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={loadTransaction}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const steps = getPaymentSteps(transaction);
  const progressPercentage = getProgressPercentage(steps);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Status</span>
          </CardTitle>
          {getStatusBadge(transaction.status)}
        </div>
        <div className="text-sm text-muted-foreground">
          Transaction ID: {transaction.id}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="font-medium">
              {transaction.amount.toLocaleString()} {transaction.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Method:</span>
            <span className="font-medium capitalize">
              {transaction.paymentMethod.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Booking ID:</span>
            <span className="font-medium font-mono text-xs">
              {transaction.bookingId}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Payment Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-start space-x-3">
                {/* Step Icon */}
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  step.status === 'completed' ? 'bg-green-100 text-green-600' :
                  step.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                  step.status === 'failed' ? 'bg-red-100 text-red-600' :
                  'bg-muted text-muted-foreground'
                )}>
                  <IconComponent className={cn(
                    "h-4 w-4",
                    step.status === 'processing' && 'animate-spin'
                  )} />
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium">{step.label}</h4>
                    {step.status === 'processing' && (
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(step.timestamp)}
                    </p>
                  )}
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-7 mt-8 w-px h-8 bg-border" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransaction}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>

          {(transaction.status === 'completed' || transaction.status === 'verified') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReceipt}
            >
              <Download className="h-4 w-4 mr-2" />
              Receipt
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/payment/details/${transaction.id}`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {formatTimestamp(lastUpdated)}
          {autoRefresh && (
            <span className="ml-2">
              <Bell className="h-3 w-3 inline mr-1" />
              Auto-refreshing every {refreshInterval / 1000}s
            </span>
          )}
        </div>

        {/* Special Messages */}
        {transaction.status === 'requires_verification' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your payment requires manual verification. This typically takes 1-24 hours.
              You will be notified once verification is complete.
            </AlertDescription>
          </Alert>
        )}

        {transaction.status === 'failed' && transaction.retryCount < 3 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment failed. You can try again with the same or different payment method.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusTracker;
