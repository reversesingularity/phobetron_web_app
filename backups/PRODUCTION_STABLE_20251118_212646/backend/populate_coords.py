import os
from app.db.session import get_db
from sqlalchemy import text

db = next(get_db())
try:
    print("Populating latitude/longitude columns from PostGIS geometry...")

    # Populate earthquakes latitude/longitude from location geometry
    db.execute(text("""
        UPDATE earthquakes
        SET latitude = ST_Y(location::geometry),
            longitude = ST_X(location::geometry)
        WHERE location IS NOT NULL AND (latitude IS NULL OR longitude IS NULL)
    """))
    print("✅ Populated latitude/longitude for earthquakes")

    # Populate volcanic_activity latitude/longitude from location geometry
    db.execute(text("""
        UPDATE volcanic_activity
        SET latitude = ST_Y(location::geometry),
            longitude = ST_X(location::geometry)
        WHERE location IS NOT NULL AND (latitude IS NULL OR longitude IS NULL)
    """))
    print("✅ Populated latitude/longitude for volcanic_activity")

    # Populate hurricanes peak_latitude/peak_longitude from peak_location geometry
    db.execute(text("""
        UPDATE hurricanes
        SET peak_latitude = ST_Y(peak_location::geometry),
            peak_longitude = ST_X(peak_location::geometry)
        WHERE peak_location IS NOT NULL AND (peak_latitude IS NULL OR peak_longitude IS NULL)
    """))
    print("✅ Populated peak_latitude/peak_longitude for hurricanes")

    # Populate tsunamis source_latitude/source_longitude from source_location geometry
    db.execute(text("""
        UPDATE tsunamis
        SET source_latitude = ST_Y(source_location::geometry),
            source_longitude = ST_X(source_location::geometry)
        WHERE source_location IS NOT NULL AND (source_latitude IS NULL OR source_longitude IS NULL)
    """))
    print("✅ Populated source_latitude/source_longitude for tsunamis")

    db.commit()
    print("\n🎉 All coordinates populated successfully!")

finally:
    db.close()