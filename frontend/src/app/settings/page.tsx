/**
 * Settings Page
 * 
 * Application configuration and user preferences with localStorage persistence.
 * Features:
 * - Theme switching (Dark/Light/Auto) with system preference detection
 * - Timezone configuration (UTC/Local)
 * - Auto-refresh intervals
 * - Notification preferences
 * - API configuration display
 * - Data source status monitoring
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Cog6ToothIcon,
  CloudIcon,
  BellIcon,
  ServerIcon,
  SunIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface UserSettings {
  timezone: 'UTC' | 'local';
  refreshInterval: number;
  notifications: {
    alerts: boolean;
    earthquakes: boolean;
    correlations: boolean;
  };
}

const defaultSettings: UserSettings = {
  timezone: 'UTC',
  refreshInterval: 60000,
  notifications: {
    alerts: true,
    earthquakes: true,
    correlations: false,
  },
};

export default function SettingsPage() {
  const { theme, actualTheme, setTheme } = useTheme();
  
  // Persisted user settings (theme is now managed separately by ThemeContext)
  const [settings, setSettings] = useLocalStorage<UserSettings>('celestial-signs-settings', defaultSettings);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend status on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        setBackendStatus(response.ok ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkBackend();
  }, []);

  // Stable star positions for celestial background
  const [starPositions] = useState(() =>
    Array.from({ length: 15 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }))
  );

  // Show save confirmation message
  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Update individual settings
  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    showSaveMessage('Settings saved!');
  };

  const updateNotification = (
    key: keyof UserSettings['notifications'],
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
    showSaveMessage('Notification preferences saved!');
  };

  return (
    <MainLayout title="Settings" subtitle="Application Configuration">
      <div className="relative min-h-screen bg-zinc-950 p-6 overflow-hidden">
        {/* Save Confirmation Toast */}
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-lg border border-green-500/50 bg-zinc-900/95 px-4 py-3 backdrop-blur-xl shadow-lg"
          >
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">{saveMessage}</span>
          </motion.div>
        )}

        {/* Celestial Background */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Twinkling Stars */}
          {starPositions.map((star, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Nebula Clouds */}
          <motion.div
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-linear-to-br from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-linear-to-tr from-cyan-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Reset Button */}
        <div className="relative z-10 flex justify-end mb-4">
          <motion.button
            onClick={() => {
              setSettings(defaultSettings);
              showSaveMessage('Settings reset to defaults!');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className="h-5 w-5" />
            Reset to Defaults
          </motion.button>
        </div>

        <div className="relative z-10 grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <motion.div 
            className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                <Cog6ToothIcon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                General
              </h3>
            </div>
            <div className="space-y-5">
              <div>
                <label htmlFor="theme-select" className="flex items-center justify-between text-sm font-medium text-cyan-400/80 mb-2">
                  <div className="flex items-center gap-2">
                    <SunIcon className="h-4 w-4" />
                    Theme
                  </div>
                  <span className="text-xs text-zinc-500">
                    Current: {actualTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </span>
                </label>
                <select 
                  id="theme-select" 
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value as 'dark' | 'light' | 'auto');
                    showSaveMessage('Theme updated!');
                  }}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" 
                  suppressHydrationWarning
                >
                  <option value="dark">🌙 Dark Mode</option>
                  <option value="light">☀️ Light Mode</option>
                  <option value="auto">🔄 Auto (System)</option>
                </select>
                <p className="mt-2 text-xs text-zinc-500">
                  {theme === 'auto' 
                    ? 'Automatically switches based on your system preferences'
                    : `Using ${theme} mode regardless of system settings`
                  }
                </p>
              </div>
              <div>
                <label htmlFor="timezone-select" className="flex items-center gap-2 text-sm font-medium text-cyan-400/80 mb-2">
                  <GlobeAltIcon className="h-4 w-4" />
                  Time Zone
                </label>
                <select 
                  id="timezone-select" 
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value as 'UTC' | 'local')}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" 
                  suppressHydrationWarning
                >
                  <option value="UTC">UTC</option>
                  <option value="local">Local Time</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* API Settings */}
          <motion.div 
            className="rounded-xl border border-blue-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <ServerIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                API Configuration
              </h3>
            </div>
            <div className="space-y-5">
              <div>
                <label htmlFor="backend-url" className="flex items-center justify-between text-sm font-medium text-blue-400/80 mb-2">
                  <div className="flex items-center gap-2">
                    <CloudIcon className="h-4 w-4" />
                    Backend URL
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.div 
                      className={`h-2 w-2 rounded-full ${
                        backendStatus === 'online' ? 'bg-green-500' :
                        backendStatus === 'offline' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                      animate={backendStatus === 'checking' ? { opacity: [1, 0.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: backendStatus === 'checking' ? Infinity : 0 }}
                    />
                    <span className={`text-xs font-medium ${
                      backendStatus === 'online' ? 'text-green-400' :
                      backendStatus === 'offline' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {backendStatus === 'online' ? 'Connected' :
                       backendStatus === 'offline' ? 'Offline' :
                       'Checking...'}
                    </span>
                  </div>
                </label>
                <input
                  id="backend-url"
                  type="text"
                  value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020'}
                  readOnly
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 font-mono"
                  suppressHydrationWarning
                />
                <p className="mt-2 text-xs text-zinc-500">
                  FastAPI backend server endpoint (configured via environment variables)
                </p>
              </div>
              <div>
                <label htmlFor="refresh-interval" className="flex items-center gap-2 text-sm font-medium text-blue-400/80 mb-2">
                  <ArrowPathIcon className="h-4 w-4" />
                  Auto-refresh Interval
                </label>
                <select 
                  id="refresh-interval" 
                  value={settings.refreshInterval}
                  onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                  suppressHydrationWarning
                >
                  <option value="30000">⚡ 30 seconds (Fast)</option>
                  <option value="60000">✓ 1 minute (Recommended)</option>
                  <option value="300000">🔋 5 minutes (Battery Saver)</option>
                  <option value="900000">💤 15 minutes (Minimal)</option>
                </select>
                <p className="mt-2 text-xs text-zinc-500">
                  How often to refresh data from external APIs (current: {(settings.refreshInterval / 1000 / 60).toFixed(0)}min)
                </p>
              </div>
              
              {/* Current Environment Info */}
              <div className="mt-4 p-3 rounded-lg bg-blue-950/30 border border-blue-500/20">
                <p className="text-xs font-semibold text-blue-300 mb-2">Environment Info:</p>
                <div className="space-y-1 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Frontend:</span>
                    <span className="font-mono text-blue-400">Next.js 16.0.0 (Turbopack)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>React:</span>
                    <span className="font-mono text-blue-400">19.2.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Node:</span>
                    <span className="font-mono text-blue-400">{typeof window !== 'undefined' ? 'Client' : process.version || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div 
            className="rounded-xl border border-purple-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <BellIcon className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Notifications
              </h3>
            </div>
            <div className="space-y-4">
              <motion.label 
                className="flex items-center gap-3 cursor-pointer group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <input 
                  type="checkbox" 
                  checked={settings.notifications.alerts}
                  onChange={(e) => updateNotification('alerts', e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-900 text-purple-500 focus:ring-2 focus:ring-purple-500/20 w-5 h-5"
                  aria-label="Alert notifications"
                />
                <span className="text-sm text-zinc-300 group-hover:text-purple-400 transition-colors">
                  Alert notifications
                </span>
              </motion.label>
              <motion.label 
                className="flex items-center gap-3 cursor-pointer group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <input 
                  type="checkbox" 
                  checked={settings.notifications.earthquakes}
                  onChange={(e) => updateNotification('earthquakes', e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-900 text-purple-500 focus:ring-2 focus:ring-purple-500/20 w-5 h-5"
                  aria-label="Earthquake alerts"
                />
                <span className="text-sm text-zinc-300 group-hover:text-purple-400 transition-colors">
                  Earthquake alerts (M5+)
                </span>
              </motion.label>
              <motion.label 
                className="flex items-center gap-3 cursor-pointer group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <input 
                  type="checkbox" 
                  checked={settings.notifications.correlations}
                  onChange={(e) => updateNotification('correlations', e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-900 text-purple-500 focus:ring-2 focus:ring-purple-500/20 w-5 h-5"
                  aria-label="Correlation discoveries"
                />
                <span className="text-sm text-zinc-300 group-hover:text-purple-400 transition-colors">
                  Correlation discoveries
                </span>
              </motion.label>
            </div>
          </motion.div>

          {/* Data Sources */}
          <motion.div 
            className="rounded-xl border border-green-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                <CloudIcon className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                Data Sources
              </h3>
            </div>
            <div className="space-y-4">
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-700/50"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(24, 24, 27, 0.7)' }}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-300">NASA Horizons API</span>
                  <p className="text-xs text-zinc-500 mt-0.5">Celestial positions & trajectories</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="text-sm font-semibold text-green-400">Active</span>
                </div>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-700/50"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(24, 24, 27, 0.7)' }}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-300">USGS Earthquake</span>
                  <p className="text-xs text-zinc-500 mt-0.5">Real-time seismic activity (M5.0+)</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="text-sm font-semibold text-green-400">Active</span>
                </div>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-700/50"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(24, 24, 27, 0.7)' }}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-300">NOAA Space Weather</span>
                  <p className="text-xs text-zinc-500 mt-0.5">Solar activity & geomagnetic storms</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="text-sm font-semibold text-green-400">Active</span>
                </div>
              </motion.div>
              <motion.div 
                className="flex justify-between items-center p-3 rounded-lg bg-zinc-950/50 border border-zinc-700/50"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(24, 24, 27, 0.7)' }}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-300">Hebrew Calendar API</span>
                  <p className="text-xs text-zinc-500 mt-0.5">Biblical feast days & correlations</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="h-2 w-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="text-sm font-semibold text-green-400">Active</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
