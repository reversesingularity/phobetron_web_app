"""
Hurricane Data Collection Script
Fetches hurricane/cyclone data from NOAA and other sources
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
from app.models.events import Hurricane
from geoalchemy2.shape import from_shape
from shapely.geometry import Point


def add_sample_hurricane_data(db: Session) -> int:
    """Add sample hurricane data for testing"""
    print("🌀 Adding sample hurricane data...")
    
    sample_hurricanes = [
        {
            'storm_name': 'Katrina',
            'basin': 'Atlantic',
            'storm_type': 'Hurricane',
            'season': 2005,
            'formation_date': datetime(2005, 8, 23),
            'dissipation_date': datetime(2005, 8, 31),
            'latitude': 29.25,
            'longitude': -89.60,
            'max_sustained_winds_kph': 280,
            'min_central_pressure_hpa': 902,
            'category': 5,
            'ace_index': 14.4,
            'fatalities': 1833,
            'damages_usd_millions': 125000,
            'affected_regions': ['Louisiana', 'Mississippi', 'Alabama', 'Florida'],
            'landfall_locations': ['Buras, Louisiana', 'Gulfport, Mississippi'],
            'notes': 'One of deadliest hurricanes in US history',
            'data_source': 'NOAA NHC'
        },
        {
            'storm_name': 'Patricia',
            'basin': 'East Pacific',
            'storm_type': 'Hurricane',
            'season': 2015,
            'formation_date': datetime(2015, 10, 20),
            'dissipation_date': datetime(2015, 10, 24),
            'latitude': 19.00,
            'longitude': -105.00,
            'max_sustained_winds_kph': 345,
            'min_central_pressure_hpa': 872,
            'category': 5,
            'ace_index': 9.9,
            'fatalities': 13,
            'damages_usd_millions': 462,
            'affected_regions': ['Mexico', 'Jalisco', 'Colima', 'Nayarit'],
            'landfall_locations': ['Cuixmala, Jalisco'],
            'notes': 'Strongest hurricane ever recorded in Western Hemisphere',
            'data_source': 'NOAA NHC'
        },
        {
            'storm_name': 'Haiyan (Yolanda)',
            'basin': 'West Pacific',
            'storm_type': 'Typhoon',
            'season': 2013,
            'formation_date': datetime(2013, 11, 3),
            'dissipation_date': datetime(2013, 11, 11),
            'latitude': 11.16,
            'longitude': 125.23,
            'max_sustained_winds_kph': 315,
            'min_central_pressure_hpa': 895,
            'category': 5,
            'ace_index': 48.9,
            'fatalities': 6300,
            'damages_usd_millions': 2980,
            'affected_regions': ['Philippines', 'Vietnam', 'China'],
            'landfall_locations': ['Guiuan, Eastern Samar', 'Tolosa, Leyte'],
            'notes': 'One of deadliest Philippine typhoons on record',
            'data_source': 'JMA'
        },
        {
            'storm_name': 'Maria',
            'basin': 'Atlantic',
            'storm_type': 'Hurricane',
            'season': 2017,
            'formation_date': datetime(2017, 9, 16),
            'dissipation_date': datetime(2017, 10, 2),
            'latitude': 18.04,
            'longitude': -66.62,
            'max_sustained_winds_kph': 280,
            'min_central_pressure_hpa': 908,
            'category': 5,
            'ace_index': 31.6,
            'fatalities': 3059,
            'damages_usd_millions': 91610,
            'affected_regions': ['Puerto Rico', 'Dominica', 'US Virgin Islands'],
            'landfall_locations': ['Yabucoa, Puerto Rico', 'Dominica'],
            'notes': 'Worst natural disaster in Puerto Rico history',
            'data_source': 'NOAA NHC'
        },
        {
            'storm_name': 'Andrew',
            'basin': 'Atlantic',
            'storm_type': 'Hurricane',
            'season': 1992,
            'formation_date': datetime(1992, 8, 16),
            'dissipation_date': datetime(1992, 8, 28),
            'latitude': 25.47,
            'longitude': -80.48,
            'max_sustained_winds_kph': 280,
            'min_central_pressure_hpa': 922,
            'category': 5,
            'ace_index': 17.6,
            'fatalities': 65,
            'damages_usd_millions': 27300,
            'affected_regions': ['Bahamas', 'Florida', 'Louisiana'],
            'landfall_locations': ['Homestead, Florida', 'Morgan City, Louisiana'],
            'notes': 'Led to creation of Category 6 discussion',
            'data_source': 'NOAA NHC'
        },
        {
            'storm_name': 'Mitch',
            'basin': 'Atlantic',
            'storm_type': 'Hurricane',
            'season': 1998,
            'formation_date': datetime(1998, 10, 22),
            'dissipation_date': datetime(1998, 11, 5),
            'latitude': 16.0,
            'longitude': -86.0,
            'max_sustained_winds_kph': 285,
            'min_central_pressure_hpa': 905,
            'category': 5,
            'ace_index': 26.3,
            'fatalities': 11000,
            'damages_usd_millions': 6200,
            'affected_regions': ['Honduras', 'Nicaragua', 'Guatemala', 'El Salvador'],
            'landfall_locations': ['Honduras'],
            'notes': 'Deadliest Atlantic hurricane since 1780',
            'data_source': 'NOAA NHC'
        },
        {
            'storm_name': 'Ian',
            'basin': 'Atlantic',
            'storm_type': 'Hurricane',
            'season': 2022,
            'formation_date': datetime(2022, 9, 23),
            'dissipation_date': datetime(2022, 10, 1),
            'latitude': 26.65,
            'longitude': -82.31,
            'max_sustained_winds_kph': 250,
            'min_central_pressure_hpa': 936,
            'category': 5,
            'ace_index': 18.9,
            'fatalities': 156,
            'damages_usd_millions': 112900,
            'affected_regions': ['Florida', 'Cuba', 'South Carolina', 'North Carolina'],
            'landfall_locations': ['Cayo Costa, Florida', 'Georgetown, South Carolina'],
            'notes': 'Costliest hurricane in Florida history',
            'data_source': 'NOAA NHC'
        },
        {
            'storm_name': 'Dorian',
            'basin': 'Atlantic',
            'storm_type': 'Hurricane',
            'season': 2019,
            'formation_date': datetime(2019, 8, 24),
            'dissipation_date': datetime(2019, 9, 10),
            'latitude': 26.50,
            'longitude': -77.00,
            'max_sustained_winds_kph': 295,
            'min_central_pressure_hpa': 910,
            'category': 5,
            'ace_index': 22.4,
            'fatalities': 295,
            'damages_usd_millions': 5100,
            'affected_regions': ['Bahamas', 'North Carolina', 'South Carolina', 'Nova Scotia'],
            'landfall_locations': ['Elbow Cay, Bahamas', 'Cape Hatteras, North Carolina'],
            'notes': 'Stalled over Bahamas for 24 hours causing catastrophic damage',
            'data_source': 'NOAA NHC'
        }
    ]
    
    added = 0
    for hurricane_data in sample_hurricanes:
        # Check for duplicates
        existing = db.query(Hurricane).filter(
            Hurricane.storm_name == hurricane_data['storm_name'],
            Hurricane.season == hurricane_data['season']
        ).first()
        
        if existing:
            continue
        
        # Create PostGIS point for peak location
        point = Point(hurricane_data['longitude'], hurricane_data['latitude'])
        
        hurricane = Hurricane(
            storm_name=hurricane_data['storm_name'],
            basin=hurricane_data['basin'],
            storm_type=hurricane_data['storm_type'],
            season=hurricane_data['season'],
            formation_date=hurricane_data['formation_date'],
            dissipation_date=hurricane_data['dissipation_date'],
            peak_location=from_shape(point, srid=4326),
            max_sustained_winds_kph=hurricane_data['max_sustained_winds_kph'],
            min_central_pressure_hpa=hurricane_data['min_central_pressure_hpa'],
            category=hurricane_data['category'],
            ace_index=hurricane_data.get('ace_index'),
            fatalities=hurricane_data.get('fatalities'),
            damages_usd_millions=hurricane_data.get('damages_usd_millions'),
            affected_regions=hurricane_data.get('affected_regions'),
            landfall_locations=hurricane_data.get('landfall_locations'),
            notes=hurricane_data.get('notes'),
            data_source=hurricane_data['data_source']
        )
        
        db.add(hurricane)
        added += 1
    
    db.commit()
    print(f"  ✅ Added {added} sample hurricane records")
    return added


def main():
    """Main execution function"""
    db = next(get_db())
    
    try:
        # Add sample data
        sample_count = add_sample_hurricane_data(db)
        print(f"\n🎉 Total: {sample_count} hurricane records added")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
