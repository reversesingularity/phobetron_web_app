/**
 * Alerts Page
 * 
 * Display and manage real-time alerts from data triggers.
 */

'use client';

import { MainLayout } from '@/components/layout';
import { useAlerts } from '@/lib/hooks/useAlerts';

export default function AlertsPage() {
  const { alerts, activeAlerts, loading, error } = useAlerts({ status: 'ACTIVE', autoRefresh: true });

  return (
    <MainLayout title="Alerts" subtitle="Real-time Monitoring & Notifications">
      <div className="p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-sm text-zinc-300">Active Alerts</p>
            <p className="mt-2 text-3xl font-bold text-red-500">
              {loading ? '...' : activeAlerts}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-sm text-zinc-300">Total Alerts</p>
            <p className="mt-2 text-3xl font-bold text-zinc-50">
              {loading ? '...' : alerts.length}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-sm text-zinc-300">Status</p>
            <p className="mt-2 text-xl font-semibold text-green-500">
              {loading ? 'Loading...' : 'Monitoring'}
            </p>
          </div>
        </div>

        {/* Alerts List */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
          <div className="border-b border-zinc-800 p-4">
            <h2 className="text-lg font-semibold text-zinc-50">Active Alerts</h2>
            <p className="text-sm text-zinc-300">Auto-refreshing every 30 seconds</p>
          </div>

          <div className="p-4">
            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
                <p className="text-sm text-red-400">Error loading alerts: {error.message}</p>
              </div>
            )}

            {loading && !alerts.length && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
                  <p className="mt-4 text-sm text-zinc-300">Loading alerts...</p>
                </div>
              </div>
            )}

            {!loading && !error && alerts.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-4 text-zinc-300">No active alerts</p>
                  <p className="mt-1 text-sm text-zinc-400">All systems operational</p>
                </div>
              </div>
            )}

            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full ${
                          alert.severity === 'CRITICAL' ? 'bg-red-500' :
                          alert.severity === 'HIGH' ? 'bg-orange-500' :
                          alert.severity === 'MEDIUM' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-zinc-50">{alert.title}</h3>
                          <p className="mt-1 text-sm text-zinc-300">{alert.alert_type}</p>
                          {alert.description && (
                            <p className="mt-2 text-sm text-zinc-400">{alert.description}</p>
                          )}
                          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
                            <span>Severity: {alert.severity}</span>
                            <span>Status: {alert.status}</span>
                            <span>Triggered: {new Date(alert.triggered_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
