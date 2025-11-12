"""Integration tests for correlation analysis endpoints."""

import pytest
from datetime import datetime
from uuid import uuid4

from app.models.correlations import CorrelationRules, EventCorrelations


class TestCorrelationRulesEndpoint:
    """Tests for /api/v1/correlations/correlation-rules endpoint."""
    
    def test_get_correlation_rules_empty(self, client):
        """Test getting correlation rules when database is empty."""
        response = client.get("/api/v1/correlations/correlation-rules")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["data"] == []
    
    def test_get_correlation_rules_with_data(self, client, db_session):
        """Test getting correlation rules with records."""
        rule = CorrelationRules(
            rule_name="Solar Flare -> Aurora Correlation",
            primary_event_type="SOLAR_FLARE",
            primary_threshold={"flare_class": {"$gte": "M5.0"}},
            secondary_event_type="OTHER",
            secondary_threshold={"kp_index": {"$gte": 6}},
            time_window_days=3,
            minimum_confidence=0.7,
            priority=1,
            is_active=True
        )
        db_session.add(rule)
        db_session.commit()
        
        response = client.get("/api/v1/correlations/correlation-rules")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["rule_name"] == "Solar Flare -> Aurora Correlation"
        assert data["data"][0]["time_window_days"] == 3
        
        # Verify JSONB threshold fields
        primary = data["data"][0]["primary_threshold"]
        assert primary["flare_class"]["$gte"] == "M5.0"
        secondary = data["data"][0]["secondary_threshold"]
        assert secondary["kp_index"]["$gte"] == 6
    
    def test_filter_by_is_active(self, client, db_session):
        """Test filtering by is_active status."""
        db_session.add(CorrelationRules(
            rule_name="Active Rule",
            primary_event_type="EARTHQUAKE",
            primary_threshold={"magnitude": {"$gte": 6.0}},
            secondary_event_type="OTHER",
            secondary_threshold={"wave_height_m": {"$gte": 1.0}},
            time_window_days=1,
            minimum_confidence=0.8,
            priority=1,
            is_active=True
        ))
        db_session.add(CorrelationRules(
            rule_name="Inactive Rule",
            primary_event_type="VOLCANIC",
            primary_threshold={"vei": {"$gte": 4}},
            secondary_event_type="EARTHQUAKE",
            secondary_threshold={"magnitude": {"$gte": 5.0}},
            time_window_days=7,
            minimum_confidence=0.6,
            priority=2,
            is_active=False
        ))
        db_session.commit()
        
        response = client.get("/api/v1/correlations/correlation-rules?is_active=true")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["rule_name"] == "Active Rule"
    
    def test_filter_by_primary_event_type(self, client, db_session):
        """Test filtering by primary event type."""
        db_session.add(CorrelationRules(
            rule_name="Earthquake Rule",
            primary_event_type="EARTHQUAKE",
            primary_threshold={},
            secondary_event_type="EARTHQUAKE",
            secondary_threshold={},
            time_window_days=30,
            minimum_confidence=0.9,
            priority=1
        ))
        db_session.add(CorrelationRules(
            rule_name="Solar Rule",
            primary_event_type="SOLAR_FLARE",
            primary_threshold={},
            secondary_event_type="CME",
            secondary_threshold={},
            time_window_days=2,
            minimum_confidence=0.75,
            priority=2
        ))
        db_session.commit()
        
        response = client.get("/api/v1/correlations/correlation-rules?primary_event_type=SOLAR_FLARE")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["rule_name"] == "Solar Rule"
    
    def test_filter_by_secondary_event_type(self, client, db_session):
        """Test filtering by secondary event type."""
        db_session.add(CorrelationRules(
            rule_name="Rule 1",
            primary_event_type="OTHER",
            primary_threshold={},
            secondary_event_type="OTHER",
            secondary_threshold={},
            time_window_days=5,
            minimum_confidence=0.7,
            priority=1
        ))
        db_session.add(CorrelationRules(
            rule_name="Rule 2",
            primary_event_type="SOLAR_FLARE",
            primary_threshold={},
            secondary_event_type="CME",
            secondary_threshold={},
            time_window_days=3,
            minimum_confidence=0.8,
            priority=2
        ))
        db_session.commit()
        
        response = client.get("/api/v1/correlations/correlation-rules?secondary_event_type=OTHER")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["rule_name"] == "Rule 1"
    
    def test_ordering_by_priority_and_name(self, client, db_session):
        """Test that rules are ordered by priority then rule_name."""
        db_session.add(CorrelationRules(
            rule_name="C Rule", primary_event_type="SOLAR_FLARE", primary_threshold={},
            secondary_event_type="CME", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=2
        ))
        db_session.add(CorrelationRules(
            rule_name="A Rule", primary_event_type="SOLAR_FLARE", primary_threshold={},
            secondary_event_type="CME", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=1
        ))
        db_session.add(CorrelationRules(
            rule_name="B Rule", primary_event_type="SOLAR_FLARE", primary_threshold={},
            secondary_event_type="CME", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=1
        ))
        db_session.commit()
        
        response = client.get("/api/v1/correlations/correlation-rules")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        
        names = [r["rule_name"] for r in data["data"]]
        assert names == ["A Rule", "B Rule", "C Rule"]


class TestEventCorrelationsEndpoint:
    """Tests for /api/v1/correlations/event-correlations endpoint."""
    
    def test_get_event_correlations_empty(self, client):
        """Test getting event correlations when database is empty."""
        response = client.get("/api/v1/correlations/event-correlations")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_event_correlations_with_data(self, client, db_session):
        """Test getting event correlations with records."""
        # Create a correlation rule first
        rule = CorrelationRules(
            rule_name="Test Rule",
            primary_event_type="EARTHQUAKE",
            primary_threshold={},
            secondary_event_type="EARTHQUAKE",
            secondary_threshold={},
            time_window_days=30,
            minimum_confidence=0.7,
            priority=1
        )
        db_session.add(rule)
        db_session.flush()
        
        # Create correlation
        correlation = EventCorrelations(
            rule_id=rule.id,
            primary_event_id=uuid4(),
            primary_event_type="EARTHQUAKE",
            primary_event_time=datetime(2025, 1, 15, 10, 0, 0),
            primary_event_data={"magnitude": 7.2, "location": "California"},
            secondary_event_id=uuid4(),
            secondary_event_type="EARTHQUAKE",
            secondary_event_time=datetime(2025, 1, 15, 12, 30, 0),
            secondary_event_data={"magnitude": 5.1, "location": "California"},
            time_delta_hours=2.5,
            confidence_score=0.85,
            spatial_distance_km=15.5
        )
        db_session.add(correlation)
        db_session.commit()
        
        response = client.get("/api/v1/correlations/event-correlations")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["primary_event_type"] == "EARTHQUAKE"
        assert data["data"][0]["confidence_score"] == 0.85
        assert data["data"][0]["time_delta_hours"] == 2.5
        
        # Verify JSONB event data
        primary_data = data["data"][0]["primary_event_data"]
        assert primary_data["magnitude"] == 7.2
        secondary_data = data["data"][0]["secondary_event_data"]
        assert secondary_data["magnitude"] == 5.1
    
    def test_filter_by_rule_id(self, client, db_session):
        """Test filtering by rule_id."""
        # Create two rules
        rule1 = CorrelationRules(
            rule_name="Rule 1", primary_event_type="SOLAR_FLARE", primary_threshold={},
            secondary_event_type="CME", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=1
        )
        rule2 = CorrelationRules(
            rule_name="Rule 2", primary_event_type="EARTHQUAKE", primary_threshold={},
            secondary_event_type="VOLCANIC", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=2
        )
        db_session.add_all([rule1, rule2])
        db_session.flush()
        
        # Create correlations
        corr1 = EventCorrelations(
            rule_id=rule1.id,
            primary_event_id=uuid4(),
            primary_event_type="SOLAR_FLARE",
            primary_event_time=datetime(2025, 1, 15),
            secondary_event_id=uuid4(),
            secondary_event_type="CME",
            secondary_event_time=datetime(2025, 1, 15),
            time_delta_hours=1.0,
            confidence_score=0.8
        )
        corr2 = EventCorrelations(
            rule_id=rule2.id,
            primary_event_id=uuid4(),
            primary_event_type="EARTHQUAKE",
            primary_event_time=datetime(2025, 1, 15),
            secondary_event_id=uuid4(),
            secondary_event_type="VOLCANIC",
            secondary_event_time=datetime(2025, 1, 15),
            time_delta_hours=2.0,
            confidence_score=0.9
        )
        db_session.add_all([corr1, corr2])
        db_session.commit()
        
        response = client.get(f"/api/v1/correlations/event-correlations?rule_id={rule2.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["rule_id"] == rule2.id
    
    def test_filter_by_min_confidence(self, client, db_session):
        """Test filtering by minimum confidence score."""
        # Create rule
        rule = CorrelationRules(
            rule_name="Rule", primary_event_type="SOLAR_FLARE", primary_threshold={},
            secondary_event_type="CME", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=1
        )
        db_session.add(rule)
        db_session.flush()
        
        # Create correlations with different confidence scores
        for conf in [0.5, 0.7, 0.9]:
            corr = EventCorrelations(
                rule_id=rule.id,
                primary_event_id=uuid4(),
                primary_event_type="SOLAR_FLARE",
                primary_event_time=datetime(2025, 1, 15),
                secondary_event_id=uuid4(),
                secondary_event_type="CME",
                secondary_event_time=datetime(2025, 1, 15),
                time_delta_hours=1.0,
                confidence_score=conf
            )
            db_session.add(corr)
        db_session.commit()
        
        response = client.get("/api/v1/correlations/event-correlations?min_confidence=0.8")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["confidence_score"] == 0.9
    
    def test_filter_by_primary_event_type(self, client, db_session):
        """Test filtering by primary event type."""
        rule = CorrelationRules(
            rule_name="Rule", primary_event_type="SOLAR_FLARE", primary_threshold={},
            secondary_event_type="CME", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=1
        )
        db_session.add(rule)
        db_session.flush()
        
        db_session.add(EventCorrelations(
            rule_id=rule.id,
            primary_event_id=uuid4(),
            primary_event_type="EARTHQUAKE",
            primary_event_time=datetime(2025, 1, 15),
            secondary_event_id=uuid4(),
            secondary_event_type="OTHER",
            secondary_event_time=datetime(2025, 1, 15),
            time_delta_hours=0.5,
            confidence_score=0.95
        ))
        db_session.add(EventCorrelations(
            rule_id=rule.id,
            primary_event_id=uuid4(),
            primary_event_type="SOLAR_FLARE",
            primary_event_time=datetime(2025, 1, 15),
            secondary_event_id=uuid4(),
            secondary_event_type="OTHER",
            secondary_event_time=datetime(2025, 1, 16),
            time_delta_hours=24.0,
            confidence_score=0.85
        ))
        db_session.commit()
        
        response = client.get("/api/v1/correlations/event-correlations?primary_event_type=EARTHQUAKE")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["primary_event_type"] == "EARTHQUAKE"
    
    def test_filter_by_secondary_event_type(self, client, db_session):
        """Test filtering by secondary event type."""
        rule = CorrelationRules(
            rule_name="Rule", primary_event_type="SOLAR_FLARE", primary_threshold={},
            secondary_event_type="CME", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=1
        )
        db_session.add(rule)
        db_session.flush()
        
        db_session.add(EventCorrelations(
            rule_id=rule.id,
            primary_event_id=uuid4(),
            primary_event_type="SOLAR_FLARE",
            primary_event_time=datetime(2025, 1, 15),
            secondary_event_id=uuid4(),
            secondary_event_type="OTHER",
            secondary_event_time=datetime(2025, 1, 15),
            time_delta_hours=1.0,
            confidence_score=0.9
        ))
        db_session.add(EventCorrelations(
            rule_id=rule.id,
            primary_event_id=uuid4(),
            primary_event_type="SOLAR_FLARE",
            primary_event_time=datetime(2025, 1, 15),
            secondary_event_id=uuid4(),
            secondary_event_type="CME",
            secondary_event_time=datetime(2025, 1, 15),
            time_delta_hours=2.0,
            confidence_score=0.85
        ))
        db_session.commit()
        
        response = client.get("/api/v1/correlations/event-correlations?secondary_event_type=CME")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["secondary_event_type"] == "CME"
    
    def test_ordering_by_detected_at_desc(self, client, db_session):
        """Test that correlations are ordered by detected_at descending (newest first)."""
        rule = CorrelationRules(
            rule_name="Rule", primary_event_type="SOLAR_FLARE", primary_threshold={},
            secondary_event_type="CME", secondary_threshold={},
            time_window_days=1, minimum_confidence=0.5, priority=1
        )
        db_session.add(rule)
        db_session.flush()
        
        # Add correlations with different detection times (via created_at)
        for i, day in enumerate([14, 16, 15], start=1):
            corr = EventCorrelations(
                rule_id=rule.id,
                primary_event_id=uuid4(),
                primary_event_type="SOLAR_FLARE",
                primary_event_time=datetime(2025, 1, day),
                secondary_event_id=uuid4(),
                secondary_event_type="CME",
                secondary_event_time=datetime(2025, 1, day),
                time_delta_hours=float(i),
                confidence_score=0.8
            )
            db_session.add(corr)
            db_session.flush()
            # Manually set detected_at for testing order
            corr.detected_at = datetime(2025, 1, day, 12, 0, 0)
        db_session.commit()
        
        response = client.get("/api/v1/correlations/event-correlations")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        
        # Verify newest first (day 16, 15, 14)
        time_deltas = [c["time_delta_hours"] for c in data["data"]]
        assert time_deltas == [2.0, 3.0, 1.0]  # Corresponds to days 16, 15, 14
