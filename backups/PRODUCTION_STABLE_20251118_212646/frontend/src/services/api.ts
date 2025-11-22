import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://phobetronwebapp-production.up.railway.app'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response types
export interface PaginatedResponse<T> {
  total: number
  skip: number
  limit: number
  data: T[]
}

export interface Earthquake {
  id: string
  event_id: string
  event_time: string
  magnitude: number
  magnitude_type: string
  depth_km: number
  latitude: number
  longitude: number
  region: string
  data_source: string
  created_at: string
}

export interface VolcanicActivity {
  id: string
  volcano_name: string
  country: string
  eruption_start: string
  eruption_end: string | null
  vei: number
  eruption_type: string
  plume_height_km: number
  notes: string
  data_source: string
  latitude: number
  longitude: number
  created_at: string
}

export interface NEOCloseApproach {
  id: string
  object_name: string
  approach_date: string
  miss_distance_au: number
  miss_distance_lunar: number
  relative_velocity_km_s: number
  estimated_diameter_m: number
  absolute_magnitude: number
  data_source: string
  created_at: string
}

// API methods
export const earthquakesAPI = {
  getAll: (params?: {
    limit?: number
    skip?: number
    min_magnitude?: number
    max_magnitude?: number
    start_date?: string
    end_date?: string
  }) =>
    apiClient.get<PaginatedResponse<Earthquake>>('/api/v1/events/earthquakes', {
      params,
    }),

  getById: (id: string) =>
    apiClient.get<Earthquake>(`/api/v1/events/earthquakes/${id}`),
}

export const volcanicAPI = {
  getAll: (params?: {
    limit?: number
    skip?: number
    min_vei?: number
    country?: string
  }) =>
    apiClient.get<PaginatedResponse<VolcanicActivity>>(
      '/api/v1/events/volcanic-activity',
      { params }
    ),

  getById: (id: string) =>
    apiClient.get<VolcanicActivity>(`/api/v1/events/volcanic-activity/${id}`),
}

export const neoAPI = {
  getAll: (params?: {
    limit?: number
    skip?: number
    max_distance_au?: number
    object_name?: string
  }) =>
    apiClient.get<PaginatedResponse<NEOCloseApproach>>(
      '/api/v1/scientific/close-approaches',
      { params }
    ),

  getById: (id: string) =>
    apiClient.get<NEOCloseApproach>(`/api/v1/scientific/close-approaches/${id}`),
}

export default apiClient
