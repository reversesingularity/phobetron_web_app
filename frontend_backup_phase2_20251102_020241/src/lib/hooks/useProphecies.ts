/**
 * Custom hook for fetching biblical prophecy data
 * 
 * Provides access to prophecies with filtering by category
 * and scripture references.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import { Prophecy } from '@/lib/types';

interface UsePropheciesOptions {
  category?: string;
  limit?: number;
}

interface UsePropheciesReturn {
  prophecies: Prophecy[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  totalCount: number;
}

export function useProphecies(options: UsePropheciesOptions = {}): UsePropheciesReturn {
  const { category, limit = 50 } = options;

  const [prophecies, setProphecies] = useState<Prophecy[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProphecies = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { limit };
      if (category) params.category = category;

      const response = await api.theological.getProphecies(params);
      // API returns { data: [...], total, skip, limit }
      setProphecies(response.data || []);
      setTotalCount(response.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch prophecies'));
      setProphecies([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchProphecies();
  }, [fetchProphecies]);

  return {
    prophecies,
    loading,
    error,
    refetch: fetchProphecies,
    totalCount,
  };
}
