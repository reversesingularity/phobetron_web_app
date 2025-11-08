/**
 * Custom hook for fetching orbital elements data
 * 
 * Provides Keplerian orbital parameters for celestial objects
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import { OrbitalElements } from '@/lib/types';

interface UseOrbitalElementsOptions {
  objectName?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseOrbitalElementsReturn {
  orbitalElements: OrbitalElements[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useOrbitalElements(
  options: UseOrbitalElementsOptions = {}
): UseOrbitalElementsReturn {
  const {
    objectName,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes default
  } = options;

  const [orbitalElements, setOrbitalElements] = useState<OrbitalElements[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrbitalElements = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (objectName) params.object_name = objectName;

      const response = await api.scientific.getOrbitalElements(params);
      setOrbitalElements(response.items);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch orbital elements')
      );
      setOrbitalElements([]);
    } finally {
      setLoading(false);
    }
  }, [objectName]);

  useEffect(() => {
    fetchOrbitalElements();
  }, [fetchOrbitalElements]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchOrbitalElements, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchOrbitalElements]);

  return {
    orbitalElements,
    loading,
    error,
    refetch: fetchOrbitalElements,
  };
}
