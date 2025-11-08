/**
 * Custom hook for fetching event correlation data
 * 
 * Provides access to correlations between astronomical and
 * geophysical events with confidence scoring.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import { EventCorrelation } from '@/lib/types';

interface UseCorrelationsOptions {
  minConfidence?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface UseCorrelationsReturn {
  correlations: EventCorrelation[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  totalCount: number;
  highConfidenceCount: number;
}

export function useCorrelations(options: UseCorrelationsOptions = {}): UseCorrelationsReturn {
  const {
    minConfidence,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes default
  } = options;

  const [correlations, setCorrelations] = useState<EventCorrelation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCorrelations = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (minConfidence !== undefined) params.min_confidence = minConfidence;

      const response = await api.correlations.getEventCorrelations(params);
      setCorrelations(response.items);
      setTotalCount(response.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch correlations'));
      setCorrelations([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [minConfidence]);

  useEffect(() => {
    fetchCorrelations();
  }, [fetchCorrelations]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchCorrelations, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCorrelations]);

  const highConfidenceCount = (correlations || []).filter(c => c.confidence_score >= 0.8).length;

  return {
    correlations,
    loading,
    error,
    refetch: fetchCorrelations,
    totalCount,
    highConfidenceCount,
  };
}
