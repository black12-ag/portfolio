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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Upload,
  Download,
  Eye,
  MessageSquare,
  Shield,
  CreditCard,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export interface Dispute {
  id: string;
  chargeId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'needs_response' | 'under_review' | 'charge_refunded' | 'won' | 'lost';
  evidence_details: {
    due_by: number;
    has_evidence: boolean;
    past_due: boolean;
    submission_count: number;
  };
  evidence: {
    access_activity_log?: string;
    billing_address?: string;
    cancellation_policy?: string;
    cancellation_policy_disclosure?: string;
    cancellation_rebuttal?: string;
    customer_communication?: string;
    customer_email_address?: string;
    customer_name?: string;
    customer_purchase_ip?: string;
    customer_signature?: string;
    duplicate_charge_documentation?: string;
    duplicate_charge_explanation?: string;
    duplicate_charge_id?: string;
    product_description?: string;
    receipt?: string;
    refund_policy?: string;
    refund_policy_disclosure?: string;
    refund_refusal_explanation?: string;
    service_date?: string;
    service_documentation?: string;
    shipping_address?: string;
    shipping_carrier?: string;
    shipping_date?: string;
    shipping_documentation?: string;
    shipping_tracking_number?: string;
    uncategorized_file?: string;
    uncategorized_text?: string;
  };
  metadata: Record<string, string>;
  created: number;
  updated?: number;
  livemode: boolean;
}

export interface DisputeResolution {
  id: string;
  disputeId: string;
  action: 'accept' | 'submit_evidence' | 'update_evidence';
  evidence?: Partial<Dispute['evidence']>;
  notes?: string;
  submittedBy: string;
  submittedAt: string;
}

export interface PaymentDisputeProps {
  dispute: Dispute;
  onDisputeResolved: (resolution: DisputeResolution) => void;
  onClose?: () => void;
}

const DISPUTE_REASONS = {
  'credit_not_processed': 'Credit Not Processed',
  'duplicate': 'Duplicate Charge',
  'fraudulent': 'Fraudulent Transaction',
  'general': 'General Inquiry',
  'incorrect_account_details': 'Incorrect Account Details',
  'insufficient_funds': 'Insufficient Funds',
  'product_not_received': 'Product Not Received',
  'product_unacceptable': 'Product Unacceptable',
  'subscription_canceled': 'Subscription Canceled',
  'unrecognized': 'Unrecognized Charge'
};

const DISPUTE_STATUS_INFO = {
  'warning_needs_response': { color: 'bg-yellow-100 text-yellow-800', label: 'Warning - Response Needed' },
  'warning_under_review': { color: 'bg-yellow-100 text-yellow-800', label: 'Warning - Under Review' },
  'warning_closed': { color: 'bg-green-100 text-green-800', label: 'Warning - Closed' },
  'needs_response': { color: 'bg-red-100 text-red-800', label: 'Response Required' },
  'under_review': { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
  'charge_refunded': { color: 'bg-green-100 text-green-800', label: 'Charge Refunded' },
  'won': { color: 'bg-green-100 text-green-800', label: 'Won' },
  'lost': { color: 'bg-red-100 text-red-800', label: 'Lost' }
};

export const PaymentDispute: React.FC<PaymentDisputeProps> = ({
  dispute,
  onDisputeResolved,
  onClose
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // State management
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'communication'>('overview');
  const [evidence, setEvidence] = useState<Partial<Dispute['evidence']>>(dispute.evidence || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [communicationLog, setCommunicationLog] = useState<Array<{
    id: string;
    type: 'email' | 'phone' | 'chat' | 'note';
    content: string;
    timestamp: string;
    sender: string;
  }>>([]);
  const [newNote, setNewNote] = useState('');

  // Calculate time remaining for response
  const timeRemaining = dispute.evidence_details.due_by * 1000 - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60)));

  // Load communication history
  useEffect(() => {
    // Mock communication log - in real implementation, fetch from API
    setCommunicationLog([
      {
        id: '1',
        type: 'email',
        content: 'Customer contacted regarding booking confirmation for Grand Hotel Paris',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        sender: 'customer@example.com'
      },
      {
        id: '2',
        type: 'email',
        content: 'Booking confirmation sent with receipt #12345',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        sender: 'support@metahtravel.com'
      },
      {
        id: '3',
        type: 'note',
        content: 'Customer reported they did not recognize the charge. Provided booking details and hotel confirmation.',
        timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        sender: 'Support Agent'
      }
    ]);
  }, []);

  // Handle evidence field updates
  const updateEvidence = (field: keyof Dispute['evidence'], value: string) => {
    setEvidence(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file uploads
  const handleFileUpload = (field: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [field]: file
    }));
    
    // In real implementation, upload file and get URL
    updateEvidence(field as keyof Dispute['evidence'], `uploaded_${file.name}`);
  };

  // Submit evidence
  const handleSubmitEvidence = async () => {
    setIsSubmitting(true);

    try {
      // Upload files first
      const uploadPromises = Object.entries(uploadedFiles).map(async ([field, file]) => {
        // Mock file upload - in real implementation, upload to your storage service
        const formData = new FormData();
        formData.append('file', file);
        formData.append('dispute_id', dispute.id);
        formData.append('evidence_field', field);

        // const response = await fetch('/api/disputes/upload-evidence', {
        //   method: 'POST',
        //   body: formData
        // });
        // const result = await response.json();
        // return { field, url: result.url };

        // Mock response
        return { field, url: `https://storage.example.com/${file.name}` };
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Update evidence with file URLs
      const updatedEvidence = { ...evidence };
      uploadResults.forEach(({ field, url }) => {
        updatedEvidence[field as keyof Dispute['evidence']] = url;
      });

      // Submit evidence to Stripe
      const response = await fetch('/api/disputes/submit-evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          dispute_id: dispute.id,
          evidence: updatedEvidence,
          metadata: {
            submitted_by: 'admin',
            submitted_at: new Date().toISOString(),
            submission_notes: newNote
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit evidence');
      }

      const resolution: DisputeResolution = {
        id: `resolution_${Date.now()}`,
        disputeId: dispute.id,
        action: 'submit_evidence',
        evidence: updatedEvidence,
        notes: newNote,
        submittedBy: 'Admin User',
        submittedAt: new Date().toISOString()
      };

      onDisputeResolved(resolution);

    } catch (error) {
      console.error('Error submitting evidence:', error);
      alert('Failed to submit evidence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accept dispute (refund customer)
  const handleAcceptDispute = async () => {
    if (!confirm('Are you sure you want to accept this dispute? This will refund the customer.')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/disputes/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          dispute_id: dispute.id,
          notes: 'Dispute accepted - customer refunded'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to accept dispute');
      }

      const resolution: DisputeResolution = {
        id: `resolution_${Date.now()}`,
        disputeId: dispute.id,
        action: 'accept',
        notes: 'Dispute accepted and customer refunded',
        submittedBy: 'Admin User',
        submittedAt: new Date().toISOString()
      };

      onDisputeResolved(resolution);

    } catch (error) {
      console.error('Error accepting dispute:', error);
      alert('Failed to accept dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add communication note
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: `note_${Date.now()}`,
      type: 'note' as const,
      content: newNote,
      timestamp: new Date().toISOString(),
      sender: 'Admin User'
    };

    setCommunicationLog(prev => [...prev, note]);
    setNewNote('');
  };

  const statusInfo = DISPUTE_STATUS_INFO[dispute.status];
  const reasonLabel = DISPUTE_REASONS[dispute.reason as keyof typeof DISPUTE_REASONS] || dispute.reason;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Payment Dispute
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Dispute ID: {dispute.id} • Charge: {dispute.chargeId}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Urgency Alert */}
          {dispute.status.includes('needs_response') && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                <strong>Urgent:</strong> Response required within {daysRemaining} day(s) ({hoursRemaining} hours remaining)
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Disputed Amount</label>
              <p className="text-xl font-bold">{formatPrice(dispute.amount / 100)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Reason</label>
              <p>{reasonLabel}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <p>{new Date(dispute.created * 1000).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Evidence Due</label>
              <p>{new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Evidence Submission Progress</span>
              <span>{dispute.evidence_details.submission_count} submissions</span>
            </div>
            <Progress 
              value={dispute.evidence_details.has_evidence ? 100 : 20} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle>Dispute Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Transaction Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Charge ID:</span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {dispute.chargeId}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold">{formatPrice(dispute.amount / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Currency:</span>
                      <span>{dispute.currency.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment:</span>
                      <Badge variant={dispute.livemode ? 'default' : 'secondary'}>
                        {dispute.livemode ? 'Live' : 'Test'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{evidence.customer_name || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{evidence.customer_email_address || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{evidence.billing_address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              {dispute.metadata && Object.keys(dispute.metadata).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Booking Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(dispute.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-4">
          <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle>Submit Evidence</CardTitle>
              <div className="text-sm text-gray-600">
                Provide evidence to support your case against this dispute
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Communication */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Communication</label>
                <Textarea
                  value={evidence.customer_communication || ''}
                  onChange={(e) => updateEvidence('customer_communication', e.target.value)}
                  placeholder="Describe your communication with the customer..."
                  rows={3}
                />
              </div>

              {/* Service Documentation */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Documentation</label>
                <Textarea
                  value={evidence.service_documentation || ''}
                  onChange={(e) => updateEvidence('service_documentation', e.target.value)}
                  placeholder="Provide details about the service provided..."
                  rows={3}
                />
              </div>

              {/* Receipt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Receipt/Invoice</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('receipt', file);
                    }}
                  />
                  {evidence.receipt && (
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cancellation Policy</label>
                <Textarea
                  value={evidence.cancellation_policy || ''}
                  onChange={(e) => updateEvidence('cancellation_policy', e.target.value)}
                  placeholder="Describe your cancellation policy..."
                  rows={2}
                />
              </div>

              {/* Refund Policy */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Refund Policy</label>
                <Textarea
                  value={evidence.refund_policy || ''}
                  onChange={(e) => updateEvidence('refund_policy', e.target.value)}
                  placeholder="Describe your refund policy..."
                  rows={2}
                />
              </div>

              {/* Additional Evidence */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Evidence</label>
                <Textarea
                  value={evidence.uncategorized_text || ''}
                  onChange={(e) => updateEvidence('uncategorized_text', e.target.value)}
                  placeholder="Any additional information that supports your case..."
                  rows={3}
                />
              </div>

              {/* File Uploads */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Supporting Documents</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Upload additional supporting documents
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file, index) => {
                          handleFileUpload(`uncategorized_file_${index}`, file);
                        });
                      }}
                      className="mt-2"
                    />
                  </div>
                </div>
                {Object.keys(uploadedFiles).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(uploadedFiles).map(([field, file]) => (
                      <div key={field} className="flex items-center justify-between text-sm">
                        <span>{file.name}</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Communication Log */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {communicationLog.map((comm) => (
                  <div key={comm.id} className={`p-3 rounded-lg border ${
                    theme === 'dark' ? 'border-slate-600' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {comm.type === 'email' && <Mail className="w-4 h-4" />}
                        {comm.type === 'phone' && <Phone className="w-4 h-4" />}
                        {comm.type === 'note' && <FileText className="w-4 h-4" />}
                        <span className="font-medium">{comm.sender}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comm.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{comm.content}</p>
                  </div>
                ))}
              </div>

              {/* Add New Note */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">Add Internal Note</label>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this dispute..."
                  rows={2}
                />
                <Button onClick={handleAddNote} size="sm" disabled={!newNote.trim()}>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptDispute}
              variant="outline"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Accept Dispute & Refund
            </Button>
            
            <Button
              onClick={handleSubmitEvidence}
              disabled={isSubmitting || !Object.values(evidence).some(v => v)}
              className="flex-1"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              Submit Evidence
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <Shield className="w-3 h-3 inline mr-1" />
            All evidence submissions are logged and cannot be retracted once submitted
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDispute;
