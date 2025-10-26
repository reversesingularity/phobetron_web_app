"""
Scientific data endpoints (ephemeris, orbital elements, impact risks, close approaches).
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.scientific import EphemerisData, OrbitalElements, ImpactRisks, NeoCloseApproaches
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
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    object_name: Optional[str] = Query(None, description="Filter by object name"),
    is_interstellar: Optional[bool] = Query(None, description="Filter by interstellar status"),
    db: Session = Depends(get_db),
):
    """
    Retrieve orbital elements for celestial objects.
    
    Returns orbital parameters like semi-major axis, eccentricity, inclination, etc.
    """
    query = db.query(OrbitalElements)
    
    if object_name:
        query = query.filter(OrbitalElements.object_name.ilike(f"%{object_name}%"))
    
    if is_interstellar is not None:
        query = query.filter(OrbitalElements.is_interstellar == is_interstellar)
    
    total = query.count()
    records = query.offset(skip).limit(limit).all()
    
    return PaginatedOrbitalElementsResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[OrbitalElementsResponse.model_validate(r) for r in records]
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
