/**
 * Enhanced Watchman's View with ML Features
 * Includes: Enhanced alerts, pattern detection, prophetic significance analysis
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { EnhancedAlertCard } from '@/components/watchman/EnhancedAlertCard';
import { PatternDetectionDashboard } from '@/components/watchman/PatternDetectionDashboard';
import { Badge } from '@/components/catalyst/badge';
import { Button } from '@/components/catalyst/button';
import { 
  useEnhancedAlerts, 
  usePatternDetection 
} from '@/lib/hooks/useMLPredictions';
import {
  SparklesIcon,
  CpuChipIcon,
  FunnelIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export default function EnhancedWatchmansView() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '1year'>('30days');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showPatterns, setShowPatterns] = useState(true);

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '1year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return { start, end };
  };

  const { start, end } = getDateRange();

  // Fetch ML data
  const { alerts, loading: alertsLoading } = useEnhancedAlerts();
  const { patterns, loading: patternsLoading } = usePatternDetection(start, end);

  // Filter alerts by severity
  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter === 'all') return true;
    if (severityFilter === 'high') return alert.severity_score >= 70;
    if (severityFilter === 'medium') return alert.severity_score >= 40 && alert.severity_score < 70;
    if (severityFilter === 'low') return alert.severity_score < 40;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity_score >= 80).length,
    highSignificance: alerts.filter(a => a.prophetic_significance >= 0.7).length,
    patterns: patterns.length
  };

  return (
    <MainLayout title="Watchman's View" subtitle="AI-Enhanced Celestial Monitoring">
      <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <CpuChipIcon className="h-8 w-8 text-purple-400" />
            <h1 className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-4xl font-black tracking-tight text-transparent lg:text-5xl">
              Enhanced Watchman Intelligence
            </h1>
            <Badge color="purple">
              <BoltIcon className="h-3 w-3" />
              AI POWERED
            </Badge>
          </div>
          <p className="text-lg text-zinc-400">
            Machine learning-powered analysis of celestial events and prophetic significance
          </p>
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 md:grid-cols-4"
        >
          <div className="rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-3 ring-1 ring-blue-500/20">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Events</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-red-800/50 bg-gradient-to-br from-red-900/20 to-zinc-950/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-3 ring-1 ring-red-500/20">
                <BoltIcon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Critical Alerts</p>
                <p className="text-3xl font-bold text-white">{stats.critical}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple-800/50 bg-gradient-to-br from-purple-900/20 to-zinc-950/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-3 ring-1 ring-purple-500/20">
                <SparklesIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">High Significance</p>
                <p className="text-3xl font-bold text-white">{stats.highSignificance}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-800/50 bg-gradient-to-br from-amber-900/20 to-zinc-950/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-3 ring-1 ring-amber-500/20">
                <FunnelIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Patterns Found</p>
                <p className="text-3xl font-bold text-white">{stats.patterns}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-400">Time Range:</span>
            <div className="flex gap-2">
              {(['7days', '30days', '1year'] as const).map(range => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  color={timeRange === range ? 'purple' : 'dark/zinc'}
                  className="text-xs"
                >
                  {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '1 Year'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-400">Severity:</span>
            <div className="flex gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map(severity => (
                <Button
                  key={severity}
                  onClick={() => setSeverityFilter(severity)}
                  color={severityFilter === severity ? 'purple' : 'dark/zinc'}
                  className="text-xs capitalize"
                >
                  {severity}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setShowPatterns(!showPatterns)}
            color={showPatterns ? 'purple' : 'dark/zinc'}
            className="text-xs"
          >
            <SparklesIcon className="h-4 w-4" />
            {showPatterns ? 'Hide' : 'Show'} Patterns
          </Button>
        </motion.div>

        {/* Pattern Detection Dashboard */}
        {showPatterns && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <PatternDetectionDashboard patterns={patterns} loading={patternsLoading} />
          </motion.div>
        )}

        {/* Enhanced Alerts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Enhanced Alerts</h2>
            <Badge color="blue">{filteredAlerts.length} Events</Badge>
          </div>

          {alertsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-800 border-t-purple-500" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 p-12 text-center">
              <SparklesIcon className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
              <p className="text-xl text-zinc-400">No alerts matching current filters</p>
              <p className="mt-2 text-sm text-zinc-500">Try adjusting your time range or severity filter</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAlerts.map((alert, idx) => (
                <EnhancedAlertCard
                  key={alert.alert_id}
                  alert={alert}
                  onViewDetails={(id) => console.log('View details:', id)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-800/50 bg-purple-900/20 px-4 py-2">
            <CpuChipIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-purple-300">
              Powered by ML Models: Gradient Boosting • Random Forest • DBSCAN Clustering
            </span>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
