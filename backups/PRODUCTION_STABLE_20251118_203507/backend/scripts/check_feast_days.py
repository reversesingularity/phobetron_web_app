#!/usr/bin/env python3
"""
Check feast days in database
"""

import os
from sqlalchemy import create_engine, text

def check_feast_days():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not set")
        return

    engine = create_engine(database_url)

    try:
        with engine.connect() as conn:
            # Get feast days
            result = conn.execute(text("""
                SELECT name, feast_date
                FROM feast_days
                WHERE feast_date >= '2020-01-01' AND feast_date <= '2025-12-31'
                ORDER BY feast_date;
            """))

            print("📅 Feast days 2020-2025:")
            feast_days = []
            for row in result:
                print(f"  {row[0]}: {row[1]}")
                feast_days.append((row[0], row[1]))

            print(f"\nTotal feast days: {len(feast_days)}")

            # Check for earthquakes near feast days
            if feast_days:
                print("\n🏗️ Checking for earthquakes within 30 days of feast days...")
                for name, feast_date in feast_days[:5]:  # Check first 5
                    result = conn.execute(text("""
                        SELECT COUNT(*) as count, MIN(magnitude) as min_mag, MAX(magnitude) as max_mag
                        FROM earthquakes
                        WHERE event_time >= :start_date AND event_time <= :end_date AND magnitude >= 5.0
                    """), {
                        'start_date': feast_date.replace(day=max(1, feast_date.day - 30)),
                        'end_date': feast_date.replace(day=min(31, feast_date.day + 30))
                    })
                    row = result.fetchone()
                    print(f"  {name} ({feast_date}): {row[0]} earthquakes (mag {row[1] or 0:.1f}-{row[2] or 0:.1f})")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_feast_days()