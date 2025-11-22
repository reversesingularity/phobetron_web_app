"""
Correlation analysis endpoints (correlation rules, event correlations).
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.correlations import CorrelationRules, EventCorrelations
from app.schemas.correlations import (
    CorrelationRulesResponse,
    EventCorrelationsResponse,
    PaginatedCorrelationRulesResponse,
    PaginatedEventCorrelationsResponse
)

router = APIRouter()


@router.get("/correlation-rules", response_model=PaginatedCorrelationRulesResponse, tags=["correlation rules"])
def get_correlation_rules(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=1000, description="Number of records to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    primary_event_type: Optional[str] = Query(None, description="Filter by primary event type"),
    secondary_event_type: Optional[str] = Query(None, description="Filter by secondary event type"),
    db: Session = Depends(get_db),
):
    """
    Retrieve configurable rules for detecting correlations between event types.
    
    Returns correlation rules that define patterns to watch for, such as:
    - X-class solar flare → M7.5+ earthquake within 72 hours
    - Asteroid close approach → Increased seismic activity within 7 days
    """
    query = db.query(CorrelationRules)
    
    if is_active is not None:
        query = query.filter(CorrelationRules.is_active == is_active)
    
    if primary_event_type:
        query = query.filter(CorrelationRules.primary_event_type == primary_event_type)
    
    if secondary_event_type:
        query = query.filter(CorrelationRules.secondary_event_type == secondary_event_type)
    
    total = query.count()
    records = query.order_by(CorrelationRules.priority, CorrelationRules.rule_name).offset(skip).limit(limit).all()
    
    return PaginatedCorrelationRulesResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[CorrelationRulesResponse.model_validate(r) for r in records]
    )


@router.get("/event-correlations", response_model=PaginatedEventCorrelationsResponse, tags=["event correlations"])
def get_event_correlations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    rule_id: Optional[int] = Query(None, description="Filter by correlation rule ID"),
    min_confidence: Optional[float] = Query(None, ge=0, le=1, description="Minimum confidence score"),
    primary_event_type: Optional[str] = Query(None, description="Filter by primary event type"),
    secondary_event_type: Optional[str] = Query(None, description="Filter by secondary event type"),
    db: Session = Depends(get_db),
):
    """
    Retrieve detected correlations between actual events.
    
    Returns records when a secondary event occurs within the time window after a primary event,
    providing the data foundation for analyzing patterns like:
    - Solar activity preceding earthquakes
    - Asteroid approaches correlating with volcanic activity
    - Lunar cycles and geophysical events
    """
    query = db.query(EventCorrelations)
    
    if rule_id is not None:
        query = query.filter(EventCorrelations.rule_id == rule_id)
    
    if min_confidence is not None:
        query = query.filter(EventCorrelations.confidence_score >= min_confidence)
    
    if primary_event_type:
        query = query.filter(EventCorrelations.primary_event_type == primary_event_type)
    
    if secondary_event_type:
        query = query.filter(EventCorrelations.secondary_event_type == secondary_event_type)
    
    total = query.count()
    records = query.order_by(EventCorrelations.detected_at.desc()).offset(skip).limit(limit).all()
    
    return PaginatedEventCorrelationsResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[EventCorrelationsResponse.model_validate(r) for r in records]
    )
