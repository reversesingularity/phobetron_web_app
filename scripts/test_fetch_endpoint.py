"""
Test the /admin/fetch-latest-data endpoint
"""
import httpx
import asyncio
from datetime import datetime

BACKEND_URL = "https://phobetronwebapp-production.up.railway.app"

async def test_fetch_endpoint():
    print(f"🧪 Testing /admin/fetch-latest-data endpoint")
    print(f"⏰ {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC\n")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            print("📡 Sending POST request to fetch latest data...")
            response = await client.post(f"{BACKEND_URL}/api/v1/admin/fetch-latest-data")
            
            print(f"Status: {response.status_code}\n")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS!")
                print(f"\n📊 Results:")
                print(f"  Timestamp: {data.get('timestamp')}")
                print(f"  Status: {data.get('status')}")
                
                eq_data = data.get('earthquakes', {})
                print(f"\n🌍 Earthquakes:")
                print(f"  Fetched from USGS: {eq_data.get('fetched', 0)}")
                print(f"  New records added: {eq_data.get('new', 0)}")
                print(f"  Updated records: {eq_data.get('updated', 0)}")
                
                samples = eq_data.get('sample', [])
                if samples:
                    print(f"\n  📝 Sample entries:")
                    for i, sample in enumerate(samples, 1):
                        print(f"    {i}. {sample.get('event_id')} - M{sample.get('magnitude')} - {sample.get('region')}")
                
            else:
                print(f"❌ FAILED: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_fetch_endpoint())
