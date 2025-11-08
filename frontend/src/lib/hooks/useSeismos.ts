/**
 * Hook for fetching seismos (natural disaster) events
 * Based on Greek σεισμός - "violent shaking, commotion"
 */

import { useEffect, useState } from 'react';
import api from '@/lib/api/client';

interface VolcanicEvent {
  id: number;
  volcano_name: string;
  country: string;
  vei: number;
  latitude: number;
  longitude: number;
  eruption_date: string;
  data_source: string;
}

interface Hurricane {
  id: number;
  name: string;
  basin: string;
  category: number;
  max_wind_speed: number;
  min_pressure: number;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string | null;
  data_source: string;
}

interface Tsunami {
  id: number;
  cause: string;
  soloviev_intensity: number;
  max_wave_height: number | null;
  latitude: number;
  longitude: number;
  event_date: string;
  deaths: number | null;
  data_source: string;
}

interface UseSeismosParams {
  limit?: number;
  skip?: number;
  minVEI?: number;
  minCategory?: number;
  minIntensity?: number;
}

interface UseSeismosReturn {
  volcanic: VolcanicEvent[];
  hurricanes: Hurricane[];
  tsunamis: Tsunami[];
  loading: boolean;
  error: Error | null;
  totalVolcanic: number;
  totalHurricanes: number;
  totalTsunamis: number;
  refetch: () => void;
}

export function useSeismos(params?: UseSeismosParams): UseSeismosReturn {
  const [volcanic, setVolcanic] = useState<VolcanicEvent[]>([]);
  const [hurricanes, setHurricanes] = useState<Hurricane[]>([]);
  const [tsunamis, setTsunamis] = useState<Tsunami[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalVolcanic, setTotalVolcanic] = useState(0);
  const [totalHurricanes, setTotalHurricanes] = useState(0);
  const [totalTsunamis, setTotalTsunamis] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all seismos events in parallel
      const [volcanicRes, hurricanesRes, tsunamisRes] = await Promise.all([
        api.scientific.getVolcanicActivity?.({
          min_vei: params?.minVEI || 4,
          limit: params?.limit || 6,
          skip: params?.skip,
        }).catch(() => ({ data: [], total: 0 })),
        api.scientific.getHurricanes?.({
          min_category: params?.minCategory || 3,
          limit: params?.limit || 6,
          skip: params?.skip,
        }).catch(() => ({ data: [], total: 0 })),
        api.scientific.getTsunamis?.({
          min_intensity: params?.minIntensity || 6,
          limit: params?.limit || 6,
          skip: params?.skip,
        }).catch(() => ({ data: [], total: 0 })),
      ]);

      setVolcanic(volcanicRes.data || []);
      setHurricanes(hurricanesRes.data || []);
      setTsunamis(tsunamisRes.data || []);
      setTotalVolcanic(volcanicRes.total || 0);
      setTotalHurricanes(hurricanesRes.total || 0);
      setTotalTsunamis(tsunamisRes.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch seismos events'));
      setVolcanic([]);
      setHurricanes([]);
      setTsunamis([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params?.limit, params?.skip, params?.minVEI, params?.minCategory, params?.minIntensity]);

  return {
    volcanic,
    hurricanes,
    tsunamis,
    loading,
    error,
    totalVolcanic,
    totalHurricanes,
    totalTsunamis,
    refetch: fetchData,
  };
}
