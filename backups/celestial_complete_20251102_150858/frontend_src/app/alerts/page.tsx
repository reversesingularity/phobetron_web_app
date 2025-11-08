/**
 * Alerts Page
 * 
 * Display and manage real-time alerts from data triggers.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { useAlerts } from '@/lib/hooks/useAlerts';
import { 
  BellAlertIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export default function AlertsPage() {
  const { alerts, activeAlerts, loading, error } = useAlerts({ status: 'ACTIVE', autoRefresh: true });
  
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
    <MainLayout title="Alerts" subtitle="Real-time Monitoring & Notifications">
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
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-linear-to-br from-red-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-linear-to-tr from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10">
          {/* Summary Cards */}
          <motion.div 
            className="mb-8 grid gap-4 md:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
          <motion.div 
            className="rounded-xl border border-red-500/30 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl shadow-lg"
            whileHover={{ scale: 1.02, translateY: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                <BellAlertIcon className="h-6 w-6 text-red-400" />
              </div>
              <p className="text-sm font-medium text-red-400/80">Active Alerts</p>
            </div>
            <p className="text-4xl font-bold text-red-400 tracking-tight">
              {loading ? '...' : activeAlerts}
            </p>
          </motion.div>

          <motion.div 
            className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl shadow-lg"
            whileHover={{ scale: 1.02, translateY: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ transitionDelay: '0.1s' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                <ExclamationTriangleIcon className="h-6 w-6 text-cyan-400" />
              </div>
              <p className="text-sm font-medium text-cyan-400/80">Total Alerts</p>
            </div>
            <p className="text-4xl font-bold text-cyan-50 tracking-tight">
              {loading ? '...' : alerts.length}
            </p>
          </motion.div>

          <motion.div 
            className="rounded-xl border border-green-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl shadow-lg"
            whileHover={{ scale: 1.02, translateY: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                <ShieldCheckIcon className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm font-medium text-green-400/80">Status</p>
            </div>
            <p className="text-2xl font-semibold text-green-400 tracking-tight">
              {loading ? 'Loading...' : 'Monitoring'}
            </p>
          </motion.div>
        </motion.div>

          {/* Alerts List */}
          <motion.div 
            className="rounded-xl border border-cyan-500/20 bg-linear-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
          <div className="border-b border-cyan-500/20 p-6">
            <div className="flex items-center gap-3">
              <BellAlertIcon className="h-6 w-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Active Alerts
                </h2>
                <p className="text-sm text-cyan-400/70 flex items-center gap-2 mt-1">
                  <ClockIcon className="h-4 w-4" />
                  Auto-refreshing every 30 seconds
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <motion.div 
                className="rounded-lg border border-red-500/30 bg-red-950/30 p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <p className="text-sm text-red-400">Error loading alerts: {error.message}</p>
                </div>
              </motion.div>
            )}

            {loading && !alerts.length && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-cyan-500" />
                  <p className="mt-4 text-sm text-cyan-300">Loading alerts...</p>
                </div>
              </div>
            )}

            {!loading && !error && alerts.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mx-auto mb-4 p-4 rounded-full bg-green-500/20 border border-green-500/30 w-fit">
                    <CheckCircleIcon className="h-12 w-12 text-green-400" />
                  </div>
                  <p className="text-xl font-semibold text-cyan-50">No active alerts</p>
                  <p className="mt-2 text-sm text-zinc-400">All systems operational</p>
                </motion.div>
              </div>
            )}

            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    className="rounded-lg border border-zinc-700/50 bg-zinc-950/80 p-5 hover:border-cyan-500/30 hover:bg-zinc-900/80 transition-all"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-2 mt-1">
                          <motion.div 
                            className={`h-3 w-3 rounded-full ${
                              alert.severity === 'CRITICAL' ? 'bg-red-500' :
                              alert.severity === 'HIGH' ? 'bg-orange-500' :
                              alert.severity === 'MEDIUM' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}
                            animate={{
                              scale: alert.severity === 'CRITICAL' ? [1, 1.2, 1] : 1,
                              opacity: alert.severity === 'CRITICAL' ? [1, 0.5, 1] : 1,
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: alert.severity === 'CRITICAL' ? Infinity : 0,
                              ease: 'easeInOut',
                            }}
                          />
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            alert.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-cyan-50">{alert.title}</h3>
                          <p className="mt-1 text-sm font-medium text-cyan-400/80">{alert.alert_type}</p>
                          {alert.description && (
                            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{alert.description}</p>
                          )}
                          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <span className="text-cyan-400">Status:</span> {alert.status}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {new Date(alert.triggered_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
