"""
Theological endpoints (prophecies, celestial signs, prophecy-sign links).
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.theological import Prophecies, CelestialSigns, ProphecySignLinks
from app.schemas.theological import (
    PropheciesResponse,
    CelestialSignsResponse,
    ProphecySignLinksResponse,
    PaginatedPropheciesResponse,
    PaginatedCelestialSignsResponse,
    PaginatedProphecySignLinksResponse
)

router = APIRouter()


@router.get("/prophecies", response_model=PaginatedPropheciesResponse, tags=["prophecies"])
def get_prophecies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=1000, description="Number of records to return"),
    category: Optional[str] = Query(None, description="Filter by prophecy category"),
    event_name: Optional[str] = Query(None, description="Filter by event name (partial match)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve biblical prophecies with scripture references.
    
    Returns prophecy records from books like Revelation, Isaiah, Joel, Zechariah
    with categorization and chronological ordering.
    """
    query = db.query(Prophecies)
    
    if category:
        query = query.filter(Prophecies.prophecy_category == category)
    
    if event_name:
        query = query.filter(Prophecies.event_name.ilike(f"%{event_name}%"))
    
    total = query.count()
    records = query.order_by(Prophecies.chronological_order.nullslast(), Prophecies.id).offset(skip).limit(limit).all()
    
    return PaginatedPropheciesResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[PropheciesResponse.model_validate(r) for r in records]
    )


@router.get("/celestial-signs", response_model=PaginatedCelestialSignsResponse, tags=["celestial signs"])
def get_celestial_signs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    sign_type: Optional[str] = Query(None, description="Filter by sign type (COSMIC, TERRESTRIAL, ATMOSPHERIC, etc.)"),
    sign_name: Optional[str] = Query(None, description="Filter by sign name (partial match)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve celestial signs with theological interpretations.
    
    Returns prophetic signs that can be correlated with astronomical/geophysical events
    including scripture references and theological significance.
    """
    query = db.query(CelestialSigns)
    
    if sign_type:
        query = query.filter(CelestialSigns.sign_type == sign_type)
    
    if sign_name:
        query = query.filter(CelestialSigns.sign_name.ilike(f"%{sign_name}%"))
    
    total = query.count()
    records = query.order_by(CelestialSigns.sign_name).offset(skip).limit(limit).all()
    
    return PaginatedCelestialSignsResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[CelestialSignsResponse.model_validate(r) for r in records]
    )


@router.get("/prophecy-sign-links", response_model=PaginatedProphecySignLinksResponse, tags=["prophecy-sign links"])
def get_prophecy_sign_links(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    prophecy_id: Optional[int] = Query(None, description="Filter by prophecy ID"),
    sign_id: Optional[int] = Query(None, description="Filter by sign ID"),
    db: Session = Depends(get_db),
):
    """
    Retrieve many-to-many links between prophecies and celestial signs.
    
    Shows relationships between biblical prophecies and their associated signs.
    """
    query = db.query(ProphecySignLinks)
    
    if prophecy_id is not None:
        query = query.filter(ProphecySignLinks.prophecy_id == prophecy_id)
    
    if sign_id is not None:
        query = query.filter(ProphecySignLinks.sign_id == sign_id)
    
    total = query.count()
    records = query.order_by(ProphecySignLinks.prophecy_id, ProphecySignLinks.sign_id).offset(skip).limit(limit).all()
    
    return PaginatedProphecySignLinksResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[ProphecySignLinksResponse.model_validate(r) for r in records]
    )
