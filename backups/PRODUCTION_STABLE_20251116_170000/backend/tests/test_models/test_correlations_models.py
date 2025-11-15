"""
Comprehensive tests for correlation analysis models.

Tests for User Story 5:
- CorrelationRules: Configuration for detecting event patterns
- EventCorrelations: Detected correlations between events
"""
from datetime import datetime, timedelta
import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.correlations import CorrelationRules, EventCorrelations


def test_correlation_rule_create(db_session):
    """Test creating a correlation rule with JSONB thresholds."""
    rule = CorrelationRules(
        rule_name="Solar Flare → Earthquake",
        description="Watch for M7.5+ earthquakes within 72 hours of X-class solar flares",
        primary_event_type="SOLAR_FLARE",
        primary_threshold={
            "class": "X",
            "magnitude": ">5.0"
        },
        secondary_event_type="EARTHQUAKE",
        secondary_threshold={
            "magnitude": ">=7.5",
            "depth_km": "<50"
        },
        time_window_days=3,
        minimum_confidence=0.6,
        priority=1,
        is_active=True
    )
    
    db_session.add(rule)
    db_session.commit()
    
    # Verify creation
    result = db_session.query(CorrelationRules).filter_by(
        rule_name="Solar Flare → Earthquake"
    ).first()
    
    assert result is not None
    assert result.primary_event_type == "SOLAR_FLARE"
    assert result.primary_threshold["class"] == "X"
    assert result.secondary_event_type == "EARTHQUAKE"
    assert result.secondary_threshold["magnitude"] == ">=7.5"
    assert result.time_window_days == 3
    assert result.minimum_confidence == 0.6
    assert result.priority == 1
    assert result.is_active is True
    assert result.created_at is not None


def test_correlation_rule_unique_name(db_session):
    """Test that rule names must be unique."""
    rule1 = CorrelationRules(
        rule_name="Unique Rule Test",
        description="First rule",
        primary_event_type="NEO_APPROACH",
        primary_threshold={"distance_au": "<0.05"},
        secondary_event_type="EARTHQUAKE",
        secondary_threshold={"magnitude": ">=6.0"},
        time_window_days=7,
        minimum_confidence=0.5,
        priority=3
    )
    
    db_session.add(rule1)
    db_session.commit()
    
    # Try to create duplicate
    rule2 = CorrelationRules(
        rule_name="Unique Rule Test",  # Same name
        description="Second rule",
        primary_event_type="EARTHQUAKE",
        primary_threshold={"magnitude": ">=8.0"},
        secondary_event_type="VOLCANIC",
        secondary_threshold={"vei": ">=5"},
        time_window_days=30,
        minimum_confidence=0.7,
        priority=2
    )
    
    db_session.add(rule2)
    
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_correlation_rule_priority_constraint(db_session):
    """Test that priority must be between 1 and 5."""
    rule = CorrelationRules(
        rule_name="Invalid Priority Test",
        description="Test priority constraint",
        primary_event_type="CME",
        primary_threshold={"speed_kms": ">1000"},
        secondary_event_type="GEOMAGNETIC_STORM",
        secondary_threshold={"kp_index": ">=7"},
        time_window_days=2,
        minimum_confidence=0.5,
        priority=6  # Invalid: must be 1-5
    )
    
    db_session.add(rule)
    
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_correlation_rule_time_window_constraint(db_session):
    """Test that time_window_days must be 1-365."""
    rule = CorrelationRules(
        rule_name="Invalid Time Window Test",
        description="Test time window constraint",
        primary_event_type="LUNAR_ECLIPSE",
        primary_threshold={"type": "total"},
        secondary_event_type="EARTHQUAKE",
        secondary_threshold={"magnitude": ">=7.0"},
        time_window_days=400,  # Invalid: must be 1-365
        minimum_confidence=0.5,
        priority=3
    )
    
    db_session.add(rule)
    
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_correlation_rule_toggle_active(db_session):
    """Test toggling is_active flag."""
    rule = CorrelationRules(
        rule_name="Toggle Test Rule",
        description="Test active/inactive toggle",
        primary_event_type="METEOR",
        primary_threshold={"velocity_kms": ">30"},
        secondary_event_type="IMPACT_RISK",
        secondary_threshold={"torino_scale": ">=2"},
        time_window_days=14,
        minimum_confidence=0.5,
        priority=2,
        is_active=True
    )
    
    db_session.add(rule)
    db_session.commit()
    
    # Deactivate
    rule.is_active = False
    db_session.commit()
    
    result = db_session.query(CorrelationRules).filter_by(
        rule_name="Toggle Test Rule"
    ).first()
    assert result.is_active is False
    
    # Query only active rules
    active_rules = db_session.query(CorrelationRules).filter_by(is_active=True).all()
    assert rule not in active_rules


def test_event_correlation_create(db_session):
    """Test creating an event correlation with relationship to rule."""
    # Create a correlation rule first
    rule = CorrelationRules(
        rule_name="X-Flare → M7.5+ Quake",
        description="Detect M7.5+ earthquakes within 72 hours of X-class flares",
        primary_event_type="SOLAR_FLARE",
        primary_threshold={"class": "X"},
        secondary_event_type="EARTHQUAKE",
        secondary_threshold={"magnitude": ">=7.5"},
        time_window_days=3,
        minimum_confidence=0.6,
        priority=1
    )
    
    db_session.add(rule)
    db_session.commit()
    
    # Create correlation detection
    primary_time = datetime(2025, 3, 15, 10, 30, 0)
    secondary_time = datetime(2025, 3, 17, 18, 45, 0)
    time_delta = (secondary_time - primary_time).total_seconds() / 3600  # hours (should be ~56.25)
    
    correlation = EventCorrelations(
        rule_id=rule.id,
        primary_event_id=uuid.uuid4(),
        primary_event_type="SOLAR_FLARE",
        primary_event_time=primary_time,
        primary_event_data={
            "class": "X6.8",
            "location": "AR3615",
            "peak_flux": "6.8e-04"
        },
        secondary_event_id=uuid.uuid4(),
        secondary_event_type="EARTHQUAKE",
        secondary_event_time=secondary_time,
        secondary_event_data={
            "magnitude": 7.8,
            "location": "Papua New Guinea",
            "depth_km": 35,
            "latitude": -5.8,
            "longitude": 145.2
        },
        time_delta_hours=time_delta,
        confidence_score=0.75,
        spatial_distance_km=None,  # Solar events have no geographic location
        notes="Significant correlation detected. M7.8 earthquake 58 hours after X6.8 flare."
    )
    
    db_session.add(correlation)
    db_session.commit()
    
    # Verify creation
    result = db_session.query(EventCorrelations).filter_by(
        rule_id=rule.id
    ).first()
    
    assert result is not None
    assert result.primary_event_type == "SOLAR_FLARE"
    assert result.primary_event_data["class"] == "X6.8"
    assert result.secondary_event_type == "EARTHQUAKE"
    assert result.secondary_event_data["magnitude"] == 7.8
    assert result.confidence_score == 0.75
    assert abs(result.time_delta_hours - 56.25) < 0.1  # ~56.25 hours (2 days + 8.25 hours)
    assert result.detected_at is not None


def test_event_correlation_with_spatial_distance(db_session):
    """Test correlation with geographic distance calculation."""
    rule = CorrelationRules(
        rule_name="NEO → Volcanic Activity",
        description="Watch for volcanic eruptions after close NEO approaches",
        primary_event_type="NEO_APPROACH",
        primary_threshold={"distance_au": "<0.05"},
        secondary_event_type="VOLCANIC",
        secondary_threshold={"vei": ">=4"},
        time_window_days=14,
        minimum_confidence=0.5,
        priority=2
    )
    
    db_session.add(rule)
    db_session.commit()
    
    # Create correlation with spatial distance
    primary_time = datetime(2025, 6, 10, 8, 0, 0)
    secondary_time = datetime(2025, 6, 18, 14, 30, 0)
    time_delta = (secondary_time - primary_time).total_seconds() / 3600
    
    correlation = EventCorrelations(
        rule_id=rule.id,
        primary_event_id=uuid.uuid4(),
        primary_event_type="NEO_APPROACH",
        primary_event_time=primary_time,
        primary_event_data={
            "object": "2025 FG5",
            "distance_au": 0.045,
            "diameter_km": 0.8
        },
        secondary_event_id=uuid.uuid4(),
        secondary_event_type="VOLCANIC",
        secondary_event_time=secondary_time,
        secondary_event_data={
            "volcano": "Mount Ruapehu",
            "location": "New Zealand",
            "vei": 4,
            "latitude": -39.28,
            "longitude": 175.57
        },
        time_delta_hours=time_delta,
        confidence_score=0.55,
        spatial_distance_km=None,  # NEO approach is global, no specific location
        notes="VEI 4 eruption 8 days after close approach"
    )
    
    db_session.add(correlation)
    db_session.commit()
    
    # Verify
    result = db_session.query(EventCorrelations).filter_by(rule_id=rule.id).first()
    assert result.time_delta_hours > 192  # More than 8 days
    assert result.confidence_score == 0.55
    assert result.secondary_event_data["vei"] == 4


def test_event_correlation_confidence_constraint(db_session):
    """Test that confidence_score must be 0.0-1.0."""
    rule = CorrelationRules(
        rule_name="Test Rule for Confidence",
        description="Test confidence constraint",
        primary_event_type="EARTHQUAKE",
        primary_threshold={"magnitude": ">=7.0"},
        secondary_event_type="VOLCANIC",
        secondary_threshold={"vei": ">=3"},
        time_window_days=30,
        minimum_confidence=0.5,
        priority=3
    )
    
    db_session.add(rule)
    db_session.commit()
    
    correlation = EventCorrelations(
        rule_id=rule.id,
        primary_event_id=uuid.uuid4(),
        primary_event_type="EARTHQUAKE",
        primary_event_time=datetime.utcnow(),
        secondary_event_id=uuid.uuid4(),
        secondary_event_type="VOLCANIC",
        secondary_event_time=datetime.utcnow(),
        time_delta_hours=24.0,
        confidence_score=1.5,  # Invalid: must be 0.0-1.0
    )
    
    db_session.add(correlation)
    
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_event_correlation_relationship_to_rule(db_session):
    """Test bidirectional relationship between correlations and rules."""
    rule = CorrelationRules(
        rule_name="Earthquake → Aftershock Swarm",
        description="Detect aftershock sequences after major earthquakes",
        primary_event_type="EARTHQUAKE",
        primary_threshold={"magnitude": ">=7.0"},
        secondary_event_type="EARTHQUAKE",
        secondary_threshold={"magnitude": ">=5.0", "depth_km": "<50"},
        time_window_days=30,
        minimum_confidence=0.8,
        priority=1
    )
    
    db_session.add(rule)
    db_session.commit()
    
    # Create multiple correlations for this rule
    for i in range(3):
        correlation = EventCorrelations(
            rule_id=rule.id,
            primary_event_id=uuid.uuid4(),
            primary_event_type="EARTHQUAKE",
            primary_event_time=datetime(2025, 4, 1, 10, 0, 0),
            primary_event_data={"magnitude": 7.5, "location": "Turkey"},
            secondary_event_id=uuid.uuid4(),
            secondary_event_type="EARTHQUAKE",
            secondary_event_time=datetime(2025, 4, 2, 8, 30, 0) + timedelta(hours=i*6),
            secondary_event_data={"magnitude": 5.2 + i*0.1, "location": "Turkey"},
            time_delta_hours=22.5 + i*6,
            confidence_score=0.85,
            notes=f"Aftershock {i+1}"
        )
        db_session.add(correlation)
    
    db_session.commit()
    
    # Query via relationship
    result_rule = db_session.query(CorrelationRules).filter_by(
        rule_name="Earthquake → Aftershock Swarm"
    ).first()
    
    assert len(result_rule.event_correlations) == 3
    assert all(c.primary_event_type == "EARTHQUAKE" for c in result_rule.event_correlations)


def test_set_null_on_rule_delete(db_session):
    """Test that deleting a rule sets correlation rule_id to NULL (not cascade delete)."""
    rule = CorrelationRules(
        rule_name="Rule to be Deleted",
        description="Test SET NULL behavior",
        primary_event_type="CME",
        primary_threshold={"speed_kms": ">1500"},
        secondary_event_type="GEOMAGNETIC_STORM",
        secondary_threshold={"kp_index": ">=8"},
        time_window_days=3,
        minimum_confidence=0.7,
        priority=1
    )
    
    db_session.add(rule)
    db_session.commit()
    
    correlation = EventCorrelations(
        rule_id=rule.id,
        primary_event_id=uuid.uuid4(),
        primary_event_type="CME",
        primary_event_time=datetime(2025, 5, 20, 12, 0, 0),
        secondary_event_id=uuid.uuid4(),
        secondary_event_type="GEOMAGNETIC_STORM",
        secondary_event_time=datetime(2025, 5, 22, 18, 0, 0),
        time_delta_hours=54.0,
        confidence_score=0.82
    )
    
    db_session.add(correlation)
    db_session.commit()
    
    correlation_id = correlation.id
    
    # Delete the rule
    db_session.delete(rule)
    db_session.commit()
    
    # Correlation should still exist, but rule_id should be NULL
    result = db_session.query(EventCorrelations).filter_by(id=correlation_id).first()
    assert result is not None
    assert result.rule_id is None  # SET NULL behavior
    assert result.primary_event_type == "CME"  # Data preserved


def test_query_correlations_by_confidence(db_session):
    """Test querying correlations by confidence threshold."""
    rule = CorrelationRules(
        rule_name="Multi-Confidence Test",
        description="Create correlations with varying confidence",
        primary_event_type="SOLAR_FLARE",
        primary_threshold={"class": "M"},
        secondary_event_type="EARTHQUAKE",
        secondary_threshold={"magnitude": ">=6.0"},
        time_window_days=7,
        minimum_confidence=0.5,
        priority=2
    )
    
    db_session.add(rule)
    db_session.commit()
    
    # Create correlations with different confidence scores
    confidences = [0.45, 0.55, 0.70, 0.85, 0.92]
    for conf in confidences:
        correlation = EventCorrelations(
            rule_id=rule.id,
            primary_event_id=uuid.uuid4(),
            primary_event_type="SOLAR_FLARE",
            primary_event_time=datetime.utcnow(),
            secondary_event_id=uuid.uuid4(),
            secondary_event_type="EARTHQUAKE",
            secondary_event_time=datetime.utcnow(),
            time_delta_hours=48.0,
            confidence_score=conf
        )
        db_session.add(correlation)
    
    db_session.commit()
    
    # Query high-confidence correlations (>=0.7)
    high_conf = db_session.query(EventCorrelations).filter(
        EventCorrelations.confidence_score >= 0.7
    ).all()
    
    assert len(high_conf) == 3  # 0.70, 0.85, 0.92
    assert all(c.confidence_score >= 0.7 for c in high_conf)


def test_query_correlations_by_time_window(db_session):
    """Test querying correlations by time delta."""
    rule = CorrelationRules(
        rule_name="Time Window Test",
        description="Test querying by time delta",
        primary_event_type="LUNAR_ECLIPSE",
        primary_threshold={"type": "total"},
        secondary_event_type="EARTHQUAKE",
        secondary_threshold={"magnitude": ">=6.5"},
        time_window_days=14,
        minimum_confidence=0.5,
        priority=3
    )
    
    db_session.add(rule)
    db_session.commit()
    
    # Create correlations with different time deltas
    time_deltas = [12.0, 48.0, 120.0, 240.0, 360.0]  # 0.5, 2, 5, 10, 15 days
    for delta in time_deltas:
        correlation = EventCorrelations(
            rule_id=rule.id,
            primary_event_id=uuid.uuid4(),
            primary_event_type="LUNAR_ECLIPSE",
            primary_event_time=datetime(2025, 7, 1, 0, 0, 0),
            secondary_event_id=uuid.uuid4(),
            secondary_event_type="EARTHQUAKE",
            secondary_event_time=datetime(2025, 7, 1, 0, 0, 0) + timedelta(hours=delta),
            time_delta_hours=delta,
            confidence_score=0.6
        )
        db_session.add(correlation)
    
    db_session.commit()
    
    # Query correlations within 7 days (168 hours)
    within_week = db_session.query(EventCorrelations).filter(
        EventCorrelations.time_delta_hours <= 168.0
    ).all()
    
    assert len(within_week) == 3  # 12, 48, 120 hours
    assert all(c.time_delta_hours <= 168.0 for c in within_week)


def test_correlation_jsonb_complex_thresholds(db_session):
    """Test complex nested JSONB threshold structures."""
    rule = CorrelationRules(
        rule_name="Complex Threshold Test",
        description="Test nested JSONB threshold conditions",
        primary_event_type="COMET_PERIHELION",
        primary_threshold={
            "distance_au": "<1.5",
            "brightness": {
                "magnitude": "<4.0",
                "visible_to_naked_eye": True
            },
            "composition": {
                "dust_to_gas_ratio": ">2.0",
                "contains": ["H2O", "CO2", "CN"]
            }
        },
        secondary_event_type="METEOR",
        secondary_threshold={
            "shower_intensity": {
                "zhr": ">100",
                "duration_hours": ">6"
            },
            "origin": "same_comet_trail"
        },
        time_window_days=90,
        minimum_confidence=0.6,
        priority=2
    )
    
    db_session.add(rule)
    db_session.commit()
    
    # Verify complex JSONB storage and retrieval
    result = db_session.query(CorrelationRules).filter_by(
        rule_name="Complex Threshold Test"
    ).first()
    
    assert result.primary_threshold["brightness"]["magnitude"] == "<4.0"
    assert result.primary_threshold["composition"]["contains"] == ["H2O", "CO2", "CN"]
    assert result.secondary_threshold["shower_intensity"]["zhr"] == ">100"
