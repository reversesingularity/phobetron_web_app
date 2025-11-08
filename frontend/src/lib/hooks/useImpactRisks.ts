/**
 * Hook for fetching impact risk data (NEOs from JPL Sentry)
 */

import { useEffect, useState } from 'react';
import api from '@/lib/api/client';

interface ImpactRisk {
  id: number;
  object_name: string;
  torino_scale: number;
  palermo_scale: number;
  impact_probability: number;
  estimated_diameter_m: number | null;
  impact_energy_mt: number | null;
  impact_date: string;
  assessment_date: string;
  data_source: string;
}

interface UseImpactRisksParams {
  object_name?: string;
  min_torino_scale?: number;
  limit?: number;
  skip?: number;
}

interface UseImpactRisksReturn {
  impactRisks: ImpactRisk[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  refetch: () => void;
}

export function useImpactRisks(params?: UseImpactRisksParams): UseImpactRisksReturn {
  const [impactRisks, setImpactRisks] = useState<ImpactRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.scientific.getImpactRisks(params);
      setImpactRisks(response.data || []);
      setTotalCount(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch impact risks'));
      setImpactRisks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params?.object_name, params?.min_torino_scale, params?.limit, params?.skip]);

  return {
    impactRisks,
    loading,
    error,
    totalCount,
    refetch: fetchData,
  };
}
