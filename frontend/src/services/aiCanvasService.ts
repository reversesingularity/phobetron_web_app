/**
 * AI Canvas Update Service
 * =========================
 *
 * Provides AI-powered real-time updates to the 3D solar system canvas:
 * - NEO (Near-Earth Object) tracking
 * - Interstellar object trajectories
 * - Solar flare activity visualization
 * - Planetary conjunction detection
 * - AI anomaly detection and highlighting
 */

import axios from 'axios';

export interface CanvasUpdate {
  update_type: 'neo' | 'interstellar' | 'solar_flare' | 'conjunction' | 'anomaly';
  object_id: string;
  position: [number, number, number]; // AU coordinates
  velocity?: [number, number, number];
  metadata: Record<string, any>;
  priority: number; // 1=low, 2=medium, 3=high, 4=critical
  timestamp: string;
}

export interface CanvasUpdateResponse {
  updates: CanvasUpdate[];
  total_count: number;
  timestamp: string;
  alerts_count: number;
}

export interface NEOData {
  id: string;
  name: string;
  position: [number, number, number];
  magnitude?: number;
  diameter?: number;
  hazardous: boolean;
  close_approach?: any;
  priority: number;
}

export interface InterstellarData {
  id: string;
  name: string;
  position: [number, number, number];
  discovery_date?: string;
  trajectory: string;
  first_interstellar: boolean;
  priority: number;
}

export interface SolarFlareData {
  flare_id: string;
  classification: string;
  intensity: number;
  begin_time?: string;
  peak_time?: string;
  end_time?: string;
  source_location?: string;
  active_region?: number;
  priority: number;
}

export interface ConjunctionData {
  conjunction_id: string;
  planets: string[];
  separation: number;
  visibility: string;
  significance: string;
  timestamp: string;
  priority: number;
}

class AICanvasUpdateService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://phobetronwebapp-production.up.railway.app';
  }

  /**
   * Get real-time canvas updates
   */
  async getCanvasUpdates(
    currentTime: Date,
    includeHistorical: boolean = false,
    maxUpdates: number = 50
  ): Promise<CanvasUpdateResponse> {
    try {
      const params = new URLSearchParams({
        current_time: currentTime.toISOString(),
        include_historical: includeHistorical.toString(),
        max_updates: maxUpdates.toString()
      });

      const response = await axios.get<CanvasUpdateResponse>(
        `${this.baseURL}/api/v1/ml/canvas/updates?${params}`
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get canvas updates:', error);
      throw error;
    }
  }

  /**
   * Apply a specific canvas update
   */
  async applyUpdate(updateId: string, confirmed: boolean = true): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/ml/canvas/apply-update`, {
        update_id: updateId,
        confirmed
      });

      return response.data;
    } catch (error) {
      console.error('Failed to apply update:', error);
      throw error;
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/ml/canvas/alerts`);
      return response.data;
    } catch (error) {
      console.error('Failed to get alerts:', error);
      throw error;
    }
  }

  /**
   * Get NEO tracking data
   */
  async getNEOTackingData(): Promise<{ neo_objects: NEOData[]; count: number; timestamp: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/ml/canvas/neo-tracking`);
      return response.data;
    } catch (error) {
      console.error('Failed to get NEO data:', error);
      throw error;
    }
  }

  /**
   * Get interstellar objects data
   */
  async getInterstellarObjects(): Promise<{ interstellar_objects: InterstellarData[]; count: number; timestamp: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/ml/canvas/interstellar-objects`);
      return response.data;
    } catch (error) {
      console.error('Failed to get interstellar data:', error);
      throw error;
    }
  }

  /**
   * Get solar activity data
   */
  async getSolarActivity(): Promise<{ solar_flares: SolarFlareData[]; count: number; timestamp: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/ml/canvas/solar-activity`);
      return response.data;
    } catch (error) {
      console.error('Failed to get solar activity:', error);
      throw error;
    }
  }

  /**
   * Get planetary conjunctions
   */
  async getPlanetaryConjunctions(): Promise<{ conjunctions: ConjunctionData[]; count: number; timestamp: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/ml/canvas/planetary-conjunctions`);
      return response.data;
    } catch (error) {
      console.error('Failed to get conjunction data:', error);
      throw error;
    }
  }

  /**
   * Process updates for canvas integration
   */
  processUpdatesForCanvas(updates: CanvasUpdate[]): {
    neoUpdates: CanvasUpdate[];
    interstellarUpdates: CanvasUpdate[];
    solarUpdates: CanvasUpdate[];
    conjunctionUpdates: CanvasUpdate[];
    anomalyUpdates: CanvasUpdate[];
    alerts: CanvasUpdate[];
  } {
    const neoUpdates = updates.filter(u => u.update_type === 'neo');
    const interstellarUpdates = updates.filter(u => u.update_type === 'interstellar');
    const solarUpdates = updates.filter(u => u.update_type === 'solar_flare');
    const conjunctionUpdates = updates.filter(u => u.update_type === 'conjunction');
    const anomalyUpdates = updates.filter(u => u.update_type === 'anomaly');
    const alerts = updates.filter(u => u.priority >= 3); // High priority alerts

    return {
      neoUpdates,
      interstellarUpdates,
      solarUpdates,
      conjunctionUpdates,
      anomalyUpdates,
      alerts
    };
  }

  /**
   * Get update priority color
   */
  getPriorityColor(priority: number): string {
    switch (priority) {
      case 4: return '#ff0000'; // Critical - Red
      case 3: return '#ff8800'; // High - Orange
      case 2: return '#ffff00'; // Medium - Yellow
      case 1: return '#00ff00'; // Low - Green
      default: return '#ffffff'; // Default - White
    }
  }

  /**
   * Get update type icon
   */
  getUpdateTypeIcon(updateType: string): string {
    switch (updateType) {
      case 'neo': return '☄️';
      case 'interstellar': return '🌌';
      case 'solar_flare': return '☀️';
      case 'conjunction': return '🔭';
      case 'anomaly': return '⚠️';
      default: return '📡';
    }
  }

  /**
   * Format update for display
   */
  formatUpdateForDisplay(update: CanvasUpdate): string {
    const icon = this.getUpdateTypeIcon(update.update_type);
    const priority = update.priority >= 3 ? '🚨' : '';

    switch (update.update_type) {
      case 'neo':
        const hazardous = update.metadata?.hazardous ? '⚠️ HAZARDOUS' : '';
        return `${icon}${priority} NEO: ${update.metadata?.name || update.object_id} ${hazardous}`;

      case 'interstellar':
        return `${icon}${priority} Interstellar: ${update.metadata?.name || update.object_id}`;

      case 'solar_flare':
        return `${icon}${priority} Solar Flare: ${update.metadata?.classification || 'Unknown'}`;

      case 'conjunction':
        const planets = update.metadata?.planets?.join(' + ') || 'Unknown';
        return `${icon}${priority} Conjunction: ${planets}`;

      case 'anomaly':
        return `${icon}${priority} ANOMALY: ${update.metadata?.original_update || 'Unknown'} detected`;

      default:
        return `${icon}${priority} Update: ${update.object_id}`;
    }
  }
}

// Export singleton instance
export const aiCanvasService = new AICanvasUpdateService();
export default aiCanvasService;