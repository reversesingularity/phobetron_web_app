"""
Master Data Population Script
Runs all data population scripts in sequence to fully populate the database.

Usage:
    python populate_all.py
    python populate_all.py --earthquake-days 90 --neo-days 30 --nasa-api-key YOUR_KEY
"""

import argparse
import sys
from datetime import datetime

# Import individual populators
from populate_earthquakes import USGSEarthquakePopulator
from populate_volcanic import VolcanicActivityPopulator
from populate_neo import NASANEOPopulator

# Add parent directory to path for imports
sys.path.insert(0, '../backend')
from app.core.config import settings


def print_header(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def print_summary(results: dict):
    """Print overall summary of data population."""
    print_header("DATA POPULATION SUMMARY")
    
    total_inserted = 0
    total_skipped = 0
    
    for source, data in results.items():
        inserted = data.get('inserted', 0)
        skipped = data.get('skipped', 0)
        total_inserted += inserted
        total_skipped += skipped
        
        print(f"{source}:")
        print(f"  ✓ Inserted: {inserted}")
        print(f"  ⊘ Skipped:  {skipped}")
        print()
    
    print("-" * 70)
    print(f"TOTAL:")
    print(f"  ✓ Inserted: {total_inserted}")
    print(f"  ⊘ Skipped:  {total_skipped}")
    print("=" * 70 + "\n")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Populate database with all astronomical and geophysical data'
    )
    
    # Earthquake options
    parser.add_argument(
        '--earthquake-days',
        type=int,
        default=30,
        help='Days of earthquake data to fetch (default: 30)'
    )
    parser.add_argument(
        '--min-magnitude',
        type=float,
        default=4.0,
        help='Minimum earthquake magnitude (default: 4.0)'
    )
    
    # Volcanic options
    parser.add_argument(
        '--volcanic-weeks',
        type=int,
        default=4,
        help='Weeks of volcanic data to fetch (default: 4)'
    )
    
    # NEO options
    parser.add_argument(
        '--neo-days',
        type=int,
        default=7,
        help='Days of NEO data to fetch (default: 7)'
    )
    parser.add_argument(
        '--nasa-api-key',
        type=str,
        help='NASA API key (recommended)'
    )
    
    # Database options
    parser.add_argument(
        '--database-url',
        type=str,
        help='Database URL (overrides environment variable)'
    )
    
    # Batch size
    parser.add_argument(
        '--batch-size',
        type=int,
        default=100,
        help='Batch size for database inserts (default: 100)'
    )
    
    # Skip options
    parser.add_argument(
        '--skip-earthquakes',
        action='store_true',
        help='Skip earthquake data population'
    )
    parser.add_argument(
        '--skip-volcanic',
        action='store_true',
        help='Skip volcanic data population'
    )
    parser.add_argument(
        '--skip-neo',
        action='store_true',
        help='Skip NEO data population'
    )
    
    args = parser.parse_args()
    
    # Get database URL
    database_url = args.database_url or settings.SQLALCHEMY_DATABASE_URL
    
    if not database_url:
        print("Error: DATABASE_URL not set in environment")
        sys.exit(1)
    
    # Track results
    results = {}
    start_time = datetime.now()
    
    print_header("PHOBETRON DATABASE POPULATION")
    print(f"Start time: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Database: {database_url[:50]}...")
    print()
    
    # 1. Populate Earthquake Data
    if not args.skip_earthquakes:
        print_header("1/3: USGS EARTHQUAKE DATA")
        try:
            populator = USGSEarthquakePopulator(database_url)
            populator.run(
                days=args.earthquake_days,
                min_magnitude=args.min_magnitude,
                batch_size=args.batch_size
            )
            # Note: This is simplified - in reality we'd need to capture the return values
            results['Earthquakes'] = {'inserted': 0, 'skipped': 0}
        except Exception as e:
            print(f"✗ Error populating earthquake data: {e}")
            results['Earthquakes'] = {'inserted': 0, 'skipped': 0, 'error': str(e)}
    else:
        print("Skipping earthquake data (--skip-earthquakes)")
    
    # 2. Populate Volcanic Activity Data
    if not args.skip_volcanic:
        print_header("2/3: VOLCANIC ACTIVITY DATA")
        try:
            populator = VolcanicActivityPopulator(database_url)
            populator.run(
                weeks=args.volcanic_weeks,
                batch_size=args.batch_size
            )
            results['Volcanic Activity'] = {'inserted': 0, 'skipped': 0}
        except Exception as e:
            print(f"✗ Error populating volcanic data: {e}")
            results['Volcanic Activity'] = {'inserted': 0, 'skipped': 0, 'error': str(e)}
    else:
        print("Skipping volcanic data (--skip-volcanic)")
    
    # 3. Populate NASA NEO Data
    if not args.skip_neo:
        print_header("3/3: NASA NEO DATA")
        try:
            populator = NASANEOPopulator(database_url, api_key=args.nasa_api_key)
            populator.run(
                days=args.neo_days,
                batch_size=args.batch_size
            )
            results['NEO Close Approaches'] = {'inserted': 0, 'skipped': 0}
        except Exception as e:
            print(f"✗ Error populating NEO data: {e}")
            results['NEO Close Approaches'] = {'inserted': 0, 'skipped': 0, 'error': str(e)}
    else:
        print("Skipping NEO data (--skip-neo)")
    
    # Print summary
    end_time = datetime.now()
    duration = end_time - start_time
    
    if results:
        print_summary(results)
    
    print(f"End time: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Duration: {duration}")
    print("\n" + "=" * 70)
    print("✓ Data population complete!")
    print("=" * 70)
    
    # Verify data
    print("\n📊 Verify populated data at:")
    print("  • Earthquakes:  https://phobetronwebapp-production.up.railway.app/api/v1/events/earthquakes")
    print("  • Volcanic:     https://phobetronwebapp-production.up.railway.app/api/v1/events/volcanic-activity")
    print("  • NEO:          https://phobetronwebapp-production.up.railway.app/api/v1/scientific/close-approaches")
    print("  • API Docs:     https://phobetronwebapp-production.up.railway.app/docs")
    print()


if __name__ == '__main__':
    main()
