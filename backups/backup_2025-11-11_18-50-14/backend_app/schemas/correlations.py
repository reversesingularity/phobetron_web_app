"""Pydantic schemas for correlation analysis models."""

from datetime import datetime
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# ==================== Correlation Rules Schemas ====================

class CorrelationRulesBase(BaseModel):
    """Base schema for correlation rules with common fields."""
    rule_name: str = Field(..., description="Unique name for this correlation rule", max_length=255)
    description: Optional[str] = Field(None, description="Detailed description of what this rule detects")
    primary_event_type: str = Field(..., description="Type of event that triggers correlation check", max_length=100)
    primary_threshold: dict[str, Any] = Field(..., description="JSONB conditions for primary event")
    secondary_event_type: str = Field(..., description="Type of event to look for after primary", max_length=100)
    secondary_threshold: dict[str, Any] = Field(..., description="JSONB conditions for secondary event")
    time_window_days: int = Field(..., ge=1, le=365, description="Number of days to watch for secondary event after primary")
    minimum_confidence: float = Field(0.5, ge=0.0, le=1.0, description="Minimum confidence score (0.0-1.0) required")
    priority: int = Field(3, ge=1, le=5, description="Priority level 1-5 (1=highest)")
    is_active: bool = Field(True, description="Whether this rule is currently active")


class CorrelationRulesCreate(CorrelationRulesBase):
    """Schema for creating new correlation rule."""
    pass


class CorrelationRulesUpdate(BaseModel):
    """Schema for updating correlation rule (all fields optional)."""
    rule_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    primary_event_type: Optional[str] = Field(None, max_length=100)
    primary_threshold: Optional[dict[str, Any]] = None
    secondary_event_type: Optional[str] = Field(None, max_length=100)
    secondary_threshold: Optional[dict[str, Any]] = None
    time_window_days: Optional[int] = Field(None, ge=1, le=365)
    minimum_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    priority: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None


class CorrelationRulesResponse(CorrelationRulesBase):
    """Schema for correlation rule responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Event Correlations Schemas ====================

class EventCorrelationsBase(BaseModel):
    """Base schema for event correlations with common fields."""
    rule_id: Optional[int] = Field(None, description="Reference to the correlation rule that detected this")
    primary_event_id: UUID = Field(..., description="UUID of the primary/trigger event")
    primary_event_type: str = Field(..., description="Type of primary event", max_length=100)
    primary_event_time: datetime = Field(..., description="When the primary event occurred")
    primary_event_data: Optional[dict[str, Any]] = Field(None, description="JSONB snapshot of primary event details")
    secondary_event_id: UUID = Field(..., description="UUID of the secondary/consequent event")
    secondary_event_type: str = Field(..., description="Type of secondary event", max_length=100)
    secondary_event_time: datetime = Field(..., description="When the secondary event occurred")
    secondary_event_data: Optional[dict[str, Any]] = Field(None, description="JSONB snapshot of secondary event details")
    time_delta_hours: float = Field(..., ge=0, description="Hours between primary and secondary events")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0.0-1.0 for this correlation")
    spatial_distance_km: Optional[float] = Field(None, ge=0, description="Distance in kilometers between events")
    notes: Optional[str] = Field(None, description="Additional notes or context about this correlation")


class EventCorrelationsCreate(EventCorrelationsBase):
    """Schema for creating new event correlation."""
    pass


class EventCorrelationsUpdate(BaseModel):
    """Schema for updating event correlation (all fields optional)."""
    rule_id: Optional[int] = None
    primary_event_id: Optional[UUID] = None
    primary_event_type: Optional[str] = Field(None, max_length=100)
    primary_event_time: Optional[datetime] = None
    primary_event_data: Optional[dict[str, Any]] = None
    secondary_event_id: Optional[UUID] = None
    secondary_event_type: Optional[str] = Field(None, max_length=100)
    secondary_event_time: Optional[datetime] = None
    secondary_event_data: Optional[dict[str, Any]] = None
    time_delta_hours: Optional[float] = Field(None, ge=0)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    spatial_distance_km: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class EventCorrelationsResponse(EventCorrelationsBase):
    """Schema for event correlation responses."""
    id: UUID
    detected_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Paginated Response Schemas ====================

class PaginatedCorrelationRulesResponse(BaseModel):
    """Paginated response for correlation rules."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[CorrelationRulesResponse] = Field(..., description="List of correlation rule records")


class PaginatedEventCorrelationsResponse(BaseModel):
    """Paginated response for event correlations."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[EventCorrelationsResponse] = Field(..., description="List of event correlation records")
