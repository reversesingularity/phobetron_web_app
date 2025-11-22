"""
Alert system endpoints (data triggers, alerts).
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.alerts import DataTriggers, Alerts
from app.schemas.alerts import (
    DataTriggersResponse,
    AlertsResponse,
    PaginatedDataTriggersResponse,
    PaginatedAlertsResponse
)

router = APIRouter()


@router.get("/data-triggers", response_model=PaginatedDataTriggersResponse, tags=["data triggers"])
def get_data_triggers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=1000, description="Number of records to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sign_id: Optional[int] = Query(None, description="Filter by celestial sign ID"),
    priority: Optional[int] = Query(None, ge=1, le=5, description="Filter by priority level"),
    db: Session = Depends(get_db),
):
    """
    Retrieve configurable alert trigger rules (Prophetic Data Signatures).
    
    Returns trigger rules that generate alerts when astronomical or geophysical events
    match specific criteria.
    """
    query = db.query(DataTriggers)
    
    if is_active is not None:
        query = query.filter(DataTriggers.is_active == is_active)
    
    if sign_id is not None:
        query = query.filter(DataTriggers.sign_id == sign_id)
    
    if priority is not None:
        query = query.filter(DataTriggers.priority == priority)
    
    total = query.count()
    records = query.order_by(DataTriggers.priority, DataTriggers.trigger_name).offset(skip).limit(limit).all()
    
    return PaginatedDataTriggersResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[DataTriggersResponse.model_validate(r) for r in records]
    )


@router.get("/alerts", response_model=PaginatedAlertsResponse, tags=["alerts"])
def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    status: Optional[str] = Query(None, description="Filter by status (ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    alert_type: Optional[str] = Query(None, description="Filter by alert type"),
    db: Session = Depends(get_db),
):
    """
    Retrieve generated alerts with lifecycle tracking.
    
    Returns alerts when trigger conditions are met, including severity levels
    and status (ACTIVE → ACKNOWLEDGED → RESOLVED).
    """
    query = db.query(Alerts)
    
    if status:
        query = query.filter(Alerts.status == status)
    
    if severity:
        query = query.filter(Alerts.severity == severity)
    
    if alert_type:
        query = query.filter(Alerts.alert_type == alert_type)
    
    total = query.count()
    records = query.order_by(Alerts.triggered_at.desc()).offset(skip).limit(limit).all()
    
    return PaginatedAlertsResponse(
        total=total,
        skip=skip,
        limit=limit,
        data=[AlertsResponse.model_validate(r) for r in records]
    )
