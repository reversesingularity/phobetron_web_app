/**
 * Celestial Signs - Enhanced Dashboard (2025 Design)
 * 
 * Modern UI featuring:
 * - Dynamic Minimalism with neumorphic depth
 * - Bold typography with smooth gradients
 * - Micro-animations and hover effects
 * - Dark mode with high-contrast elements
 * - Catalyst UI components
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api from '@/lib/api/client';
import { useAlerts, useEarthquakes, useCorrelations } from '@/lib/hooks';
import { MainLayout } from '@/components/layout';
import { Badge } from '@/components/catalyst/badge';
import { Button } from '@/components/catalyst/button';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { Divider } from '@/components/catalyst/divider';
import Link from 'next/link';

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function DashboardV2() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { activeAlerts, loading: alertsLoading } = useAlerts({ status: 'ACTIVE' });
  const { earthquakes, loading: eqLoading, totalCount: eqCount } = useEarthquakes({ minMagnitude: 4.0 });
  const { highConfidenceCount, loading: corrLoading } = useCorrelations({ minConfidence: 0.7 });

  useEffect(() => {
    api.health.check()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }, []);

  return (
    <MainLayout title="Dashboard" subtitle="Real-time Celestial & Seismic Intelligence">
      <div className="p-6 lg:p-8">
        {/* Hero Section with Bold Typography */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <Heading level={1} className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-4xl font-black tracking-tight text-transparent lg:text-5xl">
            Watchman Command Center
          </Heading>
          <Text className="mt-2 text-lg text-zinc-400">
            Monitoring celestial-terrestrial correlations in real-time
          </Text>
        </motion.div>

        {/* KPI Cards Grid - Neumorphic Design */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Active Alerts Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-red-500/50 hover:shadow-red-500/20"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-500/10 p-3 ring-1 ring-red-500/20 group-hover:ring-red-500/40 transition-all">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <Badge color="red">LIVE</Badge>
              </div>
              <div className="mt-4">
                <Text className="text-sm font-medium text-zinc-400">Active Alerts</Text>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-white">
                    {alertsLoading ? '...' : activeAlerts}
                  </span>
                  <span className="text-sm text-zinc-500">current</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <Text className="text-xs text-zinc-500">Monitoring active</Text>
              </div>
            </div>
          </motion.div>

          {/* API Status Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xl backdrop-blur-xl transition-all ${
              apiStatus === 'connected'
                ? 'border-zinc-800/50 from-zinc-900/90 to-zinc-950/90 hover:border-green-500/50 hover:shadow-green-500/20'
                : apiStatus === 'error'
                ? 'border-red-800/50 from-red-900/20 to-zinc-950/90 hover:border-red-500/50'
                : 'border-zinc-800/50 from-zinc-900/90 to-zinc-950/90 hover:border-yellow-500/50'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100 ${
              apiStatus === 'connected' ? 'from-green-500/5' : apiStatus === 'error' ? 'from-red-500/5' : 'from-yellow-500/5'
            }`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ring-1 transition-all ${
                  apiStatus === 'connected'
                    ? 'bg-green-500/10 ring-green-500/20 group-hover:ring-green-500/40'
                    : apiStatus === 'error'
                    ? 'bg-red-500/10 ring-red-500/20 group-hover:ring-red-500/40'
                    : 'bg-yellow-500/10 ring-yellow-500/20 group-hover:ring-yellow-500/40'
                }`}>
                  <svg className={`h-6 w-6 ${
                    apiStatus === 'connected' ? 'text-green-400' : apiStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {apiStatus === 'connected' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <Badge color={apiStatus === 'connected' ? 'green' : apiStatus === 'error' ? 'red' : 'yellow'}>
                  {apiStatus === 'connected' ? 'HEALTHY' : apiStatus === 'error' ? 'OFFLINE' : 'CHECKING'}
                </Badge>
              </div>
              <div className="mt-4">
                <Text className="text-sm font-medium text-zinc-400">System Status</Text>
                <div className="mt-2">
                  <span className="text-2xl font-black tracking-tight text-white">
                    {apiStatus === 'connected' ? 'Operational' : apiStatus === 'error' ? 'Disconnected' : 'Initializing'}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Text className="text-xs text-zinc-500">Backend API • Port 8020</Text>
              </div>
            </div>
          </motion.div>

          {/* Seismic Events Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-orange-500/50 hover:shadow-orange-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-orange-500/10 p-3 ring-1 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all">
                  <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <Badge color="orange">M4.0+</Badge>
              </div>
              <div className="mt-4">
                <Text className="text-sm font-medium text-zinc-400">Seismic Events</Text>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-white">
                    {eqLoading ? '...' : eqCount}
                  </span>
                  <span className="text-sm text-zinc-500">recorded</span>
                </div>
              </div>
              <div className="mt-4">
                <Text className="text-xs text-zinc-500">Recent earthquake activity</Text>
              </div>
            </div>
          </motion.div>

          {/* Correlations Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-purple-500/50 hover:shadow-purple-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-purple-500/10 p-3 ring-1 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <Badge color="purple">AI</Badge>
              </div>
              <div className="mt-4">
                <Text className="text-sm font-medium text-zinc-400">Correlations</Text>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-white">
                    {corrLoading ? '...' : highConfidenceCount}
                  </span>
                  <span className="text-sm text-zinc-500">found</span>
                </div>
              </div>
              <div className="mt-4">
                <Text className="text-xs text-zinc-500">High confidence (≥70%)</Text>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <Divider className="my-8" />

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <Heading level={2} className="mb-4 text-2xl font-bold text-white">
            Quick Actions
          </Heading>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/solar-system">
              <Button className="w-full justify-start" color="dark/zinc">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Solar System
              </Button>
            </Link>
            <Link href="/earth-dashboard">
              <Button className="w-full justify-start" color="dark/zinc">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                </svg>
                Earth Dashboard
              </Button>
            </Link>
            <Link href="/watchmans-view">
              <Button className="w-full justify-start" color="dark/zinc">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Watchman's View
              </Button>
            </Link>
            <Link href="/prophecy-enhanced">
              <Button className="w-full justify-start" color="dark/zinc">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Prophecy Analysis
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Heading level={2} className="mb-4 text-2xl font-bold text-white">
            Recent Seismic Activity
          </Heading>
          <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 p-6 backdrop-blur-xl">
            {eqLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
              </div>
            ) : earthquakes && earthquakes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {earthquakes.slice(0, 6).map((eq, index) => (
                  <motion.div
                    key={eq.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4 backdrop-blur transition-all hover:border-orange-500/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-white">M{eq.magnitude.toFixed(1)}</span>
                          <Badge color={
                            eq.magnitude >= 6 ? 'red' :
                            eq.magnitude >= 5 ? 'orange' :
                            'yellow'
                          }>
                            {eq.magnitude >= 6 ? 'Major' : eq.magnitude >= 5 ? 'Strong' : 'Moderate'}
                          </Badge>
                        </div>
                        <Text className="mt-2 text-xs text-zinc-400">
                          {eq.location.coordinates[1].toFixed(2)}°N, {eq.location.coordinates[0].toFixed(2)}°E
                        </Text>
                        <Text className="mt-1 text-xs text-zinc-500">
                          Depth: {eq.depth}km
                        </Text>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        eq.magnitude >= 6 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                        eq.magnitude >= 5 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' :
                        'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                      }`} />
                      <Text className="text-xs text-zinc-500">
                        {new Date(eq.timestamp).toLocaleString()}
                      </Text>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Text className="text-zinc-500">No recent seismic events</Text>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
