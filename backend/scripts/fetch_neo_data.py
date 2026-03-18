"""
NASA NEO Data Fetcher for GitHub Actions
Fetches Near-Earth Object close approach data
"""

import requests
import sys
import os
import uuid
import argparse
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


def fetch_nasa_neos(days: int = 90):
    """
    Fetch NEO close approaches from NASA JPL.
    The API is limited to 7-day windows per request, so we loop through
    the full requested range in 7-day chunks.
    
    Args:
        days: Total number of days to look ahead (split into 7-day chunks)
    """
    print(f"☄️ Fetching NEO data for next {days} days from NASA JPL (7-day chunks)...")
    
    # NASA NeoWs API (no key required for basic queries)
    url = "https://api.nasa.gov/neo/rest/v1/feed"
    api_key = os.getenv('NASA_API_KEY') or 'DEMO_KEY'

    chunk_size = 7  # API hard limit
    all_neos = []
    chunk_start = datetime.utcnow().date()
    days_remaining = days

    while days_remaining > 0:
        chunk_days = min(chunk_size, days_remaining)
        chunk_end = chunk_start + timedelta(days=chunk_days)

        params = {
            "start_date": chunk_start.strftime("%Y-%m-%d"),
            "end_date": chunk_end.strftime("%Y-%m-%d"),
            "api_key": api_key,
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            for date_str, neo_list in data.get("near_earth_objects", {}).items():
                for neo in neo_list:
                    close_approach = neo["close_approach_data"][0] if neo.get("close_approach_data") else {}

                    neo_data = {
                        'id': str(uuid.uuid4()),
                        'object_name': neo.get('name'),
                        'approach_date': datetime.strptime(
                            close_approach.get('close_approach_date', date_str),
                            "%Y-%m-%d"
                        ),
                        'miss_distance_au': float(close_approach.get('miss_distance', {}).get('astronomical', 0)),
                        'miss_distance_lunar': float(close_approach.get('miss_distance', {}).get('lunar', 0)),
                        'relative_velocity_km_s': float(close_approach.get('relative_velocity', {}).get('kilometers_per_second', 0)),
                        'estimated_diameter_m': float(neo.get('estimated_diameter', {}).get('meters', {}).get('estimated_diameter_min', 0)),  # Use min as estimate
                        'absolute_magnitude': float(neo.get('absolute_magnitude_h', 0)),
                        'data_source': 'NASA JPL',
                        'created_at': datetime.utcnow()
                    }
                    all_neos.append(neo_data)

        except Exception as e:
            print(f"  ⚠️ Error fetching chunk {chunk_start} → {chunk_end}: {e}")

        # Advance window (NASA feed is exclusive of end_date, so step by chunk_days)
        chunk_start = chunk_end
        days_remaining -= chunk_days

    print(f"  ✅ Fetched {len(all_neos)} NEO close approaches across all chunks")

    # Insert into database
    insert_neos(all_neos)

    return len(all_neos)


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
                text("SELECT id FROM neo_close_approaches WHERE object_name = :object_name AND approach_date = :approach_date"),
                {"object_name": neo['object_name'], "approach_date": neo['approach_date']}
            )
            
            if result.fetchone():
                skipped += 1
                continue
            
            # Insert new NEO
            session.execute(
                text("""
                    INSERT INTO neo_close_approaches
                    (id, object_name, approach_date, miss_distance_au, miss_distance_lunar,
                     relative_velocity_km_s, estimated_diameter_m, absolute_magnitude,
                     data_source, created_at)
                    VALUES
                    (:id, :object_name, :approach_date, :miss_distance_au, :miss_distance_lunar,
                     :relative_velocity_km_s, :estimated_diameter_m, :absolute_magnitude,
                     :data_source, :created_at)
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
