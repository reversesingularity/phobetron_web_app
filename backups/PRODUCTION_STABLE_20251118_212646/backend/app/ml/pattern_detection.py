"""
Pattern Detection ML Service
Analyzes celestial events for patterns, clusters, and historical parallels
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

from app.db.session import get_db
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.ml.advanced_pattern_detector import AdvancedPatternDetector


class PatternDetectionService:
    """Service for detecting patterns in celestial events"""
    
    def __init__(self):
        self.feature_dim = 14  # Match existing 14-dimensional feature vectors
        self.advanced_detector = AdvancedPatternDetector()  # For correlation matrix generation
        
    def extract_features(self, event: Dict[str, Any]) -> np.ndarray:
        """
        Extract 14-dimensional feature vector from celestial/seismos event
        
        Expanded for Greek σεισμός (seismos) - "commotion of air and ground"
        
        Features:
        1. Event type encoding (0=eclipse, 0.2=conjunction, 0.4=earthquake, 0.6=volcanic, 0.8=hurricane, 1.0=tsunami)
        2. Magnitude/Intensity (normalized 0-1)
        3. Duration in hours (normalized)
        4. Jerusalem visibility (binary) OR proximity to Israel
        5. Biblical feast day alignment (binary)
        6. Distance from Jerusalem (normalized)
        7. Day of Hebrew calendar year (0-1)
        8. Century encoding (normalized)
        9-11. Celestial body involvement OR natural force involvement (Sun, Moon, Planets/Wind/Water: binary)
        12. Historical significance score (0-1)
        13. Prophecy correlation score (0-1)
        14. Impact severity (log-scaled fatalities + damages)
        """
        
        features = np.zeros(14)
        
        # Event type encoding - expanded for all seismos types
        event_type_map = {
            'blood_moon': 0.0,
            'lunar_eclipse': 0.0,
            'solar_eclipse': 0.1,
            'conjunction': 0.2,
            'tetrad': 0.3,
            'earthquake': 0.4,
            'volcanic': 0.6,
            'volcano': 0.6,
            'hurricane': 0.8,
            'typhoon': 0.8,
            'cyclone': 0.8,
            'tsunami': 1.0,
        }
        features[0] = event_type_map.get(event.get('event_type', ''), 0.5)
        
        # Magnitude/Intensity - unified for all disaster types
        mag = event.get('magnitude', 0)
        event_type = event.get('event_type', '')
        
        if event_type == 'earthquake':
            features[1] = min(mag / 10.0, 1.0)  # Richter scale 0-10
        elif event_type in ['volcanic', 'volcano']:
            vei = event.get('vei', 0)
            features[1] = min(vei / 8.0, 1.0)  # VEI 0-8
        elif event_type in ['hurricane', 'typhoon', 'cyclone']:
            category = event.get('category', 0)
            features[1] = min(category / 5.0, 1.0)  # Saffir-Simpson 1-5
        elif event_type == 'tsunami':
            intensity = event.get('intensity_scale', 0)
            features[1] = min(intensity / 12.0, 1.0)  # Soloviev 0-12
        else:
            features[1] = event.get('intensity', 0.5)
        
        # Duration
        duration_hours = event.get('duration_hours', 0)
        features[2] = min(duration_hours / 24.0, 1.0)  # Normalize to 24 hours
        
        # Jerusalem visibility OR proximity to Israel
        features[3] = 1.0 if event.get('jerusalem_visible', False) else 0.0
        
        # Biblical feast day alignment
        features[4] = 1.0 if event.get('feast_day') else 0.0
        
        # Distance from Jerusalem (normalized)
        distance_km = event.get('distance_from_jerusalem_km', 0)
        features[5] = 1.0 / (1.0 + distance_km / 1000.0)  # Inverse distance
        
        # Day of Hebrew year (cyclical)
        hebrew_day = event.get('hebrew_day_of_year', 180)
        features[6] = hebrew_day / 365.0
        
        # Century encoding
        year = event.get('year', 2000)
        features[7] = (year - 1900) / 200.0  # Normalize 1900-2100
        
        # Force involvement (celestial bodies OR natural forces)
        bodies = event.get('celestial_bodies', [])
        features[8] = 1.0 if 'sun' in [b.lower() for b in bodies] else 0.0
        features[9] = 1.0 if 'moon' in [b.lower() for b in bodies] else 0.0
        features[10] = 1.0 if any(p in [b.lower() for b in bodies] for p in ['jupiter', 'saturn', 'venus', 'mars']) else 0.0
        
        # Scores
        features[11] = event.get('historical_significance', 0.5)
        features[12] = event.get('prophecy_correlation', 0.5)
        
        # Impact severity (fatalities + damages combined)
        fatalities = event.get('fatalities', 0)
        damages = event.get('damages_usd_millions', 0)
        impact = np.log1p(fatalities * 10 + damages) / 15.0  # Log-scaled combined impact
        features[13] = min(impact, 1.0)
        
        return features
    
    async def detect_patterns(
        self,
        start_date: str,
        end_date: str,
        event_types: Optional[List[str]] = None,
        db: Session = None
    ) -> Dict[str, Any]:
        """
        Detect patterns in celestial events within date range
        
        Args:
            start_date: ISO format date string
            end_date: ISO format date string
            event_types: List of event types to include
            db: Database session
            
        Returns:
            Dictionary containing tetrads, conjunctions, clusters, and historical matches
        """
        
        # Get events from database
        events = await self._fetch_events(start_date, end_date, event_types, db)
        
        if len(events) < 3:
            return {
                "tetrads": [],
                "conjunctions": [],
                "clusters": [],
                "historical_matches": [],
                "total_events": len(events)
            }
        
        # Extract feature vectors
        feature_matrix = np.array([self.extract_features(e) for e in events])
        
        # Detect clusters using DBSCAN
        clusters = self._detect_clusters(feature_matrix, events)
        
        # Detect tetrads (4 lunar eclipses on feast days within 2 years)
        tetrads = self._detect_tetrads(events)
        
        # Detect triple conjunctions (3 approaches of planets within 1 year)
        conjunctions = self._detect_conjunctions(events)
        
        # Find historical parallels
        historical_matches = self._find_historical_parallels(feature_matrix, events)
        
        return {
            "tetrads": tetrads,
            "conjunctions": conjunctions,
            "clusters": clusters,
            "historical_matches": historical_matches,
            "total_events": len(events),
            "date_range": {"start": start_date, "end": end_date}
        }
    
    async def _fetch_events(
        self,
        start_date: str,
        end_date: str,
        event_types: Optional[List[str]],
        db: Session
    ) -> List[Dict[str, Any]]:
        """
        Fetch events from database - celestial AND seismos disasters
        
        Greek σεισμός (seismos) - "commotion of air and ground" (Matthew 24:7, Revelation 6:12)
        Includes: earthquakes, volcanic eruptions, hurricanes, tsunamis
        """
        
        events = []
        
        # Celestial events
        if not event_types or any(t in event_types for t in ['blood_moon', 'lunar_eclipse', 'solar_eclipse', 'conjunction', 'tetrad']):
            celestial_query = """
            SELECT 
                id,
                event_type,
                event_date,
                magnitude,
                duration_hours,
                jerusalem_visible,
                feast_day,
                latitude,
                longitude,
                significance_score as historical_significance,
                prophecy_correlation_score as prophecy_correlation,
                description
            FROM celestial_events
            WHERE event_date BETWEEN :start_date AND :end_date
            """
            
            if event_types:
                celestial_types = [t for t in event_types if t in ['blood_moon', 'lunar_eclipse', 'solar_eclipse', 'conjunction', 'tetrad']]
                if celestial_types:
                    placeholders = ','.join([f"'{et}'" for et in celestial_types])
                    celestial_query += f" AND event_type IN ({placeholders})"
            
            celestial_query += " ORDER BY event_date"
            
            result = db.execute(
                text(celestial_query),
                {"start_date": start_date, "end_date": end_date}
            )
            
            for row in result:
                event = dict(row._mapping)
                event['distance_from_jerusalem_km'] = self._calculate_event_distance(event)
                event['year'] = event['event_date'].year if event.get('event_date') else 2000
                event['celestial_bodies'] = self._parse_celestial_bodies(event.get('description', ''))
                events.append(event)
        
        # Earthquakes (Richter 0-10)
        if not event_types or 'earthquake' in event_types:
            eq_query = """
            SELECT 
                id,
                'earthquake' as event_type,
                event_date,
                magnitude,
                0 as duration_hours,
                false as jerusalem_visible,
                NULL as feast_day,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude,
                0.5 as historical_significance,
                0.5 as prophecy_correlation,
                CONCAT('Magnitude ', magnitude::text, ' earthquake near ', location_name) as description,
                fatalities,
                damages_usd_millions
            FROM earthquakes
            WHERE event_date BETWEEN :start_date AND :end_date
            AND magnitude >= 5.0
            ORDER BY event_date
            """
            
            result = db.execute(
                text(eq_query),
                {"start_date": start_date, "end_date": end_date}
            )
            
            for row in result:
                event = dict(row._mapping)
                event['distance_from_jerusalem_km'] = self._calculate_event_distance(event)
                event['year'] = event['event_date'].year if event.get('event_date') else 2000
                event['celestial_bodies'] = []
                events.append(event)
        
        # Volcanic eruptions (VEI 0-8)
        if not event_types or 'volcanic' in event_types:
            vol_query = """
            SELECT 
                id,
                'volcanic' as event_type,
                eruption_start_date as event_date,
                vei as magnitude,
                EXTRACT(EPOCH FROM (eruption_end_date - eruption_start_date))/3600 as duration_hours,
                false as jerusalem_visible,
                NULL as feast_day,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude,
                0.5 as historical_significance,
                0.5 as prophecy_correlation,
                CONCAT('VEI ', vei::text, ' eruption at ', volcano_name) as description,
                0 as fatalities,
                0 as damages_usd_millions,
                vei
            FROM volcanic_activity
            WHERE eruption_start_date BETWEEN :start_date AND :end_date
            AND vei >= 3
            ORDER BY eruption_start_date
            """
            
            result = db.execute(
                text(vol_query),
                {"start_date": start_date, "end_date": end_date}
            )
            
            for row in result:
                event = dict(row._mapping)
                event['distance_from_jerusalem_km'] = self._calculate_event_distance(event)
                event['year'] = event['event_date'].year if event.get('event_date') else 2000
                event['celestial_bodies'] = []
                events.append(event)
        
        # Hurricanes (Saffir-Simpson 1-5)
        if not event_types or 'hurricane' in event_types:
            hur_query = """
            SELECT 
                id,
                'hurricane' as event_type,
                formation_date as event_date,
                category as magnitude,
                EXTRACT(EPOCH FROM (dissipation_date - formation_date))/3600 as duration_hours,
                false as jerusalem_visible,
                NULL as feast_day,
                ST_Y(peak_location::geometry) as latitude,
                ST_X(peak_location::geometry) as longitude,
                0.5 as historical_significance,
                0.5 as prophecy_correlation,
                CONCAT('Category ', category::text, ' ', storm_name) as description,
                fatalities,
                damages_usd_millions,
                category
            FROM hurricanes
            WHERE formation_date BETWEEN :start_date AND :end_date
            AND category >= 3
            ORDER BY formation_date
            """
            
            result = db.execute(
                text(hur_query),
                {"start_date": start_date, "end_date": end_date}
            )
            
            for row in result:
                event = dict(row._mapping)
                event['distance_from_jerusalem_km'] = self._calculate_event_distance(event)
                event['year'] = event['event_date'].year if event.get('event_date') else 2000
                event['celestial_bodies'] = []
                events.append(event)
        
        # Tsunamis (Soloviev 0-12)
        if not event_types or 'tsunami' in event_types:
            tsun_query = """
            SELECT 
                id,
                'tsunami' as event_type,
                event_date,
                intensity_scale as magnitude,
                0 as duration_hours,
                false as jerusalem_visible,
                NULL as feast_day,
                ST_Y(source_location::geometry) as latitude,
                ST_X(source_location::geometry) as longitude,
                0.5 as historical_significance,
                0.5 as prophecy_correlation,
                CONCAT('Intensity ', intensity_scale::text, ' tsunami from ', source_type) as description,
                fatalities,
                damages_usd_millions,
                intensity_scale
            FROM tsunamis
            WHERE event_date BETWEEN :start_date AND :end_date
            AND intensity_scale >= 6
            ORDER BY event_date
            """
            
            result = db.execute(
                text(tsun_query),
                {"start_date": start_date, "end_date": end_date}
            )
            
            for row in result:
                event = dict(row._mapping)
                event['distance_from_jerusalem_km'] = self._calculate_event_distance(event)
                event['year'] = event['event_date'].year if event.get('event_date') else 2000
                event['celestial_bodies'] = []
                events.append(event)
        
        # Sort all events by date
        events.sort(key=lambda e: e.get('event_date', ''))
        
        return events
    
    def _calculate_event_distance(self, event: Dict[str, Any]) -> float:
        """Calculate distance from Jerusalem for any event"""
        if event.get('latitude') and event.get('longitude'):
            return self._distance_to_jerusalem(
                event['latitude'],
                event['longitude']
            )
        return 0.0
    
    def _parse_celestial_bodies(self, description: str) -> List[str]:
        """Parse celestial bodies from event description"""
        bodies = []
        desc_lower = description.lower()
        
        if 'moon' in desc_lower:
            bodies.append('Moon')
        if 'sun' in desc_lower:
            bodies.append('Sun')
        if 'jupiter' in desc_lower:
            bodies.append('Jupiter')
        if 'saturn' in desc_lower:
            bodies.append('Saturn')
        if 'venus' in desc_lower:
            bodies.append('Venus')
        if 'mars' in desc_lower:
            bodies.append('Mars')
        
        return bodies
    
    def _detect_clusters(self, feature_matrix: np.ndarray, events: List[Dict]) -> List[Dict[str, Any]]:
        """Detect event clusters using DBSCAN"""
        
        if len(feature_matrix) < 3:
            return []
        
        # DBSCAN clustering
        clusterer = DBSCAN(eps=0.3, min_samples=3, metric='euclidean')
        cluster_labels = clusterer.fit_predict(feature_matrix)
        
        # Group events by cluster
        clusters = []
        unique_labels = set(cluster_labels)
        
        for label in unique_labels:
            if label == -1:  # Skip noise points
                continue
            
            # Get events in this cluster
            cluster_indices = np.where(cluster_labels == label)[0]
            cluster_events = [events[i] for i in cluster_indices]
            
            # Calculate cluster statistics
            cluster_features = feature_matrix[cluster_indices]
            centroid = cluster_features.mean(axis=0)
            
            # Calculate significance score (weighted average of event significances)
            significance = np.mean([e.get('historical_significance', 0.5) for e in cluster_events])
            
            clusters.append({
                "cluster_id": int(label),
                "event_count": len(cluster_events),
                "events": cluster_events,
                "significance_score": float(significance),
                "start_date": min(e['event_date'] for e in cluster_events if e.get('event_date')),
                "end_date": max(e['event_date'] for e in cluster_events if e.get('event_date')),
                "centroid": centroid.tolist(),
            })
        
        return sorted(clusters, key=lambda x: x['significance_score'], reverse=True)
    
    def _detect_tetrads(self, events: List[Dict]) -> List[Dict[str, Any]]:
        """Detect blood moon tetrads (4 total lunar eclipses on feast days within 2 years)"""
        
        # Filter for lunar eclipses on feast days
        lunar_eclipses = [
            e for e in events
            if e.get('event_type') in ['blood_moon', 'lunar_eclipse']
            and e.get('feast_day')
        ]
        
        tetrads = []
        
        # Sliding window to find groups of 4
        for i in range(len(lunar_eclipses) - 3):
            window = lunar_eclipses[i:i+4]
            
            # Check if all 4 are within 2 years
            dates = [e['event_date'] for e in window if e.get('event_date')]
            if not dates or len(dates) < 4:
                continue
            
            date_range = (max(dates) - min(dates)).days
            
            if date_range <= 730:  # 2 years
                tetrads.append({
                    "start_date": min(dates),
                    "end_date": max(dates),
                    "eclipses": window,
                    "duration_days": date_range,
                    "jerusalem_visible_count": sum(1 for e in window if e.get('jerusalem_visible')),
                    "significance_score": np.mean([e.get('historical_significance', 0.5) for e in window]),
                })
        
        return tetrads
    
    def _detect_conjunctions(self, events: List[Dict]) -> List[Dict[str, Any]]:
        """Detect triple conjunctions (3 planetary approaches within 1 year)"""
        
        conjunctions = [e for e in events if e.get('event_type') == 'conjunction']
        
        triple_conjunctions = []
        
        for i in range(len(conjunctions) - 2):
            window = conjunctions[i:i+3]
            dates = [e['event_date'] for e in window if e.get('event_date')]
            
            if not dates or len(dates) < 3:
                continue
            
            date_range = (max(dates) - min(dates)).days
            
            if date_range <= 365:  # 1 year
                triple_conjunctions.append({
                    "start_date": min(dates),
                    "end_date": max(dates),
                    "conjunctions": window,
                    "duration_days": date_range,
                    "planets_involved": list(set(
                        body for e in window
                        for body in e.get('celestial_bodies', [])
                        if body.lower() in ['jupiter', 'saturn', 'venus', 'mars']
                    )),
                })
        
        return triple_conjunctions
    
    def _find_historical_parallels(
        self,
        feature_matrix: np.ndarray,
        events: List[Dict]
    ) -> List[Dict[str, Any]]:
        """Find historical parallel patterns using cosine similarity"""
        
        if len(feature_matrix) < 2:
            return []
        
        # Calculate pairwise similarities
        similarities = cosine_similarity(feature_matrix)
        
        # Find top similar pairs (excluding self-similarity)
        np.fill_diagonal(similarities, 0)
        
        matches = []
        threshold = 0.85  # High similarity threshold
        
        for i in range(len(similarities)):
            for j in range(i + 1, len(similarities)):
                if similarities[i, j] >= threshold:
                    matches.append({
                        "event_1": events[i],
                        "event_2": events[j],
                        "similarity_score": float(similarities[i, j]),
                        "time_difference_days": abs((events[i]['event_date'] - events[j]['event_date']).days) if events[i].get('event_date') and events[j].get('event_date') else 0,
                    })
        
        return sorted(matches, key=lambda x: x['similarity_score'], reverse=True)[:10]
    
    @staticmethod
    def _distance_to_jerusalem(lat: float, lon: float) -> float:
        """Calculate great circle distance from coordinates to Jerusalem"""
        from math import radians, cos, sin, asin, sqrt
        
        # Jerusalem coordinates
        jerusalem_lat, jerusalem_lon = 31.7683, 35.2137
        
        # Haversine formula
        lon1, lat1, lon2, lat2 = map(radians, [lon, lat, jerusalem_lon, jerusalem_lat])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c  # Earth radius
        
        return km


    async def analyze_feast_day_correlations(
        self,
        start_date: str,
        end_date: str,
        event_types: Optional[List[str]] = None,
        time_window_days: int = 14,
        min_magnitude: float = 5.0,
        db: Session = None
    ) -> Dict[str, Any]:
        """
        Analyze correlations between biblical feast days and natural disasters.
        
        Returns patterns showing feast days with correlated events within time window.
        """
        try:
            # Fetch feast days in the date range
            feast_query = """
            SELECT id, name, gregorian_date, feast_type, significance
            FROM feast_days 
            WHERE gregorian_date >= :start_date 
            AND gregorian_date <= :end_date
            ORDER BY gregorian_date
            """
            
            feast_result = db.execute(text(feast_query), {
                'start_date': start_date,
                'end_date': end_date
            })
            feast_days = feast_result.fetchall()
            
            patterns = []
            event_counts = {'earthquakes': 0, 'volcanic': 0, 'hurricanes': 0, 'tsunamis': 0}
            
            for feast in feast_days:
                feast_date = feast.gregorian_date
                feast_start = feast_date - timedelta(days=time_window_days)
                feast_end = feast_date + timedelta(days=time_window_days)
                
                # Fetch events within time window
                events_query = """
                SELECT 
                    'earthquake' as type,
                    event_time as date,
                    magnitude::text as magnitude,
                    region as location,
                    region,
                    NULL::text as vei,
                    NULL::text as category,
                    NULL::text as cause,
                    NULL::text as wave_height
                FROM earthquakes 
                WHERE event_time >= :start_date 
                AND event_time <= :end_date
                AND magnitude >= :min_magnitude
                
                UNION ALL
                
                SELECT 
                    'volcanic' as type,
                    eruption_start as date,
                    NULL::text as magnitude,
                    volcano_name as location,
                    country as region,
                    vei::text as vei,
                    NULL::text as category,
                    NULL::text as cause,
                    NULL::text as wave_height
                FROM volcanic_activity 
                WHERE eruption_start >= :start_date 
                AND eruption_start <= :end_date
                AND vei >= 3
                
                UNION ALL
                
                SELECT 
                    'hurricane' as type,
                    formation_date as date,
                    NULL::text as magnitude,
                    storm_name as location,
                    array_to_string(affected_regions, ', ') as region,
                    NULL::text as vei,
                    category::text as category,
                    NULL::text as cause,
                    NULL::text as wave_height
                FROM hurricanes 
                WHERE formation_date >= :start_date 
                AND formation_date <= :end_date
                
                UNION ALL
                
                SELECT 
                    'tsunami' as type,
                    event_date as date,
                    NULL::text as magnitude,
                    CONCAT('Lat: ', source_latitude, ', Lon: ', source_longitude) as location,
                    array_to_string(affected_regions, ', ') as region,
                    NULL::text as vei,
                    NULL::text as category,
                    source_type as cause,
                    max_wave_height_m::text as wave_height
                FROM tsunamis 
                WHERE event_date >= :start_date 
                AND event_date <= :end_date
                
                ORDER BY date
                """
                
                events_result = db.execute(text(events_query), {
                    'start_date': feast_start,
                    'end_date': feast_end,
                    'min_magnitude': min_magnitude
                })
                events = events_result.fetchall()
                
                if events:
                    # Calculate correlation score based on event significance and proximity
                    correlated_events = []
                    total_significance = 0
                    
                    for event in events:
                        days_from_feast = abs((event.date.date() - feast_date).days)
                        
                        # Calculate event significance score
                        significance = 0
                        if event.type == 'earthquake':
                            mag = float(event.magnitude) if event.magnitude and event.magnitude != 'None' else 0
                            significance = min(mag, 10) / 10
                            event_counts['earthquakes'] += 1
                        elif event.type == 'volcanic':
                            vei = int(event.vei) if event.vei and event.vei != 'None' else 0
                            significance = min(vei, 8) / 8
                            event_counts['volcanic'] += 1
                        elif event.type == 'hurricane':
                            cat = int(event.category) if event.category and event.category != 'None' else 1
                            significance = min(cat, 5) / 5
                            event_counts['hurricanes'] += 1
                        elif event.type == 'tsunami':
                            height = float(event.wave_height) if event.wave_height and event.wave_height != 'None' else 0
                            significance = 1.0 if height > 1 else 0.5
                            event_counts['tsunamis'] += 1
                        
                        # Reduce significance based on distance from feast day
                        time_decay = max(0, 1 - (days_from_feast / time_window_days))
                        significance *= time_decay
                        total_significance += significance
                        
                        correlated_events.append({
                            'type': event.type,
                            'date': event.date.isoformat(),
                            'magnitude': event.magnitude,
                            'name': event.location,
                            'location': event.location,
                            'region': event.region,
                            'vei': event.vei,
                            'category': event.category,
                            'cause': event.cause,
                            'wave_height': event.wave_height,
                            'days_from_feast': days_from_feast
                        })
                    
                    # Calculate correlation score
                    event_count = len(correlated_events)
                    avg_significance = total_significance / event_count if event_count > 0 else 0
                    
                    # Boost score for multiple events and high significance
                    correlation_score = min(avg_significance * (1 + event_count * 0.1), 1.0)
                    
                    # Determine significance level
                    if correlation_score >= 0.8:
                        significance = 'HIGH'
                    elif correlation_score >= 0.6:
                        significance = 'MODERATE'
                    elif correlation_score >= 0.4:
                        significance = 'LOW'
                    else:
                        significance = 'MINIMAL'
                    
                    patterns.append({
                        'feast_day': feast.name,
                        'feast_date': feast.gregorian_date.isoformat(),
                        'feast_type': feast.feast_type,
                        'events': correlated_events,
                        'event_count': event_count,
                        'correlation_score': round(correlation_score, 3),
                        'significance': significance,
                        'is_anomaly': correlation_score > 0.8
                    })
            
            # Sort patterns by correlation score
            patterns.sort(key=lambda x: x['correlation_score'], reverse=True)
            
            # Calculate statistics
            total_patterns = len(patterns)
            significant_patterns = len([p for p in patterns if p['correlation_score'] > 0.7])
            avg_correlation = sum(p['correlation_score'] for p in patterns) / total_patterns if total_patterns > 0 else 0.0
            total_events = sum(p['event_count'] for p in patterns)
            anomaly_count = len([p for p in patterns if p.get('is_anomaly', False)])
            
            # Calculate seasonal patterns
            seasonal_patterns = {
                'Spring': {'count': 0, 'avg_correlation': 0.0, 'events': []},
                'Summer': {'count': 0, 'avg_correlation': 0.0, 'events': []},
                'Fall': {'count': 0, 'avg_correlation': 0.0, 'events': []},
                'Winter': {'count': 0, 'avg_correlation': 0.0, 'events': []}
            }
            
            for pattern in patterns:
                feast_date = datetime.fromisoformat(pattern['feast_date'])
                month = feast_date.month
                if 3 <= month <= 5:
                    season = 'Spring'
                elif 6 <= month <= 8:
                    season = 'Summer'
                elif 9 <= month <= 11:
                    season = 'Fall'
                else:
                    season = 'Winter'
                
                seasonal_patterns[season]['count'] += 1
                seasonal_patterns[season]['events'].append(pattern['event_count'])
            
            # Calculate averages
            for season in seasonal_patterns:
                count = seasonal_patterns[season]['count']
                if count > 0:
                    seasonal_patterns[season]['avg_correlation'] = sum(
                        p['correlation_score'] for p in patterns 
                        if self._get_season(p['feast_date']) == season
                    ) / count
            
            return {
                'patterns': patterns,
                'statistics': {
                    'total_patterns': total_patterns,
                    'high_correlation_count': significant_patterns,
                    'average_correlation': round(avg_correlation, 3),
                    'total_events_analyzed': total_events,
                    'feast_days_in_range': len(feast_days),
                    'anomaly_count': anomaly_count
                },
                'event_counts': event_counts,
                'statistical_analysis': {
                    'pearson_correlation': 0.0,  # Would need more data for real correlation
                    'spearman_correlation': 0.0,
                    'p_value': 1.0,
                    'is_statistically_significant': False,
                    'confidence_interval_95': {'lower': 0.0, 'upper': 1.0},
                    'confidence_interval_99': {'lower': 0.0, 'upper': 1.0},
                    'sample_size': total_patterns
                },
                'correlation_matrix': self.advanced_detector.generate_correlation_matrix(patterns) if patterns else {},
                'seasonal_patterns': seasonal_patterns,
                'predictions': [],
                'metadata': {
                    'date_range': {'start': start_date, 'end': end_date},
                    'analysis_method': 'Feast Day Correlation Analysis',
                    'window_days': time_window_days,
                    'forecast_horizon_days': 0,
                    'ml_models_used': ['Statistical Correlation', 'Time Window Analysis']
                }
            }
            
        except Exception as e:
            print(f"Error in feast day correlation analysis: {e}")
            import traceback
            traceback.print_exc()
            return {
                'patterns': [],
                'statistics': {
                    'total_patterns': 0,
                    'high_correlation_count': 0,
                    'average_correlation': 0.0,
                    'total_events_analyzed': 0,
                    'feast_days_in_range': 0,
                    'anomaly_count': 0
                },
                'event_counts': {'earthquakes': 0, 'volcanic': 0, 'hurricanes': 0, 'tsunamis': 0},
                'error': str(e)
            }
    
    def _get_season(self, date_str: str) -> str:
        """Get season from date string"""
        date = datetime.fromisoformat(date_str)
        month = date.month
        if 3 <= month <= 5:
            return 'Spring'
        elif 6 <= month <= 8:
            return 'Summer'
        elif 9 <= month <= 11:
            return 'Fall'
        else:
            return 'Winter'


# Create singleton instance
pattern_detection_service = PatternDetectionService()
