/**
 * useLocalStorage Hook
 * 
 * Custom React hook for persisting state to localStorage with type safety.
 * Automatically syncs state changes to localStorage and handles JSON serialization.
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 * const [settings, setSettings] = useLocalStorage('settings', { notifications: true });
 */

import { useState, useEffect } from 'react';

type SetValue<T> = T | ((val: T) => T);

/**
 * Custom hook to persist state in localStorage
 * 
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns [storedValue, setValue] - Tuple similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: SetValue<T>) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook to sync localStorage across tabs/windows
 * Listens for storage events and updates state accordingly
 */
export function useSyncedLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  const [storedValue, setValue] = useLocalStorage(key, initialValue);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    // Listen for changes in other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, setValue]);

  return [storedValue, setValue];
}

/**
 * Remove an item from localStorage
 */
export function removeLocalStorageItem(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all localStorage items
 */
export function clearLocalStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
  }
}
