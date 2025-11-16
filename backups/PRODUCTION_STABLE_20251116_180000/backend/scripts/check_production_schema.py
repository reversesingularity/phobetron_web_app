#!/usr/bin/env python3
"""
Check production database schema
"""

import os
from sqlalchemy import create_engine, text

def check_production_schema():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not set")
        return

    engine = create_engine(database_url)

    try:
        with engine.connect() as conn:
            # Get all tables
            result = conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))

            print("📊 Tables in production database:")
            tables = [row[0] for row in result]
            for table in tables:
                print(f"  - {table}")

            # Check specific tables we're interested in
            event_tables = ['earthquakes', 'volcanic_events', 'hurricanes', 'tsunamis', 'feast_days']
            print("\n🔍 Event tables status:")
            for table in event_tables:
                if table in tables:
                    # Get row count
                    count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table};"))
                    count = count_result.scalar()
                    print(f"  ✅ {table}: {count} records")
                else:
                    print(f"  ❌ {table}: table missing")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_production_schema()