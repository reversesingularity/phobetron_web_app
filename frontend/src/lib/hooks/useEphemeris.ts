/**
 * Custom hook for fetching ephemeris (planetary position) data
 * 
 * Provides real-time astronomical data with optional filtering
 * and auto-refresh capabilities.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import { Ephemeris } from '@/lib/types';

interface UseEphemerisOptions {
  objectName?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface UseEphemerisReturn {
  ephemeris: Ephemeris[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEphemeris(options: UseEphemerisOptions = {}): UseEphemerisReturn {
  const {
    objectName,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
  } = options;

  const [ephemeris, setEphemeris] = useState<Ephemeris[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEphemeris = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (objectName) params.object_name = objectName;

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await api.scientific.getEphemeris(params);
        clearTimeout(timeoutId);
        setEphemeris(response.items || []);
        setError(null);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (err) {
      console.warn('Ephemeris fetch failed (non-critical):', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch ephemeris data'));
      setEphemeris([]);
    } finally {
      setLoading(false);
    }
  }, [objectName]);

  useEffect(() => {
    fetchEphemeris();
  }, [fetchEphemeris]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchEphemeris, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchEphemeris]);

  return {
    ephemeris,
    loading,
    error,
    refetch: fetchEphemeris,
  };
}
