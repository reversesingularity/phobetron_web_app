import requests
import json

# Test the comprehensive pattern detection endpoint
url = 'https://phobetronwebapp-production.up.railway.app/api/v1/ml/comprehensive-pattern-detection'
params = {
    'start_date': '2024-01-01',
    'end_date': '2024-12-31',
    'min_magnitude': 6.0,
    'time_window_days': 14,
    'include_historical': True
}

print('Testing AI Pattern Detection endpoint...')
print(f'URL: {url}')
print(f'Params: {params}')

try:
    response = requests.get(url, params=params, timeout=30)
    print(f'Status Code: {response.status_code}')

    if response.status_code == 200:
        data = response.json()
        print('Success! Response structure:')
        patterns = data.get('patterns', [])
        print(f'  Patterns found: {len(patterns)}')
        stats = data.get('statistics', {})
        print(f'  Statistics: {stats}')
        events = data.get('event_counts', {})
        print(f'  Event counts: {events}')

        if patterns:
            print('Sample pattern:')
            pattern = patterns[0]
            print(f'  Feast day: {pattern.get("feast_day")}')
            print(f'  Correlation score: {pattern.get("correlation_score")}')
            print(f'  Events: {len(pattern.get("events", []))}')
    else:
        print(f'Error response: {response.text[:500]}')

except Exception as e:
    print(f'Error: {e}')