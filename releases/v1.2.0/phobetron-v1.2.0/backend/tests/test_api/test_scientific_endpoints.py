"""Integration tests for scientific data endpoints."""

import pytest
from datetime import datetime
from uuid import uuid4

from app.models.scientific import EphemerisData, OrbitalElements, ImpactRisks, NeoCloseApproaches


class TestEphemerisEndpoint:
    """Tests for /api/v1/scientific/ephemeris endpoint."""
    
    def test_get_ephemeris_empty(self, client):
        """Test getting ephemeris data when database is empty."""
        response = client.get("/api/v1/scientific/ephemeris")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["skip"] == 0
        assert data["limit"] == 50
        assert data["data"] == []
    
    def test_get_ephemeris_with_data(self, client, db_session):
        """Test getting ephemeris data with records in database."""
        # Create test data
        ephemeris = EphemerisData(
            object_name="Apophis",
            object_type="asteroid",
            epoch_iso=datetime(2025, 1, 1, 0, 0, 0),
            x_au=1.0,
            y_au=0.5,
            z_au=0.1,
            vx_au_day=0.01,
            vy_au_day=0.02,
            vz_au_day=0.001,
            data_source="JPL"
        )
        db_session.add(ephemeris)
        db_session.commit()
        
        response = client.get("/api/v1/scientific/ephemeris")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["data"]) == 1
        assert data["data"][0]["object_name"] == "Apophis"
        assert data["data"][0]["object_type"] == "asteroid"
    
    def test_get_ephemeris_pagination(self, client, db_session):
        """Test pagination parameters."""
        # Create multiple records
        for i in range(5):
            ephemeris = EphemerisData(
                object_name=f"Object{i}",
                object_type="asteroid",
                epoch_iso=datetime(2025, 1, i+1, 0, 0, 0),
                x_au=float(i),
                y_au=0.5,
                z_au=0.1
            )
            db_session.add(ephemeris)
        db_session.commit()
        
        # Test with limit
        response = client.get("/api/v1/scientific/ephemeris?skip=1&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5
        assert data["skip"] == 1
        assert data["limit"] == 2
        assert len(data["data"]) == 2
    
    def test_get_ephemeris_filter_by_object_name(self, client, db_session):
        """Test filtering by object name."""
        # Create test data
        db_session.add(EphemerisData(
            object_name="Apophis",
            object_type="asteroid",
            epoch_iso=datetime(2025, 1, 1),
            x_au=1.0, y_au=0.5, z_au=0.1
        ))
        db_session.add(EphemerisData(
            object_name="Bennu",
            object_type="asteroid",
            epoch_iso=datetime(2025, 1, 2),
            x_au=1.5, y_au=0.7, z_au=0.2
        ))
        db_session.commit()
        
        response = client.get("/api/v1/scientific/ephemeris?object_name=Apophis")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["object_name"] == "Apophis"


class TestOrbitalElementsEndpoint:
    """Tests for /api/v1/scientific/orbital-elements endpoint."""
    
    def test_get_orbital_elements_empty(self, client):
        """Test getting orbital elements when database is empty."""
        response = client.get("/api/v1/scientific/orbital-elements")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["data"] == []
    
    def test_get_orbital_elements_with_data(self, client, db_session):
        """Test getting orbital elements with records."""
        orbital = OrbitalElements(
            object_name="Oumuamua",
            epoch_iso=datetime(2017, 10, 19),
            semi_major_axis_au=-1.27,
            eccentricity=1.2,
            inclination_deg=122.7,
            longitude_ascending_node_deg=24.6,
            argument_perihelion_deg=241.8,
            mean_anomaly_deg=0.0,
            data_source="JPL"
        )
        db_session.add(orbital)
        db_session.commit()
        
        response = client.get("/api/v1/scientific/orbital-elements")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["object_name"] == "Oumuamua"
        assert data["data"][0]["eccentricity"] == 1.2
        assert data["data"][0]["is_interstellar"] == True
    
    def test_filter_by_interstellar(self, client, db_session):
        """Test filtering by interstellar status."""
        # Add interstellar object
        db_session.add(OrbitalElements(
            object_name="Oumuamua",
            epoch_iso=datetime(2017, 10, 19),
            semi_major_axis_au=-1.27,
            eccentricity=1.2,
            inclination_deg=122.7,
            longitude_ascending_node_deg=24.6,
            argument_perihelion_deg=241.8,
            mean_anomaly_deg=0.0
        ))
        # Add normal object
        db_session.add(OrbitalElements(
            object_name="Apophis",
            epoch_iso=datetime(2025, 1, 1),
            semi_major_axis_au=0.92,
            eccentricity=0.19,
            inclination_deg=3.3,
            longitude_ascending_node_deg=204.4,
            argument_perihelion_deg=126.4,
            mean_anomaly_deg=0.0
        ))
        db_session.commit()
        
        response = client.get("/api/v1/scientific/orbital-elements?is_interstellar=true")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["object_name"] == "Oumuamua"


class TestImpactRisksEndpoint:
    """Tests for /api/v1/scientific/impact-risks endpoint."""
    
    def test_get_impact_risks_empty(self, client):
        """Test getting impact risks when database is empty."""
        response = client.get("/api/v1/scientific/impact-risks")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_impact_risks_with_data(self, client, db_session):
        """Test getting impact risks with records."""
        risk = ImpactRisks(
            object_name="Apophis",
            impact_date=datetime(2029, 4, 13),
            impact_probability=0.00001,
            palermo_scale=-3.2,
            torino_scale=0,
            estimated_diameter_m=370.0,
            data_source="JPL Sentry"
        )
        db_session.add(risk)
        db_session.commit()
        
        response = client.get("/api/v1/scientific/impact-risks")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["object_name"] == "Apophis"
        assert data["data"][0]["torino_scale"] == 0
    
    def test_filter_by_torino_scale(self, client, db_session):
        """Test filtering by minimum Torino scale."""
        # Add low risk
        db_session.add(ImpactRisks(
            object_name="Low Risk",
            impact_date=datetime(2030, 1, 1),
            impact_probability=0.0001,
            torino_scale=0
        ))
        # Add high risk
        db_session.add(ImpactRisks(
            object_name="High Risk",
            impact_date=datetime(2030, 1, 1),
            impact_probability=0.01,
            torino_scale=3
        ))
        db_session.commit()
        
        response = client.get("/api/v1/scientific/impact-risks?min_torino_scale=1")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["object_name"] == "High Risk"


class TestNeoCloseApproachesEndpoint:
    """Tests for /api/v1/scientific/close-approaches endpoint."""
    
    def test_get_close_approaches_empty(self, client):
        """Test getting close approaches when database is empty."""
        response = client.get("/api/v1/scientific/close-approaches")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_close_approaches_with_data(self, client, db_session):
        """Test getting close approaches with records."""
        approach = NeoCloseApproaches(
            object_name="Apophis",
            approach_date=datetime(2029, 4, 13, 21, 46, 0),
            miss_distance_au=0.00025,
            miss_distance_lunar=0.097,
            relative_velocity_km_s=7.42,
            estimated_diameter_m=370.0,
            data_source="JPL CNEOS"
        )
        db_session.add(approach)
        db_session.commit()
        
        response = client.get("/api/v1/scientific/close-approaches")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["object_name"] == "Apophis"
        assert data["data"][0]["miss_distance_au"] == 0.00025
    
    def test_filter_by_max_distance(self, client, db_session):
        """Test filtering by maximum distance."""
        # Add close approach
        db_session.add(NeoCloseApproaches(
            object_name="Very Close",
            approach_date=datetime(2029, 4, 13),
            miss_distance_au=0.0001
        ))
        # Add far approach
        db_session.add(NeoCloseApproaches(
            object_name="Far Away",
            approach_date=datetime(2029, 5, 1),
            miss_distance_au=0.5
        ))
        db_session.commit()
        
        response = client.get("/api/v1/scientific/close-approaches?max_distance_au=0.01")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["object_name"] == "Very Close"


class TestHealthEndpoint:
    """Tests for health check endpoint."""
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["database"] == "healthy"
    
    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
