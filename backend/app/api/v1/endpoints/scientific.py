"""
Scientific data endpoints (ephemeris, orbital elements, impact risks, close approaches, seismos disasters).

Seismos (σεισμός) expansion: Matthew 24:7, Revelation 6:12 - "commotion of air and ground"
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.models.scientific import EphemerisData, OrbitalElements, ImpactRisks, NeoCloseApproaches
from app.models.events import Earthquakes, VolcanicActivity, Hurricane, Tsunami
from app.schemas.scientific import (
    EphemerisDataResponse,
    OrbitalElementsResponse,
    ImpactRisksResponse,
    NeoCloseApproachesResponse,
    PaginatedEphemerisResponse,
    PaginatedOrbitalElementsResponse,
    PaginatedImpactRisksResponse,
    PaginatedNeoCloseApproachesResponse
)
from app.schemas.events import (
    EarthquakesResponse,
    VolcanicActivityResponse,
    HurricanesResponse,
    TsunamisResponse,
    PaginatedEarthquakesResponse,
    PaginatedVolcanicActivityResponse,
    PaginatedHurricanesResponse,
    PaginatedTsunamisResponse
)

router = APIRouter()


@router.get("/ephemeris", response_model=PaginatedEphemerisResponse, tags=["ephemeris"])
def get_ephemeris_data(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=1000, description="Number of records to return"),
    object_name: Optional[str] = Query(None, description="Filter by object name"),
    db: Session = Depends(get_db),
):
    """
    Retrieve ephemeris data (position vectors) for celestial objects.
    
    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        object_name: Optional filter by object name
        db: Database session
        
    Returns:
        Paginated list of ephemeris records
    """
    query = db.query(EphemerisData)
    
    if object_name:
        query = query.filter(EphemerisData.object_name.ilike(f"%{object_name}%"))
    
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    
    return PaginatedEphemerisResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[EphemerisDataResponse.model_validate(r) for r in records]
    )


@router.get("/orbital-elements", response_model=PaginatedOrbitalElementsResponse, tags=["orbital elements"])
def get_orbital_elements(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=1000, description="Number of records to return"),
    object_name: Optional[str] = Query(None, description="Filter by object name"),
    is_interstellar: Optional[bool] = Query(None, description="Filter by interstellar status"),
):
    """
    Retrieve orbital elements for celestial objects.
    
    Returns orbital parameters like semi-major axis, eccentricity, inclination, etc.
    """
    try:
        from app.db.session import get_db
        from sqlalchemy.orm import Session
        
        db: Session = next(get_db())
        try:
            query = db.query(OrbitalElements)
            
            if object_name is not None and object_name != "":
                query = query.filter(OrbitalElements.object_name.ilike(f"%{object_name}%"))
            
            if is_interstellar is not None:
                # Use the eccentricity condition instead of the computed column
                if is_interstellar:
                    query = query.filter(OrbitalElements.eccentricity >= 1.0)
                else:
                    query = query.filter(OrbitalElements.eccentricity < 1.0)
            
            total = query.count()
            records = query.offset(skip).limit(limit).all()
            
            return PaginatedOrbitalElementsResponse(
                total=total,
                skip=skip,
                limit=limit,
                data=[OrbitalElementsResponse.model_validate(r) for r in records]
            )
        finally:
            db.close()
    except Exception as e:
        # Log the error and return a basic response
        print(f"Error in orbital-elements endpoint: {e}")
        import traceback
        traceback.print_exc()
        # Return empty response for now
        return PaginatedOrbitalElementsResponse(
            total=0,
            skip=skip,
            limit=limit,
            data=[]
        )


@router.get("/impact-risks", response_model=PaginatedImpactRisksResponse, tags=["impact risks"])
def get_impact_risks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    object_name: Optional[str] = Query(None, description="Filter by object name"),
    min_torino_scale: Optional[int] = Query(None, ge=0, le=10, description="Minimum Torino scale"),
    db: Session = Depends(get_db),
):
    """
    Retrieve impact risk assessments from JPL Sentry.
    
    Includes Torino scale, Palermo scale, and impact probabilities.
    """
    query = db.query(ImpactRisks)
    
    if object_name:
        query = query.filter(ImpactRisks.object_name.ilike(f"%{object_name}%"))
    
    if min_torino_scale is not None:
        query = query.filter(ImpactRisks.torino_scale >= min_torino_scale)
    
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    
    return PaginatedImpactRisksResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[ImpactRisksResponse.model_validate(r) for r in records]
    )


@router.get("/close-approaches", response_model=PaginatedNeoCloseApproachesResponse, tags=["close approaches"])
def get_close_approaches(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    object_name: Optional[str] = Query(None, description="Filter by object name"),
    max_distance_au: Optional[float] = Query(None, gt=0, description="Maximum approach distance in AU"),
    db: Session = Depends(get_db),
):
    """
    Retrieve NEO close approach data.
    
    Shows near-Earth object close approaches with distances and relative velocities.
    """
    query = db.query(NeoCloseApproaches)
    
    if object_name:
        query = query.filter(NeoCloseApproaches.object_name.ilike(f"%{object_name}%"))
    
    if max_distance_au is not None:
        query = query.filter(NeoCloseApproaches.miss_distance_au <= max_distance_au)
    
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    
    return PaginatedNeoCloseApproachesResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[NeoCloseApproachesResponse.model_validate(r) for r in records]
    )


# ==================== Seismos Natural Disasters ====================
# Greek σεισμός (seismos) - "commotion of air and ground" (Matthew 24:7, Revelation 6:12)


@router.get("/earthquakes", response_model=PaginatedEarthquakesResponse, tags=["seismos"])
def get_earthquakes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    min_magnitude: Optional[float] = Query(None, gt=0, description="Minimum Richter magnitude"),
    max_magnitude: Optional[float] = Query(None, gt=0, description="Maximum Richter magnitude"),
    region: Optional[str] = Query(None, description="Filter by region"),
    db: Session = Depends(get_db),
):
    """
    Retrieve earthquake records (Richter scale 0-10).
    
    Part of seismos (σεισμός) natural disasters - ground shaking events.
    Matthew 24:7: "There will be famines and earthquakes in various places."
    """
    query = db.query(Earthquakes)
    
    if min_magnitude is not None:
        query = query.filter(Earthquakes.magnitude >= min_magnitude)
    
    if max_magnitude is not None:
        query = query.filter(Earthquakes.magnitude <= max_magnitude)
    
    if region:
        query = query.filter(Earthquakes.region.ilike(f"%{region}%"))
    
    # Order by magnitude descending
    query = query.order_by(Earthquakes.magnitude.desc())
    
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    
    # Convert PostGIS to lat/lon for response
    response_data = []
    for record in records:
        data = EarthquakesResponse.model_validate(record)
        if record.location:
            # Extract lat/lon from PostGIS geometry
            result = db.execute(text(
                "SELECT ST_Y(:geom::geometry) as lat, ST_X(:geom::geometry) as lon"
            ), {"geom": str(record.location)}).first()
            if result:
                data.latitude = result.lat
                data.longitude = result.lon
        response_data.append(data)
    
    return PaginatedEarthquakesResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=response_data
    )


@router.get("/volcanic", response_model=PaginatedVolcanicActivityResponse, tags=["seismos"])
def get_volcanic_activity(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    min_vei: Optional[int] = Query(None, ge=0, le=8, description="Minimum VEI (0-8)"),
    max_vei: Optional[int] = Query(None, ge=0, le=8, description="Maximum VEI (0-8)"),
    country: Optional[str] = Query(None, description="Filter by country"),
    volcano_name: Optional[str] = Query(None, description="Filter by volcano name"),
    db: Session = Depends(get_db),
):
    """
    Retrieve volcanic eruption records (VEI scale 0-8).
    
    Part of seismos (σεισμός) natural disasters - ground eruption events.
    Revelation 6:12: "I watched as he opened the sixth seal. There was a great earthquake."
    """
    query = db.query(VolcanicActivity)
    
    if min_vei is not None:
        query = query.filter(VolcanicActivity.vei >= min_vei)
    
    if max_vei is not None:
        query = query.filter(VolcanicActivity.vei <= max_vei)
    
    if country:
        query = query.filter(VolcanicActivity.country.ilike(f"%{country}%"))
    
    if volcano_name:
        query = query.filter(VolcanicActivity.volcano_name.ilike(f"%{volcano_name}%"))
    
    # Order by VEI descending
    query = query.order_by(VolcanicActivity.vei.desc())
    
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    
    # Convert PostGIS to lat/lon for response
    response_data = []
    for record in records:
        # Extract lat/lon from PostGIS geometry
        lat = lon = None
        if record.location:
            try:
                from geoalchemy2.shape import to_shape
                point = to_shape(record.location)
                lon = point.x
                lat = point.y
            except:
                pass
        
        # Create response object
        data_dict = {
            "id": record.id,
            "volcano_name": record.volcano_name,
            "country": record.country,
            "eruption_start": record.eruption_start,
            "eruption_end": record.eruption_end,
            "vei": record.vei,
            "eruption_type": record.eruption_type,
            "plume_height_km": record.plume_height_km,
            "notes": record.notes,
            "data_source": record.data_source,
            "latitude": lat or 0.0,
            "longitude": lon or 0.0,
            "created_at": record.created_at
        }
        response_data.append(VolcanicActivityResponse(**data_dict))
    
    return PaginatedVolcanicActivityResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=response_data
    )


@router.get("/hurricanes", response_model=PaginatedHurricanesResponse, tags=["seismos"])
def get_hurricanes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    min_category: Optional[int] = Query(None, ge=1, le=5, description="Minimum Saffir-Simpson category"),
    max_category: Optional[int] = Query(None, ge=1, le=5, description="Maximum Saffir-Simpson category"),
    basin: Optional[str] = Query(None, description="Filter by basin (Atlantic, Pacific, etc.)"),
    season: Optional[int] = Query(None, description="Filter by hurricane season year"),
    storm_name: Optional[str] = Query(None, description="Filter by storm name"),
    db: Session = Depends(get_db),
):
    """
    Retrieve hurricane/cyclone/typhoon records (Saffir-Simpson scale 1-5).
    
    Part of seismos (σεισμός) natural disasters - air commotion events.
    Matthew 24:7: "Nation will rise against nation... and there will be earthquakes (σεισμός) in various places."
    Greek σεισμός includes violent atmospheric disturbances.
    """
    query = db.query(Hurricane)
    
    if min_category is not None:
        query = query.filter(Hurricane.category >= min_category)
    
    if max_category is not None:
        query = query.filter(Hurricane.category <= max_category)
    
    if basin:
        query = query.filter(Hurricane.basin.ilike(f"%{basin}%"))
    
    if season is not None:
        query = query.filter(Hurricane.season == season)
    
    if storm_name:
        query = query.filter(Hurricane.storm_name.ilike(f"%{storm_name}%"))
    
    # Order by category descending
    query = query.order_by(Hurricane.category.desc())
    
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    
    # Convert PostGIS to lat/lon for response
    response_data = []
    for record in records:
        # Extract lat/lon from PostGIS geometry
        lat = lon = None
        if record.peak_location:
            try:
                from geoalchemy2.shape import to_shape
                point = to_shape(record.peak_location)
                lon = point.x
                lat = point.y
            except:
                pass
        
        # Create response object
        data_dict = {
            "id": record.id,
            "storm_name": record.storm_name,
            "basin": record.basin,
            "storm_type": record.storm_type,
            "season": record.season,
            "formation_date": record.formation_date,
            "dissipation_date": record.dissipation_date,
            "max_sustained_winds_kph": record.max_sustained_winds_kph,
            "min_central_pressure_hpa": record.min_central_pressure_hpa,
            "category": record.category,
            "ace_index": record.ace_index,
            "fatalities": record.fatalities,
            "damages_usd_millions": record.damages_usd_millions,
            "affected_regions": record.affected_regions,
            "landfall_locations": record.landfall_locations,
            "notes": record.notes,
            "data_source": record.data_source,
            "peak_latitude": lat or 0.0,
            "peak_longitude": lon or 0.0,
            "created_at": record.created_at
        }
        response_data.append(HurricanesResponse(**data_dict))
    
    return PaginatedHurricanesResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=response_data
    )


@router.get("/tsunamis", response_model=PaginatedTsunamisResponse, tags=["seismos"])
def get_tsunamis(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    min_intensity: Optional[int] = Query(None, ge=0, le=12, description="Minimum Soloviev-Imamura intensity (0-12)"),
    max_intensity: Optional[int] = Query(None, ge=0, le=12, description="Maximum Soloviev-Imamura intensity (0-12)"),
    source_type: Optional[str] = Query(None, description="Filter by source (EARTHQUAKE, VOLCANIC, LANDSLIDE, METEORITE)"),
    warning_issued: Optional[bool] = Query(None, description="Filter by warning status"),
    db: Session = Depends(get_db),
):
    """
    Retrieve tsunami event records (Soloviev-Imamura scale 0-12).
    
    Part of seismos (σεισμός) natural disasters - sea commotion events.
    Revelation 6:12: "A great earthquake... the sun turned black... the whole moon turned blood red."
    Tsunamis often accompany major earthquakes as part of seismic disturbances.
    """
    query = db.query(Tsunami)
    
    if min_intensity is not None:
        query = query.filter(Tsunami.intensity_scale >= min_intensity)
    
    if max_intensity is not None:
        query = query.filter(Tsunami.intensity_scale <= max_intensity)
    
    if source_type:
        query = query.filter(Tsunami.source_type.ilike(f"%{source_type}%"))
    
    if warning_issued is not None:
        query = query.filter(Tsunami.warning_issued == warning_issued)
    
    # Order by intensity descending
    query = query.order_by(Tsunami.intensity_scale.desc())
    
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    
    # Convert PostGIS to lat/lon for response
    response_data = []
    for record in records:
        # Extract lat/lon from PostGIS geometry
        lat = lon = None
        if record.source_location:
            try:
                from geoalchemy2.shape import to_shape
                point = to_shape(record.source_location)
                lon = point.x
                lat = point.y
            except:
                pass
        
        # Create response object
        data_dict = {
            "id": record.id,
            "event_date": record.event_date,
            "source_type": record.source_type,
            "earthquake_magnitude": record.earthquake_magnitude,
            "max_wave_height_m": record.max_wave_height_m,
            "max_runup_m": record.max_runup_m,
            "affected_regions": record.affected_regions,
            "fatalities": record.fatalities,
            "damages_usd_millions": record.damages_usd_millions,
            "intensity_scale": record.intensity_scale,
            "travel_time_minutes": record.travel_time_minutes,
            "warning_issued": record.warning_issued,
            "notes": record.notes,
            "data_source": record.data_source,
            "source_latitude": lat or 0.0,
            "source_longitude": lon or 0.0,
            "created_at": record.created_at
        }
        response_data.append(TsunamisResponse(**data_dict))
    
    return PaginatedTsunamisResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=response_data
    )


# ==================== Seismos Correlation Training & Prediction ====================

@router.post("/correlations/train", tags=["correlations"])
async def train_seismos_correlations(
    db: Session = Depends(get_db)
):
    """
    Train all 4 seismos correlation models
    
    Greek σεισμός (seismos) - "commotion of air and ground" (Matthew 24:7, Revelation 6:12)
    
    Trains ML models to detect patterns:
    1. Celestial events → Earthquake clusters (7-day window, M >= 6.0)
    2. Solar activity → Volcanic eruptions (14-day window, VEI >= 4)
    3. Planetary alignments → Hurricane formation (30-day window, Cat 3+)
    4. Lunar cycles → Tsunami risk (3-day window, Intensity >= 6)
    
    Returns training metrics for all models including accuracy, precision, recall, F1-score.
    Target: 75%+ accuracy for each model.
    """
    from app.ml.seismos_correlations import SeismosCorrelationTrainer
    
    try:
        trainer = SeismosCorrelationTrainer()
        results = trainer.train_all_correlations(db)
        
        return {
            "status": "success",
            "message": "Seismos correlation models trained successfully",
            "results": results,
            "biblical_foundation": {
                "matthew_24_7": "Nation will rise against nation... and there will be earthquakes (σεισμός) in various places",
                "revelation_6_12": "I watched as he opened the sixth seal. There was a great earthquake (σεισμός)",
                "luke_21_25": "There will be signs in the sun, moon and stars... roaring and tossing of the sea"
            }
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": f"Failed to train correlation models: {str(e)}",
            "traceback": traceback.format_exc()
        }


@router.get("/correlations/metrics", tags=["correlations"])
async def get_correlation_metrics():
    """
    Get current seismos correlation model metrics
    
    Returns accuracy, precision, recall, F1-scores for all 4 trained models.
    """
    from app.ml.seismos_correlations import SeismosCorrelationTrainer
    
    # This would ideally load from a persisted trainer instance
    # For now, return structure showing what metrics are available
    return {
        "status": "info",
        "message": "Train models first using POST /api/v1/scientific/correlations/train",
        "available_models": [
            {
                "name": "celestial_earthquakes",
                "description": "Celestial events → Earthquake clusters",
                "features": ["blood_moon", "solar_eclipse", "lunar_eclipse", "conjunctions", "moon_phase", "tetrad", "jerusalem_visible", "feast_day", "solar_flares"],
                "target": "Earthquake M >= 6.0 within 7 days",
                "algorithm": "Random Forest"
            },
            {
                "name": "solar_volcanic",
                "description": "Solar activity → Volcanic eruptions",
                "features": ["x_class_flares", "m_class_flares", "cme_speed", "kp_index", "dst_index", "geomagnetic_storm", "solar_cycle_phase"],
                "target": "VEI >= 4 eruption within 14 days",
                "algorithm": "Gradient Boosting"
            },
            {
                "name": "planetary_hurricanes",
                "description": "Planetary alignments → Hurricane formation",
                "features": ["jupiter_saturn_conjunction", "venus_mars_conjunction", "multi_planet_alignment", "moon_phase", "tidal_force", "alignment_score"],
                "target": "Category 3+ hurricane within 30 days",
                "algorithm": "Random Forest"
            },
            {
                "name": "lunar_tsunamis",
                "description": "Lunar cycles → Tsunami risk",
                "features": ["moon_phase", "spring_tide", "perigee", "recent_earthquakes", "tidal_range", "lunar_declination"],
                "target": "Intensity >= 6 tsunami within 3 days",
                "algorithm": "Gradient Boosting"
            }
        ],
        "target_accuracy": "75%+",
        "biblical_foundation": "σεισμός (seismos) - Matthew 24:7, Revelation 6:12, Luke 21:25"
    }

