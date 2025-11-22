"""
Volcanic Activity Data Collection Script for GitHub Actions
Fetches volcanic eruption data from Smithsonian Global Volcanism Program
Standalone script - no FastAPI dependencies
"""

import requests
import os
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


# Smithsonian Global Volcanism Program API
GVP_API_BASE = "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows"


def fetch_holocene_volcanoes() -> List[Dict[str, Any]]:
    """Fetch Holocene volcano data from Smithsonian GVP"""
    print("🌋 Fetching volcanic data from Smithsonian Global Volcanism Program...")
    
    params = {
        'service': 'WFS',
        'version': '1.0.0',
        'request': 'GetFeature',
        'typeName': 'GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes',
        'outputFormat': 'json',
        'maxFeatures': 100  # Limit for testing
    }
    
    try:
        response = requests.get(GVP_API_BASE, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        volcanoes = []
        for feature in data.get('features', []):
            props = feature['properties']
            coords = feature['geometry']['coordinates']
            
            # Parse eruption data
            last_eruption = props.get('Last_Eruption_Year')
            if last_eruption and last_eruption != 'Unknown':
                try:
                    eruption_year = int(last_eruption.split()[0])  # Handle ranges like "1980-1985"
                    eruption_date = datetime(eruption_year, 1, 1)
                except (ValueError, AttributeError):
                    eruption_date = None
            else:
                eruption_date = None
            
            volcano_data = {
                'volcano_name': props.get('Volcano_Name', 'Unknown'),
                'country': props.get('Country', 'Unknown'),
                'vei': None,  # VEI not in basic dataset
                'eruption_start': eruption_date,
                'eruption_end': None,
                'longitude': coords[0],
                'latitude': coords[1],
                'eruption_type': props.get('Primary_Volcano_Type', 'Unknown'),
                'data_source': 'Smithsonian GVP'
            }
            
            if eruption_date:  # Only include volcanoes with known eruptions
                volcanoes.append(volcano_data)
        
        print(f"  ✅ Fetched {len(volcanoes)} volcanic records")
        return volcanoes
        
    except requests.RequestException as e:
        print(f"  ❌ Error fetching volcanic data: {e}")
        return []


def insert_volcanic_data(db: Session, volcanoes: List[Dict[str, Any]]) -> int:
    """Insert volcanic activity data into database"""
    added = 0
    skipped = 0
    
    print("💾 Inserting volcanic data into database...")
    
    for volcano_data in volcanoes:
        # Check if volcano already exists (by name and eruption start date)
        existing = db.query(VolcanicActivity).filter(
            VolcanicActivity.volcano_name == volcano_data['volcano_name'],
            VolcanicActivity.eruption_start == volcano_data['eruption_start']
        ).first()
        
        if existing:
            skipped += 1
            continue
        
        volcanic_event = VolcanicActivity(
            volcano_name=volcano_data['volcano_name'],
            country=volcano_data['country'],
            vei=volcano_data['vei'],
            eruption_start=volcano_data['eruption_start'],
            eruption_end=volcano_data['eruption_end'],
            latitude=volcano_data['latitude'],
            longitude=volcano_data['longitude'],
            eruption_type=volcano_data['eruption_type'],
            data_source=volcano_data['data_source']
        )
        
        db.add(volcanic_event)
        added += 1
    
    db.commit()
    
    print(f"  ✅ Added {added} volcanic records")
    print(f"  ⏭️  Skipped {skipped} duplicates")
    
    return added


def add_sample_volcanic_data(db: Session) -> int:
    """Add sample volcanic eruption data for testing"""
    print("🌋 Adding sample volcanic eruption data...")
    
    sample_volcanoes = [
        {
            'volcano_name': 'Mount St. Helens',
            'country': 'United States',
            'vei': 5,
            'eruption_start': datetime(1980, 5, 18),
            'eruption_end': datetime(1980, 5, 18),
            'latitude': 46.20,
            'longitude': -122.18,
            'eruption_type': 'Stratovolcano',
            'plume_height_km': 24.0,
            'notes': 'Catastrophic eruption with lateral blast',
            'data_source': 'USGS'
        },
        {
            'volcano_name': 'Eyjafjallajökull',
            'country': 'Iceland',
            'vei': 4,
            'eruption_start': datetime(2010, 4, 14),
            'eruption_end': datetime(2010, 5, 23),
            'latitude': 63.63,
            'longitude': -19.62,
            'eruption_type': 'Stratovolcano',
            'plume_height_km': 9.0,
            'notes': 'Disrupted European air travel',
            'data_source': 'IMO'
        },
        {
            'volcano_name': 'Mount Pinatubo',
            'country': 'Philippines',
            'vei': 6,
            'eruption_start': datetime(1991, 6, 15),
            'eruption_end': datetime(1991, 6, 15),
            'latitude': 15.13,
            'longitude': 120.35,
            'eruption_type': 'Stratovolcano',
            'plume_height_km': 35.0,
            'notes': 'Second largest eruption of 20th century',
            'data_source': 'PHIVOLCS'
        },
        {
            'volcano_name': 'Krakatoa',
            'country': 'Indonesia',
            'vei': 6,
            'eruption_start': datetime(1883, 8, 27),
            'eruption_end': datetime(1883, 8, 27),
            'latitude': -6.10,
            'longitude': 105.42,
            'eruption_type': 'Caldera',
            'plume_height_km': 80.0,
            'notes': 'One of deadliest volcanic events in recorded history',
            'data_source': 'Smithsonian GVP'
        },
        {
            'volcano_name': 'Kilauea',
            'country': 'United States',
            'vei': 4,
            'eruption_start': datetime(2018, 5, 3),
            'eruption_end': datetime(2018, 8, 4),
            'latitude': 19.42,
            'longitude': -155.29,
            'eruption_type': 'Shield Volcano',
            'plume_height_km': 3.0,
            'notes': 'Lower East Rift Zone eruption',
            'data_source': 'USGS'
        },
        {
            'volcano_name': 'Mount Vesuvius',
            'country': 'Italy',
            'vei': 5,
            'eruption_start': datetime(79, 8, 24),
            'eruption_end': datetime(79, 8, 25),
            'latitude': 40.82,
            'longitude': 14.43,
            'eruption_type': 'Stratovolcano',
            'plume_height_km': 33.0,
            'notes': 'Destroyed Pompeii and Herculaneum',
            'data_source': 'Historical'
        },
        {
            'volcano_name': 'Mount Tambora',
            'country': 'Indonesia',
            'vei': 7,
            'eruption_start': datetime(1815, 4, 10),
            'eruption_end': datetime(1815, 4, 15),
            'latitude': -8.25,
            'longitude': 118.0,
            'eruption_type': 'Stratovolcano',
            'plume_height_km': 43.0,
            'notes': 'Largest eruption in recorded history, caused Year Without Summer',
            'data_source': 'Smithsonian GVP'
        }
    ]
    
    added = 0
    for volcano_data in sample_volcanoes:
        # Check for duplicates
        existing = db.query(VolcanicActivity).filter(
            VolcanicActivity.volcano_name == volcano_data['volcano_name'],
            VolcanicActivity.eruption_start == volcano_data['eruption_start']
        ).first()
        
        if existing:
            continue
        
        volcanic_event = VolcanicActivity(
            volcano_name=volcano_data['volcano_name'],
            country=volcano_data['country'],
            vei=volcano_data['vei'],
            eruption_start=volcano_data['eruption_start'],
            eruption_end=volcano_data['eruption_end'],
            latitude=volcano_data['latitude'],
            longitude=volcano_data['longitude'],
            eruption_type=volcano_data['eruption_type'],
            plume_height_km=volcano_data.get('plume_height_km'),
            notes=volcano_data.get('notes'),
            data_source=volcano_data['data_source']
        )
        
        db.add(volcanic_event)
        added += 1
    
    db.commit()
    print(f"  ✅ Added {added} sample volcanic records")
    return added


def main():
    """Main execution function"""
    db = next(get_db())
    
    try:
        # Add sample data first
        sample_count = add_sample_volcanic_data(db)
        
        # Fetch real data from Smithsonian GVP
        volcanoes = fetch_holocene_volcanoes()
        if volcanoes:
            api_count = insert_volcanic_data(db, volcanoes)
            print(f"\n🎉 Total: {sample_count + api_count} volcanic records added")
        else:
            print(f"\n🎉 Total: {sample_count} volcanic records added (API fetch failed)")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
