/**
 * Settings Page
 * 
 * Application configuration and user preferences.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { 
  Cog6ToothIcon,
  CloudIcon,
  BellIcon,
  ServerIcon,
  SunIcon,
  GlobeAltIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  // Stable star positions for celestial background
  const [starPositions] = useState(() =>
    Array.from({ length: 15 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }))
  );

  return (
    <MainLayout title="Settings" subtitle="Application Configuration">
      <div className="relative min-h-screen bg-zinc-950 p-6 overflow-hidden">
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
                <label htmlFor="theme-select" className="flex items-center gap-2 text-sm font-medium text-cyan-400/80 mb-2">
                  <SunIcon className="h-4 w-4" />
                  Theme
                </label>
                <select 
                  id="theme-select" 
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" 
                  suppressHydrationWarning
                >
                  <option>Dark (Default)</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
              <div>
                <label htmlFor="timezone-select" className="flex items-center gap-2 text-sm font-medium text-cyan-400/80 mb-2">
                  <GlobeAltIcon className="h-4 w-4" />
                  Time Zone
                </label>
                <select 
                  id="timezone-select" 
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all" 
                  suppressHydrationWarning
                >
                  <option>UTC</option>
                  <option>Local Time</option>
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
                <label htmlFor="backend-url" className="flex items-center gap-2 text-sm font-medium text-blue-400/80 mb-2">
                  <CloudIcon className="h-4 w-4" />
                  Backend URL
                </label>
                <input
                  id="backend-url"
                  type="text"
                  value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                  readOnly
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 font-mono"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label htmlFor="refresh-interval" className="flex items-center gap-2 text-sm font-medium text-blue-400/80 mb-2">
                  <ArrowPathIcon className="h-4 w-4" />
                  Auto-refresh Interval
                </label>
                <select 
                  id="refresh-interval" 
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                  suppressHydrationWarning
                >
                  <option value="30000">30 seconds</option>
                  <option value="60000">1 minute</option>
                  <option value="300000">5 minutes</option>
                </select>
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
                  defaultChecked 
                  className="rounded border-zinc-600 bg-zinc-900 text-purple-500 focus:ring-2 focus:ring-purple-500/20 w-5 h-5" 
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
                  defaultChecked 
                  className="rounded border-zinc-600 bg-zinc-900 text-purple-500 focus:ring-2 focus:ring-purple-500/20 w-5 h-5" 
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
                  className="rounded border-zinc-600 bg-zinc-900 text-purple-500 focus:ring-2 focus:ring-purple-500/20 w-5 h-5" 
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
                <span className="text-sm text-zinc-300">NASA Horizons</span>
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
                <span className="text-sm text-zinc-300">USGS Earthquake</span>
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
                <span className="text-sm text-zinc-300">NOAA Solar</span>
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
