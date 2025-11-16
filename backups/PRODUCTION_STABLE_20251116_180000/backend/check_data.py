from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    # Check feast days in 2024
    result = db.execute(text("SELECT name, gregorian_date, feast_type FROM feast_days WHERE gregorian_date >= '2024-01-01' AND gregorian_date <= '2024-12-31' ORDER BY gregorian_date"))
    feast_days = result.fetchall()
    print('Found', len(feast_days), 'feast days in 2024')
    for day in feast_days[:5]:
        print(' ', day.name, day.gregorian_date, day.feast_type)

    # Check events
    result = db.execute(text("SELECT COUNT(*) FROM earthquakes WHERE date >= '2024-01-01'"))
    eq_count = result.fetchone()[0]
    print('Earthquakes in 2024:', eq_count)

    result = db.execute(text("SELECT COUNT(*) FROM hurricanes WHERE date >= '2024-01-01'"))
    hu_count = result.fetchone()[0]
    print('Hurricanes in 2024:', hu_count)

finally:
    db.close()
    db.close()