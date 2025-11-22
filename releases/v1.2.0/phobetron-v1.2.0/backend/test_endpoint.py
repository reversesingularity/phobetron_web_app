"""Simple test script for ML pattern detection endpoint"""
import requests
import json
from datetime import datetime

# API endpoint
url = "http://127.0.0.1:8000/api/v1/ml/comprehensive-pattern-detection"

# Test parameters - 25 years of data with magnitude 6.0+
params = {
    "start_date": "2000-01-01",
    "end_date": "2024-12-31",
    "min_magnitude": 6.0,
    "time_window_days": 14,
    "include_historical": True
}

print("=" * 80)
print("Testing ML Pattern Detection Endpoint")
print("=" * 80)
print(f"\nEndpoint: {url}")
print(f"\nParameters:")
print(json.dumps(params, indent=2))
print("\n" + "=" * 80)
print("Sending request...")
print("=" * 80 + "\n")

try:
    response = requests.post(url, params=params, timeout=60)
    
    print(f"Status Code: {response.status_code}\n")
    
    if response.status_code == 200:
        data = response.json()
        
        print("SUCCESS! Response received:")
        print("=" * 80)
        
        # Summary stats
        print("\n📊 ANALYSIS SUMMARY:")
        print(f"  • Total Events Analyzed: {data.get('total_events_analyzed', 0)}")
        print(f"  • Feast Days in Range: {data.get('feast_days_in_range', 0)}")
        print(f"  • Patterns Detected: {len(data.get('patterns', []))}")
        
        # Correlation matrix
        if 'correlation_matrix' in data:
            print("\n🔗 CORRELATION MATRIX:")
            matrix = data['correlation_matrix']
            for row in matrix[:3]:  # Show first 3 rows
                print(f"  {row}")
            if len(matrix) > 3:
                print(f"  ... ({len(matrix)} total rows)")
        
        # Statistical analysis
        if 'statistical_analysis' in data:
            stats = data['statistical_analysis']
            print("\n📈 STATISTICAL ANALYSIS:")
            print(f"  • Chi-Square Statistic: {stats.get('chi_square_statistic', 'N/A')}")
            print(f"  • P-Value: {stats.get('p_value', 'N/A')}")
            print(f"  • Degrees of Freedom: {stats.get('degrees_of_freedom', 'N/A')}")
        
        # Top patterns
        patterns = data.get('patterns', [])
        if patterns:
            print(f"\n🎯 TOP PATTERNS (showing first 5 of {len(patterns)}):")
            for i, pattern in enumerate(patterns[:5], 1):
                print(f"\n  {i}. {pattern.get('feast_day', 'Unknown Feast')}")
                print(f"     Score: {pattern.get('pattern_score', 0):.4f}")
                print(f"     Events: {pattern.get('event_count', 0)}")
                if 'event_types' in pattern:
                    print(f"     Types: {', '.join(pattern['event_types'].keys())}")
        
        print("\n" + "=" * 80)
        print("\n✅ Test completed successfully!")
        
        # Full response (optional - comment out if too verbose)
        # print("\n📄 FULL RESPONSE:")
        # print(json.dumps(data, indent=2))
        
    else:
        print(f"❌ ERROR: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ ERROR: Could not connect to server at http://127.0.0.1:8000")
    print("Make sure the backend server is running!")
except requests.exceptions.Timeout:
    print("❌ ERROR: Request timed out after 60 seconds")
except Exception as e:
    print(f"❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
