"""
Quick script to insert feast days directly into Railway production database.
Run this locally: python scripts/quick_insert_feast_days.py
"""
import os
import sys
from datetime import datetime
import psycopg2

# Railway production database URL - set via environment variable
# Usage: $env:DATABASE_URL="postgresql://..."; python scripts/quick_insert_feast_days.py
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set!")
    print("Please get the public DATABASE_URL from Railway dashboard:")
    print("  1. Go to Railway > Postgres service > Variables")
    print("  2. Copy the DATABASE_PUBLIC_URL value")
    print("  3. Run: $env:DATABASE_URL=\"<paste-url-here>\"; python scripts/quick_insert_feast_days.py")
    sys.exit(1)

def insert_feast_days():
    """Insert 12 feast days for 2024-2025"""
    
    feast_days = [
        # 2024
        ('passover', 'Passover (Pesach)', 'Nisan 14', '2024-04-22', 2024, None, False, 'Celebrates Exodus from Egypt'),
        ('unleavened_bread', 'Unleavened Bread', 'Nisan 15-21', '2024-04-23', 2024, '2024-04-29', True, 'Seven days of unleavened bread'),
        ('pentecost', 'Pentecost (Shavuot)', 'Sivan 6', '2024-06-12', 2024, None, False, 'Giving of Torah, Holy Spirit'),
        ('trumpets', 'Trumpets (Rosh Hashanah)', 'Tishrei 1', '2024-10-03', 2024, None, False, 'Jewish New Year'),
        ('atonement', 'Atonement (Yom Kippur)', 'Tishrei 10', '2024-10-12', 2024, None, False, 'Day of atonement'),
        ('tabernacles', 'Tabernacles (Sukkot)', 'Tishrei 15-21', '2024-10-17', 2024, '2024-10-23', True, 'Feast of Tabernacles'),
        # 2025
        ('passover', 'Passover (Pesach)', 'Nisan 14', '2025-04-12', 2025, None, False, 'Celebrates Exodus from Egypt'),
        ('unleavened_bread', 'Unleavened Bread', 'Nisan 15-21', '2025-04-13', 2025, '2025-04-19', True, 'Seven days of unleavened bread'),
        ('pentecost', 'Pentecost (Shavuot)', 'Sivan 6', '2025-06-02', 2025, None, False, 'Giving of Torah, Holy Spirit'),
        ('trumpets', 'Trumpets (Rosh Hashanah)', 'Tishrei 1', '2025-09-23', 2025, None, False, 'Jewish New Year'),
        ('atonement', 'Atonement (Yom Kippur)', 'Tishrei 10', '2025-10-02', 2025, None, False, 'Day of atonement'),
        ('tabernacles', 'Tabernacles (Sukkot)', 'Tishrei 15-21', '2025-10-07', 2025, '2025-10-13', True, 'Feast of Tabernacles'),
    ]
    
    try:
        print(f"Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print(f"Inserting {len(feast_days)} feast days...")
        
        insert_query = """
        INSERT INTO feast_days 
            (feast_type, name, hebrew_date, gregorian_date, gregorian_year, end_date, is_range, significance, data_source, created_at)
        VALUES 
            (%s, %s, %s, %s, %s, %s, %s, %s, 'quick_insert', NOW())
        ON CONFLICT (feast_type, gregorian_year) DO NOTHING
        """
        
        inserted = 0
        for feast in feast_days:
            cur.execute(insert_query, feast)
            if cur.rowcount > 0:
                inserted += 1
                print(f"  ✅ Inserted: {feast[1]} ({feast[3]})")
            else:
                print(f"  ⏭️  Skipped (already exists): {feast[1]} ({feast[3]})")
        
        conn.commit()
        
        # Verify
        cur.execute("SELECT COUNT(*) FROM feast_days")
        total = cur.fetchone()[0]
        
        print(f"\n✅ SUCCESS!")
        print(f"   Inserted: {inserted} feast days")
        print(f"   Total in database: {total} feast days")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        sys.exit(1)

if __name__ == '__main__':
    insert_feast_days()
