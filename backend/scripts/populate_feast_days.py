"""
Populate Feast Days Database
Calculates and stores biblical feast days for 2020-2030 using Hebrew calendar module
"""

import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.theological import FeastDay
from app.integrations.hebrew_calendar import HebrewCalendar


def populate_feast_days(start_year: int = 2020, end_year: int = 2030):
    """
    Populate feast_days table with biblical feast days
    
    Args:
        start_year: Starting Gregorian year (default 2020)
        end_year: Ending Gregorian year (default 2030)
    """
    db = SessionLocal()
    
    try:
        print(f"🕎 Populating Feast Days: {start_year}-{end_year}\n")
        
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
                    
                    feast_record = FeastDay(
                        feast_type=feast_key,
                        name=feast_data['name'],
                        hebrew_date=feast_data['hebrew_date'],
                        gregorian_date=feast_data['start_date'],
                        gregorian_year=year,
                        end_date=feast_data['end_date'],
                        is_range=True,
                        significance=feast_data['significance'],
                        data_source="hebrew_calendar_module"
                    )
                else:
                    # Single-day feast
                    existing = db.query(FeastDay).filter(
                        FeastDay.feast_type == feast_key,
                        FeastDay.gregorian_year == year
                    ).first()
                    
                    if existing:
                        total_skipped += 1
                        continue
                    
                    feast_record = FeastDay(
                        feast_type=feast_key,
                        name=feast_data['name'],
                        hebrew_date=feast_data['hebrew_date'],
                        gregorian_date=feast_data['date'],
                        gregorian_year=year,
                        is_range=False,
                        significance=feast_data['significance'],
                        data_source="hebrew_calendar_module"
                    )
                
                db.add(feast_record)
                total_inserted += 1
                
                # Display added feast
                if feast_data['is_range']:
                    date_str = f"{feast_data['start_date'].strftime('%B %d')} - {feast_data['end_date'].strftime('%B %d, %Y')}"
                else:
                    date_str = feast_data['date'].strftime('%B %d, %Y')
                
                print(f"   ✅ {feast_data['name']}: {date_str}")
            
            # Commit after each year
            db.commit()
        
        print(f"\n{'='*60}")
        print(f"✅ Feast Days Population Complete!")
        print(f"{'='*60}")
        print(f"Total Inserted: {total_inserted}")
        print(f"Total Skipped (duplicates): {total_skipped}")
        print(f"Years Processed: {end_year - start_year + 1}")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def verify_feast_days():
    """Verify feast days were inserted correctly"""
    db = SessionLocal()
    
    try:
        print("🔍 Verifying Feast Days Database...\n")
        
        # Count total records
        total_count = db.query(FeastDay).count()
        print(f"Total Feast Day Records: {total_count}")
        
        # Count by feast type
        feast_types = ['passover', 'unleavened_bread', 'pentecost', 
                      'trumpets', 'atonement', 'tabernacles']
        
        print("\nBreakdown by Feast Type:")
        for feast_type in feast_types:
            count = db.query(FeastDay).filter(FeastDay.feast_type == feast_type).count()
            print(f"   {feast_type}: {count}")
        
        # Show sample records for 2025
        print("\n📋 Sample: 2025 Feast Days:")
        feasts_2025 = db.query(FeastDay).filter(FeastDay.gregorian_year == 2025).all()
        
        for feast in feasts_2025:
            if feast.is_range:
                date_str = f"{feast.gregorian_date.strftime('%B %d')} - {feast.end_date.strftime('%B %d, %Y')}"
            else:
                date_str = feast.gregorian_date.strftime('%B %d, %Y')
            
            print(f"   🕎 {feast.name}")
            print(f"      Gregorian: {date_str}")
            print(f"      Hebrew: {feast.hebrew_date}")
        
        print("\n✅ Verification Complete!\n")
        
    except Exception as e:
        print(f"\n❌ Verification Error: {e}\n")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*60)
    print(" 🕎 FEAST DAYS DATABASE POPULATION")
    print("="*60 + "\n")
    
    # Populate feast days for 2020-2030
    populate_feast_days(2020, 2030)
    
    # Verify the data
    verify_feast_days()
