"""Test geophysical events models with sample data."""

import pytest
from datetime import datetime
from sqlalchemy import text
from app.models.events import (
    Earthquakes,
    SolarEvents,
    MeteorShowers,
    VolcanicActivity,
)


def test_earthquakes_create_with_postgis(db_session):
    """Test creating earthquake record with PostGIS geography."""
    # Create earthquake (2011 Tōhoku earthquake)
    earthquake = Earthquakes(
        event_id="us2011aaan",
        event_time=datetime(2011, 3, 11, 5, 46, 24),
        magnitude=9.1,
        magnitude_type="Mw",
        location="POINT(142.373 38.297)",  # WKT format: lon lat
        depth_km=29.0,
        region="Near the East Coast of Honshu, Japan",
        data_source="USGS"
    )
    
    db_session.add(earthquake)
    db_session.commit()
    
    # Query back and test spatial query
    result = db_session.query(Earthquakes).filter_by(event_id="us2011aaan").first()
    assert result is not None
    assert result.magnitude == 9.1
    assert result.magnitude_type == "Mw"
    assert result.region == "Near the East Coast of Honshu, Japan"
    
    # Test spatial query - find earthquakes within 100km
    nearby = db_session.execute(text("""
        SELECT event_id, region, magnitude
        FROM earthquakes
        WHERE ST_DWithin(
            location::geography,
            ST_GeogFromText('POINT(142.373 38.297)'),
            100000  -- 100 km in meters
        );
    """)).fetchall()
    
    assert len(nearby) >= 1
    print("✅ test_earthquakes_create_with_postgis passed")


def test_solar_events_create(db_session):
    """Test creating solar event records."""
    # Solar flare
    flare = SolarEvents(
        event_type="solar_flare",
        event_start=datetime(2024, 5, 11, 1, 23, 0),
        flare_class="X2.3",
        flare_region="AR3664",
        data_source="NOAA SWPC"
    )
    
    # Geomagnetic storm
    storm = SolarEvents(
        event_type="geomagnetic_storm",
        event_start=datetime(2024, 5, 11, 16, 0, 0),
        kp_index=8.0,
        dst_index_nt=-150.0,
        earth_arrival_time=datetime(2024, 5, 12, 18, 0, 0),
        notes="Strong geomagnetic storm following X-class flare",
        data_source="NOAA SWPC"
    )
    
    db_session.add_all([flare, storm])
    db_session.commit()
    
    # Query back
    flares = db_session.query(SolarEvents).filter_by(event_type="solar_flare").all()
    storms = db_session.query(SolarEvents).filter_by(event_type="geomagnetic_storm").all()
    
    assert len(flares) >= 1
    assert len(storms) >= 1
    assert storms[0].kp_index == 8.0
    print("✅ test_solar_events_create passed")


def test_meteor_showers_create(db_session):
    """Test creating meteor shower reference data."""
    # Perseids
    perseids = MeteorShowers(
        shower_name="Perseids",
        iau_code="PER",
        peak_month=8,
        peak_day_start=10,
        peak_day_end=14,
        radiant_ra_deg=48.0,
        radiant_dec_deg=58.0,
        zhr_max=100,
        velocity_km_s=59.0,
        parent_body="109P/Swift-Tuttle"
    )
    
    # Geminids
    geminids = MeteorShowers(
        shower_name="Geminids",
        iau_code="GEM",
        peak_month=12,
        peak_day_start=13,
        peak_day_end=14,
        radiant_ra_deg=112.0,
        radiant_dec_deg=33.0,
        zhr_max=120,
        velocity_km_s=35.0,
        parent_body="3200 Phaethon"
    )
    
    db_session.add_all([perseids, geminids])
    db_session.commit()
    
    # Query back
    result = db_session.query(MeteorShowers).filter_by(shower_name="Perseids").first()
    assert result is not None
    assert result.iau_code == "PER"
    assert result.zhr_max == 100
    assert result.parent_body == "109P/Swift-Tuttle"
    print("✅ test_meteor_showers_create passed")


def test_volcanic_activity_create_with_postgis(db_session):
    """Test creating volcanic eruption record with PostGIS geography."""
    # Mount St. Helens 1980 eruption
    eruption = VolcanicActivity(
        volcano_name="Mount St. Helens",
        country="United States",
        eruption_start=datetime(1980, 5, 18, 8, 32, 0),
        eruption_end=datetime(1980, 5, 18, 17, 0, 0),
        location="POINT(-122.18 46.20)",  # WKT format: lon lat
        vei=5,
        eruption_type="explosive",
        plume_height_km=24.0,
        notes="Catastrophic sector collapse and lateral blast",
        data_source="Smithsonian GVP"
    )
    
    db_session.add(eruption)
    db_session.commit()
    
    # Query back
    result = db_session.query(VolcanicActivity).filter_by(
        volcano_name="Mount St. Helens"
    ).first()
    assert result is not None
    assert result.vei == 5
    assert result.plume_height_km == 24.0
    assert result.eruption_type == "explosive"
    
    # Test spatial query
    nearby = db_session.execute(text("""
        SELECT volcano_name, country, vei
        FROM volcanic_activity
        WHERE ST_DWithin(
            location::geography,
            ST_GeogFromText('POINT(-122.18 46.20)'),
            50000  -- 50 km
        );
    """)).fetchall()
    
    assert len(nearby) >= 1
    print("✅ test_volcanic_activity_create_with_postgis passed")


def test_check_constraints(db_session):
    """Test that check constraints work correctly."""
    # Test earthquake magnitude must be positive
    with pytest.raises(Exception):
        bad_earthquake = Earthquakes(
            event_time=datetime.utcnow(),
            magnitude=-1.0,  # Invalid: negative
            location="POINT(0 0)"
        )
        db_session.add(bad_earthquake)
        db_session.commit()
    
    db_session.rollback()
    
    # Test Torino scale must be 0-10
    with pytest.raises(Exception):
        from app.models.scientific import ImpactRisks
        bad_risk = ImpactRisks(
            object_name="TEST",
            impact_date=datetime.utcnow(),
            impact_probability=0.5,
            torino_scale=15  # Invalid: > 10
        )
        db_session.add(bad_risk)
        db_session.commit()
    
    db_session.rollback()
    print("✅ test_check_constraints passed")
