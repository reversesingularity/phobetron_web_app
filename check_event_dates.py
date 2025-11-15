from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()

print('=== EVENT DATE RANGES ===\n')

tables = {
    'earthquakes': 'event_time',
    'volcanic_activity': 'eruption_start',
    'hurricanes': 'formation_date',
    'tsunamis': 'event_date'
}

for table, date_col in tables.items():
    result = db.execute(text(f'SELECT MIN({date_col}) as min_date, MAX({date_col}) as max_date, COUNT(*) as count FROM {table}'))
    row = result.fetchone()
    print(f'{table:20} ({row.count:3} rows): {row.min_date} to {row.max_date}')

print('\n=== FEAST DAYS DATE RANGE ===\n')
result = db.execute(text('SELECT MIN(gregorian_date) as min_date, MAX(gregorian_date) as max_date, COUNT(*) as count FROM feast_days'))
row = result.fetchone()
print(f'feast_days          ({row.count:3} rows): {row.min_date} to {row.max_date}')

db.close()
