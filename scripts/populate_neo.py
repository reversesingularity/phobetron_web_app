"""
Data Population Script - NASA NEO (Near-Earth Objects)
Fetches Near-Earth Object data from NASA API and populates the database.

API Documentation: https://api.nasa.gov/

Usage:
    python populate_neo.py --api-key YOUR_API_KEY --days 7
    python populate_neo.py --start-date 2024-01-01 --end-date 2024-01-31
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

from app.models.scientific import NeoCloseApproaches
from app.core.config import settings


class NASANEOPopulator:
    """Fetch and populate NEO data from NASA API."""
    
    NASA_NEO_API_URL = "https://api.nasa.gov/neo/rest/v1/feed"
    NASA_DEMO_KEY = "DEMO_KEY"  # Limited to 30 requests per hour
    
    def __init__(self, database_url: str, api_key: str = None):
        """
        Initialize with database connection and NASA API key.
        
        Args:
            database_url: PostgreSQL connection string
            api_key: NASA API key (get free key at https://api.nasa.gov/)
        """
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.api_key = api_key or self.NASA_DEMO_KEY
        
        if self.api_key == self.NASA_DEMO_KEY:
            print("WARNING: Using DEMO_KEY (limited to 30 requests/hour)")
            print("Get a free API key at: https://api.nasa.gov/")
    
    def fetch_neo_data(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict]:
        """
        Fetch NEO data from NASA API.
        
        NASA API limits date range to 7 days per request.
        This method automatically chunks larger date ranges.
        
        Args:
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            List of NEO dictionaries
        """
        all_neos = []
        current_date = start_date
        
        print(f"Fetching NEO data from NASA API...")
        print(f"  Date range: {start_date.date()} to {end_date.date()}")
        
        while current_date <= end_date:
            # NASA API allows max 7 days per request
            chunk_end = min(current_date + timedelta(days=6), end_date)
            
            params = {
                'start_date': current_date.strftime('%Y-%m-%d'),
                'end_date': chunk_end.strftime('%Y-%m-%d'),
                'api_key': self.api_key
            }
            
            try:
                print(f"  Fetching: {current_date.date()} to {chunk_end.date()}")
                response = requests.get(
                    self.NASA_NEO_API_URL,
                    params=params,
                    timeout=30
                )
                response.raise_for_status()
                
                data = response.json()
                near_earth_objects = data.get('near_earth_objects', {})
                
                # Extract all NEOs from all dates in this chunk
                for date_key, neos in near_earth_objects.items():
                    all_neos.extend(neos)
                
                print(f"    ✓ Found {len(near_earth_objects)} date(s) with NEO data")
                
                # Rate limiting for DEMO_KEY
                if self.api_key == self.NASA_DEMO_KEY:
                    time.sleep(1)  # Be respectful with demo key
                
            except requests.RequestException as e:
                print(f"    ✗ Error fetching data: {e}")
            
            current_date = chunk_end + timedelta(days=1)
        
        print(f"✓ Successfully fetched {len(all_neos)} NEO close approaches")
        return all_neos
    
    def parse_neo(self, neo_data: Dict) -> Optional[Dict]:
        """
        Parse NASA NEO data into database model format.
        
        Args:
            neo_data: NEO dictionary from NASA API
            
        Returns:
            Dictionary with NEO close approach data or None if invalid
        """
        try:
            # Extract close approach data (there can be multiple approaches)
            close_approaches = neo_data.get('close_approach_data', [])
            if not close_approaches:
                return None
            
            # Use the closest approach
            approach = close_approaches[0]
            
            # Extract required fields
            neo_id = neo_data.get('id')
            name = neo_data.get('name', '').strip('()')  # Remove parentheses
            
            # Approach date
            close_approach_date_str = approach.get('close_approach_date_full')
            if not close_approach_date_str:
                return None
            
            approach_date = datetime.strptime(
                close_approach_date_str,
                '%Y-%b-%d %H:%M'
            )
            
            # Distance data
            miss_distance = approach.get('miss_distance', {})
            miss_distance_au = float(miss_distance.get('astronomical', 0))
            miss_distance_lunar = float(miss_distance.get('lunar', 0))
            
            # Velocity data (convert from km/h to km/s)
            relative_velocity_kmh = float(
                approach.get('relative_velocity', {}).get('kilometers_per_hour', 0)
            )
            relative_velocity_km_s = relative_velocity_kmh / 3600.0 if relative_velocity_kmh else None
            
            # Size estimates (meters) - use average of min and max
            estimated_diameter_m = None
            estimated_diameter = neo_data.get('estimated_diameter', {})
            
            if 'meters' in estimated_diameter:
                diameter_min = float(
                    estimated_diameter['meters'].get('estimated_diameter_min', 0)
                )
                diameter_max = float(
                    estimated_diameter['meters'].get('estimated_diameter_max', 0)
                )
                if diameter_min > 0 and diameter_max > 0:
                    estimated_diameter_m = (diameter_min + diameter_max) / 2.0
            
            # Absolute magnitude
            absolute_magnitude = neo_data.get('absolute_magnitude_h')
            
            return {
                'object_name': f"{name} ({neo_id})",  # Combine name and ID
                'approach_date': approach_date,
                'miss_distance_au': miss_distance_au,
                'miss_distance_lunar': miss_distance_lunar,
                'relative_velocity_km_s': relative_velocity_km_s,
                'estimated_diameter_m': estimated_diameter_m,
                'absolute_magnitude': absolute_magnitude,
                'data_source': 'NASA/JPL',
            }
            
        except (KeyError, ValueError, TypeError) as e:
            print(f"Warning: Failed to parse NEO data: {e}")
            return None
    
    def populate_database(
        self,
        neos: List[Dict],
        batch_size: int = 100,
        skip_duplicates: bool = True
    ) -> tuple[int, int]:
        """
        Populate database with NEO close approach data.
        
        Args:
            neos: List of NEO dictionaries from NASA API
            batch_size: Number of records to insert per batch
            skip_duplicates: Skip NEOs that already exist
            
        Returns:
            Tuple of (inserted_count, skipped_count)
        """
        db = self.SessionLocal()
        inserted_count = 0
        skipped_count = 0
        
        try:
            print(f"\nPopulating database with {len(neos)} NEO close approaches...")
            
            for i, neo_data in enumerate(neos):
                # Parse NEO data
                neo_parsed = self.parse_neo(neo_data)
                if not neo_parsed:
                    skipped_count += 1
                    continue
                
                # Check for duplicates (same object + approach date)
                if skip_duplicates:
                    existing = db.query(NeoCloseApproaches).filter(
                        NeoCloseApproaches.object_name == neo_parsed['object_name'],
                        NeoCloseApproaches.approach_date == neo_parsed['approach_date']
                    ).first()
                    
                    if existing:
                        skipped_count += 1
                        continue
                
                # Create new NEO close approach record
                neo_approach = NeoCloseApproaches(**neo_parsed)
                db.add(neo_approach)
                inserted_count += 1
                
                # Commit in batches
                if (i + 1) % batch_size == 0:
                    db.commit()
                    print(f"  Progress: {i + 1}/{len(neos)} processed "
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
        batch_size: int = 100
    ):
        """
        Run the complete population process.
        
        Args:
            days: Number of days from today to fetch
            start_date: Start date (YYYY-MM-DD format)
            end_date: End date (YYYY-MM-DD format)
            batch_size: Batch size for database inserts
        """
        # Determine date range
        if days:
            start_dt = datetime.utcnow()
            end_dt = start_dt + timedelta(days=days)
        elif start_date and end_date:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        else:
            # Default: next 7 days (NEO predictions)
            start_dt = datetime.utcnow()
            end_dt = start_dt + timedelta(days=7)
        
        print("=" * 60)
        print("NASA NEO (Near-Earth Objects) Data Population")
        print("=" * 60)
        
        # Fetch NEO data from NASA API
        neos = self.fetch_neo_data(start_date=start_dt, end_date=end_dt)
        
        if not neos:
            print("No NEO data fetched. Exiting.")
            return
        
        # Populate database
        inserted, skipped = self.populate_database(
            neos=neos,
            batch_size=batch_size
        )
        
        print(f"\n{'=' * 60}")
        print(f"Population complete!")
        print(f"  Total NEO approaches: {len(neos)}")
        print(f"  Inserted: {inserted}")
        print(f"  Skipped: {skipped}")
        print(f"{'=' * 60}\n")


def main():
    """Main entry point with command-line argument parsing."""
    parser = argparse.ArgumentParser(
        description='Populate database with NASA NEO data'
    )
    
    # Time range options (mutually exclusive)
    time_group = parser.add_mutually_exclusive_group()
    time_group.add_argument(
        '--days',
        type=int,
        help='Number of days from today (default: 7)'
    )
    time_group.add_argument(
        '--date-range',
        nargs=2,
        metavar=('START', 'END'),
        help='Date range in YYYY-MM-DD format'
    )
    
    # NASA API key
    parser.add_argument(
        '--api-key',
        type=str,
        help='NASA API key (get free key at https://api.nasa.gov/)'
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
    populator = NASANEOPopulator(database_url, api_key=args.api_key)
    
    # Run population
    if args.date_range:
        populator.run(
            start_date=args.date_range[0],
            end_date=args.date_range[1],
            batch_size=args.batch_size
        )
    else:
        populator.run(
            days=args.days or 7,
            batch_size=args.batch_size
        )


if __name__ == '__main__':
    main()
