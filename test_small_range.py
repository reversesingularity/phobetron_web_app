import requests

url = "http://127.0.0.1:8000/api/v1/ml/advanced-pattern-analysis"
params = {
    "start_date": "2023-04-05",
    "end_date": "2023-04-06",
    "include_predictions": False
}

print(f"Testing {params['start_date']} to {params['end_date']}")
r = requests.post(url, params=params)
print(f"Status: {r.status_code}")

if r.status_code == 200:
    data = r.json()
    print(f"✅ SUCCESS! Patterns found: {len(data.get('patterns', []))}")
    if data.get('patterns'):
        p = data['patterns'][0]
        print(f"First pattern: {p.get('feast_day')} - Correlation: {p.get('correlation_score')}")
else:
    print(f"❌ Error: {r.text[:500]}")
