"""Scientific data models for astronomical observations."""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import (
    Column, String, Float, DateTime, Integer, Boolean, Text,
    CheckConstraint, UniqueConstraint, Index, Computed
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from app.db.base import Base


class EphemerisData(Base):
    """
    Celestial object positions over time.
    
    Stores ephemeris data (position and velocity) for celestial objects
    at specific epochs. Used for tracking asteroids, comets, planets, etc.
    """
    __tablename__ = "ephemeris_data"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Object identification
    object_name = Column(String(255), nullable=False, index=True,
                        comment="Name or designation of the celestial object")
    object_type = Column(String(50), nullable=False,
                        comment="Type: asteroid, comet, planet, etc.")
    
    # Temporal data
    epoch_iso = Column(DateTime, nullable=False, index=True,
                      comment="ISO 8601 timestamp of observation")
    
    # Position (Cartesian coordinates in AU)
    x_au = Column(Float, nullable=False,
                 comment="X coordinate in Astronomical Units")
    y_au = Column(Float, nullable=False,
                 comment="Y coordinate in Astronomical Units")
    z_au = Column(Float, nullable=False,
                 comment="Z coordinate in Astronomical Units")
    
    # Velocity (AU/day)
    vx_au_day = Column(Float, nullable=True,
                      comment="X velocity component in AU/day")
    vy_au_day = Column(Float, nullable=True,
                      comment="Y velocity component in AU/day")
    vz_au_day = Column(Float, nullable=True,
                      comment="Z velocity component in AU/day")
    
    # Metadata
    data_source = Column(String(100), nullable=True,
                        comment="Source: JPL, MPC, etc.")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('object_name', 'epoch_iso', 
                        name='uq_ephemeris_object_epoch'),
        Index('idx_ephemeris_object_epoch', 'object_name', 'epoch_iso'),
        Index('idx_ephemeris_type', 'object_type'),
    )
    
    def __repr__(self):
        return f"<EphemerisData(object={self.object_name}, epoch={self.epoch_iso})>"


class OrbitalElements(Base):
    """
    Orbital parameters for celestial objects.
    
    Stores Keplerian orbital elements that define an object's orbit.
    Includes computed field to identify interstellar objects (e > 1.0).
    """
    __tablename__ = "orbital_elements"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Object identification
    object_name = Column(String(255), nullable=False, index=True,
                        comment="Name or designation of the celestial object")
    
    # Temporal reference
    epoch_iso = Column(DateTime, nullable=False,
                      comment="Reference epoch for orbital elements")
    
    # Keplerian orbital elements
    semi_major_axis_au = Column(Float, nullable=False,
                               comment="Semi-major axis in AU")
    eccentricity = Column(Float, nullable=False,
                         comment="Orbital eccentricity (0 = circle, <1 = ellipse, >=1 = hyperbola)")
    inclination_deg = Column(Float, nullable=False,
                            comment="Orbital inclination in degrees")
    longitude_ascending_node_deg = Column(Float, nullable=False,
                                         comment="Longitude of ascending node in degrees")
    argument_perihelion_deg = Column(Float, nullable=False,
                                    comment="Argument of perihelion in degrees")
    mean_anomaly_deg = Column(Float, nullable=False,
                             comment="Mean anomaly at epoch in degrees")
    
    # Computed field - identifies interstellar objects
    is_interstellar = Column(Boolean,
                            Computed("(eccentricity >= 1.0)"),
                            comment="True if eccentricity >= 1.0 (hyperbolic orbit)")
    
    # Metadata
    data_source = Column(String(100), nullable=True,
                        comment="Source: JPL, MPC, etc.")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('eccentricity >= 0', name='ck_orbital_eccentricity_positive'),
        CheckConstraint('inclination_deg >= 0 AND inclination_deg <= 180',
                       name='ck_orbital_inclination_range'),
        UniqueConstraint('object_name', 'epoch_iso',
                        name='uq_orbital_object_epoch'),
        Index('idx_orbital_object', 'object_name'),
        Index('idx_orbital_interstellar', 'is_interstellar'),
    )
    
    def __repr__(self):
        return f"<OrbitalElements(object={self.object_name}, e={self.eccentricity})>"


class ImpactRisks(Base):
    """
    Near-Earth Object impact risk assessments.
    
    Stores NEO impact probability assessments from monitoring systems
    like NASA's Sentry or ESA's NEOCC.
    """
    __tablename__ = "impact_risks"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Object identification
    object_name = Column(String(255), nullable=False, index=True,
                        comment="Name or designation of the NEO")
    
    # Impact assessment
    impact_date = Column(DateTime, nullable=False, index=True,
                        comment="Potential impact date")
    impact_probability = Column(Float, nullable=False,
                               comment="Impact probability (0.0 to 1.0)")
    palermo_scale = Column(Float, nullable=True,
                          comment="Palermo Technical Impact Hazard Scale value")
    torino_scale = Column(Integer, nullable=True,
                         comment="Torino Scale value (0-10)")
    
    # Impact details
    estimated_diameter_m = Column(Float, nullable=True,
                                 comment="Estimated object diameter in meters")
    impact_energy_mt = Column(Float, nullable=True,
                             comment="Estimated impact energy in megatons TNT")
    
    # Metadata
    data_source = Column(String(100), nullable=True,
                        comment="Source: NASA Sentry, ESA NEOCC, etc.")
    assessment_date = Column(DateTime, default=datetime.utcnow, nullable=False,
                            comment="When this assessment was made")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('impact_probability >= 0 AND impact_probability <= 1',
                       name='ck_impact_probability_range'),
        CheckConstraint('torino_scale IS NULL OR (torino_scale >= 0 AND torino_scale <= 10)',
                       name='ck_torino_scale_range'),
        Index('idx_impact_risk_date', 'impact_date'),
        Index('idx_impact_risk_probability', 'impact_probability'),
        Index('idx_impact_risk_torino', 'torino_scale'),
    )
    
    def __repr__(self):
        return f"<ImpactRisks(object={self.object_name}, date={self.impact_date}, P={self.impact_probability})>"


class NeoCloseApproaches(Base):
    """
    Near-Earth Object close approach data.
    
    Records when NEOs make close approaches to Earth, including
    distance and relative velocity.
    """
    __tablename__ = "neo_close_approaches"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Object identification
    object_name = Column(String(255), nullable=False, index=True,
                        comment="Name or designation of the NEO")
    
    # Close approach data
    approach_date = Column(DateTime, nullable=False, index=True,
                          comment="Date and time of closest approach")
    miss_distance_au = Column(Float, nullable=False,
                             comment="Miss distance in Astronomical Units")
    miss_distance_lunar = Column(Float, nullable=True,
                                comment="Miss distance in lunar distances (LD)")
    relative_velocity_km_s = Column(Float, nullable=True,
                                   comment="Relative velocity in km/s")
    
    # Object properties
    estimated_diameter_m = Column(Float, nullable=True,
                                 comment="Estimated object diameter in meters")
    absolute_magnitude = Column(Float, nullable=True,
                               comment="Absolute magnitude (H)")
    
    # Metadata
    data_source = Column(String(100), nullable=True,
                        comment="Source: JPL SBDB, etc.")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('miss_distance_au > 0', name='ck_neo_distance_positive'),
        Index('idx_neo_approach_date', 'approach_date'),
        Index('idx_neo_approach_distance', 'miss_distance_au'),
    )
    
    def __repr__(self):
        return f"<NeoCloseApproaches(object={self.object_name}, date={self.approach_date}, dist={self.miss_distance_au:.4f} AU)>"


class CelestialEvents(Base):
    """
    Celestial events like eclipses, conjunctions, and astronomical phenomena.
    
    Stores astronomical events that may have prophetic significance,
    including eclipses, planetary conjunctions, and other celestial phenomena.
    """
    __tablename__ = "celestial_events"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Event identification
    event_type = Column(String(50), nullable=False, index=True,
                       comment="Type: blood_moon, lunar_eclipse, solar_eclipse, conjunction, tetrad")
    
    # Temporal data
    event_date = Column(DateTime, nullable=False, index=True,
                       comment="Date and time of the celestial event")
    
    # Event properties
    magnitude = Column(Float, nullable=True,
                      comment="Magnitude or intensity of the event")
    duration_hours = Column(Float, nullable=True,
                           comment="Duration of the event in hours")
    
    # Visibility and significance
    jerusalem_visible = Column(Boolean, default=False,
                              comment="Whether the event is visible from Jerusalem")
    feast_day = Column(String(100), nullable=True,
                      comment="Associated biblical feast day if any")
    
    # Location (for events with geographic relevance)
    latitude = Column(Float, nullable=True,
                     comment="Latitude in decimal degrees (-90 to 90)")
    longitude = Column(Float, nullable=True,
                      comment="Longitude in decimal degrees (-180 to 180)")
    
    # Significance scores
    significance_score = Column(Float, default=0.5,
                               comment="Historical significance score (0-1)")
    prophecy_correlation_score = Column(Float, default=0.5,
                                       comment="Prophecy correlation score (0-1)")
    
    # Description and metadata
    description = Column(Text, nullable=True,
                        comment="Detailed description of the event")
    
    # Celestial bodies involved
    celestial_bodies = Column(ARRAY(String), nullable=True,
                             comment="List of celestial bodies involved")
    
    # Metadata
    data_source = Column(String(100), nullable=True,
                        comment="Source of the event data")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('magnitude >= 0 AND magnitude <= 10', name='ck_event_magnitude_range'),
        CheckConstraint('significance_score >= 0 AND significance_score <= 1', name='ck_significance_range'),
        CheckConstraint('prophecy_correlation_score >= 0 AND prophecy_correlation_score <= 1', name='ck_prophecy_range'),
        Index('idx_celestial_event_date', 'event_date'),
        Index('idx_celestial_event_type', 'event_type'),
    )
    
    def __repr__(self):
        return f"<CelestialEvents(type={self.event_type}, date={self.event_date}, desc={self.description[:50]}...)>"
