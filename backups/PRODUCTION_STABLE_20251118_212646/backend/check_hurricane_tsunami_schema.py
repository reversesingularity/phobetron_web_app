from sqlalchemy import text
from app.db.session import SessionLocal

for table in ['hurricanes', 'tsunamis']:
    db = SessionLocal()
    result = db.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' ORDER BY ordinal_position"))
    cols = [row[0] for row in result]
    print(f"\n{table.upper()} columns:")
    print(", ".join(cols))
    db.close()
