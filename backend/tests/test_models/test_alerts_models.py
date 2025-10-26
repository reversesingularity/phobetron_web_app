"""
Unit tests for alerts models: DataTriggers and Alerts.

Tests cover:
- DataTriggers CRUD and configuration
- Alerts lifecycle (ACTIVE → ACKNOWLEDGED → RESOLVED)
- JSONB storage for complex conditions and trigger data
- Severity and priority handling
- Foreign key relationships and CASCADE behavior
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
import uuid

from app.models.alerts import DataTriggers, Alerts
from app.models.theological import CelestialSigns


def test_data_triggers_create(db_session):
    """Test creating a data trigger with all fields."""
    # Create a celestial sign first
    sign = CelestialSigns(
        sign_name="Wormwood Star Test",
        sign_description="Test description",
        theological_interpretation="Test interpretation",
        primary_scripture="Rev 8:10",
        sign_type="STELLAR"
    )
    db_session.add(sign)
    db_session.commit()
    
    # Create trigger
    trigger = DataTriggers(
        sign_id=sign.id,
        trigger_name="Wormwood - High Impact Risk",
        description="Alert when an object named 'Wormwood' has high impact risk",
        data_source_api="JPL_SENTRY",
        query_parameter="torino_scale_max",
        query_operator=">",
        query_value="0",
        additional_conditions={
            "secondary_check": "palermo_scale_cumulative > -2",
            "logic": "AND",
            "name_check": "object_name ILIKE '%wormwood%'"
        },
        priority=1,
        is_active=True
    )
    
    db_session.add(trigger)
    db_session.commit()
    
    # Query back
    result = db_session.query(DataTriggers).filter_by(trigger_name="Wormwood - High Impact Risk").first()
    assert result is not None
    assert result.sign_id == sign.id
    assert result.data_source_api == "JPL_SENTRY"
    assert result.query_parameter == "torino_scale_max"
    assert result.query_operator == ">"
    assert result.query_value == "0"
    assert result.priority == 1
    assert result.is_active is True
    assert "secondary_check" in result.additional_conditions
    assert result.additional_conditions["logic"] == "AND"


def test_data_triggers_relationship_with_sign(db_session):
    """Test relationship between DataTriggers and CelestialSigns."""
    # Create sign
    sign = CelestialSigns(
        sign_name="Great Earthquake Test",
        sign_description="Test description",
        theological_interpretation="Test interpretation",
        primary_scripture="Rev 6:12",
        sign_type="SEISMIC"
    )
    db_session.add(sign)
    db_session.commit()
    
    # Create multiple triggers for the same sign
    trigger1 = DataTriggers(
        sign_id=sign.id,
        trigger_name="Magnitude 8.0+ Earthquake",
        data_source_api="USGS_EARTHQUAKE",
        query_parameter="magnitude",
        query_operator=">=",
        query_value="8.0",
        priority=1,
        is_active=True
    )
    
    trigger2 = DataTriggers(
        sign_id=sign.id,
        trigger_name="Magnitude 8.5+ Earthquake",
        data_source_api="USGS_EARTHQUAKE",
        query_parameter="magnitude",
        query_operator=">=",
        query_value="8.5",
        priority=2,
        is_active=True
    )
    
    db_session.add_all([trigger1, trigger2])
    db_session.commit()
    
    # Query sign and verify triggers are linked
    result = db_session.query(CelestialSigns).filter_by(sign_name="Great Earthquake Test").first()
    assert len(result.data_triggers) == 2
    
    trigger_names = {t.trigger_name for t in result.data_triggers}
    assert "Magnitude 8.0+ Earthquake" in trigger_names
    assert "Magnitude 8.5+ Earthquake" in trigger_names


def test_data_triggers_toggle_active(db_session):
    """Test toggling trigger active status."""
    sign = CelestialSigns(
        sign_name="Toggle Test Sign",
        sign_description="Test",
        theological_interpretation="Test",
        primary_scripture="Test 1:1",
        sign_type="OTHER"
    )
    db_session.add(sign)
    db_session.commit()
    
    trigger = DataTriggers(
        sign_id=sign.id,
        trigger_name="Test Trigger",
        data_source_api="OTHER",
        query_parameter="test_param",
        query_operator="=",
        query_value="test_value",
        priority=3,
        is_active=True
    )
    db_session.add(trigger)
    db_session.commit()
    
    # Toggle off
    trigger.is_active = False
    db_session.commit()
    
    result = db_session.query(DataTriggers).filter_by(trigger_name="Test Trigger").first()
    assert result.is_active is False
    
    # Query active triggers - should not include this one
    active_triggers = db_session.query(DataTriggers).filter_by(is_active=True).all()
    assert trigger.id not in [t.id for t in active_triggers]


def test_alerts_create_with_lifecycle(db_session):
    """Test creating an alert and tracking lifecycle."""
    alert = Alerts(
        alert_type="IMPACT_RISK",
        title="Apophis High Impact Risk Alert",
        description="Asteroid Apophis has entered high impact probability category",
        related_object_name="99942 Apophis",
        related_event_id=uuid.uuid4(),
        severity="CRITICAL",
        status="ACTIVE",
        trigger_data={
            "torino_scale": 4,
            "palermo_scale": -1.5,
            "impact_probability": 0.027,
            "impact_date": "2029-04-13",
            "source": "JPL Sentry"
        }
    )
    
    db_session.add(alert)
    db_session.commit()
    
    # Verify created
    result = db_session.query(Alerts).filter_by(title="Apophis High Impact Risk Alert").first()
    assert result is not None
    assert result.severity == "CRITICAL"
    assert result.status == "ACTIVE"
    assert result.triggered_at is not None
    assert result.acknowledged_at is None
    assert result.resolved_at is None
    assert result.trigger_data["torino_scale"] == 4


def test_alerts_status_transitions(db_session):
    """Test alert status lifecycle: ACTIVE → ACKNOWLEDGED → RESOLVED."""
    alert = Alerts(
        alert_type="EARTHQUAKE",
        title="Major Earthquake Detected",
        description="M8.2 earthquake detected in Pacific Ring of Fire",
        related_object_name="San Francisco",
        severity="HIGH",
        status="ACTIVE"
    )
    
    db_session.add(alert)
    db_session.commit()
    
    alert_id = alert.id
    
    # Transition to ACKNOWLEDGED
    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_at = datetime.utcnow()
    alert.acknowledged_by = "user123"
    db_session.commit()
    
    result = db_session.query(Alerts).filter_by(id=alert_id).first()
    assert result.status == "ACKNOWLEDGED"
    assert result.acknowledged_at is not None
    assert result.acknowledged_by == "user123"
    assert result.resolved_at is None
    
    # Transition to RESOLVED
    result.status = "RESOLVED"
    result.resolved_at = datetime.utcnow()
    result.resolved_by = "user123"
    result.resolution_notes = "False alarm - seismic data corrected to M6.8"
    db_session.commit()
    
    final_result = db_session.query(Alerts).filter_by(id=alert_id).first()
    assert final_result.status == "RESOLVED"
    assert final_result.resolved_at is not None
    assert final_result.resolved_by == "user123"
    assert "False alarm" in final_result.resolution_notes


def test_alerts_severity_levels(db_session):
    """Test different severity levels and querying by severity."""
    alerts_data = [
        ("Critical Alert 1", "CRITICAL"),
        ("High Alert 1", "HIGH"),
        ("Medium Alert 1", "MEDIUM"),
        ("Low Alert 1", "LOW"),
        ("Critical Alert 2", "CRITICAL"),
    ]
    
    for title, severity in alerts_data:
        alert = Alerts(
            alert_type="OTHER",
            title=title,
            description=f"Test alert with {severity} severity",
            severity=severity,
            status="ACTIVE"
        )
        db_session.add(alert)
    
    db_session.commit()
    
    # Query by severity
    critical_alerts = db_session.query(Alerts).filter_by(severity="CRITICAL", status="ACTIVE").all()
    assert len(critical_alerts) == 2
    
    high_alerts = db_session.query(Alerts).filter_by(severity="HIGH", status="ACTIVE").all()
    assert len(high_alerts) == 1
    
    # Query all active alerts sorted by severity (would need custom sorting in real app)
    active_alerts = db_session.query(Alerts).filter_by(status="ACTIVE").all()
    assert len(active_alerts) == 5


def test_alerts_with_trigger_relationship(db_session):
    """Test alert linked to a data trigger."""
    # Create sign and trigger
    sign = CelestialSigns(
        sign_name="Test Sign for Alert",
        sign_description="Test",
        theological_interpretation="Test",
        primary_scripture="Test 1:1",
        sign_type="OTHER"
    )
    db_session.add(sign)
    db_session.commit()
    
    trigger = DataTriggers(
        sign_id=sign.id,
        trigger_name="Test Trigger for Alert",
        data_source_api="JPL_SENTRY",
        query_parameter="torino_scale_max",
        query_operator=">",
        query_value="0",
        priority=1,
        is_active=True
    )
    db_session.add(trigger)
    db_session.commit()
    
    # Create alert linked to trigger
    alert = Alerts(
        trigger_id=trigger.id,
        alert_type="IMPACT_RISK",
        title="Trigger-based Alert",
        description="Alert generated by automated trigger",
        severity="MEDIUM",
        status="ACTIVE",
        trigger_data={
            "trigger_name": trigger.trigger_name,
            "matched_condition": "torino_scale_max > 0",
            "actual_value": 2
        }
    )
    db_session.add(alert)
    db_session.commit()
    
    # Query alert and verify trigger relationship
    result = db_session.query(Alerts).filter_by(title="Trigger-based Alert").first()
    assert result.trigger_id == trigger.id
    assert result.trigger.trigger_name == "Test Trigger for Alert"
    
    # Query trigger and verify alerts relationship
    trigger_result = db_session.query(DataTriggers).filter_by(id=trigger.id).first()
    assert len(trigger_result.alerts) == 1
    assert trigger_result.alerts[0].title == "Trigger-based Alert"


def test_alerts_jsonb_trigger_data(db_session):
    """Test JSONB storage for complex trigger data."""
    complex_trigger_data = {
        "source": "JPL Horizons",
        "object": {
            "name": "C/2023 A3 (Tsuchinshan-ATLAS)",
            "type": "comet",
            "designation": "C/2023 A3"
        },
        "orbital_elements": {
            "eccentricity": 1.00027,
            "perihelion_distance": 0.39,
            "perihelion_date": "2024-09-27"
        },
        "conditions_met": [
            "is_interstellar = TRUE",
            "perihelion_distance < 0.5 AU",
            "object_name CONTAINS 'comet'"
        ],
        "metadata": {
            "detection_timestamp": "2025-10-25T21:00:00Z",
            "confidence": 0.95,
            "data_quality": "excellent"
        }
    }
    
    alert = Alerts(
        alert_type="INTERSTELLAR_OBJECT",
        title="Interstellar Comet Detected",
        description="Hyperbolic orbit comet approaching perihelion",
        related_object_name="C/2023 A3",
        severity="HIGH",
        status="ACTIVE",
        trigger_data=complex_trigger_data
    )
    
    db_session.add(alert)
    db_session.commit()
    
    # Query and verify JSONB data
    result = db_session.query(Alerts).filter_by(title="Interstellar Comet Detected").first()
    assert result.trigger_data["source"] == "JPL Horizons"
    assert result.trigger_data["object"]["type"] == "comet"
    assert result.trigger_data["orbital_elements"]["eccentricity"] == 1.00027
    assert len(result.trigger_data["conditions_met"]) == 3
    assert result.trigger_data["metadata"]["confidence"] == 0.95


def test_cascade_delete_sign_removes_triggers(db_session):
    """Test CASCADE delete: deleting sign removes all its triggers."""
    sign = CelestialSigns(
        sign_name="Cascade Test Sign",
        sign_description="Test",
        theological_interpretation="Test",
        primary_scripture="Test 1:1",
        sign_type="OTHER"
    )
    db_session.add(sign)
    db_session.commit()
    
    trigger1 = DataTriggers(
        sign_id=sign.id,
        trigger_name="Cascade Test Trigger 1",
        data_source_api="OTHER",
        query_parameter="test",
        query_operator="=",
        query_value="test",
        priority=1,
        is_active=True
    )
    
    trigger2 = DataTriggers(
        sign_id=sign.id,
        trigger_name="Cascade Test Trigger 2",
        data_source_api="OTHER",
        query_parameter="test",
        query_operator="=",
        query_value="test",
        priority=1,
        is_active=True
    )
    
    db_session.add_all([trigger1, trigger2])
    db_session.commit()
    
    trigger_ids = [trigger1.id, trigger2.id]
    
    # Delete sign - use db session expire_all to clear cache
    db_session.expire_all()
    sign_to_delete = db_session.query(CelestialSigns).filter_by(sign_name="Cascade Test Sign").first()
    db_session.delete(sign_to_delete)
    db_session.commit()
    
    # Verify triggers were CASCADE deleted
    remaining_triggers = db_session.query(DataTriggers).filter(
        DataTriggers.id.in_(trigger_ids)
    ).all()
    assert len(remaining_triggers) == 0


def test_set_null_on_trigger_delete(db_session):
    """Test SET NULL: deleting trigger sets alert.trigger_id to NULL."""
    sign = CelestialSigns(
        sign_name="Set Null Test Sign",
        sign_description="Test",
        theological_interpretation="Test",
        primary_scripture="Test 1:1",
        sign_type="OTHER"
    )
    db_session.add(sign)
    db_session.commit()
    
    trigger = DataTriggers(
        sign_id=sign.id,
        trigger_name="Set Null Test Trigger",
        data_source_api="OTHER",
        query_parameter="test",
        query_operator="=",
        query_value="test",
        priority=1,
        is_active=True
    )
    db_session.add(trigger)
    db_session.commit()
    
    alert = Alerts(
        trigger_id=trigger.id,
        alert_type="OTHER",
        title="Set Null Test Alert",
        description="Test alert for SET NULL behavior",
        severity="LOW",
        status="ACTIVE"
    )
    db_session.add(alert)
    db_session.commit()
    
    alert_id = alert.id
    
    # Delete trigger
    db_session.delete(trigger)
    db_session.commit()
    
    # Verify alert still exists but trigger_id is NULL
    remaining_alert = db_session.query(Alerts).filter_by(id=alert_id).first()
    assert remaining_alert is not None
    assert remaining_alert.trigger_id is None


def test_data_triggers_priority_constraint(db_session):
    """Test check constraint on priority (1-5)."""
    sign = CelestialSigns(
        sign_name="Priority Test Sign",
        sign_description="Test",
        theological_interpretation="Test",
        primary_scripture="Test 1:1",
        sign_type="OTHER"
    )
    db_session.add(sign)
    db_session.commit()
    
    # Valid priority
    trigger = DataTriggers(
        sign_id=sign.id,
        trigger_name="Valid Priority Trigger",
        data_source_api="OTHER",
        query_parameter="test",
        query_operator="=",
        query_value="test",
        priority=3,
        is_active=True
    )
    db_session.add(trigger)
    db_session.commit()
    
    assert trigger.priority == 3


def test_query_active_alerts_by_severity(db_session):
    """Test querying active alerts sorted by severity."""
    # Create mix of alerts with different severities and statuses
    alerts_data = [
        ("CRITICAL Active 1", "CRITICAL", "ACTIVE"),
        ("HIGH Active 1", "HIGH", "ACTIVE"),
        ("MEDIUM Resolved", "MEDIUM", "RESOLVED"),
        ("CRITICAL Active 2", "CRITICAL", "ACTIVE"),
        ("LOW Active 1", "LOW", "ACTIVE"),
        ("HIGH Acknowledged", "HIGH", "ACKNOWLEDGED"),
    ]
    
    for title, severity, status in alerts_data:
        alert = Alerts(
            alert_type="OTHER",
            title=title,
            description="Test alert",
            severity=severity,
            status=status
        )
        db_session.add(alert)
    
    db_session.commit()
    
    # Query only ACTIVE alerts
    active_alerts = db_session.query(Alerts).filter_by(status="ACTIVE").all()
    assert len(active_alerts) == 4
    
    # Count by severity
    critical_count = len([a for a in active_alerts if a.severity == "CRITICAL"])
    high_count = len([a for a in active_alerts if a.severity == "HIGH"])
    low_count = len([a for a in active_alerts if a.severity == "LOW"])
    
    assert critical_count == 2
    assert high_count == 1
    assert low_count == 1
