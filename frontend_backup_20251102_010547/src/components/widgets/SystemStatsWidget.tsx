/**
 * System Statistics Widget
 * 
 * Displays real-time system health and data statistics.
 */

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/client';

interface SystemStats {
  apiHealth: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastUpdate: Date;
}

export default function SystemStatsWidget() {
  const [stats, setStats] = useState<SystemStats>({
    apiHealth: 'healthy',
    responseTime: 0,
    lastUpdate: new Date(),
  });

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = performance.now();
      try {
        await api.health.check();
        const endTime = performance.now();
        setStats({
          apiHealth: 'healthy',
          responseTime: Math.round(endTime - startTime),
          lastUpdate: new Date(),
        });
      } catch {
        setStats(prev => ({
          ...prev,
          apiHealth: 'down',
          lastUpdate: new Date(),
        }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-3 font-semibold text-zinc-50">System Health</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">API Status:</span>
          <span className={`flex items-center gap-2 text-sm font-medium ${
            stats.apiHealth === 'healthy' ? 'text-green-500' :
            stats.apiHealth === 'degraded' ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            <span className={`h-2 w-2 rounded-full ${
              stats.apiHealth === 'healthy' ? 'bg-green-500' :
              stats.apiHealth === 'degraded' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            {stats.apiHealth === 'healthy' ? 'Healthy' :
             stats.apiHealth === 'degraded' ? 'Degraded' :
             'Down'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Response Time:</span>
          <span className="text-sm font-medium text-zinc-50">
            {stats.responseTime}ms
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Last Check:</span>
          <span className="text-sm font-medium text-zinc-50">
            {stats.lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
