import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  KeyRound, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  Lock,
  Zap
} from 'lucide-react';
import { passwordService, PasswordValidation } from '@/services/auth/passwordService';

export interface PasswordResetProps {
  isOpen: boolean;
  onResetComplete: () => void;
  onCancel: () => void;
  resetToken?: string; // If provided, go directly to reset form
  mode?: 'request' | 'reset'; // 'request' for email form, 'reset' for new password form
}

export const PasswordReset: React.FC<PasswordResetProps> = ({
  isOpen,
  onResetComplete,
  onCancel,
  resetToken,
  mode: initialMode = 'request'
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // State management
  const [mode, setMode] = useState<'request' | 'reset' | 'success'>(initialMode);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation | null>(null);

  // Auto-switch to reset mode if token is provided
  useEffect(() => {
    if (resetToken && mode === 'request') {
      setMode('reset');
    }
  }, [resetToken, mode]);

  // Validate password in real-time
  useEffect(() => {
    if (newPassword) {
      const validation = passwordService.validatePassword(newPassword, { email });
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [newPassword, email]);

  // Handle email submission for password reset request
  const handleRequestReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await passwordService.sendPasswordReset(email);
      
      if (result.success) {
        setMode('success');
      } else {
        setError(result.error || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setError('An error occurred while requesting password reset');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset with new password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordValidation?.isValid) {
      setError('Please choose a stronger password');
      return;
    }

    if (!resetToken) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await passwordService.resetPassword(resetToken, newPassword);
      
      if (result.success) {
        setMode('success');
        // Complete after showing success message
        setTimeout(() => {
          onResetComplete();
        }, 2000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate suggested password
  const handleGeneratePassword = () => {
    const suggested = passwordService.generateSuggestedPassword();
    setNewPassword(suggested);
    setConfirmPassword(suggested);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  // Don't render if not open
  if (!isOpen) return null;

  const getPasswordStrengthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100 dark:bg-orange-900">
            <KeyRound className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {mode === 'request' ? 'Reset Password' : 
             mode === 'reset' ? 'Set New Password' : 
             'Password Reset Successful'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Back Button for Reset Mode */}
          {mode === 'reset' && !resetToken && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('request')}
              className="w-full justify-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to email form
            </Button>
          )}

          {/* Email Request Form */}
          {mode === 'request' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
              } border`}>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
                    }`}>
                      Enter your email address
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                    }`}>
                      We'll send you a link to reset your password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your email address"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleRequestReset}
                disabled={isLoading || !email.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Password Reset Form */}
          {mode === 'reset' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              } border`}>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                    }`}>
                      Choose a strong password
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Your new password must be secure and unique.
                    </p>
                  </div>
                </div>
              </div>

              {/* New Password Input */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {passwordValidation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Password Strength</span>
                    <span className={`text-sm font-medium ${passwordService.getPasswordStrengthColor(passwordValidation.score)}`}>
                      {passwordService.getPasswordStrengthText(passwordValidation.score)}
                    </span>
                  </div>
                  <Progress 
                    value={passwordValidation.score} 
                    className="h-2"
                  />
                  {passwordValidation.feedback.length > 0 && (
                    <ul className={`text-xs space-y-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {passwordValidation.feedback.map((feedback, index) => (
                        <li key={index}>• {feedback}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Generate Password Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Generate Strong Password
              </Button>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={isLoading || !newPassword || !confirmPassword || !passwordValidation?.isValid}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Success Message */}
          {mode === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 rounded-full bg-green-100 dark:bg-green-900 w-fit">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {mode === 'success' && newPassword ? 'Password Reset Complete!' : 'Email Sent!'}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {mode === 'success' && newPassword 
                    ? 'Your password has been successfully reset. You can now sign in with your new password.'
                    : `We've sent a password reset link to ${email}. Check your email and click the link to reset your password.`
                  }
                </p>
              </div>

              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {mode === 'success' && newPassword 
                    ? 'You will be redirected to the login page shortly.'
                    : 'The reset link will expire in 1 hour for security.'
                  }
                </AlertDescription>
              </Alert>
            </div>
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
          {mode !== 'success' && (
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                variant="ghost"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}

          {mode === 'success' && !newPassword && (
            <Button
              onClick={onResetComplete}
              className="w-full"
            >
              Back to Login
            </Button>
          )}

          {/* Help Text */}
          <div className={`text-center text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {mode === 'request' && (
              <p>
                Remember your password? 
                <button
                  onClick={onCancel}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign in instead
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <p>Make sure to save your new password in a secure location.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
