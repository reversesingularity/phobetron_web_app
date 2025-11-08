/**
 * Global Error Boundary
 * Catches errors from Chrome extensions and other runtime errors
 */

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if error is from a Chrome extension
    const isExtensionError = 
      error.stack?.includes('chrome-extension://') ||
      error.message?.includes('extension') ||
      error.message?.includes('abandonment');

    // Don't show error UI for extension errors
    if (isExtensionError) {
      console.warn('Chrome extension error intercepted (non-critical):', error.message);
      return { hasError: false, error: null };
    }

    // Show error UI for real application errors
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Check if error is from a Chrome extension
    const isExtensionError = 
      error.stack?.includes('chrome-extension://') ||
      error.message?.includes('extension') ||
      error.message?.includes('abandonment');

    if (isExtensionError) {
      console.warn('Chrome extension error caught (suppressed):', {
        message: error.message,
        stack: error.stack?.split('\n')[0]
      });
      return;
    }

    // Log real application errors
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Something went wrong
            </h2>
            <p className="text-zinc-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for uncaught promise rejections and errors
if (typeof window !== 'undefined') {
  // Suppress Chrome extension errors globally
  const originalError = window.console.error;
  window.console.error = (...args: any[]) => {
    const errorString = args.join(' ');
    if (
      errorString.includes('chrome-extension://') ||
      errorString.includes('abandonment.js') ||
      errorString.includes('Cannot read properties of undefined')
    ) {
      // Silently ignore extension errors
      return;
    }
    originalError.apply(console, args);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (
      error?.stack?.includes('chrome-extension://') ||
      error?.message?.includes('extension')
    ) {
      event.preventDefault();
      console.warn('Chrome extension promise rejection suppressed');
    }
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    if (
      event.filename?.includes('chrome-extension://') ||
      event.message?.includes('abandonment')
    ) {
      event.preventDefault();
      console.warn('Chrome extension error suppressed');
    }
  });
}
