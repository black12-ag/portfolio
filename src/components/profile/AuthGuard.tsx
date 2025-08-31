import React, { useCallback, Suspense, lazy, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogIn } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback || (
      <Card className="rounded-xl max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Authentication Required</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please sign in to access your profile settings
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/profile'} 
            className="w-full"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
