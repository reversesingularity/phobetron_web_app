"""Integration tests for alert system endpoints."""

import pytest
from datetime import datetime

from app.models.alerts import DataTriggers, Alerts
from app.models.theological import CelestialSigns


class TestDataTriggersEndpoint:
    """Tests for /api/v1/alerts/data-triggers endpoint."""
    
    def test_get_data_triggers_empty(self, client):
        """Test getting data triggers when database is empty."""
        response = client.get("/api/v1/alerts/data-triggers")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["data"] == []
    
    def test_get_data_triggers_with_data(self, client, db_session):
        """Test getting data triggers with records."""
        # Create celestial sign first (foreign key requirement)
        sign = CelestialSigns(
            sign_name="Test Sign 1",
            sign_description="Test description",
            theological_interpretation="Test interpretation",
            primary_scripture="Rev 1:1",
            sign_type="SEISMIC"
        )
        db_session.add(sign)
        db_session.flush()
        
        trigger = DataTriggers(
            sign_id=sign.id,
            trigger_name="High Magnitude Earthquake",
            data_source_api="USGS_EARTHQUAKE",
            query_parameter="magnitude",
            query_operator=">=",
            query_value="6.0",
            additional_conditions={"region": "Pacific Ring of Fire", "depth_km": {"$lte": 100}},
            priority=1,
            is_active=True
        )
        db_session.add(trigger)
        db_session.commit()
        
        response = client.get("/api/v1/alerts/data-triggers")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["trigger_name"] == "High Magnitude Earthquake"
        assert data["data"][0]["query_operator"] == ">="
        assert data["data"][0]["priority"] == 1
        
        # Verify JSONB field deserialization
        conditions = data["data"][0]["additional_conditions"]
        assert conditions["region"] == "Pacific Ring of Fire"
        assert conditions["depth_km"]["$lte"] == 100
    
    def test_filter_by_is_active(self, client, db_session):
        """Test filtering by is_active status."""
        # Create celestial signs first (foreign key requirement)
        sign1 = CelestialSigns(
            sign_name="Test Sign Active",
            sign_description="...",
            theological_interpretation="...",
            primary_scripture="Rev 1:1",
            sign_type="SEISMIC"
        )
        sign2 = CelestialSigns(
            sign_name="Test Sign Inactive",
            sign_description="...",
            theological_interpretation="...",
            primary_scripture="Rev 2:1",
            sign_type="SOLAR"
        )
        db_session.add_all([sign1, sign2])
        db_session.flush()
        
        # Add active trigger
        db_session.add(DataTriggers(
            sign_id=sign1.id,
            trigger_name="Active Trigger",
            data_source_api="USGS_EARTHQUAKE",
            query_parameter="param1",
            query_operator="=",
            query_value="value1",
            is_active=True,
            priority=1
        ))
        # Add inactive trigger
        db_session.add(DataTriggers(
            sign_id=sign2.id,
            trigger_name="Inactive Trigger",
            data_source_api="NOAA_SWPC",
            query_parameter="param2",
            query_operator="=",
            query_value="value2",
            is_active=False,
            priority=2
        ))
        db_session.commit()
        
        response = client.get("/api/v1/alerts/data-triggers?is_active=true")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["trigger_name"] == "Active Trigger"
    
    def test_filter_by_sign_id(self, client, db_session):
        """Test filtering by sign_id."""
        # Create celestial signs first (foreign key requirement)
        sign10 = CelestialSigns(
            sign_name="Test Sign 10",
            sign_description="...",
            theological_interpretation="...",
            primary_scripture="Rev 10:1",
            sign_type="LUNAR"
        )
        sign20 = CelestialSigns(
            sign_name="Test Sign 20",
            sign_description="...",
            theological_interpretation="...",
            primary_scripture="Rev 20:1",
            sign_type="STELLAR"
        )
        db_session.add_all([sign10, sign20])
        db_session.flush()
        
        db_session.add(DataTriggers(
            sign_id=sign10.id,
            trigger_name="Trigger for Sign 10",
            data_source_api="USGS_EARTHQUAKE",
            query_parameter="param",
            query_operator="=",
            query_value="val",
            priority=1
        ))
        db_session.add(DataTriggers(
            sign_id=sign20.id,
            trigger_name="Trigger for Sign 20",
            data_source_api="NOAA_SWPC",
            query_parameter="param",
            query_operator="=",
            query_value="val",
            priority=2
        ))
        db_session.commit()
        
        response = client.get(f"/api/v1/alerts/data-triggers?sign_id={sign20.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["sign_id"] == sign20.id
    
    def test_filter_by_priority(self, client, db_session):
        """Test filtering by priority level."""
        # Create celestial signs first (foreign key requirement)
        signs = []
        for i in range(1, 6):
            sign = CelestialSigns(
                sign_name=f"Test Sign {i}",
                sign_description="...",
                theological_interpretation="...",
                primary_scripture=f"Rev {i}:1",
                sign_type="OTHER"
            )
            signs.append(sign)
        db_session.add_all(signs)
        db_session.flush()
        
        for i in range(1, 6):
            db_session.add(DataTriggers(
                sign_id=signs[i-1].id,
                trigger_name=f"Priority {i}",
                data_source_api="USGS_EARTHQUAKE",
                query_parameter="param",
                query_operator="=",
                query_value="val",
                priority=i
            ))
        db_session.commit()
        
        response = client.get("/api/v1/alerts/data-triggers?priority=3")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["priority"] == 3
    
    def test_ordering_by_priority_and_name(self, client, db_session):
        """Test that triggers are ordered by priority then trigger_name."""
        # Create celestial signs first (foreign key requirement)
        sign1 = CelestialSigns(
            sign_name="Test Sign C",
            sign_description="...",
            theological_interpretation="...",
            primary_scripture="Rev 1:1",
            sign_type="COSMIC"
        )
        sign2 = CelestialSigns(
            sign_name="Test Sign A",
            sign_description="...",
            theological_interpretation="...",
            primary_scripture="Rev 2:1",
            sign_type="TERRESTRIAL"
        )
        sign3 = CelestialSigns(
            sign_name="Test Sign B",
            sign_description="...",
            theological_interpretation="...",
            primary_scripture="Rev 3:1",
            sign_type="ATMOSPHERIC"
        )
        db_session.add_all([sign1, sign2, sign3])
        db_session.flush()
        
        db_session.add(DataTriggers(
            sign_id=sign1.id, trigger_name="C Trigger", data_source_api="USGS_EARTHQUAKE",
            query_parameter="p", query_operator="=", query_value="v", priority=2
        ))
        db_session.add(DataTriggers(
            sign_id=sign2.id, trigger_name="A Trigger", data_source_api="USGS_EARTHQUAKE",
            query_parameter="p", query_operator="=", query_value="v", priority=1
        ))
        db_session.add(DataTriggers(
            sign_id=sign3.id, trigger_name="B Trigger", data_source_api="USGS_EARTHQUAKE",
            query_parameter="p", query_operator="=", query_value="v", priority=1
        ))
        db_session.commit()
        
        response = client.get("/api/v1/alerts/data-triggers")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        
        # Verify order: priority 1 (A, B), then priority 2 (C)
        names = [t["trigger_name"] for t in data["data"]]
        assert names == ["A Trigger", "B Trigger", "C Trigger"]


class TestAlertsEndpoint:
    """Tests for /api/v1/alerts/alerts endpoint."""
    
    def test_get_alerts_empty(self, client):
        """Test getting alerts when database is empty."""
        response = client.get("/api/v1/alerts/alerts")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_alerts_with_data(self, client, db_session):
        """Test getting alerts with records."""
        alert = Alerts(
            alert_type="EARTHQUAKE",
            title="Major Earthquake Detected",
            description="A magnitude 7.2 earthquake has been detected in California",
            related_object_name="California Earthquake 2025-01-15",
            severity="HIGH",
            status="ACTIVE",
            trigger_data={
                "magnitude": 7.2,
                "location": "California",
                "depth_km": 15.5
            },
            triggered_at=datetime(2025, 1, 15, 10, 30, 0)
        )
        db_session.add(alert)
        db_session.commit()
        
        response = client.get("/api/v1/alerts/alerts")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["title"] == "Major Earthquake Detected"
        assert data["data"][0]["severity"] == "HIGH"
        assert data["data"][0]["status"] == "ACTIVE"
        
        # Verify JSONB trigger_data
        trigger_data = data["data"][0]["trigger_data"]
        assert trigger_data["magnitude"] == 7.2
        assert trigger_data["location"] == "California"
    
    def test_filter_by_status(self, client, db_session):
        """Test filtering by alert status."""
        db_session.add(Alerts(
            alert_type="EARTHQUAKE",
            title="Active Alert",
            description="...",
            severity="MEDIUM",
            status="ACTIVE",
            triggered_at=datetime(2025, 1, 15)
        ))
        db_session.add(Alerts(
            alert_type="EARTHQUAKE",
            title="Resolved Alert",
            description="...",
            severity="MEDIUM",
            status="RESOLVED",
            triggered_at=datetime(2025, 1, 14),
            resolved_at=datetime(2025, 1, 15)
        ))
        db_session.commit()
        
        response = client.get("/api/v1/alerts/alerts?status=RESOLVED")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["title"] == "Resolved Alert"
    
    def test_filter_by_severity(self, client, db_session):
        """Test filtering by severity level."""
        severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        for sev in severities:
            db_session.add(Alerts(
                alert_type="EARTHQUAKE",
                title=f"{sev} Alert",
                description="...",
                severity=sev,
                status="ACTIVE",
                triggered_at=datetime(2025, 1, 15)
            ))
        db_session.commit()
        
        response = client.get("/api/v1/alerts/alerts?severity=CRITICAL")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["title"] == "CRITICAL Alert"
    
    def test_filter_by_alert_type(self, client, db_session):
        """Test filtering by alert type."""
        db_session.add(Alerts(
            alert_type="EARTHQUAKE",
            title="Quake Alert",
            description="...",
            severity="HIGH",
            status="ACTIVE",
            triggered_at=datetime(2025, 1, 15)
        ))
        db_session.add(Alerts(
            alert_type="SOLAR_FLARE",
            title="Solar Alert",
            description="...",
            severity="MEDIUM",
            status="ACTIVE",
            triggered_at=datetime(2025, 1, 15)
        ))
        db_session.commit()
        
        response = client.get("/api/v1/alerts/alerts?alert_type=SOLAR_FLARE")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["title"] == "Solar Alert"
    
    def test_ordering_by_triggered_at_desc(self, client, db_session):
        """Test that alerts are ordered by triggered_at descending (newest first)."""
        db_session.add(Alerts(
            alert_type="EARTHQUAKE",
            title="Alert 2",
            description="...",
            severity="MEDIUM",
            status="ACTIVE",
            triggered_at=datetime(2025, 1, 15, 12, 0, 0)
        ))
        db_session.add(Alerts(
            alert_type="EARTHQUAKE",
            title="Alert 1",
            description="...",
            severity="MEDIUM",
            status="ACTIVE",
            triggered_at=datetime(2025, 1, 14, 10, 0, 0)
        ))
        db_session.add(Alerts(
            alert_type="EARTHQUAKE",
            title="Alert 3",
            description="...",
            severity="MEDIUM",
            status="ACTIVE",
            triggered_at=datetime(2025, 1, 16, 8, 0, 0)
        ))
        db_session.commit()
        
        response = client.get("/api/v1/alerts/alerts")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        
        # Verify newest first
        titles = [a["title"] for a in data["data"]]
        assert titles == ["Alert 3", "Alert 2", "Alert 1"]
    
    def test_alert_lifecycle_timestamps(self, client, db_session):
        """Test alert lifecycle with acknowledged and resolved timestamps."""
        alert = Alerts(
            alert_type="EARTHQUAKE",
            title="Lifecycle Alert",
            description="Testing lifecycle states",
            severity="HIGH",
            status="RESOLVED",
            triggered_at=datetime(2025, 1, 15, 10, 0, 0),
            acknowledged_at=datetime(2025, 1, 15, 10, 30, 0),
            resolved_at=datetime(2025, 1, 15, 12, 0, 0)
        )
        db_session.add(alert)
        db_session.commit()
        
        response = client.get("/api/v1/alerts/alerts")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        
        alert_data = data["data"][0]
        assert alert_data["status"] == "RESOLVED"
        assert alert_data["triggered_at"] is not None
        assert alert_data["acknowledged_at"] is not None
        assert alert_data["resolved_at"] is not None
