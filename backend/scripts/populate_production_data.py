"""
Production Data Population Script
Populates feast days and natural disaster data in Railway production database
Run via Railway CLI: railway run python scripts/populate_production_data.py
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Import models
from app.models.theological import FeastDay
from app.models.events import VolcanicActivity, Hurricane, Tsunami

# Get database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def populate_feast_days(db):
    """Populate feast days for 2020-2030 using Hebrew calendar calculations"""
    print("Populating feast days...")
    
    from app.integrations.hebrew_calendar import HebrewCalendarCalculator
    
    calculator = HebrewCalendarCalculator()
    years_to_populate = range(2020, 2031)
    
    total_added = 0
    
    for gregorian_year in years_to_populate:
        feast_days = calculator.calculate_feast_days(gregorian_year)
        
        for feast in feast_days:
            # Check if already exists
            existing = db.query(FeastDay).filter(
                FeastDay.name == feast['name'],
                FeastDay.feast_date == feast['date']
            ).first()
            
            if not existing:
                feast_day = FeastDay(
                    name=feast['name'],
                    feast_date=feast['date'],
                    feast_type=feast['type'],
                    duration_days=feast.get('duration', 1),
                    significance=feast.get('significance', 'Major biblical feast day'),
                    description=feast.get('description', '')
                )
                db.add(feast_day)
                total_added += 1
    
    db.commit()
    print(f"✅ Added {total_added} feast days")
    return total_added


def populate_volcanic_data(db):
    """Populate sample volcanic eruption data"""
    print("Populating volcanic activity data...")
    
    volcanic_events = [
        {
            'event_date': datetime(1980, 5, 18),
            'volcano_name': 'Mount St. Helens',
            'vei': 5,
            'latitude': 46.1914,
            'longitude': -122.1956,
            'fatalities': 57,
            'description': 'Catastrophic eruption in Washington State'
        },
        {
            'event_date': datetime(2010, 4, 14),
            'volcano_name': 'Eyjafjallajökull',
            'vei': 4,
            'latitude': 63.63,
            'longitude': -19.62,
            'fatalities': 0,
            'description': 'Eruption disrupted European air travel'
        },
        {
            'event_date': datetime(1991, 6, 15),
            'volcano_name': 'Mount Pinatubo',
            'vei': 6,
            'latitude': 15.13,
            'longitude': 120.35,
            'fatalities': 847,
            'description': 'Second largest eruption of 20th century'
        },
        {
            'event_date': datetime(2018, 5, 3),
            'volcano_name': 'Kilauea',
            'vei': 3,
            'latitude': 19.4069,
            'longitude': -155.2834,
            'fatalities': 0,
            'description': 'Lower Puna eruption in Hawaii'
        },
        {
            'event_date': datetime(2021, 9, 19),
            'volcano_name': 'Cumbre Vieja',
            'vei': 3,
            'latitude': 28.5719,
            'longitude': -17.8403,
            'fatalities': 1,
            'description': 'Eruption on La Palma, Canary Islands'
        },
        {
            'event_date': datetime(2022, 1, 15),
            'volcano_name': 'Hunga Tonga',
            'vei': 5,
            'latitude': -20.536,
            'longitude': -175.382,
            'fatalities': 4,
            'description': 'Massive submarine eruption and tsunami'
        },
        {
            'event_date': datetime(1883, 8, 27),
            'volcano_name': 'Krakatoa',
            'vei': 6,
            'latitude': -6.102,
            'longitude': 105.423,
            'fatalities': 36000,
            'description': 'Catastrophic eruption heard globally'
        }
    ]
    
    total_added = 0
    for event in volcanic_events:
        existing = db.query(VolcanicActivity).filter(
            VolcanicActivity.volcano_name == event['volcano_name'],
            VolcanicActivity.event_date == event['event_date']
        ).first()
        
        if not existing:
            volcanic = VolcanicActivity(**event)
            db.add(volcanic)
            total_added += 1
    
    db.commit()
    print(f"✅ Added {total_added} volcanic events")
    return total_added


def populate_hurricane_data(db):
    """Populate sample hurricane/tropical storm data"""
    print("Populating hurricane data...")
    
    hurricanes = [
        {
            'event_date': datetime(2005, 8, 29),
            'name': 'Katrina',
            'category': 5,
            'max_wind_speed_kmh': 280,
            'peak_latitude': 25.9,
            'peak_longitude': -89.6,
            'fatalities': 1833,
            'description': 'Devastating Category 5 hurricane'
        },
        {
            'event_date': datetime(2017, 9, 20),
            'name': 'Maria',
            'category': 5,
            'max_wind_speed_kmh': 280,
            'peak_latitude': 18.2,
            'peak_longitude': -66.5,
            'fatalities': 2975,
            'description': 'Catastrophic damage to Puerto Rico'
        },
        {
            'event_date': datetime(2022, 9, 28),
            'name': 'Ian',
            'category': 5,
            'max_wind_speed_kmh': 260,
            'peak_latitude': 26.5,
            'peak_longitude': -82.3,
            'fatalities': 161,
            'description': 'Major Florida landfall'
        },
        {
            'event_date': datetime(2012, 10, 29),
            'name': 'Sandy',
            'category': 3,
            'max_wind_speed_kmh': 185,
            'peak_latitude': 40.5,
            'peak_longitude': -73.9,
            'fatalities': 233,
            'description': 'New York and New Jersey impact'
        },
        {
            'event_date': datetime(2019, 9, 1),
            'name': 'Dorian',
            'category': 5,
            'max_wind_speed_kmh': 295,
            'peak_latitude': 26.5,
            'peak_longitude': -78.3,
            'fatalities': 84,
            'description': 'Devastating Bahamas impact'
        },
        {
            'event_date': datetime(2020, 8, 27),
            'name': 'Laura',
            'category': 4,
            'max_wind_speed_kmh': 240,
            'peak_latitude': 29.8,
            'peak_longitude': -93.3,
            'fatalities': 77,
            'description': 'Louisiana and Texas impact'
        },
        {
            'event_date': datetime(2018, 10, 10),
            'name': 'Michael',
            'category': 5,
            'max_wind_speed_kmh': 260,
            'peak_latitude': 30.2,
            'peak_longitude': -85.4,
            'fatalities': 74,
            'description': 'Florida Panhandle catastrophe'
        },
        {
            'event_date': datetime(2013, 11, 8),
            'name': 'Haiyan',
            'category': 5,
            'max_wind_speed_kmh': 315,
            'peak_latitude': 11.0,
            'peak_longitude': 125.0,
            'fatalities': 6352,
            'description': 'Strongest typhoon in Philippines'
        }
    ]
    
    total_added = 0
    for event in hurricanes:
        existing = db.query(Hurricane).filter(
            Hurricane.name == event['name'],
            Hurricane.event_date == event['event_date']
        ).first()
        
        if not existing:
            hurricane = Hurricane(**event)
            db.add(hurricane)
            total_added += 1
    
    db.commit()
    print(f"✅ Added {total_added} hurricanes")
    return total_added


def populate_tsunami_data(db):
    """Populate sample tsunami event data"""
    print("Populating tsunami data...")
    
    tsunamis = [
        {
            'event_date': datetime(2004, 12, 26),
            'cause': 'Earthquake',
            'wave_height_m': 30.0,
            'source_latitude': 3.295,
            'source_longitude': 95.982,
            'fatalities': 227898,
            'description': 'Indian Ocean tsunami - deadliest in history'
        },
        {
            'event_date': datetime(2011, 3, 11),
            'cause': 'Earthquake',
            'wave_height_m': 40.5,
            'source_latitude': 38.297,
            'source_longitude': 142.372,
            'fatalities': 18500,
            'description': 'Tōhoku earthquake and tsunami - Fukushima disaster'
        },
        {
            'event_date': datetime(1960, 5, 22),
            'cause': 'Earthquake',
            'wave_height_m': 25.0,
            'source_latitude': -38.24,
            'source_longitude': -73.05,
            'fatalities': 1655,
            'description': 'Chilean tsunami from 9.5 magnitude earthquake'
        },
        {
            'event_date': datetime(2018, 9, 28),
            'cause': 'Earthquake',
            'wave_height_m': 11.3,
            'source_latitude': -0.178,
            'source_longitude': 119.840,
            'fatalities': 4340,
            'description': 'Sulawesi tsunami in Indonesia'
        },
        {
            'event_date': datetime(1755, 11, 1),
            'cause': 'Earthquake',
            'wave_height_m': 20.0,
            'source_latitude': 36.0,
            'source_longitude': -11.0,
            'fatalities': 60000,
            'description': 'Great Lisbon earthquake and tsunami'
        },
        {
            'event_date': datetime(1946, 4, 1),
            'cause': 'Earthquake',
            'wave_height_m': 35.0,
            'source_latitude': 53.0,
            'source_longitude': -163.0,
            'fatalities': 165,
            'description': 'Aleutian Islands tsunami - led to Pacific warning system'
        },
        {
            'event_date': datetime(1998, 7, 17),
            'cause': 'Submarine Landslide',
            'wave_height_m': 15.0,
            'source_latitude': -2.9,
            'source_longitude': 141.9,
            'fatalities': 2183,
            'description': 'Papua New Guinea tsunami from landslide'
        },
        {
            'event_date': datetime(2009, 9, 29),
            'cause': 'Earthquake',
            'wave_height_m': 14.0,
            'source_latitude': -15.489,
            'source_longitude': -172.095,
            'fatalities': 189,
            'description': 'Samoa tsunami'
        },
        {
            'event_date': datetime(1964, 3, 28),
            'cause': 'Earthquake',
            'wave_height_m': 67.0,
            'source_latitude': 61.05,
            'source_longitude': -147.48,
            'fatalities': 139,
            'description': 'Alaska Good Friday earthquake tsunami - highest recorded wave'
        },
        {
            'event_date': datetime(2022, 1, 15),
            'cause': 'Volcanic Eruption',
            'wave_height_m': 20.0,
            'source_latitude': -20.536,
            'source_longitude': -175.382,
            'fatalities': 4,
            'description': 'Hunga Tonga volcanic tsunami'
        }
    ]
    
    total_added = 0
    for event in tsunamis:
        existing = db.query(Tsunami).filter(
            Tsunami.event_date == event['event_date'],
            Tsunami.source_latitude == event['source_latitude'],
            Tsunami.source_longitude == event['source_longitude']
        ).first()
        
        if not existing:
            tsunami = Tsunami(**event)
            db.add(tsunami)
            total_added += 1
    
    db.commit()
    print(f"✅ Added {total_added} tsunamis")
    return total_added


def check_existing_data(db):
    """Check what data already exists in production"""
    print("\n" + "="*60)
    print("CHECKING EXISTING DATA IN PRODUCTION")
    print("="*60 + "\n")
    
    feast_count = db.query(FeastDay).count()
    volcanic_count = db.query(VolcanicActivity).count()
    hurricane_count = db.query(Hurricane).count()
    tsunami_count = db.query(Tsunami).count()
    
    print(f"Feast Days: {feast_count} records")
    print(f"Volcanic Activity: {volcanic_count} records")
    print(f"Hurricanes: {hurricane_count} records")
    print(f"Tsunamis: {tsunami_count} records")
    print()
    
    return {
        'feast_days': feast_count,
        'volcanic': volcanic_count,
        'hurricanes': hurricane_count,
        'tsunamis': tsunami_count
    }


def main():
    """Main population function"""
    print("\n" + "="*60)
    print("PRODUCTION DATA POPULATION SCRIPT")
    print("="*60 + "\n")
    
    db = SessionLocal()
    
    try:
        # Check existing data
        existing = check_existing_data(db)
        
        # Populate missing data
        print("="*60)
        print("POPULATING MISSING DATA")
        print("="*60 + "\n")
        
        totals = {}
        
        if existing['feast_days'] == 0:
            totals['feast_days'] = populate_feast_days(db)
        else:
            print(f"⏭️  Skipping feast days (already populated: {existing['feast_days']} records)")
            totals['feast_days'] = 0
        
        if existing['volcanic'] == 0:
            totals['volcanic'] = populate_volcanic_data(db)
        else:
            print(f"⏭️  Skipping volcanic data (already populated: {existing['volcanic']} records)")
            totals['volcanic'] = 0
        
        if existing['hurricanes'] == 0:
            totals['hurricanes'] = populate_hurricane_data(db)
        else:
            print(f"⏭️  Skipping hurricane data (already populated: {existing['hurricanes']} records)")
            totals['hurricanes'] = 0
        
        if existing['tsunamis'] == 0:
            totals['tsunamis'] = populate_tsunami_data(db)
        else:
            print(f"⏭️  Skipping tsunami data (already populated: {existing['tsunamis']} records)")
            totals['tsunamis'] = 0
        
        # Final summary
        print("\n" + "="*60)
        print("POPULATION COMPLETE")
        print("="*60 + "\n")
        
        print(f"✅ Total feast days added: {totals['feast_days']}")
        print(f"✅ Total volcanic events added: {totals['volcanic']}")
        print(f"✅ Total hurricanes added: {totals['hurricanes']}")
        print(f"✅ Total tsunamis added: {totals['tsunamis']}")
        print(f"\n📊 Grand total: {sum(totals.values())} new records\n")
        
        # Verify final counts
        final = check_existing_data(db)
        
        print("="*60)
        print("READY FOR PATTERN DETECTION! 🎉")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
