"""
Check if backend is running and models are loaded by testing the API
"""
import httpx
import asyncio
from datetime import datetime

BACKEND_URL = "https://phobetronwebapp-production.up.railway.app"

async def check_backend():
    print(f"🔍 Checking backend at {BACKEND_URL}")
    print(f"⏰ {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC\n")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Check health endpoint
        try:
            print("1️⃣ Testing health endpoint...")
            response = await client.get(f"{BACKEND_URL}/health")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ Backend is running")
                print(f"   Response: {response.json()}\n")
            else:
                print(f"   ❌ Unexpected status code\n")
        except Exception as e:
            print(f"   ❌ Health check failed: {str(e)}\n")
            return
        
        # 2. Check API docs (verifies FastAPI is running)
        try:
            print("2️⃣ Testing API docs...")
            response = await client.get(f"{BACKEND_URL}/docs")
            if response.status_code == 200:
                print(f"   ✅ FastAPI docs accessible\n")
            else:
                print(f"   ⚠️ Docs returned {response.status_code}\n")
        except Exception as e:
            print(f"   ❌ Docs check failed: {str(e)}\n")
        
        # 3. Test a prediction endpoint (will show if models loaded)
        try:
            print("3️⃣ Testing seismic forecast endpoint...")
            response = await client.post(
                f"{BACKEND_URL}/api/v1/ml/forecast/seismic",
                json={
                    "latitude": 35.6762,
                    "longitude": 139.6503,
                    "days_ahead": 7
                }
            )
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Forecast generated")
                print(f"   Forecast: {data.get('forecast', 'N/A')}")
                print(f"   Confidence: {data.get('confidence', 'N/A')}")
                
                # Check if it's using actual model or fallback
                if 'model_loaded' in data:
                    print(f"   🧠 Model Status: {data['model_loaded']}")
                if 'metadata' in data:
                    print(f"   📊 Using: {data['metadata'].get('source', 'Unknown')}")
            else:
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"   ❌ Forecast test failed: {str(e)}\n")
        
        # 4. Check earthquakes data
        try:
            print("\n4️⃣ Checking earthquakes data...")
            response = await client.get(f"{BACKEND_URL}/api/v1/events/earthquakes?limit=5")
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('data', []))
                print(f"   ✅ Found {count} earthquakes")
                if count > 0:
                    latest = data['data'][0]
                    print(f"   Latest: {latest.get('event_id')} - M{latest.get('magnitude')} - {latest.get('region')}")
            else:
                print(f"   ⚠️ Status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Data check failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_backend())
