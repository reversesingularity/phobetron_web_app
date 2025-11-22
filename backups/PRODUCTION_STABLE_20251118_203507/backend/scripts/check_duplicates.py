"""Check for duplicate prophecy records in the database."""
import os
from sqlalchemy import create_engine, text

# Get database URL from environment or use default
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+psycopg://celestial_app:celestial2025@localhost:5432/celestial_signs')

engine = create_engine(DATABASE_URL)

print("\n=== DUPLICATE PROPHECY RECORDS ===\n")

with engine.connect() as conn:
    # Count duplicates by event_name
    result = conn.execute(text("""
        SELECT event_name, COUNT(*) as count, 
               STRING_AGG(id::text, ', ' ORDER BY id) as ids
        FROM prophecies
        GROUP BY event_name
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC, event_name
    """))
    
    duplicates = result.fetchall()
    
    if duplicates:
        print(f"Found {len(duplicates)} events with duplicate records:\n")
        print(f"{'Event Name':<50} {'Count':>5} {'IDs'}")
        print("-" * 100)
        
        total_duplicates = 0
        for event_name, count, ids in duplicates:
            print(f"{event_name:<50} {count:>5} {ids}")
            total_duplicates += (count - 1)  # Extra records beyond the first
        
        print("-" * 100)
        print(f"\nTotal: {len(duplicates)} unique events with duplicates")
        print(f"Total duplicate records to remove: {total_duplicates}")
        
        # Show total record count
        total_result = conn.execute(text("SELECT COUNT(*) FROM prophecies"))
        total_count = total_result.scalar()
        unique_result = conn.execute(text("SELECT COUNT(DISTINCT event_name) FROM prophecies"))
        unique_count = unique_result.scalar()
        
        print(f"\nDatabase stats:")
        print(f"  Total records: {total_count}")
        print(f"  Unique events: {unique_count}")
        print(f"  Should be: {unique_count} records (one per event)")
    else:
        print("No duplicates found!")
