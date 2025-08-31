import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess?: () => void;
}

export default function OTPVerificationModal({ 
  isOpen, 
  onClose, 
  email,
  onSuccess 
}: OTPVerificationModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { verifyOtp, sendMagicLink } = useAuth();
  const { toast } = useToast();

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(email, code.trim());
      toast({
        title: "Email Verified Successfully! 🎉",
        description: "You are now signed in to your account.",
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await sendMagicLink(email);
      toast({
        title: "New Code Sent! 📧",
        description: "Check your email for a new verification code.",
      });
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Email Verification
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              We've sent a verification code to:
            </p>
            <p className="font-medium">{email}</p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full"
              >
                Resend Code
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Didn't receive the code? Check your spam folder or click "Resend Code"
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
