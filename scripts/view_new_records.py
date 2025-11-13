"""
View newly populated database records via API
"""
import httpx
import asyncio
import json

BACKEND_URL = "https://phobetronwebapp-production.up.railway.app"

async def view_new_data():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("=" * 60)
        print("📊 NEWLY POPULATED DATABASE RECORDS")
        print("=" * 60)
        
        # 1. Orbital Elements
        try:
            print("\n🌍 ORBITAL ELEMENTS (6 records):")
            print("-" * 60)
            response = await client.get(f"{BACKEND_URL}/api/v1/astronomical/orbital-elements")
            if response.status_code == 200:
                data = response.json()
                elements = data.get('data', [])
                print(f"Total: {len(elements)} orbital elements\n")
                for elem in elements:
                    print(f"  • {elem.get('object_name')}")
                    print(f"    Semi-major axis: {elem.get('semi_major_axis_au')} AU")
                    print(f"    Eccentricity: {elem.get('eccentricity')}")
                    print(f"    Inclination: {elem.get('inclination_deg')}°")
                    print()
            else:
                print(f"  ❌ Status: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
        
        # 2. Celestial Signs
        try:
            print("\n✨ CELESTIAL SIGNS (10 records):")
            print("-" * 60)
            response = await client.get(f"{BACKEND_URL}/api/v1/theological/celestial-signs")
            if response.status_code == 200:
                data = response.json()
                signs = data.get('data', [])
                print(f"Total: {len(signs)} celestial signs\n")
                for sign in signs[:10]:  # Show first 10
                    print(f"  • {sign.get('sign_name')} ({sign.get('sign_type')})")
                    print(f"    Scripture: {sign.get('primary_scripture')}")
                    desc = sign.get('sign_description', '')[:80]
                    print(f"    {desc}...")
                    print()
            else:
                print(f"  ❌ Status: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
        
        # 3. Prophecies
        try:
            print("\n📜 PROPHECIES (25+ records):")
            print("-" * 60)
            response = await client.get(f"{BACKEND_URL}/api/v1/theological/prophecies")
            if response.status_code == 200:
                data = response.json()
                prophecies = data.get('data', [])
                print(f"Total: {len(prophecies)} prophecies\n")
                
                # Group by source
                canonical = [p for p in prophecies if p.get('source_type') == 'CANONICAL']
                apocryphal = [p for p in prophecies if p.get('source_type') == 'APOCRYPHAL']
                pseudepigraphal = [p for p in prophecies if p.get('source_type') == 'PSEUDEPIGRAPHAL']
                
                print(f"  Canonical: {len(canonical)}")
                for p in canonical[:5]:
                    print(f"    • {p.get('prophecy_title')} ({p.get('book_name')})")
                
                print(f"\n  Apocryphal: {len(apocryphal)}")
                for p in apocryphal[:3]:
                    print(f"    • {p.get('prophecy_title')} ({p.get('book_name')})")
                
                print(f"\n  Pseudepigraphal: {len(pseudepigraphal)}")
                for p in pseudepigraphal[:3]:
                    print(f"    • {p.get('prophecy_title')} ({p.get('book_name')})")
            else:
                print(f"  ❌ Status: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
        
        print("\n" + "=" * 60)
        print("🌐 Access these via API or add UI pages to view them")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(view_new_data())
