/**
 * Custom React Hook for Alerts Data
 * 
 * Provides real-time alert fetching with auto-refresh capabilities.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import type { Alert, PaginatedResponse } from '@/lib/types';

interface UseAlertsOptions {
  status?: string;
  severity?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface UseAlertsReturn {
  alerts: Alert[];
  activeAlerts: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
  const {
    status = 'ACTIVE',
    severity,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.alerts.getAlerts({
        status,
        severity,
        limit: 100,
      }) as PaginatedResponse<Alert>;

      setAlerts(response.data);
      setActiveAlerts(response.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch alerts'));
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [status, severity]);

  useEffect(() => {
    fetchAlerts();

    // Setup auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchAlerts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAlerts, autoRefresh, refreshInterval]);

  return {
    alerts,
    activeAlerts,
    loading,
    error,
    refetch: fetchAlerts,
  };
}
