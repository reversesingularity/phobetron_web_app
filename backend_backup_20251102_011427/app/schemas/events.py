"""Pydantic schemas for geophysical event models."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# ==================== Earthquakes Schemas ====================

class EarthquakesBase(BaseModel):
    """Base schema for earthquake data with common fields."""
    event_id: Optional[str] = Field(None, description="External event ID (USGS, etc.)", max_length=100)
    event_time: datetime = Field(..., description="Time of earthquake occurrence")
    magnitude: float = Field(..., gt=0, description="Earthquake magnitude")
    magnitude_type: Optional[str] = Field(None, description="Type: Mw, ML, Ms, etc.", max_length=10)
    depth_km: Optional[float] = Field(None, ge=0, description="Depth below surface in kilometers")
    region: Optional[str] = Field(None, description="Geographic region description", max_length=255)
    data_source: Optional[str] = Field(None, description="Source: USGS, EMSC, etc.", max_length=100)
    # Note: location (PostGIS Geography) will be handled separately for create/update


class EarthquakesCreate(EarthquakesBase):
    """Schema for creating new earthquake record."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")


class EarthquakesUpdate(BaseModel):
    """Schema for updating earthquake (all fields optional)."""
    event_id: Optional[str] = Field(None, max_length=100)
    event_time: Optional[datetime] = None
    magnitude: Optional[float] = Field(None, gt=0)
    magnitude_type: Optional[str] = Field(None, max_length=10)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    depth_km: Optional[float] = Field(None, ge=0)
    region: Optional[str] = Field(None, max_length=255)
    data_source: Optional[str] = Field(None, max_length=100)


class EarthquakesResponse(EarthquakesBase):
    """Schema for earthquake responses."""
    id: UUID
    latitude: float = Field(..., description="Latitude in decimal degrees")
    longitude: float = Field(..., description="Longitude in decimal degrees")
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Solar Events Schemas ====================

class SolarEventsBase(BaseModel):
    """Base schema for solar events with common fields."""
    event_type: str = Field(..., description="Type: solar_flare, cme, geomagnetic_storm", max_length=50)
    event_start: datetime = Field(..., description="Start time of solar event")
    event_end: Optional[datetime] = Field(None, description="End time of solar event")
    flare_class: Optional[str] = Field(None, description="X-ray class: A, B, C, M, X", max_length=10)
    flare_region: Optional[str] = Field(None, description="Active region number", max_length=50)
    cme_speed_km_s: Optional[float] = Field(None, description="CME speed in km/s")
    cme_angle_deg: Optional[float] = Field(None, description="CME angular width in degrees")
    kp_index: Optional[float] = Field(None, ge=0, le=9, description="Planetary K-index (0-9)")
    dst_index_nt: Optional[float] = Field(None, description="Disturbance Storm Time index in nT")
    earth_arrival_time: Optional[datetime] = Field(None, description="Predicted/actual Earth arrival time")
    notes: Optional[str] = Field(None, description="Additional event details")
    data_source: Optional[str] = Field(None, description="Source: NOAA SWPC, NASA, etc.", max_length=100)


class SolarEventsCreate(SolarEventsBase):
    """Schema for creating new solar event."""
    pass


class SolarEventsUpdate(BaseModel):
    """Schema for updating solar event (all fields optional)."""
    event_type: Optional[str] = Field(None, max_length=50)
    event_start: Optional[datetime] = None
    event_end: Optional[datetime] = None
    flare_class: Optional[str] = Field(None, max_length=10)
    flare_region: Optional[str] = Field(None, max_length=50)
    cme_speed_km_s: Optional[float] = None
    cme_angle_deg: Optional[float] = None
    kp_index: Optional[float] = Field(None, ge=0, le=9)
    dst_index_nt: Optional[float] = None
    earth_arrival_time: Optional[datetime] = None
    notes: Optional[str] = None
    data_source: Optional[str] = Field(None, max_length=100)


class SolarEventsResponse(SolarEventsBase):
    """Schema for solar event responses."""
    id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Meteor Showers Schemas ====================

class MeteorShowersBase(BaseModel):
    """Base schema for meteor showers with common fields."""
    shower_name: str = Field(..., description="Official meteor shower name", max_length=100)
    iau_code: Optional[str] = Field(None, description="IAU three-letter code", max_length=10)
    peak_month: int = Field(..., ge=1, le=12, description="Peak month (1-12)")
    peak_day_start: int = Field(..., ge=1, le=31, description="Start day of peak period")
    peak_day_end: int = Field(..., ge=1, le=31, description="End day of peak period")
    radiant_ra_deg: Optional[float] = Field(None, ge=0, lt=360, description="Right ascension of radiant in degrees (J2000)")
    radiant_dec_deg: Optional[float] = Field(None, ge=-90, le=90, description="Declination of radiant in degrees (J2000)")
    zhr_max: Optional[int] = Field(None, description="Maximum Zenithal Hourly Rate")
    velocity_km_s: Optional[float] = Field(None, description="Entry velocity in km/s")
    parent_body: Optional[str] = Field(None, description="Associated comet or asteroid", max_length=100)


class MeteorShowersCreate(MeteorShowersBase):
    """Schema for creating new meteor shower."""
    pass


class MeteorShowersUpdate(BaseModel):
    """Schema for updating meteor shower (all fields optional)."""
    shower_name: Optional[str] = Field(None, max_length=100)
    iau_code: Optional[str] = Field(None, max_length=10)
    peak_month: Optional[int] = Field(None, ge=1, le=12)
    peak_day_start: Optional[int] = Field(None, ge=1, le=31)
    peak_day_end: Optional[int] = Field(None, ge=1, le=31)
    radiant_ra_deg: Optional[float] = Field(None, ge=0, lt=360)
    radiant_dec_deg: Optional[float] = Field(None, ge=-90, le=90)
    zhr_max: Optional[int] = None
    velocity_km_s: Optional[float] = None
    parent_body: Optional[str] = Field(None, max_length=100)


class MeteorShowersResponse(MeteorShowersBase):
    """Schema for meteor shower responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Volcanic Activity Schemas ====================

class VolcanicActivityBase(BaseModel):
    """Base schema for volcanic activity with common fields."""
    volcano_name: str = Field(..., description="Name of the volcano", max_length=255)
    country: Optional[str] = Field(None, description="Country or region", max_length=100)
    eruption_start: datetime = Field(..., description="Start time of eruption")
    eruption_end: Optional[datetime] = Field(None, description="End time of eruption (null if ongoing)")
    vei: Optional[int] = Field(None, ge=0, le=8, description="Volcanic Explosivity Index (0-8)")
    eruption_type: Optional[str] = Field(None, description="Type: explosive, effusive, phreatic, etc.", max_length=50)
    plume_height_km: Optional[float] = Field(None, ge=0, description="Maximum plume height in kilometers")
    notes: Optional[str] = Field(None, description="Additional eruption details")
    data_source: Optional[str] = Field(None, description="Source: Smithsonian GVP, VAAC, etc.", max_length=100)


class VolcanicActivityCreate(VolcanicActivityBase):
    """Schema for creating new volcanic activity record."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")


class VolcanicActivityUpdate(BaseModel):
    """Schema for updating volcanic activity (all fields optional)."""
    volcano_name: Optional[str] = Field(None, max_length=255)
    country: Optional[str] = Field(None, max_length=100)
    eruption_start: Optional[datetime] = None
    eruption_end: Optional[datetime] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    vei: Optional[int] = Field(None, ge=0, le=8)
    eruption_type: Optional[str] = Field(None, max_length=50)
    plume_height_km: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    data_source: Optional[str] = Field(None, max_length=100)


class VolcanicActivityResponse(VolcanicActivityBase):
    """Schema for volcanic activity responses."""
    id: UUID
    latitude: float = Field(..., description="Latitude in decimal degrees")
    longitude: float = Field(..., description="Longitude in decimal degrees")
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Paginated Response Schemas ====================

class PaginatedEarthquakesResponse(BaseModel):
    """Paginated response for earthquakes."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[EarthquakesResponse] = Field(..., description="List of earthquake records")


class PaginatedSolarEventsResponse(BaseModel):
    """Paginated response for solar events."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[SolarEventsResponse] = Field(..., description="List of solar event records")


class PaginatedMeteorShowersResponse(BaseModel):
    """Paginated response for meteor showers."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[MeteorShowersResponse] = Field(..., description="List of meteor shower records")


class PaginatedVolcanicActivityResponse(BaseModel):
    """Paginated response for volcanic activity."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[VolcanicActivityResponse] = Field(..., description="List of volcanic activity records")
