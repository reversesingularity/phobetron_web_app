from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    # Check earthquakes table structure
    result = db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'earthquakes' ORDER BY ordinal_position"))
    columns = result.fetchall()
    print('earthquakes columns:')
    for col in columns[:15]:  # First 15 columns
        print(' ', col[0])

    # Check a sample row
    result = db.execute(text('SELECT * FROM earthquakes LIMIT 1'))
    row = result.fetchone()
    print('Sample earthquake row:')
    print(' ', row[:10] if row else 'No data')

finally:
    db.close()