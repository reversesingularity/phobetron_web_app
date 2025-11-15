from sqlalchemy import text
from app.db.session import SessionLocal

db = SessionLocal()
result = db.execute(text("SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'tsunamis'::regclass AND contype = 'c'"))
print("TSUNAMIS CHECK CONSTRAINTS:")
for row in result:
    print(f"\n{row[0]}:")
    print(f"  {row[1]}")
db.close()
