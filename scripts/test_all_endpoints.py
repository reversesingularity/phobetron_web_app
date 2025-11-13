"""
Test production API endpoints to verify all frontend pages will work
"""
import requests
import json

BASE_URL = "https://phobetronwebapp-production.up.railway.app"

def test_endpoint(name, url, expected_keys=None):
    """Test an API endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print('-'*60)
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if expected_keys:
                for key in expected_keys:
                    if key in data:
                        if isinstance(data[key], list):
                            print(f"✅ {key}: {len(data[key])} items")
                        else:
                            print(f"✅ {key}: {data[key]}")
                    else:
                        print(f"❌ Missing key: {key}")
            else:
                print(f"✅ Response keys: {list(data.keys())}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

print("="*60)
print("PRODUCTION API ENDPOINT TESTS")
print("="*60)

# Test health endpoint
test_endpoint("Health Check", f"{BASE_URL}/health")

# Test events endpoints (used by Dashboard, WatchmansView, MapPage, EarthquakesPage)
test_endpoint("Earthquakes", f"{BASE_URL}/api/v1/events/earthquakes?limit=5", 
              expected_keys=['total', 'data'])

test_endpoint("Volcanic Activity", f"{BASE_URL}/api/v1/events/volcanic-activity?limit=5",
              expected_keys=['total', 'data'])

# Test scientific endpoints (used by NEOPage, OrbitalElementsPage, SolarSystemPage)
test_endpoint("NEO Close Approaches", f"{BASE_URL}/api/v1/scientific/close-approaches?limit=5",
              expected_keys=['total', 'data'])

test_endpoint("Orbital Elements", f"{BASE_URL}/api/v1/scientific/orbital-elements?limit=10",
              expected_keys=['total', 'data'])

# Test theological endpoints (used by CelestialSignsPage, ProphecyCodex)
test_endpoint("Celestial Signs", f"{BASE_URL}/api/v1/theological/celestial-signs?limit=10",
              expected_keys=['total', 'data'])

test_endpoint("Prophecies", f"{BASE_URL}/api/v1/theological/prophecies?limit=10",
              expected_keys=['total', 'data'])

# Test ML endpoints (used by AlertsPage, WatchmansView)
test_endpoint("ML Watchman Alerts", f"{BASE_URL}/api/v1/ml/watchman-alerts?min_severity=70",
              expected_keys=['alerts'])

print("\n" + "="*60)
print("TEST SUMMARY")
print("="*60)
