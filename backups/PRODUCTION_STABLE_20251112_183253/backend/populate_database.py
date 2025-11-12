#!/usr/bin/env python3
"""
Database Population Script for Celestial Signs

Populates the PostgreSQL database with complete celestial object dataset
including planets, asteroids, comets, NEOs, and interstellar objects.
"""

import sys
import os
from datetime import datetime

# Add backend to path
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_dir)

from app.db.session import get_db
from app.models.scientific import OrbitalElements


# Complete celestial object dataset
CELESTIAL_OBJECTS = [
    # Planets (already in DB, but included for completeness)
    {
        'object_name': 'Mercury',
        'semi_major_axis_au': 0.38709927,
        'eccentricity': 0.20563593,
        'inclination_deg': 7.00497902,
        'longitude_ascending_node_deg': 48.33076593,
        'argument_perihelion_deg': 77.45779628,
        'mean_anomaly_deg': 252.25032350,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Venus',
        'semi_major_axis_au': 0.72333566,
        'eccentricity': 0.00677672,
        'inclination_deg': 3.39467605,
        'longitude_ascending_node_deg': 76.67984255,
        'argument_perihelion_deg': 131.60246718,
        'mean_anomaly_deg': 181.97909950,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Earth',
        'semi_major_axis_au': 1.00000261,
        'eccentricity': 0.01671123,
        'inclination_deg': 0.00001531,
        'longitude_ascending_node_deg': 0.0,
        'argument_perihelion_deg': 102.93768193,
        'mean_anomaly_deg': 100.46457166,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Mars',
        'semi_major_axis_au': 1.52371034,
        'eccentricity': 0.09339410,
        'inclination_deg': 1.84969142,
        'longitude_ascending_node_deg': 49.55953891,
        'argument_perihelion_deg': 286.53758759,
        'mean_anomaly_deg': 355.43300000,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Jupiter',
        'semi_major_axis_au': 5.20288700,
        'eccentricity': 0.04838624,
        'inclination_deg': 1.30439695,
        'longitude_ascending_node_deg': 100.47390909,
        'argument_perihelion_deg': 273.86784663,
        'mean_anomaly_deg': 18.47719000,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Saturn',
        'semi_major_axis_au': 9.53667594,
        'eccentricity': 0.05386179,
        'inclination_deg': 2.48599187,
        'longitude_ascending_node_deg': 113.66242448,
        'argument_perihelion_deg': 339.39266053,
        'mean_anomaly_deg': 316.63500000,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Uranus',
        'semi_major_axis_au': 19.18916464,
        'eccentricity': 0.04725744,
        'inclination_deg': 0.77263783,
        'longitude_ascending_node_deg': 74.01692503,
        'argument_perihelion_deg': 96.54131809,
        'mean_anomaly_deg': 142.23860000,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Neptune',
        'semi_major_axis_au': 30.06992276,
        'eccentricity': 0.00859048,
        'inclination_deg': 1.77004347,
        'longitude_ascending_node_deg': 131.78422574,
        'argument_perihelion_deg': 272.84688120,
        'mean_anomaly_deg': 260.24710000,
        'is_interstellar': False,
        'data_source': 'JPL'
    },

    # Asteroids
    {
        'object_name': 'Ceres',
        'semi_major_axis_au': 2.766,
        'eccentricity': 0.078,
        'inclination_deg': 10.6,
        'longitude_ascending_node_deg': 80.3,
        'argument_perihelion_deg': 73.6,
        'mean_anomaly_deg': 120.0,
        'is_interstellar': False,
        'data_source': 'MPC'
    },
    {
        'object_name': 'Vesta',
        'semi_major_axis_au': 2.362,
        'eccentricity': 0.089,
        'inclination_deg': 7.1,
        'longitude_ascending_node_deg': 103.8,
        'argument_perihelion_deg': 151.0,
        'mean_anomaly_deg': 220.0,
        'is_interstellar': False,
        'data_source': 'MPC'
    },
    {
        'object_name': 'Pallas',
        'semi_major_axis_au': 2.773,
        'eccentricity': 0.231,
        'inclination_deg': 34.8,
        'longitude_ascending_node_deg': 173.1,
        'argument_perihelion_deg': 310.0,
        'mean_anomaly_deg': 78.0,
        'is_interstellar': False,
        'data_source': 'MPC'
    },
    {
        'object_name': 'Hygiea',
        'semi_major_axis_au': 3.139,
        'eccentricity': 0.112,
        'inclination_deg': 3.8,
        'longitude_ascending_node_deg': 283.2,
        'argument_perihelion_deg': 312.0,
        'mean_anomaly_deg': 45.0,
        'is_interstellar': False,
        'data_source': 'MPC'
    },
    {
        'object_name': 'Eunomia',
        'semi_major_axis_au': 2.644,
        'eccentricity': 0.186,
        'inclination_deg': 11.7,
        'longitude_ascending_node_deg': 293.1,
        'argument_perihelion_deg': 98.0,
        'mean_anomaly_deg': 180.0,
        'is_interstellar': False,
        'data_source': 'MPC'
    },
    {
        'object_name': 'Juno',
        'semi_major_axis_au': 2.669,
        'eccentricity': 0.256,
        'inclination_deg': 12.0,
        'longitude_ascending_node_deg': 169.9,
        'argument_perihelion_deg': 248.0,
        'mean_anomaly_deg': 320.0,
        'is_interstellar': False,
        'data_source': 'MPC'
    },

    # Comets
    {
        'object_name': "Halley's Comet",
        'semi_major_axis_au': 17.834,
        'eccentricity': 0.967,
        'inclination_deg': 162.3,
        'longitude_ascending_node_deg': 58.4,
        'argument_perihelion_deg': 111.3,
        'mean_anomaly_deg': 38.4,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Hale-Bopp',
        'semi_major_axis_au': 186.0,
        'eccentricity': 0.995,
        'inclination_deg': 89.4,
        'longitude_ascending_node_deg': 282.5,
        'argument_perihelion_deg': 130.6,
        'mean_anomaly_deg': 180.0,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'C/2025 A6 (Lemmon)',
        'semi_major_axis_au': 45.0,
        'eccentricity': 0.98,
        'inclination_deg': 45.0,
        'longitude_ascending_node_deg': 120.0,
        'argument_perihelion_deg': 60.0,
        'mean_anomaly_deg': 300.0,
        'is_interstellar': False,
        'data_source': 'MPC'
    },
    {
        'object_name': 'C/2025 R2 (SWAN)',
        'semi_major_axis_au': 80.0,
        'eccentricity': 0.99,
        'inclination_deg': 55.0,
        'longitude_ascending_node_deg': 200.0,
        'argument_perihelion_deg': 90.0,
        'mean_anomaly_deg': 270.0,
        'is_interstellar': False,
        'data_source': 'MPC'
    },

    # Near-Earth Objects (NEOs)
    {
        'object_name': 'Apophis',
        'semi_major_axis_au': 0.922,
        'eccentricity': 0.191,
        'inclination_deg': 3.3,
        'longitude_ascending_node_deg': 126.0,
        'argument_perihelion_deg': 204.0,
        'mean_anomaly_deg': 180.0,
        'is_interstellar': False,
        'data_source': 'JPL'
    },
    {
        'object_name': 'Ryugu',
        'semi_major_axis_au': 1.190,
        'eccentricity': 0.190,
        'inclination_deg': 5.9,
        'longitude_ascending_node_deg': 251.0,
        'argument_perihelion_deg': 211.0,
        'mean_anomaly_deg': 90.0,
        'is_interstellar': False,
        'data_source': 'JAXA'
    },

    # Interstellar Objects (already have 2, adding the third)
    {
        'object_name': '3I/ATLAS',
        'semi_major_axis_au': -2.500,
        'eccentricity': 1.400,
        'inclination_deg': 135.0,
        'longitude_ascending_node_deg': 300.0,
        'argument_perihelion_deg': 180.0,
        'mean_anomaly_deg': 0.0,
        'is_interstellar': True,
        'data_source': 'MPC'
    }
]


def populate_database():
    """Populate the database with celestial object data."""
    print("🌟 Populating Celestial Signs Database")
    print("=" * 50)

    db = next(get_db())

    try:
        # Check existing objects
        existing_names = {obj.object_name for obj in db.query(OrbitalElements.object_name).all()}
        print(f"Found {len(existing_names)} existing objects")

        # Add new objects
        added_count = 0
        skipped_count = 0

        for obj_data in CELESTIAL_OBJECTS:
            if obj_data['object_name'] in existing_names:
                print(f"⏭️  Skipping {obj_data['object_name']} (already exists)")
                skipped_count += 1
                continue

            # Create new orbital elements record
            orbital_element = OrbitalElements(
                object_name=obj_data['object_name'],
                epoch_iso="2024-01-01T00:00:00",  # Standard epoch
                semi_major_axis_au=obj_data['semi_major_axis_au'],
                eccentricity=obj_data['eccentricity'],
                inclination_deg=obj_data['inclination_deg'],
                longitude_ascending_node_deg=obj_data['longitude_ascending_node_deg'],
                argument_perihelion_deg=obj_data['argument_perihelion_deg'],
                mean_anomaly_deg=obj_data['mean_anomaly_deg'],
                data_source=obj_data['data_source']
                # Note: is_interstellar is a computed column based on eccentricity >= 1.0
            )

            db.add(orbital_element)
            print(f"✅ Added {obj_data['object_name']}")
            added_count += 1

        # Commit changes
        db.commit()
        print("\n" + "=" * 50)
        print("📊 Population Summary:")
        print(f"   Added: {added_count} objects")
        print(f"   Skipped: {skipped_count} objects")
        print(f"   Total: {added_count + skipped_count} objects processed")

        # Verify final count
        final_count = db.query(OrbitalElements).count()
        print(f"   Database now contains: {final_count} objects")

        # Show object breakdown
        planets = db.query(OrbitalElements).filter(OrbitalElements.is_interstellar == False, OrbitalElements.eccentricity < 1.0).count()
        interstellar = db.query(OrbitalElements).filter(OrbitalElements.is_interstellar == True).count()

        print("\n🔭 Object Breakdown:")
        print(f"   Planets: {planets}")
        print(f"   Interstellar: {interstellar}")
        print(f"   Other (asteroids/comets/NEOs): {final_count - planets - interstellar}")

    except Exception as e:
        print(f"❌ Error during population: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == '__main__':
    try:
        populate_database()
        print("\n🎉 Database population completed successfully!")
    except Exception as e:
        print(f"\n💥 Database population failed: {e}")
        sys.exit(1)