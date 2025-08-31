import React, { Component, ErrorInfo, ReactNode, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate a unique error ID for tracking
    const eventId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details
    console.group(`🚨 Error Boundary: ${this.props.context || 'Unknown Context'}`);
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Info:', errorInfo);
    console.groupEnd();

    // In production, you would send this to your error reporting service
    this.reportError(error, errorInfo, eventId, this.props.context);
  }

  private reportError = async (
    error: Error,
    errorInfo: ErrorInfo,
    eventId: string,
    context?: string
  ) => {
    try {
      // In production, replace this with your error reporting service
      // e.g., Sentry, Bugsnag, or custom endpoint
      const errorReport = {
        id: eventId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        context,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      // For now, just log to console. In production, send to your error service:
      // await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
      
      console.log('Error Report Generated:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportIssue = () => {
    const subject = encodeURIComponent(`Bug Report: ${this.state.error?.message || 'Error'}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.eventId}
Context: ${this.props.context || 'Unknown'}
Error: ${this.state.error?.message || 'Unknown error'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:


    `);
    
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component', context } = this.props;
      const { error, eventId } = this.state;

      // Different UI based on error level
      if (level === 'page') {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">
                  Oops! Something went wrong
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  We're sorry, but there was an error loading this page.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Error Details</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Context:</strong> {context || 'Page level'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Error:</strong> {error?.message || 'Unknown error'}
                  </p>
                  {eventId && (
                    <p className="text-sm text-gray-600">
                      <strong>Error ID:</strong> {eventId}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={this.handleReload} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                  <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                  <Button onClick={this.handleReportIssue} variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      if (level === 'section') {
        return (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-900">Section Error</h4>
                  <p className="text-sm text-red-700">
                    This section couldn't be loaded properly.
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-red-600 mb-4">
                {context && <span className="font-medium">Context: {context}</span>}
                {eventId && <span className="block">ID: {eventId}</span>}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={this.handleRetry} variant="outline">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
                <Button size="sm" onClick={this.handleReportIssue} variant="outline">
                  Report
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Component level (minimal UI)
      return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 my-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">Component error</span>
              {context && (
                <span className="text-xs text-red-600">({context})</span>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={this.handleRetry}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different parts of the app
export const PageErrorBoundary: React.FC<{ children: ReactNode; context?: string }> = ({ 
  children, 
  context 
}) => (
  <ErrorBoundary level="page" context={context}>
    {children}
  </ErrorBoundary>
);

export const SectionErrorBoundary: React.FC<{ children: ReactNode; context?: string }> = ({ 
  children, 
  context 
}) => (
  <ErrorBoundary level="section" context={context}>
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode; context?: string }> = ({ 
  children, 
  context 
}) => (
  <ErrorBoundary level="component" context={context}>
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
