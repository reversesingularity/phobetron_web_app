"""Remove duplicate prophecy records, keeping the oldest record for each event_name."""
import os
from sqlalchemy import create_engine, text

# Get database URL from environment or use default
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+psycopg://celestial_app:celestial2025@localhost:5432/celestial_signs')

engine = create_engine(DATABASE_URL)

print("\n=== DEDUPLICATING PROPHECY RECORDS ===\n")

with engine.begin() as conn:
    # First, show current state
    before_result = conn.execute(text("SELECT COUNT(*) FROM prophecies"))
    before_count = before_result.scalar()
    print(f"Records before deduplication: {before_count}")
    
    # Count unique events
    unique_result = conn.execute(text("SELECT COUNT(DISTINCT event_name) FROM prophecies"))
    unique_count = unique_result.scalar()
    print(f"Unique event names: {unique_count}")
    print(f"Duplicate records to remove: {before_count - unique_count}\n")
    
    # Delete duplicates, keeping only the record with the lowest ID for each event_name
    # This preserves the original record and removes later duplicates
    delete_query = text("""
        DELETE FROM prophecies
        WHERE id NOT IN (
            SELECT MIN(id)
            FROM prophecies
            GROUP BY event_name
        )
    """)
    
    result = conn.execute(delete_query)
    deleted_count = result.rowcount
    
    print(f"✅ Deleted {deleted_count} duplicate records")
    
    # Verify final state
    after_result = conn.execute(text("SELECT COUNT(*) FROM prophecies"))
    after_count = after_result.scalar()
    print(f"Records after deduplication: {after_count}")
    
    # Double-check no duplicates remain
    duplicates_check = conn.execute(text("""
        SELECT COUNT(*) 
        FROM (
            SELECT event_name, COUNT(*) as cnt
            FROM prophecies
            GROUP BY event_name
            HAVING COUNT(*) > 1
        ) AS dupes
    """))
    remaining_duplicates = duplicates_check.scalar()
    
    if remaining_duplicates == 0:
        print("\n✅ SUCCESS: All duplicates removed!")
        print(f"   Database now has {after_count} unique prophecy records")
    else:
        print(f"\n⚠️  WARNING: {remaining_duplicates} events still have duplicates")

print("\n=== DEDUPLICATION COMPLETE ===\n")
