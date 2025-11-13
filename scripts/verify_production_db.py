#!/usr/bin/env python3
"""
Verify Production Railway Database State
SAFE: Read-only queries, won't modify anything
"""

import asyncio
import httpx
from datetime import datetime

# Production API URL (from PRODUCTION_STABLE_CONFIG.md)
API_BASE = "https://phobetronwebapp-production.up.railway.app/api/v1"

async def verify_production_data():
    """Check what data exists in production Railway database"""
    
    print("=" * 70)
    print("PHOBETRON PRODUCTION DATABASE VERIFICATION")
    print(f"API: {API_BASE}")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 70)
    print()
    
    endpoints_to_check = [
        ("Earthquakes", "/events/earthquakes?limit=1"),
        ("Volcanic Activity", "/events/volcanic-activity?limit=1"),
        ("NEO Close Approaches", "/scientific/close-approaches?limit=1"),
        ("Orbital Elements", "/scientific/orbital-elements?limit=1"),
        ("Prophecies", "/theological/prophecies?limit=1"),
        ("Alerts", "/alerts/alerts?limit=1"),
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for name, endpoint in endpoints_to_check:
            try:
                url = f"{API_BASE}{endpoint}"
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Handle different response formats
                    if isinstance(data, list):
                        count = len(data)
                        has_data = count > 0
                    elif isinstance(data, dict):
                        # Check common pagination fields
                        if "items" in data:
                            count = len(data["items"])
                            has_data = count > 0
                        elif "data" in data:
                            count = len(data["data"]) if isinstance(data["data"], list) else 1
                            has_data = count > 0
                        else:
                            count = 1 if data else 0
                            has_data = bool(data)
                    else:
                        count = 0
                        has_data = False
                    
                    status = "✅ HAS DATA" if has_data else "❌ EMPTY"
                    print(f"{name:25} {status:15} (sample count: {count})")
                    
                    if has_data:
                        print(f"  Sample: {str(data)[:200]}...")
                    print()
                    
                else:
                    print(f"{name:25} ⚠️ ERROR: HTTP {response.status_code}")
                    print(f"  Response: {response.text[:200]}")
                    print()
                    
            except Exception as e:
                print(f"{name:25} ❌ FAILED: {str(e)}")
                print()
    
    print("=" * 70)
    print("VERIFICATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(verify_production_data())
