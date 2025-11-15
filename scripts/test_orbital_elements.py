import requests
import json

url = "https://phobetronwebapp-production.up.railway.app/api/v1/scientific/orbital-elements?limit=10"

print(f"Testing: {url}\n")

response = requests.get(url)
print(f"Status: {response.status_code}\n")

if response.status_code == 200:
    data = response.json()
    print(f"Response structure:")
    print(f"Keys: {data.keys()}\n")
    
    if 'data' in data and len(data['data']) > 0:
        print(f"Total records: {data['total']}")
        print(f"Records returned: {len(data['data'])}\n")
        
        print("First record structure:")
        first_record = data['data'][0]
        for key, value in first_record.items():
            print(f"  {key}: {value} ({type(value).__name__})")
    else:
        print("No data records found")
else:
    print(f"Error: {response.text}")
