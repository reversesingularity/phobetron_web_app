import requests

url = "http://127.0.0.1:8000/api/v1/ml/comprehensive-pattern-detection"
params = {
    "start_date": "2020-01-01",
    "end_date": "2023-12-31"
}

print(f"Testing /comprehensive-pattern-detection")
r = requests.post(url, params=params)
print(f"Status: {r.status_code}")

if r.status_code == 200:
    data = r.json()
    print(f"✅ SUCCESS!")
    print(f"   Patterns: {len(data.get('patterns', []))}")
    print(f"   Summary: {data.get('summary', {})}")
else:
    print(f"❌ Error: {r.text[:300]}")
