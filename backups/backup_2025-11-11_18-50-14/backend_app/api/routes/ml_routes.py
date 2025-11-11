"""
Machine Learning API Routes
============================

FastAPI endpoints for ML/AI predictions:
- NEO trajectory and collision risk assessment
- Watchman enhanced alerts with prophetic significance
- Pattern detection (tetrads, conjunctions, clusters)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

# Import ML models
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.ml.neo_trajectory_predictor import NEOTrajectoryPredictor, NEOPrediction
from app.ml.watchman_enhanced_alerts import WatchmanEnhancedAlertSystem, EnhancedAlert

router = APIRouter(prefix="/api/v1/ml", tags=["machine-learning"])

# Initialize ML models
neo_predictor = NEOTrajectoryPredictor()
watchman_system = WatchmanEnhancedAlertSystem()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class NEORiskRequest(BaseModel):
    """Request model for NEO risk assessment"""
    name: str = Field(..., description="Object name (e.g., '99942 Apophis')")
    semi_major_axis: float = Field(..., description="Semi-major axis in AU", gt=0)
    eccentricity: float = Field(..., description="Orbital eccentricity", ge=0, le=2)
    inclination: float = Field(..., description="Orbital inclination in degrees", ge=0, le=180)
    absolute_magnitude: Optional[float] = Field(20.0, description="H magnitude")
    diameter_km: Optional[float] = Field(0.1, description="Estimated diameter in km", gt=0)
    closest_approach_date: datetime = Field(..., description="Date of closest approach")
    closest_approach_distance_km: float = Field(..., description="Distance at CA in km", gt=0)
    relative_velocity_km_s: float = Field(20.0, description="Relative velocity in km/s", gt=0)
    orbital_period: Optional[float] = Field(1.0, description="Orbital period in years")
    moid_au: Optional[float] = Field(None, description="Minimum orbit intersection distance")


class NEORiskResponse(BaseModel):
    """Response model for NEO risk assessment"""
    object_name: str
    collision_probability: float
    torino_scale: int
    palermo_scale: float
    closest_approach_date: str
    closest_approach_distance_km: float
    impact_energy_megatons: float
    risk_level: str
    confidence: float
    orbital_stability: str
    recommendations: List[str]


class InterstellarAnomalyRequest(BaseModel):
    """Request model for interstellar object anomaly detection"""
    name: str
    eccentricity: float = Field(..., ge=0)
    non_gravitational_accel: Optional[float] = None
    axis_ratio: Optional[float] = None
    has_tail: Optional[bool] = None


class WatchmanAlertRequest(BaseModel):
    """Request model for Watchman alert generation"""
    event_id: str
    event_type: str
    event_date: datetime
    rarity: Optional[str] = None
    magnitude: Optional[float] = None
    distance_km: Optional[float] = None
    context_events: Optional[List[Dict[str, Any]]] = []


class PatternDetectionRequest(BaseModel):
    """Request model for pattern detection"""
    events: List[Dict[str, Any]] = Field(..., description="List of celestial events")
    pattern_types: List[str] = Field(
        default=["tetrad", "conjunction", "cluster"],
        description="Pattern types to detect"
    )


# ============================================================================
# NEO ENDPOINTS
# ============================================================================

@router.post("/neo-risk-assessment", response_model=NEORiskResponse)
async def assess_neo_risk(request: NEORiskRequest):
    """
    Assess collision risk for a Near-Earth Object.
    
    Returns Torino Scale, Palermo Scale, collision probability,
    impact energy, and automated recommendations.
    
    **Example Request:**
    ```json
    {
      "name": "99942 Apophis",
      "semi_major_axis": 0.922,
      "eccentricity": 0.191,
      "inclination": 3.33,
      "absolute_magnitude": 19.7,
      "diameter_km": 0.37,
      "closest_approach_date": "2029-04-13T00:00:00",
      "closest_approach_distance_km": 31600,
      "relative_velocity_km_s": 7.4
    }
    ```
    """
    try:
        # Convert request to dict
        neo_data = request.dict()
        
        # Get prediction
        prediction = neo_predictor.predict_collision_risk(neo_data)
        
        # Convert to response
        return NEORiskResponse(
            object_name=prediction.object_name,
            collision_probability=prediction.collision_probability,
            torino_scale=prediction.torino_scale,
            palermo_scale=prediction.palermo_scale,
            closest_approach_date=prediction.closest_approach_date.isoformat(),
            closest_approach_distance_km=prediction.closest_approach_distance_km,
            impact_energy_megatons=prediction.impact_energy_megatons,
            risk_level=prediction.risk_level,
            confidence=prediction.confidence,
            orbital_stability=prediction.orbital_stability,
            recommendations=prediction.recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NEO risk assessment failed: {str(e)}")


@router.post("/interstellar-anomaly-detection")
async def detect_interstellar_anomaly(request: InterstellarAnomalyRequest):
    """
    Detect anomalies in interstellar objects (like 'Oumuamua).
    
    Checks for hyperbolic trajectories, non-gravitational acceleration,
    unusual shapes, and unexplained behavior.
    
    **Example Request:**
    ```json
    {
      "name": "1I/'Oumuamua",
      "eccentricity": 1.20,
      "non_gravitational_accel": 2.5e-6,
      "axis_ratio": 10.0,
      "has_tail": false
    }
    ```
    """
    try:
        object_data = request.dict()
        result = neo_predictor.detect_interstellar_anomaly(object_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")


@router.get("/neo-batch-assessment")
async def batch_assess_neos(
    limit: int = Query(10, ge=1, le=100, description="Number of NEOs to assess")
):
    """
    Batch assessment of known NEOs from database.
    Returns top N most concerning objects.
    """
    # TODO: Query database for NEOs
    # For now, return example data
    
    example_neos = [
        {
            "name": "99942 Apophis",
            "torino_scale": 4,
            "risk_level": "MODERATE",
            "closest_approach": "2029-04-13",
            "distance_km": 31600
        },
        {
            "name": "101955 Bennu",
            "torino_scale": 1,
            "risk_level": "LOW",
            "closest_approach": "2135-09-25",
            "distance_km": 750000
        }
    ]
    
    return {
        "count": len(example_neos),
        "neos": example_neos,
        "last_updated": datetime.now().isoformat()
    }


# ============================================================================
# WATCHMAN ALERT ENDPOINTS
# ============================================================================

@router.post("/watchman-alert")
async def generate_watchman_alert(request: WatchmanAlertRequest):
    """
    Generate enhanced Watchman alert with ML-powered insights.
    
    Includes severity scoring, prophetic significance, biblical references,
    pattern detection, and automated recommendations.
    
    **Example Request:**
    ```json
    {
      "event_id": "eclipse_2024_04_08",
      "event_type": "total_solar_eclipse",
      "event_date": "2024-04-08T00:00:00",
      "rarity": "rare"
    }
    ```
    """
    try:
        event = request.dict()
        context = request.context_events or []
        
        alert = watchman_system.generate_enhanced_alert(event, context)
        
        return {
            "alert_id": alert.alert_id,
            "event_type": alert.event_type,
            "event_date": alert.event_date.isoformat(),
            "severity_score": alert.severity_score,
            "prophetic_significance": alert.prophetic_significance,
            "cluster_id": alert.cluster_id,
            "pattern_type": alert.pattern_type,
            "biblical_references": alert.biblical_references,
            "confidence": alert.confidence,
            "recommendations": alert.recommendations,
            "related_events": alert.related_events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert generation failed: {str(e)}")


@router.post("/pattern-detection")
async def detect_patterns(request: PatternDetectionRequest):
    """
    Detect celestial patterns in event sequences.
    
    Patterns detected:
    - Blood Moon Tetrads (4 consecutive total lunar eclipses)
    - Triple Conjunctions (3 conjunctions within a year)
    - Grand Conjunctions (Jupiter-Saturn)
    - Event Clusters (temporally/spatially related events)
    
    **Example Request:**
    ```json
    {
      "events": [
        {
          "type": "total_lunar_eclipse",
          "date": "2014-04-15T00:00:00",
          "eclipse_type": "total"
        }
      ],
      "pattern_types": ["tetrad", "conjunction"]
    }
    ```
    """
    try:
        events = request.events
        pattern_types = request.pattern_types
        
        results = {
            "detected_patterns": [],
            "event_clusters": {},
            "summary": {}
        }
        
        # Detect tetrads
        if "tetrad" in pattern_types:
            lunar_eclipses = [e for e in events if 'lunar' in e.get('type', '')]
            if lunar_eclipses:
                tetrads = watchman_system.detect_blood_moon_tetrad(lunar_eclipses)
                results["detected_patterns"].extend(tetrads)
                results["summary"]["tetrads_found"] = len(tetrads)
        
        # Detect conjunctions
        if "conjunction" in pattern_types:
            conjunctions = [e for e in events if 'conjunction' in e.get('type', '')]
            if conjunctions:
                patterns = watchman_system.detect_conjunction_patterns(conjunctions)
                results["detected_patterns"].extend(patterns)
                results["summary"]["conjunction_patterns"] = len(patterns)
        
        # Cluster events
        if "cluster" in pattern_types:
            clusters = watchman_system.cluster_events(events)
            results["event_clusters"] = {
                str(k): [e.get('id', f'event_{i}') for i, e in enumerate(v)]
                for k, v in clusters.items()
            }
            results["summary"]["clusters_found"] = len(clusters)
        
        results["summary"]["total_events_analyzed"] = len(events)
        results["summary"]["patterns_detected"] = len(results["detected_patterns"])
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern detection failed: {str(e)}")


@router.get("/tetrad-history")
async def get_tetrad_history(
    start_year: int = Query(1493, ge=1000, description="Start year"),
    end_year: int = Query(2100, le=2200, description="End year")
):
    """
    Get historical Blood Moon Tetrads between specified years.
    
    Includes:
    - Tetrad dates
    - Feast day alignments
    - Historical events during tetrad
    - Prophetic significance
    """
    # Known historical tetrads
    tetrads = [
        {
            "period": "1493-1494",
            "dates": ["1493-04-02", "1493-09-25", "1494-03-22", "1494-09-15"],
            "historical_events": "Jewish expulsion from Spain, Columbus voyage to Americas",
            "feast_alignments": ["Passover", "Tabernacles", "Passover", "Tabernacles"],
            "significance": 0.95
        },
        {
            "period": "1949-1950",
            "dates": ["1949-04-13", "1949-10-07", "1950-04-02", "1950-09-26"],
            "historical_events": "State of Israel established (1948), Jerusalem made capital",
            "feast_alignments": ["Passover", "Tabernacles", "Passover", "Tabernacles"],
            "significance": 0.98
        },
        {
            "period": "1967-1968",
            "dates": ["1967-04-24", "1967-10-18", "1968-04-13", "1968-10-06"],
            "historical_events": "Six-Day War, Jerusalem reunified under Israeli control",
            "feast_alignments": ["Passover", "Tabernacles", "Passover", "Tabernacles"],
            "significance": 0.99
        },
        {
            "period": "2014-2015",
            "dates": ["2014-04-15", "2014-10-08", "2015-04-04", "2015-09-28"],
            "historical_events": "Gaza conflict, ISIS rise, increased Middle East tensions",
            "feast_alignments": ["Passover", "Tabernacles", "Passover", "Tabernacles"],
            "significance": 0.92
        }
    ]
    
    # Filter by year range
    filtered = [
        t for t in tetrads
        if start_year <= int(t["period"].split("-")[0]) <= end_year
    ]
    
    return {
        "count": len(filtered),
        "tetrads": filtered,
        "biblical_reference": "Joel 2:31 - 'The sun shall be turned into darkness, and the moon into blood'",
        "note": "All listed tetrads aligned with Jewish feast days (Passover/Tabernacles)"
    }


@router.get("/prophetic-significance")
async def calculate_prophetic_significance(
    event_type: str = Query(..., description="Event type"),
    event_date: datetime = Query(..., description="Event date")
):
    """
    Calculate prophetic significance score for an event.
    
    Factors:
    - Event type (eclipse, conjunction, etc.)
    - Biblical correlations
    - Feast day alignment
    - Historical parallels
    """
    try:
        event = {
            'type': event_type,
            'date': event_date
        }
        
        score, references = watchman_system.calculate_prophetic_significance(event, [])
        
        return {
            "event_type": event_type,
            "event_date": event_date.isoformat(),
            "significance_score": score,
            "significance_level": (
                "EXTREMELY HIGH" if score >= 0.8 else
                "HIGH" if score >= 0.6 else
                "MODERATE" if score >= 0.4 else
                "LOW" if score >= 0.2 else
                "MINIMAL"
            ),
            "biblical_references": references,
            "feast_alignment": {
                "passover_season": event_date.month in [3, 4],
                "tabernacles_season": event_date.month in [9, 10]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")


# ============================================================================
# HEALTH & STATUS
# ============================================================================

@router.get("/status")
async def ml_status():
    """Get ML system status and model information."""
    return {
        "status": "operational",
        "models": {
            "neo_predictor": {
                "type": "Random Forest + Gradient Boosting",
                "trained": neo_predictor.is_trained,
                "capabilities": [
                    "Collision probability",
                    "Torino Scale (0-10)",
                    "Palermo Scale",
                    "Impact energy",
                    "Orbital stability",
                    "Interstellar anomaly detection"
                ]
            },
            "watchman_system": {
                "type": "Gradient Boosting + DBSCAN + Random Forest",
                "trained": watchman_system.is_trained,
                "capabilities": [
                    "Severity scoring (0-100)",
                    "Prophetic significance (0-1)",
                    "Tetrad detection",
                    "Conjunction patterns",
                    "Event clustering",
                    "Biblical reference integration"
                ]
            }
        },
        "version": "1.0.0",
        "last_updated": datetime.now().isoformat()
    }
