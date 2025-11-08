"""
Tsunami Data Collection Script
Fetches tsunami event data from NOAA NGDC and other sources
"""

import requests
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.events import Tsunami
from geoalchemy2.shape import from_shape
from shapely.geometry import Point


def add_sample_tsunami_data(db: Session) -> int:
    """Add sample tsunami data for testing"""
    print("🌊 Adding sample tsunami data...")
    
    sample_tsunamis = [
        {
            'event_date': datetime(2011, 3, 11, 14, 46),
            'latitude': 38.32,
            'longitude': 142.37,
            'source_type': 'EARTHQUAKE',
            'earthquake_magnitude': 9.1,
            'max_wave_height_m': 40.5,
            'max_runup_m': 39.0,
            'affected_regions': ['Japan', 'Tohoku', 'Fukushima', 'Miyagi', 'Iwate'],
            'fatalities': 15894,
            'damages_usd_millions': 235000,
            'intensity_scale': 10,
            'travel_time_minutes': 0,
            'warning_issued': True,
            'notes': '2011 Tōhoku earthquake and tsunami. Triggered Fukushima nuclear disaster.',
            'data_source': 'NOAA NGDC'
        },
        {
            'event_date': datetime(2004, 12, 26, 7, 59),
            'latitude': 3.30,
            'longitude': 95.78,
            'source_type': 'EARTHQUAKE',
            'earthquake_magnitude': 9.3,
            'max_wave_height_m': 30.0,
            'max_runup_m': 51.0,
            'affected_regions': ['Indonesia', 'Sri Lanka', 'India', 'Thailand', 'Somalia', 'Maldives'],
            'fatalities': 227898,
            'damages_usd_millions': 10000,
            'intensity_scale': 12,
            'travel_time_minutes': 15,
            'warning_issued': False,
            'notes': 'Indian Ocean earthquake and tsunami. Deadliest tsunami in recorded history.',
            'data_source': 'NOAA NGDC'
        },
        {
            'event_date': datetime(1958, 7, 9, 22, 15),
            'latitude': 58.65,
            'longitude': -137.09,
            'source_type': 'LANDSLIDE',
            'earthquake_magnitude': 8.3,
            'max_wave_height_m': 524.0,
            'max_runup_m': 524.0,
            'affected_regions': ['Alaska', 'Lituya Bay'],
            'fatalities': 5,
            'damages_usd_millions': None,
            'intensity_scale': 7,
            'travel_time_minutes': 0,
            'warning_issued': False,
            'notes': 'Lituya Bay megatsunami. Tallest wave ever recorded.',
            'data_source': 'USGS'
        },
        {
            'event_date': datetime(1868, 8, 13, 21, 30),
            'latitude': -18.50,
            'longitude': -70.35,
            'source_type': 'EARTHQUAKE',
            'earthquake_magnitude': 9.0,
            'max_wave_height_m': 21.0,
            'max_runup_m': 18.0,
            'affected_regions': ['Peru', 'Chile', 'Arica'],
            'fatalities': 25000,
            'damages_usd_millions': None,
            'intensity_scale': 9,
            'travel_time_minutes': 60,
            'warning_issued': False,
            'notes': 'Arica earthquake and tsunami. One of deadliest Pacific tsunamis.',
            'data_source': 'Historical'
        },
        {
            'event_date': datetime(1755, 11, 1, 9, 40),
            'latitude': 36.0,
            'longitude': -10.0,
            'source_type': 'EARTHQUAKE',
            'earthquake_magnitude': 8.7,
            'max_wave_height_m': 15.0,
            'max_runup_m': 20.0,
            'affected_regions': ['Portugal', 'Spain', 'Morocco', 'Lisbon'],
            'fatalities': 60000,
            'damages_usd_millions': None,
            'intensity_scale': 9,
            'travel_time_minutes': 40,
            'warning_issued': False,
            'notes': 'Great Lisbon earthquake and tsunami. Changed European philosophy and theology.',
            'data_source': 'Historical'
        },
        {
            'event_date': datetime(2018, 9, 28, 18, 2),
            'latitude': -0.26,
            'longitude': 119.85,
            'source_type': 'EARTHQUAKE',
            'earthquake_magnitude': 7.5,
            'max_wave_height_m': 6.0,
            'max_runup_m': 11.3,
            'affected_regions': ['Indonesia', 'Sulawesi', 'Palu'],
            'fatalities': 4340,
            'damages_usd_millions': 911,
            'intensity_scale': 8,
            'travel_time_minutes': 3,
            'warning_issued': True,
            'notes': 'Sulawesi earthquake and tsunami. Warning cancelled too early.',
            'data_source': 'NOAA NGDC'
        },
        {
            'event_date': datetime(1946, 4, 1, 12, 28),
            'latitude': 52.75,
            'longitude': -163.50,
            'source_type': 'EARTHQUAKE',
            'earthquake_magnitude': 8.6,
            'max_wave_height_m': 35.0,
            'max_runup_m': 42.0,
            'affected_regions': ['Alaska', 'Hawaii', 'Aleutian Islands'],
            'fatalities': 165,
            'damages_usd_millions': 26,
            'intensity_scale': 9,
            'travel_time_minutes': 270,
            'warning_issued': False,
            'notes': 'Aleutian Islands earthquake. Led to creation of Pacific Tsunami Warning System.',
            'data_source': 'NOAA NGDC'
        },
        {
            'event_date': datetime(1960, 5, 22, 19, 11),
            'latitude': -38.24,
            'longitude': -73.05,
            'source_type': 'EARTHQUAKE',
            'earthquake_magnitude': 9.5,
            'max_wave_height_m': 25.0,
            'max_runup_m': 25.0,
            'affected_regions': ['Chile', 'Hawaii', 'Japan', 'Philippines', 'New Zealand'],
            'fatalities': 6000,
            'damages_usd_millions': 550,
            'intensity_scale': 10,
            'travel_time_minutes': 960,
            'warning_issued': True,
            'notes': 'Great Chilean earthquake. Most powerful earthquake ever recorded.',
            'data_source': 'NOAA NGDC'
        },
        {
            'event_date': datetime(1883, 8, 27, 10, 2),
            'latitude': -6.10,
            'longitude': 105.42,
            'source_type': 'VOLCANIC',
            'earthquake_magnitude': None,
            'max_wave_height_m': 41.0,
            'max_runup_m': 40.0,
            'affected_regions': ['Indonesia', 'Java', 'Sumatra'],
            'fatalities': 36417,
            'damages_usd_millions': None,
            'intensity_scale': 10,
            'travel_time_minutes': 30,
            'warning_issued': False,
            'notes': 'Krakatoa volcanic eruption and tsunami. Sound heard 4800 km away.',
            'data_source': 'Historical'
        },
        {
            'event_date': datetime(1992, 9, 2, 0, 19),
            'latitude': 11.34,
            'longitude': -86.68,
            'source_type': 'EARTHQUAKE',
            'earthquake_magnitude': 7.7,
            'max_wave_height_m': 10.0,
            'max_runup_m': 10.0,
            'affected_regions': ['Nicaragua'],
            'fatalities': 170,
            'damages_usd_millions': None,
            'intensity_scale': 8,
            'travel_time_minutes': 45,
            'warning_issued': False,
            'notes': 'Nicaragua earthquake. Slow earthquake generated unexpectedly large tsunami.',
            'data_source': 'NOAA NGDC'
        }
    ]
    
    added = 0
    for tsunami_data in sample_tsunamis:
        # Check for duplicates
        existing = db.query(Tsunami).filter(
            Tsunami.event_date == tsunami_data['event_date'],
            Tsunami.source_type == tsunami_data['source_type']
        ).first()
        
        if existing:
            continue
        
        # Create PostGIS point for source location
        point = Point(tsunami_data['longitude'], tsunami_data['latitude'])
        
        tsunami = Tsunami(
            event_date=tsunami_data['event_date'],
            source_location=from_shape(point, srid=4326),
            source_type=tsunami_data['source_type'],
            earthquake_magnitude=tsunami_data.get('earthquake_magnitude'),
            max_wave_height_m=tsunami_data.get('max_wave_height_m'),
            max_runup_m=tsunami_data.get('max_runup_m'),
            affected_regions=tsunami_data.get('affected_regions'),
            fatalities=tsunami_data.get('fatalities'),
            damages_usd_millions=tsunami_data.get('damages_usd_millions'),
            intensity_scale=tsunami_data.get('intensity_scale'),
            travel_time_minutes=tsunami_data.get('travel_time_minutes'),
            warning_issued=tsunami_data.get('warning_issued'),
            notes=tsunami_data.get('notes'),
            data_source=tsunami_data['data_source']
        )
        
        db.add(tsunami)
        added += 1
    
    db.commit()
    print(f"  ✅ Added {added} sample tsunami records")
    return added


def main():
    """Main execution function"""
    db = next(get_db())
    
    try:
        # Add sample data
        sample_count = add_sample_tsunami_data(db)
        print(f"\n🎉 Total: {sample_count} tsunami records added")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
