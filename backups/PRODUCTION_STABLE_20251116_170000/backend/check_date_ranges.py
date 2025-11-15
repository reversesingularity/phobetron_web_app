import psycopg2
from datetime import datetime

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="celestial_signs",
    user="celestial_app",
    password="celestial2025"
)

cur = conn.cursor()

# Check feast days range
cur.execute("SELECT MIN(gregorian_date), MAX(gregorian_date), COUNT(*) FROM feast_days;")
min_date, max_date, feast_count = cur.fetchone()
print(f"\nFEAST DAYS:")
print(f"  Range: {min_date} to {max_date}")
print(f"  Count: {feast_count}")

# Check earthquakes range  
cur.execute("SELECT MIN(event_time::date), MAX(event_time::date), COUNT(*) FROM earthquakes WHERE magnitude >= 6.0;")
min_date, max_date, eq_count = cur.fetchone()
print(f"\nEARTHQUAKES (magnitude >= 6.0):")
print(f"  Range: {min_date} to {max_date}")
print(f"  Count: {eq_count}")

# Check if there are any earthquakes in the test range
cur.execute("""
    SELECT COUNT(*) FROM earthquakes 
    WHERE magnitude >= 6.0 
    AND event_time::date BETWEEN '2000-01-01' AND '2024-12-31';
""")
count = cur.fetchone()[0]
print(f"\nEARTHQUAKES in 2000-2024 range (mag >= 6.0): {count}")

# Check feast days in test range
cur.execute("""
    SELECT COUNT(*) FROM feast_days 
    WHERE gregorian_date BETWEEN '2000-01-01' AND '2024-12-31';
""")
count = cur.fetchone()[0]
print(f"FEAST DAYS in 2000-2024 range: {count}")

cur.close()
conn.close()
