import requests
import json

url = "http://127.0.0.1:8000/api/v1/ml/advanced-pattern-analysis"
params = {
    "start_date": "2023-01-01",
    "end_date": "2023-12-31",
    "include_predictions": False
}

print("🔍 Testing /advanced-pattern-analysis endpoint...")
print(f"📅 Date range: {params['start_date']} to {params['end_date']}")

try:
    response = requests.post(url, params=params, timeout=30)
    print(f"\n✅ Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        summary = data.get('summary', {})
        patterns = data.get('patterns', [])
        
        print(f"\n📊 SUMMARY:")
        print(f"   Total patterns: {summary.get('total_patterns', 0)}")
        print(f"   High correlations: {summary.get('high_correlation_patterns', 0)}")
        print(f"   Total events: {summary.get('total_events', 0)}")
        print(f"   Date range: {summary.get('date_range', {}).get('start')} to {summary.get('date_range', {}).get('end')}")
        
        print(f"\n🎯 FIRST 3 PATTERNS:")
        for i, p in enumerate(patterns[:3]):
            print(f"\n   Pattern {i+1}:")
            print(f"      Feast: {p.get('feast_day')}")
            print(f"      Date: {p.get('feast_date')}")
            print(f"      Correlation: {p.get('correlation_score', 0):.4f}")
            print(f"      Events: {p.get('total_events', 0)}")
            print(f"      Is Anomaly: {p.get('is_anomaly', False)}")
            print(f"      Anomaly Score: {p.get('anomaly_score', 0):.4f}")
        
        # Check for real ML data
        if patterns:
            first_corr = patterns[0].get('correlation_score', 0)
            print(f"\n🔬 Correlation Check:")
            print(f"   First correlation: {first_corr}")
            if first_corr > 0.9:
                print(f"   ✅ REAL ML DATA (expected ~0.971)")
            elif 0.7 < first_corr < 0.8:
                print(f"   ⚠️  MOCK DATA (expected ~0.742)")
            else:
                print(f"   ℹ️  Value: {first_corr}")
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(response.text[:500])
        
except Exception as e:
    print(f"\n❌ Exception: {e}")
