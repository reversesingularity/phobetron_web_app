/**
 * Celestial Signs - Enhanced Dashboard (2025 Design)
 * 
 * Modern UI featuring:
 * - Celestial starfield background with nebula effects
 * - Dynamic Minimalism with neumorphic depth
 * - Bold typography with smooth gradients
 * - Micro-animations and hover effects
 * - Catalyst UI components
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api from '@/lib/api/client';
import { useAlerts, useEarthquakes, useCorrelations, useImpactRisks, useSeismos } from '@/lib/hooks';
import { MainLayout } from '@/components/layout';
import { Badge } from '@/components/catalyst/badge';
import { Button } from '@/components/catalyst/button';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { Divider } from '@/components/catalyst/divider';
import { GlassCard, GlassCardHeader, GlassCardContent, GlassCardItem, GlassCardEmpty } from '@/components/catalyst/glass-card';
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

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { activeAlerts, loading: alertsLoading } = useAlerts({ status: 'ACTIVE' });
  const { earthquakes, loading: eqLoading, totalCount: eqCount } = useEarthquakes({ minMagnitude: 4.0 });
  const { highConfidenceCount, loading: corrLoading } = useCorrelations({ minConfidence: 0.7 });
  const { impactRisks, loading: neoLoading } = useImpactRisks({ min_torino_scale: 0, limit: 6 });
  const { volcanic, hurricanes, tsunamis, loading: seismosLoading } = useSeismos({ limit: 3 });

  useEffect(() => {
    api.health.check()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }, []);

  return (
    <MainLayout title="Dashboard" subtitle="Real-time Celestial & Seismic Intelligence">
      {/* Celestial Background with Stars and Nebula - ENHANCED VISIBILITY */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Dark space background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated Starfield - MUCH BRIGHTER */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/30 via-blue-600/20 to-transparent" />
        
        {/* Twinkling Stars - LARGER AND BRIGHTER */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(3px 3px at 20% 30%, rgba(255,255,255,0.9), transparent),
                           radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.8), transparent),
                           radial-gradient(2px 2px at 50% 50%, rgba(255,255,255,0.7), transparent),
                           radial-gradient(3px 3px at 80% 10%, rgba(255,255,255,0.9), transparent),
                           radial-gradient(2px 2px at 90% 60%, rgba(255,255,255,0.8), transparent),
                           radial-gradient(2px 2px at 33% 80%, rgba(255,255,255,0.7), transparent),
                           radial-gradient(3px 3px at 15% 15%, rgba(255,255,255,0.9), transparent),
                           radial-gradient(2px 2px at 70% 40%, rgba(255,255,255,0.6), transparent),
                           radial-gradient(2px 2px at 40% 60%, rgba(255,255,255,0.7), transparent),
                           radial-gradient(3px 3px at 85% 85%, rgba(255,255,255,0.8), transparent)`,
          backgroundSize: '200px 200px, 300px 300px, 250px 250px, 350px 350px, 280px 280px, 320px 320px, 400px 400px, 180px 180px, 220px 220px, 380px 380px',
          animation: 'twinkle 8s infinite',
        }} />
        
        {/* Nebula Effects - MUCH MORE VISIBLE */}
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-blue-500/30 blur-[100px]" />
        <div className="absolute right-0 top-1/4 h-[700px] w-[700px] rounded-full bg-purple-500/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/25 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-pink-500/20 blur-[80px]" />
        
        {/* Shooting Stars - BRIGHTER */}
        <div className="absolute left-1/4 top-1/4 h-1 w-24 animate-shooting-star bg-gradient-to-r from-transparent via-white to-transparent opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '2s' }} />
        <div className="absolute right-1/3 top-1/3 h-1 w-20 animate-shooting-star bg-gradient-to-r from-transparent via-white to-transparent opacity-0 shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ animationDelay: '5s' }} />
        <div className="absolute left-1/2 top-1/2 h-1 w-28 animate-shooting-star bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-0 shadow-[0_0_10px_rgba(0,255,255,0.6)]" style={{ animationDelay: '7s' }} />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Hero Section with Bold Typography - MAXIMUM VISIBILITY */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <Heading 
            level={1} 
            className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-6xl font-black tracking-tight text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.8)] lg:text-7xl"
            style={{
              textShadow: '0 0 80px rgba(34, 211, 238, 0.5), 0 0 40px rgba(147, 51, 234, 0.5), 0 4px 20px rgba(0, 0, 0, 0.8)'
            }}
          >
            Watchman Command Center
          </Heading>
          <Text 
            className="mt-3 text-xl font-bold text-cyan-200 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
            style={{
              textShadow: '0 0 40px rgba(34, 211, 238, 0.4), 0 2px 10px rgba(0, 0, 0, 0.8)'
            }}
          >
            🌟 Monitoring celestial-terrestrial correlations in real-time
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
          <Heading 
            level={2} 
            className="mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-3xl font-bold text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
            style={{
              textShadow: '0 0 40px rgba(34, 211, 238, 0.4), 0 0 20px rgba(147, 51, 234, 0.3), 0 2px 10px rgba(0, 0, 0, 0.8)'
            }}
          >
            Quick Actions
          </Heading>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Solar System - Orange/Gold Theme */}
            <Link href="/solar-system" className="group">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl border border-orange-900/40 bg-gradient-to-br from-orange-950/40 to-zinc-950/60 p-4 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/60 hover:shadow-[0_0_30px_rgba(249,115,22,0.3),0_0_60px_rgba(249,115,22,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <Text className="font-semibold text-orange-100 group-hover:text-orange-50">Solar System</Text>
                    <Text className="text-xs text-orange-400/70">3D Celestial View</Text>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            </Link>

            {/* Earth Dashboard - Blue/Cyan Theme */}
            <Link href="/earth-dashboard" className="group">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl border border-blue-900/40 bg-gradient-to-br from-blue-950/40 to-zinc-950/60 p-4 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.3),0_0_60px_rgba(59,130,246,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                    </svg>
                  </div>
                  <div>
                    <Text className="font-semibold text-blue-100 group-hover:text-blue-50">Earth Dashboard</Text>
                    <Text className="text-xs text-blue-400/70">Seismic Activity</Text>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            </Link>

            {/* Watchman's View - Purple/Violet Theme */}
            <Link href="/watchmans-view" className="group">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl border border-purple-900/40 bg-gradient-to-br from-purple-950/40 to-zinc-950/60 p-4 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.3),0_0_60px_rgba(168,85,247,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <Text className="font-semibold text-purple-100 group-hover:text-purple-50">Watchman's View</Text>
                    <Text className="text-xs text-purple-400/70">Pattern Analysis</Text>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            </Link>

            {/* Prophecy Codex - Pink/Rose Theme */}
            <Link href="/prophecy-codex" className="group">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl border border-pink-900/40 bg-gradient-to-br from-pink-950/40 to-zinc-950/60 p-4 backdrop-blur-xl transition-all duration-300 hover:border-pink-500/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.3),0_0_60px_rgba(236,72,153,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <Text className="font-semibold text-pink-100 group-hover:text-pink-50">Prophecy Codex</Text>
                    <Text className="text-xs text-pink-400/70">Biblical Analysis</Text>
                  </div>
                </div>
                {/* Glow effect */}
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity Sections - 3 Column Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-8"
        >
          {/* Section Title */}
          <Heading 
            level={2} 
            className="mb-6 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-3xl font-bold text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
            style={{
              textShadow: '0 0 40px rgba(34, 211, 238, 0.4), 0 0 20px rgba(147, 51, 234, 0.3), 0 2px 10px rgba(0, 0, 0, 0.8)'
            }}
          >
            Watchman Intelligence
          </Heading>

          {/* 3-Column Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Column 1: Celestial Objects (Combined NEOs & Interstellar) */}
            <GlassCard variant="cyan" glow hover className="p-6">
              <GlassCardHeader>
                <Heading level={3} className="text-xl font-bold text-cyan-400">
                  ☄️ Celestial Objects
                </Heading>
                <Badge color="cyan">{impactRisks.length}</Badge>
              </GlassCardHeader>
              <Divider className="my-4" />
              
              {neoLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-cyan-500" />
                </div>
              ) : impactRisks && impactRisks.length > 0 ? (
                <GlassCardContent>
                  {impactRisks.slice(0, 3).map((obj, index) => (
                    <motion.div
                      key={obj.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassCardItem variant="cyan">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Text className="font-semibold text-cyan-300">{obj.object_name}</Text>
                            <Text className="mt-1 text-xs text-zinc-400">
                              Diameter: ~{obj.estimated_diameter_m?.toFixed(0) || 'Unknown'} m
                            </Text>
                            <Text className="text-xs text-zinc-500">
                              {obj.impact_date ? `Impact date: ${new Date(obj.impact_date).toLocaleDateString()}` : 'Monitoring'}
                            </Text>
                          </div>
                          <Badge color={obj.torino_scale >= 3 ? 'red' : obj.torino_scale >= 1 ? 'orange' : 'zinc'}>
                            T{obj.torino_scale}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                          <Text className="text-xs text-zinc-500">
                            Impact prob: {(obj.impact_probability * 100).toExponential(2)}%
                          </Text>
                        </div>
                      </GlassCardItem>
                    </motion.div>
                  ))}
                </GlassCardContent>
              ) : (
                <GlassCardEmpty
                  variant="cyan"
                  icon={
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  }
                  title="Database initializing..."
                  description="Run seed scripts to populate impact risk data"
                />
              )}
            </GlassCard>

            {/* Column 2: Recent Earthquakes */}
            <GlassCard variant="orange" glow hover className="p-6">
              <GlassCardHeader>
                <Heading level={3} className="text-xl font-bold text-orange-400">
                  🌍 Earthquakes
                </Heading>
                <Badge color="orange">{eqCount}</Badge>
              </GlassCardHeader>
              <Divider className="my-4" />
              
              {eqLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
                </div>
              ) : earthquakes && earthquakes.length > 0 ? (
                <GlassCardContent>
                  {earthquakes.slice(0, 3).map((eq, index) => (
                    <motion.div
                      key={eq.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassCardItem variant="orange">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Text className="font-semibold text-orange-300">{eq.place || 'Unknown Location'}</Text>
                            <Text className="mt-1 text-xs text-zinc-400">
                              Depth: {eq.depth_km?.toFixed(1) || 'N/A'} km
                            </Text>
                            <Text className="text-xs text-zinc-500">
                              {new Date(eq.time).toLocaleString()}
                            </Text>
                          </div>
                          <Badge color={eq.magnitude >= 6 ? 'red' : eq.magnitude >= 5 ? 'orange' : 'yellow'}>
                            M{eq.magnitude?.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            eq.magnitude >= 6 ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]' :
                            eq.magnitude >= 5 ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]' :
                            'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]'
                          }`} />
                          <Text className="text-xs text-zinc-500">
                            {eq.alert_level || 'No alert'}
                          </Text>
                        </div>
                      </GlassCardItem>
                    </motion.div>
                  ))}
                </GlassCardContent>
              ) : (
                <GlassCardEmpty
                  variant="orange"
                  icon={
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="No recent earthquakes"
                  description="Monitoring M4.0+ seismic activity"
                  details={
                    <Text className="text-xs text-orange-600/70">USGS real-time data feed</Text>
                  }
                />
              )}
            </GlassCard>

            {/* Column 3: Seismos Events (σεισμός) */}
            <GlassCard variant="red" glow hover className="p-6">
              <GlassCardHeader>
                <Heading level={3} className="text-xl font-bold text-red-400">
                  ⚡ Seismos Events
                </Heading>
                <Badge color="red">σεισμός</Badge>
              </GlassCardHeader>
              <Divider className="my-4" />
              
              {seismosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-red-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Volcanic Activity */}
                  {volcanic && volcanic.length > 0 && (
                    <div>
                      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        🌋 Volcanic (VEI ≥4)
                      </Text>
                      {volcanic.slice(0, 1).map((vol, index) => (
                        <motion.div
                          key={vol.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <GlassCardItem variant="red" hover={false}>
                            <div className="flex items-start justify-between">
                              <div>
                                <Text className="font-semibold text-red-300">{vol.volcano_name}</Text>
                                <Text className="text-xs text-zinc-400">{vol.country}</Text>
                              </div>
                              <Badge color="red">VEI {vol.vei}</Badge>
                            </div>
                            <Text className="mt-1 text-xs text-zinc-500">
                              {new Date(vol.eruption_date).toLocaleDateString()}
                            </Text>
                          </GlassCardItem>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Hurricanes */}
                  {hurricanes && hurricanes.length > 0 && (
                    <div>
                      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        🌀 Hurricanes (Cat ≥3)
                      </Text>
                      {hurricanes.slice(0, 1).map((hur, index) => (
                        <motion.div
                          key={hur.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.1 }}
                        >
                          <GlassCardItem variant="cyan" hover={false}>
                            <div className="flex items-start justify-between">
                              <div>
                                <Text className="font-semibold text-blue-300">{hur.name}</Text>
                                <Text className="text-xs text-zinc-400">{hur.basin}</Text>
                              </div>
                              <Badge color="blue">Cat {hur.category}</Badge>
                            </div>
                            <Text className="mt-1 text-xs text-zinc-500">
                              Winds: {hur.max_wind_speed} km/h
                            </Text>
                          </GlassCardItem>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Tsunamis */}
                  {tsunamis && tsunamis.length > 0 && (
                    <div>
                      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        🌊 Tsunamis (I ≥6)
                      </Text>
                      {tsunamis.slice(0, 1).map((tsu, index) => (
                        <motion.div
                          key={tsu.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <GlassCardItem variant="cyan" hover={false}>
                            <div className="flex items-start justify-between">
                              <div>
                                <Text className="font-semibold text-cyan-300">{tsu.cause}</Text>
                                <Text className="text-xs text-zinc-400">
                                  Wave: {tsu.max_wave_height?.toFixed(1) || 'N/A'} m
                                </Text>
                              </div>
                              <Badge color="cyan">I {tsu.soloviev_intensity}</Badge>
                            </div>
                            <Text className="mt-1 text-xs text-zinc-500">
                              {new Date(tsu.event_date).toLocaleDateString()}
                            </Text>
                          </GlassCardItem>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {(!volcanic || volcanic.length === 0) && (!hurricanes || hurricanes.length === 0) && (!tsunamis || tsunamis.length === 0) && (
                    <GlassCardEmpty
                      variant="red"
                      icon={
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      }
                      title="Database initializing..."
                      description={
                        <>
                          Seismos = <span className="text-red-400">σεισμός</span> (violent shaking, commotion)
                        </>
                      }
                      details={
                        <>
                          <Text className="text-xs text-zinc-600">
                            "...earthquakes, famines and pestilences..." - Luke 21:11
                          </Text>
                          <div className="mt-3 space-y-1 text-xs text-zinc-700">
                            <div>🌋 Volcanic: VEI ≥4 eruptions</div>
                            <div>🌀 Hurricanes: Category ≥3 storms</div>
                            <div>🌊 Tsunamis: Soloviev Intensity ≥6</div>
                          </div>
                        </>
                      }
                    />
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
