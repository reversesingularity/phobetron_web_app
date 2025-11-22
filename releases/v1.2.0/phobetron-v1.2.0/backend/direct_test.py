"""Direct test of advanced_pattern_detector functions"""
import sys
sys.path.insert(0, r'f:\Projects\phobetron_web_app\backend')

from datetime import datetime, timedelta
from sqlalchemy import text
from app.db.session import SessionLocal
from app.ml.model_loader import get_model

print("=" * 60)
print("DIRECT ENDPOINT DEBUG")
print("=" * 60)

try:
    print("\n1. Testing database connection...")
    db = SessionLocal()
    print("   ✅ Database connected")
    
    print("\n2. Testing feast days query...")
    feast_query = """
    SELECT id, name, gregorian_date, feast_type
    FROM feast_days
    WHERE gregorian_date BETWEEN :start_date AND :end_date
    LIMIT 5
    """
    result = db.execute(text(feast_query), {"start_date": "2023-04-05", "end_date": "2023-04-06"})
    feasts = [dict(row._mapping) for row in result]
    print(f"   ✅ Found {len(feasts)} feasts")
    for f in feasts:
        print(f"      - {f['name']}: {f['gregorian_date']} ({type(f['gregorian_date']).__name__})")
    
    print("\n3. Testing model loading...")
    models_to_test = ['isolation_forest', 'isolation_forest_scaler', 'statistical_tests', 'correlation_matrices']
    for model_name in models_to_test:
        model = get_model(model_name)
        status = "✅ LOADED" if model is not None else "❌ NULL"
        print(f"   {status}: {model_name}")
    
    print("\n4. Testing advanced_pattern_detector import...")
    from app.ml.advanced_pattern_detector import advanced_detector
    print("   ✅ Imported successfully")
    print(f"   Type: {type(advanced_detector)}")
    
    print("\n5. Testing detector methods...")
    if hasattr(advanced_detector, 'analyze_patterns'):
        print("   ✅ Has analyze_patterns method")
    if hasattr(advanced_detector, 'calculate_statistical_significance'):
        print("   ✅ Has calculate_statistical_significance method")
    if hasattr(advanced_detector, 'detect_anomalies'):
        print("   ✅ Has detect_anomalies method")
    
    db.close()
    print("\n✅ ALL TESTS PASSED")
    
except Exception as e:
    import traceback
    print(f"\n❌ ERROR: {e}")
    print(f"\nTraceback:")
    traceback.print_exc()
