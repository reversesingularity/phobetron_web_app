"""
Theological endpoints (prophecies, celestial signs, prophecy-sign links, feast days).
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.theological import Prophecies, CelestialSigns, ProphecySignLinks, FeastDay
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


@router.get("/feasts", tags=["feasts"])
def get_feast_days(
    year: Optional[int] = Query(None, description="Filter by Gregorian year (e.g., 2025)"),
    feast_type: Optional[str] = Query(None, description="Filter by feast type: passover, unleavened_bread, pentecost, trumpets, atonement, tabernacles"),
    db: Session = Depends(get_db),
):
    """
    Retrieve Jewish biblical feast days (Hebrew calendar).
    
    Returns the seven major biblical feasts (Moedim) with their Gregorian and Hebrew dates:
    - Passover (Pesach) - Nisan 14
    - Feast of Unleavened Bread - Nisan 15-21
    - Pentecost (Shavuot) - 50 days after Passover
    - Feast of Trumpets (Rosh Hashanah) - Tishrei 1
    - Day of Atonement (Yom Kippur) - Tishrei 10
    - Feast of Tabernacles (Sukkot) - Tishrei 15-21
    
    Example:
        GET /api/v1/theological/feasts?year=2025
        GET /api/v1/theological/feasts?feast_type=passover
    """
    query = db.query(FeastDay)
    
    if year is not None:
        query = query.filter(FeastDay.gregorian_year == year)
    
    if feast_type:
        query = query.filter(FeastDay.feast_type == feast_type)
    
    records = query.order_by(FeastDay.gregorian_date).all()
    
    # Format response
    feast_data = []
    for feast in records:
        feast_dict = {
            "id": feast.id,
            "feast_type": feast.feast_type,
            "name": feast.name,
            "hebrew_date": feast.hebrew_date,
            "gregorian_year": feast.gregorian_year,
            "gregorian_date": feast.gregorian_date.isoformat(),
            "is_range": feast.is_range,
            "significance": feast.significance
        }
        
        if feast.is_range and feast.end_date:
            feast_dict["end_date"] = feast.end_date.isoformat()
        
        feast_data.append(feast_dict)
    
    return {
        "total": len(feast_data),
        "data": feast_data
    }
