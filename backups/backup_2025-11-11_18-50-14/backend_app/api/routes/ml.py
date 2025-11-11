"""
Machine Learning API Routes for Enhanced Predictions
Includes: NEO risk assessment, Watchman alerts, pattern detection, interstellar anomaly detection
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field

# Import ML models
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.ml.neo_trajectory_predictor import NEOTrajectoryPredictor, NEOPrediction
from app.ml.watchman_enhanced_alerts import WatchmanEnhancedAlertSystem, EnhancedAlert
from app.ml.pattern_detection import pattern_detection_service

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
                description=alert.description,
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


@router.get("/health")
async def ml_health_check():
    """Health check for ML services"""
    return {
        "status": "operational",
        "models": {
            "neo_predictor": "loaded",
            "watchman_system": "loaded",
            "pattern_detection": "loaded"
        },
        "version": "1.0.0"
    }
