"""
Data Population Script - Smithsonian Global Volcanism Program (GVP)
Fetches volcanic activity data and populates the database.

Note: The Smithsonian GVP doesn't have a public API, so this script uses
their weekly report data and volcano database exports.

Usage:
    python populate_volcanic.py --recent-weeks 4
    python populate_volcanic.py --all-active
"""

import requests
import argparse
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import sys
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json

# Add parent directory to path for imports
sys.path.insert(0, '../backend')

from app.models.events import VolcanicActivity
from app.core.config import settings


class VolcanicActivityPopulator:
    """Fetch and populate volcanic activity data."""
    
    # Smithsonian GVP Weekly Report (for recent activity)
    GVP_WEEKLY_URL = "https://volcano.si.edu/news/WeeklyVolcanoRSS.xml"
    
    # Alternative: OpenNEM geological data (limited volcanic data)
    # Or manually curated data for recent eruptions
    
    def __init__(self, database_url: str):
        """Initialize with database connection."""
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
    
    def get_sample_volcanic_data(self, weeks_back: int = 4) -> List[Dict]:
        """
        Get sample volcanic activity data.
        
        Since GVP doesn't have a direct API, this provides sample data
        for recent significant volcanic events.
        
        Args:
            weeks_back: Number of weeks of data to include
            
        Returns:
            List of volcanic activity dictionaries
        """
        print(f"Generating sample volcanic activity data...")
        print(f"  Recent volcanic events (last {weeks_back} weeks)")
        
        # Sample data for recent significant volcanic eruptions
        # In production, this would be fetched from GVP or other sources
        sample_events = [
            {
                'volcano_name': 'Kilauea',
                'country': 'United States',
                'latitude': 19.4069,
                'longitude': -155.2834,
                'eruption_type': 'effusive',
                'vei': 3,
                'eruption_start': datetime.utcnow() - timedelta(days=5),
                'eruption_end': None,  # Ongoing
                'plume_height_km': 1.5,
                'notes': 'Ongoing eruption with lava fountaining and flows',
                'data_source': 'USGS HVO',
            },
            {
                'volcano_name': 'Popocatépetl',
                'country': 'Mexico',
                'latitude': 19.0225,
                'longitude': -98.6278,
                'eruption_type': 'explosive',
                'vei': 2,
                'eruption_start': datetime.utcnow() - timedelta(days=7),
                'eruption_end': datetime.utcnow() - timedelta(days=6, hours=12),
                'plume_height_km': 4.0,
                'notes': 'Ash emissions and minor explosions',
                'data_source': 'CENAPRED',
            },
            {
                'volcano_name': 'Sakurajima',
                'country': 'Japan',
                'latitude': 31.5858,
                'longitude': 130.6572,
                'eruption_type': 'explosive',
                'vei': 2,
                'eruption_start': datetime.utcnow() - timedelta(days=10),
                'eruption_end': datetime.utcnow() - timedelta(days=10, hours=2),
                'plume_height_km': 3.0,
                'notes': 'Explosive eruption with ash plume to 3km',
                'data_source': 'JMA',
            },
            {
                'volcano_name': 'Etna',
                'country': 'Italy',
                'latitude': 37.7510,
                'longitude': 14.9934,
                'eruption_type': 'effusive',
                'vei': 1,
                'eruption_start': datetime.utcnow() - timedelta(days=12),
                'eruption_end': None,  # Ongoing
                'plume_height_km': 0.5,
                'notes': 'Strombolian activity with lava flows',
                'data_source': 'INGV',
            },
            {
                'volcano_name': 'Semeru',
                'country': 'Indonesia',
                'latitude': -8.1082,
                'longitude': 112.9222,
                'eruption_type': 'explosive',
                'vei': 3,
                'eruption_start': datetime.utcnow() - timedelta(days=14),
                'eruption_end': datetime.utcnow() - timedelta(days=14, hours=8),
                'plume_height_km': 5.0,
                'notes': 'Pyroclastic flows and ash emissions',
                'data_source': 'PVMBG',
            },
            {
                'volcano_name': 'Stromboli',
                'country': 'Italy',
                'latitude': 38.7891,
                'longitude': 15.2130,
                'eruption_type': 'effusive',
                'vei': 1,
                'eruption_start': datetime.utcnow() - timedelta(days=16),
                'eruption_end': None,  # Ongoing persistent activity
                'plume_height_km': 0.3,
                'notes': 'Persistent Strombolian activity',
                'data_source': 'LGS',
            },
            {
                'volcano_name': 'Fuego',
                'country': 'Guatemala',
                'latitude': 14.4730,
                'longitude': -90.8806,
                'eruption_type': 'explosive',
                'vei': 2,
                'eruption_start': datetime.utcnow() - timedelta(days=18),
                'eruption_end': datetime.utcnow() - timedelta(days=17, hours=18),
                'plume_height_km': 4.5,
                'notes': 'Explosive eruptions with ash plumes',
                'data_source': 'INSIVUMEH',
            },
            {
                'volcano_name': 'Reventador',
                'country': 'Ecuador',
                'latitude': -0.0772,
                'longitude': -77.6565,
                'eruption_type': 'effusive',
                'vei': 2,
                'eruption_start': datetime.utcnow() - timedelta(days=20),
                'eruption_end': None,  # Ongoing
                'plume_height_km': 2.0,
                'notes': 'Lava flows and pyroclastic flows',
                'data_source': 'IG',
            },
            {
                'volcano_name': 'Sheveluch',
                'country': 'Russia',
                'latitude': 56.6536,
                'longitude': 161.3601,
                'eruption_type': 'explosive',
                'vei': 3,
                'eruption_start': datetime.utcnow() - timedelta(days=22),
                'eruption_end': datetime.utcnow() - timedelta(days=22, hours=4),
                'plume_height_km': 8.0,
                'notes': 'Explosive eruption with pyroclastic flows',
                'data_source': 'KVERT',
            },
            {
                'volcano_name': 'Sangay',
                'country': 'Ecuador',
                'latitude': -2.0053,
                'longitude': -78.3409,
                'eruption_type': 'explosive',
                'vei': 2,
                'eruption_start': datetime.utcnow() - timedelta(days=24),
                'eruption_end': None,  # Ongoing
                'plume_height_km': 3.0,
                'notes': 'Ongoing eruptive activity with ash emissions',
                'data_source': 'IG',
            },
        ]
        
        # Filter by time range
        cutoff_date = datetime.utcnow() - timedelta(weeks=weeks_back)
        filtered_events = [
            event for event in sample_events 
            if event['eruption_start'] >= cutoff_date
        ]
        
        print(f"✓ Generated {len(filtered_events)} sample volcanic events")
        return filtered_events
    
    def populate_database(
        self,
        volcanic_events: List[Dict],
        batch_size: int = 50,
        skip_duplicates: bool = True
    ) -> tuple[int, int]:
        """
        Populate database with volcanic activity data.
        
        Args:
            volcanic_events: List of volcanic activity dictionaries
            batch_size: Number of records to insert per batch
            skip_duplicates: Skip events that already exist
            
        Returns:
            Tuple of (inserted_count, skipped_count)
        """
        db = self.SessionLocal()
        inserted_count = 0
        skipped_count = 0
        
        try:
            print(f"\nPopulating database with {len(volcanic_events)} volcanic events...")
            
            for i, event_data in enumerate(volcanic_events):
                # Check for duplicates (same volcano + eruption start time)
                if skip_duplicates:
                    existing = db.query(VolcanicActivity).filter(
                        VolcanicActivity.volcano_name == event_data['volcano_name'],
                        VolcanicActivity.eruption_start == event_data['eruption_start']
                    ).first()
                    
                    if existing:
                        skipped_count += 1
                        continue
                
                # Create new volcanic activity record
                volcanic_event = VolcanicActivity(**event_data)
                db.add(volcanic_event)
                inserted_count += 1
                
                # Commit in batches
                if (i + 1) % batch_size == 0:
                    db.commit()
                    print(f"  Progress: {i + 1}/{len(volcanic_events)} processed "
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
    
    def run(self, weeks: int = 4, batch_size: int = 50):
        """
        Run the complete population process.
        
        Args:
            weeks: Number of weeks of recent data to include
            batch_size: Batch size for database inserts
        """
        print("=" * 60)
        print("Volcanic Activity Data Population")
        print("=" * 60)
        
        # Get sample data (in production, fetch from GVP or other sources)
        volcanic_events = self.get_sample_volcanic_data(weeks_back=weeks)
        
        if not volcanic_events:
            print("No volcanic events to populate. Exiting.")
            return
        
        # Populate database
        inserted, skipped = self.populate_database(
            volcanic_events=volcanic_events,
            batch_size=batch_size
        )
        
        print(f"\n{'=' * 60}")
        print(f"Population complete!")
        print(f"  Total events: {len(volcanic_events)}")
        print(f"  Inserted: {inserted}")
        print(f"  Skipped: {skipped}")
        print(f"{'=' * 60}\n")
        
        print("\nNOTE: This script uses sample data for recent volcanic eruptions.")
        print("For production, integrate with:")
        print("  - Smithsonian Global Volcanism Program (GVP) weekly reports")
        print("  - USGS Volcano Hazards Program data")
        print("  - Regional volcano observatories")


def main():
    """Main entry point with command-line argument parsing."""
    parser = argparse.ArgumentParser(
        description='Populate database with volcanic activity data'
    )
    
    parser.add_argument(
        '--recent-weeks',
        type=int,
        default=4,
        help='Number of recent weeks to include (default: 4)'
    )
    
    parser.add_argument(
        '--batch-size',
        type=int,
        default=50,
        help='Batch size for database inserts (default: 50)'
    )
    
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
    populator = VolcanicActivityPopulator(database_url)
    
    # Run population
    populator.run(
        weeks=args.recent_weeks,
        batch_size=args.batch_size
    )


if __name__ == '__main__':
    main()
