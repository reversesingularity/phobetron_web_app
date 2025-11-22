"""
Fix production prophecies: Remove duplicates and populate scripture text.
Run this via Railway dashboard shell.
"""
import os
import json
from pathlib import Path
from sqlalchemy import create_engine, text

# Get database URL from Railway environment
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set")
    exit(1)

# Convert postgres:// to postgresql:// if needed
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

print(f"\n{'='*60}")
print("PRODUCTION PROPHECY FIX SCRIPT")
print(f"{'='*60}\n")

engine = create_engine(DATABASE_URL)

# STEP 1: Deduplicate prophecies
print("STEP 1: DEDUPLICATING PROPHECY RECORDS\n")

with engine.begin() as conn:
    # Check current state
    before_result = conn.execute(text("SELECT COUNT(*) FROM prophecies"))
    before_count = before_result.scalar()
    print(f"Records before deduplication: {before_count}")
    
    # Count unique events
    unique_result = conn.execute(text("SELECT COUNT(DISTINCT event_name) FROM prophecies"))
    unique_count = unique_result.scalar()
    print(f"Unique event names: {unique_count}")
    print(f"Duplicate records to remove: {before_count - unique_count}\n")
    
    # Delete duplicates, keeping only the record with the lowest ID for each event_name
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
    print(f"Records after deduplication: {after_count}\n")

# STEP 2: Populate scripture text
print("STEP 2: POPULATING SCRIPTURE TEXT\n")

# Load scripture mappings
SCRIPT_DIR = Path(__file__).parent
MAPPINGS_FILE = SCRIPT_DIR / "scripture_mappings.json"

if not MAPPINGS_FILE.exists():
    print(f"ERROR: Scripture mappings file not found: {MAPPINGS_FILE}")
    exit(1)

with open(MAPPINGS_FILE, 'r', encoding='utf-8') as f:
    mappings = json.load(f)

print(f"Loaded {len(mappings)} scripture mappings")

# Update each prophecy
success_count = 0
failed_count = 0

with engine.begin() as conn:
    for event_name, scripture_data in mappings.items():
        scripture_text = scripture_data.get('text', '')
        
        if not scripture_text:
            print(f"⚠️  No scripture text for '{event_name}'")
            failed_count += 1
            continue
        
        try:
            query = text("""
                UPDATE prophecies
                SET scripture_text = :scripture_text
                WHERE event_name = :event_name
            """)
            
            result = conn.execute(
                query,
                {
                    'scripture_text': scripture_text,
                    'event_name': event_name
                }
            )
            
            if result.rowcount == 0:
                print(f"⚠️  No prophecy found: '{event_name}'")
                failed_count += 1
            else:
                print(f"✅ Updated '{event_name}'")
                success_count += 1
                
        except Exception as e:
            print(f"❌ Failed to update '{event_name}': {e}")
            failed_count += 1

print(f"\n{'='*60}")
print("SUMMARY")
print(f"{'='*60}")
print(f"Scripture updates successful: {success_count}")
print(f"Scripture updates failed: {failed_count}")

# Final verification
with engine.connect() as conn:
    total_query = text("SELECT COUNT(*) FROM prophecies")
    total = conn.execute(total_query).scalar()
    
    populated_query = text("""
        SELECT COUNT(*) FROM prophecies 
        WHERE scripture_text IS NOT NULL 
        AND scripture_text != ''
    """)
    populated = conn.execute(populated_query).scalar()
    
    null_query = text("""
        SELECT COUNT(*) FROM prophecies 
        WHERE scripture_text IS NULL OR scripture_text = ''
    """)
    null_count = conn.execute(null_query).scalar()
    
    print(f"\nFinal Database State:")
    print(f"  Total prophecies: {total}")
    print(f"  With scripture text: {populated}")
    print(f"  Without scripture text: {null_count}")

if null_count == 0:
    print(f"\n✅ SUCCESS: All prophecies have scripture text!")
else:
    print(f"\n⚠️  WARNING: {null_count} prophecies still missing scripture text")

print(f"{'='*60}\n")
