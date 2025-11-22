"""
Blood Moon Tetrad Data Collection
Historical tetrad data with biblical feast day correlations
"""

import csv
from datetime import datetime
from typing import List, Dict, Any

# Historical Blood Moon Tetrads
TETRADS = [
    {
        "tetrad_id": 1,
        "start_year": 1493,
        "end_year": 1494,
        "historical_context": "Spanish Inquisition expulsion of Jews from Spain (1492)",
        "prophecy_significance": "Diaspora and persecution",
        "eclipses": [
            {"date": "1493-04-02", "feast": "Passover", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "1493-09-25", "feast": "Tabernacles", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "1494-03-22", "feast": "Passover", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "1494-09-15", "feast": "Tabernacles", "jerusalem_visible": False, "type": "Total Lunar"},
        ]
    },
    {
        "tetrad_id": 2,
        "start_year": 1949,
        "end_year": 1950,
        "historical_context": "State of Israel established (1948), War of Independence",
        "prophecy_significance": "Rebirth of Israel - Fig Tree Generation",
        "eclipses": [
            {"date": "1949-04-13", "feast": "Passover", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "1949-10-07", "feast": "Tabernacles", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "1950-04-02", "feast": "Passover", "jerusalem_visible": False, "type": "Total Lunar"},
            {"date": "1950-09-26", "feast": "Tabernacles", "jerusalem_visible": True, "type": "Total Lunar"},
        ]
    },
    {
        "tetrad_id": 3,
        "start_year": 1967,
        "end_year": 1968,
        "historical_context": "Six-Day War (1967), Jerusalem reunified under Israeli control",
        "prophecy_significance": "Jerusalem no longer trampled - Times of Gentiles",
        "eclipses": [
            {"date": "1967-04-24", "feast": "Passover", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "1967-10-18", "feast": "Tabernacles", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "1968-04-13", "feast": "Passover", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "1968-10-06", "feast": "Tabernacles", "jerusalem_visible": False, "type": "Total Lunar"},
        ]
    },
    {
        "tetrad_id": 4,
        "start_year": 2014,
        "end_year": 2015,
        "historical_context": "ISIS rise, Syrian civil war, Jerusalem tensions, Third Temple movement",
        "prophecy_significance": "Wars and rumors of wars, Birth pains intensifying",
        "eclipses": [
            {"date": "2014-04-15", "feast": "Passover", "jerusalem_visible": False, "type": "Total Lunar"},
            {"date": "2014-10-08", "feast": "Tabernacles", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "2015-04-04", "feast": "Passover", "jerusalem_visible": False, "type": "Total Lunar"},
            {"date": "2015-09-28", "feast": "Tabernacles", "jerusalem_visible": True, "type": "Total Lunar"},
        ]
    },
    {
        "tetrad_id": 5,
        "start_year": 2032,
        "end_year": 2033,
        "historical_context": "Predicted tetrad - 2000 years from resurrection (AD 33)",
        "prophecy_significance": "Potential prophetic fulfillment window",
        "eclipses": [
            {"date": "2032-04-25", "feast": "Passover", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "2032-10-18", "feast": "Tabernacles", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "2033-04-14", "feast": "Passover", "jerusalem_visible": True, "type": "Total Lunar"},
            {"date": "2033-10-08", "feast": "Tabernacles", "jerusalem_visible": True, "type": "Total Lunar"},
        ]
    },
]

# Additional significant blood moons (not in tetrads)
SIGNIFICANT_BLOOD_MOONS = [
    {"date": "1917-02-08", "historical_context": "Balfour Declaration year", "jerusalem_visible": True},
    {"date": "1948-05-14", "historical_context": "Israel independence day", "jerusalem_visible": False},
    {"date": "2000-01-21", "historical_context": "Y2K millennium transition", "jerusalem_visible": False},
    {"date": "2003-05-16", "historical_context": "Iraq War", "jerusalem_visible": True},
    {"date": "2007-08-28", "historical_context": "Financial crisis warning", "jerusalem_visible": True},
    {"date": "2018-07-27", "historical_context": "Longest eclipse 21st century", "jerusalem_visible": True},
]

# Biblical Feast Days (Hebrew calendar)
FEAST_DAYS = [
    {
        "name": "Passover",
        "hebrew_name": "Pesach",
        "hebrew_date": "Nisan 14-15",
        "significance": "Exodus from Egypt, Lamb sacrifice, Messiah crucifixion",
        "feast_season": "Spring",
    },
    {
        "name": "Unleavened Bread",
        "hebrew_name": "Chag HaMatzot",
        "hebrew_date": "Nisan 15-21",
        "significance": "Sinless life of Messiah, Burial",
        "feast_season": "Spring",
    },
    {
        "name": "First Fruits",
        "hebrew_name": "Yom HaBikkurim",
        "hebrew_date": "Nisan 17",
        "significance": "Resurrection, First fruits of harvest",
        "feast_season": "Spring",
    },
    {
        "name": "Pentecost",
        "hebrew_name": "Shavuot",
        "hebrew_date": "Sivan 6",
        "significance": "Torah given, Holy Spirit outpouring",
        "feast_season": "Spring",
    },
    {
        "name": "Trumpets",
        "hebrew_name": "Yom Teruah",
        "hebrew_date": "Tishrei 1",
        "significance": "Rapture, Coronation of King, Resurrection",
        "feast_season": "Fall",
    },
    {
        "name": "Day of Atonement",
        "hebrew_name": "Yom Kippur",
        "hebrew_date": "Tishrei 10",
        "significance": "National Israel repentance, Second Coming",
        "feast_season": "Fall",
    },
    {
        "name": "Tabernacles",
        "hebrew_name": "Sukkot",
        "hebrew_date": "Tishrei 15-21",
        "significance": "Millennial Kingdom, God dwelling with man",
        "feast_season": "Fall",
    },
]


def save_tetrad_eclipses_to_csv():
    """Save all tetrad eclipse events to CSV"""
    print("=" * 70)
    print("🌙 BLOOD MOON TETRAD DATA COLLECTION")
    print("=" * 70)
    
    import os
    os.makedirs("../data", exist_ok=True)
    
    # Flatten tetrad data into individual eclipse records
    eclipse_records = []
    for tetrad in TETRADS:
        for eclipse in tetrad["eclipses"]:
            record = {
                "tetrad_id": tetrad["tetrad_id"],
                "tetrad_start_year": tetrad["start_year"],
                "tetrad_end_year": tetrad["end_year"],
                "eclipse_date": eclipse["date"],
                "eclipse_type": eclipse["type"],
                "biblical_feast": eclipse["feast"],
                "jerusalem_visible": eclipse["jerusalem_visible"],
                "historical_context": tetrad["historical_context"],
                "prophecy_significance": tetrad["prophecy_significance"],
                "is_spring_feast": eclipse["feast"] == "Passover",
                "is_fall_feast": eclipse["feast"] == "Tabernacles",
            }
            eclipse_records.append(record)
    
    # Save to CSV
    filename = "../data/blood_moon_tetrads.csv"
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = eclipse_records[0].keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for record in eclipse_records:
            writer.writerow(record)
    
    print(f"✅ Saved {len(eclipse_records)} tetrad eclipse records to {filename}")
    
    # Save significant blood moons
    filename = "../data/significant_blood_moons.csv"
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = SIGNIFICANT_BLOOD_MOONS[0].keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for record in SIGNIFICANT_BLOOD_MOONS:
            writer.writerow(record)
    
    print(f"✅ Saved {len(SIGNIFICANT_BLOOD_MOONS)} significant blood moons to {filename}")
    
    # Save feast day reference
    filename = "../data/biblical_feast_days.csv"
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = FEAST_DAYS[0].keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for record in FEAST_DAYS:
            writer.writerow(record)
    
    print(f"✅ Saved {len(FEAST_DAYS)} biblical feast days to {filename}")
    
    # Summary statistics
    print("\n" + "=" * 70)
    print("📈 COLLECTION SUMMARY")
    print("=" * 70)
    print(f"Total tetrads documented: {len(TETRADS)}")
    print(f"Total tetrad eclipses: {len(eclipse_records)}")
    print(f"Additional significant blood moons: {len(SIGNIFICANT_BLOOD_MOONS)}")
    print(f"Biblical feast days: {len(FEAST_DAYS)}")
    
    # Count Jerusalem visibility
    jerusalem_visible = sum(1 for e in eclipse_records if e["jerusalem_visible"])
    print(f"\n🕎 Jerusalem visibility: {jerusalem_visible}/{len(eclipse_records)} ({jerusalem_visible/len(eclipse_records)*100:.1f}%)")
    
    # Tetrad breakdown
    print("\n📅 TETRAD BREAKDOWN:")
    print("-" * 70)
    for tetrad in TETRADS:
        visible_count = sum(1 for e in tetrad["eclipses"] if e["jerusalem_visible"])
        print(f"  {tetrad['start_year']}-{tetrad['end_year']}: {len(tetrad['eclipses'])} eclipses, {visible_count} visible from Jerusalem")
        print(f"    Context: {tetrad['historical_context']}")
        print(f"    Significance: {tetrad['prophecy_significance']}")
    
    print("\n✅ Blood moon tetrad data collection complete!")
    print("=" * 70)


if __name__ == "__main__":
    save_tetrad_eclipses_to_csv()
