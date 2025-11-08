/**
 * Celestial Patterns Dashboard
 * Visualizes ML-detected patterns: tetrads, conjunctions, clusters, historical parallels
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import MainLayout from '@/components/layout/MainLayout';
import PatternTimeline from '@/components/visualization/PatternTimeline';
import PatternVisualizationTimeline from '@/components/patterns/PatternVisualizationTimeline';
import EventDataTable from '@/components/patterns/EventDataTable';

// Simple Badge component
const Badge = ({ color, children }: { color: string; children: React.ReactNode }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color] || colorClasses.blue}`}>
      {children}
    </span>
  );
};

// Simple Divider component
const Divider = ({ className = '' }: { className?: string }) => (
  <div className={`border-t border-zinc-700 ${className}`} />
);

// Type definitions for API data
interface EventData {
  id: number;
  event_date: string;
  event_type: string;
  description?: string;
  significance_score?: number;
  jerusalem_visible?: boolean;
  feast_day?: string;
}

interface Tetrad {
  start_date: string;
  end_date: string;
  eclipses: EventData[];
  duration_days: number;
  jerusalem_visible_count: number;
  significance_score: number;
}

interface Conjunction {
  start_date: string;
  end_date: string;
  conjunctions: EventData[];
  duration_days: number;
  planets_involved: string[];
}

interface Cluster {
  cluster_id: number;
  event_count: number;
  events: EventData[];
  significance_score: number;
  start_date: string;
  end_date: string;
}

interface PatternData {
  tetrads: Tetrad[];
  conjunctions: Conjunction[];
  clusters: Cluster[];
  historical_matches: any[];
  total_events: number;
}

export default function PatternsPage() {
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<{ type: string; data: any } | null>(null);
  const [viewMode, setViewMode] = useState<'traditional' | 'd3'>('d3'); // Toggle between views
  const [showTable, setShowTable] = useState(true); // Toggle table visibility - DEFAULT TO TRUE
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null); // Highlighted event from table
  const [dateRange, setDateRange] = useState({
    start: '1900-01-01',
    end: '2100-12-31',
  });
  const [eventTypes, setEventTypes] = useState<string[]>([
    'blood_moon',
    'lunar_eclipse',
    'conjunction',
    'tetrad',
    'earthquake',
    'volcanic',
    'hurricane',
    'tsunami',
  ]);

  // Fetch pattern data from API
  const fetchPatternData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end,
      });

      // Add event types
      eventTypes.forEach(type => params.append('event_types', type));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8020';
      
      // Fetch pattern detection data
      const response = await fetch(
        `${apiUrl}/api/v1/ml/comprehensive-pattern-detection?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pattern data');
      }

      const result = await response.json();
      
      // Fetch seismos disaster data separately (all 4 types)
      let earthquakeData: any[] = [];
      let volcanicData: any[] = [];
      let hurricaneData: any[] = [];
      let tsunamiData: any[] = [];
      
      try {
        // Earthquakes (magnitude >= 5.0)
        const eqResponse = await fetch(`${apiUrl}/api/v1/scientific/earthquakes?limit=100&min_magnitude=5.0`);
        if (eqResponse.ok) {
          const eqResult = await eqResponse.json();
          earthquakeData = eqResult.data || [];
        }
        
        // Volcanic eruptions (VEI >= 3)
        const volResponse = await fetch(`${apiUrl}/api/v1/scientific/volcanic?limit=100&min_vei=3`);
        if (volResponse.ok) {
          const volResult = await volResponse.json();
          volcanicData = volResult.data || [];
        }
        
        // Hurricanes (category >= 3)
        const hurResponse = await fetch(`${apiUrl}/api/v1/scientific/hurricanes?limit=100&min_category=3`);
        if (hurResponse.ok) {
          const hurResult = await hurResponse.json();
          hurricaneData = hurResult.data || [];
        }
        
        // Tsunamis (intensity >= 6)
        const tsuResponse = await fetch(`${apiUrl}/api/v1/scientific/tsunamis?limit=100&min_intensity=6`);
        if (tsuResponse.ok) {
          const tsuResult = await tsuResponse.json();
          tsunamiData = tsuResult.data || [];
        }
      } catch (disasterError) {
        console.warn('Could not fetch seismos disaster data:', disasterError);
      }

      setPatternData(result.data || result);
    } catch (error) {
      console.error('Error fetching pattern data:', error);
      
      // Use mock data for development
      setPatternData({
        tetrads: [
          {
            start_date: '2014-04-15',
            end_date: '2015-09-28',
            eclipses: [
              { id: 1, event_date: '2014-04-15', event_type: 'blood_moon', jerusalem_visible: false, feast_day: 'Passover' },
              { id: 2, event_date: '2014-10-08', event_type: 'blood_moon', jerusalem_visible: true, feast_day: 'Tabernacles' },
              { id: 3, event_date: '2015-04-04', event_type: 'blood_moon', jerusalem_visible: false, feast_day: 'Passover' },
              { id: 4, event_date: '2015-09-28', event_type: 'blood_moon', jerusalem_visible: true, feast_day: 'Tabernacles' },
            ],
            duration_days: 531,
            jerusalem_visible_count: 2,
            significance_score: 0.92,
          },
          {
            start_date: '1967-04-24',
            end_date: '1968-10-06',
            eclipses: [
              { id: 5, event_date: '1967-04-24', event_type: 'blood_moon', jerusalem_visible: true, feast_day: 'Passover' },
              { id: 6, event_date: '1967-10-18', event_type: 'blood_moon', jerusalem_visible: true, feast_day: 'Tabernacles' },
              { id: 7, event_date: '1968-04-13', event_type: 'blood_moon', jerusalem_visible: true, feast_day: 'Passover' },
              { id: 8, event_date: '1968-10-06', event_type: 'blood_moon', jerusalem_visible: false, feast_day: 'Tabernacles' },
            ],
            duration_days: 531,
            jerusalem_visible_count: 3,
            significance_score: 0.98,
          },
        ],
        conjunctions: [
          {
            start_date: '2020-11-21',
            end_date: '2020-12-21',
            conjunctions: [
              { id: 9, event_date: '2020-12-21', event_type: 'conjunction', description: 'Great Conjunction - Jupiter & Saturn' },
            ],
            duration_days: 30,
            planets_involved: ['Jupiter', 'Saturn'],
          },
        ],
        clusters: [],
        historical_matches: [],
        total_events: 12,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch pattern data when component mounts or filters change
  useEffect(() => {
    fetchPatternData();
  }, [dateRange.start, dateRange.end, eventTypes.length]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading pattern data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Prepare timeline events array (extracted for reusability)
  const timelineEvents = patternData ? [
    // ============ MAJOR EARTHQUAKES (1900-2024) ============
    // Early 20th Century
    { id: 'eq_1906', date: new Date('1906-04-18'), type: 'earthquake' as const, title: 'San Francisco Earthquake', magnitude: 7.9, significance: 0.95, location: 'California, USA', description: 'Great San Francisco earthquake and fire', feast_alignment: false },
    { id: 'eq_1923', date: new Date('1923-09-01'), type: 'earthquake' as const, title: 'Great Kantō Earthquake', magnitude: 7.9, significance: 0.96, location: 'Tokyo, Japan', description: 'Over 105,000 deaths in Tokyo-Yokohama', feast_alignment: false },
    { id: 'eq_1960', date: new Date('1960-05-22'), type: 'earthquake' as const, title: 'Great Chilean Earthquake', magnitude: 9.5, significance: 0.99, location: 'Valdivia, Chile', description: 'Most powerful earthquake ever recorded', feast_alignment: false },
    { id: 'eq_1964', date: new Date('1964-03-27'), type: 'earthquake' as const, title: 'Alaska Earthquake', magnitude: 9.2, significance: 0.98, location: 'Prince William Sound, Alaska', description: 'Second most powerful earthquake recorded', feast_alignment: false },
    
    // Late 20th Century
    { id: 'eq_1985', date: new Date('1985-09-19'), type: 'earthquake' as const, title: 'Mexico City Earthquake', magnitude: 8.0, significance: 0.92, location: 'Mexico City', description: 'Over 10,000 deaths in Mexico City', feast_alignment: false },
    { id: 'eq_1988', date: new Date('1988-12-07'), type: 'earthquake' as const, title: 'Armenia Earthquake', magnitude: 6.8, significance: 0.89, location: 'Spitak, Armenia', description: 'Devastating earthquake - 25,000+ deaths', feast_alignment: false },
    { id: 'eq_1990', date: new Date('1990-06-21'), type: 'earthquake' as const, title: 'Iran Earthquake', magnitude: 7.4, significance: 0.90, location: 'Gilan Province, Iran', description: 'Over 40,000 deaths in northern Iran', feast_alignment: false },
    { id: 'eq_1995', date: new Date('1995-01-17'), type: 'earthquake' as const, title: 'Kobe Earthquake', magnitude: 6.9, significance: 0.91, location: 'Kobe, Japan', description: 'Great Hanshin earthquake - 6,434 deaths', feast_alignment: false },
    { id: 'eq_1999', date: new Date('1999-08-17'), type: 'earthquake' as const, title: 'İzmit Earthquake', magnitude: 7.6, significance: 0.88, location: 'Kocaeli, Turkey', description: 'Devastating earthquake in northwestern Turkey', feast_alignment: false },
    
    // 21st Century
    { id: 'eq_2001', date: new Date('2001-01-26'), type: 'earthquake' as const, title: 'Bhuj Earthquake', magnitude: 7.7, significance: 0.87, location: 'Gujarat, India', description: 'Over 20,000 deaths in western India', feast_alignment: false },
    { id: 'eq_2004', date: new Date('2004-12-26'), type: 'earthquake' as const, title: 'Indian Ocean Tsunami', magnitude: 9.1, significance: 0.98, location: 'Sumatra, Indonesia', description: 'Deadliest tsunami in history - 230,000+ deaths', feast_alignment: false },
    { id: 'eq_2005', date: new Date('2005-10-08'), type: 'earthquake' as const, title: 'Kashmir Earthquake', magnitude: 7.6, significance: 0.89, location: 'Pakistan-India', description: 'Over 86,000 deaths in Kashmir region', feast_alignment: false },
    { id: 'eq_2008', date: new Date('2008-05-12'), type: 'earthquake' as const, title: 'Sichuan Earthquake', magnitude: 7.9, significance: 0.91, location: 'Wenchuan, China', description: 'Wenchuan earthquake - 87,000 casualties', feast_alignment: false },
    { id: 'eq_2010a', date: new Date('2010-01-12'), type: 'earthquake' as const, title: 'Haiti Earthquake', magnitude: 7.0, significance: 0.93, location: 'Port-au-Prince, Haiti', description: 'Catastrophic damage - 200,000+ deaths', feast_alignment: false },
    { id: 'eq_2010b', date: new Date('2010-02-27'), type: 'earthquake' as const, title: 'Maule Earthquake', magnitude: 8.8, significance: 0.95, location: 'Chile', description: '8th strongest earthquake ever recorded', feast_alignment: false },
    { id: 'eq_2011', date: new Date('2011-03-11'), type: 'earthquake' as const, title: 'Tōhoku Earthquake', magnitude: 9.1, significance: 0.97, location: 'Japan', description: 'Fukushima nuclear disaster - massive tsunami', feast_alignment: false },
    { id: 'eq_2015', date: new Date('2015-04-25'), type: 'earthquake' as const, title: 'Nepal Earthquake', magnitude: 7.8, significance: 0.90, location: 'Gorkha, Nepal', description: 'Mount Everest avalanche triggered', feast_alignment: true },
    { id: 'eq_2016', date: new Date('2016-04-16'), type: 'earthquake' as const, title: 'Kumamoto Earthquake', magnitude: 7.3, significance: 0.83, location: 'Kyushu, Japan', description: 'Major earthquake in southern Japan', feast_alignment: false },
    { id: 'eq_2017a', date: new Date('2017-09-08'), type: 'earthquake' as const, title: 'Chiapas Earthquake', magnitude: 8.2, significance: 0.90, location: 'Mexico', description: 'Strongest Mexican earthquake in century', feast_alignment: false },
    { id: 'eq_2017b', date: new Date('2017-09-19'), type: 'earthquake' as const, title: 'Puebla Earthquake', magnitude: 7.1, significance: 0.84, location: 'Mexico City area', description: 'Major damage in Mexico City', feast_alignment: false },
    { id: 'eq_2018', date: new Date('2018-09-28'), type: 'earthquake' as const, title: 'Palu Tsunami', magnitude: 7.5, significance: 0.86, location: 'Sulawesi, Indonesia', description: 'Triggered devastating tsunami in Palu', feast_alignment: false },
    { id: 'eq_2023', date: new Date('2023-02-06'), type: 'earthquake' as const, title: 'Turkey-Syria Earthquake', magnitude: 7.8, significance: 0.92, location: 'Gaziantep, Turkey', description: 'Recent devastating earthquake in Middle East', feast_alignment: false },

    // ============ HISTORIC COMETS ============
    { id: 'comet_1910', date: new Date('1910-04-19'), type: 'celestial' as const, title: "Halley's Comet", significance: 0.92, location: 'Global', description: 'Earth passed through tail - public panic', feast_alignment: false },
    { id: 'comet_1957', date: new Date('1957-04-01'), type: 'celestial' as const, title: 'Comet Arend-Roland', significance: 0.78, location: 'Global', description: 'Great Comet of 1957 - bright naked-eye comet', feast_alignment: false },
    { id: 'comet_1965', date: new Date('1965-10-20'), type: 'celestial' as const, title: 'Comet Ikeya-Seki', significance: 0.85, location: 'Global', description: 'One of brightest comets of 20th century', feast_alignment: false },
    { id: 'comet_1973', date: new Date('1973-12-28'), type: 'celestial' as const, title: 'Comet Kohoutek', significance: 0.75, location: 'Global', description: 'Predicted to be comet of century', feast_alignment: false },
    { id: 'comet_1976', date: new Date('1976-02-25'), type: 'celestial' as const, title: 'Comet West', significance: 0.88, location: 'Global', description: 'One of brightest comets of 20th century', feast_alignment: false },
    { id: 'comet_1986', date: new Date('1986-02-09'), type: 'celestial' as const, title: "Halley's Comet", significance: 0.90, location: 'Global', description: 'Return of Halley - first spacecraft encounters', feast_alignment: false },
    { id: 'comet_1996', date: new Date('1996-03-25'), type: 'celestial' as const, title: 'Comet Hyakutake', significance: 0.82, location: 'Global', description: 'Great Comet of 1996 - closest approach', feast_alignment: false },
    { id: 'comet_1997', date: new Date('1997-04-01'), type: 'celestial' as const, title: 'Comet Hale-Bopp', significance: 0.91, location: 'Global', description: 'Great Comet - visible for 18 months', feast_alignment: false },
    { id: 'comet_2007', date: new Date('2007-01-12'), type: 'celestial' as const, title: 'Comet McNaught', significance: 0.86, location: 'Southern Hemisphere', description: 'Brightest comet in 40 years', feast_alignment: false },
    { id: 'comet_2013', date: new Date('2013-11-28'), type: 'celestial' as const, title: 'Comet ISON', significance: 0.80, location: 'Global', description: 'Sungrazer - disintegrated near perihelion', feast_alignment: false },
    { id: 'comet_2020', date: new Date('2020-07-03'), type: 'celestial' as const, title: 'Comet NEOWISE', significance: 0.84, location: 'Global', description: 'Brightest comet since Hale-Bopp', feast_alignment: false },
    
    // ============ MAJOR SOLAR FLARES & STORMS ============
    { id: 'solar_1859', date: new Date('1859-09-01'), type: 'celestial' as const, title: 'Carrington Event', significance: 0.99, location: 'Global', description: 'Most powerful geomagnetic storm recorded - telegraph systems failed', feast_alignment: false },
    { id: 'solar_1921', date: new Date('1921-05-15'), type: 'celestial' as const, title: 'New York Railroad Storm', significance: 0.94, location: 'Global', description: 'Massive geomagnetic storm - disrupted telegraph/railroad', feast_alignment: false },
    { id: 'solar_1958', date: new Date('1958-02-11'), type: 'celestial' as const, title: 'February 1958 Storm', significance: 0.88, location: 'Global', description: 'Major geomagnetic storm during Solar Cycle 19', feast_alignment: false },
    { id: 'solar_1989', date: new Date('1989-03-13'), type: 'celestial' as const, title: 'March 1989 Storm', significance: 0.92, location: 'Global', description: 'Quebec blackout - 6 million without power', feast_alignment: false },
    { id: 'solar_2000', date: new Date('2000-07-14'), type: 'celestial' as const, title: 'Bastille Day Solar Flare', significance: 0.85, location: 'Global', description: 'X5.7 class flare - major CME event', feast_alignment: false },
    { id: 'solar_2003', date: new Date('2003-10-28'), type: 'celestial' as const, title: 'Halloween Solar Storms', significance: 0.91, location: 'Global', description: 'X17.2 flare - 3rd most powerful on record', feast_alignment: false },
    { id: 'solar_2005', date: new Date('2005-01-20'), type: 'celestial' as const, title: 'January 2005 Storm', significance: 0.87, location: 'Global', description: 'Largest solar proton event since 1989', feast_alignment: false },
    { id: 'solar_2012', date: new Date('2012-07-23'), type: 'celestial' as const, title: 'July 2012 Storm', significance: 0.90, location: 'Earth-orbit', description: 'Narrowly missed Earth - Carrington-class event', feast_alignment: false },
    { id: 'solar_2017', date: new Date('2017-09-06'), type: 'celestial' as const, title: 'September 2017 Flares', significance: 0.86, location: 'Global', description: 'X9.3 flare - strongest of Solar Cycle 24', feast_alignment: false },
    { id: 'solar_2022', date: new Date('2022-04-20'), type: 'celestial' as const, title: 'April 2022 Storm', significance: 0.82, location: 'Global', description: 'SpaceX satellites lost - strong geomagnetic storm', feast_alignment: false },
    { id: 'solar_2024', date: new Date('2024-05-10'), type: 'celestial' as const, title: 'May 2024 Superstorm', significance: 0.93, location: 'Global', description: 'Strongest storm in 20 years - aurora worldwide', feast_alignment: false },
    
    // ============ MAJOR SOLAR ECLIPSES ============
    { id: 'eclipse_1919', date: new Date('1919-05-29'), type: 'celestial' as const, title: 'Einstein Eclipse', significance: 0.96, location: 'Atlantic, Africa', description: 'Proved Einstein relativity - light bending', feast_alignment: false },
    { id: 'eclipse_1979', date: new Date('1979-02-26'), type: 'celestial' as const, title: 'Total Solar Eclipse', significance: 0.79, location: 'North America', description: 'Last total eclipse in US until 2017', feast_alignment: false },
    { id: 'eclipse_1991', date: new Date('1991-07-11'), type: 'celestial' as const, title: 'Longest Eclipse', significance: 0.87, location: 'Pacific, Americas', description: 'Longest total eclipse of 20th century - 6m53s', feast_alignment: false },
    { id: 'eclipse_1999', date: new Date('1999-08-11'), type: 'celestial' as const, title: 'Last Eclipse of Millennium', significance: 0.85, location: 'Europe, Middle East', description: 'Total eclipse across densely populated areas', feast_alignment: false },
    { id: 'eclipse_2017', date: new Date('2017-08-21'), type: 'celestial' as const, title: 'Great American Eclipse', significance: 0.91, location: 'United States', description: 'First total eclipse across US in 99 years', feast_alignment: false },
    { id: 'eclipse_2024', date: new Date('2024-04-08'), type: 'celestial' as const, title: 'North American Eclipse', significance: 0.89, location: 'Mexico, US, Canada', description: 'Total eclipse across North America', feast_alignment: false },
    
    // ============ PLANETARY ALIGNMENTS & CONJUNCTIONS ============
    { id: 'conj_1962', date: new Date('1962-02-05'), type: 'celestial' as const, title: 'Great Alignment', significance: 0.83, location: 'Global', description: 'Rare alignment of all classical planets', feast_alignment: false },
    { id: 'conj_1982', date: new Date('1982-03-10'), type: 'celestial' as const, title: 'Planetary Alignment', significance: 0.81, location: 'Global', description: 'Syzygy - all planets on one side of Sun', feast_alignment: false },
    { id: 'conj_2000', date: new Date('2000-05-05'), type: 'celestial' as const, title: 'Millennium Alignment', significance: 0.80, location: 'Global', description: 'Rare alignment of Sun, Mercury, Venus, Mars, Jupiter, Saturn', feast_alignment: false },
    
    // Transform tetrads to timeline events
    ...patternData.tetrads.flatMap((tetrad: Tetrad, idx: number) =>
      tetrad.eclipses.map((eclipse: EventData, eclipseIdx: number) => ({
        id: `tetrad_${idx}_eclipse_${eclipseIdx}`,
        date: new Date(eclipse.event_date),
        type: 'celestial' as const,
        title: `Blood Moon (${eclipse.feast_day || 'Eclipse'})`,
        significance: tetrad.significance_score,
        location: eclipse.jerusalem_visible ? 'Visible from Jerusalem' : 'Global',
        description: `Part of ${tetrad.start_date.substring(0, 4)}-${tetrad.end_date.substring(0, 4)} tetrad`,
        feast_alignment: !!eclipse.feast_day,
        correlations: tetrad.eclipses
          .filter((_e: EventData, i: number) => i !== eclipseIdx)
          .map((_e: EventData, i: number) => `tetrad_${idx}_eclipse_${i < eclipseIdx ? i : i + 1}`),
      }))
    ),
    // Transform conjunctions to timeline events
    ...patternData.conjunctions.flatMap((conjunction: Conjunction, idx: number) =>
      conjunction.conjunctions.map((conj: EventData, conjIdx: number) => ({
        id: `conjunction_${idx}_${conjIdx}`,
        date: new Date(conj.event_date),
        type: 'celestial' as const,
        title: conjunction.planets_involved.join('-') + ' Conjunction',
        significance: 0.85,
        location: 'Global',
        description: conj.description || `Planetary alignment of ${conjunction.planets_involved.join(' and ')}`,
        feast_alignment: false,
      }))
    ),
    // Transform clusters to correlation events
    ...patternData.clusters.flatMap((cluster: Cluster, idx: number) =>
      cluster.events.map((event: EventData, eventIdx: number) => ({
        id: `cluster_${idx}_event_${eventIdx}`,
        date: new Date(event.event_date),
        type: 'correlation' as const,
        title: event.description || `Cluster Event ${eventIdx + 1}`,
        significance: cluster.significance_score,
        location: 'Various',
        description: `Part of cluster ${cluster.cluster_id} with ${cluster.event_count} events`,
        feast_alignment: !!event.feast_day,
        correlations: cluster.events
          .filter((_e: EventData, i: number) => i !== eventIdx)
          .map((_e: EventData, i: number) => `cluster_${idx}_event_${i < eventIdx ? i : i + 1}`),
      }))
    ),
  ] : [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-linear-to-b from-zinc-950 via-zinc-900 to-black">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🔮 Celestial Pattern Analysis
                </h1>
                <p className="text-zinc-400">
                  ML-powered detection of blood moon tetrads, planetary conjunctions, and event clusters
                </p>
              </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 mr-2">
                <button
                  onClick={() => setViewMode('d3')}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    viewMode === 'd3'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  D3 Timeline
                </button>
                <button
                  onClick={() => setViewMode('traditional')}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    viewMode === 'traditional'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  Traditional
                </button>
              </div>

              {/* Table Toggle */}
              <button
                onClick={() => setShowTable(!showTable)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all border ${
                  showTable
                    ? 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {showTable ? 'Hide' : 'Show'} Table
              </button>
              
              <Badge color="blue">
                {patternData?.total_events || 0} Events
              </Badge>
              <Badge color="red">
                {patternData?.tetrads.length || 0} Tetrads
              </Badge>
              <Badge color="yellow">
                {patternData?.conjunctions.length || 0} Conjunctions
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Filters Sidebar */}
          <div className="col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 backdrop-blur-xl"
            >
              <h3 className="text-lg font-semibold text-white mb-4">📊 Filters</h3>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Date Range
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm mb-2"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
                />
              </div>

              <Divider className="my-4" />

              {/* Event Types */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Event Types
                </label>
                
                {/* Celestial Events */}
                <div className="mb-3">
                  <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Celestial</p>
                  {['blood_moon', 'lunar_eclipse', 'solar_eclipse', 'conjunction', 'tetrad'].map(type => (
                    <label key={type} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventTypes.includes(type)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEventTypes([...eventTypes, type]);
                          } else {
                            setEventTypes(eventTypes.filter(t => t !== type));
                          }
                        }}
                        className="rounded border-zinc-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-400 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Seismos Natural Disasters */}
                <div className="relative group">
                  <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">
                    Seismos (σεισμός) Disasters
                    <span className="ml-1 text-xs text-blue-400 cursor-help">ⓘ</span>
                  </p>
                  {/* Tooltip */}
                  <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl">
                    <p className="font-semibold text-white mb-1">Greek: σεισμός (seismos)</p>
                    <p className="mb-2 italic">"Violent shaking, commotion, tempest"</p>
                    <p className="text-zinc-400">
                      Matthew 24:7 & Revelation 6:12 use this term for all Earth/atmospheric violent disturbances - not just earthquakes but hurricanes, volcanic eruptions, and tsunamis.
                    </p>
                  </div>
                  
                  {/* Earthquake */}
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventTypes.includes('earthquake')}
                      onChange={e => {
                        if (e.target.checked) {
                          setEventTypes([...eventTypes, 'earthquake']);
                        } else {
                          setEventTypes(eventTypes.filter(t => t !== 'earthquake'));
                        }
                      }}
                      className="rounded border-zinc-700 text-amber-700 focus:ring-amber-700"
                    />
                    <span className="text-sm text-zinc-400">
                      🌍 Earthquakes <span className="text-xs text-zinc-500">(Richter 0-10)</span>
                    </span>
                  </label>
                  
                  {/* Volcanic */}
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventTypes.includes('volcanic')}
                      onChange={e => {
                        if (e.target.checked) {
                          setEventTypes([...eventTypes, 'volcanic']);
                        } else {
                          setEventTypes(eventTypes.filter(t => t !== 'volcanic'));
                        }
                      }}
                      className="rounded border-zinc-700 text-red-600 focus:ring-red-600"
                    />
                    <span className="text-sm text-zinc-400">
                      🌋 Volcanic Eruptions <span className="text-xs text-zinc-500">(VEI 0-8)</span>
                    </span>
                  </label>
                  
                  {/* Hurricanes */}
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventTypes.includes('hurricane')}
                      onChange={e => {
                        if (e.target.checked) {
                          setEventTypes([...eventTypes, 'hurricane']);
                        } else {
                          setEventTypes(eventTypes.filter(t => t !== 'hurricane'));
                        }
                      }}
                      className="rounded border-zinc-700 text-slate-400 focus:ring-slate-400"
                    />
                    <span className="text-sm text-zinc-400">
                      🌀 Hurricanes <span className="text-xs text-zinc-500">(Category 1-5)</span>
                    </span>
                  </label>
                  
                  {/* Tsunamis */}
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventTypes.includes('tsunami')}
                      onChange={e => {
                        if (e.target.checked) {
                          setEventTypes([...eventTypes, 'tsunami']);
                        } else {
                          setEventTypes(eventTypes.filter(t => t !== 'tsunami'));
                        }
                      }}
                      className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-zinc-400">
                      🌊 Tsunamis <span className="text-xs text-zinc-500">(Soloviev 0-12)</span>
                    </span>
                  </label>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Statistics */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Statistics</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Events:</span>
                    <span className="text-white font-medium">{patternData?.total_events || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tetrads Found:</span>
                    <span className="text-red-400 font-medium">{patternData?.tetrads.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Conjunctions:</span>
                    <span className="text-yellow-400 font-medium">{patternData?.conjunctions.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Clusters:</span>
                    <span className="text-purple-400 font-medium">{patternData?.clusters.length || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {viewMode === 'traditional' && patternData && (
                <PatternTimeline
                  data={patternData}
                  startYear={1900}
                  endYear={2100}
                  height={500}
                  onPatternSelect={setSelectedPattern}
                />
              )}
              
              {viewMode === 'd3' && patternData && (
                <>
                  <PatternVisualizationTimeline
                    startDate={new Date(dateRange.start)}
                    endDate={new Date(dateRange.end)}
                    height={800}
                    events={timelineEvents}
                    highlightedEventId={highlightedEventId}
                    onEventClick={setHighlightedEventId}
                  />

                  {/* Event Data Table */}
                  {showTable && (
                    <div className="mt-6">
                      <EventDataTable
                        events={timelineEvents}
                        onEventClick={setHighlightedEventId}
                        highlightedEventId={highlightedEventId}
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Pattern Details */}
            {selectedPattern && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 backdrop-blur-xl"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  {selectedPattern.type === 'tetrad' && '🌙 Blood Moon Tetrad Details'}
                  {selectedPattern.type === 'conjunction' && '🪐 Conjunction Details'}
                  {selectedPattern.type === 'cluster' && '⭐ Event Cluster Details'}
                </h3>

                {selectedPattern.type === 'tetrad' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-zinc-400">Duration</div>
                        <div className="text-lg font-medium text-white">
                          {selectedPattern.data.duration_days} days
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Jerusalem Visible</div>
                        <div className="text-lg font-medium text-white">
                          {selectedPattern.data.jerusalem_visible_count} / {selectedPattern.data.eclipses.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Significance Score</div>
                        <div className="text-lg font-medium text-white">
                          {(selectedPattern.data.significance_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <Divider className="my-4" />

                    <div>
                      <div className="text-sm text-zinc-400 mb-2">Eclipses:</div>
                      <div className="space-y-2">
                        {selectedPattern.data.eclipses.map((eclipse: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                          >
                            <div>
                              <div className="text-white font-medium">
                                {new Date(eclipse.event_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                              <div className="text-xs text-zinc-400">{eclipse.feast_day}</div>
                            </div>
                            {eclipse.jerusalem_visible && (
                              <Badge color="red">Jerusalem</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tetrad List */}
            {patternData && patternData.tetrads.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-6 backdrop-blur-xl"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  🌙 Detected Blood Moon Tetrads
                </h3>

                <div className="space-y-3">
                  {patternData.tetrads.map((tetrad, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPattern({ type: 'tetrad', data: tetrad })}
                      className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-red-500 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-semibold">
                          {new Date(tetrad.start_date).getFullYear()} - {new Date(tetrad.end_date).getFullYear()}
                        </div>
                        <Badge color={tetrad.significance_score > 0.9 ? 'red' : 'orange'}>
                          {(tetrad.significance_score * 100).toFixed(0)}% Significant
                        </Badge>
                      </div>
                      <div className="text-sm text-zinc-400">
                        {tetrad.eclipses.length} eclipses • {tetrad.jerusalem_visible_count} visible from Jerusalem
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
