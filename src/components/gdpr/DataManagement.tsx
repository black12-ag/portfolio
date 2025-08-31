import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Trash2, 
  Shield, 
  Clock, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  gdprCompliance, 
  requestUserDataExport, 
  requestUserDataDeletion,
  type DataExportRequest,
  type DataDeletionRequest,
  type PersonalDataCategory
} from '@/lib/gdprCompliance';

export default function DataManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [dataCategories] = useState<PersonalDataCategory[]>(gdprCompliance.getDataCategories());

  useEffect(() => {
    if (user) {
      loadUserRequests();
    }
  }, [user, loadUserRequests]);

  const loadUserRequests = () => {
    if (!user) return;
    
    const exports = gdprCompliance.getUserExportRequests(user.id);
    const deletions = gdprCompliance.getUserDeletionRequests(user.id);
    
    setExportRequests(exports);
    setDeletionRequests(deletions);
  };

  const handleDataExport = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const request = await requestUserDataExport(user.id);
      setExportRequests(prev => [...prev, request]);
      
      toast({
        title: "Export Request Submitted",
        description: "We'll prepare your data and notify you when it's ready for download.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to submit export request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataDeletion = async () => {
    if (!user) return;
    
    if (!deletionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for account deletion.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      const request = await requestUserDataDeletion(user.id, deletionReason);
      setDeletionRequests(prev => [...prev, request]);
      
      toast({
        title: "Deletion Request Submitted",
        description: "Your account will be deleted in 30 days. You can cancel this request at any time.",
        variant: "destructive"
      });
      
      setDeletionReason('');
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to submit deletion request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (requestId: string) => {
    gdprCompliance.downloadExportData(requestId);
    toast({
      title: "Download Started",
      description: "Your data export file is being downloaded.",
    });
  };

  const handleCancelDeletion = (requestId: string) => {
    const success = gdprCompliance.cancelDataDeletion(requestId);
    if (success) {
      loadUserRequests();
      toast({
        title: "Deletion Cancelled",
        description: "Your account deletion request has been cancelled.",
      });
    } else {
      toast({
        title: "Cancellation Failed",
        description: "Unable to cancel deletion request.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="default"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Data Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Personal Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We collect and process the following categories of personal data:
            </p>
            
            <div className="grid gap-3">
              {dataCategories.map((category, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{category.category}</h4>
                      <div className="flex gap-2">
                        {category.canExport && (
                          <Badge variant="outline" className="text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            Exportable
                          </Badge>
                        )}
                        {category.canDelete && (
                          <Badge variant="outline" className="text-xs">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Deletable
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex flex-wrap gap-4">
                        <span><strong>Retention:</strong> {category.retention}</span>
                        <span><strong>Legal Basis:</strong> {category.legal_basis}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You have the right to receive a copy of your personal data in a structured, 
              commonly used format. This export will include all data we have about you.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleDataExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Request Data Export
          </Button>

          {/* Export Requests History */}
          {exportRequests.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h4 className="font-medium">Export Requests</h4>
              
              {exportRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Request #{request.id.slice(-8)}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requested on {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                    {request.expiresAt && (
                      <p className="text-xs text-muted-foreground">
                        Expires on {new Date(request.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {request.status === 'completed' && request.downloadUrl && (
                    <Button 
                      size="sm" 
                      onClick={() => handleDownload(request.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deleting your account will permanently remove all your data 
              and cannot be undone. You have 30 days to cancel this request after submission.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Reason for deletion (required)</Label>
            <Textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              placeholder="Please tell us why you want to delete your account..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleDataDeletion}
            disabled={isDeleting || !deletionReason.trim()}
            variant="destructive"
            className="w-full"
          >
            {isDeleting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Request Account Deletion
          </Button>

          {/* Deletion Requests History */}
          {deletionRequests.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h4 className="font-medium">Deletion Requests</h4>
              
              {deletionRequests.map((request) => (
                <div key={request.id} className="p-3 border rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Request #{request.id.slice(-8)}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    {request.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelDeletion(request.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Requested on {new Date(request.requestedAt).toLocaleDateString()}</p>
                    {request.scheduledFor && (
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Scheduled for deletion on {new Date(request.scheduledFor).toLocaleDateString()}
                      </p>
                    )}
                    {request.reason && (
                      <p><strong>Reason:</strong> {request.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your GDPR Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            
            <div className="grid gap-3">
              {[
                {
                  title: "Right to Access",
                  description: "Request information about the personal data we hold about you"
                },
                {
                  title: "Right to Rectification",
                  description: "Request correction of inaccurate or incomplete personal data"
                },
                {
                  title: "Right to Erasure",
                  description: "Request deletion of your personal data (\"right to be forgotten\")"
                },
                {
                  title: "Right to Restrict Processing",
                  description: "Request limitation of how we process your personal data"
                },
                {
                  title: "Right to Data Portability",
                  description: "Request transfer of your data to another service provider"
                },
                {
                  title: "Right to Object",
                  description: "Object to processing of your personal data for marketing purposes"
                },
                {
                  title: "Rights Related to Automated Decision-Making",
                  description: "Request human review of automated decisions that affect you"
                }
              ].map((right, index) => (
                <div key={index} className="p-3 border rounded">
                  <h4 className="font-medium text-sm">{right.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{right.description}</p>
                </div>
              ))}
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                To exercise any of these rights or if you have questions about our data practices, 
                please contact us at{' '}
                <a href="mailto:privacy@metah.travel" className="text-primary hover:underline">
                  privacy@metah.travel
                </a>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
