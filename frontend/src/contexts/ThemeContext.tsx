'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';

type Theme = 'dark' | 'light' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'dark' | 'light'; // The resolved theme (auto becomes dark/light based on system)
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to get saved theme from localStorage
function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('celestial-signs-theme') as Theme;
  return saved || 'dark';
}

// Helper to get system preference
function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with saved theme or default
  const [theme, setThemeState] = useState<Theme>(getSavedTheme);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(getSystemTheme);

  // Calculate actual theme based on theme setting and system preference
  const actualTheme = useMemo(() => {
    return theme === 'auto' ? systemTheme : theme;
  }, [theme, systemTheme]);

  // Listen for system theme changes when theme is 'auto'
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(actualTheme);
    
    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', actualTheme === 'dark' ? '#09090b' : '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = actualTheme === 'dark' ? '#09090b' : '#ffffff';
      document.head.appendChild(meta);
    }
  }, [actualTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('celestial-signs-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
