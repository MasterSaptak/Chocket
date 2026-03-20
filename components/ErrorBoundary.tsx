'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-display font-bold text-primary mb-2">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 p-4 bg-muted rounded-xl text-left overflow-auto max-w-2xl w-full text-xs font-mono">
              <p className="font-bold text-destructive mb-2">{this.state.error.message}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
