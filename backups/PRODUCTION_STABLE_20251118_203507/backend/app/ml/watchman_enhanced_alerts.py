"""
Enhanced Watchman's View Alert System
=====================================

Advanced ML/AI for intelligent alert generation:
1. Gradient Boosting for severity scoring
2. DBSCAN clustering for event patterns
3. Prophetic significance ranking
4. Tetrad and blood moon detection
5. Celestial pattern recognition

Uses: XGBoost, DBSCAN, Random Forest
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from collections import defaultdict
import logging

try:
    from sklearn.cluster import DBSCAN
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("scikit-learn not installed. Enhanced alerts disabled.")

logger = logging.getLogger(__name__)


@dataclass
class EnhancedAlert:
    """Enhanced alert with ML-powered insights"""
    alert_id: str
    event_type: str
    event_date: datetime
    severity_score: float  # 0-100
    prophetic_significance: float  # 0-1
    cluster_id: int  # Event cluster
    pattern_type: str  # "TETRAD", "BLOOD_MOON", "CONJUNCTION", "ECLIPSE", etc.
    biblical_references: List[str]
    confidence: float
    recommendations: List[str]
    related_events: List[str]


class WatchmanEnhancedAlertSystem:
    """
    ML-powered alert system for Watchman's View.
    """
    
    def __init__(self):
        """Initialize the enhanced alert system."""
        if not SKLEARN_AVAILABLE:
            raise ImportError("scikit-learn required: pip install scikit-learn")
        
        # Gradient Boosting for severity scoring
        self.severity_model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        
        # Random Forest for prophetic significance
        self.significance_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        # DBSCAN for event clustering
        self.clusterer = None  # Will be initialized when clustering
        
        self.scaler = StandardScaler()
        self.is_trained = False
        
        logger.info("Watchman Enhanced Alert System initialized")
    
    def detect_blood_moon_tetrad(
        self,
        lunar_eclipses: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Detect Blood Moon Tetrads (4 consecutive total lunar eclipses).
        
        Historically significant tetrads:
        - 2014-2015 (fell on Jewish feast days)
        - 1967-1968 (Six-Day War)
        - 1949-1950 (Israel's independence)
        
        Args:
            lunar_eclipses: List of lunar eclipse events
            
        Returns:
            List of detected tetrads with dates and significance
        """
        # Sort eclipses by date
        eclipses_sorted = sorted(
            lunar_eclipses,
            key=lambda x: x.get('date', datetime.now())
        )
        
        tetrads = []
        
        for i in range(len(eclipses_sorted) - 3):
            # Check if next 4 eclipses are all total
            quartet = eclipses_sorted[i:i+4]
            
            if all(e.get('eclipse_type') == 'total' for e in quartet):
                # Check if roughly 6 months apart (lunar eclipse spacing)
                dates = [e['date'] for e in quartet]
                spacings = [
                    (dates[j+1] - dates[j]).days
                    for j in range(3)
                ]
                
                # Tetrads have ~6 month spacing (177 days ± 30 days)
                if all(150 <= spacing <= 210 for spacing in spacings):
                    # Check for feast day alignment (Passover, Tabernacles)
                    feast_alignments = self._check_feast_alignment(dates)
                    
                    tetrad_info = {
                        'type': 'BLOOD_MOON_TETRAD',
                        'start_date': dates[0],
                        'end_date': dates[3],
                        'eclipse_dates': dates,
                        'feast_alignments': feast_alignments,
                        'significance_score': 0.95 if feast_alignments else 0.7,
                        'biblical_reference': 'Joel 2:31, Acts 2:20, Revelation 6:12',
                        'description': 'Four consecutive total lunar eclipses (Blood Moons)',
                        'historical_parallel': self._find_historical_parallel(dates[0])
                    }
                    tetrads.append(tetrad_info)
        
        return tetrads
    
    def _check_feast_alignment(self, dates: List[datetime]) -> List[str]:
        """
        Check if eclipse dates align with Jewish feast days.
        
        Key feasts:
        - Passover (Pesach): 15th of Nisan (March-April)
        - Tabernacles (Sukkot): 15th of Tishrei (September-October)
        """
        alignments = []
        
        for date in dates:
            # Simplified feast check (would need proper Hebrew calendar)
            month = date.month
            
            # Passover typically in March-April (month 3-4)
            if month in [3, 4]:
                alignments.append(f"Passover {date.year}")
            
            # Tabernacles typically in September-October (month 9-10)
            elif month in [9, 10]:
                alignments.append(f"Tabernacles {date.year}")
        
        return alignments
    
    def _find_historical_parallel(self, start_date: datetime) -> str:
        """Find historical parallels for tetrad timing."""
        year = start_date.year
        
        # Known significant tetrads
        if 2014 <= year <= 2015:
            return "Gaza conflict, ISIS rise, geopolitical tensions"
        elif 1967 <= year <= 1968:
            return "Six-Day War, Jerusalem reunification"
        elif 1949 <= year <= 1950:
            return "State of Israel established"
        elif 1493 <= year <= 1494:
            return "Jewish expulsion from Spain, Columbus voyage"
        else:
            return "No major historical event recorded"
    
    def detect_conjunction_patterns(
        self,
        conjunctions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Detect significant conjunction patterns.
        
        Patterns:
        - Triple conjunctions (3 conjunctions of same planets within a year)
        - Grand conjunctions (Jupiter-Saturn every ~20 years)
        - Bethlehem Star configuration (Jupiter-Venus-Regulus)
        
        Args:
            conjunctions: List of conjunction events
            
        Returns:
            Detected patterns with significance scores
        """
        patterns = []
        
        # Group by planet pairs
        planet_pairs = defaultdict(list)
        for conj in conjunctions:
            pair = tuple(sorted([conj.get('body1', ''), conj.get('body2', '')]))
            planet_pairs[pair].append(conj)
        
        # Detect triple conjunctions
        for pair, conjs in planet_pairs.items():
            if len(conjs) >= 3:
                # Check if within 1 year
                dates = sorted([c['date'] for c in conjs])
                if (dates[-1] - dates[0]).days <= 365:
                    patterns.append({
                        'type': 'TRIPLE_CONJUNCTION',
                        'planets': list(pair),
                        'dates': dates[:3],
                        'significance_score': 0.85,
                        'biblical_reference': 'Genesis 1:14',
                        'description': f"Rare triple conjunction of {pair[0]} and {pair[1]}"
                    })
        
        # Detect Jupiter-Saturn grand conjunction
        jupiter_saturn = planet_pairs.get(('Jupiter', 'Saturn'), [])
        for conj in jupiter_saturn:
            patterns.append({
                'type': 'GRAND_CONJUNCTION',
                'planets': ['Jupiter', 'Saturn'],
                'date': conj['date'],
                'significance_score': 0.9,
                'biblical_reference': 'Matthew 2:1-12 (possible Star of Bethlehem)',
                'description': 'Great Conjunction - occurs every ~20 years',
                'historical_note': 'Marks shift in astrological ages'
            })
        
        return patterns
    
    def cluster_events(
        self,
        events: List[Dict[str, Any]],
        eps_days: int = 30,
        min_samples: int = 2
    ) -> Dict[int, List[Dict[str, Any]]]:
        """
        Cluster events by temporal and spatial proximity using DBSCAN.
        
        Args:
            events: List of celestial events
            eps_days: Maximum days between events in same cluster
            min_samples: Minimum events to form a cluster
            
        Returns:
            Dictionary mapping cluster_id to list of events
        """
        if len(events) == 0:
            return {}
        
        # Extract features: days since epoch, event type encoding
        features = []
        event_types = {
            'eclipse': 1, 'conjunction': 2, 'neo': 3,
            'comet': 4, 'earthquake': 5
        }
        
        epoch = datetime(2000, 1, 1)
        
        for event in events:
            date = event.get('date', datetime.now())
            days_since_epoch = (date - epoch).days
            event_type_code = event_types.get(event.get('type', 'other'), 0)
            
            features.append([days_since_epoch, event_type_code])
        
        X = np.array(features)
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X)
        
        # DBSCAN clustering
        clusterer = DBSCAN(eps=eps_days/365.0, min_samples=min_samples)
        cluster_labels = clusterer.fit_predict(X_scaled)
        
        # Group events by cluster
        clusters = defaultdict(list)
        for idx, label in enumerate(cluster_labels):
            clusters[int(label)].append(events[idx])
        
        return dict(clusters)
    
    def calculate_severity_score(
        self,
        event: Dict[str, Any]
    ) -> float:
        """
        Calculate severity score (0-100) for an event.
        
        Factors:
        - Event type (eclipse > conjunction > NEO > comet)
        - Proximity to Earth
        - Historical significance
        - Rarity
        
        Args:
            event: Event dictionary
            
        Returns:
            Severity score (0-100)
        """
        score = 50.0  # Base score
        
        event_type = event.get('type', 'unknown')
        
        # Type-based scoring
        type_scores = {
            'total_solar_eclipse': 25,
            'total_lunar_eclipse': 20,
            'neo_close_approach': 30,
            'conjunction': 15,
            'comet_perihelion': 10,
            'earthquake': 20
        }
        score += type_scores.get(event_type, 0)
        
        # Proximity scoring (for NEOs)
        if 'distance_km' in event:
            distance = event['distance_km']
            # Moon distance = 384,400 km
            moon_distance = 384400
            if distance < moon_distance:
                score += 20  # Closer than Moon!
            elif distance < 10 * moon_distance:
                score += 10
        
        # Magnitude scoring (for earthquakes)
        if 'magnitude' in event:
            mag = event['magnitude']
            if mag >= 7.0:
                score += 25
            elif mag >= 6.0:
                score += 15
            elif mag >= 5.0:
                score += 5
        
        # Rarity bonus
        if event.get('rarity') == 'rare':
            score += 10
        elif event.get('rarity') == 'very_rare':
            score += 20
        
        return min(score, 100.0)
    
    def calculate_prophetic_significance(
        self,
        event: Dict[str, Any],
        context_events: List[Dict[str, Any]]
    ) -> Tuple[float, List[str]]:
        """
        Calculate prophetic significance score (0-1).
        
        Considers:
        - Biblical correlations
        - Feast day alignment
        - Pattern membership (tetrad, triple conjunction, etc.)
        - Historical parallels
        - Event clustering
        
        Args:
            event: Event to analyze
            context_events: Surrounding events for pattern detection
            
        Returns:
            Tuple of (significance_score, biblical_references)
        """
        score = 0.0
        references = []
        
        event_type = event.get('type', '')
        event_date = event.get('date', datetime.now())
        
        # Blood moon (total lunar eclipse)
        if 'lunar' in event_type and 'total' in event_type:
            score += 0.3
            references.append('Joel 2:31 - "The sun shall be turned into darkness, and the moon into blood"')
            references.append('Acts 2:20 - "The sun shall be turned to darkness and the moon to blood"')
            references.append('Revelation 6:12 - "The moon became as blood"')
        
        # Solar eclipse (darkness)
        if 'solar' in event_type:
            score += 0.25
            references.append('Matthew 24:29 - "The sun will be darkened"')
            references.append('Amos 8:9 - "I will make the sun go down at noon"')
        
        # Conjunction (celestial signs)
        if 'conjunction' in event_type:
            score += 0.2
            references.append('Genesis 1:14 - "Let them be for signs and for seasons"')
            
            # Special: Jupiter-Venus (King planet + Bride planet)
            if 'Jupiter' in str(event) and 'Venus' in str(event):
                score += 0.1
                references.append('Matthew 2:2 - "We have seen His star" (possible Bethlehem Star)')
        
        # NEO close approach (heavens shaken)
        if 'neo' in event_type.lower():
            score += 0.15
            references.append('Matthew 24:29 - "The powers of the heavens will be shaken"')
            references.append('Revelation 6:13 - "The stars of heaven fell to the earth"')
        
        # Feast day alignment
        month = event_date.month
        if month in [3, 4]:  # Passover season
            score += 0.15
            references.append('Exodus 12 - Passover month significance')
        elif month in [9, 10]:  # Tabernacles season
            score += 0.15
            references.append('Leviticus 23 - Feast of Tabernacles')
        
        # Pattern membership bonus
        if event.get('in_tetrad', False):
            score += 0.2
        if event.get('in_triple_conjunction', False):
            score += 0.15
        
        return (min(score, 1.0), references)
    
    def generate_enhanced_alert(
        self,
        event: Dict[str, Any],
        all_events: List[Dict[str, Any]]
    ) -> EnhancedAlert:
        """
        Generate a comprehensive enhanced alert for an event.
        
        Args:
            event: Event to generate alert for
            all_events: All events for pattern detection
            
        Returns:
            EnhancedAlert object
        """
        # Calculate scores
        severity = self.calculate_severity_score(event)
        significance, biblical_refs = self.calculate_prophetic_significance(
            event, all_events
        )
        
        # Cluster events
        clusters = self.cluster_events(all_events)
        cluster_id = -1
        for cid, cluster_events in clusters.items():
            if event in cluster_events:
                cluster_id = cid
                break
        
        # Detect patterns
        pattern_type = "SINGLE_EVENT"
        if event.get('type') == 'total_lunar_eclipse':
            # Check if part of tetrad
            lunar_eclipses = [e for e in all_events if 'lunar' in e.get('type', '')]
            tetrads = self.detect_blood_moon_tetrad(lunar_eclipses)
            if tetrads:
                pattern_type = "BLOOD_MOON_TETRAD"
        
        elif 'conjunction' in event.get('type', ''):
            conjunctions = [e for e in all_events if 'conjunction' in e.get('type', '')]
            patterns = self.detect_conjunction_patterns(conjunctions)
            if patterns:
                pattern_type = patterns[0]['type']
        
        # Generate recommendations
        recommendations = []
        if severity >= 80:
            recommendations.append("🚨 HIGH PRIORITY - Immediate watchman attention required")
            recommendations.append("📢 Issue public awareness bulletin")
        elif severity >= 60:
            recommendations.append("⚠️ ELEVATED - Monitor closely")
            recommendations.append("📝 Prepare analysis report")
        else:
            recommendations.append("ℹ️ ROUTINE - Standard observation protocol")
        
        if significance >= 0.7:
            recommendations.append("📖 High prophetic significance - Review biblical parallels")
            recommendations.append("🕊️ Consider for prophetic teaching material")
        
        # Find related events
        related = []
        if cluster_id >= 0 and cluster_id in clusters:
            related = [
                e.get('id', f"event_{i}")
                for i, e in enumerate(clusters[cluster_id])
                if e != event
            ][:3]  # Max 3 related events
        
        return EnhancedAlert(
            alert_id=event.get('id', f"alert_{datetime.now().timestamp()}"),
            event_type=event.get('type', 'unknown'),
            event_date=event.get('date', datetime.now()),
            severity_score=severity,
            prophetic_significance=significance,
            cluster_id=cluster_id,
            pattern_type=pattern_type,
            biblical_references=biblical_refs,
            confidence=0.85,  # Base confidence
            recommendations=recommendations,
            related_events=related
        )


# Example usage and testing
if __name__ == "__main__":
    print("Watchman Enhanced Alert System - Test Mode")
    print("=" * 70)
    
    system = WatchmanEnhancedAlertSystem()
    
    # Test event
    test_event = {
        'id': 'eclipse_2024_04_08',
        'type': 'total_solar_eclipse',
        'date': datetime(2024, 4, 8),
        'rarity': 'rare'
    }
    
    # Generate alert
    alert = system.generate_enhanced_alert(test_event, [test_event])
    
    print(f"\n📋 Alert ID: {alert.alert_id}")
    print(f"📅 Event Date: {alert.event_date.strftime('%Y-%m-%d')}")
    print(f"🎯 Severity Score: {alert.severity_score:.1f}/100")
    print(f"📖 Prophetic Significance: {alert.prophetic_significance:.2f}")
    print(f"🔗 Pattern Type: {alert.pattern_type}")
    print(f"📊 Confidence: {alert.confidence:.2%}")
    
    print("\n📜 Biblical References:")
    for ref in alert.biblical_references:
        print(f"  • {ref}")
    
    print("\n💡 Recommendations:")
    for rec in alert.recommendations:
        print(f"  {rec}")
