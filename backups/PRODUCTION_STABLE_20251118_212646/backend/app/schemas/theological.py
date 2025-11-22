"""Pydantic schemas for theological data models."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


# ==================== Prophecies Schemas ====================

class PropheciesBase(BaseModel):
    """Base schema for prophecies with common fields."""
    event_name: str = Field(..., description="Name of prophetic event (e.g., 'Sixth Seal Judgment')", max_length=255)
    scripture_reference: str = Field(..., description="Bible reference (e.g., 'Revelation 6:12-14')", max_length=255)
    scripture_text: str = Field(..., description="Full text of the prophecy passage")
    event_description: Optional[str] = Field(None, description="Description of the prophetic events")
    prophecy_category: str = Field(..., description="Category: SEAL_JUDGMENT, TRUMPET_JUDGMENT, BOWL_JUDGMENT, etc.", max_length=100)
    chronological_order: Optional[int] = Field(None, description="Sequential order within a category (e.g., Seal 1-7)")
    theological_notes: Optional[str] = Field(None, description="Additional theological context or interpretive notes")


class PropheciesCreate(PropheciesBase):
    """Schema for creating new prophecy."""
    pass


class PropheciesUpdate(BaseModel):
    """Schema for updating prophecy (all fields optional)."""
    event_name: Optional[str] = Field(None, max_length=255)
    scripture_reference: Optional[str] = Field(None, max_length=255)
    scripture_text: Optional[str] = None
    event_description: Optional[str] = None
    prophecy_category: Optional[str] = Field(None, max_length=100)
    chronological_order: Optional[int] = None
    theological_notes: Optional[str] = None


class PropheciesResponse(PropheciesBase):
    """Schema for prophecy responses."""
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Celestial Signs Schemas ====================

class CelestialSignsBase(BaseModel):
    """Base schema for celestial signs with common fields."""
    sign_name: str = Field(..., description="Unique name of the celestial sign (e.g., 'Great Earthquake', 'Blood Moon')", max_length=255)
    sign_description: str = Field(..., description="Physical description of the sign as recorded in scripture")
    theological_interpretation: str = Field(..., description="Theological meaning and significance of the sign")
    primary_scripture: str = Field(..., description="Main scripture reference for this sign (e.g., 'Revelation 6:12')", max_length=255)
    related_scriptures: Optional[list[str]] = Field(None, description="Array of additional scripture references that mention this sign")
    sign_type: Optional[str] = Field(None, description="Type: COSMIC, TERRESTRIAL, ATMOSPHERIC, SOLAR, LUNAR, STELLAR, SEISMIC, VOLCANIC", max_length=100)


class CelestialSignsCreate(CelestialSignsBase):
    """Schema for creating new celestial sign."""
    pass


class CelestialSignsUpdate(BaseModel):
    """Schema for updating celestial sign (all fields optional)."""
    sign_name: Optional[str] = Field(None, max_length=255)
    sign_description: Optional[str] = None
    theological_interpretation: Optional[str] = None
    primary_scripture: Optional[str] = Field(None, max_length=255)
    related_scriptures: Optional[list[str]] = None
    sign_type: Optional[str] = Field(None, max_length=100)


class CelestialSignsResponse(CelestialSignsBase):
    """Schema for celestial sign responses."""
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Prophecy Sign Links Schemas ====================

class ProphecySignLinksBase(BaseModel):
    """Base schema for prophecy-sign links with common fields."""
    prophecy_id: int = Field(..., description="Reference to prophecies table")
    sign_id: int = Field(..., description="Reference to celestial_signs table")
    link_notes: Optional[str] = Field(None, description="Optional notes about this specific prophecy-sign relationship")


class ProphecySignLinksCreate(ProphecySignLinksBase):
    """Schema for creating new prophecy-sign link."""
    pass


class ProphecySignLinksUpdate(BaseModel):
    """Schema for updating prophecy-sign link (all fields optional)."""
    prophecy_id: Optional[int] = None
    sign_id: Optional[int] = None
    link_notes: Optional[str] = None


class ProphecySignLinksResponse(ProphecySignLinksBase):
    """Schema for prophecy-sign link responses."""
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Paginated Response Schemas ====================

class PaginatedPropheciesResponse(BaseModel):
    """Paginated response for prophecies."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[PropheciesResponse] = Field(..., description="List of prophecy records")


class PaginatedCelestialSignsResponse(BaseModel):
    """Paginated response for celestial signs."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[CelestialSignsResponse] = Field(..., description="List of celestial sign records")


class PaginatedProphecySignLinksResponse(BaseModel):
    """Paginated response for prophecy-sign links."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[ProphecySignLinksResponse] = Field(..., description="List of prophecy-sign link records")
