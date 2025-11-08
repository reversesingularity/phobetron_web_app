/**
 * Custom hook for fetching close approach data
 * 
 * Provides NEO/asteroid close approach predictions
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import { CloseApproach } from '@/lib/types';

interface UseCloseApproachesOptions {
  objectName?: string;
  minApproachDate?: string;
  maxApproachDate?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseCloseApproachesReturn {
  closeApproaches: CloseApproach[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCloseApproaches(
  options: UseCloseApproachesOptions = {}
): UseCloseApproachesReturn {
  const {
    objectName,
    minApproachDate,
    maxApproachDate,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes default
  } = options;

  const [closeApproaches, setCloseApproaches] = useState<CloseApproach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCloseApproaches = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (objectName) params.object_name = objectName;
      if (minApproachDate) params.min_approach_date = minApproachDate;
      if (maxApproachDate) params.max_approach_date = maxApproachDate;

      const response = await api.scientific.getCloseApproaches(params);
      setCloseApproaches(response.items);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch close approaches')
      );
      setCloseApproaches([]);
    } finally {
      setLoading(false);
    }
  }, [objectName, minApproachDate, maxApproachDate]);

  useEffect(() => {
    fetchCloseApproaches();
  }, [fetchCloseApproaches]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchCloseApproaches, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCloseApproaches]);

  return {
    closeApproaches,
    loading,
    error,
    refetch: fetchCloseApproaches,
  };
}
