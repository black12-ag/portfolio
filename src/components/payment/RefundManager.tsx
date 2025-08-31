import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  RefreshCw, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Calculator,
  FileText,
  Clock,
  User,
  CreditCard,
  ArrowLeftRight,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import { stripeIntegrationService, RefundResult } from '@/services/payment/stripeIntegrationService';

export interface Transaction {
  id: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'canceled' | 'refunded' | 'partially_refunded';
  paymentMethod: {
    type: string;
    last4?: string;
    brand?: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  booking: {
    id: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
  };
  createdAt: string;
  refunds?: Array<{
    id: string;
    amount: number;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  metadata?: Record<string, string>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'support';
  permissions: string[];
}

export interface Refund {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  processedBy: string;
  processedAt: string;
  notes?: string;
  receiptNumber?: string;
}

export interface RefundManagerProps {
  transaction: Transaction;
  onRefundProcessed: (refund: Refund) => void;
  adminUser: AdminUser;
  onClose?: () => void;
}

const REFUND_REASONS = [
  { value: 'requested_by_customer', label: 'Customer Request' },
  { value: 'duplicate', label: 'Duplicate Payment' },
  { value: 'fraudulent', label: 'Fraudulent Transaction' },
  { value: 'subscription_canceled', label: 'Subscription Canceled' },
  { value: 'service_not_provided', label: 'Service Not Provided' },
  { value: 'hotel_cancellation', label: 'Hotel Cancellation' },
  { value: 'overbooking', label: 'Hotel Overbooking' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'technical_error', label: 'Technical Error' },
  { value: 'other', label: 'Other' }
];

export const RefundManager: React.FC<RefundManagerProps> = ({
  transaction,
  onRefundProcessed,
  adminUser,
  onClose
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // State management
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState<number>(transaction.amount);
  const [refundReason, setRefundReason] = useState<string>('');
  const [refundNotes, setRefundNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Refund | null>(null);
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  // Calculate available refund amount
  const refundedAmount = transaction.refunds?.reduce((sum, refund) => {
    return refund.status === 'succeeded' ? sum + refund.amount : sum;
  }, 0) || 0;
  
  const maxRefundAmount = transaction.amount - refundedAmount;
  const hasPartialRefunds = (transaction.refunds?.length || 0) > 0;

  // Update refund amount when type changes
  useEffect(() => {
    if (refundType === 'full') {
      setRefundAmount(maxRefundAmount);
    } else if (refundType === 'partial' && refundAmount > maxRefundAmount) {
      setRefundAmount(maxRefundAmount);
    }
  }, [refundType, maxRefundAmount]);

  // Handle refund processing
  const handleProcessRefund = async () => {
    if (!refundReason) {
      setError('Please select a refund reason');
      return;
    }

    if (refundAmount <= 0 || refundAmount > maxRefundAmount) {
      setError(`Refund amount must be between $0.01 and ${formatPrice(maxRefundAmount)}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Process refund through Stripe
      const result: RefundResult = await stripeIntegrationService.processRefund(
        transaction.paymentIntentId,
        refundAmount,
        refundReason
      );

      if (result.success && result.refund) {
        // Create refund record
        const refund: Refund = {
          id: result.refund.id,
          transactionId: transaction.id,
          amount: result.refund.amount,
          currency: result.refund.currency,
          reason: refundReason,
          status: result.refund.status as any,
          processedBy: adminUser.name,
          processedAt: new Date().toISOString(),
          notes: refundNotes,
          receiptNumber: result.refund.receipt_number
        };

        setSuccess(refund);
        
        // Notify customer if requested
        if (notifyCustomer) {
          await sendRefundNotification(refund);
        }

        // Call parent callback
        onRefundProcessed(refund);

        // Auto-close after success
        setTimeout(() => {
          onClose?.();
        }, 3000);

      } else {
        setError(result.error || 'Refund processing failed');
      }

    } catch (error) {
      console.error('Refund processing error:', error);
      setError(error instanceof Error ? error.message : 'Refund processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Send refund notification to customer
  const sendRefundNotification = async (refund: Refund) => {
    try {
      // This would integrate with your email service
      await fetch('/api/notifications/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          customerId: transaction.customer.id,
          customerEmail: transaction.customer.email,
          refund: refund,
          transaction: transaction,
          template: 'refund_processed'
        })
      });
    } catch (error) {
      console.warn('Failed to send refund notification:', error);
    }
  };

  // Get refund status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate refund fee (if any)
  const refundFee = refundAmount * 0.0; // Most providers don't charge for refunds
  const netRefundAmount = refundAmount - refundFee;

  if (success) {
    return (
      <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            Refund Processed Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Refund of {formatPrice(success.amount)} has been processed successfully.
              {success.receiptNumber && ` Receipt: ${success.receiptNumber}`}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Refund Amount</label>
              <p className="text-lg font-semibold">{formatPrice(success.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <Badge className={getStatusColor(success.status)}>
                {success.status.charAt(0).toUpperCase() + success.status.slice(1)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Processed By</label>
              <p>{success.processedBy}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Processing Time</label>
              <p>{new Date(success.processedAt).toLocaleString()}</p>
            </div>
          </div>

          {notifyCustomer && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Mail className="w-4 h-4" />
              Customer notification sent to {transaction.customer.email}
            </div>
          )}

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6" />
          Process Refund
        </CardTitle>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Transaction: {transaction.id}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Transaction Summary */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className="font-semibold mb-3">Transaction Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Amount Paid</label>
              <p className="text-lg font-semibold">{formatPrice(transaction.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Payment Method</label>
              <p className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {transaction.paymentMethod.brand?.toUpperCase()} •••• {transaction.paymentMethod.last4}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Customer</label>
              <p>{transaction.customer.name}</p>
              <p className="text-sm text-gray-500">{transaction.customer.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Booking</label>
              <p>{transaction.booking.hotelName}</p>
              <p className="text-sm text-gray-500">
                {new Date(transaction.booking.checkIn).toLocaleDateString()} - 
                {new Date(transaction.booking.checkOut).toLocaleDateString()}
              </p>
            </div>
          </div>

          {hasPartialRefunds && (
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm font-medium text-gray-600">Previous Refunds</label>
              <div className="mt-2 space-y-2">
                {transaction.refunds?.map((refund, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">
                      {formatPrice(refund.amount)} - {refund.reason}
                    </span>
                    <Badge className={getStatusColor(refund.status)}>
                      {refund.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t text-sm">
                <strong>Available for refund: {formatPrice(maxRefundAmount)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Refund Configuration */}
        <div className="space-y-4">
          <h4 className="font-semibold">Refund Configuration</h4>
          
          {/* Refund Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Refund Type</label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="full"
                  checked={refundType === 'full'}
                  onChange={(e) => setRefundType(e.target.value as 'full' | 'partial')}
                  className="rounded"
                />
                <span>Full Refund ({formatPrice(maxRefundAmount)})</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="partial"
                  checked={refundType === 'partial'}
                  onChange={(e) => setRefundType(e.target.value as 'full' | 'partial')}
                  className="rounded"
                />
                <span>Partial Refund</span>
              </label>
            </div>
          </div>

          {/* Refund Amount */}
          {refundType === 'partial' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Refund Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  min={0.01}
                  max={maxRefundAmount}
                  step={0.01}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500">
                Maximum refundable: {formatPrice(maxRefundAmount)}
              </p>
            </div>
          )}

          {/* Refund Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Refund Reason *</label>
            <Select value={refundReason} onValueChange={setRefundReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select refund reason" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes</label>
            <Textarea
              value={refundNotes}
              onChange={(e) => setRefundNotes(e.target.value)}
              placeholder="Add any additional notes about this refund..."
              rows={3}
            />
          </div>

          {/* Customer Notification */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notify-customer"
              checked={notifyCustomer}
              onChange={(e) => setNotifyCustomer(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="notify-customer" className="text-sm">
              Send refund notification to customer
            </label>
          </div>
        </div>

        {/* Refund Summary */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'border-blue-800 bg-blue-900/20' : 'border-blue-200 bg-blue-50'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold">Refund Summary</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Refund Amount</span>
              <span className="font-semibold">{formatPrice(refundAmount)}</span>
            </div>
            {refundFee > 0 && (
              <div className="flex justify-between">
                <span>Processing Fee</span>
                <span>-{formatPrice(refundFee)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Net Refund to Customer</span>
              <span>{formatPrice(netRefundAmount)}</span>
            </div>
            <div className="text-xs text-gray-600">
              <Clock className="w-3 h-3 inline mr-1" />
              Refunds typically take 5-10 business days to appear on customer's statement
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Security Warning */}
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            <strong>Important:</strong> Refunds cannot be reversed once processed. 
            Please verify all details before proceeding.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProcessRefund}
            disabled={isProcessing || !refundReason || refundAmount <= 0}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Process Refund
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefundManager;
