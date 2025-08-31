import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  RefreshCw, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  twoFactorAuth, 
  sendSMSCode, 
  sendEmailCode,
  type OTPVerificationResult 
} from '@/lib/twoFactorAuth';

interface TwoFactorVerificationProps {
  userId: string;
  onVerified: (token: string) => void;
  onCancel: () => void;
  availableMethods?: string[];
}

export default function TwoFactorVerification({ 
  userId, 
  onVerified, 
  onCancel,
  availableMethods = []
}: TwoFactorVerificationProps) {
  const { toast } = useToast();
  
  const [activeMethod, setActiveMethod] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [settings] = useState(twoFactorAuth.getUserTwoFactorSettings(userId));

  // Set default method
  useEffect(() => {
    const methods = availableMethods.length > 0 ? availableMethods : twoFactorAuth.getAvailableMethods(userId);
    if (methods.length > 0) {
      // Prefer TOTP, then SMS, then Email, then backup codes
      if (methods.includes('totp')) setActiveMethod('totp');
      else if (methods.includes('sms')) setActiveMethod('sms');
      else if (methods.includes('email')) setActiveMethod('email');
      else if (methods.includes('backup')) setActiveMethod('backup');
    }
  }, [userId, availableMethods]);

  // Countdown timer for resend functionality
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendSMS = async () => {
    if (!settings.phoneNumber || countdown > 0) return;
    
    setIsLoading(true);
    try {
      const success = await sendSMSCode(settings.phoneNumber);
      if (success) {
        setCountdown(60); // 60 second cooldown
        toast({
          title: "SMS Sent",
          description: "Verification code sent to your phone",
        });
      } else {
        toast({
          title: "Failed to Send SMS",
          description: "Please try again or use another method",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send SMS verification code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!settings.recoveryEmail || countdown > 0) return;
    
    setIsLoading(true);
    try {
      const success = await sendEmailCode(settings.recoveryEmail);
      if (success) {
        setCountdown(120); // 120 second cooldown for email
        toast({
          title: "Email Sent",
          description: "Verification code sent to your email",
        });
      } else {
        toast({
          title: "Failed to Send Email",
          description: "Please try again or use another method",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email verification code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || isLoading) return;
    
    setIsLoading(true);
    setAttempts(prev => prev + 1);
    
    try {
      let result: OTPVerificationResult = { success: false, message: 'Unknown error' };
      
      switch (activeMethod) {
        case 'totp':
          if (settings.totpSecret) {
            const isValid = twoFactorAuth.verifyTOTP(verificationCode, settings.totpSecret);
            result = {
              success: isValid,
              message: isValid ? 'TOTP verified successfully' : 'Invalid authenticator code',
              token: isValid ? twoFactorAuth.generateVerificationToken() : undefined
            };
          }
          break;
          
        case 'sms':
          if (settings.phoneNumber) {
            result = twoFactorAuth.verifySMSOTP(settings.phoneNumber, verificationCode);
          }
          break;
          
        case 'email':
          if (settings.recoveryEmail) {
            result = twoFactorAuth.verifyEmailOTP(settings.recoveryEmail, verificationCode);
          }
          break;
          
        case 'backup':
          result = twoFactorAuth.verifyBackupCode(userId, verificationCode);
          break;
      }
      
      if (result.success && result.token) {
        toast({
          title: "Verification Successful",
          description: result.message,
        });
        onVerified(result.token);
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive"
        });
        
        // Clear code on failure
        setVerificationCode('');
        
        // Too many attempts protection
        if (attempts >= 4) {
          toast({
            title: "Too Many Attempts",
            description: "Please try again later or contact support",
            variant: "destructive"
          });
          setTimeout(() => onCancel(), 2000);
        }
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "An error occurred during verification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode) {
      handleVerifyCode();
    }
  };

  const availableMethods2FA = twoFactorAuth.getAvailableMethods(userId);
  const hasMultipleMethods = availableMethods2FA.length > 1;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your verification code to continue
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasMultipleMethods ? (
          <Tabs value={activeMethod} onValueChange={setActiveMethod}>
            <TabsList className="grid w-full grid-cols-3">
              {availableMethods2FA.includes('totp') && (
                <TabsTrigger value="totp">App</TabsTrigger>
              )}
              {availableMethods2FA.includes('sms') && (
                <TabsTrigger value="sms">SMS</TabsTrigger>
              )}
              {availableMethods2FA.includes('email') && (
                <TabsTrigger value="email">Email</TabsTrigger>
              )}
              {availableMethods2FA.includes('backup') && (
                <TabsTrigger value="backup">Backup</TabsTrigger>
              )}
            </TabsList>

            {/* TOTP Tab */}
            {availableMethods2FA.includes('totp') && (
              <TabsContent value="totp" className="space-y-4">
                <div className="text-center space-y-2">
                  <Smartphone className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Authenticator Code</Label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>
              </TabsContent>
            )}

            {/* SMS Tab */}
            {availableMethods2FA.includes('sms') && (
              <TabsContent value="sms" className="space-y-4">
                <div className="text-center space-y-2">
                  <Smartphone className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Code sent to {settings.phoneNumber?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>SMS Code</Label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>

                <Button 
                  variant="outline" 
                  onClick={handleSendSMS}
                  disabled={countdown > 0 || isLoading}
                  className="w-full"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend SMS'}
                </Button>
              </TabsContent>
            )}

            {/* Email Tab */}
            {availableMethods2FA.includes('email') && (
              <TabsContent value="email" className="space-y-4">
                <div className="text-center space-y-2">
                  <Mail className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Code sent to {settings.recoveryEmail?.replace(/(.{2}).*(@.*)/, '$1****$2')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Code</Label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>

                <Button 
                  variant="outline" 
                  onClick={handleSendEmail}
                  disabled={countdown > 0 || isLoading}
                  className="w-full"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
                </Button>
              </TabsContent>
            )}

            {/* Backup Codes Tab */}
            {availableMethods2FA.includes('backup') && (
              <TabsContent value="backup" className="space-y-4">
                <div className="text-center space-y-2">
                  <Key className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Enter one of your backup codes
                  </p>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Each backup code can only be used once. You have{' '}
                    {settings.backupCodes?.filter(bc => !bc.used).length || 0} codes remaining.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label>Backup Code</Label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase().slice(0, 8))}
                    placeholder="XXXXXXXX"
                    className="text-center text-lg tracking-widest"
                    maxLength={8}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          // Single method display
          <div className="space-y-4">
            {activeMethod === 'totp' && (
              <>
                <div className="text-center space-y-2">
                  <Smartphone className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Authenticator Code</Label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Verify Button */}
        <Button 
          onClick={handleVerifyCode}
          disabled={!verificationCode || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Verify Code
        </Button>

        {/* Attempts Warning */}
        {attempts > 2 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {5 - attempts} attempts remaining before account lockout
            </AlertDescription>
          </Alert>
        )}

        {/* Cancel/Back Button */}
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>

        {/* Auto-send for SMS/Email methods */}
        {activeMethod === 'sms' && countdown === 0 && (
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={handleSendSMS}
              disabled={isLoading}
              className="text-sm"
            >
              Send SMS Code
            </Button>
          </div>
        )}

        {activeMethod === 'email' && countdown === 0 && (
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={handleSendEmail}
              disabled={isLoading}
              className="text-sm"
            >
              Send Email Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
