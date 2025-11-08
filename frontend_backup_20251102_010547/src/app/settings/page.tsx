/**
 * Settings Page
 * 
 * Application configuration and user preferences.
 */

'use client';

import { MainLayout } from '@/components/layout';

export default function SettingsPage() {
  return (
    <MainLayout title="Settings" subtitle="Application Configuration">
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Settings */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-50">General</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="theme-select" className="block text-sm font-medium text-zinc-400">Theme</label>
                <select id="theme-select" className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50">
                  <option>Dark (Default)</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </div>
              <div>
                <label htmlFor="timezone-select" className="block text-sm font-medium text-zinc-400">Time Zone</label>
                <select id="timezone-select" className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50">
                  <option>UTC</option>
                  <option>Local Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-50">API Configuration</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="backend-url" className="block text-sm font-medium text-zinc-400">Backend URL</label>
                <input
                  id="backend-url"
                  type="text"
                  value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                  readOnly
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50"
                />
              </div>
              <div>
                <label htmlFor="refresh-interval" className="block text-sm font-medium text-zinc-400">Auto-refresh Interval</label>
                <select id="refresh-interval" className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50">
                  <option value="30000">30 seconds</option>
                  <option value="60000">1 minute</option>
                  <option value="300000">5 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-50">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-zinc-400">Alert notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-zinc-400">Earthquake alerts (M5+)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-zinc-400">Correlation discoveries</span>
              </label>
            </div>
          </div>

          {/* Data Sources */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-50">Data Sources</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">NASA Horizons</span>
                <span className="text-green-500">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">USGS Earthquake</span>
                <span className="text-green-500">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">NOAA Solar</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
