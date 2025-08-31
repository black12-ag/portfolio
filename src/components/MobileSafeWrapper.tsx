import React, { Component, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MobileSafeWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`MobileSafeWrapper caught error in ${this.props.componentName || 'component'}:`, error);
    console.error('Error info:', errorInfo);
    
    // On mobile, log additional debug info
    if (Capacitor.isNativePlatform()) {
      console.error('Mobile platform:', Capacitor.getPlatform());
      console.error('Stack trace:', error.stack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Component Temporarily Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {this.props.componentName} is currently experiencing issues on mobile.
            </p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
