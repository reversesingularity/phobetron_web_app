#!/usr/bin/env python3
"""
Check feast_days table schema
"""

import os
from sqlalchemy import create_engine, text

def check_feast_days_schema():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not set")
        return

    engine = create_engine(database_url)

    try:
        with engine.connect() as conn:
            # Get feast_days table schema
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'feast_days'
                ORDER BY ordinal_position;
            """))

            print("🔍 feast_days table schema:")
            for row in result:
                print(f"  - {row[0]}: {row[1]}")

            # Get a few sample records
            result = conn.execute(text("""
                SELECT * FROM feast_days LIMIT 5;
            """))

            print("\n📅 Sample feast_days records:")
            for row in result:
                print(f"  {dict(row)}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_feast_days_schema()