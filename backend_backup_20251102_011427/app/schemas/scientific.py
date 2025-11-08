"""Pydantic schemas for scientific data models."""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, model_validator


# ==================== Ephemeris Data Schemas ====================

class EphemerisDataBase(BaseModel):
    """Base schema for ephemeris data with common fields."""
    object_name: str = Field(..., description="Name or designation of the celestial object", max_length=255)
    object_type: str = Field(..., description="Type: asteroid, comet, planet, etc.", max_length=50)
    epoch_iso: datetime = Field(..., description="ISO 8601 timestamp of observation")
    x_au: float = Field(..., description="X coordinate in Astronomical Units")
    y_au: float = Field(..., description="Y coordinate in Astronomical Units")
    z_au: float = Field(..., description="Z coordinate in Astronomical Units")
    vx_au_day: Optional[float] = Field(None, description="X velocity component in AU/day")
    vy_au_day: Optional[float] = Field(None, description="Y velocity component in AU/day")
    vz_au_day: Optional[float] = Field(None, description="Z velocity component in AU/day")
    data_source: Optional[str] = Field(None, description="Source: JPL, MPC, etc.", max_length=100)


class EphemerisDataCreate(EphemerisDataBase):
    """Schema for creating new ephemeris data."""
    pass


class EphemerisDataUpdate(BaseModel):
    """Schema for updating ephemeris data (all fields optional)."""
    object_name: Optional[str] = Field(None, max_length=255)
    object_type: Optional[str] = Field(None, max_length=50)
    epoch_iso: Optional[datetime] = None
    x_au: Optional[float] = None
    y_au: Optional[float] = None
    z_au: Optional[float] = None
    vx_au_day: Optional[float] = None
    vy_au_day: Optional[float] = None
    vz_au_day: Optional[float] = None
    data_source: Optional[str] = Field(None, max_length=100)


class EphemerisDataResponse(EphemerisDataBase):
    """Schema for ephemeris data responses."""
    id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Orbital Elements Schemas ====================

class OrbitalElementsBase(BaseModel):
    """Base schema for orbital elements with common fields."""
    object_name: str = Field(..., description="Name or designation of the celestial object", max_length=255)
    epoch_iso: datetime = Field(..., description="Reference epoch for orbital elements")
    semi_major_axis_au: float = Field(..., description="Semi-major axis in AU")
    eccentricity: float = Field(..., ge=0, description="Orbital eccentricity (0 = circle, <1 = ellipse, >=1 = hyperbola)")
    inclination_deg: float = Field(..., ge=0, le=180, description="Orbital inclination in degrees")
    longitude_ascending_node_deg: float = Field(..., description="Longitude of ascending node in degrees")
    argument_perihelion_deg: float = Field(..., description="Argument of perihelion in degrees")
    mean_anomaly_deg: float = Field(..., description="Mean anomaly at epoch in degrees")
    data_source: Optional[str] = Field(None, description="Source: JPL, MPC, etc.", max_length=100)


class OrbitalElementsCreate(OrbitalElementsBase):
    """Schema for creating new orbital elements."""
    pass


class OrbitalElementsUpdate(BaseModel):
    """Schema for updating orbital elements (all fields optional)."""
    object_name: Optional[str] = Field(None, max_length=255)
    epoch_iso: Optional[datetime] = None
    semi_major_axis_au: Optional[float] = None
    eccentricity: Optional[float] = Field(None, ge=0)
    inclination_deg: Optional[float] = Field(None, ge=0, le=180)
    longitude_ascending_node_deg: Optional[float] = None
    argument_perihelion_deg: Optional[float] = None
    mean_anomaly_deg: Optional[float] = None
    data_source: Optional[str] = Field(None, max_length=100)


class OrbitalElementsResponse(OrbitalElementsBase):
    """Schema for orbital elements responses."""
    id: UUID
    is_interstellar: Optional[bool] = Field(None, description="True if eccentricity >= 1.0 (hyperbolic orbit)")
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Impact Risks Schemas ====================

class ImpactRisksBase(BaseModel):
    """Base schema for impact risk assessments."""
    object_name: str = Field(..., description="Name or designation of the NEO", max_length=255)
    impact_date: datetime = Field(..., description="Potential impact date")
    impact_probability: float = Field(..., ge=0, le=1, description="Impact probability (0.0 to 1.0)")
    palermo_scale: Optional[float] = Field(None, description="Palermo Technical Impact Hazard Scale value")
    torino_scale: Optional[int] = Field(None, ge=0, le=10, description="Torino Scale value (0-10)")
    estimated_diameter_m: Optional[float] = Field(None, description="Estimated object diameter in meters")
    impact_energy_mt: Optional[float] = Field(None, description="Estimated impact energy in megatons TNT")
    data_source: Optional[str] = Field(None, description="Source: NASA Sentry, ESA NEOCC, etc.", max_length=100)


class ImpactRisksCreate(ImpactRisksBase):
    """Schema for creating new impact risk assessment."""
    pass


class ImpactRisksUpdate(BaseModel):
    """Schema for updating impact risk assessment (all fields optional)."""
    object_name: Optional[str] = Field(None, max_length=255)
    impact_date: Optional[datetime] = None
    impact_probability: Optional[float] = Field(None, ge=0, le=1)
    palermo_scale: Optional[float] = None
    torino_scale: Optional[int] = Field(None, ge=0, le=10)
    estimated_diameter_m: Optional[float] = None
    impact_energy_mt: Optional[float] = None
    data_source: Optional[str] = Field(None, max_length=100)


class ImpactRisksResponse(ImpactRisksBase):
    """Schema for impact risk responses."""
    id: UUID
    assessment_date: datetime
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== NEO Close Approaches Schemas ====================

class NeoCloseApproachesBase(BaseModel):
    """Base schema for NEO close approaches."""
    object_name: str = Field(..., description="Name or designation of the NEO", max_length=255)
    approach_date: datetime = Field(..., description="Date and time of closest approach")
    miss_distance_au: float = Field(..., gt=0, description="Miss distance in Astronomical Units")
    miss_distance_lunar: Optional[float] = Field(None, description="Miss distance in lunar distances (LD)")
    relative_velocity_km_s: Optional[float] = Field(None, description="Relative velocity in km/s")
    estimated_diameter_m: Optional[float] = Field(None, description="Estimated object diameter in meters")
    absolute_magnitude: Optional[float] = Field(None, description="Absolute magnitude (H)")
    data_source: Optional[str] = Field(None, description="Source: JPL SBDB, etc.", max_length=100)


class NeoCloseApproachesCreate(NeoCloseApproachesBase):
    """Schema for creating new NEO close approach record."""
    pass


class NeoCloseApproachesUpdate(BaseModel):
    """Schema for updating NEO close approach (all fields optional)."""
    object_name: Optional[str] = Field(None, max_length=255)
    approach_date: Optional[datetime] = None
    miss_distance_au: Optional[float] = Field(None, gt=0)
    miss_distance_lunar: Optional[float] = None
    relative_velocity_km_s: Optional[float] = None
    estimated_diameter_m: Optional[float] = None
    absolute_magnitude: Optional[float] = None
    data_source: Optional[str] = Field(None, max_length=100)


class NeoCloseApproachesResponse(NeoCloseApproachesBase):
    """Schema for NEO close approach responses."""
    id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==================== Paginated Response Schemas ====================

class PaginatedEphemerisResponse(BaseModel):
    """Paginated response for ephemeris data."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[EphemerisDataResponse] = Field(..., description="List of ephemeris data records")


class PaginatedOrbitalElementsResponse(BaseModel):
    """Paginated response for orbital elements."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[OrbitalElementsResponse] = Field(..., description="List of orbital elements records")


class PaginatedImpactRisksResponse(BaseModel):
    """Paginated response for impact risks."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[ImpactRisksResponse] = Field(..., description="List of impact risk records")


class PaginatedNeoCloseApproachesResponse(BaseModel):
    """Paginated response for NEO close approaches."""
    total: int = Field(..., description="Total number of records")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum number of records returned")
    data: list[NeoCloseApproachesResponse] = Field(..., description="List of NEO close approach records")
