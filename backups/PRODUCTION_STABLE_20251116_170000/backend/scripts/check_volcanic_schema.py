#!/usr/bin/env python3
"""
Check volcanic_activity table schema
"""

import os
from sqlalchemy import create_engine, text

def check_volcanic_schema():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not set")
        return

    engine = create_engine(database_url)

    try:
        with engine.connect() as conn:
            # Get volcanic_activity table schema
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'volcanic_activity'
                ORDER BY ordinal_position;
            """))

            print("🔍 volcanic_activity table schema:")
            for row in result:
                nullable = "NULL" if row[2] == 'YES' else "NOT NULL"
                print(f"  - {row[0]}: {row[1]} {nullable}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_volcanic_schema()