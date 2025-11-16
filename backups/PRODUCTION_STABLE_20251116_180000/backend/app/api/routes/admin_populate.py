"""
Admin endpoint to populate feast days.
Add this temporarily to routes and call via browser/curl.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from datetime import date

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/populate-feast-days")
def populate_feast_days(db: Session = Depends(get_db)):
    """Populate feast days for 2024-2025"""
    
    feast_days_data = [
        # 2024
        {'feast_type': 'passover', 'name': 'Passover (Pesach)', 'hebrew_date': 'Nisan 14', 'gregorian_date': date(2024, 4, 22), 'gregorian_year': 2024, 'end_date': None, 'is_range': False, 'significance': 'Celebrates Exodus from Egypt'},
        {'feast_type': 'unleavened_bread', 'name': 'Unleavened Bread', 'hebrew_date': 'Nisan 15-21', 'gregorian_date': date(2024, 4, 23), 'gregorian_year': 2024, 'end_date': date(2024, 4, 29), 'is_range': True, 'significance': 'Seven days unleavened bread'},
        {'feast_type': 'pentecost', 'name': 'Pentecost (Shavuot)', 'hebrew_date': 'Sivan 6', 'gregorian_date': date(2024, 6, 12), 'gregorian_year': 2024, 'end_date': None, 'is_range': False, 'significance': 'Giving of Torah, Holy Spirit'},
        {'feast_type': 'trumpets', 'name': 'Trumpets (Rosh Hashanah)', 'hebrew_date': 'Tishrei 1', 'gregorian_date': date(2024, 10, 3), 'gregorian_year': 2024, 'end_date': None, 'is_range': False, 'significance': 'Jewish New Year'},
        {'feast_type': 'atonement', 'name': 'Atonement (Yom Kippur)', 'hebrew_date': 'Tishrei 10', 'gregorian_date': date(2024, 10, 12), 'gregorian_year': 2024, 'end_date': None, 'is_range': False, 'significance': 'Day of atonement'},
        {'feast_type': 'tabernacles', 'name': 'Tabernacles (Sukkot)', 'hebrew_date': 'Tishrei 15-21', 'gregorian_date': date(2024, 10, 17), 'gregorian_year': 2024, 'end_date': date(2024, 10, 23), 'is_range': True, 'significance': 'Feast of Tabernacles'},
        # 2025
        {'feast_type': 'passover', 'name': 'Passover (Pesach)', 'hebrew_date': 'Nisan 14', 'gregorian_date': date(2025, 4, 12), 'gregorian_year': 2025, 'end_date': None, 'is_range': False, 'significance': 'Celebrates Exodus from Egypt'},
        {'feast_type': 'unleavened_bread', 'name': 'Unleavened Bread', 'hebrew_date': 'Nisan 15-21', 'gregorian_date': date(2025, 4, 13), 'gregorian_year': 2025, 'end_date': date(2025, 4, 19), 'is_range': True, 'significance': 'Seven days unleavened bread'},
        {'feast_type': 'pentecost', 'name': 'Pentecost (Shavuot)', 'hebrew_date': 'Sivan 6', 'gregorian_date': date(2025, 6, 2), 'gregorian_year': 2025, 'end_date': None, 'is_range': False, 'significance': 'Giving of Torah, Holy Spirit'},
        {'feast_type': 'trumpets', 'name': 'Trumpets (Rosh Hashanah)', 'hebrew_date': 'Tishrei 1', 'gregorian_date': date(2025, 9, 23), 'gregorian_year': 2025, 'end_date': None, 'is_range': False, 'significance': 'Jewish New Year'},
        {'feast_type': 'atonement', 'name': 'Atonement (Yom Kippur)', 'hebrew_date': 'Tishrei 10', 'gregorian_date': date(2025, 10, 2), 'gregorian_year': 2025, 'end_date': None, 'is_range': False, 'significance': 'Day of atonement'},
        {'feast_type': 'tabernacles', 'name': 'Tabernacles (Sukkot)', 'hebrew_date': 'Tishrei 15-21', 'gregorian_date': date(2025, 10, 7), 'gregorian_year': 2025, 'end_date': date(2025, 10, 13), 'is_range': True, 'significance': 'Feast of Tabernacles'},
    ]
    
    from sqlalchemy import text
    inserted = 0
    
    for feast in feast_days_data:
        try:
            query = text("""
                INSERT INTO feast_days 
                    (feast_type, name, hebrew_date, gregorian_date, gregorian_year, end_date, is_range, significance, data_source, created_at)
                VALUES 
                    (:feast_type, :name, :hebrew_date, :gregorian_date, :gregorian_year, :end_date, :is_range, :significance, 'api_insert', NOW())
                ON CONFLICT (feast_type, gregorian_year) DO NOTHING
            """)
            result = db.execute(query, feast)
            db.commit()
            if result.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting {feast['name']}: {e}")
            continue
    
    # Get total count
    count_result = db.execute(text("SELECT COUNT(*) FROM feast_days"))
    total = count_result.scalar()
    
    return {
        "success": True,
        "inserted": inserted,
        "total_feast_days": total,
        "message": f"Successfully inserted {inserted} feast days. Total in database: {total}"
    }
