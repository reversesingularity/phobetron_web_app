/**
 * Data Source Status Panel
 * 
 * Displays current celestial data source status (NASA/ESA) and allows manual switching
 * Shows availability, last check times, and active source
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  SignalIcon, 
  SignalSlashIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface DataSourceStatus {
  nasa: {
    available: boolean;
    last_check: string | null;
    status: string;
  };
  esa: {
    available: boolean;
    last_check: string | null;
    status: string;
  };
  active_source: string;
  recommendation: string;
}

interface SourceHealth {
  status: 'healthy' | 'degraded';
  sources: {
    nasa: { available: boolean; status: string };
    esa: { available: boolean; status: string };
  };
  active_source: string;
  timestamp: string;
}

export default function DataSourceStatusPanel({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<DataSourceStatus | null>(null);
  const [health, setHealth] = useState<SourceHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isMinimized, setIsMinimized] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020';

  // Fetch data source status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const data = await response.json();
      setStatus(data.sources);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching data source status:', err);
      setError('Failed to fetch data source status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch health check
  const fetchHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/health`);
      if (!response.ok) throw new Error('Health check failed');
      
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      console.error('Health check error:', err);
    }
  };

  // Switch data source
  const switchSource = async (source: 'NASA' | 'ESA') => {
    setSwitching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/data-sources/switch-source?source=${source}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to switch source');
      
      const data = await response.json();
      setStatus(data.sources);
      
      // Show success notification
      alert(`Successfully switched to ${source}`);
    } catch (err) {
      console.error('Error switching source:', err);
      alert(`Failed to switch to ${source}`);
    } finally {
      setSwitching(false);
    }
  };

  // Refresh status
  const refresh = () => {
    setLoading(true);
    fetchStatus();
    fetchHealth();
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchStatus();
    fetchHealth();
    
    // Refresh every 2 minutes
    const interval = setInterval(() => {
      fetchStatus();
      fetchHealth();
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div className={`rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-md p-4 ${className}`}>
        <div className="flex items-center gap-2 text-zinc-400">
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading data source status...</span>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className={`rounded-lg border border-red-800 bg-red-900/20 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span className="text-sm">{error || 'Unknown error'}</span>
        </div>
      </div>
    );
  }

  const activeSource = status.active_source;
  const isNasaActive = activeSource.includes('NASA');
  const isEsaActive = activeSource.includes('ESA');

  return (
    <div className={`rounded-lg border border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-xl ${className}`}>
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-2 ${health?.status === 'healthy' ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
              {health?.status === 'healthy' ? (
                <SignalIcon className="h-5 w-5 text-green-400" />
              ) : (
                <SignalSlashIcon className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-50">Celestial Data Sources</h3>
              <p className="text-xs text-zinc-400">
                Active: <span className="font-medium text-zinc-300">{activeSource}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={refresh}
              disabled={loading}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
              title="Refresh status"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              title={isMinimized ? "Expand panel" : "Minimize panel"}
            >
              {isMinimized ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronUpIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Source Cards - Hidden when minimized */}
      {!isMinimized && (
        <>
          <div className="space-y-3 p-4">
        {/* NASA JPL */}
        <div className={`rounded-lg border p-3 transition-all ${
          status.nasa.available
            ? 'border-green-800 bg-green-900/10'
            : 'border-red-800 bg-red-900/10'
        } ${isNasaActive ? 'ring-2 ring-blue-500' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {status.nasa.available ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <SignalSlashIcon className="h-5 w-5 text-red-400" />
                )}
                <h4 className="font-semibold text-zinc-50">NASA JPL</h4>
                {isNasaActive && (
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                    ACTIVE
                  </span>
                )}
              </div>
              
              <p className={`text-sm mb-2 ${
                status.nasa.available ? 'text-green-400' : 'text-red-400'
              }`}>
                {status.nasa.status}
              </p>
              
              {status.nasa.last_check && (
                <p className="text-xs text-zinc-500">
                  Last check: {new Date(status.nasa.last_check).toLocaleTimeString()}
                </p>
              )}
            </div>
            
            {!isNasaActive && status.nasa.available && (
              <button
                onClick={() => switchSource('NASA')}
                disabled={switching}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {/* ESA NEOCC */}
        <div className={`rounded-lg border p-3 transition-all ${
          status.esa.available
            ? 'border-green-800 bg-green-900/10'
            : 'border-red-800 bg-red-900/10'
        } ${isEsaActive ? 'ring-2 ring-blue-500' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {status.esa.available ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <SignalSlashIcon className="h-5 w-5 text-red-400" />
                )}
                <h4 className="font-semibold text-zinc-50">ESA NEOCC</h4>
                {isEsaActive && (
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                    ACTIVE
                  </span>
                )}
              </div>
              
              <p className={`text-sm mb-2 ${
                status.esa.available ? 'text-green-400' : 'text-red-400'
              }`}>
                {status.esa.status}
              </p>
              
              {status.esa.last_check && (
                <p className="text-xs text-zinc-500">
                  Last check: {new Date(status.esa.last_check).toLocaleTimeString()}
                </p>
              )}
            </div>
            
            {!isEsaActive && status.esa.available && (
              <button
                onClick={() => switchSource('ESA')}
                disabled={switching}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                Switch
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      {status.recommendation && (
        <div className="border-t border-zinc-800 bg-blue-900/10 p-3">
          <div className="flex gap-2 text-sm">
            <InformationCircleIcon className="h-5 w-5 shrink-0 text-blue-400" />
            <p className="text-blue-300">{status.recommendation}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
        {health && (
          <span className="ml-2">
            • System status: <span className={health.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'}>
              {health.status.toUpperCase()}
            </span>
          </span>
        )}
      </div>
        </>
      )}
    </div>
  );
}
