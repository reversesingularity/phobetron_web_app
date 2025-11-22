"""
Volcanic Activity Data Fetcher for GitHub Actions
Fetches volcanic eruption data from Smithsonian Global Volcanism Program
Standalone - no FastAPI dependencies
"""

import requests
import os
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


def fetch_holocene_volcanoes():
    """Fetch Holocene volcano data from Smithsonian GVP"""
    print("🌋 Fetching volcanic data from Smithsonian Global Volcanism Program...")
    
    GVP_API_BASE = "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows"
    
    params = {
        'service': 'WFS',
        'version': '1.0.0',
        'request': 'GetFeature',
        'typeName': 'GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes',
        'outputFormat': 'json',
        'maxFeatures': 100
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
                    year = int(last_eruption.split()[0]) if isinstance(last_eruption, str) else int(last_eruption)
                    eruption_date = datetime(year, 1, 1)
                except:
                    eruption_date = datetime(2000, 1, 1)
            else:
                eruption_date = datetime(2000, 1, 1)
            
            volcano = {
                'volcano_name': props.get('Volcano_Name', 'Unknown'),
                'country': props.get('Country', 'Unknown'),
                'vei': props.get('VEI', 0),
                'eruption_start': eruption_date,
                'eruption_end': eruption_date,
                'latitude': coords[1] if len(coords) > 1 else 0.0,
                'longitude': coords[0] if len(coords) > 0 else 0.0,
                'eruption_type': props.get('Pri_Volc_Type', 'Unknown'),
                'data_source': 'Smithsonian GVP'
            }
            volcanoes.append(volcano)
        
        print(f"  ✅ Fetched {len(volcanoes)} volcano records")
        return volcanoes
        
    except Exception as e:
        print(f"  ❌ Error fetching volcanic data: {e}")
        return []


def insert_volcanic_data(volcanoes):
    """Insert volcanic data into database"""
    added = 0
    skipped = 0
    
    print("💾 Inserting volcanic data into database...")
    
    # Get DATABASE_URL from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    # Create engine and session
    engine = create_engine(database_url)
    
    with Session(engine) as session:
        for volcano_data in volcanoes:
            # Check if volcano already exists
            result = session.execute(
                text("""
                    SELECT id FROM volcanic_activity 
                    WHERE volcano_name = :name AND eruption_start = :start
                """),
                {
                    "name": volcano_data['volcano_name'], 
                    "start": volcano_data['eruption_start']
                }
            )
            
            if result.fetchone():
                skipped += 1
                continue
            
            # Insert volcanic event
            session.execute(
                text("""
                    INSERT INTO volcanic_activity 
                    (volcano_name, country, vei, eruption_start, eruption_end, 
                     latitude, longitude, eruption_type, data_source, created_at)
                    VALUES (:volcano_name, :country, :vei, :eruption_start, :eruption_end,
                            :latitude, :longitude, :eruption_type, :data_source, :created_at)
                """),
                {
                    **volcano_data,
                    'created_at': datetime.utcnow()
                }
            )
            added += 1
        
        session.commit()
    
    print(f"  ✅ Added {added} volcanic records")
    print(f"  ⏭️  Skipped {skipped} duplicates")
    
    return added


def main():
    """Main execution function"""
    try:
        # Fetch data from Smithsonian GVP
        volcanoes = fetch_holocene_volcanoes()
        
        if volcanoes:
            count = insert_volcanic_data(volcanoes)
            print(f"\n🎉 Successfully added {count} volcanic records")
        else:
            print("\n⚠️  No volcanic data fetched")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise


if __name__ == "__main__":
    main()
