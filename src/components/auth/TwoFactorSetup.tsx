import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  QrCode, 
  Copy, 
  Download, 
  AlertTriangle,
  Check,
  RefreshCw,
  Key
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  twoFactorAuth, 
  setupTOTP, 
  sendSMSCode, 
  sendEmailCode,
  type TwoFactorSetup,
  type OTPVerificationResult 
} from '@/lib/twoFactorAuth';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export default function TwoFactorSetup({ onComplete, onClose }: TwoFactorSetupProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const supportsTOTP = twoFactorAuth.supportsTOTP();
  const [totpSetup, setTotpSetup] = useState<TwoFactorSetup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState(user?.email || '');
  const [settings, setSettings] = useState(twoFactorAuth.getUserTwoFactorSettings(user?.id || ''));
  
  // Load 2FA status
  useEffect(() => {
    if (user) {
      const userSettings = twoFactorAuth.getUserTwoFactorSettings(user.id);
      setSettings(userSettings);
    }
  }, [user]);

  const handleSetupTOTP = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const setup = await setupTOTP(user.id, user.email);
      setTotpSetup(setup);
      setActiveTab('totp-verify');
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to set up authenticator app",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!user || !totpSetup || !verificationCode) return;
    
    const isValid = twoFactorAuth.verifyTOTP(verificationCode, totpSetup.secret);
    
    if (isValid) {
      const updatedSettings = { ...settings };
      updatedSettings.methods.totp = true;
      updatedSettings.enabled = true;
      updatedSettings.totpSecret = totpSetup.secret;
      
      twoFactorAuth.saveUserTwoFactorSettings(user.id, updatedSettings);
      setSettings(updatedSettings);
      
      toast({
        title: "TOTP Enabled",
        description: "Authenticator app has been successfully configured",
      });
      
      setActiveTab('backup-codes');
    } else {
      toast({
        title: "Invalid Code",
        description: "Please check the code from your authenticator app",
        variant: "destructive"
      });
    }
  };

  const handleSetupSMS = async () => {
    if (!user || !phoneNumber) return;
    
    setIsLoading(true);
    try {
      const success = await twoFactorAuth.enableTwoFactor(user.id, 'sms', { phoneNumber });
      
      if (success) {
        const updatedSettings = { ...settings };
        updatedSettings.methods.sms = true;
        updatedSettings.enabled = true;
        updatedSettings.phoneNumber = phoneNumber;
        
        twoFactorAuth.saveUserTwoFactorSettings(user.id, updatedSettings);
        setSettings(updatedSettings);
        
        // Send test SMS
        await sendSMSCode(phoneNumber);
        
        toast({
          title: "SMS 2FA Enabled",
          description: "Test SMS sent to your phone",
        });
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to set up SMS authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupEmail = async () => {
    if (!user || !recoveryEmail) return;
    
    setIsLoading(true);
    try {
      const success = await twoFactorAuth.enableTwoFactor(user.id, 'email', { email: recoveryEmail });
      
      if (success) {
        const updatedSettings = { ...settings };
        updatedSettings.methods.email = true;
        updatedSettings.enabled = true;
        updatedSettings.recoveryEmail = recoveryEmail;
        
        twoFactorAuth.saveUserTwoFactorSettings(user.id, updatedSettings);
        setSettings(updatedSettings);
        
        // Send test email
        await sendEmailCode(recoveryEmail);
        
        toast({
          title: "Email 2FA Enabled",
          description: "Test verification code sent to your email",
        });
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to set up email authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = () => {
    if (!user) return;
    
    twoFactorAuth.disableTwoFactor(user.id);
    setSettings(twoFactorAuth.getUserTwoFactorSettings(user.id));
    
    toast({
      title: "2FA Disabled",
      description: "Two-factor authentication has been disabled",
      variant: "destructive"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    if (!totpSetup) return;
    
    const codesText = totpSetup.backupCodes.join('\n');
    const blob = new Blob([`METAH Travel - Backup Codes\n\n${codesText}\n\nKeep these codes safe!`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metah-travel-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Two-Factor Authentication
        </CardTitle>
        <p className="text-muted-foreground">
          Add an extra layer of security to your account
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {supportsTOTP && <TabsTrigger value="totp">Authenticator</TabsTrigger>}
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {settings.enabled 
                    ? "Two-factor authentication is enabled and protecting your account."
                    : "Two-factor authentication is not enabled. Your account is less secure."
                  }
                </AlertDescription>
              </Alert>

              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Two-Factor Authentication</span>
                    <Badge variant={settings.enabled ? "default" : "secondary"}>
                      {settings.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  {settings.enabled && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-medium">Active Methods:</h4>
                        {settings.methods.totp && (
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span>Authenticator App</span>
                            <Badge variant="outline">Active</Badge>
                          </div>
                        )}
                        {settings.methods.sms && (
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span>SMS ({settings.phoneNumber})</span>
                            <Badge variant="outline">Active</Badge>
                          </div>
                        )}
                        {settings.methods.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>Email ({settings.recoveryEmail})</span>
                            <Badge variant="outline">Active</Badge>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {settings.enabled && (
                    <>
                      <Separator />
                      <Button 
                        variant="destructive" 
                        onClick={handleDisable2FA}
                        className="w-full"
                      >
                        Disable Two-Factor Authentication
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Setup Options */}
              {!settings.enabled && (
                <div className="grid md:grid-cols-3 gap-4">
                  {supportsTOTP && (
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('totp')}>
                      <CardContent className="p-6 text-center">
                        <Smartphone className="h-8 w-8 mx-auto mb-4 text-primary" />
                        <h3 className="font-medium mb-2">Authenticator App</h3>
                        <p className="text-sm text-muted-foreground">
                          Use Google Authenticator or similar app
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                        onClick={() => setActiveTab('sms')}>
                    <CardContent className="p-6 text-center">
                      <Smartphone className="h-8 w-8 mx-auto mb-4 text-primary" />
                      <h3 className="font-medium mb-2">SMS</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive codes via text message
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                        onClick={() => setActiveTab('email')}>
                    <CardContent className="p-6 text-center">
                      <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
                      <h3 className="font-medium mb-2">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive codes via email
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="totp" className="space-y-6">
            {!totpSetup ? (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Set Up Authenticator App</h3>
                <p className="text-muted-foreground">
                  Use Google Authenticator, Authy, or another TOTP app
                </p>
                <Button onClick={handleSetupTOTP} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
                  Generate QR Code
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Scan the QR code with your authenticator app, then enter a verification code below.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center space-y-4">
                    <h4 className="font-medium">1. Scan QR Code</h4>
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <QRCode value={totpSetup.qrCodeUrl} size={200} />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Or enter manually:</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={totpSetup.manualEntryKey} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(totpSetup.manualEntryKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">2. Enter Verification Code</h4>
                    <div className="space-y-2">
                      <Label>6-digit code from your app</Label>
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleVerifyTOTP} 
                      disabled={verificationCode.length !== 6}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Verify & Enable
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="totp-verify" className="space-y-6">
            {/* This content is handled above in the totp tab */}
          </TabsContent>

          <TabsContent value="backup-codes" className="space-y-6">
            {totpSetup && (
              <div className="space-y-4">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    Save these backup codes. You can use them to access your account if you lose your authenticator app.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Backup Codes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {totpSetup.backupCodes.map((code, index) => (
                        <div key={index} className="p-2 bg-muted rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(totpSetup.backupCodes.join('\n'))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={downloadBackupCodes}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={onComplete} className="w-full">
                  Complete Setup
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sms" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Set Up SMS Authentication</h3>
              <p className="text-muted-foreground">
                Receive verification codes via text message
              </p>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+251911234567"
                  type="tel"
                />
              </div>

              <Button 
                onClick={handleSetupSMS} 
                disabled={!phoneNumber || isLoading}
                className="w-full"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Smartphone className="h-4 w-4 mr-2" />}
                Enable SMS Authentication
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Set Up Email Authentication</h3>
              <p className="text-muted-foreground">
                Receive verification codes via email
              </p>

              <div className="space-y-2">
                <Label>Recovery Email</Label>
                <Input
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  type="email"
                />
              </div>

              <Button 
                onClick={handleSetupEmail} 
                disabled={!recoveryEmail || isLoading}
                className="w-full"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                Enable Email Authentication
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {onClose && (
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
