import psycopg2

conn = psycopg2.connect('postgresql://postgres:HMivJnZuUaxLpYCxFBCMLbAhqARfgHXJ@nozomi.proxy.rlwy.net:31417/railway')
cur = conn.cursor()

# Check Alembic version
try:
    cur.execute('SELECT version FROM alembic_version')
    version = cur.fetchone()
    print(f'Current migration: {version[0] if version else "None"}')
except Exception as e:
    print(f'No alembic_version table: {e}')

# Check existing tables
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
tables = cur.fetchall()
print(f'\nTables in database ({len(tables)}):')
for table in tables:
    print(f'  - {table[0]}')

# Check if earthquakes table exists and its structure
try:
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'earthquakes' 
        ORDER BY ordinal_position
    """)
    columns = cur.fetchall()
    if columns:
        print(f'\nEarthquakes table columns:')
        for col in columns:
            print(f'  - {col[0]}: {col[1]}')
except Exception as e:
    print(f'No earthquakes table: {e}')

conn.close()
