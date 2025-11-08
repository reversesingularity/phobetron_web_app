"""
Seed earthquake data for testing and demonstration.

Creates sample earthquake records with realistic data.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from app.db.session import engine
from app.models.events import Earthquakes
from app.models.alerts import Alerts
import random


def create_earthquakes(db: Session):
    """Create sample earthquake records."""
    print("Creating sample earthquakes...")
    
    # Check if earthquakes already exist
    existing = db.query(Earthquakes).count()
    if existing > 0:
        print(f"✓ Earthquakes already exist ({existing} found), skipping creation")
        return
    
    # Sample earthquake data (major recent earthquakes)
    earthquakes_data = [
        {
            'event_id': 'EQ2024001',
            'event_time': datetime(2024, 1, 1, 6, 10, 0),
            'magnitude': 7.5,
            'magnitude_type': 'Mw',
            'latitude': 37.18,
            'longitude': 137.25,
            'depth_km': 10.0,
            'region': 'Noto Peninsula, Japan',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2023001',
            'event_time': datetime(2023, 2, 6, 1, 17, 36),
            'magnitude': 7.8,
            'magnitude_type': 'Mw',
            'latitude': 37.226,
            'longitude': 37.014,
            'depth_km': 17.9,
            'region': 'Türkiye-Syria Border Region',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2023002',
            'event_time': datetime(2023, 2, 6, 10, 24, 49),
            'magnitude': 7.5,
            'magnitude_type': 'Mw',
            'latitude': 38.024,
            'longitude': 37.196,
            'depth_km': 10.0,
            'region': 'Türkiye',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2022001',
            'event_time': datetime(2022, 9, 19, 18, 5, 0),
            'magnitude': 7.6,
            'magnitude_type': 'Mw',
            'latitude': 18.432,
            'longitude': -103.166,
            'depth_km': 15.0,
            'region': 'Michoacán, Mexico',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2021001',
            'event_time': datetime(2021, 8, 14, 12, 29, 8),
            'magnitude': 7.2,
            'magnitude_type': 'Mw',
            'latitude': 18.434,
            'longitude': -73.48,
            'depth_km': 10.0,
            'region': 'Haiti',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2020001',
            'event_time': datetime(2020, 10, 30, 11, 51, 27),
            'magnitude': 7.0,
            'magnitude_type': 'Mw',
            'latitude': 37.896,
            'longitude': 26.79,
            'depth_km': 21.0,
            'region': 'Samos, Greece',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2019001',
            'event_time': datetime(2019, 11, 26, 2, 54, 0),
            'magnitude': 6.4,
            'magnitude_type': 'Mw',
            'latitude': 41.51,
            'longitude': 19.52,
            'depth_km': 20.0,
            'region': 'Albania',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2018001',
            'event_time': datetime(2018, 9, 28, 10, 2, 44),
            'magnitude': 7.5,
            'magnitude_type': 'Mw',
            'latitude': -0.178,
            'longitude': 119.846,
            'depth_km': 10.0,
            'region': 'Sulawesi, Indonesia',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2017001',
            'event_time': datetime(2017, 9, 19, 18, 14, 38),
            'magnitude': 7.1,
            'magnitude_type': 'Mw',
            'latitude': 18.4,
            'longitude': -98.72,
            'depth_km': 57.0,
            'region': 'Puebla, Mexico',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2016001',
            'event_time': datetime(2016, 11, 13, 11, 2, 56),
            'magnitude': 7.8,
            'magnitude_type': 'Mw',
            'latitude': -42.737,
            'longitude': 173.054,
            'depth_km': 15.1,
            'region': 'Kaikōura, New Zealand',
            'data_source': 'USGS'
        },
        # Additional smaller but significant earthquakes
        {
            'event_id': 'EQ2024002',
            'event_time': datetime(2024, 4, 2, 23, 58, 0),
            'magnitude': 4.8,
            'magnitude_type': 'Ml',
            'latitude': 40.7,
            'longitude': -74.0,
            'depth_km': 5.0,
            'region': 'New Jersey, USA',
            'data_source': 'USGS'
        },
        {
            'event_id': 'EQ2023003',
            'event_time': datetime(2023, 12, 18, 23, 59, 0),
            'magnitude': 6.2,
            'magnitude_type': 'Mw',
            'latitude': 36.7,
            'longitude': 103.3,
            'depth_km': 10.0,
            'region': 'Gansu, China',
            'data_source': 'USGS'
        }
    ]
    
    for eq_data in earthquakes_data:
        # Create PostGIS point from lat/lon
        point = Point(eq_data['longitude'], eq_data['latitude'])
        location = from_shape(point, srid=4326)
        
        earthquake = Earthquakes(
            event_id=eq_data['event_id'],
            event_time=eq_data['event_time'],
            magnitude=eq_data['magnitude'],
            magnitude_type=eq_data['magnitude_type'],
            location=location,
            depth_km=eq_data['depth_km'],
            region=eq_data['region'],
            data_source=eq_data['data_source']
        )
        db.add(earthquake)
        print(f"✓ Created {eq_data['region']} M{eq_data['magnitude']}")
    
    db.commit()
    print(f"✅ Created {len(earthquakes_data)} earthquake records")


def create_alerts(db: Session):
    """Create sample alert records."""
    print("\nCreating sample alerts...")
    
    # Check if alerts already exist
    existing = db.query(Alerts).count()
    if existing > 0:
        print(f"✓ Alerts already exist ({existing} found), skipping creation")
        return
    
    alerts_data = [
        {
            'alert_type': 'EARTHQUAKE',
            'severity': 'HIGH',
            'title': 'Major Earthquake - Türkiye-Syria Border',
            'description': 'M7.8 earthquake struck Türkiye-Syria border region. Significant damage expected.',
            'related_object_name': 'Türkiye-Syria Border Region',
            'status': 'RESOLVED',
            'triggered_at': datetime(2023, 2, 6, 1, 17, 36),
            'resolved_at': datetime(2023, 2, 7, 12, 0, 0),
            'trigger_data': {
                'magnitude': 7.8,
                'depth_km': 17.9,
                'casualties_estimated': 50000
            }
        },
        {
            'alert_type': 'SOLAR_FLARE',
            'severity': 'MEDIUM',
            'title': 'X-Class Solar Flare Detected',
            'description': 'X2.8 solar flare detected. Minor geomagnetic storm expected in 48-72 hours.',
            'related_object_name': 'Sun - Active Region 3576',
            'status': 'ACTIVE',
            'triggered_at': datetime.now() - timedelta(days=2),
            'trigger_data': {
                'flare_class': 'X2.8',
                'kp_index_forecast': 6
            }
        },
        {
            'alert_type': 'GEOMAGNETIC_STORM',
            'severity': 'MEDIUM',
            'title': 'Geomagnetic Storm Watch',
            'description': 'G2 (Moderate) geomagnetic storm watch in effect. Aurora visible at high latitudes.',
            'related_object_name': 'Global - High Latitudes',
            'status': 'ACTIVE',
            'triggered_at': datetime.now() - timedelta(hours=6),
            'trigger_data': {
                'kp_index': 6,
                'storm_level': 'G2',
                'aurora_visible_latitude': 50
            }
        }
    ]
    
    for alert_data in alerts_data:
        alert = Alerts(**alert_data)
        db.add(alert)
        print(f"✓ Created {alert_data['title']}")
    
    db.commit()
    print(f"✅ Created {len(alerts_data)} alert records")


def main():
    """Run all seed functions."""
    print("=== Seeding Events Data ===\n")
    
    with Session(engine) as db:
        create_earthquakes(db)
        create_alerts(db)
    
    print("\n=== Seed Complete ===")
    print("Database now contains:")
    print("  - Sample earthquake records")
    print("  - Sample alert records")
    print("\nYou can now view this data in the web application!")


if __name__ == "__main__":
    main()
