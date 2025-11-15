from sqlalchemy import text
from app.db.session import SessionLocal

db = SessionLocal()
result = db.execute(text("""
    SELECT column_name, column_default, is_nullable, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'earthquakes' 
    ORDER BY ordinal_position
"""))

print("EARTHQUAKES TABLE SCHEMA:")
print("=" * 80)
for row in result:
    default = str(row[1]) if row[1] else "None"
    print(f"{row[0]:25} | Default: {default:30} | Nullable: {row[2]:3} | Type: {row[3]}")
db.close()
