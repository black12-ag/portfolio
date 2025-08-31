import React, { useCallback, Suspense, lazy, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="rounded-xl border-destructive/50 bg-destructive/5">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || 'An unexpected error occurred while loading this section'}
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={resetErrorBoundary}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="default"
            size="sm"
          >
            Reload Page
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Error Details (Development)
            </summary>
            <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

interface ProfileErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export default function ProfileErrorBoundary({ 
  children, 
  fallback = ErrorFallback 
}: ProfileErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={(error, errorInfo) => {
        // Log error to monitoring service in production
        console.error('Profile Error:', error, errorInfo);
      }}
      onReset={() => {
        // Clear any error state if needed
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
