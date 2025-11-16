"""
Test script to verify eclipse calculator is working
"""
from datetime import datetime
from app.integrations.eclipse_calculator import EclipseCalculator

def test_eclipse_calculator():
    print("🌑 Testing Eclipse Calculator...")
    
    calc = EclipseCalculator()
    
    # Test lunar eclipses 2024-2025
    print("\n📅 Finding Lunar Eclipses (2024-2025):")
    lunar_eclipses = calc.find_lunar_eclipses(
        datetime(2024, 1, 1),
        datetime(2025, 12, 31)
    )
    
    print(f"Found {len(lunar_eclipses)} lunar eclipses")
    for eclipse in lunar_eclipses:
        print(f"  - {eclipse['date']}: {eclipse['eclipse_type']}")
        print(f"    Blood Moon: {eclipse['is_blood_moon']}")
        print(f"    Visible from Jerusalem: {eclipse['visible_from_jerusalem']}")
    
    # Test solar eclipses 2024-2025
    print("\n☀️ Finding Solar Eclipses (2024-2025):")
    solar_eclipses = calc.find_solar_eclipses(
        datetime(2024, 1, 1),
        datetime(2025, 12, 31)
    )
    
    print(f"Found {len(solar_eclipses)} solar eclipses")
    for eclipse in solar_eclipses:
        print(f"  - {eclipse['date']}: {eclipse['eclipse_type']}")
        print(f"    Visible from Jerusalem: {eclipse['visible_from_jerusalem']}")
    
    # Test all eclipses
    print("\n🌍 Finding All Eclipses (2024-2025):")
    all_eclipses = calc.find_all_eclipses(
        datetime(2024, 1, 1),
        datetime(2025, 12, 31)
    )
    
    print(f"Found {len(all_eclipses)} total eclipses")
    
    return all_eclipses

if __name__ == "__main__":
    eclipses = test_eclipse_calculator()
    print(f"\n✅ Total eclipses found: {len(eclipses)}")
