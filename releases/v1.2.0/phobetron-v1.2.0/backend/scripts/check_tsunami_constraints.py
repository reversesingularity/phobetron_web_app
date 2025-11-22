#!/usr/bin/env python3
"""
Check tsunami constraints
"""

import os
from sqlalchemy import create_engine, text

def check_tsunami_constraints():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not set")
        return

    engine = create_engine(database_url)

    try:
        with engine.connect() as conn:
            # Get tsunami constraints
            result = conn.execute(text("""
                SELECT conname, pg_get_constraintdef(oid)
                FROM pg_constraint
                WHERE conname LIKE '%tsunami%';
            """))

            print("🔍 Tsunami constraints:")
            for row in result:
                print(f"  {row[0]}: {row[1]}")

            # Also check what enum types exist
            enum_result = conn.execute(text("""
                SELECT typname, enumtypid::regtype, enumlabel
                FROM pg_enum
                JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
                WHERE typname LIKE '%tsunami%' OR typname LIKE '%source%'
                ORDER BY typname, enumsortorder;
            """))

            print("\n🔍 Enum types:")
            for row in enum_result:
                print(f"  {row[0]}: {row[2]}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_tsunami_constraints()