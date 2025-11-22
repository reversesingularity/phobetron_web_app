#!/usr/bin/env python3
"""
Create celestial_events table directly
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import get_db
from sqlalchemy import text

def create_celestial_events_table():
    """Create the celestial_events table directly"""
    db = next(get_db())

    try:
        # Create table SQL
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS celestial_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type VARCHAR(50) NOT NULL,
            event_date TIMESTAMP NOT NULL,
            magnitude FLOAT,
            duration_hours FLOAT,
            jerusalem_visible BOOLEAN DEFAULT FALSE,
            feast_day VARCHAR(100),
            latitude FLOAT,
            longitude FLOAT,
            significance_score FLOAT DEFAULT 0.5,
            prophecy_correlation_score FLOAT DEFAULT 0.5,
            description TEXT,
            celestial_bodies TEXT[],
            data_source VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_celestial_event_date ON celestial_events(event_date);
        CREATE INDEX IF NOT EXISTS idx_celestial_event_type ON celestial_events(event_type);

        -- Add constraints
        ALTER TABLE celestial_events ADD CONSTRAINT IF NOT EXISTS ck_event_magnitude_range CHECK (magnitude >= 0 AND magnitude <= 10);
        ALTER TABLE celestial_events ADD CONSTRAINT IF NOT EXISTS ck_significance_range CHECK (significance_score >= 0 AND significance_score <= 1);
        ALTER TABLE celestial_events ADD CONSTRAINT IF NOT EXISTS ck_prophecy_range CHECK (prophecy_correlation_score >= 0 AND prophecy_correlation_score <= 1);
        """

        print("Creating celestial_events table...")
        db.execute(text(create_table_sql))
        db.commit()
        print("✅ celestial_events table created successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating table: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_celestial_events_table()