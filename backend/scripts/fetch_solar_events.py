"""
Solar Event Data Fetcher for GitHub Actions
Fetches solar flare and geomagnetic storm data from NOAA
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


def fetch_solar_events(days: int = 30):
    """
    Fetch solar events from NOAA Space Weather Prediction Center
    
    Args:
        days: Number of days to look back
    """
    print(f"☀️ Fetching solar events from last {days} days from NOAA...")
    
    # NOAA SWPC provides JSON feeds (free, no API key)
    solar_flare_url = "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json"
    
    try:
        # Fetch X-ray flux data (solar flares)
        response = requests.get(solar_flare_url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        events = []
        for record in data[-100:]:  # Last 100 measurements
            # Parse timestamp
            time_tag = record.get('time_tag')
            if not time_tag:
                continue
            
            event_time = datetime.strptime(time_tag, "%Y-%m-%dT%H:%M:%SZ")
            
            # Check if within requested time range
            if (datetime.utcnow() - event_time).days > days:
                continue
            
            # Classify flare based on flux
            flux = float(record.get('flux', 0))
            if flux >= 1e-4:
                flare_class = 'X'
            elif flux >= 1e-5:
                flare_class = 'M'
            elif flux >= 1e-6:
                flare_class = 'C'
            else:
                continue  # Skip lower classes
            
            event = {
                'event_type': 'solar_flare',
                'event_start': event_time,
                'event_end': event_time + timedelta(minutes=30),  # Approximate duration
                'intensity': flare_class,
                'kp_index': None,
                'data_source': 'NOAA SWPC',
                'created_at': datetime.utcnow()
            }
            events.append(event)
        
        print(f"  ✅ Fetched {len(events)} solar flare events")
        
        # Insert into database
        insert_solar_events(events)
        
        return len(events)
        
    except Exception as e:
        print(f"  ❌ Error fetching solar event data: {e}")
        return 0


def insert_solar_events(events):
    """Insert solar events into database, skipping duplicates"""
    
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
        for event in events:
            # Check if event already exists (within 1 hour window)
            result = session.execute(
                text("""
                    SELECT id FROM solar_events 
                    WHERE event_type = :event_type 
                    AND event_start >= :start_window 
                    AND event_start <= :end_window
                """),
                {
                    "event_type": event['event_type'],
                    "start_window": event['event_start'] - timedelta(hours=1),
                    "end_window": event['event_start'] + timedelta(hours=1)
                }
            )
            
            if result.fetchone():
                skipped += 1
                continue
            
            # Insert new solar event
            session.execute(
                text("""
                    INSERT INTO solar_events 
                    (event_type, event_start, event_end, intensity, kp_index, 
                     data_source, created_at)
                    VALUES 
                    (:event_type, :event_start, :event_end, :intensity, :kp_index,
                     :data_source, :created_at)
                """),
                event
            )
            inserted += 1
        
        session.commit()
    
    print(f"  📊 Inserted: {inserted} | Skipped (duplicates): {skipped}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fetch NOAA solar event data')
    parser.add_argument('--days', type=int, default=30, help='Days to look back')
    
    args = parser.parse_args()
    
    count = fetch_solar_events(args.days)
    
    print(f"\n✅ Solar event update completed: {count} records processed")
    sys.exit(0)
