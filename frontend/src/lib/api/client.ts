/**
 * API Client for Celestial Signs Backend
 * 
 * Provides typed HTTP client for all backend endpoints.
 * Handles authentication, error handling, and response parsing.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020';
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1';

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query parameters
  const url = new URL(`${API_BASE_PATH}${endpoint}`, API_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  try {
    // Make request
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        response.status,
        response.statusText,
        errorText || 'An error occurred while fetching data'
      );
    }

    // Parse JSON response
    return response.json();
  } catch (error) {
    // Handle network errors (connection refused, timeout, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(
        0,
        'Network Error',
        `Unable to connect to API server at ${API_URL}. Please ensure the backend server is running.`
      );
    }
    // Re-throw API errors
    if (error instanceof APIError) {
      throw error;
    }
    // Handle other unexpected errors
    throw new APIError(
      500,
      'Unknown Error',
      `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// SCIENTIFIC ENDPOINTS
// ============================================================================

export const scientific = {
  /**
   * Get ephemeris data (position/velocity vectors)
   */
  getEphemeris: (params?: {
    object_name?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/scientific/ephemeris', { params }),

  /**
   * Get orbital elements (Keplerian parameters)
   */
  getOrbitalElements: (params?: {
    object_name?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/scientific/orbital-elements', { params }),

  /**
   * Get impact risk data (Sentry system)
   */
  getImpactRisks: (params?: {
    object_name?: string;
    min_palermo_scale?: number;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/scientific/impact-risks', { params }),

  /**
   * Get close approach data
   */
  getCloseApproaches: (params?: {
    object_name?: string;
    min_approach_date?: string;
    max_approach_date?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/scientific/close-approaches', { params }),

  /**
   * Get volcanic activity data
   */
  getVolcanicActivity: (params?: {
    volcano_name?: string;
    min_vei?: number;
    max_vei?: number;
    country?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/scientific/volcanic', { params }),

  /**
   * Get hurricane data
   */
  getHurricanes: (params?: {
    name?: string;
    min_category?: number;
    start_time?: string;
    end_time?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/scientific/hurricanes', { params }),

  /**
   * Get tsunami data
   */
  getTsunamis: (params?: {
    min_intensity?: number;
    start_time?: string;
    end_time?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/scientific/tsunamis', { params }),
};

// ============================================================================
// EVENTS ENDPOINTS
// ============================================================================

export const events = {
  /**
   * Get earthquake data (PostGIS spatial queries)
   */
  getEarthquakes: async (params?: {
    min_magnitude?: number;
    max_magnitude?: number;
    start_time?: string;
    end_time?: string;
    min_latitude?: number;
    max_latitude?: number;
    min_longitude?: number;
    max_longitude?: number;
    skip?: number;
    limit?: number;
  }) => {
    const response = await request<any>('/events/earthquakes', { params });
    // Map API response to frontend format
    return {
      ...response,
      items: response.data?.map((eq: any) => ({
        ...eq,
        place_name: eq.region || `${eq.latitude.toFixed(1)}°, ${eq.longitude.toFixed(1)}°`,
        location: {
          type: 'Point',
          coordinates: [eq.longitude, eq.latitude]
        },
        event_source: eq.data_source || 'Unknown'
      })) || []
    };
  },

  /**
   * Get volcanic activity data
   */
  getVolcanicActivity: (params?: {
    volcano_name?: string;
    min_vei?: number;
    start_time?: string;
    end_time?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/events/volcanic-activity', { params }),

  /**
   * Get solar events (flares, CMEs, storms)
   */
  getSolarEvents: (params?: {
    event_type?: string;
    min_kp_index?: number;
    start_time?: string;
    end_time?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/events/solar-events', { params }),

  /**
   * Get meteor shower data
   */
  getMeteorShowers: (params?: {
    shower_name?: string;
    peak_month?: number;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/events/meteor-showers', { params }),
};

// ============================================================================
// THEOLOGICAL ENDPOINTS
// ============================================================================

export const theological = {
  /**
   * Get biblical prophecies
   */
  getProphecies: (params?: {
    category?: string;
    event_name?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/theological/prophecies', { params }),

  /**
   * Get celestial signs
   */
  getCelestialSigns: (params?: {
    sign_type?: string;
    sign_name?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/theological/celestial-signs', { params }),

  /**
   * Get prophecy-sign links
   */
  getProphecySignLinks: (params?: {
    prophecy_id?: number;
    sign_id?: number;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/theological/prophecy-sign-links', { params }),
};

// ============================================================================
// ALERTS ENDPOINTS
// ============================================================================

export const alerts = {
  /**
   * Get data triggers configuration
   */
  getDataTriggers: (params?: {
    sign_id?: number;
    is_active?: boolean;
    priority?: number;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/alerts/data-triggers', { params }),

  /**
   * Get triggered alerts
   */
  getAlerts: (params?: {
    status?: string;
    severity?: string;
    alert_type?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/alerts/alerts', { params }),
};

// ============================================================================
// CORRELATIONS ENDPOINTS
// ============================================================================

export const correlations = {
  /**
   * Get correlation rules
   */
  getCorrelationRules: (params?: {
    is_active?: boolean;
    primary_event_type?: string;
    secondary_event_type?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/correlations/correlation-rules', { params }),

  /**
   * Get detected event correlations
   */
  getEventCorrelations: (params?: {
    rule_id?: number;
    min_confidence?: number;
    primary_event_type?: string;
    secondary_event_type?: string;
    skip?: number;
    limit?: number;
  }) =>
    request<any>('/correlations/event-correlations', { params }),
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const health = {
  /**
   * Check API health status
   * Note: Health endpoint is at root level (/health), not under /api/v1
   */
  check: async () => {
    const url = `${API_URL}/health`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new APIError(
        response.status,
        response.statusText,
        'Health check failed'
      );
    }
    
    return response.json() as Promise<{ status: string; version: string }>;
  },
};

// Default export with all namespaced endpoints
const api = {
  scientific,
  events,
  theological,
  alerts,
  correlations,
  health,
};

export default api;
