"""
Test ML pattern detection endpoint with newly populated data.
Should now return actual correlations instead of empty results.
"""

import requests
import json
from datetime import datetime

# Test the comprehensive pattern detection endpoint
url = "http://127.0.0.1:8000/api/v1/ml/comprehensive-pattern-detection"

# Use a date range that covers our populated data
params = {
    "start_date": "2000-01-01",
    "end_date": "2024-12-31",
    "min_magnitude": 6.0,  # Focus on significant earthquakes
    "temporal_window_days": 14  # 2-week window around feast days
}

print("=" * 80)
print("TESTING ML PATTERN DETECTION WITH REAL DATA")
print("=" * 80)
print(f"\nEndpoint: {url}")
print(f"Parameters: {json.dumps(params, indent=2)}")
print("\nSending request...")

try:
    response = requests.post(url, params=params, timeout=60)
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        print("\n" + "=" * 80)
        print("RESPONSE SUMMARY")
        print("=" * 80)
        
        # Check if we have patterns
        patterns = data.get('patterns', [])
        print(f"\nTotal patterns detected: {len(patterns)}")
        
        # Display first few patterns
        if patterns:
            print(f"\nFirst 5 patterns:")
            for i, pattern in enumerate(patterns[:5], 1):
                print(f"\n  Pattern {i}:")
                print(f"    Feast Day: {pattern.get('feast_day_date')}")
                print(f"    Event Type: {pattern.get('event_type')}")
                print(f"    Event Date: {pattern.get('event_date')}")
                print(f"    Magnitude: {pattern.get('magnitude')}")
                print(f"    Days Offset: {pattern.get('days_offset')}")
                print(f"    Correlation Score: {pattern.get('correlation_score', 'N/A')}")
        else:
            print("\n  No patterns found - investigating...")
        
        # Check summary statistics
        summary = data.get('summary', {})
        print(f"\nSummary Statistics:")
        print(f"  Total Events Analyzed: {summary.get('total_events_analyzed', 0)}")
        print(f"  Total Feast Days: {summary.get('total_feast_days', 0)}")
        print(f"  Correlations Found: {summary.get('correlations_found', 0)}")
        print(f"  Average Correlation: {summary.get('average_correlation', 0):.4f}")
        
        # Check metadata
        metadata = data.get('metadata', {})
        print(f"\nMetadata:")
        print(f"  Analysis Date: {metadata.get('analysis_date')}")
        print(f"  Date Range: {metadata.get('date_range_start')} to {metadata.get('date_range_end')}")
        print(f"  Processing Time: {metadata.get('processing_time_seconds', 0):.2f}s")
        
        print("\n" + "=" * 80)
        print("✅ SUCCESS - Endpoint responding with data")
        print("=" * 80)
        
    else:
        print(f"\n❌ ERROR - Status {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
except requests.exceptions.ConnectionError:
    print("\n❌ ERROR - Cannot connect to backend server")
    print("Make sure the backend is running on http://127.0.0.1:8000")
    print("\nStart with: cd backend && uvicorn app.main:app --reload")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
