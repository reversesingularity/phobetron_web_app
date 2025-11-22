"""Pydantic schemas for alert system models."""

from datetime import datetime
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# ==================== Data Triggers Schemas ====================

class DataTriggersBase(BaseModel):
    """Base schema for data triggers with common fields."""
    sign_id: int = Field(..., description="Reference to celestial_signs table")
    trigger_name: str = Field(..., description="Descriptive name of the trigger", max_length=255)
    description: Optional[str] = Field(None, description="Detailed description of what this trigger watches for")
    data_source_api: str = Field(..., description="API/table to query: JPL_HORIZONS, JPL_SENTRY, USGS_EARTHQUAKE, etc.", max_length=100)
    query_parameter: str = Field(..., description="Field to check (e.g., 'torino_scale_max', 'magnitude')", max_length=100)
    query_operator: str = Field(..., description="Comparison operator: =, !=, >, <, >=, <=, CONTAINS, IN, BETWEEN", max_length=20)
    query_value: str = Field(..., description="Value to compare against", max_length=255)
    additional_conditions: Optional[dict[str, Any]] = Field(None, description="Complex nested conditions as JSON")
    priority: int = Field(3, ge=1, le=5, description="Priority level: 1=High, 2=Medium-High, 3=Medium, 4=Medium-Low, 5=Low")
    is_active: bool = Field(True, description="Whether this trigger is currently active and monitoring")


class DataTriggersCreate(DataTriggersBase):
    """Schema for creating new data trigger."""
    pass


class DataTriggersUpdate(BaseModel):
    """Schema for updating data trigger (all fields optional)."""
    sign_id: Optional[int] = None
    trigger_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    data_source_api: Optional[str] = Field(None, max_length=100)
    query_parameter: Optional[str] = Field(None, max_length=100)
    query_operator: Optional[str] = Field(None, max_length=20)
    query_value: Optional[str] = Field(None, max_length=255)
    additional_conditions: Optional[dict[str, Any]] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None


class DataTriggersResponse(DataTriggersBase):
    """Schema for data trigger responses."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Alerts Schemas ====================

class AlertsBase(BaseModel):
    """Base schema for alerts with common fields."""
    trigger_id: Optional[int] = Field(None, description="Reference to data_triggers table (NULL for manual alerts)")
    alert_type: str = Field(..., description="Type: IMPACT_RISK, CLOSE_APPROACH, EARTHQUAKE, etc.", max_length=100)
    title: str = Field(..., description="Brief alert title", max_length=255)
    description: str = Field(..., description="Detailed description of the alert and why it was triggered")
    related_object_name: Optional[str] = Field(None, description="Name of celestial object or location", max_length=255)
    related_event_id: Optional[UUID] = Field(None, description="UUID of the source event record")
    severity: str = Field(..., description="Severity level: LOW, MEDIUM, HIGH, CRITICAL", max_length=20)
    status: str = Field("ACTIVE", description="Alert status: ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED", max_length=20)
    trigger_data: Optional[dict[str, Any]] = Field(None, description="Complete snapshot of trigger conditions and event data")
    resolution_notes: Optional[str] = Field(None, description="Notes about how the alert was resolved")
    acknowledged_by: Optional[str] = Field(None, description="User who acknowledged the alert", max_length=100)
    resolved_by: Optional[str] = Field(None, description="User who resolved the alert", max_length=100)


class AlertsCreate(AlertsBase):
    """Schema for creating new alert."""
    pass


class AlertsUpdate(BaseModel):
    """Schema for updating alert (all fields optional)."""
    trigger_id: Optional[int] = None
    alert_type: Optional[str] = Field(None, max_length=100)
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    related_object_name: Optional[str] = Field(None, max_length=255)
    related_event_id: Optional[UUID] = None
    severity: Optional[str] = Field(None, max_length=20)
    status: Optional[str] = Field(None, max_length=20)
    trigger_data: Optional[dict[str, Any]] = None
    resolution_notes: Optional[str] = None
    acknowledged_by: Optional[str] = Field(None, max_length=100)
    resolved_by: Optional[str] = Field(None, max_length=100)


class AlertsResponse(AlertsBase):
    """Schema for alert responses."""
    id: UUID
    triggered_at: datetime
    acknowledged_at: Optional[datetime]
    resolved_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Paginated Response Schemas ====================

class PaginatedDataTriggersResponse(BaseModel):
    """Paginated response for data triggers."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[DataTriggersResponse] = Field(..., description="List of data trigger records")


class PaginatedAlertsResponse(BaseModel):
    """Paginated response for alerts."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[AlertsResponse] = Field(..., description="List of alert records")
