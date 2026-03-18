"""
USGS Earthquake Data Fetcher for GitHub Actions
Fetches recent earthquake data and updates production database
"""

import requests
import sys
import os
import uuid
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


def fetch_usgs_earthquakes(days: int = 30, min_magnitude: float = 4.0):
    """
    Fetch earthquakes from USGS and insert into database
    
    Args:
        days: Number of days to look back
        min_magnitude: Minimum magnitude to fetch
    """
    print(f"🌍 Fetching earthquakes from last {days} days (M{min_magnitude}+)...")
    
    # USGS API endpoint
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=days)
    
    params = {
        "format": "geojson",
        "starttime": start_time.strftime("%Y-%m-%d"),
        "endtime": end_time.strftime("%Y-%m-%d"),
        "minmagnitude": min_magnitude,
        "orderby": "time-asc",
        "limit": 1000
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        earthquakes = []
        for feature in data.get("features", []):
            props = feature["properties"]
            coords = feature["geometry"]["coordinates"]
            
            earthquake = {
                'id': str(uuid.uuid4()),
                'event_id': feature["id"],
                'event_time': datetime.fromtimestamp(props["time"] / 1000),
                'magnitude': props.get("mag"),
                'magnitude_type': props.get("magType", "unknown"),
                'latitude': coords[1],
                'longitude': coords[0],
                'depth_km': coords[2] if len(coords) > 2 else 0,
                'region': props.get("place", "Unknown"),
                'data_source': 'USGS',
                'created_at': datetime.utcnow()
            }
            earthquakes.append(earthquake)
        
        print(f"  ✅ Fetched {len(earthquakes)} earthquake records")
        
        # Insert into database
        insert_earthquakes(earthquakes)
        
        return len(earthquakes)
        
    except Exception as e:
        print(f"  ❌ Error fetching earthquake data: {e}")
        return 0


def insert_earthquakes(earthquakes):
    """Insert earthquakes into database, skipping duplicates"""
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("  ❌ DATABASE_URL not set")
        return
    
    # Railway uses postgres:// but SQLAlchemy needs postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    engine = create_engine(database_url)
    
    inserted = 0
    skipped = 0
    
    with Session(engine) as session:
        for eq in earthquakes:
            # Check if earthquake already exists
            result = session.execute(
                text("SELECT id FROM earthquakes WHERE event_id = :event_id"),
                {"event_id": eq['event_id']}
            )
            
            if result.fetchone():
                skipped += 1
                continue
            
            # Insert new earthquake
            session.execute(
                text("""
                    INSERT INTO earthquakes
                    (id, event_id, event_time, magnitude, magnitude_type, latitude, longitude,
                     depth_km, region, data_source, created_at)
                    VALUES
                    (:id, :event_id, :event_time, :magnitude, :magnitude_type, :latitude, :longitude,
                     :depth_km, :region, :data_source, :created_at)
                """),
                eq
            )
            inserted += 1
        
        session.commit()
    
    print(f"  📊 Inserted: {inserted} | Skipped (duplicates): {skipped}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fetch USGS earthquake data')
    parser.add_argument('--days', type=int, default=30, help='Days to look back')
    parser.add_argument('--min-magnitude', type=float, default=4.0, help='Minimum magnitude')
    
    args = parser.parse_args()
    
    count = fetch_usgs_earthquakes(args.days, args.min_magnitude)
    
    print(f"\n✅ Earthquake update completed: {count} records processed")
    sys.exit(0)
