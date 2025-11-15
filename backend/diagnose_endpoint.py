"""SpecKit ANALYZE: Diagnose advanced-pattern-analysis endpoint issues"""
import sys
import traceback
from datetime import datetime, timedelta
from sqlalchemy import text
from app.db.session import SessionLocal
from app.ml.model_loader import get_model

print('=== DIAGNOSTIC: Advanced Pattern Analysis ===\n')

try:
    db = SessionLocal()
    print('✅ Database connection successful')
    
    # Test feast days query
    feast_query = '''
    SELECT id, name, gregorian_date, feast_type, is_range, significance
    FROM feast_days
    WHERE gregorian_date BETWEEN :start_date AND :end_date
    LIMIT 3
    '''
    result = db.execute(text(feast_query), {'start_date': '2020-01-01', 'end_date': '2025-12-31'})
    feasts = [dict(row._mapping) for row in result]
    print(f'✅ Feast days query: {len(feasts)} results')
    if feasts:
        print(f'   Sample: {feasts[0]["name"]}')
        gdate = feasts[0]['gregorian_date']
        print(f'   Date value: {gdate}')
        print(f'   Date type: {type(gdate).__name__}')
    
    # Test model loading
    print('\n=== Model Loading ===')
    iso_forest = get_model('isolation_forest')
    print(f'isolation_forest: {"✅ Loaded" if iso_forest is not None else "❌ Not found"}')
    
    iso_scaler = get_model('isolation_forest_scaler')
    print(f'isolation_forest_scaler: {"✅ Loaded" if iso_scaler is not None else "❌ Not found"}')
    
    stat_tests = get_model('statistical_tests')
    print(f'statistical_tests: {"✅ Loaded" if stat_tests is not None else "❌ Not found"}')
    if stat_tests:
        print(f'   Keys: {list(stat_tests.keys())}')
    
    corr_matrices = get_model('correlation_matrices')
    print(f'correlation_matrices: {"✅ Loaded" if corr_matrices is not None else "❌ Not found"}')
    
    # Test date handling
    print('\n=== Date Handling Test ===')
    if feasts:
        feast = feasts[0]
        feast_date_raw = feast['gregorian_date']
        print(f'Raw date: {feast_date_raw} (type: {type(feast_date_raw).__name__})')
        
        if isinstance(feast_date_raw, str):
            feast_date = datetime.fromisoformat(feast_date_raw)
            print(f'✅ String date converted: {feast_date}')
        else:
            feast_date = datetime.combine(feast_date_raw, datetime.min.time())
            print(f'✅ Date object converted: {feast_date}')
        
        # Test string conversion back
        feast_date_str = str(feast_date_raw) if not isinstance(feast_date_raw, str) else feast_date_raw
        print(f'✅ Converted to string: {feast_date_str}')
    
    db.close()
    print('\n✅ All diagnostics complete')
    
except Exception as e:
    print(f'\n❌ Error occurred: {e}')
    traceback.print_exc()
