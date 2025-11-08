"""
Correlation analysis models for detecting patterns between events.

This module contains models for User Story 5:
- CorrelationRules: Define relationships between event types to watch for
- EventCorrelations: Detected correlations between actual events
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP, Float, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class CorrelationRules(Base):
    """
    Configurable rules for detecting correlations between event types.
    
    Defines patterns to watch for, such as:
    - X-class solar flare → M7.5+ earthquake within 72 hours
    - Asteroid close approach → Increased seismic activity within 7 days
    - Lunar eclipse during blood moon tetrad → Geopolitical events
    
    Each rule specifies the primary event type, secondary event type, and time window
    to watch for correlations.
    """
    __tablename__ = "correlation_rules"
    
    # Primary key - SERIAL for reference data
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Rule identification
    rule_name = Column(
        String(255),
        nullable=False,
        unique=True,
        comment="Unique name for this correlation rule"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="Detailed description of what this rule detects"
    )
    
    # Primary event (trigger)
    primary_event_type = Column(
        String(100),
        nullable=False,
        comment="Type of event that triggers correlation check: SOLAR_FLARE, EARTHQUAKE, NEO_APPROACH, etc."
    )
    
    primary_threshold = Column(
        JSONB,
        nullable=False,
        comment="JSONB conditions for primary event (e.g., {\"class\": \"X\", \"magnitude\": \">5.0\"})"
    )
    
    # Secondary event (consequent)
    secondary_event_type = Column(
        String(100),
        nullable=False,
        comment="Type of event to look for after primary: EARTHQUAKE, VOLCANIC, METEOR, etc."
    )
    
    secondary_threshold = Column(
        JSONB,
        nullable=False,
        comment="JSONB conditions for secondary event (e.g., {\"magnitude\": \">=7.5\"})"
    )
    
    # Time window
    time_window_days = Column(
        Integer,
        nullable=False,
        comment="Number of days to watch for secondary event after primary (1-365)"
    )
    
    # Confidence and control
    minimum_confidence = Column(
        Float,
        nullable=False,
        default=0.5,
        comment="Minimum confidence score (0.0-1.0) required to flag correlation"
    )
    
    priority = Column(
        Integer,
        nullable=False,
        default=3,
        comment="Priority level 1-5 (1=highest)"
    )
    
    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether this rule is currently active"
    )
    
    # Metadata
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When this rule was created"
    )
    
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment="When this rule was last updated"
    )
    
    # Relationships
    event_correlations = relationship("EventCorrelations", back_populates="rule")
    
    # Table-level constraints and indexes
    __table_args__ = (
        Index('idx_correlation_rule_primary_type', 'primary_event_type'),
        Index('idx_correlation_rule_secondary_type', 'secondary_event_type'),
        Index('idx_correlation_rule_active', 'is_active'),
        Index('idx_correlation_rule_priority', 'priority'),
        CheckConstraint('priority >= 1 AND priority <= 5', name='ck_corr_rule_priority'),
        CheckConstraint('time_window_days >= 1 AND time_window_days <= 365', name='ck_time_window'),
        CheckConstraint('minimum_confidence >= 0.0 AND minimum_confidence <= 1.0', name='ck_min_confidence'),
        CheckConstraint(
            "primary_event_type IN ('SOLAR_FLARE', 'CME', 'GEOMAGNETIC_STORM', 'EARTHQUAKE', "
            "'VOLCANIC', 'METEOR', 'NEO_APPROACH', 'IMPACT_RISK', 'LUNAR_ECLIPSE', 'SOLAR_ECLIPSE', "
            "'COMET_PERIHELION', 'OTHER')",
            name='ck_primary_event_type'
        ),
        CheckConstraint(
            "secondary_event_type IN ('SOLAR_FLARE', 'CME', 'GEOMAGNETIC_STORM', 'EARTHQUAKE', "
            "'VOLCANIC', 'METEOR', 'NEO_APPROACH', 'IMPACT_RISK', 'LUNAR_ECLIPSE', 'SOLAR_ECLIPSE', "
            "'COMET_PERIHELION', 'OTHER')",
            name='ck_secondary_event_type'
        ),
        {'comment': 'Rules for detecting correlations between different event types'}
    )
    
    def __repr__(self):
        return f"<CorrelationRules(id={self.id}, name='{self.rule_name}', active={self.is_active})>"


class EventCorrelations(Base):
    """
    Detected correlations between actual events.
    
    Records when a secondary event occurs within the time window after a primary event,
    along with the confidence score and timing details. This provides the data foundation
    for analyzing patterns like:
    - Solar activity preceding earthquakes
    - Asteroid approaches correlating with volcanic activity
    - Lunar cycles and geophysical events
    """
    __tablename__ = "event_correlations"
    
    # Primary key - UUID for event data
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Unique identifier for this correlation detection"
    )
    
    # Link to correlation rule
    rule_id = Column(
        Integer,
        ForeignKey('correlation_rules.id', ondelete='SET NULL'),
        nullable=True,
        comment="Reference to the correlation rule that detected this (NULL if rule deleted)"
    )
    
    # Primary event details
    primary_event_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        comment="UUID of the primary/trigger event"
    )
    
    primary_event_type = Column(
        String(100),
        nullable=False,
        comment="Type of primary event"
    )
    
    primary_event_time = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        comment="When the primary event occurred"
    )
    
    primary_event_data = Column(
        JSONB,
        nullable=True,
        comment="JSONB snapshot of primary event details"
    )
    
    # Secondary event details
    secondary_event_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        comment="UUID of the secondary/consequent event"
    )
    
    secondary_event_type = Column(
        String(100),
        nullable=False,
        comment="Type of secondary event"
    )
    
    secondary_event_time = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        comment="When the secondary event occurred"
    )
    
    secondary_event_data = Column(
        JSONB,
        nullable=True,
        comment="JSONB snapshot of secondary event details"
    )
    
    # Correlation analysis
    time_delta_hours = Column(
        Float,
        nullable=False,
        comment="Hours between primary and secondary events"
    )
    
    confidence_score = Column(
        Float,
        nullable=False,
        comment="Confidence score 0.0-1.0 for this correlation"
    )
    
    spatial_distance_km = Column(
        Float,
        nullable=True,
        comment="Distance in kilometers between events (if both have geographic coordinates)"
    )
    
    # Analysis metadata
    detected_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When this correlation was detected"
    )
    
    notes = Column(
        Text,
        nullable=True,
        comment="Additional notes or context about this correlation"
    )
    
    # Relationships
    rule = relationship("CorrelationRules", back_populates="event_correlations")
    
    # Table-level constraints and indexes
    __table_args__ = (
        Index('idx_correlation_rule_id', 'rule_id'),
        Index('idx_correlation_primary_event', 'primary_event_id'),
        Index('idx_correlation_secondary_event', 'secondary_event_id'),
        Index('idx_correlation_primary_type', 'primary_event_type'),
        Index('idx_correlation_secondary_type', 'secondary_event_type'),
        Index('idx_correlation_detected_at', 'detected_at'),
        Index('idx_correlation_confidence', 'confidence_score'),
        Index('idx_correlation_time_delta', 'time_delta_hours'),
        CheckConstraint('confidence_score >= 0.0 AND confidence_score <= 1.0', name='ck_confidence'),
        CheckConstraint('time_delta_hours >= 0.0', name='ck_time_delta'),
        CheckConstraint('spatial_distance_km >= 0.0 OR spatial_distance_km IS NULL', name='ck_spatial_distance'),
        {'comment': 'Detected correlations between events with timing and confidence details'}
    )
    
    def __repr__(self):
        return f"<EventCorrelations(id={self.id}, {self.primary_event_type} → {self.secondary_event_type}, confidence={self.confidence_score:.2f})>"
