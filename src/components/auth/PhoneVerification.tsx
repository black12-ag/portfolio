import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Smartphone, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  Send,
  Shield,
  Phone,
  Edit,
  Volume2
} from 'lucide-react';
import { phoneVerificationService, PhoneVerificationResult, CountryCode } from '@/services/auth/phoneVerificationService';

export interface PhoneVerificationProps {
  phoneNumber: string;
  countryCode?: string;
  isOpen: boolean;
  onVerificationComplete: (verifiedPhone: string) => void;
  onChangePhone: () => void;
  onClose: () => void;
  allowPhoneEdit?: boolean;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phoneNumber: initialPhone,
  countryCode: initialCountryCode = 'US',
  isOpen,
  onVerificationComplete,
  onChangePhone,
  onClose,
  allowPhoneEdit = true
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // State management
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationStatus, setVerificationStatus] = useState<'input' | 'sent' | 'verifying' | 'verified' | 'failed'>('input');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Refs for OTP inputs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countryCodes = phoneVerificationService.getCountryCodes();

  // Format phone number for display
  const formattedPhone = phoneVerificationService.formatForDisplay(phoneNumber, countryCode);

  // Handle country code change
  const handleCountryCodeChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    setError(null);
  };

  // Handle phone number change
  const handlePhoneNumberChange = (value: string) => {
    // Allow only digits, spaces, dashes, parentheses, and plus
    const cleaned = value.replace(/[^\d\s\-\(\)\+]/g, '');
    setPhoneNumber(cleaned);
    setError(null);
  };

  // Send verification code
  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!phoneVerificationService.validatePhoneNumber(phoneNumber, countryCode)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const result = await phoneVerificationService.sendVerificationCode(phoneNumber, countryCode);
      
      if (result.success) {
        setVerificationStatus('sent');
        setProgress(50);
        setResendCooldown(60); // 60 seconds cooldown
        
        // Focus first OTP input
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(result.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError('Failed to send verification code');
    } finally {
      setIsSending(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError(null);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (value && index === 5 && newCode.every(digit => digit !== '')) {
      setTimeout(() => {
        handleVerifyCode(newCode.join(''));
      }, 100);
    }
  };

  // Handle OTP key events
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Verify code
  const handleVerifyCode = async (code?: string) => {
    const codeToVerify = code || verificationCode.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('verifying');
    setProgress(75);
    setError(null);

    try {
      const result = await phoneVerificationService.verifyPhoneCode(phoneNumber, codeToVerify);
      
      if (result.success) {
        setVerificationStatus('verified');
        setProgress(100);
        
        const verifiedPhone = phoneVerificationService.formatPhoneNumber(phoneNumber, countryCode);
        
        // Call completion callback after brief delay to show success state
        setTimeout(() => {
          onVerificationComplete(verifiedPhone);
        }, 1500);
      } else {
        setVerificationStatus('sent');
        setProgress(50);
        setError(result.error || 'Invalid verification code');
        setAttempts(prev => prev + 1);
        
        // Clear code inputs
        setVerificationCode(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Error verifying phone code:', error);
      setVerificationStatus('sent');
      setProgress(50);
      setError('Failed to verify phone number');
      setAttempts(prev => prev + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setVerificationCode(['', '', '', '', '', '']);
    setError(null);
    await handleSendCode();
  };

  // Handle voice call fallback
  const handleVoiceCall = async () => {
    try {
      const result = await phoneVerificationService.sendVerificationViaVoice(phoneNumber);
      if (!result.success) {
        setError(result.error || 'Voice verification not available');
      }
    } catch (error) {
      setError('Voice verification not available');
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

  // Update progress based on status
  useEffect(() => {
    switch (verificationStatus) {
      case 'input':
        setProgress(0);
        break;
      case 'sent':
        setProgress(50);
        break;
      case 'verifying':
        setProgress(75);
        break;
      case 'verified':
        setProgress(100);
        break;
      case 'failed':
        setProgress(25);
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
      case 'verifying':
        return 'text-blue-600';
      case 'sent':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'verifying':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'sent':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      default:
        return <Phone className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Phone verified successfully!';
      case 'failed':
        return 'Phone verification failed';
      case 'verifying':
        return 'Verifying code...';
      case 'sent':
        return 'Verification code sent';
      default:
        return 'Enter your phone number';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900">
            <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Phone Verification
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
            <Progress value={progress} className="h-2" />
          </div>

          {/* Phone Input Section */}
          {verificationStatus === 'input' && (
            <div className="space-y-4">
              {/* Country Code Selector */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Country
                </label>
                <Select value={countryCode} onValueChange={handleCountryCodeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-gray-500">{country.dialCode}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                  } text-sm font-medium`}>
                    {countryCodes.find(c => c.code === countryCode)?.dialCode}
                  </div>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phone Display for Verification */}
          {verificationStatus !== 'input' && (
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formattedPhone}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Verification code sent via SMS
                    </p>
                  </div>
                </div>
                {allowPhoneEdit && verificationStatus === 'sent' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setVerificationStatus('input');
                      setVerificationCode(['', '', '', '', '', '']);
                      onChangePhone();
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* OTP Input Section */}
          {(verificationStatus === 'sent' || verificationStatus === 'verifying') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Enter 6-digit verification code
                </label>
                <div className="flex gap-2 justify-center">
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => otpRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      disabled={isVerifying}
                    />
                  ))}
                </div>
              </div>

              {/* Resend and Voice Call Options */}
              <div className="flex gap-2">
                <Button
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isSending}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {resendCooldown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Resend SMS
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleVoiceCall}
                  variant="outline"
                  size="sm"
                  title="Get code via voice call"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {verificationStatus === 'verified' && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your phone number has been successfully verified!
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

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Send Code Button */}
            {verificationStatus === 'input' && (
              <Button
                onClick={handleSendCode}
                disabled={isSending || !phoneNumber.trim()}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>
            )}

            {/* Verify Code Button */}
            {verificationStatus === 'sent' && verificationCode.join('').length === 6 && (
              <Button
                onClick={() => handleVerifyCode()}
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Phone Number
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
              {verificationStatus === 'verified' ? 'Continue' : 'Cancel'}
            </Button>
          </div>

          {/* Help Text */}
          <div className={`text-center text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>Standard messaging rates may apply. Code expires in 5 minutes.</p>
            {attempts > 0 && (
              <p className="mt-1 text-yellow-600 dark:text-yellow-400">
                Failed attempts: {attempts}/3
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneVerification;
