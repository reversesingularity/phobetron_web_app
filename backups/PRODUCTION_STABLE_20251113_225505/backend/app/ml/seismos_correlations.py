"""
Seismos Correlation Model Training

Greek σεισμός (seismos) - "commotion of air and ground" (Matthew 24:7, Revelation 6:12)

Trains ML models to detect correlations between:
1. Celestial events → Earthquake clusters
2. Solar activity → Volcanic eruptions
3. Planetary alignments → Hurricane formation
4. Lunar cycles → Tsunami risk

Target: 75%+ accuracy for pattern detection
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

logger = logging.getLogger(__name__)


class SeismosCorrelationTrainer:
    """
    Train correlation models between celestial events and seismos disasters
    
    Biblical Foundation:
    - Matthew 24:7: "There will be famines and earthquakes (σεισμός) in various places"
    - Revelation 6:12: "I watched as he opened the sixth seal. There was a great earthquake (σεισμός)"
    - Luke 21:25: "There will be signs in the sun, moon and stars... roaring and tossing of the sea"
    """
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.metrics: Dict[str, Dict[str, float]] = {}
        
    def train_all_correlations(self, db: Session) -> Dict[str, Any]:
        """
        Train all 4 correlation models
        
        Returns:
            Dictionary with training results and metrics for each model
        """
        results = {}
        
        # 1. Celestial events → Earthquake clusters
        logger.info("Training celestial → earthquake correlation model...")
        results['celestial_earthquakes'] = self._train_celestial_earthquake_model(db)
        
        # 2. Solar activity → Volcanic eruptions
        logger.info("Training solar → volcanic correlation model...")
        results['solar_volcanic'] = self._train_solar_volcanic_model(db)
        
        # 3. Planetary alignments → Hurricane formation
        logger.info("Training planetary → hurricane correlation model...")
        results['planetary_hurricanes'] = self._train_planetary_hurricane_model(db)
        
        # 4. Lunar cycles → Tsunami risk
        logger.info("Training lunar → tsunami correlation model...")
        results['lunar_tsunamis'] = self._train_lunar_tsunami_model(db)
        
        # Calculate overall correlation strength
        results['overall_metrics'] = self._calculate_overall_metrics()
        
        return results
    
    # ==================== Model 1: Celestial Events → Earthquake Clusters ====================
    
    def _train_celestial_earthquake_model(self, db: Session) -> Dict[str, Any]:
        """
        Train model to predict earthquake clusters from celestial events
        
        Features:
        - Blood moon occurrence (binary)
        - Solar eclipse occurrence (binary)
        - Lunar eclipse occurrence (binary)
        - Planetary conjunction count (0-5)
        - Days since last celestial event
        - Moon phase (0-1, new to full)
        - Tetrad active (binary)
        - Jerusalem visibility (binary)
        - Feast day alignment (binary)
        - Solar flare activity (X-class count)
        
        Target: Earthquake magnitude >= 6.0 within 7 days
        """
        
        # Fetch earthquakes (magnitude >= 6.0, last 100 years)
        earthquake_query = text("""
            SELECT 
                id,
                event_time as event_date,
                magnitude,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude
            FROM earthquakes
            WHERE magnitude >= 6.0
            AND event_time >= :start_date
            ORDER BY event_time
        """)
        
        start_date = datetime.now() - timedelta(days=365 * 100)  # 100 years
        earthquakes = db.execute(earthquake_query, {"start_date": start_date}).fetchall()
        
        logger.info(f"Loaded {len(earthquakes)} major earthquakes (M >= 6.0)")
        
        # Fetch celestial events
        celestial_query = text("""
            SELECT 
                event_date,
                event_type,
                jerusalem_visible,
                feast_day,
                magnitude as celestial_magnitude
            FROM celestial_events
            WHERE event_date >= :start_date
            ORDER BY event_date
        """)
        
        celestial_events = db.execute(celestial_query, {"start_date": start_date}).fetchall()
        logger.info(f"Loaded {len(celestial_events)} celestial events")
        
        # Fetch solar events (X-class flares)
        solar_query = text("""
            SELECT 
                event_start as event_date,
                flare_class,
                kp_index
            FROM solar_events
            WHERE event_start >= :start_date
            AND flare_class LIKE 'X%'
            ORDER BY event_start
        """)
        
        solar_events = db.execute(solar_query, {"start_date": start_date}).fetchall()
        logger.info(f"Loaded {len(solar_events)} X-class solar flares")
        
        # Build feature matrix
        X = []
        y = []
        
        # Create time windows: each day in the dataset
        current_date = start_date
        end_date = datetime.now()
        
        while current_date < end_date:
            # Features for this day
            features = self._extract_celestial_earthquake_features(
                current_date,
                celestial_events,
                solar_events
            )
            
            # Target: earthquake M >= 6.0 within next 7 days?
            has_earthquake = any(
                current_date <= eq.event_date <= current_date + timedelta(days=7)
                for eq in earthquakes
                if eq.magnitude >= 6.0
            )
            
            X.append(features)
            y.append(1 if has_earthquake else 0)
            
            current_date += timedelta(days=1)
        
        X = np.array(X)
        y = np.array(y)
        
        logger.info(f"Feature matrix: {X.shape}, positive samples: {y.sum()}/{len(y)} ({y.sum()/len(y)*100:.1f}%)")
        
        # Train Random Forest model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=20,
            random_state=42,
            class_weight='balanced'  # Handle imbalanced data
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_scaled)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1_score': f1_score(y_test, y_pred, zero_division=0),
            'total_samples': len(y),
            'positive_samples': int(y.sum()),
            'feature_importance': model.feature_importances_.tolist()
        }
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        metrics['cv_mean'] = cv_scores.mean()
        metrics['cv_std'] = cv_scores.std()
        
        self.models['celestial_earthquakes'] = model
        self.scalers['celestial_earthquakes'] = scaler
        self.metrics['celestial_earthquakes'] = metrics
        
        logger.info(f"Celestial → Earthquake model trained: Accuracy={metrics['accuracy']:.3f}, F1={metrics['f1_score']:.3f}")
        
        return metrics
    
    def _extract_celestial_earthquake_features(
        self,
        target_date: datetime,
        celestial_events: List[Any],
        solar_events: List[Any]
    ) -> List[float]:
        """Extract 10 features for celestial → earthquake correlation"""
        
        window_start = target_date - timedelta(days=30)
        window_end = target_date
        
        features = []
        
        # Celestial events in last 30 days
        recent_celestial = [e for e in celestial_events if window_start <= e.event_date <= window_end]
        
        # Feature 1: Blood moon in last 30 days
        features.append(1.0 if any(e.event_type == 'blood_moon' for e in recent_celestial) else 0.0)
        
        # Feature 2: Solar eclipse in last 30 days
        features.append(1.0 if any(e.event_type == 'solar_eclipse' for e in recent_celestial) else 0.0)
        
        # Feature 3: Lunar eclipse in last 30 days
        features.append(1.0 if any(e.event_type == 'lunar_eclipse' for e in recent_celestial) else 0.0)
        
        # Feature 4: Conjunction count in last 30 days
        conjunction_count = sum(1 for e in recent_celestial if e.event_type == 'conjunction')
        features.append(min(conjunction_count / 5.0, 1.0))  # Normalize to 0-1
        
        # Feature 5: Days since last celestial event
        days_since = 30.0
        for event in reversed(recent_celestial):
            if event.event_date <= target_date:
                days_since = (target_date - event.event_date).days
                break
        features.append(days_since / 30.0)  # Normalize
        
        # Feature 6: Moon phase (approximate)
        lunar_cycle = 29.53  # days
        days_since_new_moon = (target_date - datetime(2000, 1, 6)).days % lunar_cycle
        moon_phase = days_since_new_moon / lunar_cycle  # 0 = new, 0.5 = full
        features.append(moon_phase)
        
        # Feature 7: Tetrad active (4 blood moons in 2 years on feast days)
        # Simplified: check if we have 2+ blood moons in last 365 days
        blood_moons_year = sum(1 for e in celestial_events 
                               if e.event_type == 'blood_moon' 
                               and target_date - timedelta(days=365) <= e.event_date <= target_date)
        features.append(1.0 if blood_moons_year >= 2 else 0.0)
        
        # Feature 8: Jerusalem visibility count
        jerusalem_visible_count = sum(1 for e in recent_celestial if e.jerusalem_visible)
        features.append(min(jerusalem_visible_count / 5.0, 1.0))
        
        # Feature 9: Feast day alignment count
        feast_count = sum(1 for e in recent_celestial if e.feast_day)
        features.append(min(feast_count / 3.0, 1.0))
        
        # Feature 10: X-class solar flares in last 7 days
        solar_window = [e for e in solar_events 
                       if target_date - timedelta(days=7) <= e.event_date <= target_date]
        x_flare_count = len(solar_window)
        features.append(min(x_flare_count / 3.0, 1.0))
        
        return features
    
    # ==================== Model 2: Solar Activity → Volcanic Eruptions ====================
    
    def _train_solar_volcanic_model(self, db: Session) -> Dict[str, Any]:
        """
        Train model to predict volcanic eruptions from solar activity
        
        Features:
        - X-class solar flare count (last 14 days)
        - M-class solar flare count (last 14 days)
        - CME speed (km/s, max in last 14 days)
        - Kp index (max in last 7 days)
        - DST index (minimum in last 7 days)
        - Days since last X-class flare
        - Geomagnetic storm active (binary)
        - Solar cycle phase (0-1)
        
        Target: VEI >= 4 eruption within 14 days
        """
        
        # Fetch volcanic eruptions (VEI >= 4, last 50 years)
        volcanic_query = text("""
            SELECT 
                id,
                eruption_start_date as event_date,
                vei,
                volcano_name,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude
            FROM volcanic_activity
            WHERE vei >= 4
            AND eruption_start_date >= :start_date
            ORDER BY eruption_start_date
        """)
        
        start_date = datetime.now() - timedelta(days=365 * 50)  # 50 years
        volcanic_events = db.execute(volcanic_query, {"start_date": start_date}).fetchall()
        
        logger.info(f"Loaded {len(volcanic_events)} major volcanic eruptions (VEI >= 4)")
        
        # Fetch solar events
        solar_query = text("""
            SELECT 
                event_start as event_date,
                flare_class,
                cme_speed_km_s,
                kp_index,
                dst_index_nt
            FROM solar_events
            WHERE event_start >= :start_date
            ORDER BY event_start
        """)
        
        solar_events = db.execute(solar_query, {"start_date": start_date}).fetchall()
        logger.info(f"Loaded {len(solar_events)} solar events")
        
        # Build feature matrix
        X = []
        y = []
        
        current_date = start_date
        end_date = datetime.now()
        
        while current_date < end_date:
            features = self._extract_solar_volcanic_features(current_date, solar_events)
            
            # Target: VEI >= 4 eruption within next 14 days?
            has_eruption = any(
                current_date <= v.event_date <= current_date + timedelta(days=14)
                for v in volcanic_events
                if v.vei >= 4
            )
            
            X.append(features)
            y.append(1 if has_eruption else 0)
            
            current_date += timedelta(days=1)
        
        X = np.array(X)
        y = np.array(y)
        
        logger.info(f"Solar-volcanic matrix: {X.shape}, positive: {y.sum()}/{len(y)} ({y.sum()/len(y)*100:.1f}%)")
        
        # Train model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
        
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1_score': f1_score(y_test, y_pred, zero_division=0),
            'total_samples': len(y),
            'positive_samples': int(y.sum()),
            'feature_importance': model.feature_importances_.tolist()
        }
        
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        metrics['cv_mean'] = cv_scores.mean()
        metrics['cv_std'] = cv_scores.std()
        
        self.models['solar_volcanic'] = model
        self.scalers['solar_volcanic'] = scaler
        self.metrics['solar_volcanic'] = metrics
        
        logger.info(f"Solar → Volcanic model trained: Accuracy={metrics['accuracy']:.3f}, F1={metrics['f1_score']:.3f}")
        
        return metrics
    
    def _extract_solar_volcanic_features(self, target_date: datetime, solar_events: List[Any]) -> List[float]:
        """Extract 8 features for solar → volcanic correlation"""
        
        features = []
        
        # Last 14 days of solar activity
        window_14d = [e for e in solar_events 
                     if target_date - timedelta(days=14) <= e.event_date <= target_date]
        window_7d = [e for e in solar_events 
                    if target_date - timedelta(days=7) <= e.event_date <= target_date]
        
        # Feature 1: X-class flare count (last 14 days)
        x_flares = sum(1 for e in window_14d if e.flare_class and e.flare_class.startswith('X'))
        features.append(min(x_flares / 5.0, 1.0))
        
        # Feature 2: M-class flare count (last 14 days)
        m_flares = sum(1 for e in window_14d if e.flare_class and e.flare_class.startswith('M'))
        features.append(min(m_flares / 10.0, 1.0))
        
        # Feature 3: Max CME speed (last 14 days)
        cme_speeds = [e.cme_speed_km_s for e in window_14d if e.cme_speed_km_s]
        max_cme = max(cme_speeds) if cme_speeds else 0
        features.append(min(max_cme / 3000.0, 1.0))  # Normalize (3000 km/s = extreme)
        
        # Feature 4: Max Kp index (last 7 days)
        kp_values = [e.kp_index for e in window_7d if e.kp_index]
        max_kp = max(kp_values) if kp_values else 0
        features.append(max_kp / 9.0)  # Kp range 0-9
        
        # Feature 5: Min DST index (last 7 days)
        dst_values = [e.dst_index_nt for e in window_7d if e.dst_index_nt]
        min_dst = min(dst_values) if dst_values else 0
        features.append(min(abs(min_dst) / 500.0, 1.0))  # More negative = stronger storm
        
        # Feature 6: Days since last X-class flare
        days_since_x = 90.0
        for event in reversed(solar_events):
            if event.event_date <= target_date and event.flare_class and event.flare_class.startswith('X'):
                days_since_x = (target_date - event.event_date).days
                break
        features.append(min(days_since_x / 90.0, 1.0))
        
        # Feature 7: Geomagnetic storm active (Kp >= 6)
        storm_active = any(e.kp_index and e.kp_index >= 6 for e in window_7d)
        features.append(1.0 if storm_active else 0.0)
        
        # Feature 8: Solar cycle phase (11-year cycle, approximate)
        # Solar minimum was ~2019, next peak ~2025
        days_since_2019 = (target_date - datetime(2019, 1, 1)).days
        solar_cycle_phase = (days_since_2019 % (11 * 365)) / (11 * 365)
        features.append(solar_cycle_phase)
        
        return features
    
    # ==================== Model 3: Planetary Alignments → Hurricane Formation ====================
    
    def _train_planetary_hurricane_model(self, db: Session) -> Dict[str, Any]:
        """
        Train model to predict hurricane formation from planetary alignments
        
        Features:
        - Jupiter-Saturn conjunction proximity (days)
        - Venus-Mars conjunction proximity (days)
        - Multiple planet conjunction count (last 60 days)
        - Moon phase (0-1)
        - Days from new moon
        - Days from full moon
        - Tidal force index (Jupiter + Moon combined)
        - Planetary alignment score (0-1)
        
        Target: Category 3+ hurricane within 30 days
        """
        
        # Fetch major hurricanes (category >= 3, last 50 years)
        hurricane_query = text("""
            SELECT 
                id,
                formation_date as event_date,
                category,
                storm_name,
                basin,
                ST_Y(peak_location::geometry) as latitude,
                ST_X(peak_location::geometry) as longitude
            FROM hurricanes
            WHERE category >= 3
            AND formation_date >= :start_date
            ORDER BY formation_date
        """)
        
        start_date = datetime.now() - timedelta(days=365 * 50)
        hurricanes = db.execute(hurricane_query, {"start_date": start_date}).fetchall()
        
        logger.info(f"Loaded {len(hurricanes)} major hurricanes (Cat 3+)")
        
        # Fetch planetary conjunctions
        conjunction_query = text("""
            SELECT 
                event_date,
                description
            FROM celestial_events
            WHERE event_type = 'conjunction'
            AND event_date >= :start_date
            ORDER BY event_date
        """)
        
        conjunctions = db.execute(conjunction_query, {"start_date": start_date}).fetchall()
        logger.info(f"Loaded {len(conjunctions)} planetary conjunctions")
        
        # Build feature matrix
        X = []
        y = []
        
        current_date = start_date
        end_date = datetime.now()
        
        while current_date < end_date:
            features = self._extract_planetary_hurricane_features(current_date, conjunctions)
            
            # Target: Category 3+ hurricane within next 30 days?
            has_hurricane = any(
                current_date <= h.event_date <= current_date + timedelta(days=30)
                for h in hurricanes
                if h.category >= 3
            )
            
            X.append(features)
            y.append(1 if has_hurricane else 0)
            
            current_date += timedelta(days=1)
        
        X = np.array(X)
        y = np.array(y)
        
        logger.info(f"Planetary-hurricane matrix: {X.shape}, positive: {y.sum()}/{len(y)} ({y.sum()/len(y)*100:.1f}%)")
        
        # Train model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=15,
            random_state=42,
            class_weight='balanced'
        )
        
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1_score': f1_score(y_test, y_pred, zero_division=0),
            'total_samples': len(y),
            'positive_samples': int(y.sum()),
            'feature_importance': model.feature_importances_.tolist()
        }
        
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        metrics['cv_mean'] = cv_scores.mean()
        metrics['cv_std'] = cv_scores.std()
        
        self.models['planetary_hurricanes'] = model
        self.scalers['planetary_hurricanes'] = scaler
        self.metrics['planetary_hurricanes'] = metrics
        
        logger.info(f"Planetary → Hurricane model trained: Accuracy={metrics['accuracy']:.3f}, F1={metrics['f1_score']:.3f}")
        
        return metrics
    
    def _extract_planetary_hurricane_features(self, target_date: datetime, conjunctions: List[Any]) -> List[float]:
        """Extract 8 features for planetary → hurricane correlation"""
        
        features = []
        
        # Recent conjunctions (last 60 days)
        window = [c for c in conjunctions 
                 if target_date - timedelta(days=60) <= c.event_date <= target_date]
        
        # Feature 1: Jupiter-Saturn conjunction proximity (days to nearest)
        js_conjunctions = [c for c in conjunctions 
                          if 'jupiter' in c.description.lower() and 'saturn' in c.description.lower()]
        days_to_js = 365.0
        for c in js_conjunctions:
            days_diff = abs((target_date - c.event_date).days)
            if days_diff < days_to_js:
                days_to_js = days_diff
        features.append(min(days_to_js / 365.0, 1.0))
        
        # Feature 2: Venus-Mars conjunction proximity
        vm_conjunctions = [c for c in conjunctions 
                          if 'venus' in c.description.lower() and 'mars' in c.description.lower()]
        days_to_vm = 180.0
        for c in vm_conjunctions:
            days_diff = abs((target_date - c.event_date).days)
            if days_diff < days_to_vm:
                days_to_vm = days_diff
        features.append(min(days_to_vm / 180.0, 1.0))
        
        # Feature 3: Multiple planet conjunction count (last 60 days)
        conjunction_count = len(window)
        features.append(min(conjunction_count / 5.0, 1.0))
        
        # Feature 4: Moon phase (0=new, 0.5=full, 1=new)
        lunar_cycle = 29.53
        days_in_cycle = (target_date - datetime(2000, 1, 6)).days % lunar_cycle
        moon_phase = days_in_cycle / lunar_cycle
        features.append(moon_phase)
        
        # Feature 5: Days from new moon
        days_from_new = min(days_in_cycle, lunar_cycle - days_in_cycle)
        features.append(days_from_new / (lunar_cycle / 2))
        
        # Feature 6: Days from full moon
        days_from_full = abs(days_in_cycle - lunar_cycle / 2)
        features.append(days_from_full / (lunar_cycle / 2))
        
        # Feature 7: Tidal force index (simplified, new/full moon = higher)
        # Combine moon phase with Jupiter position (approximate)
        tidal_index = 1.0 - abs(moon_phase - 0.5) * 2  # 1 at new/full, 0 at quarters
        features.append(tidal_index)
        
        # Feature 8: Planetary alignment score (more conjunctions = higher score)
        recent_count = sum(1 for c in conjunctions 
                          if target_date - timedelta(days=30) <= c.event_date <= target_date)
        alignment_score = min(recent_count / 3.0, 1.0)
        features.append(alignment_score)
        
        return features
    
    # ==================== Model 4: Lunar Cycles → Tsunami Risk ====================
    
    def _train_lunar_tsunami_model(self, db: Session) -> Dict[str, Any]:
        """
        Train model to predict tsunami risk from lunar cycles
        
        Features:
        - Moon phase (0-1)
        - Days to new moon
        - Days to full moon
        - Spring tide proximity (binary, new/full moon ± 2 days)
        - Perigee proximity (moon closest to Earth)
        - Recent earthquake M >= 7.0 (last 7 days, coastal)
        - Tidal range index
        - Lunar declination (extreme tides)
        
        Target: Intensity >= 6 tsunami within 3 days
        """
        
        # Fetch major tsunamis (intensity >= 6, last 50 years)
        tsunami_query = text("""
            SELECT 
                id,
                event_date,
                intensity_scale,
                source_type,
                earthquake_magnitude,
                ST_Y(source_location::geometry) as latitude,
                ST_X(source_location::geometry) as longitude
            FROM tsunamis
            WHERE intensity_scale >= 6
            AND event_date >= :start_date
            ORDER BY event_date
        """)
        
        start_date = datetime.now() - timedelta(days=365 * 50)
        tsunamis = db.execute(tsunami_query, {"start_date": start_date}).fetchall()
        
        logger.info(f"Loaded {len(tsunamis)} major tsunamis (Intensity >= 6)")
        
        # Fetch coastal earthquakes (M >= 7.0)
        earthquake_query = text("""
            SELECT 
                event_time as event_date,
                magnitude,
                ST_Y(location::geometry) as latitude,
                ST_X(location::geometry) as longitude
            FROM earthquakes
            WHERE magnitude >= 7.0
            AND event_time >= :start_date
            ORDER BY event_time
        """)
        
        earthquakes = db.execute(earthquake_query, {"start_date": start_date}).fetchall()
        logger.info(f"Loaded {len(earthquakes)} major earthquakes (M >= 7.0)")
        
        # Build feature matrix
        X = []
        y = []
        
        current_date = start_date
        end_date = datetime.now()
        
        while current_date < end_date:
            features = self._extract_lunar_tsunami_features(current_date, earthquakes)
            
            # Target: Intensity >= 6 tsunami within next 3 days?
            has_tsunami = any(
                current_date <= t.event_date <= current_date + timedelta(days=3)
                for t in tsunamis
                if t.intensity_scale >= 6
            )
            
            X.append(features)
            y.append(1 if has_tsunami else 0)
            
            current_date += timedelta(days=1)
        
        X = np.array(X)
        y = np.array(y)
        
        logger.info(f"Lunar-tsunami matrix: {X.shape}, positive: {y.sum()}/{len(y)} ({y.sum()/len(y)*100:.1f}%)")
        
        # Train model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
        
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1_score': f1_score(y_test, y_pred, zero_division=0),
            'total_samples': len(y),
            'positive_samples': int(y.sum()),
            'feature_importance': model.feature_importances_.tolist()
        }
        
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        metrics['cv_mean'] = cv_scores.mean()
        metrics['cv_std'] = cv_scores.std()
        
        self.models['lunar_tsunamis'] = model
        self.scalers['lunar_tsunamis'] = scaler
        self.metrics['lunar_tsunamis'] = metrics
        
        logger.info(f"Lunar → Tsunami model trained: Accuracy={metrics['accuracy']:.3f}, F1={metrics['f1_score']:.3f}")
        
        return metrics
    
    def _extract_lunar_tsunami_features(self, target_date: datetime, earthquakes: List[Any]) -> List[float]:
        """Extract 8 features for lunar → tsunami correlation"""
        
        features = []
        
        # Lunar cycle calculations
        lunar_cycle = 29.53
        days_in_cycle = (target_date - datetime(2000, 1, 6)).days % lunar_cycle
        
        # Feature 1: Moon phase
        moon_phase = days_in_cycle / lunar_cycle
        features.append(moon_phase)
        
        # Feature 2: Days to new moon
        days_to_new = days_in_cycle if days_in_cycle <= lunar_cycle / 2 else lunar_cycle - days_in_cycle
        features.append(days_to_new / (lunar_cycle / 2))
        
        # Feature 3: Days to full moon
        days_to_full = abs(days_in_cycle - lunar_cycle / 2)
        features.append(days_to_full / (lunar_cycle / 2))
        
        # Feature 4: Spring tide proximity (new or full moon ± 2 days)
        is_spring_tide = days_to_new <= 2 or days_to_full <= 2
        features.append(1.0 if is_spring_tide else 0.0)
        
        # Feature 5: Perigee proximity (moon closest, ~27.5 day cycle)
        perigee_cycle = 27.5
        days_in_perigee = (target_date - datetime(2000, 1, 3)).days % perigee_cycle
        days_to_perigee = min(days_in_perigee, perigee_cycle - days_in_perigee)
        features.append(days_to_perigee / (perigee_cycle / 2))
        
        # Feature 6: Recent coastal earthquake M >= 7.0 (last 7 days)
        recent_earthquakes = [e for e in earthquakes 
                             if target_date - timedelta(days=7) <= e.event_date <= target_date
                             and e.magnitude >= 7.0]
        has_major_quake = len(recent_earthquakes) > 0
        features.append(1.0 if has_major_quake else 0.0)
        
        # Feature 7: Tidal range index (combination of spring tide + perigee)
        tidal_range = (1.0 if is_spring_tide else 0.5) * (1.0 - days_to_perigee / (perigee_cycle / 2))
        features.append(tidal_range)
        
        # Feature 8: Lunar declination extreme (simplified, 18.6-year cycle)
        declination_cycle = 18.6 * 365.25
        days_in_decl = (target_date - datetime(2006, 3, 21)).days % declination_cycle
        declination_factor = 1.0 - abs(days_in_decl - declination_cycle / 2) / (declination_cycle / 2)
        features.append(declination_factor)
        
        return features
    
    # ==================== Overall Metrics ====================
    
    def _calculate_overall_metrics(self) -> Dict[str, float]:
        """Calculate overall correlation strength across all models"""
        
        if not self.metrics:
            return {}
        
        all_accuracies = [m['accuracy'] for m in self.metrics.values()]
        all_f1_scores = [m['f1_score'] for m in self.metrics.values()]
        
        overall = {
            'mean_accuracy': np.mean(all_accuracies),
            'std_accuracy': np.std(all_accuracies),
            'mean_f1_score': np.mean(all_f1_scores),
            'std_f1_score': np.std(all_f1_scores),
            'models_above_75_accuracy': sum(1 for acc in all_accuracies if acc >= 0.75),
            'total_models': len(all_accuracies),
            'success_rate': sum(1 for acc in all_accuracies if acc >= 0.75) / len(all_accuracies) if all_accuracies else 0
        }
        
        return overall
    
    # ==================== Prediction Methods ====================
    
    def predict_earthquake_risk(self, date: datetime, celestial_features: List[float]) -> float:
        """Predict earthquake risk (0-1) for given date based on celestial features"""
        if 'celestial_earthquakes' not in self.models:
            return 0.0
        
        model = self.models['celestial_earthquakes']
        scaler = self.scalers['celestial_earthquakes']
        
        X = np.array([celestial_features])
        X_scaled = scaler.transform(X)
        
        # Return probability of earthquake
        return model.predict_proba(X_scaled)[0][1]
    
    def predict_volcanic_risk(self, date: datetime, solar_features: List[float]) -> float:
        """Predict volcanic eruption risk (0-1) for given date based on solar features"""
        if 'solar_volcanic' not in self.models:
            return 0.0
        
        model = self.models['solar_volcanic']
        scaler = self.scalers['solar_volcanic']
        
        X = np.array([solar_features])
        X_scaled = scaler.transform(X)
        
        return model.predict_proba(X_scaled)[0][1]
    
    def predict_hurricane_risk(self, date: datetime, planetary_features: List[float]) -> float:
        """Predict hurricane formation risk (0-1) for given date based on planetary features"""
        if 'planetary_hurricanes' not in self.models:
            return 0.0
        
        model = self.models['planetary_hurricanes']
        scaler = self.scalers['planetary_hurricanes']
        
        X = np.array([planetary_features])
        X_scaled = scaler.transform(X)
        
        return model.predict_proba(X_scaled)[0][1]
    
    def predict_tsunami_risk(self, date: datetime, lunar_features: List[float]) -> float:
        """Predict tsunami risk (0-1) for given date based on lunar features"""
        if 'lunar_tsunamis' not in self.models:
            return 0.0
        
        model = self.models['lunar_tsunamis']
        scaler = self.scalers['lunar_tsunamis']
        
        X = np.array([lunar_features])
        X_scaled = scaler.transform(X)
        
        return model.predict_proba(X_scaled)[0][1]
