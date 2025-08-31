import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download,
  Eye,
  CreditCard,
  Phone,
  Building,
  Wallet
} from 'lucide-react';
import { PaymentTransaction, PaymentStatus } from '@/types/payment';
import { paymentService } from '@/lib/paymentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PaymentVerificationProps {
  transaction: PaymentTransaction;
  onUpdate: () => void;
  isAdmin?: boolean;
}

export default function PaymentVerification({ 
  transaction, 
  onUpdate, 
  isAdmin = false 
}: PaymentVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleVerification = async (approved: boolean) => {
    if (!isAdmin) return;
    
    setIsVerifying(true);
    try {
      await paymentService.verifyPayment(
        transaction.id, 
        'admin-user', // In real app, get from auth context
        approved, 
        verificationNotes
      );
      
      toast({
        title: approved ? "Payment Approved" : "Payment Declined",
        description: approved 
          ? "The payment has been verified and approved." 
          : "The payment has been declined.",
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Failed to process verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
      setVerificationNotes('');
    }
  };

  const generateReceipt = () => {
    try {
      const receiptUrl = paymentService.generateReceipt(transaction.id);
      window.open(receiptUrl, '_blank');
      toast({
        title: "Receipt Generated",
        description: "Receipt has been generated and opened in a new tab.",
      });
    } catch (error) {
      toast({
        title: "Receipt Generation Failed",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'requires_verification':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentIcon = () => {
    switch (transaction.paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'telebirr':
      case 'cbebe':
      case 'mpesa':
      case 'airtel_money':
        return <Phone className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getPaymentIcon()}
            <span>Payment #{transaction.id.slice(-8)}</span>
          </CardTitle>
          <Badge className={getStatusColor(transaction.status)}>
            {transaction.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Overview */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <p className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Method:</span>
            <p className="font-medium capitalize">{transaction.paymentMethod.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>
            <p className="font-medium">{format(transaction.createdAt, 'MMM dd, yyyy HH:mm')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Booking:</span>
            <p className="font-medium">{transaction.bookingId}</p>
          </div>
        </div>

        {/* Transaction Details */}
        {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Transaction Details:</p>
            <div className="text-sm space-y-1">
              {transaction.metadata.cardLast4 && (
                <p>Card ending in: ****{transaction.metadata.cardLast4}</p>
              )}
              {transaction.metadata.phoneNumber && (
                <p>Phone: {transaction.metadata.phoneNumber}</p>
              )}
              {transaction.metadata.notes && (
                <p>Notes: {transaction.metadata.notes}</p>
              )}
            </div>
          </div>
        )}

        {/* Verification Section */}
        {transaction.status === 'requires_verification' && isAdmin && (
          <div className="border-t pt-4 space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This payment requires manual verification. Please review the details and approve or decline.
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="text-sm font-medium">Verification Notes:</label>
              <Textarea
                placeholder="Add notes about the verification decision..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleVerification(true)}
                disabled={isVerifying}
                className="flex-1"
                size="sm"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleVerification(false)}
                disabled={isVerifying}
                variant="destructive"
                className="flex-1"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          </div>
        )}

        {/* Verification Information */}
        {transaction.verifiedAt && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Verification Details:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Verified on: {format(transaction.verifiedAt, 'MMM dd, yyyy HH:mm')}</p>
              {transaction.verifiedBy && <p>Verified by: {transaction.verifiedBy}</p>}
              {transaction.verificationNotes && (
                <p>Notes: {transaction.verificationNotes}</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-4 flex flex-wrap gap-2">
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Payment Transaction Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Transaction ID:</span>
                    <p className="text-muted-foreground">{transaction.id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Gateway Transaction ID:</span>
                    <p className="text-muted-foreground">{transaction.gatewayTransactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Gateway:</span>
                    <p className="text-muted-foreground">{transaction.gateway}</p>
                  </div>
                  <div>
                    <span className="font-medium">Verification Method:</span>
                    <p className="text-muted-foreground capitalize">{transaction.verificationMethod}</p>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <p className="text-muted-foreground">{format(transaction.createdAt, 'MMM dd, yyyy HH:mm:ss')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>
                    <p className="text-muted-foreground">{format(transaction.updatedAt, 'MMM dd, yyyy HH:mm:ss')}</p>
                  </div>
                </div>
                
                {transaction.errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{transaction.errorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {(transaction.status === 'completed' || transaction.status === 'verified') && (
            <Button variant="outline" size="sm" onClick={generateReceipt}>
              <Download className="w-4 h-4 mr-2" />
              Receipt
            </Button>
          )}

          {isAdmin && transaction.status === 'failed' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRetryPayment()}
            >
              <Clock className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}

          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRefundPayment()}
              disabled={transaction.status !== 'completed' && transaction.status !== 'verified'}
            >
              <X className="w-4 h-4 mr-2" />
              Refund
            </Button>
          )}

          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSendNotification()}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Notify User
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
