"""Geophysical event models for Earth-based phenomena."""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import (
    Column, String, Float, DateTime, Integer,
    CheckConstraint, Index, Text
)
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from app.db.base import Base


class Earthquakes(Base):
    """
    Seismic event records.
    
    Stores earthquake data with geographic location using PostGIS.
    Includes magnitude, depth, and location information.
    """
    __tablename__ = "earthquakes"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Event identification
    event_id = Column(String(100), unique=True, nullable=True, index=True,
                     comment="External event ID (USGS, etc.)")
    
    # Temporal data
    event_time = Column(DateTime, nullable=False, index=True,
                       comment="Time of earthquake occurrence")
    
    # Magnitude
    magnitude = Column(Float, nullable=False, index=True,
                      comment="Earthquake magnitude")
    magnitude_type = Column(String(10), nullable=True,
                           comment="Type: Mw, ML, Ms, etc.")
    
    # Location - PostGIS geography point (lat/lon)
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable=False,
                     comment="Geographic location (WGS84)")
    
    # Depth
    depth_km = Column(Float, nullable=True,
                     comment="Depth below surface in kilometers")
    
    # Location description
    region = Column(String(255), nullable=True,
                   comment="Geographic region description")
    
    # Metadata
    data_source = Column(String(100), nullable=True,
                        comment="Source: USGS, EMSC, etc.")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Constraints and Indexes
    __table_args__ = (
        CheckConstraint('magnitude > 0', name='ck_earthquake_magnitude_positive'),
        CheckConstraint('depth_km IS NULL OR depth_km >= 0',
                       name='ck_earthquake_depth_nonnegative'),
        Index('idx_earthquake_time', 'event_time'),
        Index('idx_earthquake_magnitude', 'magnitude'),
        Index('idx_earthquake_location', 'location', postgresql_using='gist'),
    )
    
    def __repr__(self):
        return f"<Earthquakes(M={self.magnitude}, time={self.event_time}, region={self.region})>"


class SolarEvents(Base):
    """
    Solar activity records.
    
    Tracks solar flares, coronal mass ejections (CMEs), and
    geomagnetic storms that may affect Earth.
    """
    __tablename__ = "solar_events"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Event identification
    event_type = Column(String(50), nullable=False, index=True,
                       comment="Type: solar_flare, cme, geomagnetic_storm")
    
    # Temporal data
    event_start = Column(DateTime, nullable=False, index=True,
                        comment="Start time of solar event")
    event_end = Column(DateTime, nullable=True,
                      comment="End time of solar event")
    
    # Solar flare data
    flare_class = Column(String(10), nullable=True,
                        comment="X-ray class: A, B, C, M, X")
    flare_region = Column(String(50), nullable=True,
                         comment="Active region number")
    
    # CME data
    cme_speed_km_s = Column(Float, nullable=True,
                           comment="CME speed in km/s")
    cme_angle_deg = Column(Float, nullable=True,
                          comment="CME angular width in degrees")
    
    # Geomagnetic storm data
    kp_index = Column(Float, nullable=True,
                     comment="Planetary K-index (0-9)")
    dst_index_nt = Column(Float, nullable=True,
                         comment="Disturbance Storm Time index in nT")
    
    # Impact prediction
    earth_arrival_time = Column(DateTime, nullable=True,
                               comment="Predicted/actual Earth arrival time")
    
    # Additional details
    notes = Column(Text, nullable=True,
                  comment="Additional event details")
    
    # Metadata
    data_source = Column(String(100), nullable=True,
                        comment="Source: NOAA SWPC, NASA, etc.")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("event_type IN ('solar_flare', 'cme', 'geomagnetic_storm')",
                       name='ck_solar_event_type'),
        CheckConstraint('kp_index IS NULL OR (kp_index >= 0 AND kp_index <= 9)',
                       name='ck_kp_index_range'),
        Index('idx_solar_event_type', 'event_type'),
        Index('idx_solar_event_start', 'event_start'),
        Index('idx_solar_kp_index', 'kp_index'),
    )
    
    def __repr__(self):
        return f"<SolarEvents(type={self.event_type}, start={self.event_start}, class={self.flare_class})>"


class MeteorShowers(Base):
    """
    Annual meteor shower data.
    
    Reference data for known meteor showers including peak dates,
    radiant positions, and associated parent bodies.
    """
    __tablename__ = "meteor_showers"
    
    # Primary Key (SERIAL for reference data)
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Shower identification
    shower_name = Column(String(100), unique=True, nullable=False, index=True,
                        comment="Official meteor shower name")
    iau_code = Column(String(10), unique=True, nullable=True,
                     comment="IAU three-letter code")
    
    # Peak activity
    peak_month = Column(Integer, nullable=False,
                       comment="Peak month (1-12)")
    peak_day_start = Column(Integer, nullable=False,
                           comment="Start day of peak period")
    peak_day_end = Column(Integer, nullable=False,
                         comment="End day of peak period")
    
    # Radiant position (J2000)
    radiant_ra_deg = Column(Float, nullable=True,
                           comment="Right ascension of radiant in degrees (J2000)")
    radiant_dec_deg = Column(Float, nullable=True,
                            comment="Declination of radiant in degrees (J2000)")
    
    # Activity metrics
    zhr_max = Column(Integer, nullable=True,
                    comment="Maximum Zenithal Hourly Rate")
    velocity_km_s = Column(Float, nullable=True,
                          comment="Entry velocity in km/s")
    
    # Parent body
    parent_body = Column(String(100), nullable=True,
                        comment="Associated comet or asteroid")
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Constraints
    __table_args__ = (
        CheckConstraint('peak_month >= 1 AND peak_month <= 12',
                       name='ck_meteor_month_range'),
        CheckConstraint('peak_day_start >= 1 AND peak_day_start <= 31',
                       name='ck_meteor_day_start_range'),
        CheckConstraint('peak_day_end >= 1 AND peak_day_end <= 31',
                       name='ck_meteor_day_end_range'),
        CheckConstraint('radiant_ra_deg IS NULL OR (radiant_ra_deg >= 0 AND radiant_ra_deg < 360)',
                       name='ck_meteor_ra_range'),
        CheckConstraint('radiant_dec_deg IS NULL OR (radiant_dec_deg >= -90 AND radiant_dec_deg <= 90)',
                       name='ck_meteor_dec_range'),
        Index('idx_meteor_shower_name', 'shower_name'),
        Index('idx_meteor_peak_month', 'peak_month'),
    )
    
    def __repr__(self):
        return f"<MeteorShowers(name={self.shower_name}, peak={self.peak_month}/{self.peak_day_start}-{self.peak_day_end})>"


class VolcanicActivity(Base):
    """
    Volcanic eruption records.
    
    Tracks volcanic eruptions and activity with geographic locations
    using PostGIS and Volcanic Explosivity Index (VEI).
    """
    __tablename__ = "volcanic_activity"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Volcano identification
    volcano_name = Column(String(255), nullable=False, index=True,
                         comment="Name of the volcano")
    country = Column(String(100), nullable=True,
                    comment="Country or region")
    
    # Temporal data
    eruption_start = Column(DateTime, nullable=False, index=True,
                           comment="Start time of eruption")
    eruption_end = Column(DateTime, nullable=True,
                         comment="End time of eruption (null if ongoing)")
    
    # Location - PostGIS geography point (lat/lon)
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable=False,
                     comment="Geographic location (WGS84)")
    
    # Eruption characteristics
    vei = Column(Integer, nullable=True, index=True,
                comment="Volcanic Explosivity Index (0-8)")
    eruption_type = Column(String(50), nullable=True,
                          comment="Type: explosive, effusive, phreatic, etc.")
    
    # Additional details
    plume_height_km = Column(Float, nullable=True,
                            comment="Maximum plume height in kilometers")
    notes = Column(Text, nullable=True,
                  comment="Additional eruption details")
    
    # Metadata
    data_source = Column(String(100), nullable=True,
                        comment="Source: Smithsonian GVP, VAAC, etc.")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Constraints and Indexes
    __table_args__ = (
        CheckConstraint('vei IS NULL OR (vei >= 0 AND vei <= 8)',
                       name='ck_volcanic_vei_range'),
        CheckConstraint('plume_height_km IS NULL OR plume_height_km >= 0',
                       name='ck_volcanic_plume_nonnegative'),
        Index('idx_volcanic_name', 'volcano_name'),
        Index('idx_volcanic_start', 'eruption_start'),
        Index('idx_volcanic_vei', 'vei'),
        Index('idx_volcanic_location', 'location', postgresql_using='gist'),
    )
    
    def __repr__(self):
        return f"<VolcanicActivity(volcano={self.volcano_name}, start={self.eruption_start}, VEI={self.vei})>"
