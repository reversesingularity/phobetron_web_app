/**
 * Earth Dashboard - Seismic Activity Monitoring
 * 
 * Global map view showing:
 * - Volcanic eruptions (VEI ≥4)
 * - Major hurricanes/cyclones (Cat 3+)
 * - Significant tsunamis (Intensity ≥6)
 * - Earthquakes (M5.0+)
 */

'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { Badge } from '@/components/catalyst/badge';
import { useSeismos, useEarthquakes } from '@/lib/hooks';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for map to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface SeismicEvent {
  id: string;
  type: 'volcanic' | 'hurricane' | 'tsunami' | 'earthquake';
  latitude: number;
  longitude: number;
  magnitude: number;
  name: string;
  date: string;
  details: string;
  color: string;
}

export default function EarthDashboard() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<SeismicEvent[]>([]);
  const { volcanic, hurricanes, tsunamis, loading: seismosLoading } = useSeismos({ limit: 50 });
  const { earthquakes, loading: eqLoading } = useEarthquakes({ minMagnitude: 5.0, limit: 50 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!seismosLoading && !eqLoading) {
      const allEvents: SeismicEvent[] = [];

      // Add volcanic events
      volcanic?.forEach((v: any) => {
        allEvents.push({
          id: v.id,
          type: 'volcanic',
          latitude: v.latitude,
          longitude: v.longitude,
          magnitude: v.vei,
          name: v.volcano_name || 'Unknown Volcano',
          date: v.eruption_start || v.created_at,
          details: `VEI ${v.vei} • ${v.country || 'Unknown'}`,
          color: '#ef4444', // red
        });
      });

      // Add hurricanes
      hurricanes?.forEach((h: any) => {
        allEvents.push({
          id: h.id,
          type: 'hurricane',
          latitude: h.peak_latitude,
          longitude: h.peak_longitude,
          magnitude: h.category,
          name: h.storm_name || 'Unknown Storm',
          date: h.formation_date || h.created_at,
          details: `Category ${h.category} • ${h.basin || 'Unknown'}`,
          color: '#f97316', // orange
        });
      });

      // Add tsunamis
      tsunamis?.forEach((t: any) => {
        allEvents.push({
          id: t.id,
          type: 'tsunami',
          latitude: t.source_latitude,
          longitude: t.source_longitude,
          magnitude: t.intensity_scale,
          name: t.affected_regions?.[0] || 'Unknown Region',
          date: t.event_date || t.created_at,
          details: `Intensity ${t.intensity_scale} • ${t.max_wave_height_m}m wave`,
          color: '#06b6d4', // cyan
        });
      });

      // Add earthquakes
      earthquakes?.forEach((e: any) => {
        allEvents.push({
          id: e.id,
          type: 'earthquake',
          latitude: e.latitude,
          longitude: e.longitude,
          magnitude: e.magnitude,
          name: e.place || 'Unknown Location',
          date: e.time || e.created_at,
          details: `M${e.magnitude} • Depth: ${e.depth_km}km`,
          color: '#eab308', // yellow
        });
      });

      setEvents(allEvents);
    }
  }, [volcanic, hurricanes, tsunamis, earthquakes, seismosLoading, eqLoading]);

  // Calculate event counts
  const eventCounts = {
    volcanic: volcanic?.length || 0,
    hurricanes: hurricanes?.length || 0,
    tsunamis: tsunamis?.length || 0,
    earthquakes: earthquakes?.length || 0,
  };

  const totalEvents = eventCounts.volcanic + eventCounts.hurricanes + eventCounts.tsunamis + eventCounts.earthquakes;

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950">
        {/* Header */}
        <div className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Heading level={1} className="text-2xl text-zinc-100">
                  Earth Dashboard
                </Heading>
                <Text className="text-sm text-zinc-400 mt-1">
                  Seismic Activity Monitoring
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Text className="text-xs text-zinc-400">Live</Text>
                </div>
                <Badge color="zinc" className="text-sm">
                  {totalEvents} events shown
                </Badge>
              </div>
            </div>

            {/* Event type legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Volcanic ({eventCounts.volcanic})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Hurricanes ({eventCounts.hurricanes})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyan-500" />
                <span>Tsunamis ({eventCounts.tsunamis})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Earthquakes ({eventCounts.earthquakes})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[calc(100vh-180px)]">
          {mounted ? (
            <MapContainer
              center={[20, 0]}
              zoom={2}
              className="h-full w-full"
              style={{ background: '#18181b' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              {events.map((event) => {
                const radius = event.type === 'volcanic' ? event.magnitude * 3 :
                              event.type === 'hurricane' ? event.magnitude * 4 :
                              event.type === 'tsunami' ? event.magnitude * 2 :
                              event.magnitude * 2;

                return (
                  <CircleMarker
                    key={event.id}
                    center={[event.latitude, event.longitude]}
                    radius={radius}
                    pathOptions={{
                      fillColor: event.color,
                      fillOpacity: 0.6,
                      color: event.color,
                      weight: 2,
                      opacity: 0.8,
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="font-semibold text-zinc-900 capitalize">
                          {event.type}: {event.name}
                        </div>
                        <div className="text-sm text-zinc-700 mt-1">
                          {event.details}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-900">
              <div className="text-center">
                <div className="mb-4 text-6xl">🌍</div>
                <Text className="text-zinc-400">Loading Earth Dashboard...</Text>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {(seismosLoading || eqLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500 mx-auto" />
              <Text className="text-zinc-400">Loading seismic data...</Text>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
