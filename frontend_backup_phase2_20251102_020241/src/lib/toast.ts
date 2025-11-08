/**
 * Toast Utilities
 * 
 * Helper functions for showing toast notifications throughout the app.
 */

import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
  
  // Custom toasts for prophecy events
  prophecySaved: () => {
    toast.success('📜 Prophecy saved successfully!');
  },
  
  eventAlert: (eventName: string) => {
    toast('🌙 ' + eventName, {
      icon: '⚠️',
      duration: 6000,
      style: {
        background: '#7c3aed', // purple-600
      },
    });
  },
  
  bloodMoonAlert: (daysUntil: number) => {
    toast.error(`🌕 Blood Moon in ${daysUntil} days!`, {
      duration: 8000,
    });
  },
  
  correlationFound: (prophecy: string, event: string) => {
    toast(`🔗 Match found: ${prophecy} ↔ ${event}`, {
      icon: '✨',
      duration: 6000,
      style: {
        background: '#0891b2', // cyan-600
      },
    });
  },
};
