"""
Data Population Script - USGS Earthquake Data
Fetches earthquake data from USGS API and populates the database.

Usage:
    python populate_earthquakes.py --days 30 --min-magnitude 4.5
    python populate_earthquakes.py --start-date 2024-01-01 --end-date 2024-12-31
"""

import requests
import argparse
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import time
import sys
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add parent directory to path for imports
sys.path.insert(0, '../backend')

from app.models.events import Earthquakes
from app.core.config import settings


class USGSEarthquakePopulator:
    """Fetch and populate earthquake data from USGS API."""
    
    USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    
    def __init__(self, database_url: str):
        """Initialize with database connection."""
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        
    def fetch_earthquakes(
        self,
        start_time: datetime,
        end_time: datetime,
        min_magnitude: float = 0.0,
        max_magnitude: float = 10.0,
        limit: int = 20000
    ) -> List[Dict]:
        """
        Fetch earthquake data from USGS API.
        
        Args:
            start_time: Start of time range
            end_time: End of time range
            min_magnitude: Minimum magnitude filter
            max_magnitude: Maximum magnitude filter
            limit: Maximum number of results
            
        Returns:
            List of earthquake dictionaries
        """
        params = {
            'format': 'geojson',
            'starttime': start_time.strftime('%Y-%m-%d'),
            'endtime': end_time.strftime('%Y-%m-%d'),
            'minmagnitude': min_magnitude,
            'maxmagnitude': max_magnitude,
            'limit': limit,
            'orderby': 'time',
        }
        
        print(f"Fetching earthquakes from USGS API...")
        print(f"  Time range: {start_time.date()} to {end_time.date()}")
        print(f"  Magnitude range: {min_magnitude} - {max_magnitude}")
        
        try:
            response = requests.get(self.USGS_API_URL, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            earthquakes = data.get('features', [])
            
            print(f"✓ Successfully fetched {len(earthquakes)} earthquakes")
            return earthquakes
            
        except requests.RequestException as e:
            print(f"✗ Error fetching data from USGS API: {e}")
            return []
    
    def parse_earthquake(self, feature: Dict) -> Optional[Dict]:
        """
        Parse USGS GeoJSON feature into database model format.
        
        Args:
            feature: GeoJSON feature from USGS API
            
        Returns:
            Dictionary with earthquake data or None if invalid
        """
        try:
            properties = feature.get('properties', {})
            geometry = feature.get('geometry', {})
            coordinates = geometry.get('coordinates', [])
            
            # Extract required fields
            event_id = feature.get('id')
            event_time_ms = properties.get('time')
            magnitude = properties.get('mag')
            
            # Validate required fields
            if not all([event_id, event_time_ms is not None, magnitude is not None]):
                return None
            
            # Parse coordinates [longitude, latitude, depth]
            if len(coordinates) < 2:
                return None
            
            longitude = coordinates[0]
            latitude = coordinates[1]
            depth_km = coordinates[2] if len(coordinates) > 2 else None
            
            # Validate coordinate ranges
            if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
                return None
            
            # Convert timestamp from milliseconds to datetime
            event_time = datetime.utcfromtimestamp(event_time_ms / 1000.0)
            
            return {
                'event_id': event_id,
                'event_time': event_time,
                'magnitude': float(magnitude),
                'magnitude_type': properties.get('magType'),
                'latitude': float(latitude),
                'longitude': float(longitude),
                'depth_km': float(depth_km) if depth_km is not None else None,
                'region': properties.get('place'),
                'data_source': 'USGS',
            }
            
        except (KeyError, ValueError, TypeError) as e:
            print(f"Warning: Failed to parse earthquake feature: {e}")
            return None
    
    def populate_database(
        self,
        earthquakes: List[Dict],
        batch_size: int = 100,
        skip_duplicates: bool = True
    ) -> tuple[int, int]:
        """
        Populate database with earthquake data.
        
        Args:
            earthquakes: List of earthquake features from USGS
            batch_size: Number of records to insert per batch
            skip_duplicates: Skip earthquakes that already exist in database
            
        Returns:
            Tuple of (inserted_count, skipped_count)
        """
        db = self.SessionLocal()
        inserted_count = 0
        skipped_count = 0
        
        try:
            print(f"\nPopulating database with {len(earthquakes)} earthquakes...")
            
            for i, feature in enumerate(earthquakes):
                # Parse earthquake data
                eq_data = self.parse_earthquake(feature)
                if not eq_data:
                    skipped_count += 1
                    continue
                
                # Check for duplicates
                if skip_duplicates:
                    existing = db.query(Earthquakes).filter(
                        Earthquakes.event_id == eq_data['event_id']
                    ).first()
                    
                    if existing:
                        skipped_count += 1
                        continue
                
                # Create new earthquake record
                earthquake = Earthquakes(**eq_data)
                db.add(earthquake)
                inserted_count += 1
                
                # Commit in batches
                if (i + 1) % batch_size == 0:
                    db.commit()
                    print(f"  Progress: {i + 1}/{len(earthquakes)} processed "
                          f"({inserted_count} inserted, {skipped_count} skipped)")
            
            # Final commit
            db.commit()
            print(f"\n✓ Database population complete:")
            print(f"    Inserted: {inserted_count}")
            print(f"    Skipped: {skipped_count}")
            
            return inserted_count, skipped_count
            
        except Exception as e:
            db.rollback()
            print(f"\n✗ Error populating database: {e}")
            raise
        finally:
            db.close()
    
    def run(
        self,
        days: Optional[int] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        min_magnitude: float = 0.0,
        max_magnitude: float = 10.0,
        batch_size: int = 100
    ):
        """
        Run the complete population process.
        
        Args:
            days: Number of days back from today to fetch
            start_date: Start date (YYYY-MM-DD format)
            end_date: End date (YYYY-MM-DD format)
            min_magnitude: Minimum magnitude filter
            max_magnitude: Maximum magnitude filter
            batch_size: Batch size for database inserts
        """
        # Determine time range
        if days:
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=days)
        elif start_date and end_date:
            start_time = datetime.strptime(start_date, '%Y-%m-%d')
            end_time = datetime.strptime(end_date, '%Y-%m-%d')
        else:
            # Default: last 30 days
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=30)
        
        print("=" * 60)
        print("USGS Earthquake Data Population")
        print("=" * 60)
        
        # Fetch data from USGS API
        earthquakes = self.fetch_earthquakes(
            start_time=start_time,
            end_time=end_time,
            min_magnitude=min_magnitude,
            max_magnitude=max_magnitude
        )
        
        if not earthquakes:
            print("No earthquakes fetched. Exiting.")
            return
        
        # Populate database
        inserted, skipped = self.populate_database(
            earthquakes=earthquakes,
            batch_size=batch_size
        )
        
        print(f"\n{'=' * 60}")
        print(f"Population complete!")
        print(f"  Total fetched: {len(earthquakes)}")
        print(f"  Inserted: {inserted}")
        print(f"  Skipped: {skipped}")
        print(f"{'=' * 60}\n")


def main():
    """Main entry point with command-line argument parsing."""
    parser = argparse.ArgumentParser(
        description='Populate database with USGS earthquake data'
    )
    
    # Time range options (mutually exclusive)
    time_group = parser.add_mutually_exclusive_group()
    time_group.add_argument(
        '--days',
        type=int,
        help='Number of days back from today (default: 30)'
    )
    time_group.add_argument(
        '--date-range',
        nargs=2,
        metavar=('START', 'END'),
        help='Date range in YYYY-MM-DD format (e.g., 2024-01-01 2024-12-31)'
    )
    
    # Magnitude filters
    parser.add_argument(
        '--min-magnitude',
        type=float,
        default=0.0,
        help='Minimum magnitude (default: 0.0)'
    )
    parser.add_argument(
        '--max-magnitude',
        type=float,
        default=10.0,
        help='Maximum magnitude (default: 10.0)'
    )
    
    # Performance options
    parser.add_argument(
        '--batch-size',
        type=int,
        default=100,
        help='Batch size for database inserts (default: 100)'
    )
    
    # Database URL
    parser.add_argument(
        '--database-url',
        type=str,
        help='Database URL (overrides environment variable)'
    )
    
    args = parser.parse_args()
    
    # Get database URL
    database_url = args.database_url or settings.SQLALCHEMY_DATABASE_URL
    
    if not database_url:
        print("Error: DATABASE_URL not set in environment")
        sys.exit(1)
    
    # Create populator
    populator = USGSEarthquakePopulator(database_url)
    
    # Run population
    if args.date_range:
        populator.run(
            start_date=args.date_range[0],
            end_date=args.date_range[1],
            min_magnitude=args.min_magnitude,
            max_magnitude=args.max_magnitude,
            batch_size=args.batch_size
        )
    else:
        populator.run(
            days=args.days or 30,
            min_magnitude=args.min_magnitude,
            max_magnitude=args.max_magnitude,
            batch_size=args.batch_size
        )


if __name__ == '__main__':
    main()
