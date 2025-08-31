import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ApiStatusProps {
  className?: string;
}

export default function ApiStatus({ className }: ApiStatusProps) {
  const { user, isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const [apiKey, setApiKey] = useState<string | undefined>();
  const [enabledInDev, setEnabledInDev] = useState<boolean>(false);
  const [isDev, setIsDev] = useState<boolean>(false);
  
  // Only show to super admin (user with email containing 'superadmin' or specific super admin email)
  const isSuperAdmin = isAuthenticated && user?.email && (
    user.email.includes('superadmin') || 
    user.email === 'superadmin@metah.com' ||
    user.email === 'admin@metah.com'
  );
  
  useEffect(() => {
    const isProd = (import.meta.env.VITE_LITEAPI_ENV || (import.meta.env.DEV ? 'sandbox' : 'production')) === 'production';
    const envKey = isProd ? import.meta.env.VITE_LITEAPI_PROD_KEY : import.meta.env.VITE_LITEAPI_SANDBOX_KEY;
    setApiKey(envKey);
    setEnabledInDev(import.meta.env.VITE_ENABLE_LITEAPI_DEV !== 'false');
    setIsDev(import.meta.env.DEV === true);
  }, []);

  // Don't render for non-super-admin users
  if (!isSuperAdmin) {
    return null;
  }

  if (!show) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`fixed bottom-4 right-4 z-50 ${className}`}
        onClick={() => setShow(true)}
      >
        <Info className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Alert className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4" />
            <span className="font-semibold">API Status</span>
          </div>
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Development Mode:</span>
                <Badge variant={isDev ? "secondary" : "default"} className="ml-2">
                  {isDev ? (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Development
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Production
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">LiteAPI Status:</span>
                <Badge variant={
                  !isDev || enabledInDev ? 
                    (apiKey ? "default" : "secondary") : 
                    "outline"
                } className="ml-2">
                  {!isDev || enabledInDev ? (
                    apiKey ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        No Key
                      </>
                    )
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Disabled
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Fallback Data:</span>
                <Badge variant="outline" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              
              {isDev && !enabledInDev && (
                <div className="text-xs text-muted-foreground mt-2">
                  LiteAPI disabled in dev.<br />
                  Set VITE_ENABLE_LITEAPI_DEV=true to enable.
                </div>
              )}
              
              {isDev && enabledInDev && apiKey?.startsWith('sand_') && (
                <div className="text-xs text-muted-foreground mt-2">
                  Using LiteAPI Sandbox environment.<br />
                  Real hotel data from sandbox API.
                </div>
              )}
              
              {isDev && enabledInDev && !apiKey && (
                <div className="text-xs text-muted-foreground mt-2">
                  Add VITE_LITEAPI_PRIVATE_KEY to .env for live hotel data
                </div>
              )}
            </div>
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={() => setShow(false)}
        >
          ×
        </Button>
      </div>
    </Alert>
  );
}
