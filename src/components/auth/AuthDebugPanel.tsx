import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Mail, CheckCircle, XCircle, Clock, Info } from 'lucide-react';

export default function AuthDebugPanel() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshSession = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      setSessionInfo(data);
      if (import.meta.env.VITE_VERBOSE_LOGS === 'true') console.debug('Auth session:', data);
    } catch (error) {
      if (import.meta.env.VITE_VERBOSE_LOGS === 'true') console.warn('Session refresh error:', error as Error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const getVerificationStatus = () => {
    if (!sessionInfo?.session?.user) return null;
    
    const emailConfirmed = sessionInfo.session.user.email_confirmed_at;
    const phoneConfirmed = sessionInfo.session.user.phone_confirmed_at;
    
    return {
      email: emailConfirmed ? 'verified' : 'pending',
      phone: phoneConfirmed ? 'verified' : 'unverified',
      emailConfirmedAt: emailConfirmed,
      phoneConfirmedAt: phoneConfirmed
    };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      <Card className="w-full border-2 border-dashed border-orange-200 bg-orange-50/90 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-orange-800">
              🔍 Auth Debug Panel
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSession}
              disabled={refreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CardDescription className="text-xs text-orange-600">
            Development mode only
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3 pt-0">
          {/* Authentication Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-orange-700">Auth Status:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"} className="text-xs">
                {isLoading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
            </div>
            
            {user && (
              <div className="text-xs text-orange-600">
                <div>Email: {user.email}</div>
                <div>Name: {user.firstName} {user.lastName}</div>
                <div className="flex items-center gap-1">
                  <span>Verified:</span>
                  {user.isVerified ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-orange-200" />

          {/* Session Information */}
          {sessionInfo?.session ? (
            <div className="space-y-2">
              <div className="text-xs font-medium text-orange-700">Session Info:</div>
              <div className="text-xs text-orange-600 space-y-1">
                <div>User ID: {sessionInfo.session.user.id?.substring(0, 8)}...</div>
                <div>Email: {sessionInfo.session.user.email}</div>
                
                {verificationStatus && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>Email Status:</span>
                      <Badge 
                        variant={verificationStatus.email === 'verified' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {verificationStatus.email}
                      </Badge>
                    </div>
                    
                    {verificationStatus.email === 'pending' && (
                      <Alert className="border-amber-200 bg-amber-50">
                        <Info className="h-3 w-3" />
                        <AlertDescription className="text-xs text-amber-800">
                          <strong>Email verification required!</strong><br />
                          Check your inbox for a verification email from Supabase.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-orange-600">
              No active session found
            </div>
          )}

          <Separator className="bg-orange-200" />

          {/* Quick Actions */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-orange-700">Quick Actions:</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              >
                Supabase
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => console.log('Session:', sessionInfo, 'User:', user)}
              >
                Log Data
              </Button>
            </div>
          </div>

          {/* Registration Guidance */}
          {!isAuthenticated && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-3 w-3" />
              <AlertDescription className="text-xs text-blue-800">
                <strong>New Registration?</strong><br />
                1. Register with email<br />
                2. Check email for verification link<br />
                3. Click link to verify<br />
                4. Then login normally
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
