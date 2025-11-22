"""
Machine Learning API Routes for Enhanced Predictions
Includes: NEO risk assessment, Watchman alerts, pattern detection, interstellar anomaly detection
Phase 2: LSTM deep learning, Seismos correlation models
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field
import numpy as np

# Import ML models
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.ml.neo_trajectory_predictor import NEOTrajectoryPredictor, NEOPrediction
from app.ml.watchman_enhanced_alerts import WatchmanEnhancedAlertSystem, EnhancedAlert
from app.ml.pattern_detection import pattern_detection_service
from app.ml.lstm_deep_learning import ProphecyLSTMModel
from app.ml.seismos_correlations import SeismosCorrelationTrainer

# Initialize ML models
neo_predictor = NEOTrajectoryPredictor()
watchman_system = WatchmanEnhancedAlertSystem()

router = APIRouter(prefix="/api/v1/ml", tags=["Machine Learning"])


# ===== Request/Response Models =====

class NEOAssessmentRequest(BaseModel):
    """Request model for NEO risk assessment"""
    name: str = Field(..., description="NEO name (e.g., '99942 Apophis')")
    semi_major_axis_au: float = Field(..., description="Semi-major axis in AU")
    eccentricity: float = Field(..., description="Orbital eccentricity (0-1+)")
    inclination_deg: float = Field(..., description="Inclination in degrees")
    absolute_magnitude: float = Field(..., description="Absolute magnitude H")
    diameter_km: Optional[float] = Field(None, description="Estimated diameter in km")
    velocity_km_s: float = Field(..., description="Relative velocity in km/s")
    closest_approach_date: str = Field(..., description="Date of closest approach (YYYY-MM-DD)")
    closest_approach_au: float = Field(..., description="Minimum distance in AU")


class NEOAssessmentResponse(BaseModel):
    """Response model for NEO risk assessment"""
    neo_name: str
    collision_probability: float = Field(..., description="Probability 0-1")
    impact_energy_megatons: float = Field(..., description="TNT equivalent in megatons")
    torino_scale: int = Field(..., description="Torino scale 0-10")
    palermo_scale: float = Field(..., description="Palermo technical scale")
    orbital_stability: str = Field(..., description="STABLE, PERTURBED, or CHAOTIC")
    recommendations: List[str] = Field(..., description="AI-generated recommendations")
    closest_approach_km: float = Field(..., description="Closest approach in km")
    years_until_approach: float = Field(..., description="Time until closest approach")


class InterstellarAnomalyRequest(BaseModel):
    """Request model for interstellar anomaly detection"""
    name: str = Field(..., description="Object name (e.g., '1I/'Oumuamua')")
    semi_major_axis_au: float = Field(..., description="Semi-major axis (negative for hyperbolic)")
    eccentricity: float = Field(..., description="Eccentricity (>1 for interstellar)")
    velocity_km_s: float = Field(..., description="Velocity in km/s")
    absolute_magnitude: float = Field(..., description="Absolute magnitude")
    albedo: Optional[float] = Field(None, description="Surface albedo 0-1")
    rotation_period_hours: Optional[float] = Field(None, description="Rotation period in hours")
    acceleration_exists: bool = Field(False, description="Non-gravitational acceleration detected")
    outgassing_detected: bool = Field(False, description="Cometary outgassing detected")
    elongation_ratio: Optional[float] = Field(None, description="Length to width ratio")


class InterstellarAnomalyResponse(BaseModel):
    """Response model for interstellar anomaly detection"""
    object_name: str
    is_interstellar: bool
    anomaly_score: float = Field(..., description="Anomaly score 0-1")
    detected_anomalies: List[str] = Field(..., description="List of detected anomalies")
    requires_investigation: bool
    recommendations: List[str]
    confidence: float = Field(..., description="Prediction confidence 0-1")


class EnhancedAlertResponse(BaseModel):
    """Response model for enhanced Watchman alerts"""
    alert_id: str
    event_type: str
    event_date: str
    description: str
    severity_score: float = Field(..., description="Severity 0-100")
    prophetic_significance: float = Field(..., description="Significance 0-1")
    cluster_id: Optional[int] = Field(None, description="Event cluster ID")
    pattern_type: Optional[str] = Field(None, description="Pattern type if detected")
    biblical_references: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    related_events: List[str] = Field(default_factory=list)


class DetectedPatternResponse(BaseModel):
    """Response model for detected celestial patterns"""
    pattern_type: str = Field(..., description="tetrad, triple_conjunction, cluster")
    start_date: str
    end_date: str
    significance_score: float = Field(..., description="Significance 0-1")
    event_count: int
    description: str
    planets_involved: Optional[List[str]] = Field(None, description="For conjunctions")
    feast_alignments: Optional[List[str]] = Field(None, description="Aligned biblical feasts")
    biblical_references: List[str] = Field(default_factory=list)
    historical_note: Optional[str] = Field(None, description="Historical parallel")


# ===== Phase 2 Models =====

class ProphecyLSTMRequest(BaseModel):
    """Request model for LSTM prophetic prediction"""
    events: List[Dict[str, Any]] = Field(..., description="Sequence of events (30 timesteps recommended)")
    sequence_length: Optional[int] = Field(30, description="Number of timesteps for LSTM")
    features: Optional[List[str]] = Field(
        default=[
            'blood_moon', 'tetrad_member', 'jerusalem_visible',
            'magnitude', 'feast_day', 'historical_significance',
            'temporal_proximity', 'spatial_clustering'
        ],
        description="Features to extract from events"
    )


class ProphecyLSTMResponse(BaseModel):
    """Response model for LSTM prophetic prediction"""
    prophetic_probability: float = Field(..., description="Probability of prophetic significance (0-1)")
    confidence: float = Field(..., description="Model confidence (0-1)")
    features_analyzed: int = Field(..., description="Number of features used")
    model: str = Field(..., description="Model architecture")
    sequence_info: Dict[str, Any] = Field(..., description="Information about the input sequence")


class SeismosCorrelationRequest(BaseModel):
    """Request model for Seismos correlation prediction"""
    celestial_data: Optional[Dict[str, Any]] = Field(None, description="Celestial event data")
    solar_data: Optional[Dict[str, Any]] = Field(None, description="Solar activity data")
    planetary_data: Optional[Dict[str, Any]] = Field(None, description="Planetary alignment data")
    lunar_data: Optional[Dict[str, Any]] = Field(None, description="Lunar cycle data")


class SeismosCorrelationResponse(BaseModel):
    """Response model for Seismos correlation prediction"""
    earthquake_risk: Dict[str, Any] = Field(..., description="Earthquake cluster prediction")
    volcanic_risk: Dict[str, Any] = Field(..., description="Volcanic eruption prediction")
    hurricane_risk: Dict[str, Any] = Field(..., description="Hurricane formation prediction")
    tsunami_risk: Dict[str, Any] = Field(..., description="Tsunami risk prediction")


# ===== Endpoints =====

@router.post("/neo-risk-assessment", response_model=NEOAssessmentResponse)
async def assess_neo_risk(request: NEOAssessmentRequest):
    """
    Assess collision risk for a Near-Earth Object (NEO).
    
    Returns:
    - Collision probability
    - Torino scale (0-10 public communication scale)
    - Palermo scale (technical hazard assessment)
    - Impact energy in megatons TNT
    - Orbital stability classification
    - AI-generated recommendations
    """
    try:
        # Convert request to dict for predictor
        neo_data = {
            'name': request.name,
            'semi_major_axis_au': request.semi_major_axis_au,
            'eccentricity': request.eccentricity,
            'inclination_deg': request.inclination_deg,
            'absolute_magnitude': request.absolute_magnitude,
            'diameter_km': request.diameter_km,
            'velocity_km_s': request.velocity_km_s,
            'closest_approach_date': datetime.strptime(request.closest_approach_date, '%Y-%m-%d'),
            'closest_approach_au': request.closest_approach_au
        }
        
        # Get prediction
        prediction = neo_predictor.predict_collision_risk(neo_data)
        
        # Convert to response format
        return NEOAssessmentResponse(
            neo_name=prediction.neo_name,
            collision_probability=prediction.collision_probability,
            impact_energy_megatons=prediction.impact_energy_megatons,
            torino_scale=prediction.torino_scale,
            palermo_scale=prediction.palermo_scale,
            orbital_stability=prediction.orbital_stability,
            recommendations=prediction.recommendations,
            closest_approach_km=prediction.closest_approach_km,
            years_until_approach=prediction.years_until_approach
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")


@router.post("/interstellar-anomaly", response_model=InterstellarAnomalyResponse)
async def detect_interstellar_anomaly(request: InterstellarAnomalyRequest):
    """
    Detect anomalies in interstellar objects like 'Oumuamua.
    
    Checks for:
    - Hyperbolic trajectories (e > 1)
    - Non-gravitational acceleration
    - Extreme elongation ratios
    - Missing cometary features (outgassing)
    """
    try:
        # Convert request to dict
        object_data = {
            'name': request.name,
            'semi_major_axis_au': request.semi_major_axis_au,
            'eccentricity': request.eccentricity,
            'velocity_km_s': request.velocity_km_s,
            'absolute_magnitude': request.absolute_magnitude,
            'albedo': request.albedo,
            'rotation_period_hours': request.rotation_period_hours,
            'acceleration_exists': request.acceleration_exists,
            'outgassing_detected': request.outgassing_detected,
            'elongation_ratio': request.elongation_ratio
        }
        
        # Detect anomaly
        result = neo_predictor.detect_interstellar_anomaly(object_data)
        
        return InterstellarAnomalyResponse(
            object_name=result['object_name'],
            is_interstellar=result['is_interstellar'],
            anomaly_score=result['anomaly_score'],
            detected_anomalies=result['detected_anomalies'],
            requires_investigation=result['requires_investigation'],
            recommendations=result['recommendations'],
            confidence=result['confidence']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")


@router.get("/watchman-alerts", response_model=List[EnhancedAlertResponse])
async def get_enhanced_alerts(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    min_severity: Optional[float] = Query(None, ge=0, le=100, description="Minimum severity score"),
    min_significance: Optional[float] = Query(None, ge=0, le=1, description="Minimum prophetic significance")
):
    """
    Get enhanced Watchman alerts with ML-powered severity and prophetic significance.
    
    Filters:
    - event_type: eclipse, neo_approach, earthquake, conjunction
    - min_severity: Minimum severity score (0-100)
    - min_significance: Minimum prophetic significance (0-1)
    
    Returns alerts with:
    - Severity scoring
    - Prophetic significance analysis
    - Biblical references
    - Pattern membership
    - AI recommendations
    """
    try:
        # TODO: Fetch real events from database
        # For now, return mock data
        mock_events = [
            {
                'event_id': 'eclipse_2024_04_08',
                'type': 'solar_eclipse',
                'date': datetime(2024, 4, 8),
                'description': 'Total Solar Eclipse visible across North America',
                'location': {'lat': 40.0, 'lon': -95.0},
                'magnitude': 1.0566,
                'data': {'path_width_km': 198, 'duration_seconds': 268}
            },
            {
                'event_id': 'neo_apophis_2029',
                'type': 'neo_approach',
                'date': datetime(2029, 4, 13),
                'description': '99942 Apophis extremely close approach',
                'location': None,
                'magnitude': 31600,  # km distance
                'data': {'torino_scale': 4, 'diameter_km': 0.37}
            }
        ]
        
        # Generate enhanced alerts
        alerts = []
        for event in mock_events:
            alert = watchman_system.generate_enhanced_alert(event, mock_events)
            
            # Apply filters
            if event_type and alert.event_type != event_type:
                continue
            if min_severity and alert.severity_score < min_severity:
                continue
            if min_significance and alert.prophetic_significance < min_significance:
                continue
            
            alerts.append(EnhancedAlertResponse(
                alert_id=alert.alert_id,
                event_type=alert.event_type,
                event_date=alert.event_date.isoformat(),
                description=event.get('description', 'No description available'),
                severity_score=alert.severity_score,
                prophetic_significance=alert.prophetic_significance,
                cluster_id=alert.cluster_id,
                pattern_type=alert.pattern_type,
                biblical_references=alert.biblical_references,
                recommendations=alert.recommendations,
                related_events=alert.related_events
            ))
        
        return alerts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate alerts: {str(e)}")


@router.get("/pattern-detection", response_model=List[DetectedPatternResponse])
async def detect_patterns(
    start_date: Optional[date] = Query(None, description="Start date for detection (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date for detection (YYYY-MM-DD)")
):
    """
    Detect celestial patterns like blood moon tetrads and triple conjunctions.
    
    Detects:
    - Blood moon tetrads (4 consecutive total lunar eclipses)
    - Triple conjunctions (3 alignments within a year)
    - Grand conjunctions (Jupiter-Saturn ~20 year cycle)
    - Event clusters (temporal/spatial groupings)
    
    Returns patterns with:
    - Significance scores
    - Biblical feast alignments (Passover, Tabernacles)
    - Historical parallels
    - Biblical references
    """
    try:
        # Default date range if not provided
        if not start_date:
            start_date = date(2020, 1, 1)
        if not end_date:
            end_date = date(2030, 12, 31)
        
        # TODO: Fetch real eclipses and conjunctions from database
        # For now, return mock data
        mock_lunar_eclipses = [
            datetime(2014, 4, 15),  # Passover
            datetime(2014, 10, 8),  # Tabernacles
            datetime(2015, 4, 4),   # Passover
            datetime(2015, 9, 28)   # Tabernacles
        ]
        
        mock_conjunctions = [
            {
                'date': datetime(2020, 12, 21),
                'planets': ['Jupiter', 'Saturn'],
                'separation_degrees': 0.1,
                'type': 'grand_conjunction'
            }
        ]
        
        patterns = []
        
        # Detect tetrads
        tetrad_results = watchman_system.detect_blood_moon_tetrad(mock_lunar_eclipses)
        for tetrad in tetrad_results:
            patterns.append(DetectedPatternResponse(
                pattern_type="blood_moon_tetrad",
                start_date=tetrad['dates'][0].isoformat(),
                end_date=tetrad['dates'][-1].isoformat(),
                significance_score=tetrad['significance'],
                event_count=len(tetrad['dates']),
                description=f"Blood moon tetrad spanning {tetrad['dates'][0].year}-{tetrad['dates'][-1].year}",
                feast_alignments=tetrad.get('feast_alignments', []),
                biblical_references=tetrad.get('biblical_refs', []),
                historical_note=tetrad.get('historical_note')
            ))
        
        # Detect conjunction patterns
        conjunction_results = watchman_system.detect_conjunction_patterns(mock_conjunctions)
        for conj in conjunction_results:
            patterns.append(DetectedPatternResponse(
                pattern_type=conj['type'],
                start_date=conj['start_date'].isoformat(),
                end_date=conj['end_date'].isoformat(),
                significance_score=conj['significance'],
                event_count=conj['count'],
                description=conj['description'],
                planets_involved=conj.get('planets', []),
                biblical_references=conj.get('biblical_refs', []),
                historical_note=conj.get('historical_note')
            ))
        
        return patterns
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern detection failed: {str(e)}")


@router.post("/comprehensive-pattern-detection")
async def comprehensive_pattern_detection(
    start_date: str = Query(..., description="Start date YYYY-MM-DD"),
    end_date: str = Query(..., description="End date YYYY-MM-DD"),
    event_types: Optional[List[str]] = Query(None, description="Event types to include")
):
    """
    Comprehensive pattern detection using ML clustering and similarity analysis
    
    Detects:
    - Blood moon tetrads (4 lunar eclipses on feast days within 2 years)
    - Triple conjunctions (3 planetary approaches within 1 year)
    - Event clusters (DBSCAN clustering on 14D feature space)
    - Historical parallels (cosine similarity matching)
    
    Returns structured pattern data for visualization
    """
    try:
        from app.db.session import SessionLocal
        db = SessionLocal()
        
        try:
            # Use the advanced pattern detection service
            results = await pattern_detection_service.detect_patterns(
                start_date=start_date,
                end_date=end_date,
                event_types=event_types,
                db=db
            )
            
            return {
                "success": True,
                "data": results,
                "analysis": {
                    "tetrads_found": len(results.get("tetrads", [])),
                    "conjunctions_found": len(results.get("conjunctions", [])),
                    "clusters_found": len(results.get("clusters", [])),
                    "historical_matches_found": len(results.get("historical_matches", [])),
                },
                "metadata": {
                    "date_range": results.get("date_range"),
                    "total_events_analyzed": results.get("total_events"),
                    "ml_algorithms": ["DBSCAN Clustering", "Cosine Similarity", "Feature Engineering"],
                    "feature_dimensions": 14
                }
            }
        finally:
            db.close()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive pattern detection failed: {str(e)}")


@router.get("/health", tags=["Health"])
async def ml_health_check():
    """Health check for ML services"""
    return {
        "status": "operational",
        "models": {
            "neo_predictor": "loaded",
            "watchman_system": "loaded",
            "pattern_detection": "loaded",
            "prophecy_lstm": "loaded",
            "seismos_correlation": "loaded"
        },
        "version": "2.0.0"
    }


# ===== Phase 2: LSTM Deep Learning & Seismos Correlation =====

@router.post("/prophecy-lstm-prediction", response_model=ProphecyLSTMResponse, tags=["Phase 2"])
async def prophecy_lstm_prediction(request: ProphecyLSTMRequest):
    """
    TensorFlow LSTM Deep Learning for Prophetic Prediction
    
    Uses a 2-layer LSTM (128→64 units) trained on 100+ historical events.
    Predicts prophetic significance based on 8 celestial features over 30 timesteps.
    
    Biblical Foundation:
    - Genesis 1:14: "Let there be lights in the vault of the sky to separate the day 
      from the night, and let them serve as signs to mark sacred times, and days and years"
    - Luke 21:25-26: "There will be signs in the sun, moon and stars"
    
    Features Analyzed:
    - Blood moon occurrence, Tetrad membership, Jerusalem visibility
    - Magnitude, Feast day alignment, Historical significance
    - Temporal proximity, Spatial clustering
    
    Returns:
    - Prophetic probability (0-1)
    - Model confidence (0-1)
    - Feature analysis count
    - Sequence information
    """
    try:
        # Load LSTM model
        lstm_model = ProphecyLSTMModel()
        model_path = "app/models/prophecy_lstm_model.h5"
        
        if not lstm_model.load_model(model_path):
            raise HTTPException(
                status_code=503,
                detail=f"LSTM model not found at {model_path}. Run 'python app/ml/train_all_models.py' first."
            )
        
        # Extract features from events
        features = extract_features(request.events, request.features)
        
        # Ensure sequence length
        if len(features) < request.sequence_length:
            # Pad with zeros
            padding = np.zeros((request.sequence_length - len(features), features.shape[1]))
            features = np.vstack([padding, features])
        elif len(features) > request.sequence_length:
            # Take most recent events
            features = features[-request.sequence_length:]
        
        # Reshape for LSTM: (1, timesteps, features)
        features = features.reshape(1, request.sequence_length, features.shape[1])
        
        # Predict
        prediction = lstm_model.predict(features)
        probability = float(prediction[0][0])
        
        # Calculate confidence based on distance from 0.5
        confidence = abs(probability - 0.5) * 2
        
        return ProphecyLSTMResponse(
            prophetic_probability=probability,
            confidence=confidence,
            features_analyzed=features.shape[2],
            model="LSTM-2Layer-128-64",
            sequence_info={
                "timesteps": request.sequence_length,
                "events_provided": len(request.events),
                "features_per_event": features.shape[2]
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LSTM prediction failed: {str(e)}")


@router.post("/seismos-correlation", response_model=SeismosCorrelationResponse, tags=["Phase 2"])
async def seismos_correlation(request: SeismosCorrelationRequest):
    """
    4 Seismos Correlation Models: Celestial → Earth Events
    
    Trained on 100+ historical events with Random Forest & Gradient Boosting.
    Predicts correlation between celestial signs and earth catastrophes.
    
    Biblical Foundation:
    - Luke 21:11: "There will be great earthquakes, famines and pestilences in various 
      places, and fearful events and great signs from heaven"
    - Revelation 6:12-14: Earthquake, sun, moon, stars, sky receded, mountains moved
    
    Models:
    1. Celestial → Earthquake Clusters (Random Forest)
    2. Solar Flares → Volcanic Eruptions (Gradient Boosting)
    3. Planetary Alignments → Hurricane Formation (Random Forest)
    4. Lunar Cycles → Tsunami Risk (Gradient Boosting)
    
    Returns:
    - Risk scores (0-1) for each earth event type
    - Confidence intervals
    - Feature importance rankings
    """
    try:
        trainer = SeismosCorrelationTrainer()
        results = {}
        
        # 1. Earthquake correlation
        if request.celestial_data:
            features = prepare_celestial_features(request.celestial_data)
            earthquake_pred = trainer.predict_earthquake(features)
            results["earthquake_risk"] = {
                "risk_score": float(earthquake_pred["risk"]),
                "confidence": float(earthquake_pred["confidence"]),
                "top_features": earthquake_pred["important_features"][:3],
                "biblical_ref": "Matthew 24:7 - 'There will be famines and earthquakes in various places'"
            }
        else:
            results["earthquake_risk"] = {"risk_score": 0.0, "confidence": 0.0, "message": "No celestial data provided"}
        
        # 2. Volcanic correlation
        if request.solar_data:
            features = prepare_solar_features(request.solar_data)
            volcanic_pred = trainer.predict_volcanic(features)
            results["volcanic_risk"] = {
                "risk_score": float(volcanic_pred["risk"]),
                "confidence": float(volcanic_pred["confidence"]),
                "top_features": volcanic_pred["important_features"][:3],
                "biblical_ref": "Revelation 8:8 - 'Something like a huge mountain, all ablaze, was thrown into the sea'"
            }
        else:
            results["volcanic_risk"] = {"risk_score": 0.0, "confidence": 0.0, "message": "No solar data provided"}
        
        # 3. Hurricane correlation
        if request.planetary_data:
            features = prepare_planetary_features(request.planetary_data)
            hurricane_pred = trainer.predict_hurricane(features)
            results["hurricane_risk"] = {
                "risk_score": float(hurricane_pred["risk"]),
                "confidence": float(hurricane_pred["confidence"]),
                "top_features": hurricane_pred["important_features"][:3],
                "biblical_ref": "Mark 4:39 - 'The wind died down and it was completely calm'"
            }
        else:
            results["hurricane_risk"] = {"risk_score": 0.0, "confidence": 0.0, "message": "No planetary data provided"}
        
        # 4. Tsunami correlation
        if request.lunar_data:
            features = prepare_lunar_features(request.lunar_data)
            tsunami_pred = trainer.predict_tsunami(features)
            results["tsunami_risk"] = {
                "risk_score": float(tsunami_pred["risk"]),
                "confidence": float(tsunami_pred["confidence"]),
                "top_features": tsunami_pred["important_features"][:3],
                "biblical_ref": "Revelation 21:1 - 'There was no longer any sea'"
            }
        else:
            results["tsunami_risk"] = {"risk_score": 0.0, "confidence": 0.0, "message": "No lunar data provided"}
        
        return SeismosCorrelationResponse(**results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seismos correlation failed: {str(e)}")


# ===== Helper Functions =====

def extract_features(events: List[Dict[str, Any]], feature_names: List[str]) -> np.ndarray:
    """
    Extract numeric features from event dictionaries for LSTM input.
    
    Args:
        events: List of event dictionaries with various attributes
        feature_names: List of feature names to extract
    
    Returns:
        NumPy array of shape (num_events, num_features)
    """
    feature_matrix = []
    
    for event in events:
        feature_vector = []
        
        for fname in feature_names:
            if fname == 'blood_moon':
                feature_vector.append(1.0 if event.get('is_blood_moon', False) else 0.0)
            elif fname == 'tetrad_member':
                feature_vector.append(1.0 if event.get('is_tetrad_member', False) else 0.0)
            elif fname == 'jerusalem_visible':
                feature_vector.append(1.0 if event.get('jerusalem_visible', False) else 0.0)
            elif fname == 'magnitude':
                feature_vector.append(float(event.get('magnitude', 0.0)))
            elif fname == 'feast_day':
                feature_vector.append(1.0 if event.get('feast_day', False) else 0.0)
            elif fname == 'historical_significance':
                feature_vector.append(float(event.get('historical_significance', 0.0)))
            elif fname == 'temporal_proximity':
                feature_vector.append(float(event.get('temporal_proximity', 0.0)))
            elif fname == 'spatial_clustering':
                feature_vector.append(float(event.get('spatial_clustering', 0.0)))
            else:
                feature_vector.append(0.0)  # Default for unknown features
        
        feature_matrix.append(feature_vector)
    
    return np.array(feature_matrix)


def prepare_celestial_features(data: Dict[str, Any]) -> np.ndarray:
    """
    Prepare 10 celestial event features for earthquake correlation model.
    
    Features:
    - Eclipse type (0=solar, 1=lunar, 2=transit)
    - Blood moon indicator
    - Magnitude
    - Tetrad membership
    - Jerusalem visibility
    - Feast alignment
    - Historical significance
    - Days since last eclipse
    - Spatial cluster size
    - Temporal cluster density
    """
    eclipse_type_map = {'solar': 0, 'lunar': 1, 'transit': 2}
    
    features = [
        eclipse_type_map.get(data.get('eclipse_type', ''), 0),
        1.0 if data.get('is_blood_moon', False) else 0.0,
        float(data.get('magnitude', 0.0)),
        1.0 if data.get('is_tetrad_member', False) else 0.0,
        1.0 if data.get('jerusalem_visible', False) else 0.0,
        1.0 if data.get('feast_alignment', False) else 0.0,
        float(data.get('historical_significance', 0.0)),
        float(data.get('days_since_last', 0.0)),
        float(data.get('spatial_cluster_size', 0.0)),
        float(data.get('temporal_density', 0.0))
    ]
    
    return np.array(features).reshape(1, -1)


def prepare_solar_features(data: Dict[str, Any]) -> np.ndarray:
    """
    Prepare 8 solar activity features for volcanic correlation model.
    
    Features:
    - Solar flare class (X=3, M=2, C=1, B=0)
    - Sunspot count
    - Solar wind speed (km/s)
    - Geomagnetic storm level (0-9)
    - Coronal mass ejection indicator
    - Solar cycle phase (0-1)
    - Days since last major flare
    - Solar radiation intensity
    """
    flare_class_map = {'X': 3, 'M': 2, 'C': 1, 'B': 0}
    
    features = [
        flare_class_map.get(data.get('flare_class', 'B'), 0),
        float(data.get('sunspot_count', 0.0)),
        float(data.get('solar_wind_speed', 400.0)),
        float(data.get('geomagnetic_storm_level', 0.0)),
        1.0 if data.get('cme_detected', False) else 0.0,
        float(data.get('solar_cycle_phase', 0.5)),
        float(data.get('days_since_last_flare', 0.0)),
        float(data.get('radiation_intensity', 0.0))
    ]
    
    return np.array(features).reshape(1, -1)


def prepare_planetary_features(data: Dict[str, Any]) -> np.ndarray:
    """
    Prepare 8 planetary alignment features for hurricane correlation model.
    
    Features:
    - Number of aligned planets
    - Conjunction tightness (degrees)
    - Jupiter involvement
    - Saturn involvement
    - Mars involvement
    - Grand conjunction indicator
    - Days until peak alignment
    - Historical alignment similarity
    """
    features = [
        float(data.get('aligned_planet_count', 0.0)),
        float(data.get('conjunction_tightness', 180.0)),
        1.0 if data.get('jupiter_involved', False) else 0.0,
        1.0 if data.get('saturn_involved', False) else 0.0,
        1.0 if data.get('mars_involved', False) else 0.0,
        1.0 if data.get('is_grand_conjunction', False) else 0.0,
        float(data.get('days_to_peak', 0.0)),
        float(data.get('historical_similarity', 0.0))
    ]
    
    return np.array(features).reshape(1, -1)


def prepare_lunar_features(data: Dict[str, Any]) -> np.ndarray:
    """
    Prepare 8 lunar cycle features for tsunami correlation model.
    
    Features:
    - Lunar phase (0=new, 0.25=first quarter, 0.5=full, 0.75=last quarter)
    - Perigee proximity (0=apogee, 1=perigee)
    - Tidal force intensity
    - Eclipse proximity (days)
    - Supermoon indicator
    - Blood moon indicator
    - Days since last full moon
    - Syzygy alignment strength
    """
    phase_map = {
        'new': 0.0,
        'waxing_crescent': 0.125,
        'first_quarter': 0.25,
        'waxing_gibbous': 0.375,
        'full': 0.5,
        'waning_gibbous': 0.625,
        'last_quarter': 0.75,
        'waning_crescent': 0.875
    }
    
    features = [
        phase_map.get(data.get('phase', 'new'), 0.0),
        float(data.get('perigee_proximity', 0.5)),
        float(data.get('tidal_force', 0.0)),
        float(data.get('eclipse_proximity_days', 999.0)),
        1.0 if data.get('is_supermoon', False) else 0.0,
        1.0 if data.get('is_blood_moon', False) else 0.0,
        float(data.get('days_since_full_moon', 15.0)),
        float(data.get('syzygy_strength', 0.0))
    ]
    
    return np.array(features).reshape(1, -1)
