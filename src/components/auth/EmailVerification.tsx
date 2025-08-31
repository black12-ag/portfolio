import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  Send,
  Shield,
  Smartphone
} from 'lucide-react';
import { emailVerificationService, EmailVerificationResult } from '@/services/auth/emailVerificationService';

export interface EmailVerificationProps {
  email: string;
  isOpen: boolean;
  onVerificationComplete: () => void;
  onResendEmail: () => void;
  onClose: () => void;
  autoVerify?: boolean; // Auto-verify from URL token
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  isOpen,
  onVerificationComplete,
  onResendEmail,
  onClose,
  autoVerify = false
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // State management
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'checking' | 'verified' | 'failed'>('pending');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);

  // Auto-refresh verification status
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Check verification status
  const checkVerificationStatus = useCallback(async () => {
    if (!email) return;

    setVerificationStatus('checking');
    try {
      const isVerified = await emailVerificationService.checkVerificationStatus(email);
      
      if (isVerified) {
        setVerificationStatus('verified');
        setProgress(100);
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        // Call completion callback after brief delay to show success state
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      } else {
        setVerificationStatus('pending');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus('failed');
      setError('Failed to check verification status');
    }
  }, [email, onVerificationComplete, checkInterval]);

  // Auto-verify from URL token
  const autoVerifyFromUrl = useCallback(async () => {
    const token = emailVerificationService.extractTokenFromUrl();
    if (!token) return;

    setVerificationStatus('checking');
    setProgress(50);

    try {
      const result = await emailVerificationService.verifyEmailToken(token);
      
      if (result.success) {
        setVerificationStatus('verified');
        setProgress(100);
        setTimeout(() => {
          onVerificationComplete();
        }, 1500);
      } else {
        setVerificationStatus('failed');
        setError(result.error || 'Email verification failed');
      }
    } catch (error) {
      console.error('Auto-verification error:', error);
      setVerificationStatus('failed');
      setError('Email verification failed');
    }
  }, [onVerificationComplete]);

  // Handle resend verification email
  const handleResendEmail = async () => {
    setIsResending(true);
    setError(null);

    try {
      const result = await emailVerificationService.sendVerificationEmail(email);
      
      if (result.success) {
        setLastSentTime(new Date());
        setResendCooldown(60); // 60 seconds cooldown
        onResendEmail();
        
        // Show success message
        setTimeout(() => {
          setError(null);
        }, 3000);
      } else {
        setError(result.error || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  // Update cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendCooldown]);

  // Set up auto-refresh for verification status
  useEffect(() => {
    if (isOpen && verificationStatus === 'pending') {
      // Check immediately
      checkVerificationStatus();

      // Set up interval to check every 5 seconds
      const interval = setInterval(checkVerificationStatus, 5000);
      setCheckInterval(interval);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isOpen, verificationStatus, checkVerificationStatus]);

  // Auto-verify from URL on mount
  useEffect(() => {
    if (autoVerify && isOpen) {
      autoVerifyFromUrl();
    }
  }, [autoVerify, isOpen, autoVerifyFromUrl]);

  // Update progress based on status
  useEffect(() => {
    switch (verificationStatus) {
      case 'pending':
        setProgress(25);
        break;
      case 'checking':
        setProgress(75);
        break;
      case 'verified':
        setProgress(100);
        break;
      case 'failed':
        setProgress(0);
        break;
    }
  }, [verificationStatus]);

  // Don't render if not open
  if (!isOpen) return null;

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'checking':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Email verified successfully!';
      case 'failed':
        return 'Email verification failed';
      case 'checking':
        return 'Checking verification status...';
      default:
        return 'Verification email sent';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Email Verification
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              {getStatusIcon()}
            </div>
            <Progress 
              value={progress} 
              className="h-2"
            />
          </div>

          {/* Email Display */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Verification email sent to:
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {verificationStatus === 'pending' && (
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
            } border`}>
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-2">
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                  }`}>
                    Check your email
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Click the verification link in your email to complete the process. 
                    The link will expire in 24 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {verificationStatus === 'verified' && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your email has been successfully verified! You can now access all features.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Status */}
          {lastSentTime && (
            <div className={`text-center text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Email sent at {lastSentTime.toLocaleTimeString()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Resend Email Button */}
            {verificationStatus !== 'verified' && (
              <Button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Resend Email
                  </>
                )}
              </Button>
            )}

            {/* Manual Check Button */}
            {(verificationStatus === 'pending' || verificationStatus === 'checking') && (
              <Button
                onClick={checkVerificationStatus}
                disabled={verificationStatus === 'checking'}
                variant="outline"
                className="w-full"
              >
                {verificationStatus === 'checking' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    I've Verified My Email
                  </>
                )}
              </Button>
            )}

            {/* Close Button */}
            <Button
              onClick={onClose}
              variant={verificationStatus === 'verified' ? 'default' : 'ghost'}
              className="w-full"
            >
              {verificationStatus === 'verified' ? 'Continue' : 'Close'}
            </Button>
          </div>

          {/* Help Text */}
          <div className={`text-center text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>Didn't receive an email? Check your spam folder or contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
