"""
NASA NEO Data Collection Script
Fetches historical close approach data for known NEOs from NASA JPL SBDB API
"""

import requests
import json
import csv
from datetime import datetime, timedelta
from typing import List, Dict, Any
import time

# NASA JPL Small-Body Database (SBDB) API
SBDB_API_BASE = "https://ssd-api.jpl.nasa.gov/sbdb.api"
CAD_API_BASE = "https://ssd-api.jpl.nasa.gov/cad.api"

# Known NEOs to collect data for
NEO_TARGETS = [
    {"name": "99942 Apophis", "spk_id": "2099942"},
    {"name": "162173 Ryugu", "spk_id": "2162173"},
    {"name": "101955 Bennu", "spk_id": "2101955"},
    {"name": "1999 AN10", "spk_id": "2029075"},
    {"name": "2023 DW", "spk_id": "54088823"},
    {"name": "4179 Toutatis", "spk_id": "2004179"},
    {"name": "4660 Nereus", "spk_id": "2004660"},
    {"name": "433 Eros", "spk_id": "2000433"},
]


def fetch_neo_orbital_data(spk_id: str, neo_name: str) -> Dict[str, Any]:
    """Fetch orbital elements and physical properties for a NEO"""
    try:
        print(f"Fetching orbital data for {neo_name}...")
        response = requests.get(f"{SBDB_API_BASE}?sstr={spk_id}&phys-par=true")
        response.raise_for_status()
        data = response.json()
        
        if "object" not in data:
            print(f"  ⚠️  No data found for {neo_name}")
            return None
            
        obj = data["object"]
        orbit = data.get("orbit", {})
        phys = data.get("phys_par", [])
        
        # Extract physical parameters
        diameter_km = None
        absolute_magnitude = None
        
        for param in phys:
            if param.get("name") == "diameter":
                diameter_km = float(param.get("value", 0))
            elif param.get("name") == "H":
                absolute_magnitude = float(param.get("value", 0))
        
        # Extract orbital elements
        orbital_data = {
            "name": neo_name,
            "spk_id": spk_id,
            "semi_major_axis_au": orbit.get("elements", {}).get("a"),
            "eccentricity": orbit.get("elements", {}).get("e"),
            "inclination_deg": orbit.get("elements", {}).get("i"),
            "orbital_period_days": orbit.get("elements", {}).get("per"),
            "perihelion_distance_au": orbit.get("elements", {}).get("q"),
            "aphelion_distance_au": orbit.get("elements", {}).get("ad"),
            "moid_au": orbit.get("moid", 0),  # Minimum Orbit Intersection Distance
            "absolute_magnitude": absolute_magnitude,
            "diameter_km": diameter_km,
        }
        
        print(f"  ✅ Retrieved orbital data for {neo_name}")
        return orbital_data
        
    except Exception as e:
        print(f"  ❌ Error fetching data for {neo_name}: {str(e)}")
        return None


def fetch_close_approaches(date_min: str = "1900-01-01", date_max: str = "2100-12-31") -> List[Dict[str, Any]]:
    """Fetch close approach data from NASA CAD API"""
    try:
        print(f"\nFetching close approaches from {date_min} to {date_max}...")
        
        # CAD API parameters
        params = {
            "date-min": date_min,
            "date-max": date_max,
            "dist-max": "0.05",  # Within 0.05 AU (about 19.5 lunar distances)
            "sort": "date",
            "fullname": "true"
        }
        
        response = requests.get(CAD_API_BASE, params=params)
        response.raise_for_status()
        data = response.json()
        
        if "data" not in data:
            print("  ⚠️  No close approach data found")
            return []
        
        fields = data["fields"]
        approaches = []
        
        for record in data["data"]:
            approach = dict(zip(fields, record))
            approaches.append({
                "object_name": approach.get("fullname", approach.get("des", "Unknown")),
                "close_approach_date": approach.get("cd", ""),
                "distance_au": float(approach.get("dist", 0)),
                "distance_km": float(approach.get("dist", 0)) * 149597870.7,  # AU to km
                "distance_lunar": float(approach.get("dist_min", 0)) * 389.1727,  # AU to lunar distances
                "velocity_km_s": float(approach.get("v_rel", 0)),
                "absolute_magnitude": float(approach.get("h", 0)) if approach.get("h") else None,
                "diameter_km": float(approach.get("diameter", 0)) if approach.get("diameter") else None,
            })
        
        print(f"  ✅ Retrieved {len(approaches)} close approaches")
        return approaches
        
    except Exception as e:
        print(f"  ❌ Error fetching close approaches: {str(e)}")
        return []


def save_to_csv(data: List[Dict[str, Any]], filename: str):
    """Save collected data to CSV file"""
    if not data:
        print(f"⚠️  No data to save to {filename}")
        return
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = data[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for row in data:
                writer.writerow(row)
        
        print(f"✅ Saved {len(data)} records to {filename}")
        
    except Exception as e:
        print(f"❌ Error saving to {filename}: {str(e)}")


def main():
    """Main execution function"""
    print("=" * 70)
    print("🚀 NASA NEO DATA COLLECTION")
    print("=" * 70)
    
    # Create data directory if it doesn't exist
    import os
    os.makedirs("../data", exist_ok=True)
    
    # Part 1: Collect orbital data for specific NEOs
    print("\n📊 PHASE 1: Collecting orbital data for known NEOs...")
    print("-" * 70)
    
    orbital_data = []
    for neo in NEO_TARGETS:
        data = fetch_neo_orbital_data(neo["spk_id"], neo["name"])
        if data:
            orbital_data.append(data)
        time.sleep(0.5)  # Rate limiting
    
    save_to_csv(orbital_data, "../data/neo_orbital_elements.csv")
    
    # Part 2: Collect close approach data
    print("\n📊 PHASE 2: Collecting historical close approaches...")
    print("-" * 70)
    
    close_approaches = fetch_close_approaches(date_min="1900-01-01", date_max="2100-12-31")
    save_to_csv(close_approaches, "../data/neo_close_approaches.csv")
    
    # Part 3: Summary statistics
    print("\n" + "=" * 70)
    print("📈 COLLECTION SUMMARY")
    print("=" * 70)
    print(f"Orbital elements collected: {len(orbital_data)} NEOs")
    print(f"Close approaches collected: {len(close_approaches)} events")
    
    if close_approaches:
        closest = min(close_approaches, key=lambda x: x["distance_km"])
        print(f"\n🎯 Closest approach in dataset:")
        print(f"   Object: {closest['object_name']}")
        print(f"   Date: {closest['close_approach_date']}")
        print(f"   Distance: {closest['distance_km']:,.0f} km ({closest['distance_lunar']:.2f} lunar distances)")
        print(f"   Velocity: {closest['velocity_km_s']:.2f} km/s")
    
    print("\n✅ Data collection complete!")
    print("=" * 70)


if __name__ == "__main__":
    main()
