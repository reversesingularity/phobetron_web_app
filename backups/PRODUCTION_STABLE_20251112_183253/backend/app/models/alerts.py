"""
Alert system models for trigger configuration and alert generation.

This module contains models for User Stories 3 & 4:
- DataTriggers (US3): Configurable Prophetic Data Signature (PDS) rules
- Alerts (US4): Generated alerts with lifecycle tracking
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, TIMESTAMP, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class DataTriggers(Base):
    """
    Configurable alert trigger rules (Prophetic Data Signatures).
    
    Defines conditions that generate alerts when astronomical or geophysical events
    match specific criteria. Each trigger is linked to a celestial sign and contains
    query parameters to evaluate against incoming data.
    
    Examples:
    - Wormwood trigger: object_name CONTAINS 'wormwood' OR torino_scale_max > 0
    - Great Earthquake trigger: magnitude >= 8.0
    - Blood Moon trigger: lunar_eclipse = TRUE AND tetrads = TRUE
    """
    __tablename__ = "data_triggers"
    
    # Primary key - SERIAL for reference data
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Link to celestial sign
    sign_id = Column(
        Integer,
        ForeignKey('celestial_signs.id', ondelete='CASCADE'),
        nullable=False,
        comment="Reference to celestial_signs table"
    )
    
    # Trigger identification
    trigger_name = Column(
        String(255),
        nullable=False,
        comment="Descriptive name of the trigger (e.g., 'Wormwood - High Impact Risk')"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="Detailed description of what this trigger watches for"
    )
    
    # Query parameters - basic condition
    data_source_api = Column(
        String(100),
        nullable=False,
        comment="API/table to query: JPL_HORIZONS, JPL_SENTRY, USGS_EARTHQUAKE, NOAA_SWPC, etc."
    )
    
    query_parameter = Column(
        String(100),
        nullable=False,
        comment="Field to check (e.g., 'torino_scale_max', 'magnitude', 'object_name')"
    )
    
    query_operator = Column(
        String(20),
        nullable=False,
        comment="Comparison operator: =, !=, >, <, >=, <=, CONTAINS, IN, BETWEEN"
    )
    
    query_value = Column(
        String(255),
        nullable=False,
        comment="Value to compare against (e.g., '0', '8.0', 'wormwood')"
    )
    
    # Advanced conditions as JSONB
    additional_conditions = Column(
        JSONB,
        nullable=True,
        comment="Complex nested conditions as JSON (e.g., {'secondary_check': 'palermo_scale > -2', 'logic': 'AND'})"
    )
    
    # Priority and activation
    priority = Column(
        Integer,
        nullable=False,
        default=3,
        comment="Priority level: 1=High, 2=Medium-High, 3=Medium, 4=Medium-Low, 5=Low"
    )
    
    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether this trigger is currently active and monitoring"
    )
    
    # Timestamps
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When this trigger was created"
    )
    
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        onupdate=datetime.utcnow,
        comment="When this trigger was last modified"
    )
    
    # Relationships
    celestial_sign = relationship("CelestialSigns", back_populates="data_triggers", passive_deletes=True)
    alerts = relationship("Alerts", back_populates="trigger")
    
    # Table-level constraints and indexes
    __table_args__ = (
        Index('idx_trigger_sign', 'sign_id'),
        Index('idx_trigger_active', 'is_active'),
        Index('idx_trigger_priority', 'priority'),
        CheckConstraint('priority >= 1 AND priority <= 5', name='ck_trigger_priority'),
        CheckConstraint(
            "data_source_api IN ('JPL_HORIZONS', 'JPL_SENTRY', 'JPL_CNEOS', "
            "'USGS_EARTHQUAKE', 'NOAA_SWPC', 'SMITHSONIAN_VOLCANO', "
            "'GLOBAL_METEOR_NETWORK', 'IMO_METEOR', 'NASA_NEO', 'OTHER')",
            name='ck_data_source_api'
        ),
        CheckConstraint(
            "query_operator IN ('=', '!=', '>', '<', '>=', '<=', 'CONTAINS', "
            "'NOT_CONTAINS', 'IN', 'NOT_IN', 'BETWEEN', 'LIKE', 'ILIKE')",
            name='ck_query_operator'
        ),
        {'comment': 'Configurable alert trigger rules (Prophetic Data Signatures)'}
    )
    
    def __repr__(self):
        return f"<DataTriggers(id={self.id}, name='{self.trigger_name}', active={self.is_active})>"


class Alerts(Base):
    """
    Generated alerts when trigger conditions are met.
    
    Stores alerts with severity levels and lifecycle tracking (ACTIVE → ACKNOWLEDGED → RESOLVED).
    Each alert includes the complete trigger data as JSONB for audit trail and can link
    to the specific event that triggered it.
    
    Lifecycle:
    1. ACTIVE - Alert just triggered, needs attention
    2. ACKNOWLEDGED - User has seen the alert and is investigating
    3. RESOLVED - Issue addressed or determined to be non-actionable
    """
    __tablename__ = "alerts"
    
    # Primary key - UUID for large-scale alert generation
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Link to trigger (nullable - manual alerts may not have triggers)
    trigger_id = Column(
        Integer,
        ForeignKey('data_triggers.id', ondelete='SET NULL'),
        nullable=True,
        comment="Reference to data_triggers table (NULL for manual alerts)"
    )
    
    # Alert identification
    alert_type = Column(
        String(100),
        nullable=False,
        comment="Type: IMPACT_RISK, CLOSE_APPROACH, EARTHQUAKE, SOLAR_FLARE, VOLCANIC_ERUPTION, etc."
    )
    
    title = Column(
        String(255),
        nullable=False,
        comment="Brief alert title (e.g., 'Apophis High Impact Risk Alert')"
    )
    
    description = Column(
        Text,
        nullable=False,
        comment="Detailed description of the alert and why it was triggered"
    )
    
    # Related event information
    related_object_name = Column(
        String(255),
        nullable=True,
        comment="Name of celestial object or location (e.g., 'Apophis', 'San Francisco')"
    )
    
    related_event_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        comment="UUID of the source event record (ephemeris_data.id, earthquakes.id, etc.)"
    )
    
    # Severity and status
    severity = Column(
        String(20),
        nullable=False,
        comment="Severity level: LOW, MEDIUM, HIGH, CRITICAL"
    )
    
    status = Column(
        String(20),
        nullable=False,
        default='ACTIVE',
        comment="Alert status: ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED"
    )
    
    # Lifecycle timestamps
    triggered_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When the alert was first triggered"
    )
    
    acknowledged_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        comment="When the alert was acknowledged by a user"
    )
    
    resolved_at = Column(
        TIMESTAMP(timezone=True),
        nullable=True,
        comment="When the alert was resolved or dismissed"
    )
    
    # Audit trail
    trigger_data = Column(
        JSONB,
        nullable=True,
        comment="Complete snapshot of trigger conditions and event data that caused this alert"
    )
    
    resolution_notes = Column(
        Text,
        nullable=True,
        comment="Notes about how the alert was resolved or why it was dismissed"
    )
    
    # User tracking (for future use)
    acknowledged_by = Column(
        String(100),
        nullable=True,
        comment="User who acknowledged the alert"
    )
    
    resolved_by = Column(
        String(100),
        nullable=True,
        comment="User who resolved the alert"
    )
    
    # Relationships
    trigger = relationship("DataTriggers", back_populates="alerts")
    
    # Table-level constraints and indexes
    __table_args__ = (
        Index('idx_alert_status', 'status'),
        Index('idx_alert_severity', 'severity'),
        Index('idx_alert_triggered', 'triggered_at'),
        Index('idx_alert_type', 'alert_type'),
        Index('idx_alert_object', 'related_object_name'),
        CheckConstraint(
            "severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')",
            name='ck_alert_severity'
        ),
        CheckConstraint(
            "status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')",
            name='ck_alert_status'
        ),
        CheckConstraint(
            "alert_type IN ('IMPACT_RISK', 'CLOSE_APPROACH', 'EARTHQUAKE', "
            "'SOLAR_FLARE', 'GEOMAGNETIC_STORM', 'VOLCANIC_ERUPTION', 'METEOR_SHOWER', "
            "'COMET_PERIHELION', 'INTERSTELLAR_OBJECT', 'PROPHETIC_SIGN', 'OTHER')",
            name='ck_alert_type'
        ),
        {'comment': 'Generated alerts with severity levels and lifecycle tracking'}
    )
    
    def __repr__(self):
        return f"<Alerts(id={self.id}, type='{self.alert_type}', severity='{self.severity}', status='{self.status}')>"
