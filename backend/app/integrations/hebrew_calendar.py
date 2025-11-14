"""
Hebrew Calendar Integration
Calculates Jewish feast days using the Hebrew calendar

Biblical Feasts (Moedim):
- Passover (Pesach) - Nisan 14
- Feast of Unleavened Bread - Nisan 15-21
- Pentecost (Shavuot) - 50 days after Passover
- Feast of Trumpets (Rosh Hashanah) - Tishrei 1
- Day of Atonement (Yom Kippur) - Tishrei 10
- Feast of Tabernacles (Sukkot) - Tishrei 15-21
"""

from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import convertdate
from convertdate import hebrew


class HebrewCalendar:
    """Hebrew calendar calculations for biblical feast days"""
    
    # Hebrew month names
    NISAN = 1   # Spring month (March/April)
    IYAR = 2
    SIVAN = 3
    TAMMUZ = 4
    AV = 5
    ELUL = 6
    TISHREI = 7  # Fall month (September/October)
    CHESHVAN = 8
    KISLEV = 9
    TEVET = 10
    SHEVAT = 11
    ADAR = 12
    
    @staticmethod
    def gregorian_to_hebrew(year: int, month: int, day: int) -> Tuple[int, int, int]:
        """Convert Gregorian date to Hebrew calendar"""
        return hebrew.from_gregorian(year, month, day)
    
    @staticmethod
    def hebrew_to_gregorian(year: int, month: int, day: int) -> Tuple[int, int, int]:
        """Convert Hebrew date to Gregorian calendar"""
        return hebrew.to_gregorian(year, month, day)
    
    @classmethod
    def calculate_passover(cls, gregorian_year: int) -> datetime:
        """
        Calculate Passover (Pesach) - Nisan 14
        
        Args:
            gregorian_year: Gregorian year (e.g., 2025)
            
        Returns:
            datetime: Passover date in Gregorian calendar
        """
        # Get Hebrew year corresponding to spring of Gregorian year
        # Nisan is in spring, so Hebrew year starts in fall of previous Gregorian year
        hebrew_year = gregorian_year + 3760
        
        # Passover is Nisan 14
        greg_year, greg_month, greg_day = cls.hebrew_to_gregorian(hebrew_year, cls.NISAN, 14)
        
        # If Passover falls before March, it's actually in next Hebrew year
        if greg_month < 3:
            hebrew_year += 1
            greg_year, greg_month, greg_day = cls.hebrew_to_gregorian(hebrew_year, cls.NISAN, 14)
            
        return datetime(greg_year, greg_month, greg_day)
    
    @classmethod
    def calculate_unleavened_bread(cls, gregorian_year: int) -> Tuple[datetime, datetime]:
        """
        Calculate Feast of Unleavened Bread - Nisan 15-21
        
        Returns:
            Tuple[datetime, datetime]: (start_date, end_date)
        """
        passover = cls.calculate_passover(gregorian_year)
        start_date = passover + timedelta(days=1)  # Nisan 15
        end_date = start_date + timedelta(days=6)  # Nisan 21
        return (start_date, end_date)
    
    @classmethod
    def calculate_pentecost(cls, gregorian_year: int) -> datetime:
        """
        Calculate Pentecost (Shavuot) - 50 days after Passover
        Counted from the day after the Sabbath during Unleavened Bread
        
        Args:
            gregorian_year: Gregorian year
            
        Returns:
            datetime: Pentecost date
        """
        passover = cls.calculate_passover(gregorian_year)
        # Count 50 days from the day after the Sabbath
        # Simplified: 50 days from Nisan 16 (day after Passover)
        pentecost = passover + timedelta(days=50)
        return pentecost
    
    @classmethod
    def calculate_trumpets(cls, gregorian_year: int) -> datetime:
        """
        Calculate Feast of Trumpets (Rosh Hashanah) - Tishrei 1
        This marks the beginning of the civil Hebrew year
        
        Args:
            gregorian_year: Gregorian year
            
        Returns:
            datetime: Feast of Trumpets date
        """
        # Tishrei 1 falls in fall of Gregorian year
        # Hebrew year for fall feasts is gregorian_year + 3761
        hebrew_year = gregorian_year + 3761
        
        greg_year, greg_month, greg_day = cls.hebrew_to_gregorian(hebrew_year, cls.TISHREI, 1)
        
        # If Tishrei falls after December, use previous Hebrew year
        if greg_month > 12:
            hebrew_year -= 1
            greg_year, greg_month, greg_day = cls.hebrew_to_gregorian(hebrew_year, cls.TISHREI, 1)
            
        return datetime(greg_year, greg_month, greg_day)
    
    @classmethod
    def calculate_atonement(cls, gregorian_year: int) -> datetime:
        """
        Calculate Day of Atonement (Yom Kippur) - Tishrei 10
        
        Args:
            gregorian_year: Gregorian year
            
        Returns:
            datetime: Day of Atonement date
        """
        trumpets = cls.calculate_trumpets(gregorian_year)
        # Yom Kippur is 9 days after Rosh Hashanah (Tishrei 10)
        atonement = trumpets + timedelta(days=9)
        return atonement
    
    @classmethod
    def calculate_tabernacles(cls, gregorian_year: int) -> Tuple[datetime, datetime]:
        """
        Calculate Feast of Tabernacles (Sukkot) - Tishrei 15-21
        
        Returns:
            Tuple[datetime, datetime]: (start_date, end_date)
        """
        trumpets = cls.calculate_trumpets(gregorian_year)
        start_date = trumpets + timedelta(days=14)  # Tishrei 15
        end_date = start_date + timedelta(days=6)   # Tishrei 21
        return (start_date, end_date)
    
    @classmethod
    def get_all_feasts(cls, gregorian_year: int) -> Dict[str, Dict]:
        """
        Get all biblical feast days for a given Gregorian year
        
        Args:
            gregorian_year: Gregorian year (e.g., 2025)
            
        Returns:
            Dict: Dictionary of feast names to date information
        """
        unleavened = cls.calculate_unleavened_bread(gregorian_year)
        tabernacles = cls.calculate_tabernacles(gregorian_year)
        
        return {
            "passover": {
                "name": "Passover (Pesach)",
                "date": cls.calculate_passover(gregorian_year),
                "hebrew_date": "Nisan 14",
                "is_range": False,
                "significance": "Commemorates the Exodus from Egypt"
            },
            "unleavened_bread": {
                "name": "Feast of Unleavened Bread",
                "start_date": unleavened[0],
                "end_date": unleavened[1],
                "hebrew_date": "Nisan 15-21",
                "is_range": True,
                "significance": "Commemorates the haste of the Exodus"
            },
            "pentecost": {
                "name": "Pentecost (Shavuot)",
                "date": cls.calculate_pentecost(gregorian_year),
                "hebrew_date": "Sivan 6 (50 days after Passover)",
                "is_range": False,
                "significance": "Commemorates the giving of the Torah at Mount Sinai"
            },
            "trumpets": {
                "name": "Feast of Trumpets (Rosh Hashanah)",
                "date": cls.calculate_trumpets(gregorian_year),
                "hebrew_date": "Tishrei 1",
                "is_range": False,
                "significance": "Jewish New Year, Day of Judgment"
            },
            "atonement": {
                "name": "Day of Atonement (Yom Kippur)",
                "date": cls.calculate_atonement(gregorian_year),
                "hebrew_date": "Tishrei 10",
                "is_range": False,
                "significance": "Holiest day, day of repentance and forgiveness"
            },
            "tabernacles": {
                "name": "Feast of Tabernacles (Sukkot)",
                "start_date": tabernacles[0],
                "end_date": tabernacles[1],
                "hebrew_date": "Tishrei 15-21",
                "is_range": True,
                "significance": "Commemorates the 40 years in the wilderness"
            }
        }
    
    @classmethod
    def get_feast_years_range(cls, start_year: int, end_year: int) -> List[Dict]:
        """
        Get all biblical feast days for a range of years
        
        Args:
            start_year: Starting Gregorian year
            end_year: Ending Gregorian year
            
        Returns:
            List[Dict]: List of feast day records across all years
        """
        all_feasts = []
        
        for year in range(start_year, end_year + 1):
            year_feasts = cls.get_all_feasts(year)
            
            for feast_key, feast_data in year_feasts.items():
                feast_record = {
                    "year": year,
                    "feast_type": feast_key,
                    "name": feast_data["name"],
                    "hebrew_date": feast_data["hebrew_date"],
                    "significance": feast_data["significance"],
                    "is_range": feast_data["is_range"]
                }
                
                if feast_data["is_range"]:
                    feast_record["start_date"] = feast_data["start_date"]
                    feast_record["end_date"] = feast_data["end_date"]
                else:
                    feast_record["date"] = feast_data["date"]
                    
                all_feasts.append(feast_record)
        
        return all_feasts


# Convenience functions for direct API use
def get_passover(year: int) -> datetime:
    """Get Passover date for a given year"""
    return HebrewCalendar.calculate_passover(year)


def get_pentecost(year: int) -> datetime:
    """Get Pentecost date for a given year"""
    return HebrewCalendar.calculate_pentecost(year)


def get_trumpets(year: int) -> datetime:
    """Get Feast of Trumpets date for a given year"""
    return HebrewCalendar.calculate_trumpets(year)


def get_atonement(year: int) -> datetime:
    """Get Day of Atonement date for a given year"""
    return HebrewCalendar.calculate_atonement(year)


def get_tabernacles(year: int) -> Tuple[datetime, datetime]:
    """Get Feast of Tabernacles dates for a given year"""
    return HebrewCalendar.calculate_tabernacles(year)


def get_all_feasts_for_year(year: int) -> Dict[str, Dict]:
    """Get all feast days for a single year"""
    return HebrewCalendar.get_all_feasts(year)


def get_feasts_range(start_year: int, end_year: int) -> List[Dict]:
    """Get all feast days across a range of years"""
    return HebrewCalendar.get_feast_years_range(start_year, end_year)


if __name__ == "__main__":
    # Test the calculations
    print("📅 Hebrew Calendar - Biblical Feast Days Calculator\n")
    
    test_year = 2025
    print(f"Biblical Feasts for {test_year}:\n")
    
    feasts = HebrewCalendar.get_all_feasts(test_year)
    
    for feast_key, feast_data in feasts.items():
        print(f"🕎 {feast_data['name']}")
        print(f"   Hebrew Date: {feast_data['hebrew_date']}")
        
        if feast_data['is_range']:
            print(f"   Gregorian: {feast_data['start_date'].strftime('%B %d, %Y')} - {feast_data['end_date'].strftime('%B %d, %Y')}")
        else:
            print(f"   Gregorian: {feast_data['date'].strftime('%B %d, %Y')}")
            
        print(f"   Significance: {feast_data['significance']}\n")
