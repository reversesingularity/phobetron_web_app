#!/usr/bin/env python3
"""
Database State Verification Script
Checks what data exists in production PostgreSQL database
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.core.database import get_db
from sqlalchemy import text


async def verify_database_state():
    """Check current state of all tables"""
    
    tables_to_check = [
        "celestial_events",
        "earthquakes", 
        "solar_events",
        "neo_objects",
        "correlations",
        "prophecies",
        "alerts"
    ]
    
    print("=" * 70)
    print("PHOBETRON DATABASE STATE VERIFICATION")
    print("=" * 70)
    print()
    
    async for db in get_db():
        for table in tables_to_check:
            try:
                # Get row count
                count_query = text(f"SELECT COUNT(*) FROM {table}")
                result = await db.execute(count_query)
                count = result.scalar()
                
                # Get sample row
                sample_query = text(f"SELECT * FROM {table} LIMIT 1")
                sample = await db.execute(sample_query)
                sample_row = sample.fetchone()
                
                status = "✅ HAS DATA" if count > 0 else "❌ EMPTY"
                print(f"{table:25} {status:15} ({count:,} rows)")
                
                if sample_row:
                    print(f"  Sample: {dict(sample_row._mapping)}")
                print()
                
            except Exception as e:
                print(f"{table:25} ⚠️ ERROR: {str(e)}")
                print()
    
    print("=" * 70)
    print("VERIFICATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(verify_database_state())
