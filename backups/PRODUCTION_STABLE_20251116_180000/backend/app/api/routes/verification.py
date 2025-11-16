"""
Data Verification and Testing Endpoints
Provides API endpoints to verify database population and test data retrieval
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.db.session import get_db
from app.models.scientific import OrbitalElements, ImpactRisks
from app.models.events import VolcanicActivity, Hurricane, Tsunami

router = APIRouter(prefix="/api/v1/verify", tags=["verification"])


@router.get("/database-status")
async def get_database_status(db: Session = Depends(get_db)):
    """
    Get comprehensive database status with record counts for all tables
    
    Returns counts for:
    - Interstellar objects (eccentricity >= 1)
    - Total orbital elements
    - NEO impact risks
    - Volcanic eruptions
    - Hurricanes
    - Tsunamis
    """
    
    # Count orbital elements
    total_orbital = db.query(OrbitalElements).count()
    interstellar_count = db.query(OrbitalElements).filter(
        OrbitalElements.is_interstellar == True
    ).count()
    
    # Count NEO impact risks
    neo_count = db.query(ImpactRisks).count()
    high_risk_neo = db.query(ImpactRisks).filter(
        ImpactRisks.torino_scale >= 1
    ).count()
    
    # Count seismos events
    volcanic_count = db.query(VolcanicActivity).count()
    major_volcanic = db.query(VolcanicActivity).filter(
        VolcanicActivity.vei >= 5
    ).count()
    
    hurricane_count = db.query(Hurricane).count()
    cat5_hurricanes = db.query(Hurricane).filter(
        Hurricane.category == 5
    ).count()
    
    tsunami_count = db.query(Tsunami).count()
    major_tsunami = db.query(Tsunami).filter(
        Tsunami.intensity_scale >= 8
    ).count()
    
    return {
        "timestamp": datetime.now().isoformat(),
        "status": "operational",
        "orbital_elements": {
            "total": total_orbital,
            "interstellar": interstellar_count,
            "regular": total_orbital - interstellar_count
        },
        "neo_impact_risks": {
            "total": neo_count,
            "high_risk": high_risk_neo
        },
        "volcanic_activity": {
            "total": volcanic_count,
            "major_eruptions": major_volcanic
        },
        "hurricanes": {
            "total": hurricane_count,
            "category_5": cat5_hurricanes
        },
        "tsunamis": {
            "total": tsunami_count,
            "major_events": major_tsunami
        },
        "total_records": (
            total_orbital + neo_count + volcanic_count + 
            hurricane_count + tsunami_count
        )
    }


@router.get("/interstellar-objects")
async def verify_interstellar_objects(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Verify interstellar objects (eccentricity >= 1) are populated
    
    Returns sample of hyperbolic orbit objects
    """
    
    interstellar = db.query(OrbitalElements).filter(
        OrbitalElements.is_interstellar == True
    ).order_by(OrbitalElements.eccentricity.desc()).limit(limit).all()
    
    return {
        "count": len(interstellar),
        "objects": [
            {
                "name": obj.object_name,
                "eccentricity": obj.eccentricity,
                "semi_major_axis_au": obj.semi_major_axis_au,
                "inclination_deg": obj.inclination_deg,
                "data_source": obj.data_source,
                "epoch": obj.epoch_iso.isoformat() if obj.epoch_iso else None
            }
            for obj in interstellar
        ]
    }


@router.get("/neo-risks")
async def verify_neo_risks(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Verify NEO impact risk data is populated
    
    Returns sample of NEOs ordered by risk
    """
    
    neos = db.query(ImpactRisks).order_by(
        ImpactRisks.torino_scale.desc(),
        ImpactRisks.impact_probability.desc()
    ).limit(limit).all()
    
    return {
        "count": len(neos),
        "objects": [
            {
                "name": neo.object_name,
                "impact_date": neo.impact_date.isoformat() if neo.impact_date else None,
                "probability": neo.impact_probability,
                "torino_scale": neo.torino_scale,
                "palermo_scale": neo.palermo_scale,
                "diameter_m": neo.estimated_diameter_m,
                "data_source": neo.data_source
            }
            for neo in neos
        ]
    }


@router.get("/volcanic-activity")
async def verify_volcanic_activity(
    min_vei: Optional[int] = Query(None, ge=0, le=8),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Verify volcanic eruption data is populated
    
    Returns sample of volcanic eruptions
    """
    
    query = db.query(VolcanicActivity)
    
    if min_vei is not None:
        query = query.filter(VolcanicActivity.vei >= min_vei)
    
    eruptions = query.order_by(
        VolcanicActivity.eruption_start.desc()
    ).limit(limit).all()
    
    return {
        "count": len(eruptions),
        "eruptions": [
            {
                "volcano": eruption.volcano_name,
                "country": eruption.country,
                "vei": eruption.vei,
                "start": eruption.eruption_start.isoformat() if eruption.eruption_start else None,
                "end": eruption.eruption_end.isoformat() if eruption.eruption_end else None,
                "type": eruption.eruption_type,
                "data_source": eruption.data_source
            }
            for eruption in eruptions
        ]
    }


@router.get("/hurricanes")
async def verify_hurricanes(
    min_category: Optional[int] = Query(None, ge=1, le=5),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Verify hurricane data is populated
    
    Returns sample of hurricanes
    """
    
    query = db.query(Hurricane)
    
    if min_category is not None:
        query = query.filter(Hurricane.category >= min_category)
    
    hurricanes = query.order_by(
        Hurricane.formation_date.desc()
    ).limit(limit).all()
    
    return {
        "count": len(hurricanes),
        "hurricanes": [
            {
                "name": storm.storm_name,
                "season": storm.season,
                "basin": storm.basin,
                "category": storm.category,
                "max_winds_kph": storm.max_sustained_winds_kph,
                "min_pressure_hpa": storm.min_central_pressure_hpa,
                "formation": storm.formation_date.isoformat() if storm.formation_date else None,
                "fatalities": storm.fatalities,
                "data_source": storm.data_source
            }
            for storm in hurricanes
        ]
    }


@router.get("/tsunamis")
async def verify_tsunamis(
    min_intensity: Optional[int] = Query(None, ge=0, le=12),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Verify tsunami data is populated
    
    Returns sample of tsunami events
    """
    
    query = db.query(Tsunami)
    
    if min_intensity is not None:
        query = query.filter(Tsunami.intensity_scale >= min_intensity)
    
    tsunamis = query.order_by(
        Tsunami.event_date.desc()
    ).limit(limit).all()
    
    return {
        "count": len(tsunamis),
        "tsunamis": [
            {
                "date": event.event_date.isoformat() if event.event_date else None,
                "source_type": event.source_type,
                "magnitude": event.earthquake_magnitude,
                "max_wave_height_m": event.max_wave_height_m,
                "intensity_scale": event.intensity_scale,
                "fatalities": event.fatalities,
                "affected_regions": event.affected_regions,
                "data_source": event.data_source
            }
            for event in tsunamis
        ]
    }


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Quick health check to verify database connectivity
    """
    try:
        # Simple query to test connection
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "database": "disconnected",
            "error": str(e)
        }
