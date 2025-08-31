import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MagicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToOTP?: (email: string) => void;
  onSwitchToLogin?: () => void;
}

export default function MagicLinkModal({ 
  isOpen, 
  onClose, 
  onSwitchToOTP,
  onSwitchToLogin 
}: MagicLinkModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { sendMagicLink } = useAuth();
  const { toast } = useToast();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await sendMagicLink(email);
      setEmailSent(true);
      toast({
        title: "Magic Link Sent! ✨",
        description: "Check your email for a sign-in link or verification code.",
        duration: 5000,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToOTP = () => {
    if (emailSent) {
      onSwitchToOTP?.(email);
    }
  };

  if (emailSent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Check Your Email
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <Mail className="h-16 w-16 text-primary mx-auto" />
            <div>
              <h3 className="font-medium text-lg mb-2">Magic Link Sent!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We've sent a magic link and verification code to:
              </p>
              <p className="font-medium text-primary">{email}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Two ways to sign in:</strong>
              </p>
              <div className="text-left space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-primary">1.</span>
                  <span>Click the magic link in your email (instant sign-in)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-primary">2.</span>
                  <span>Enter the 6-digit verification code below</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {onSwitchToOTP && (
                <Button onClick={handleSwitchToOTP} className="w-full">
                  Enter Verification Code
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => handleSendMagicLink({ preventDefault: () => {} } as any)}
                disabled={isLoading}
                className="w-full"
              >
                Resend Email
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Sign in with Magic Link
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>
              Enter your email address and we'll send you a magic link to sign in instantly,
              plus a backup verification code.
            </p>
          </div>

          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Magic Link
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSwitchToLogin}
              className="text-sm"
            >
              Back to Regular Sign In
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
