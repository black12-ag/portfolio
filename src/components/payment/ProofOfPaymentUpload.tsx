import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle,
  Camera,
  Scan,
  Eye,
  Download,
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PaymentProof {
  id: string;
  file: File;
  type: 'receipt' | 'screenshot' | 'statement' | 'confirmation' | 'other';
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  extractedData?: {
    amount?: number;
    currency?: string;
    transactionId?: string;
    date?: string;
    bankName?: string;
    accountNumber?: string;
  };
  preview?: string;
  uploadProgress: number;
  validationErrors: string[];
}

interface ProofOfPaymentUploadProps {
  transactionId: string;
  expectedAmount: number;
  currency: string;
  onProofUploaded: (proofs: PaymentProof[]) => void;
  onDataExtracted: (data: any) => void;
  existingProofs?: PaymentProof[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
}

const ProofOfPaymentUpload: React.FC<ProofOfPaymentUploadProps> = ({
  transactionId,
  expectedAmount,
  currency,
  onProofUploaded,
  onDataExtracted,
  existingProofs = [],
  maxFiles = 5,
  maxFileSize = 10,
  className
}) => {
  const [proofs, setProofs] = useState<PaymentProof[]>(existingProofs);
  const [dragActive, setDragActive] = useState(false);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedFileTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'text/csv': ['.csv'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  };

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`File size must be less than ${maxFileSize}MB`);
    }

    // Check file type
    if (!Object.keys(acceptedFileTypes).includes(file.type)) {
      errors.push('File type not supported. Please upload JPG, PNG, PDF, or Excel files.');
    }

    // Check file name
    if (file.name.length > 255) {
      errors.push('File name is too long');
    }

    return errors;
  };

  const extractDataFromFile = async (file: File): Promise<any> => {
    // Simulate OCR/data extraction - in production, this would call an AI service
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          amount: expectedAmount + Math.random() * 10 - 5, // Simulate slight variations
          currency,
          transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString().split('T')[0],
          bankName: 'Commercial Bank of Ethiopia',
          accountNumber: `****${  Math.random().toString().substr(2, 4)}`
        };
        resolve(mockData);
      }, 2000);
    });
  };

  const processFile = async (file: File, type: PaymentProof['type'] = 'receipt'): Promise<PaymentProof> => {
    const proofId = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const validationErrors = validateFile(file);

    const proof: PaymentProof = {
      id: proofId,
      file,
      type,
      status: validationErrors.length > 0 ? 'failed' : 'uploading',
      uploadProgress: 0,
      validationErrors,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    };

    if (validationErrors.length > 0) {
      return proof;
    }

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProofs(prev => prev.map(p => 
        p.id === proofId 
          ? { ...p, uploadProgress: Math.min(p.uploadProgress + 10, 90) }
          : p
      ));
    }, 200);

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(uploadInterval);
      
      // Update to processing status
      setProofs(prev => prev.map(p => 
        p.id === proofId 
          ? { ...p, status: 'processing', uploadProgress: 100 }
          : p
      ));

      // Extract data from file
      const extractedData = await extractDataFromFile(file);
      
      // Final update
      const completedProof: PaymentProof = {
        ...proof,
        status: 'completed',
        uploadProgress: 100,
        extractedData
      };

      onDataExtracted(extractedData);
      
      return completedProof;
    } catch (error) {
      clearInterval(uploadInterval);
      return {
        ...proof,
        status: 'failed',
        validationErrors: [...validationErrors, 'Upload failed. Please try again.']
      };
    }
  };

  const handleFiles = async (files: FileList) => {
    if (proofs.length + files.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `You can only upload up to ${maxFiles} files.`,
        variant: "destructive"
      });
      return;
    }

    const newProofs: PaymentProof[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const proof = await processFile(file);
      newProofs.push(proof);
    }

    setProofs(prev => {
      const updated = [...prev, ...newProofs];
      onProofUploaded(updated);
      return updated;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [proofs.length]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeProof = (proofId: string) => {
    setProofs(prev => {
      const updated = prev.filter(p => p.id !== proofId);
      onProofUploaded(updated);
      return updated;
    });
  };

  const retryUpload = async (proofId: string) => {
    const proof = proofs.find(p => p.id === proofId);
    if (!proof) return;

    const updatedProof = await processFile(proof.file, proof.type);
    setProofs(prev => prev.map(p => p.id === proofId ? updatedProof : p));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getStatusIcon = (status: PaymentProof['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'uploading':
      case 'processing':
        return <RotateCw className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Proof of Payment</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload receipts, screenshots, or bank statements to verify your payment of {currency} {expectedAmount.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              proofs.length >= maxFiles && "opacity-50 pointer-events-none"
            )}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {dragActive ? "Drop files here" : "Upload Payment Proof"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="outline">JPG, PNG, PDF</Badge>
              <Badge variant="outline">Max {maxFileSize}MB</Badge>
              <Badge variant="outline">Up to {maxFiles} files</Badge>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={proofs.length >= maxFiles}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.keys(acceptedFileTypes).join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {proofs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({proofs.length}/{maxFiles})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proofs.map((proof) => (
                <div key={proof.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(proof.file)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{proof.file.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(proof.file.size)}</span>
                          <Badge variant="outline" className="text-xs">
                            {proof.type}
                          </Badge>
                          {getStatusIcon(proof.status)}
                          <span className="capitalize">{proof.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {proof.preview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProof(proof);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {proof.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryUpload(proof.id)}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProof(proof.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {(proof.status === 'uploading' || proof.status === 'processing') && (
                    <div className="space-y-2">
                      <Progress value={proof.uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {proof.status === 'uploading' ? 'Uploading...' : 'Processing and extracting data...'}
                      </p>
                    </div>
                  )}

                  {/* Validation Errors */}
                  {proof.validationErrors.length > 0 && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {proof.validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Extracted Data */}
                  {proof.extractedData && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">
                        <Scan className="h-4 w-4 inline mr-1" />
                        Extracted Information
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {proof.extractedData.amount && (
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-2 font-medium">
                              {proof.extractedData.currency} {proof.extractedData.amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {proof.extractedData.transactionId && (
                          <div>
                            <span className="text-muted-foreground">Transaction ID:</span>
                            <span className="ml-2 font-mono text-xs">{proof.extractedData.transactionId}</span>
                          </div>
                        )}
                        {proof.extractedData.date && (
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2">{proof.extractedData.date}</span>
                          </div>
                        )}
                        {proof.extractedData.bankName && (
                          <div>
                            <span className="text-muted-foreground">Bank:</span>
                            <span className="ml-2">{proof.extractedData.bankName}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Amount Verification */}
                      {proof.extractedData.amount && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          {Math.abs(proof.extractedData.amount - expectedAmount) < 1 ? (
                            <div className="flex items-center text-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">Amount matches expected payment</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-700">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                Amount differs from expected ({currency} {expectedAmount.toLocaleString()})
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentNotes">Payment Notes</Label>
              <Textarea
                id="paymentNotes"
                placeholder="Add any additional information about your payment (optional)"
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="confirmAccuracy" className="rounded" />
              <Label htmlFor="confirmAccuracy" className="text-sm">
                I confirm that the uploaded documents are accurate and belong to this payment
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {proofs.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{proofs.filter(p => p.status === 'completed').length} of {proofs.length}</strong> files uploaded successfully.
            {proofs.some(p => p.status === 'failed') && (
              <span className="text-red-600 ml-2">
                {proofs.filter(p => p.status === 'failed').length} files failed to upload.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProofOfPaymentUpload;
