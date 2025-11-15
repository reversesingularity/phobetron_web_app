#!/usr/bin/env python3
"""
Populate Production Database with Feast Days
Connects to Railway production database and populates feast days
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.theological import FeastDay
from app.integrations.hebrew_calendar import HebrewCalendar


def populate_production_feast_days(database_url: str, start_year: int = 2020, end_year: int = 2030):
    """
    Populate feast_days table in production database

    Args:
        database_url: Railway production database URL
        start_year: Starting Gregorian year
        end_year: Ending Gregorian year
    """

    # Create engine with production database
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionLocal()

    try:
        print(f"🕎 Populating Production Feast Days: {start_year}-{end_year}")
        print(f"📍 Database: {database_url.split('@')[1] if '@' in database_url else 'Railway'}")
        print()

        # Track statistics
        total_inserted = 0
        total_skipped = 0

        for year in range(start_year, end_year + 1):
            print(f"📅 Processing {year}...")

            # Get all feasts for this year
            year_feasts = HebrewCalendar.get_all_feasts(year)

            for feast_key, feast_data in year_feasts.items():
                # Check if this feast already exists
                if feast_data['is_range']:
                    # Range-based feast (Unleavened Bread, Tabernacles)
                    existing = db.query(FeastDay).filter(
                        FeastDay.feast_type == feast_key,
                        FeastDay.gregorian_year == year
                    ).first()

                    if existing:
                        total_skipped += 1
                        continue

                    # Create new feast day record
                    feast = FeastDay(
                        feast_type=feast_key,
                        feast_name=feast_data['name'],
                        gregorian_year=year,
                        gregorian_start_date=feast_data['start_date'],
                        gregorian_end_date=feast_data['end_date'],
                        hebrew_year=feast_data['hebrew_year'],
                        hebrew_start_date=feast_data['hebrew_start'],
                        hebrew_end_date=feast_data['hebrew_end'],
                        significance=feast_data['significance'],
                        is_range=True
                    )
                else:
                    # Single date feast
                    existing = db.query(FeastDay).filter(
                        FeastDay.feast_type == feast_key,
                        FeastDay.gregorian_year == year
                    ).first()

                    if existing:
                        total_skipped += 1
                        continue

                    # Create new feast day record
                    feast = FeastDay(
                        feast_type=feast_key,
                        feast_name=feast_data['name'],
                        gregorian_year=year,
                        gregorian_date=feast_data['date'],
                        hebrew_year=feast_data['hebrew_year'],
                        hebrew_date=feast_data['hebrew_date'],
                        significance=feast_data['significance'],
                        is_range=False
                    )

                db.add(feast)
                total_inserted += 1

            db.commit()

        print("\n✅ Production Population Complete!")
        print(f"   📊 Inserted: {total_inserted} feast days")
        print(f"   ⏭️  Skipped: {total_skipped} duplicates")
        print(f"   📅 Years: {start_year}-{end_year}")

    except Exception as e:
        print(f"\n❌ Production Population Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def verify_production_feast_days(database_url: str):
    """Verify feast days were populated in production"""
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionLocal()

    try:
        total_feasts = db.query(FeastDay).count()
        print(f"\n🔍 Production Verification:")
        print(f"   📊 Total feast days: {total_feasts}")

        if total_feasts > 0:
            # Show sample feasts
            sample_feasts = db.query(FeastDay).limit(5).all()
            print("   📅 Sample feast days:")
            for feast in sample_feasts:
                date_str = f"{feast.gregorian_start_date} - {feast.gregorian_end_date}" if feast.is_range else str(feast.gregorian_date)
                print(f"      • {feast.feast_name}: {date_str}")
        else:
            print("   ⚠️  No feast days found!")

    except Exception as e:
        print(f"\n❌ Verification Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*60)
    print(" 🚀 PRODUCTION FEAST DAYS POPULATION")
    print("="*60)

    # Get production database URL
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable not set")
        print("   Set it with: $env:DATABASE_URL='your_railway_database_url'")
        sys.exit(1)

    # Populate feast days for 2020-2030 (current analysis range)
    populate_production_feast_days(database_url, 2020, 2030)

    # Verify the data
    verify_production_feast_days(database_url)

    print("\n🎯 Production database is now ready for pattern detection!")