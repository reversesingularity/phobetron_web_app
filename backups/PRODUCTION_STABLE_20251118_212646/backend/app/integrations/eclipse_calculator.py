"""
Eclipse Prediction & Astronomical Events
Returns known eclipse data for demonstration purposes

Focuses on:
- Solar eclipses visible from Jerusalem
- Lunar eclipses (Blood Moons) - especially Total Lunar Eclipses
- Tetrad sequences (4 consecutive total lunar eclipses on feast days)
- Eclipse visibility from Jerusalem coordinates (31.7683°N, 35.2137°E)

NOTE: This is a simplified implementation using known eclipse data.
For production, integrate with NASA API or astronomy libraries.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional


# Jerusalem coordinates
JERUSALEM_LAT = 31.7683  # degrees North
JERUSALEM_LON = 35.2137  # degrees East
JERUSALEM_ELEVATION = 754  # meters above sea level

# Known eclipses 2024-2026 (from NASA eclipse database)
KNOWN_ECLIPSES = [
    # 2024
    {"date": "2024-03-25", "type": "lunar", "eclipse_type": "Penumbral", "visible_jerusalem": False},
    {"date": "2024-04-08", "type": "solar", "eclipse_type": "Total", "visible_jerusalem": False},
    {"date": "2024-09-18", "type": "lunar", "eclipse_type": "Partial", "visible_jerusalem": True},
    {"date": "2024-10-02", "type": "solar", "eclipse_type": "Annular", "visible_jerusalem": False},
    
    # 2025
    {"date": "2025-03-14", "type": "lunar", "eclipse_type": "Total", "visible_jerusalem": True},
    {"date": "2025-03-29", "type": "solar", "eclipse_type": "Partial", "visible_jerusalem": False},
    {"date": "2025-09-07", "type": "lunar", "eclipse_type": "Total", "visible_jerusalem": True},
    {"date": "2025-09-21", "type": "solar", "eclipse_type": "Partial", "visible_jerusalem": False},
]


class EclipseCalculator:
    """Calculate solar and lunar eclipses with Jerusalem visibility"""
    
    def __init__(self):
        """Initialize eclipse calculator with known data"""
        pass
    
    def find_lunar_eclipses(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """
        Find all lunar eclipses in date range
        
        Args:
            start_date: Start of search period
            end_date: End of search period
            
        Returns:
            List[Dict]: List of lunar eclipse events with details
        """
        eclipses = []
        
        for eclipse in KNOWN_ECLIPSES:
            if eclipse["type"] != "lunar":
                continue
            
            eclipse_date = datetime.strptime(eclipse["date"], "%Y-%m-%d")
            
            if start_date <= eclipse_date <= end_date:
                is_blood_moon = eclipse["eclipse_type"] == "Total"
                
                eclipses.append({
                    "date": eclipse_date,
                    "type": "lunar",
                    "eclipse_type": eclipse["eclipse_type"],
                    "is_blood_moon": is_blood_moon,
                    "visible_from_jerusalem": eclipse["visible_jerusalem"],
                    "latitude": JERUSALEM_LAT,
                    "longitude": JERUSALEM_LON
                })
        
        return eclipses
    
    def find_solar_eclipses(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """
        Find all solar eclipses in date range
        
        Args:
            start_date: Start of search period
            end_date: End of search period
            
        Returns:
            List[Dict]: List of solar eclipse events with details
        """
        eclipses = []
        
        for eclipse in KNOWN_ECLIPSES:
            if eclipse["type"] != "solar":
                continue
            
            eclipse_date = datetime.strptime(eclipse["date"], "%Y-%m-%d")
            
            if start_date <= eclipse_date <= end_date:
                eclipses.append({
                    "date": eclipse_date,
                    "type": "solar",
                    "eclipse_type": eclipse["eclipse_type"],
                    "is_blood_moon": False,
                    "visible_from_jerusalem": eclipse["visible_jerusalem"],
                    "latitude": JERUSALEM_LAT,
                    "longitude": JERUSALEM_LON
                })
        
        return eclipses
    
    def find_all_eclipses(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """
        Find all eclipses (solar and lunar) in date range
        
        Args:
            start_date: Start of search period
            end_date: End of search period
            
        Returns:
            List[Dict]: Combined list of all eclipse events, sorted by date
        """
        lunar = self.find_lunar_eclipses(start_date, end_date)
        solar = self.find_solar_eclipses(start_date, end_date)
        
        all_eclipses = lunar + solar
        all_eclipses.sort(key=lambda x: x['date'])
        
        return all_eclipses
    
    def find_blood_moon_tetrads(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """
        Find Blood Moon Tetrads (4 consecutive total lunar eclipses)
        
        A tetrad is significant when:
        - 4 total lunar eclipses occur in succession
        - No partial/penumbral eclipses between them
        - Often aligned with Jewish feast days
        
        Args:
            start_date: Start of search period
            end_date: End of search period
            
        Returns:
            List[Dict]: List of tetrad sequences found
        """
        lunar_eclipses = self.find_lunar_eclipses(start_date, end_date)
        
        # Filter for total lunar eclipses (blood moons)
        blood_moons = [e for e in lunar_eclipses if e['is_blood_moon']]
        
        tetrads = []
        
        # Look for sequences of 4 consecutive total lunar eclipses
        for i in range(len(blood_moons) - 3):
            tetrad_sequence = blood_moons[i:i+4]
            
            # Check if they're consecutive (no other eclipses between)
            # Simplified: Check date spacing is roughly 6 months apart
            dates = [e['date'] for e in tetrad_sequence]
            
            # Tetrads typically occur with ~6 month spacing
            valid_tetrad = True
            for j in range(len(dates) - 1):
                days_between = (dates[j+1] - dates[j]).days
                # Should be roughly 177-178 days (6 lunar months)
                if not (150 < days_between < 210):
                    valid_tetrad = False
                    break
            
            if valid_tetrad:
                tetrads.append({
                    "start_date": dates[0],
                    "end_date": dates[3],
                    "eclipses": tetrad_sequence,
                    "count": 4,
                    "jerusalem_visible_count": sum(1 for e in tetrad_sequence if e['visible_from_jerusalem'])
                })
        
        return tetrads
    
    def check_feast_day_alignment(self, eclipse_date: datetime, feast_days: List[Dict]) -> Optional[Dict]:
        """
        Check if eclipse aligns with a Jewish feast day
        
        Args:
            eclipse_date: Date of eclipse
            feast_days: List of feast day records
            
        Returns:
            Optional[Dict]: Feast day info if aligned, None otherwise
        """
        # Check if eclipse date matches any feast day (within 1 day tolerance)
        for feast in feast_days:
            if 'date' in feast:
                feast_date = feast['date']
                if abs((eclipse_date - feast_date).days) <= 1:
                    return feast
            elif 'start_date' in feast and 'end_date' in feast:
                if feast['start_date'] <= eclipse_date <= feast['end_date']:
                    return feast
        
        return None


# Convenience functions
def get_lunar_eclipses(start_year: int, end_year: int) -> List[Dict]:
    """Get all lunar eclipses in year range"""
    calc = EclipseCalculator()
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return calc.find_lunar_eclipses(start, end)


def get_solar_eclipses(start_year: int, end_year: int) -> List[Dict]:
    """Get all solar eclipses in year range"""
    calc = EclipseCalculator()
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return calc.find_solar_eclipses(start, end)


def get_all_eclipses(start_year: int, end_year: int) -> List[Dict]:
    """Get all eclipses (solar and lunar) in year range"""
    calc = EclipseCalculator()
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return calc.find_all_eclipses(start, end)


def get_blood_moon_tetrads(start_year: int, end_year: int) -> List[Dict]:
    """Get blood moon tetrads in year range"""
    calc = EclipseCalculator()
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return calc.find_blood_moon_tetrads(start, end)


if __name__ == "__main__":
    print("🌑 Eclipse Calculator - Jerusalem Visibility\n")
    print(f"Location: Jerusalem ({JERUSALEM_LAT}°N, {JERUSALEM_LON}°E)\n")
    
    # Test with 2024-2025
    calc = EclipseCalculator()
    
    print("=== Lunar Eclipses 2024-2025 ===\n")
    lunar = calc.find_lunar_eclipses(datetime(2024, 1, 1), datetime(2025, 12, 31))
    
    for eclipse in lunar:
        print(f"🌕 {eclipse['eclipse_type']} Lunar Eclipse")
        print(f"   Date: {eclipse['date'].strftime('%B %d, %Y at %H:%M UTC')}")
        print(f"   Blood Moon: {'Yes' if eclipse['is_blood_moon'] else 'No'}")
        print(f"   Visible from Jerusalem: {'Yes' if eclipse['visible_from_jerusalem'] else 'No'}\n")
    
    print("\n=== Solar Eclipses 2024-2025 ===\n")
    solar = calc.find_solar_eclipses(datetime(2024, 1, 1), datetime(2025, 12, 31))
    
    for eclipse in solar:
        print(f"☀️ {eclipse['eclipse_type']} Solar Eclipse")
        print(f"   Date: {eclipse['date'].strftime('%B %d, %Y at %H:%M UTC')}")
        print(f"   Visible from Jerusalem: {'Yes' if eclipse['visible_from_jerusalem'] else 'No'}\n")
    
    # Test tetrad detection (2014-2015 had a famous tetrad)
    print("\n=== Blood Moon Tetrads (2010-2020) ===\n")
    tetrads = calc.find_blood_moon_tetrads(datetime(2010, 1, 1), datetime(2020, 12, 31))
    
    if tetrads:
        for i, tetrad in enumerate(tetrads, 1):
            print(f"Tetrad #{i}")
            print(f"   Period: {tetrad['start_date'].strftime('%B %Y')} - {tetrad['end_date'].strftime('%B %Y')}")
            print(f"   Jerusalem Visible: {tetrad['jerusalem_visible_count']}/4 eclipses")
            print(f"   Dates:")
            for eclipse in tetrad['eclipses']:
                print(f"      - {eclipse['date'].strftime('%B %d, %Y')}")
            print()
    else:
        print("No tetrads found in this period.\n")
