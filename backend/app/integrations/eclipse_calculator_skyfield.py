"""
Eclipse Prediction & Astronomical Events
Calculates solar and lunar eclipses with Jerusalem visibility using Skyfield

Focuses on:
- Solar eclipses visible from Jerusalem
- Lunar eclipses (Blood Moons) - especially Total Lunar Eclipses
- Tetrad sequences (4 consecutive total lunar eclipses on feast days)
- Eclipse visibility from Jerusalem coordinates (31.7683°N, 35.2137°E)
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from skyfield.api import load, wgs84
from skyfield import almanac


# Jerusalem coordinates
JERUSALEM_LAT = 31.7683  # degrees North
JERUSALEM_LON = 35.2137  # degrees East
JERUSALEM_ELEVATION = 754  # meters above sea level


class EclipseCalculator:
    """Calculate solar and lunar eclipses with Jerusalem visibility using Skyfield"""
    
    def __init__(self):
        """Initialize Skyfield ephemeris and observer at Jerusalem"""
        # Load ephemeris data (downloads if needed)
        self.eph = load('de421.bsp')  # JPL ephemeris
        self.earth = self.eph['earth']
        self.moon = self.eph['moon']
        self.sun = self.eph['sun']
        
        # Create timescale
        self.ts = load.timescale()
        
        # Jerusalem location
        self.jerusalem = self.earth + wgs84.latlon(JERUSALEM_LAT, JERUSALEM_LON, elevation_m=JERUSALEM_ELEVATION)
    
    def find_lunar_eclipses(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """
        Find all lunar eclipses in date range using Skyfield
        
        Args:
            start_date: Start of search period
            end_date: End of search period
            
        Returns:
            List[Dict]: List of lunar eclipse events with details
        """
        eclipses = []
        
        # Convert to Skyfield time objects
        t0 = self.ts.utc(start_date.year, start_date.month, start_date.day)
        t1 = self.ts.utc(end_date.year, end_date.month, end_date.day)
        
        # Find lunar eclipses
        t, y, details = almanac.find_discrete(t0, t1, almanac.lunar_eclipses(self.eph))
        
        for ti, phase in zip(t, y):
            if phase == 0:  # 0 = penumbral start, 1 = partial start, 2 = total start, 3 = maximum
                continue  # Skip starts, we only want maximum
            if phase != 3:
                continue
            
            eclipse_dt = ti.utc_datetime()
            
            # Check if moon is above horizon during eclipse
            observer = self.jerusalem.at(ti)
            moon_alt = observer.observe(self.moon).apparent().altaz()[0].degrees
            visible_from_jerusalem = moon_alt > 0
            
            # Determine eclipse type based on phase
            eclipse_type = "Total" if 2 in y else "Partial"
            is_blood_moon = eclipse_type == "Total"
            
            eclipses.append({
                "date": eclipse_dt,
                "type": "lunar",
                "eclipse_type": eclipse_type,
                "is_blood_moon": is_blood_moon,
                "visible_from_jerusalem": visible_from_jerusalem,
                "latitude": JERUSALEM_LAT,
                "longitude": JERUSALEM_LON
            })
        
        return eclipses
    
    def find_solar_eclipses(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """
        Find all solar eclipses in date range using Skyfield
        
        Args:
            start_date: Start of search period
            end_date: End of search period
            
        Returns:
            List[Dict]: List of solar eclipse events with details
        """
        eclipses = []
        
        # Convert to Skyfield time objects
        t0 = self.ts.utc(start_date.year, start_date.month, start_date.day)
        t1 = self.ts.utc(end_date.year, end_date.month, end_date.day)
        
        # Find solar eclipses
        t, y, details = almanac.find_discrete(t0, t1, almanac.solar_eclipses(self.eph))
        
        for ti, phase in zip(t, y):
            if phase == 0:  # Skip starts
                continue
            if phase != 3:  # Only maximum
                continue
            
            eclipse_dt = ti.utc_datetime()
            
            # Check if sun is above horizon during eclipse
            observer = self.jerusalem.at(ti)
            sun_alt = observer.observe(self.sun).apparent().altaz()[0].degrees
            visible_from_jerusalem = sun_alt > 0
            
            eclipse_type = "Partial"  # Simplified
            
            eclipses.append({
                "date": eclipse_dt,
                "type": "solar",
                "eclipse_type": eclipse_type,
                "is_blood_moon": False,
                "visible_from_jerusalem": visible_from_jerusalem,
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
