"""
Geophysical events endpoints (earthquakes, solar events, meteor showers, volcanic activity).
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
# Removed geoalchemy2 and shapely - using direct lat/lon columns now

from app.db.session import get_db
from app.models.events import Earthquakes, SolarEvents, MeteorShowers, VolcanicActivity
from app.schemas.events import (
    EarthquakesResponse,
    SolarEventsResponse,
    MeteorShowersResponse,
    VolcanicActivityResponse,
    PaginatedEarthquakesResponse,
    PaginatedSolarEventsResponse,
    PaginatedMeteorShowersResponse,
    PaginatedVolcanicActivityResponse
)

router = APIRouter()


@router.get("/earthquakes", response_model=PaginatedEarthquakesResponse, tags=["earthquakes"])
def get_earthquakes(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=1000, description="Number of records to return"),
    min_magnitude: Optional[float] = Query(None, description="Minimum earthquake magnitude"),
    region: Optional[str] = Query(None, description="Filter by region (partial match)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve earthquake records with geographic locations.
    
    Returns seismic event data with magnitude, depth, and location information.
    """
    query = db.query(Earthquakes)
    
    if min_magnitude is not None:
        query = query.filter(Earthquakes.magnitude >= min_magnitude)
    
    if region:
        query = query.filter(Earthquakes.region.ilike(f"%{region}%"))
    
    total = query.count()
    records = query.order_by(Earthquakes.event_time.desc()).offset(skip).limit(limit).all()
    
    # Build response with direct lat/lon from database
    response_data = []
    for r in records:
        response_data.append(EarthquakesResponse(
            id=r.id,
            event_id=r.event_id,
            event_time=r.event_time,
            magnitude=r.magnitude,
            magnitude_type=r.magnitude_type,
            latitude=r.latitude,
            longitude=r.longitude,
            depth_km=r.depth_km,
            region=r.region,
            data_source=r.data_source,
            created_at=r.created_at
        ))
    
    return PaginatedEarthquakesResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=response_data
    )


@router.get("/solar-events", response_model=PaginatedSolarEventsResponse, tags=["solar events"])
def get_solar_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    event_type: Optional[str] = Query(None, description="Filter by event type (solar_flare, cme, geomagnetic_storm)"),
    min_kp_index: Optional[float] = Query(None, ge=0, le=9, description="Minimum Kp index"),
    db: Session = Depends(get_db),
):
    """
    Retrieve solar activity records including flares, CMEs, and geomagnetic storms.
    """
    query = db.query(SolarEvents)
    
    if event_type:
        query = query.filter(SolarEvents.event_type == event_type)
    
    if min_kp_index is not None:
        query = query.filter(SolarEvents.kp_index >= min_kp_index)
    
    total = query.count()
    records = query.order_by(SolarEvents.event_start.desc()).offset(skip).limit(limit).all()
    
    return PaginatedSolarEventsResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[SolarEventsResponse.model_validate(r) for r in records]
    )


@router.get("/meteor-showers", response_model=PaginatedMeteorShowersResponse, tags=["meteor showers"])
def get_meteor_showers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    peak_month: Optional[int] = Query(None, ge=1, le=12, description="Filter by peak month"),
    shower_name: Optional[str] = Query(None, description="Filter by shower name (partial match)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve annual meteor shower reference data.
    
    Returns known meteor showers with peak dates, radiant positions, and ZHR.
    """
    query = db.query(MeteorShowers)
    
    if peak_month is not None:
        query = query.filter(MeteorShowers.peak_month == peak_month)
    
    if shower_name:
        query = query.filter(MeteorShowers.shower_name.ilike(f"%{shower_name}%"))
    
    total = query.count()
    records = query.order_by(MeteorShowers.peak_month, MeteorShowers.peak_day_start).offset(skip).limit(limit).all()
    
    return PaginatedMeteorShowersResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[MeteorShowersResponse.model_validate(r) for r in records]
    )


@router.get("/volcanic-activity", response_model=PaginatedVolcanicActivityResponse, tags=["volcanic activity"])
def get_volcanic_activity(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    min_vei: Optional[int] = Query(None, ge=0, le=8, description="Minimum Volcanic Explosivity Index"),
    volcano_name: Optional[str] = Query(None, description="Filter by volcano name (partial match)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve volcanic eruption records with geographic locations.
    
    Returns volcanic activity data with VEI, eruption type, and location information.
    """
    query = db.query(VolcanicActivity)
    
    if min_vei is not None:
        query = query.filter(VolcanicActivity.vei >= min_vei)
    
    if volcano_name:
        query = query.filter(VolcanicActivity.volcano_name.ilike(f"%{volcano_name}%"))
    
    total = query.count()
    records = query.order_by(VolcanicActivity.eruption_start.desc()).offset(skip).limit(limit).all()
    
    # Build response with direct lat/lon from database
    response_data = []
    for r in records:
        response_data.append(VolcanicActivityResponse(
            id=r.id,
            volcano_name=r.volcano_name,
            country=r.country,
            eruption_start=r.eruption_start,
            eruption_end=r.eruption_end,
            latitude=r.latitude,
            longitude=r.longitude,
            vei=r.vei,
            eruption_type=r.eruption_type,
            plume_height_km=r.plume_height_km,
            notes=r.notes,
            data_source=r.data_source,
            created_at=r.created_at
        ))
    
    return PaginatedVolcanicActivityResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=response_data
    )
