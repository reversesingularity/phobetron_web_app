/**
 * Custom hook for fetching earthquake data
 * 
 * Provides seismic event data with filtering by magnitude
 * and geographic location.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import { Earthquake } from '@/lib/types';

interface UseEarthquakesOptions {
  minMagnitude?: number;
  maxMagnitude?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface UseEarthquakesReturn {
  earthquakes: Earthquake[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  totalCount: number;
}

export function useEarthquakes(options: UseEarthquakesOptions = {}): UseEarthquakesReturn {
  const {
    minMagnitude,
    maxMagnitude,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes default
  } = options;

  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEarthquakes = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (minMagnitude !== undefined) params.min_magnitude = minMagnitude;
      if (maxMagnitude !== undefined) params.max_magnitude = maxMagnitude;

      const response = await api.events.getEarthquakes(params);
      setEarthquakes(response.items);
      setTotalCount(response.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch earthquake data'));
      setEarthquakes([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [minMagnitude, maxMagnitude]);

  useEffect(() => {
    fetchEarthquakes();
  }, [fetchEarthquakes]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchEarthquakes, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchEarthquakes]);

  return {
    earthquakes,
    loading,
    error,
    refetch: fetchEarthquakes,
    totalCount,
  };
}
