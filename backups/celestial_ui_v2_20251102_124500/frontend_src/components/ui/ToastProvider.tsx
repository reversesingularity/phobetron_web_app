/**
 * Toast Notification Setup
 * 
 * Provides toast notifications for the application.
 * Used for success messages, errors, and real-time event alerts.
 */

'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#18181b', // zinc-900
          color: '#fff',
          border: '1px solid #27272a', // zinc-800
        },
        // Success
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981', // green-500
            secondary: '#fff',
          },
        },
        // Error
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: '#fff',
          },
        },
        // Loading
        loading: {
          iconTheme: {
            primary: '#3b82f6', // blue-500
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
