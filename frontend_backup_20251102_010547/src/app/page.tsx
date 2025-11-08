/**
 * Celestial Signs - Dashboard Home Page
 * 
 * Main entry point showing overview of astronomical events,
 * active alerts, and quick navigation to main modules.
 */

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/client';
import { useAlerts, useEarthquakes, useCorrelations } from '@/lib/hooks';
import { MainLayout } from '@/components/layout';

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { activeAlerts, loading: alertsLoading } = useAlerts({ status: 'ACTIVE' });
  const { earthquakes, loading: eqLoading, totalCount: eqCount } = useEarthquakes({ minMagnitude: 4.0 });
  const { highConfidenceCount, loading: corrLoading } = useCorrelations({ minConfidence: 0.7 });

  useEffect(() => {
    // Check backend API connection
    api.health.check()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('error'));
  }, []);

  return (
    <MainLayout title="Dashboard" subtitle="System Overview">
      <div className="p-6">
        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Active Alerts Card */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Active Alerts</p>
                <p className="mt-2 text-3xl font-bold text-zinc-50">
                  {alertsLoading ? '...' : activeAlerts}
                </p>
              </div>
              <div className="rounded-full bg-red-500/10 p-3">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              Real-time monitoring active
            </p>
          </div>

          {/* API Status Card */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">API Status</p>
                <p className="mt-2 text-xl font-bold text-zinc-50">
                  {apiStatus === 'connected' ? 'Healthy' :
                   apiStatus === 'error' ? 'Offline' :
                   'Checking...'}
                </p>
              </div>
              <div className={`rounded-full p-3 ${
                apiStatus === 'connected' ? 'bg-green-500/10' :
                apiStatus === 'error' ? 'bg-red-500/10' :
                'bg-yellow-500/10'
              }`}>
                <svg className={`h-6 w-6 ${
                  apiStatus === 'connected' ? 'text-green-500' :
                  apiStatus === 'error' ? 'text-red-500' :
                  'text-yellow-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              Backend: http://localhost:8000
            </p>
          </div>

          {/* Data Sources Card */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Seismic Events</p>
                <p className="mt-2 text-xl font-bold text-zinc-50">
                  {eqLoading ? '...' : `${eqCount} M4+`}
                </p>
              </div>
              <div className="rounded-full bg-orange-500/10 p-3">
                <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              Earthquakes magnitude 4.0+
            </p>
          </div>

          {/* Correlations Card */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Correlations</p>
                <p className="mt-2 text-xl font-bold text-zinc-50">
                  {corrLoading ? '...' : highConfidenceCount}
                </p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              High confidence (≥70%)
            </p>
          </div>
        </div>

        {/* Recent Earthquakes Widget */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-50">Recent Seismic Activity</h2>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            {eqLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-orange-500" />
              </div>
            ) : earthquakes && earthquakes.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {earthquakes.slice(0, 6).map((eq) => (
                  <div
                    key={eq.id}
                    className="rounded border border-zinc-800 bg-zinc-950 p-3 hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-zinc-50">M {eq.magnitude}</span>
                      <span className={`rounded px-2 py-0.5 text-xs ${
                        eq.magnitude >= 6 ? 'bg-red-500/20 text-red-400' :
                        eq.magnitude >= 5 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {eq.magnitude >= 6 ? 'Major' : eq.magnitude >= 5 ? 'Strong' : 'Moderate'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">
                      {eq.location.coordinates[1].toFixed(1)}°N, {eq.location.coordinates[0].toFixed(1)}°E
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(eq.event_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">No recent earthquakes</p>
            )}
          </div>
        </div>

        {/* Module Navigation */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-50">Explore Modules</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ModuleCard
              title="Solar System"
              description="3D visualization of planetary orbits and NEOs"
              icon="🌍"
              href="/solar-system"
              status="Active"
              statusColor="green"
            />
            <ModuleCard
              title="Earth Dashboard"
              description="Earth-centric view with earthquakes and events"
              icon="🗺️"
              href="/dashboard"
              status={`${eqCount} M4+ Earthquakes`}
              statusColor="orange"
            />
            <ModuleCard
              title="Prophecy Codex"
              description="Biblical references and correlations"
              icon="📖"
              href="/prophecy-codex"
              status="39 Prophecies"
              statusColor="purple"
            />
            <ModuleCard
              title="Alerts"
              description="Real-time monitoring and notifications"
              icon="🔔"
              href="/alerts"
              status={activeAlerts > 0 ? `${activeAlerts} Active` : 'No Alerts'}
              statusColor={activeAlerts > 0 ? 'red' : 'zinc'}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  status: string;
  statusColor: 'green' | 'orange' | 'purple' | 'red' | 'zinc';
}

function ModuleCard({ title, description, icon, href, status, statusColor }: ModuleCardProps) {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-400',
    orange: 'bg-orange-500/20 text-orange-400',
    purple: 'bg-purple-500/20 text-purple-400',
    red: 'bg-red-500/20 text-red-400',
    zinc: 'bg-zinc-800 text-zinc-300',
  };

  return (
    <a
      href={href}
      className="block rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/50"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-zinc-50">{title}</h3>
      <p className="mt-1 text-sm text-zinc-300">{description}</p>
      <div className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${colorClasses[statusColor]}`}>
        {status}
      </div>
    </a>
  );
}

