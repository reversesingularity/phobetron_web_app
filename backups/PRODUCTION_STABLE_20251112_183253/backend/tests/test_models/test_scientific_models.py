"""Test scientific models with sample data insertion."""

import pytest
from datetime import datetime
from app.models.scientific import (
    EphemerisData,
    OrbitalElements,
    ImpactRisks,
    NeoCloseApproaches,
)


def test_ephemeris_data_create(db_session):
    """Test creating ephemeris data records."""
    # Create test data for asteroid Apophis
    ephemeris = EphemerisData(
        object_name="99942 Apophis",
        object_type="asteroid",
        epoch_iso=datetime(2025, 1, 1, 0, 0, 0),
        x_au=0.746,
        y_au=-0.523,
        z_au=-0.205,
        vx_au_day=0.009,
        vy_au_day=0.012,
        vz_au_day=0.005,
        data_source="JPL Horizons"
    )
    
    db_session.add(ephemeris)
    db_session.commit()
    
    # Query back
    result = db_session.query(EphemerisData).filter_by(object_name="99942 Apophis").first()
    assert result is not None
    assert result.object_type == "asteroid"
    assert result.x_au == 0.746
    assert result.data_source == "JPL Horizons"
    print("✅ test_ephemeris_data_create passed")


def test_orbital_elements_create(db_session):
    """Test creating orbital elements with computed is_interstellar field."""
    # Create data for 'Oumuamua (interstellar object)
    oumuamua = OrbitalElements(
        object_name="1I/2017 U1 ('Oumuamua)",
        epoch_iso=datetime(2017, 10, 19, 0, 0, 0),
        semi_major_axis_au=-1.28,
        eccentricity=1.20,  # Hyperbolic orbit
        inclination_deg=122.74,
        longitude_ascending_node_deg=24.60,
        argument_perihelion_deg=241.81,
        mean_anomaly_deg=0.0,
        data_source="JPL SBDB"
    )
    
    db_session.add(oumuamua)
    db_session.commit()
    
    # Query back and check computed field
    result = db_session.query(OrbitalElements).filter_by(
        object_name="1I/2017 U1 ('Oumuamua)"
    ).first()
    assert result is not None
    assert result.eccentricity == 1.20
    assert result.is_interstellar is True  # Computed column
    print("✅ test_orbital_elements_create passed")


def test_impact_risks_create(db_session):
    """Test creating impact risk assessment."""
    risk = ImpactRisks(
        object_name="99942 Apophis",
        impact_date=datetime(2029, 4, 13, 21, 46, 0),
        impact_probability=0.0,  # Previously higher, now ruled out
        palermo_scale=-3.22,
        torino_scale=0,
        estimated_diameter_m=370.0,
        impact_energy_mt=1200.0,
        data_source="NASA Sentry",
        assessment_date=datetime.utcnow()
    )
    
    db_session.add(risk)
    db_session.commit()
    
    result = db_session.query(ImpactRisks).filter_by(object_name="99942 Apophis").first()
    assert result is not None
    assert result.torino_scale == 0
    assert result.estimated_diameter_m == 370.0
    print("✅ test_impact_risks_create passed")


def test_neo_close_approaches_create(db_session):
    """Test creating NEO close approach record."""
    approach = NeoCloseApproaches(
        object_name="99942 Apophis",
        approach_date=datetime(2029, 4, 13, 21, 46, 0),
        miss_distance_au=0.000255,  # Very close!
        miss_distance_lunar=31.9,  # ~32,000 km
        relative_velocity_km_s=7.42,
        estimated_diameter_m=370.0,
        absolute_magnitude=19.7,
        data_source="JPL SBDB"
    )
    
    db_session.add(approach)
    db_session.commit()
    
    result = db_session.query(NeoCloseApproaches).filter_by(
        object_name="99942 Apophis"
    ).first()
    assert result is not None
    assert result.miss_distance_au == 0.000255
    assert result.miss_distance_lunar == 31.9
    print("✅ test_neo_close_approaches_create passed")


def test_unique_constraint(db_session):
    """Test unique constraint on object_name + epoch_iso."""
    ephemeris1 = EphemerisData(
        object_name="TEST OBJECT",
        object_type="asteroid",
        epoch_iso=datetime(2025, 1, 1, 0, 0, 0),
        x_au=1.0,
        y_au=0.0,
        z_au=0.0
    )
    db_session.add(ephemeris1)
    db_session.commit()
    
    # Try to add duplicate
    ephemeris2 = EphemerisData(
        object_name="TEST OBJECT",
        object_type="asteroid",
        epoch_iso=datetime(2025, 1, 1, 0, 0, 0),  # Same epoch
        x_au=2.0,
        y_au=1.0,
        z_au=0.5
    )
    db_session.add(ephemeris2)
    
    with pytest.raises(Exception):  # Should raise IntegrityError
        db_session.commit()
    
    db_session.rollback()
    print("✅ test_unique_constraint passed")
