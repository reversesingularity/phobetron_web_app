"""
Verify theological schema in database.
Quick script to check that all theological tables and relationships exist.
"""
from sqlalchemy import create_engine, text, inspect
from app.db.session import DATABASE_URL

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Check tables
    print("=== Tables in Database ===")
    result = conn.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """))
    
    tables = [row[0] for row in result]
    for table in tables:
        print(f"  ✓ {table}")
    
    print(f"\nTotal tables: {len(tables)}")
    
    # Verify theological tables exist
    theological_tables = ['prophecies', 'celestial_signs', 'prophecy_sign_links']
    print("\n=== Theological Tables Check ===")
    for table in theological_tables:
        if table in tables:
            print(f"  ✓ {table}")
        else:
            print(f"  ✗ {table} MISSING!")
    
    # Check foreign keys in prophecy_sign_links
    print("\n=== Foreign Key Constraints ===")
    result = conn.execute(text("""
        SELECT
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
            ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'prophecy_sign_links';
    """))
    
    for row in result:
        print(f"  ✓ {row[1]}.{row[2]} → {row[3]}.{row[4]} (ON DELETE {row[5]})")
    
    # Check indexes
    print("\n=== Indexes on Theological Tables ===")
    result = conn.execute(text("""
        SELECT
            tablename,
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('prophecies', 'celestial_signs', 'prophecy_sign_links')
        ORDER BY tablename, indexname;
    """))
    
    for row in result:
        print(f"  ✓ {row[0]}.{row[1]}")
    
    # Count records
    print("\n=== Record Counts ===")
    for table in theological_tables:
        result = conn.execute(text(f"SELECT COUNT(*) FROM {table};"))
        count = result.fetchone()[0]
        print(f"  {table}: {count} records")

print("\n✅ Schema verification complete!")
