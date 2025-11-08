#!/usr/bin/env python3
"""
Seed script for orbital elements data.
"""
import sys
from datetime import datetime
from app.db.session import get_db
from app.models.scientific import OrbitalElements
from sqlalchemy.orm import Session

def seed_orbital_data():
    """Seed basic orbital elements data."""
    db: Session = next(get_db())

    # Clear existing data
    db.query(OrbitalElements).delete()

    # Add planets
    planets_data = [
        {
            "object_name": "Mercury",
            "epoch_iso": datetime(2024, 1, 1),
            "semi_major_axis_au": 0.38709927,
            "eccentricity": 0.20563593,
            "inclination_deg": 7.00497902,
            "longitude_ascending_node_deg": 48.33076593,
            "argument_perihelion_deg": 77.45779628,
            "mean_anomaly_deg": 252.2503235,
            "data_source": "JPL"
        },
        {
            "object_name": "Venus",
            "epoch_iso": datetime(2024, 1, 1),
            "semi_major_axis_au": 0.72333566,
            "eccentricity": 0.00677672,
            "inclination_deg": 3.39467605,
            "longitude_ascending_node_deg": 76.67984255,
            "argument_perihelion_deg": 131.60246718,
            "mean_anomaly_deg": 181.9790995,
            "data_source": "JPL"
        },
        {
            "object_name": "Earth",
            "epoch_iso": datetime(2024, 1, 1),
            "semi_major_axis_au": 1.00000261,
            "eccentricity": 0.01671123,
            "inclination_deg": 0.00001531,  # Fixed: positive value
            "longitude_ascending_node_deg": 0.0,
            "argument_perihelion_deg": 102.93768193,
            "mean_anomaly_deg": 100.46457166,
            "data_source": "JPL"
        },
        {
            "object_name": "Mars",
            "epoch_iso": datetime(2024, 1, 1),
            "semi_major_axis_au": 1.52371034,
            "eccentricity": 0.09339410,
            "inclination_deg": 1.84969142,
            "longitude_ascending_node_deg": 49.55953891,
            "argument_perihelion_deg": -23.94362959,
            "mean_anomaly_deg": -4.55343205,
            "data_source": "JPL"
        },
        # Add interstellar objects
        {
            "object_name": "1I/'Oumuamua",
            "epoch_iso": datetime(2017, 10, 19),
            "semi_major_axis_au": -1.27,
            "eccentricity": 1.2,
            "inclination_deg": 122.7,
            "longitude_ascending_node_deg": 24.6,
            "argument_perihelion_deg": 241.8,
            "mean_anomaly_deg": 0.0,
            "data_source": "JPL"
        },
        {
            "object_name": "2I/Borisov",
            "epoch_iso": datetime(2019, 8, 30),
            "semi_major_axis_au": 3.156,
            "eccentricity": 3.357,
            "inclination_deg": 44.05,
            "longitude_ascending_node_deg": 209.13,
            "argument_perihelion_deg": 308.01,
            "mean_anomaly_deg": 0.0,
            "data_source": "JPL"
        }
    ]

    for planet_data in planets_data:
        orbital = OrbitalElements(**planet_data)
        db.add(orbital)

    db.commit()
    print(f"✅ Seeded {len(planets_data)} orbital elements")

    # Verify
    count = db.query(OrbitalElements).count()
    print(f"✅ Total orbital elements in database: {count}")

    db.close()

if __name__ == "__main__":
    sys.path.insert(0, '.')
    seed_orbital_data()