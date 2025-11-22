"""
NASA NEO Data Fetcher for GitHub Actions
Fetches Near-Earth Object close approach data
"""

import requests
import sys
import os
import argparse
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


def fetch_nasa_neos(days: int = 90):
    """
    Fetch NEO close approaches from NASA JPL
    
    Args:
        days: Number of days to look ahead
    """
    print(f"☄️ Fetching NEO data for next {days} days from NASA JPL...")
    
    # NASA NeoWs API (no key required for basic queries)
    url = "https://api.nasa.gov/neo/rest/v1/feed"
    
    start_date = datetime.utcnow().date()
    end_date = start_date + timedelta(days=min(days, 7))  # API limits to 7 days per query
    
    params = {
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "api_key": os.getenv('NASA_API_KEY', 'DEMO_KEY')
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        neos = []
        for date_str, neo_list in data.get("near_earth_objects", {}).items():
            for neo in neo_list:
                close_approach = neo["close_approach_data"][0] if neo.get("close_approach_data") else {}
                
                neo_data = {
                    'neo_id': neo.get('id'),
                    'name': neo.get('name'),
                    'approach_date': datetime.strptime(
                        close_approach.get('close_approach_date', date_str), 
                        "%Y-%m-%d"
                    ),
                    'miss_distance_km': float(close_approach.get('miss_distance', {}).get('kilometers', 0)),
                    'miss_distance_au': float(close_approach.get('miss_distance', {}).get('astronomical', 0)),
                    'relative_velocity_kmh': float(close_approach.get('relative_velocity', {}).get('kilometers_per_hour', 0)),
                    'diameter_min_km': float(neo.get('estimated_diameter', {}).get('kilometers', {}).get('estimated_diameter_min', 0)),
                    'diameter_max_km': float(neo.get('estimated_diameter', {}).get('kilometers', {}).get('estimated_diameter_max', 0)),
                    'is_potentially_hazardous': neo.get('is_potentially_hazardous_asteroid', False),
                    'data_source': 'NASA JPL',
                    'created_at': datetime.utcnow()
                }
                neos.append(neo_data)
        
        print(f"  ✅ Fetched {len(neos)} NEO close approaches")
        
        # Insert into database
        insert_neos(neos)
        
        return len(neos)
        
    except Exception as e:
        print(f"  ❌ Error fetching NEO data: {e}")
        return 0


def insert_neos(neos):
    """Insert NEOs into database, skipping duplicates"""
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("  ❌ DATABASE_URL not set")
        return
    
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    engine = create_engine(database_url)
    
    inserted = 0
    skipped = 0
    
    with Session(engine) as session:
        for neo in neos:
            # Check if NEO approach already exists
            result = session.execute(
                text("SELECT id FROM neo_close_approaches WHERE neo_id = :neo_id AND approach_date = :approach_date"),
                {"neo_id": neo['neo_id'], "approach_date": neo['approach_date']}
            )
            
            if result.fetchone():
                skipped += 1
                continue
            
            # Insert new NEO
            session.execute(
                text("""
                    INSERT INTO neo_close_approaches 
                    (neo_id, name, approach_date, miss_distance_km, miss_distance_au, 
                     relative_velocity_kmh, diameter_min_km, diameter_max_km, 
                     is_potentially_hazardous, data_source, created_at)
                    VALUES 
                    (:neo_id, :name, :approach_date, :miss_distance_km, :miss_distance_au,
                     :relative_velocity_kmh, :diameter_min_km, :diameter_max_km,
                     :is_potentially_hazardous, :data_source, :created_at)
                """),
                neo
            )
            inserted += 1
        
        session.commit()
    
    print(f"  📊 Inserted: {inserted} | Skipped (duplicates): {skipped}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fetch NASA NEO data')
    parser.add_argument('--days', type=int, default=90, help='Days to look ahead')
    
    args = parser.parse_args()
    
    count = fetch_nasa_neos(args.days)
    
    print(f"\n✅ NEO update completed: {count} records processed")
    sys.exit(0)
