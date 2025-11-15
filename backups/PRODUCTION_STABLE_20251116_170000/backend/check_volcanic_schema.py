from sqlalchemy import text
from app.db.session import SessionLocal

db = SessionLocal()

# Check volcanic_activity schema
result = db.execute(text("""
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns 
    WHERE table_name = 'volcanic_activity' 
    ORDER BY ordinal_position
"""))

print("VOLCANIC_ACTIVITY TABLE SCHEMA:")
print("=" * 60)
for row in result:
    print(f"{row[0]:25} {row[1]:20} ({row[2]})")

db.close()
