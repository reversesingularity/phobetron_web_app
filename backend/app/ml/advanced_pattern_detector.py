"""
Advanced ML Pattern Detection Engine
Provides predictive analytics and statistical analysis for celestial-terrestrial correlations
"""

import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from scipy import stats
from sklearn.ensemble import IsolationForest, RandomForestClassifier
import logging

logger = logging.getLogger(__name__)

@dataclass
class PatternPrediction:
    feast_day: str
    feast_date: str
    risk_score: float  # 0-100
    confidence: float  # 0-1
    predicted_event_types: List[str]
    probability_by_type: Dict[str, float]
    historical_correlation: float
    anomaly_score: float

@dataclass
class StatisticalAnalysis:
    pearson_correlation: float
    spearman_correlation: float
    p_value: float
    confidence_interval_95: Tuple[float, float]
    confidence_interval_99: Tuple[float, float]
    sample_size: int
    is_significant: bool

class AdvancedPatternDetector:
    """
    Enhanced pattern detection with ML predictions and statistical rigor
    """
    
    def __init__(self):
        self.window_days = 7
        self.anomaly_detector = IsolationForest(
            contamination=0.1,
            random_state=42
        )
        self.pattern_classifier = None
        
    def calculate_statistical_significance(
        self,
        feast_correlations: List[float],
        baseline_correlations: List[float]
    ) -> StatisticalAnalysis:
        """
        Perform rigorous statistical analysis on correlations
        """
        # Pearson correlation coefficient
        if len(feast_correlations) > 1 and len(baseline_correlations) > 1:
            pearson_r, pearson_p = stats.pearsonr(
                feast_correlations,
                baseline_correlations
            )
        else:
            pearson_r, pearson_p = 0, 1
            
        # Spearman rank correlation
        if len(feast_correlations) > 1 and len(baseline_correlations) > 1:
            spearman_r, spearman_p = stats.spearmanr(
                feast_correlations,
                baseline_correlations
            )
        else:
            spearman_r, spearman_p = 0, 1
            
        # Confidence intervals using bootstrap
        ci_95 = self._bootstrap_confidence_interval(feast_correlations, 0.95)
        ci_99 = self._bootstrap_confidence_interval(feast_correlations, 0.99)
        
        return StatisticalAnalysis(
            pearson_correlation=pearson_r,
            spearman_correlation=spearman_r,
            p_value=min(pearson_p, spearman_p),
            confidence_interval_95=ci_95,
            confidence_interval_99=ci_99,
            sample_size=len(feast_correlations),
            is_significant=(min(pearson_p, spearman_p) < 0.05)
        )
    
    def _bootstrap_confidence_interval(
        self,
        data: List[float],
        confidence_level: float,
        n_iterations: int = 1000
    ) -> Tuple[float, float]:
        """
        Calculate confidence interval using bootstrap resampling
        """
        if len(data) == 0:
            return (0.0, 0.0)
            
        bootstrapped_means = []
        for _ in range(n_iterations):
            sample = np.random.choice(data, size=len(data), replace=True)
            bootstrapped_means.append(np.mean(sample))
        
        alpha = 1 - confidence_level
        lower = np.percentile(bootstrapped_means, alpha / 2 * 100)
        upper = np.percentile(bootstrapped_means, (1 - alpha / 2) * 100)
        
        return (float(lower), float(upper))
    
    def detect_anomalies(
        self,
        pattern_features: np.ndarray
    ) -> List[bool]:
        """
        Detect anomalous patterns using Isolation Forest
        """
        if len(pattern_features) == 0:
            return []
            
        try:
            # Reshape if needed
            if len(pattern_features.shape) == 1:
                pattern_features = pattern_features.reshape(-1, 1)
                
            predictions = self.anomaly_detector.fit_predict(pattern_features)
            # -1 = anomaly, 1 = normal
            return [p == -1 for p in predictions]
        except Exception as e:
            logger.error(f"Anomaly detection failed: {e}")
            return [False] * len(pattern_features)
    
    def calculate_bayesian_probability(
        self,
        feast_day: str,
        event_type: str,
        historical_patterns: List[Dict]
    ) -> float:
        """
        Calculate Bayesian probability of event occurrence
        
        P(Event|Feast) = P(Feast|Event) * P(Event) / P(Feast)
        """
        # Count events around this feast type
        feast_with_events = sum(
            1 for p in historical_patterns
            if p['feast_day'] == feast_day and any(
                e['type'] == event_type for e in p.get('events', [])
            )
        )
        
        # Total occurrences of this feast
        total_feast_occurrences = sum(
            1 for p in historical_patterns
            if p['feast_day'] == feast_day
        )
        
        # Total events of this type
        total_events = sum(
            len([e for e in p.get('events', []) if e['type'] == event_type])
            for p in historical_patterns
        )
        
        # Total patterns
        total_patterns = len(historical_patterns)
        
        if total_feast_occurrences == 0 or total_patterns == 0:
            return 0.0
        
        # P(Feast|Event)
        p_feast_given_event = feast_with_events / max(total_events, 1)
        
        # P(Event)
        p_event = total_events / total_patterns
        
        # P(Feast)
        p_feast = total_feast_occurrences / total_patterns
        
        # Bayes' theorem
        if p_feast > 0:
            probability = (p_feast_given_event * p_event) / p_feast
        else:
            probability = 0.0
        
        return min(probability, 1.0)  # Cap at 1.0
    
    def predict_future_patterns(
        self,
        upcoming_feast_days: List[Dict],
        historical_patterns: List[Dict],
        forecast_horizon_days: int = 90
    ) -> List[PatternPrediction]:
        """
        Predict high-risk periods for upcoming feast days
        """
        predictions = []
        
        for feast in upcoming_feast_days:
            # Handle both string and date object types
            feast_date_raw = feast['gregorian_date']
            if isinstance(feast_date_raw, str):
                feast_date = datetime.fromisoformat(feast_date_raw)
            else:
                feast_date = datetime.combine(feast_date_raw, datetime.min.time())
            feast_name = feast['name']
            
            # Calculate historical correlation for this feast type
            historical_correlations = [
                p['correlation_score'] for p in historical_patterns
                if p.get('feast_day') == feast_name
            ]
            
            avg_correlation = np.mean(historical_correlations) if historical_correlations else 0
            
            # Calculate Bayesian probabilities for each event type
            event_types = ['earthquake', 'volcanic', 'hurricane', 'tsunami']
            probability_by_type = {}
            predicted_types = []
            
            for event_type in event_types:
                prob = self.calculate_bayesian_probability(
                    feast_name,
                    event_type,
                    historical_patterns
                )
                probability_by_type[event_type] = prob
                
                # Include if probability > 30%
                if prob > 0.3:
                    predicted_types.append(event_type)
            
            # Calculate risk score (weighted combination)
            risk_score = (
                avg_correlation * 0.4 +  # Historical correlation weight
                max(probability_by_type.values()) * 0.6  # Max probability weight
            )
            
            # Confidence based on sample size
            confidence = min(len(historical_correlations) / 10.0, 1.0)
            
            # Anomaly score (higher = more unusual)
            anomaly_score = 0.0
            if historical_correlations:
                # Standard deviations from mean
                std_dev = np.std(historical_correlations)
                if std_dev > 0:
                    anomaly_score = abs(avg_correlation - np.mean(historical_correlations)) / std_dev
            
            predictions.append(PatternPrediction(
                feast_day=feast_name,
                feast_date=feast['gregorian_date'],
                risk_score=risk_score,
                confidence=confidence,
                predicted_event_types=predicted_types,
                probability_by_type=probability_by_type,
                historical_correlation=avg_correlation,
                anomaly_score=float(anomaly_score)
            ))
        
        # Sort by risk score descending
        predictions.sort(key=lambda x: x.risk_score, reverse=True)
        
        return predictions
    
    def generate_correlation_matrix(
        self,
        patterns: List[Dict]
    ) -> Dict[str, Dict[str, float]]:
        """
        Generate feast day × event type correlation matrix for heatmap
        """
        feast_days = list(set(p['feast_day'] for p in patterns))
        event_types = ['earthquake', 'volcanic', 'hurricane', 'tsunami']
        
        matrix = {}
        
        for feast in feast_days:
            matrix[feast] = {}
            
            for event_type in event_types:
                # Count patterns with this feast + event type
                matching_patterns = [
                    p for p in patterns
                    if p['feast_day'] == feast and any(
                        e['type'] == event_type for e in p.get('events', [])
                    )
                ]
                
                # Average correlation score
                if matching_patterns:
                    avg_score = np.mean([p['correlation_score'] for p in matching_patterns])
                else:
                    avg_score = 0.0
                
                matrix[feast][event_type] = avg_score
        
        return matrix
    
    def calculate_seasonal_patterns(
        self,
        patterns: List[Dict]
    ) -> Dict[str, Dict[str, float]]:
        """
        Detect seasonal/monthly patterns in correlations
        """
        seasonal_data = {
            'Spring': {'count': 0, 'avg_correlation': 0.0, 'events': []},
            'Summer': {'count': 0, 'avg_correlation': 0.0, 'events': []},
            'Fall': {'count': 0, 'avg_correlation': 0.0, 'events': []},
            'Winter': {'count': 0, 'avg_correlation': 0.0, 'events': []}
        }
        
        for pattern in patterns:
            date = datetime.fromisoformat(pattern['feast_date'])
            month = date.month
            
            # Determine season
            if month in [3, 4, 5]:
                season = 'Spring'
            elif month in [6, 7, 8]:
                season = 'Summer'
            elif month in [9, 10, 11]:
                season = 'Fall'
            else:
                season = 'Winter'
            
            seasonal_data[season]['count'] += 1
            seasonal_data[season]['events'].append(pattern['correlation_score'])
        
        # Calculate averages
        for season in seasonal_data:
            if seasonal_data[season]['events']:
                seasonal_data[season]['avg_correlation'] = np.mean(
                    seasonal_data[season]['events']
                )
        
        return seasonal_data

# Global instance
advanced_detector = AdvancedPatternDetector()
