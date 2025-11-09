"""
Test Data Population - Small Sample
Quick test to verify data population scripts work correctly.

Usage:
    python test_population.py
"""

import sys
import os

# Set up environment
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '../backend')

from populate_earthquakes import USGSEarthquakePopulator
from populate_volcanic import VolcanicActivityPopulator
from populate_neo import NASANEOPopulator
from app.core.config import settings


def test_population():
    """Run a small test population."""
    print("=" * 70)
    print("DATA POPULATION TEST")
    print("=" * 70)
    
    database_url = settings.SQLALCHEMY_DATABASE_URL
    
    if not database_url:
        print("\n✗ Error: DATABASE_URL not configured")
        print("Set DATABASE_URL environment variable to test population")
        return
    
    print(f"\nDatabase: {database_url[:50]}...\n")
    
    # Test 1: Earthquakes (last 7 days, magnitude 5.0+)
    print("\n📊 Test 1: USGS Earthquakes")
    print("-" * 70)
    try:
        eq_populator = USGSEarthquakePopulator(database_url)
        eq_populator.run(days=7, min_magnitude=5.0, batch_size=50)
        print("✓ Earthquake population test complete")
    except Exception as e:
        print(f"✗ Earthquake population failed: {e}")
    
    # Test 2: Volcanic Activity
    print("\n\n🌋 Test 2: Volcanic Activity")
    print("-" * 70)
    try:
        volcanic_populator = VolcanicActivityPopulator(database_url)
        volcanic_populator.run(weeks=4, batch_size=50)
        print("✓ Volcanic population test complete")
    except Exception as e:
        print(f"✗ Volcanic population failed: {e}")
    
    # Test 3: NASA NEO (next 7 days)
    print("\n\n🌠 Test 3: NASA NEO Close Approaches")
    print("-" * 70)
    try:
        neo_populator = NASANEOPopulator(database_url)
        neo_populator.run(days=7, batch_size=50)
        print("✓ NEO population test complete")
    except Exception as e:
        print(f"✗ NEO population failed: {e}")
    
    print("\n" + "=" * 70)
    print("✓ ALL TESTS COMPLETE")
    print("=" * 70)
    print("\nVerify data at:")
    print("  Local: http://localhost:8000/docs")
    print("  Production: https://phobetronwebapp-production.up.railway.app/docs")
    print()


if __name__ == '__main__':
    test_population()
