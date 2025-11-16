"""
Check current database contents
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = 'postgresql://postgres:diAzWOwKuEhKBcNLcZlsVqfwHrptCQlt@crossover.proxy.rlwy.net:44440/railway'
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Check earthquake data
    result = db.execute(text('SELECT COUNT(*) as count, MIN(event_time) as min_date, MAX(event_time) as max_date FROM earthquakes'))
    row = result.fetchone()
    print(f'Earthquakes: {row[0]} records, date range: {row[1]} to {row[2]}')

    # Check volcanic data
    result = db.execute(text('SELECT COUNT(*) as count, MIN(eruption_start) as min_date, MAX(eruption_start) as max_date FROM volcanic_activity'))
    row = result.fetchone()
    print(f'Volcanic: {row[0]} records, date range: {row[1]} to {row[2]}')

    # Check feast days
    result = db.execute(text('SELECT COUNT(*) as count, MIN(gregorian_date) as min_date, MAX(gregorian_date) as max_date FROM feast_days'))
    row = result.fetchone()
    print(f'Feast Days: {row[0]} records, date range: {row[1]} to {row[2]}')

    # Check recent earthquakes (2024)
    result = db.execute(text("SELECT COUNT(*) FROM earthquakes WHERE event_time >= '2024-01-01'"))
    row = result.fetchone()
    print(f'Earthquakes in 2024+: {row[0]} records')

    # Check hurricanes
    result = db.execute(text('SELECT COUNT(*) as count, MIN(formation_date) as min_date, MAX(formation_date) as max_date FROM hurricanes'))
    row = result.fetchone()
    print(f'Hurricanes: {row[0]} records, date range: {row[1]} to {row[2]}')

    # Check tsunamis
    result = db.execute(text('SELECT COUNT(*) as count, MIN(event_date) as min_date, MAX(event_date) as max_date FROM tsunamis'))
    row = result.fetchone()
    print(f'Tsunamis: {row[0]} records, date range: {row[1]} to {row[2]}')

finally:
    db.close()