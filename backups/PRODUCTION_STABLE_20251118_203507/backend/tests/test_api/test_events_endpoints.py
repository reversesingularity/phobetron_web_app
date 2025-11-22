"""Integration tests for geophysical events endpoints."""

import pytest
from datetime import datetime
from geoalchemy2 import WKTElement

from app.models.events import Earthquakes, SolarEvents, MeteorShowers, VolcanicActivity


class TestEarthquakesEndpoint:
    """Tests for /api/v1/events/earthquakes endpoint."""
    
    def test_get_earthquakes_empty(self, client):
        """Test getting earthquakes when database is empty."""
        response = client.get("/api/v1/events/earthquakes")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["data"] == []
    
    def test_get_earthquakes_with_data(self, client, db_session):
        """Test getting earthquakes with PostGIS location data."""
        # Create earthquake with PostGIS point (San Francisco)
        earthquake = Earthquakes(
            event_time=datetime(2025, 1, 15, 10, 30, 0),
            location=WKTElement('POINT(-122.4194 37.7749)', srid=4326),
            magnitude=5.5,
            magnitude_type="Mw",
            depth_km=10.5,
            region="California, USA",
            data_source="USGS"
        )
        db_session.add(earthquake)
        db_session.commit()
        
        response = client.get("/api/v1/events/earthquakes")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["data"]) == 1
        
        # Verify PostGIS data is converted to lat/lon
        quake_data = data["data"][0]
        assert quake_data["magnitude"] == 5.5
        assert quake_data["region"] == "California, USA"
        assert abs(quake_data["latitude"] - 37.7749) < 0.001
        assert abs(quake_data["longitude"] - (-122.4194)) < 0.001
    
    def test_filter_by_magnitude(self, client, db_session):
        """Test filtering by minimum magnitude."""
        # Add small earthquake
        db_session.add(Earthquakes(
            event_time=datetime(2025, 1, 15),
            location=WKTElement('POINT(-120.0 35.0)', srid=4326),
            magnitude=3.0,
            region="Small Quake"
        ))
        # Add large earthquake
        db_session.add(Earthquakes(
            event_time=datetime(2025, 1, 16),
            location=WKTElement('POINT(-121.0 36.0)', srid=4326),
            magnitude=6.5,
            region="Large Quake"
        ))
        db_session.commit()
        
        response = client.get("/api/v1/events/earthquakes?min_magnitude=6.0")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["region"] == "Large Quake"
    
    def test_filter_by_region(self, client, db_session):
        """Test filtering by region name."""
        db_session.add(Earthquakes(
            event_time=datetime(2025, 1, 15),
            location=WKTElement('POINT(-122.4 37.7)', srid=4326),
            magnitude=4.0,
            region="California"
        ))
        db_session.add(Earthquakes(
            event_time=datetime(2025, 1, 15),
            location=WKTElement('POINT(139.7 35.7)', srid=4326),
            magnitude=5.0,
            region="Japan"
        ))
        db_session.commit()
        
        response = client.get("/api/v1/events/earthquakes?region=California")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["region"] == "California"


class TestSolarEventsEndpoint:
    """Tests for /api/v1/events/solar-events endpoint."""
    
    def test_get_solar_events_empty(self, client):
        """Test getting solar events when database is empty."""
        response = client.get("/api/v1/events/solar-events")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_solar_events_with_data(self, client, db_session):
        """Test getting solar events with records."""
        solar = SolarEvents(
            event_start=datetime(2025, 1, 15, 12, 0, 0),
            event_type="solar_flare",
            flare_class="X2.1",
            kp_index=7,
            cme_speed_km_s=1500.0,
            data_source="NOAA SWPC"
        )
        db_session.add(solar)
        db_session.commit()
        
        response = client.get("/api/v1/events/solar-events")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["event_type"] == "solar_flare"
        assert data["data"][0]["flare_class"] == "X2.1"
    
    def test_filter_by_event_type(self, client, db_session):
        """Test filtering by solar event type."""
        db_session.add(SolarEvents(
            event_start=datetime(2025, 1, 15),
            event_type="solar_flare",
            flare_class="M5.0"
        ))
        db_session.add(SolarEvents(
            event_start=datetime(2025, 1, 16),
            event_type="cme",
            cme_speed_km_s=1000.0
        ))
        db_session.commit()
        
        response = client.get("/api/v1/events/solar-events?event_type=cme")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["event_type"] == "cme"
    
    def test_filter_by_kp_index(self, client, db_session):
        """Test filtering by minimum Kp index."""
        # Add low intensity
        db_session.add(SolarEvents(
            event_start=datetime(2025, 1, 15),
            event_type="geomagnetic_storm",
            kp_index=3
        ))
        # Add high intensity
        db_session.add(SolarEvents(
            event_start=datetime(2025, 1, 16),
            event_type="geomagnetic_storm",
            kp_index=8
        ))
        db_session.commit()
        
        response = client.get("/api/v1/events/solar-events?min_kp_index=7")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["kp_index"] == 8


class TestMeteorShowersEndpoint:
    """Tests for /api/v1/events/meteor-showers endpoint."""
    
    def test_get_meteor_showers_empty(self, client):
        """Test getting meteor showers when database is empty."""
        response = client.get("/api/v1/events/meteor-showers")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_meteor_showers_with_data(self, client, db_session):
        """Test getting meteor showers with records."""
        shower = MeteorShowers(
            shower_name="Perseids",
            iau_code="PER",
            peak_month=8,
            peak_day_start=12,
            peak_day_end=13,
            radiant_ra_deg=48.0,
            radiant_dec_deg=58.0,
            zhr_max=100
        )
        db_session.add(shower)
        db_session.commit()
        
        response = client.get("/api/v1/events/meteor-showers")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["shower_name"] == "Perseids"
        assert data["data"][0]["iau_code"] == "PER"
    
    def test_filter_by_peak_month(self, client, db_session):
        """Test filtering by peak month."""
        db_session.add(MeteorShowers(
            shower_name="Perseids",
            peak_month=8,
            peak_day_start=12,
            peak_day_end=13,
            radiant_ra_deg=48.0,
            radiant_dec_deg=58.0
        ))
        db_session.add(MeteorShowers(
            shower_name="Geminids",
            peak_month=12,
            peak_day_start=14,
            peak_day_end=15,
            radiant_ra_deg=112.0,
            radiant_dec_deg=33.0
        ))
        db_session.commit()
        
        response = client.get("/api/v1/events/meteor-showers?peak_month=12")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["shower_name"] == "Geminids"
    
    def test_filter_by_shower_name(self, client, db_session):
        """Test filtering by shower name."""
        db_session.add(MeteorShowers(
            shower_name="Perseids",
            peak_month=8,
            peak_day_start=12,
            peak_day_end=13,
            radiant_ra_deg=48.0,
            radiant_dec_deg=58.0
        ))
        db_session.add(MeteorShowers(
            shower_name="Leonids",
            peak_month=11,
            peak_day_start=17,
            peak_day_end=18,
            radiant_ra_deg=153.0,
            radiant_dec_deg=22.0
        ))
        db_session.commit()
        
        response = client.get("/api/v1/events/meteor-showers?shower_name=Leonids")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["shower_name"] == "Leonids"


class TestVolcanicActivityEndpoint:
    """Tests for /api/v1/events/volcanic-activity endpoint."""
    
    def test_get_volcanic_activity_empty(self, client):
        """Test getting volcanic activity when database is empty."""
        response = client.get("/api/v1/events/volcanic-activity")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_volcanic_activity_with_data(self, client, db_session):
        """Test getting volcanic activity with PostGIS location."""
        volcano = VolcanicActivity(
            volcano_name="Mount St. Helens",
            location=WKTElement('POINT(-122.1944 46.1914)', srid=4326),
            eruption_start=datetime(1980, 5, 18, 8, 32, 0),
            eruption_end=datetime(1980, 5, 18, 10, 0, 0),
            vei=5,
            eruption_type="Plinian",
            plume_height_km=19.0,
            data_source="USGS"
        )
        db_session.add(volcano)
        db_session.commit()
        
        response = client.get("/api/v1/events/volcanic-activity")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        
        # Verify PostGIS conversion
        volcano_data = data["data"][0]
        assert volcano_data["volcano_name"] == "Mount St. Helens"
        assert volcano_data["vei"] == 5
        assert abs(volcano_data["latitude"] - 46.1914) < 0.001
        assert abs(volcano_data["longitude"] - (-122.1944)) < 0.001
    
    def test_filter_by_vei(self, client, db_session):
        """Test filtering by minimum VEI."""
        # Add small eruption
        db_session.add(VolcanicActivity(
            volcano_name="Small Volcano",
            location=WKTElement('POINT(-120.0 35.0)', srid=4326),
            eruption_start=datetime(2025, 1, 15),
            vei=2
        ))
        # Add large eruption
        db_session.add(VolcanicActivity(
            volcano_name="Large Volcano",
            location=WKTElement('POINT(-121.0 36.0)', srid=4326),
            eruption_start=datetime(2025, 1, 16),
            vei=6
        ))
        db_session.commit()
        
        response = client.get("/api/v1/events/volcanic-activity?min_vei=5")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["volcano_name"] == "Large Volcano"
    
    def test_filter_by_volcano_name(self, client, db_session):
        """Test filtering by volcano name."""
        db_session.add(VolcanicActivity(
            volcano_name="Kilauea",
            location=WKTElement('POINT(-155.2918 19.4069)', srid=4326),
            eruption_start=datetime(2025, 1, 15),
            vei=2
        ))
        db_session.add(VolcanicActivity(
            volcano_name="Mount Fuji",
            location=WKTElement('POINT(138.7278 35.3606)', srid=4326),
            eruption_start=datetime(1707, 12, 16),
            vei=5
        ))
        db_session.commit()
        
        response = client.get("/api/v1/events/volcanic-activity?volcano_name=Kilauea")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["volcano_name"] == "Kilauea"
