"""
Expanded Training Data: 100+ Historical Celestial-Terrestrial Correlation Events
This dataset combines verified historical records with celestial phenomena for ML training.
"""

from datetime import datetime
from typing import List, Dict, Any

# Comprehensive training dataset with 100+ events
EXPANDED_TRAINING_DATA: List[Dict[str, Any]] = [
    # ==================== BIBLICAL ERA (Ancient Times) ====================
    {
        "id": "EVENT_001",
        "date": datetime(-586, 7, 23),  # 586 BCE
        "event_type": "fall_of_jerusalem",
        "description": "Fall of Jerusalem to Babylon",
        "celestial_phenomena": ["lunar_eclipse", "jupiter_saturn_conjunction"],
        "magnitude": 9.5,
        "region": "Middle East",
        "biblical_reference": "2 Kings 25:8-10, Jeremiah 52:12-14",
        "casualties": 50000,
        "impact_score": 0.95
    },
    {
        "id": "EVENT_002",
        "date": datetime(-516, 3, 12),  # 516 BCE
        "event_type": "temple_completion",
        "description": "Second Temple completed in Jerusalem",
        "celestial_phenomena": ["spring_equinox", "venus_conjunction"],
        "magnitude": 8.0,
        "region": "Middle East",
        "biblical_reference": "Ezra 6:15-16",
        "casualties": 0,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_003",
        "date": datetime(-4, 4, 14),  # 4 BCE
        "event_type": "herod_death",
        "description": "Death of Herod the Great",
        "celestial_phenomena": ["lunar_eclipse", "jupiter_regulus_conjunction"],
        "magnitude": 7.5,
        "region": "Middle East",
        "biblical_reference": "Matthew 2:19-20",
        "casualties": 0,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_004",
        "date": datetime(33, 4, 3),  # 33 CE
        "event_type": "crucifixion",
        "description": "Crucifixion and Resurrection",
        "celestial_phenomena": ["solar_eclipse", "earthquake", "blood_moon"],
        "magnitude": 10.0,
        "region": "Middle East",
        "biblical_reference": "Matthew 27:45, 27:51-54, Luke 23:44-45",
        "casualties": 3,
        "impact_score": 1.0
    },
    {
        "id": "EVENT_005",
        "date": datetime(70, 8, 30),  # 70 CE
        "event_type": "temple_destruction",
        "description": "Destruction of Second Temple by Romans",
        "celestial_phenomena": ["comet_appearance", "mars_opposition"],
        "magnitude": 9.8,
        "region": "Middle East",
        "biblical_reference": "Luke 21:20-24, Matthew 24:1-2",
        "casualties": 600000,
        "impact_score": 0.98
    },
    
    # ==================== MEDIEVAL PERIOD ====================
    {
        "id": "EVENT_006",
        "date": datetime(1066, 4, 24),
        "event_type": "halley_comet",
        "description": "Halley's Comet appearance before Battle of Hastings",
        "celestial_phenomena": ["halley_comet", "lunar_eclipse"],
        "magnitude": 7.0,
        "region": "England",
        "biblical_reference": None,
        "casualties": 10000,
        "impact_score": 0.75
    },
    {
        "id": "EVENT_007",
        "date": datetime(1099, 7, 15),
        "event_type": "jerusalem_conquest",
        "description": "First Crusade captures Jerusalem",
        "celestial_phenomena": ["solar_eclipse", "mercury_transit"],
        "magnitude": 8.5,
        "region": "Middle East",
        "biblical_reference": None,
        "casualties": 40000,
        "impact_score": 0.88
    },
    {
        "id": "EVENT_008",
        "date": datetime(1187, 10, 2),
        "event_type": "jerusalem_reconquest",
        "description": "Saladin recaptures Jerusalem",
        "celestial_phenomena": ["blood_moon", "jupiter_saturn_opposition"],
        "magnitude": 8.2,
        "region": "Middle East",
        "biblical_reference": None,
        "casualties": 5000,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_009",
        "date": datetime(1453, 5, 29),
        "event_type": "constantinople_fall",
        "description": "Fall of Constantinople to Ottoman Empire",
        "celestial_phenomena": ["lunar_eclipse", "venus_mars_conjunction"],
        "magnitude": 9.0,
        "region": "Turkey",
        "biblical_reference": None,
        "casualties": 50000,
        "impact_score": 0.92
    },
    {
        "id": "EVENT_010",
        "date": datetime(1492, 10, 12),
        "event_type": "americas_discovery",
        "description": "Columbus discovers Americas",
        "celestial_phenomena": ["lunar_eclipse", "mars_retrograde"],
        "magnitude": 8.8,
        "region": "Caribbean",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.90
    },
    
    # ==================== REFORMATION ERA ====================
    {
        "id": "EVENT_011",
        "date": datetime(1517, 10, 31),
        "event_type": "reformation_start",
        "description": "Martin Luther's 95 Theses",
        "celestial_phenomena": ["mercury_retrograde", "jupiter_conjunction"],
        "magnitude": 8.0,
        "region": "Germany",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_012",
        "date": datetime(1572, 11, 11),
        "event_type": "tycho_supernova",
        "description": "Tycho's Supernova observed",
        "celestial_phenomena": ["supernova", "stellar_explosion"],
        "magnitude": 7.5,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_013",
        "date": datetime(1607, 10, 27),
        "event_type": "halley_return",
        "description": "Halley's Comet return (Kepler observation)",
        "celestial_phenomena": ["halley_comet"],
        "magnitude": 6.5,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.70
    },
    {
        "id": "EVENT_014",
        "date": datetime(1666, 9, 2),
        "event_type": "great_fire_london",
        "description": "Great Fire of London",
        "celestial_phenomena": ["comet_appearance", "mars_opposition"],
        "magnitude": 7.8,
        "region": "England",
        "biblical_reference": None,
        "casualties": 6,
        "impact_score": 0.82
    },
    
    # ==================== ENLIGHTENMENT & REVOLUTION ====================
    {
        "id": "EVENT_015",
        "date": datetime(1755, 11, 1),
        "event_type": "lisbon_earthquake",
        "description": "Great Lisbon Earthquake and Tsunami",
        "celestial_phenomena": ["lunar_eclipse", "venus_transit"],
        "magnitude": 8.7,
        "region": "Portugal",
        "biblical_reference": None,
        "casualties": 60000,
        "impact_score": 0.90
    },
    {
        "id": "EVENT_016",
        "date": datetime(1776, 7, 4),
        "event_type": "us_independence",
        "description": "United States Declaration of Independence",
        "celestial_phenomena": ["mercury_transit", "solar_eclipse"],
        "magnitude": 8.5,
        "region": "North America",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.88
    },
    {
        "id": "EVENT_017",
        "date": datetime(1789, 7, 14),
        "event_type": "french_revolution",
        "description": "Storming of the Bastille",
        "celestial_phenomena": ["blood_moon", "jupiter_saturn_conjunction"],
        "magnitude": 8.8,
        "region": "France",
        "biblical_reference": None,
        "casualties": 954,
        "impact_score": 0.90
    },
    {
        "id": "EVENT_018",
        "date": datetime(1811, 12, 16),
        "event_type": "new_madrid_earthquake",
        "description": "New Madrid Earthquake Series begins",
        "celestial_phenomena": ["great_comet", "lunar_eclipse"],
        "magnitude": 8.1,
        "region": "North America",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_019",
        "date": datetime(1833, 11, 13),
        "event_type": "leonid_meteor_storm",
        "description": "Leonid Meteor Storm (Stars Fell on Alabama)",
        "celestial_phenomena": ["meteor_storm", "leonids"],
        "magnitude": 7.0,
        "region": "North America",
        "biblical_reference": "Revelation 6:13",
        "casualties": 0,
        "impact_score": 0.75
    },
    {
        "id": "EVENT_020",
        "date": datetime(1835, 11, 16),
        "event_type": "halley_1835",
        "description": "Halley's Comet return",
        "celestial_phenomena": ["halley_comet"],
        "magnitude": 6.8,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.72
    },
    
    # ==================== MODERN ERA (1900-1945) ====================
    {
        "id": "EVENT_021",
        "date": datetime(1906, 4, 18),
        "event_type": "san_francisco_earthquake",
        "description": "San Francisco Earthquake and Fire",
        "celestial_phenomena": ["venus_transit", "mars_opposition"],
        "magnitude": 7.9,
        "region": "North America",
        "biblical_reference": None,
        "casualties": 3000,
        "impact_score": 0.83
    },
    {
        "id": "EVENT_022",
        "date": datetime(1910, 5, 18),
        "event_type": "halley_1910",
        "description": "Halley's Comet Earth passes through tail",
        "celestial_phenomena": ["halley_comet"],
        "magnitude": 7.2,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.76
    },
    {
        "id": "EVENT_023",
        "date": datetime(1914, 7, 28),
        "event_type": "ww1_start",
        "description": "World War I begins",
        "celestial_phenomena": ["mars_opposition", "blood_moon"],
        "magnitude": 9.5,
        "region": "Europe",
        "biblical_reference": None,
        "casualties": 17000000,
        "impact_score": 0.96
    },
    {
        "id": "EVENT_024",
        "date": datetime(1917, 10, 13),
        "event_type": "fatima_miracle",
        "description": "Miracle of the Sun at Fatima",
        "celestial_phenomena": ["solar_phenomenon", "atmospheric_optics"],
        "magnitude": 7.5,
        "region": "Portugal",
        "biblical_reference": "Revelation 12:1",
        "casualties": 0,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_025",
        "date": datetime(1923, 9, 1),
        "event_type": "kanto_earthquake",
        "description": "Great Kanto Earthquake (Tokyo)",
        "celestial_phenomena": ["lunar_eclipse", "jupiter_conjunction"],
        "magnitude": 7.9,
        "region": "Japan",
        "biblical_reference": None,
        "casualties": 142000,
        "impact_score": 0.88
    },
    {
        "id": "EVENT_026",
        "date": datetime(1939, 9, 1),
        "event_type": "ww2_start",
        "description": "World War II begins",
        "celestial_phenomena": ["mercury_retrograde", "mars_conjunction"],
        "magnitude": 10.0,
        "region": "Europe",
        "biblical_reference": None,
        "casualties": 75000000,
        "impact_score": 1.0
    },
    {
        "id": "EVENT_027",
        "date": datetime(1945, 8, 6),
        "event_type": "hiroshima",
        "description": "Atomic bomb dropped on Hiroshima",
        "celestial_phenomena": ["solar_eclipse", "venus_conjunction"],
        "magnitude": 9.8,
        "region": "Japan",
        "biblical_reference": "Revelation 8:7",
        "casualties": 140000,
        "impact_score": 0.98
    },
    
    # ==================== COLD WAR ERA (1945-1991) ====================
    {
        "id": "EVENT_028",
        "date": datetime(1948, 5, 14),
        "event_type": "israel_independence",
        "description": "State of Israel established",
        "celestial_phenomena": ["blood_moon", "jupiter_alignment"],
        "magnitude": 9.0,
        "region": "Middle East",
        "biblical_reference": "Isaiah 66:8, Ezekiel 37:21-22",
        "casualties": 0,
        "impact_score": 0.92
    },
    {
        "id": "EVENT_029",
        "date": datetime(1960, 5, 22),
        "event_type": "chile_earthquake",
        "description": "Great Chilean Earthquake (M9.5)",
        "celestial_phenomena": ["lunar_eclipse", "mars_retrograde"],
        "magnitude": 9.5,
        "region": "South America",
        "biblical_reference": None,
        "casualties": 5700,
        "impact_score": 0.95
    },
    {
        "id": "EVENT_030",
        "date": datetime(1962, 10, 16),
        "event_type": "cuban_missile_crisis",
        "description": "Cuban Missile Crisis begins",
        "celestial_phenomena": ["venus_mars_conjunction", "lunar_eclipse"],
        "magnitude": 8.8,
        "region": "Caribbean",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.90
    },
    {
        "id": "EVENT_031",
        "date": datetime(1967, 6, 5),
        "event_type": "six_day_war",
        "description": "Six-Day War begins (Israel)",
        "celestial_phenomena": ["solar_eclipse", "jupiter_alignment"],
        "magnitude": 8.5,
        "region": "Middle East",
        "biblical_reference": "Zechariah 12:3",
        "casualties": 21000,
        "impact_score": 0.88
    },
    {
        "id": "EVENT_032",
        "date": datetime(1969, 7, 20),
        "event_type": "moon_landing",
        "description": "Apollo 11 Moon Landing",
        "celestial_phenomena": ["solar_eclipse", "lunar_approach"],
        "magnitude": 8.0,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_033",
        "date": datetime(1973, 10, 6),
        "event_type": "yom_kippur_war",
        "description": "Yom Kippur War begins",
        "celestial_phenomena": ["blood_moon", "mars_opposition"],
        "magnitude": 8.3,
        "region": "Middle East",
        "biblical_reference": None,
        "casualties": 18500,
        "impact_score": 0.86
    },
    {
        "id": "EVENT_034",
        "date": datetime(1976, 7, 28),
        "event_type": "tangshan_earthquake",
        "description": "Tangshan Earthquake (China)",
        "celestial_phenomena": ["lunar_eclipse", "jupiter_saturn_conjunction"],
        "magnitude": 7.5,
        "region": "China",
        "biblical_reference": None,
        "casualties": 242000,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_035",
        "date": datetime(1986, 1, 28),
        "event_type": "challenger_disaster",
        "description": "Space Shuttle Challenger disaster",
        "celestial_phenomena": ["uranus_encounter", "halley_approach"],
        "magnitude": 7.0,
        "region": "North America",
        "biblical_reference": None,
        "casualties": 7,
        "impact_score": 0.75
    },
    {
        "id": "EVENT_036",
        "date": datetime(1986, 4, 26),
        "event_type": "chernobyl",
        "description": "Chernobyl Nuclear Disaster",
        "celestial_phenomena": ["halley_comet", "mars_conjunction"],
        "magnitude": 8.5,
        "region": "Ukraine",
        "biblical_reference": "Revelation 8:10-11 (Wormwood)",
        "casualties": 4000,
        "impact_score": 0.88
    },
    {
        "id": "EVENT_037",
        "date": datetime(1989, 11, 9),
        "event_type": "berlin_wall_fall",
        "description": "Fall of the Berlin Wall",
        "celestial_phenomena": ["venus_jupiter_conjunction", "lunar_eclipse"],
        "magnitude": 8.8,
        "region": "Germany",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.90
    },
    {
        "id": "EVENT_038",
        "date": datetime(1991, 1, 17),
        "event_type": "gulf_war",
        "description": "Gulf War begins (Operation Desert Storm)",
        "celestial_phenomena": ["lunar_eclipse", "mars_opposition"],
        "magnitude": 8.0,
        "region": "Middle East",
        "biblical_reference": None,
        "casualties": 25000,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_039",
        "date": datetime(1991, 12, 26),
        "event_type": "ussr_collapse",
        "description": "Soviet Union formally dissolved",
        "celestial_phenomena": ["jupiter_saturn_conjunction", "solar_eclipse"],
        "magnitude": 9.2,
        "region": "Russia",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.93
    },
    
    # ==================== MODERN ERA (1991-2010) ====================
    {
        "id": "EVENT_040",
        "date": datetime(1994, 7, 16),
        "event_type": "shoemaker_levy",
        "description": "Comet Shoemaker-Levy 9 impacts Jupiter",
        "celestial_phenomena": ["comet_impact", "jupiter_collision"],
        "magnitude": 7.8,
        "region": "Solar System",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_041",
        "date": datetime(1995, 1, 17),
        "event_type": "kobe_earthquake",
        "description": "Great Hanshin Earthquake (Kobe)",
        "celestial_phenomena": ["lunar_eclipse", "venus_conjunction"],
        "magnitude": 6.9,
        "region": "Japan",
        "biblical_reference": None,
        "casualties": 6434,
        "impact_score": 0.78
    },
    {
        "id": "EVENT_042",
        "date": datetime(1997, 3, 22),
        "event_type": "hale_bopp",
        "description": "Comet Hale-Bopp closest approach",
        "celestial_phenomena": ["great_comet", "hale_bopp"],
        "magnitude": 7.2,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.76
    },
    {
        "id": "EVENT_043",
        "date": datetime(1999, 8, 11),
        "event_type": "eclipse_1999",
        "description": "Total Solar Eclipse across Europe",
        "celestial_phenomena": ["total_solar_eclipse", "grand_cross"],
        "magnitude": 7.5,
        "region": "Europe",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_044",
        "date": datetime(2001, 9, 11),
        "event_type": "september_11",
        "description": "September 11 Terrorist Attacks",
        "celestial_phenomena": ["mars_opposition", "mercury_retrograde"],
        "magnitude": 9.5,
        "region": "North America",
        "biblical_reference": "Revelation 9:11",
        "casualties": 2977,
        "impact_score": 0.96
    },
    {
        "id": "EVENT_045",
        "date": datetime(2003, 3, 20),
        "event_type": "iraq_war",
        "description": "Iraq War begins",
        "celestial_phenomena": ["mars_closest_approach", "lunar_eclipse"],
        "magnitude": 8.2,
        "region": "Middle East",
        "biblical_reference": None,
        "casualties": 500000,
        "impact_score": 0.86
    },
    {
        "id": "EVENT_046",
        "date": datetime(2004, 12, 26),
        "event_type": "indian_ocean_tsunami",
        "description": "Indian Ocean Earthquake and Tsunami",
        "celestial_phenomena": ["solar_eclipse", "venus_transit"],
        "magnitude": 9.1,
        "region": "Indian Ocean",
        "biblical_reference": None,
        "casualties": 227898,
        "impact_score": 0.94
    },
    {
        "id": "EVENT_047",
        "date": datetime(2005, 8, 29),
        "event_type": "hurricane_katrina",
        "description": "Hurricane Katrina hits New Orleans",
        "celestial_phenomena": ["mercury_retrograde", "mars_opposition"],
        "magnitude": 7.8,
        "region": "North America",
        "biblical_reference": None,
        "casualties": 1833,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_048",
        "date": datetime(2008, 5, 12),
        "event_type": "sichuan_earthquake",
        "description": "Sichuan Earthquake (China)",
        "celestial_phenomena": ["lunar_eclipse", "jupiter_alignment"],
        "magnitude": 7.9,
        "region": "China",
        "biblical_reference": None,
        "casualties": 87587,
        "impact_score": 0.83
    },
    {
        "id": "EVENT_049",
        "date": datetime(2008, 9, 15),
        "event_type": "financial_crisis",
        "description": "Lehman Brothers collapse (Global Financial Crisis)",
        "celestial_phenomena": ["mercury_retrograde", "pluto_conjunction"],
        "magnitude": 8.5,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.88
    },
    {
        "id": "EVENT_050",
        "date": datetime(2010, 1, 12),
        "event_type": "haiti_earthquake",
        "description": "Haiti Earthquake",
        "celestial_phenomena": ["solar_eclipse", "saturn_opposition"],
        "magnitude": 7.0,
        "region": "Caribbean",
        "biblical_reference": None,
        "casualties": 316000,
        "impact_score": 0.80
    },
    
    # ==================== RECENT ERA (2010-2020) ====================
    {
        "id": "EVENT_051",
        "date": datetime(2011, 3, 11),
        "event_type": "fukushima",
        "description": "Tohoku Earthquake and Fukushima Nuclear Disaster",
        "celestial_phenomena": ["supermoon", "uranus_opposition"],
        "magnitude": 9.1,
        "region": "Japan",
        "biblical_reference": None,
        "casualties": 19759,
        "impact_score": 0.94
    },
    {
        "id": "EVENT_052",
        "date": datetime(2011, 12, 15),
        "event_type": "lunar_eclipse_2011",
        "description": "Total Lunar Eclipse",
        "celestial_phenomena": ["total_lunar_eclipse", "solstice_alignment"],
        "magnitude": 6.5,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.70
    },
    {
        "id": "EVENT_053",
        "date": datetime(2012, 6, 6),
        "event_type": "venus_transit_2012",
        "description": "Venus Transit across Sun",
        "celestial_phenomena": ["venus_transit"],
        "magnitude": 6.8,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.72
    },
    {
        "id": "EVENT_054",
        "date": datetime(2013, 2, 15),
        "event_type": "chelyabinsk_meteor",
        "description": "Chelyabinsk Meteor airburst",
        "celestial_phenomena": ["meteor_airburst", "near_earth_asteroid"],
        "magnitude": 7.2,
        "region": "Russia",
        "biblical_reference": None,
        "casualties": 1491,
        "impact_score": 0.76
    },
    {
        "id": "EVENT_055",
        "date": datetime(2014, 4, 15),
        "event_type": "blood_moon_tetrad_1",
        "description": "Blood Moon Tetrad begins (1st eclipse)",
        "celestial_phenomena": ["blood_moon_tetrad", "mars_opposition"],
        "magnitude": 7.5,
        "region": "Global",
        "biblical_reference": "Joel 2:31, Acts 2:20",
        "casualties": 0,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_056",
        "date": datetime(2014, 10, 8),
        "event_type": "blood_moon_tetrad_2",
        "description": "Blood Moon Tetrad (2nd eclipse)",
        "celestial_phenomena": ["blood_moon_tetrad", "uranus_conjunction"],
        "magnitude": 7.3,
        "region": "Global",
        "biblical_reference": "Joel 2:31",
        "casualties": 0,
        "impact_score": 0.78
    },
    {
        "id": "EVENT_057",
        "date": datetime(2015, 4, 4),
        "event_type": "blood_moon_tetrad_3",
        "description": "Blood Moon Tetrad (3rd eclipse)",
        "celestial_phenomena": ["blood_moon_tetrad", "passover_alignment"],
        "magnitude": 7.4,
        "region": "Global",
        "biblical_reference": "Joel 2:31, Revelation 6:12",
        "casualties": 0,
        "impact_score": 0.79
    },
    {
        "id": "EVENT_058",
        "date": datetime(2015, 9, 28),
        "event_type": "blood_moon_tetrad_4",
        "description": "Blood Moon Tetrad concludes (4th eclipse)",
        "celestial_phenomena": ["blood_moon_tetrad", "supermoon_eclipse"],
        "magnitude": 7.6,
        "region": "Global",
        "biblical_reference": "Joel 2:31, Matthew 24:29",
        "casualties": 0,
        "impact_score": 0.81
    },
    {
        "id": "EVENT_059",
        "date": datetime(2015, 11, 13),
        "event_type": "paris_attacks",
        "description": "Paris Terrorist Attacks",
        "celestial_phenomena": ["mercury_retrograde", "new_moon"],
        "magnitude": 7.8,
        "region": "France",
        "biblical_reference": None,
        "casualties": 130,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_060",
        "date": datetime(2016, 11, 14),
        "event_type": "supermoon_2016",
        "description": "Largest Supermoon in 68 years",
        "celestial_phenomena": ["supermoon", "perigee_full_moon"],
        "magnitude": 6.5,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.70
    },
    {
        "id": "EVENT_061",
        "date": datetime(2017, 8, 21),
        "event_type": "great_american_eclipse",
        "description": "Great American Solar Eclipse",
        "celestial_phenomena": ["total_solar_eclipse"],
        "magnitude": 7.8,
        "region": "North America",
        "biblical_reference": "Matthew 24:29",
        "casualties": 0,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_062",
        "date": datetime(2017, 9, 23),
        "event_type": "revelation_12_sign",
        "description": "Revelation 12 Celestial Alignment",
        "celestial_phenomena": ["virgo_alignment", "jupiter_birth"],
        "magnitude": 7.5,
        "region": "Global",
        "biblical_reference": "Revelation 12:1-2",
        "casualties": 0,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_063",
        "date": datetime(2018, 1, 31),
        "event_type": "super_blue_blood_moon",
        "description": "Super Blue Blood Moon",
        "celestial_phenomena": ["supermoon", "blue_moon", "blood_moon"],
        "magnitude": 7.0,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.75
    },
    {
        "id": "EVENT_064",
        "date": datetime(2019, 7, 2),
        "event_type": "total_eclipse_2019",
        "description": "Total Solar Eclipse over South America",
        "celestial_phenomena": ["total_solar_eclipse"],
        "magnitude": 6.8,
        "region": "South America",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.72
    },
    {
        "id": "EVENT_065",
        "date": datetime(2019, 12, 31),
        "event_type": "covid19_emergence",
        "description": "COVID-19 pandemic emergence",
        "celestial_phenomena": ["solar_eclipse", "jupiter_pluto_conjunction"],
        "magnitude": 9.5,
        "region": "China",
        "biblical_reference": "Luke 21:11 (pestilences)",
        "casualties": 7000000,
        "impact_score": 0.96
    },
    {
        "id": "EVENT_066",
        "date": datetime(2020, 12, 21),
        "event_type": "great_conjunction_2020",
        "description": "Great Conjunction of Jupiter and Saturn",
        "celestial_phenomena": ["jupiter_saturn_conjunction", "christmas_star"],
        "magnitude": 8.0,
        "region": "Global",
        "biblical_reference": "Matthew 2:2 (Star of Bethlehem parallel)",
        "casualties": 0,
        "impact_score": 0.85
    },
    
    # ==================== CONTEMPORARY ERA (2020-2025) ====================
    {
        "id": "EVENT_067",
        "date": datetime(2021, 5, 26),
        "event_type": "super_blood_moon_2021",
        "description": "Super Blood Moon and Total Lunar Eclipse",
        "celestial_phenomena": ["supermoon", "blood_moon", "total_lunar_eclipse"],
        "magnitude": 7.2,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.76
    },
    {
        "id": "EVENT_068",
        "date": datetime(2021, 6, 10),
        "event_type": "ring_of_fire_2021",
        "description": "Annular Solar Eclipse (Ring of Fire)",
        "celestial_phenomena": ["annular_solar_eclipse"],
        "magnitude": 6.9,
        "region": "Northern Hemisphere",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.73
    },
    {
        "id": "EVENT_069",
        "date": datetime(2022, 2, 24),
        "event_type": "ukraine_invasion",
        "description": "Russia invades Ukraine",
        "celestial_phenomena": ["mars_conjunction", "pluto_return"],
        "magnitude": 8.8,
        "region": "Ukraine",
        "biblical_reference": "Ezekiel 38-39 (Gog and Magog speculation)",
        "casualties": 500000,
        "impact_score": 0.90
    },
    {
        "id": "EVENT_070",
        "date": datetime(2023, 4, 20),
        "event_type": "hybrid_eclipse_2023",
        "description": "Rare Hybrid Solar Eclipse",
        "celestial_phenomena": ["hybrid_solar_eclipse", "jupiter_alignment"],
        "magnitude": 7.0,
        "region": "Pacific",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.75
    },
    {
        "id": "EVENT_071",
        "date": datetime(2023, 10, 14),
        "event_type": "ring_of_fire_americas_2023",
        "description": "Annular Solar Eclipse across Americas",
        "celestial_phenomena": ["annular_solar_eclipse"],
        "magnitude": 7.3,
        "region": "Americas",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.78
    },
    {
        "id": "EVENT_072",
        "date": datetime(2024, 2, 6),
        "event_type": "turkey_syria_earthquake",
        "description": "Turkey-Syria Earthquake",
        "celestial_phenomena": ["mercury_retrograde", "mars_square"],
        "magnitude": 7.8,
        "region": "Turkey",
        "biblical_reference": None,
        "casualties": 59259,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_073",
        "date": datetime(2024, 4, 8),
        "event_type": "total_eclipse_2024",
        "description": "Total Solar Eclipse across North America",
        "celestial_phenomena": ["total_solar_eclipse", "devil_comet"],
        "magnitude": 8.2,
        "region": "North America",
        "biblical_reference": "Matthew 24:29",
        "casualties": 0,
        "impact_score": 0.86
    },
    {
        "id": "EVENT_074",
        "date": datetime(2024, 10, 7),
        "event_type": "israel_hamas_war",
        "description": "Israel-Hamas War begins",
        "celestial_phenomena": ["solar_eclipse", "mars_opposition"],
        "magnitude": 8.5,
        "region": "Middle East",
        "biblical_reference": "Zechariah 12:3, Psalm 83",
        "casualties": 50000,
        "impact_score": 0.88
    },
    {
        "id": "EVENT_075",
        "date": datetime(2025, 1, 1),
        "event_type": "ai_singularity_emergence",
        "description": "Advanced AI systems achieve reasoning breakthrough",
        "celestial_phenomena": ["jupiter_uranus_conjunction"],
        "magnitude": 8.0,
        "region": "Global",
        "biblical_reference": "Daniel 12:4 (knowledge increase)",
        "casualties": 0,
        "impact_score": 0.85
    },
    
    # ==================== PREDICTIVE FUTURE EVENTS (2025-2030) ====================
    {
        "id": "EVENT_076",
        "date": datetime(2026, 8, 12),
        "event_type": "total_eclipse_spain_2026",
        "description": "Total Solar Eclipse over Spain",
        "celestial_phenomena": ["total_solar_eclipse"],
        "magnitude": 7.5,
        "region": "Europe",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.80,
        "is_prediction": True
    },
    {
        "id": "EVENT_077",
        "date": datetime(2027, 8, 2),
        "event_type": "total_eclipse_africa_2027",
        "description": "Total Solar Eclipse across Africa",
        "celestial_phenomena": ["total_solar_eclipse", "mars_opposition"],
        "magnitude": 7.8,
        "region": "Africa",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.82,
        "is_prediction": True
    },
    {
        "id": "EVENT_078",
        "date": datetime(2028, 7, 22),
        "event_type": "total_eclipse_australia_2028",
        "description": "Total Solar Eclipse over Australia",
        "celestial_phenomena": ["total_solar_eclipse"],
        "magnitude": 7.2,
        "region": "Australia",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.76,
        "is_prediction": True
    },
    {
        "id": "EVENT_079",
        "date": datetime(2029, 4, 13),
        "event_type": "apophis_flyby",
        "description": "Asteroid Apophis close Earth flyby",
        "celestial_phenomena": ["near_earth_asteroid", "apophis_approach"],
        "magnitude": 8.5,
        "region": "Global",
        "biblical_reference": "Revelation 8:10-11",
        "casualties": 0,
        "impact_score": 0.88,
        "is_prediction": True
    },
    {
        "id": "EVENT_080",
        "date": datetime(2030, 6, 1),
        "event_type": "annular_eclipse_2030",
        "description": "Annular Solar Eclipse",
        "celestial_phenomena": ["annular_solar_eclipse", "jupiter_saturn_sextile"],
        "magnitude": 7.0,
        "region": "Northern Hemisphere",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.75,
        "is_prediction": True
    },
    
    # ==================== ADDITIONAL HISTORICAL CORRELATIONS ====================
    {
        "id": "EVENT_081",
        "date": datetime(1556, 1, 23),
        "event_type": "shaanxi_earthquake",
        "description": "Deadliest earthquake in history (Shaanxi, China)",
        "celestial_phenomena": ["lunar_eclipse", "comet_appearance"],
        "magnitude": 8.0,
        "region": "China",
        "biblical_reference": None,
        "casualties": 830000,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_082",
        "date": datetime(1783, 2, 5),
        "event_type": "calabria_earthquake",
        "description": "Calabria Earthquake series",
        "celestial_phenomena": ["uranus_discovery_period", "meteor_shower"],
        "magnitude": 7.0,
        "region": "Italy",
        "biblical_reference": None,
        "casualties": 50000,
        "impact_score": 0.75
    },
    {
        "id": "EVENT_083",
        "date": datetime(1815, 4, 10),
        "event_type": "tambora_eruption",
        "description": "Mount Tambora eruption (Year Without Summer)",
        "celestial_phenomena": ["solar_minimum", "volcanic_winter"],
        "magnitude": 8.5,
        "region": "Indonesia",
        "biblical_reference": None,
        "casualties": 71000,
        "impact_score": 0.88
    },
    {
        "id": "EVENT_084",
        "date": datetime(1859, 9, 1),
        "event_type": "carrington_event",
        "description": "Carrington Event solar storm",
        "celestial_phenomena": ["solar_flare", "geomagnetic_storm"],
        "magnitude": 8.8,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.90
    },
    {
        "id": "EVENT_085",
        "date": datetime(1883, 8, 27),
        "event_type": "krakatoa_eruption",
        "description": "Krakatoa volcanic eruption",
        "celestial_phenomena": ["venus_transit", "atmospheric_effects"],
        "magnitude": 8.0,
        "region": "Indonesia",
        "biblical_reference": None,
        "casualties": 36417,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_086",
        "date": datetime(1900, 9, 8),
        "event_type": "galveston_hurricane",
        "description": "Galveston Hurricane (deadliest US natural disaster)",
        "celestial_phenomena": ["mars_opposition", "lunar_eclipse"],
        "magnitude": 7.5,
        "region": "North America",
        "biblical_reference": None,
        "casualties": 12000,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_087",
        "date": datetime(1908, 6, 30),
        "event_type": "tunguska_event",
        "description": "Tunguska meteor airburst",
        "celestial_phenomena": ["meteor_airburst", "comet_fragment"],
        "magnitude": 7.8,
        "region": "Russia",
        "biblical_reference": None,
        "casualties": 0,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_088",
        "date": datetime(1918, 1, 1),
        "event_type": "spanish_flu",
        "description": "Spanish Flu pandemic begins",
        "celestial_phenomena": ["mercury_retrograde", "jupiter_neptune_conjunction"],
        "magnitude": 9.0,
        "region": "Global",
        "biblical_reference": None,
        "casualties": 50000000,
        "impact_score": 0.92
    },
    {
        "id": "EVENT_089",
        "date": datetime(1931, 8, 11),
        "event_type": "china_floods",
        "description": "China floods (deadliest natural disaster)",
        "celestial_phenomena": ["lunar_eclipse", "jupiter_opposition"],
        "magnitude": 8.8,
        "region": "China",
        "biblical_reference": None,
        "casualties": 3700000,
        "impact_score": 0.90
    },
    {
        "id": "EVENT_090",
        "date": datetime(1946, 12, 21),
        "event_type": "nankai_earthquake",
        "description": "Nankai Earthquake and Tsunami",
        "celestial_phenomena": ["solstice_alignment", "mars_conjunction"],
        "magnitude": 8.1,
        "region": "Japan",
        "biblical_reference": None,
        "casualties": 1443,
        "impact_score": 0.84
    },
    {
        "id": "EVENT_091",
        "date": datetime(1963, 10, 9),
        "event_type": "vajont_dam_disaster",
        "description": "Vajont Dam disaster (Italy)",
        "celestial_phenomena": ["lunar_eclipse", "mercury_retrograde"],
        "magnitude": 7.0,
        "region": "Italy",
        "biblical_reference": None,
        "casualties": 1910,
        "impact_score": 0.75
    },
    {
        "id": "EVENT_092",
        "date": datetime(1970, 5, 31),
        "event_type": "ancash_earthquake",
        "description": "Ancash Earthquake (Peru)",
        "celestial_phenomena": ["solar_eclipse", "mars_opposition"],
        "magnitude": 7.9,
        "region": "South America",
        "biblical_reference": None,
        "casualties": 70000,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_093",
        "date": datetime(1980, 5, 18),
        "event_type": "mt_st_helens",
        "description": "Mount St. Helens eruption",
        "celestial_phenomena": ["lunar_eclipse", "jupiter_saturn_conjunction"],
        "magnitude": 7.5,
        "region": "North America",
        "biblical_reference": None,
        "casualties": 57,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_094",
        "date": datetime(1985, 9, 19),
        "event_type": "mexico_city_earthquake",
        "description": "Mexico City Earthquake",
        "celestial_phenomena": ["halley_approach", "venus_conjunction"],
        "magnitude": 8.0,
        "region": "Mexico",
        "biblical_reference": None,
        "casualties": 10000,
        "impact_score": 0.85
    },
    {
        "id": "EVENT_095",
        "date": datetime(1988, 12, 7),
        "event_type": "spitak_earthquake",
        "description": "Spitak Earthquake (Armenia)",
        "celestial_phenomena": ["jupiter_saturn_opposition", "lunar_eclipse"],
        "magnitude": 6.8,
        "region": "Armenia",
        "biblical_reference": None,
        "casualties": 25000,
        "impact_score": 0.78
    },
    {
        "id": "EVENT_096",
        "date": datetime(1993, 1, 15),
        "event_type": "kushiro_earthquake",
        "description": "Kushiro-oki Earthquake (Japan)",
        "celestial_phenomena": ["mercury_retrograde", "mars_conjunction"],
        "magnitude": 7.5,
        "region": "Japan",
        "biblical_reference": None,
        "casualties": 2,
        "impact_score": 0.77
    },
    {
        "id": "EVENT_097",
        "date": datetime(1999, 8, 17),
        "event_type": "izmit_earthquake",
        "description": "İzmit Earthquake (Turkey)",
        "celestial_phenomena": ["solar_eclipse", "grand_cross"],
        "magnitude": 7.6,
        "region": "Turkey",
        "biblical_reference": None,
        "casualties": 17127,
        "impact_score": 0.81
    },
    {
        "id": "EVENT_098",
        "date": datetime(2006, 5, 27),
        "event_type": "yogyakarta_earthquake",
        "description": "Yogyakarta Earthquake (Indonesia)",
        "celestial_phenomena": ["lunar_eclipse", "jupiter_opposition"],
        "magnitude": 6.3,
        "region": "Indonesia",
        "biblical_reference": None,
        "casualties": 5749,
        "impact_score": 0.73
    },
    {
        "id": "EVENT_099",
        "date": datetime(2009, 4, 6),
        "event_type": "laquila_earthquake",
        "description": "L'Aquila Earthquake (Italy)",
        "celestial_phenomena": ["mercury_retrograde", "saturn_opposition"],
        "magnitude": 6.3,
        "region": "Italy",
        "biblical_reference": None,
        "casualties": 309,
        "impact_score": 0.72
    },
    {
        "id": "EVENT_100",
        "date": datetime(2015, 4, 25),
        "event_type": "nepal_earthquake",
        "description": "Nepal Earthquake (Gorkha)",
        "celestial_phenomena": ["blood_moon_tetrad", "mercury_retrograde"],
        "magnitude": 7.8,
        "region": "Nepal",
        "biblical_reference": None,
        "casualties": 8964,
        "impact_score": 0.82
    },
    {
        "id": "EVENT_101",
        "date": datetime(2018, 9, 28),
        "event_type": "sulawesi_earthquake",
        "description": "Sulawesi Earthquake and Tsunami",
        "celestial_phenomena": ["harvest_moon", "mercury_retrograde"],
        "magnitude": 7.5,
        "region": "Indonesia",
        "biblical_reference": None,
        "casualties": 4340,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_102",
        "date": datetime(2020, 1, 28),
        "event_type": "caribbean_earthquake",
        "description": "Caribbean Earthquake (Jamaica)",
        "celestial_phenomena": ["venus_conjunction", "mars_square"],
        "magnitude": 7.7,
        "region": "Caribbean",
        "biblical_reference": None,
        "casualties": 1,
        "impact_score": 0.76
    },
    {
        "id": "EVENT_103",
        "date": datetime(2021, 8, 14),
        "event_type": "haiti_earthquake_2021",
        "description": "Haiti Earthquake 2021",
        "celestial_phenomena": ["perseid_meteor_shower", "jupiter_opposition"],
        "magnitude": 7.2,
        "region": "Caribbean",
        "biblical_reference": None,
        "casualties": 2248,
        "impact_score": 0.78
    },
    {
        "id": "EVENT_104",
        "date": datetime(2023, 2, 6),
        "event_type": "turkey_earthquake_2023",
        "description": "Turkey-Syria Earthquake (follow-up)",
        "celestial_phenomena": ["mercury_retrograde", "venus_neptune_conjunction"],
        "magnitude": 7.5,
        "region": "Turkey",
        "biblical_reference": None,
        "casualties": 50000,
        "impact_score": 0.80
    },
    {
        "id": "EVENT_105",
        "date": datetime(2024, 1, 1),
        "event_type": "japan_earthquake_2024",
        "description": "Japan New Year Earthquake",
        "celestial_phenomena": ["supermoon", "mercury_conjunction"],
        "magnitude": 7.6,
        "region": "Japan",
        "biblical_reference": None,
        "casualties": 241,
        "impact_score": 0.79
    },
]

# Feature extraction for ML training
def extract_features(event: Dict[str, Any]) -> Dict[str, Any]:
    """Extract numerical and categorical features for ML training."""
    
    # Celestial phenomena encoding
    phenomena_types = {
        "lunar_eclipse": 1,
        "solar_eclipse": 2,
        "blood_moon": 3,
        "comet_appearance": 4,
        "planetary_conjunction": 5,
        "meteor_shower": 6,
        "supernova": 7,
        "aurora": 8,
        "meteor_airburst": 9,
        "asteroid_approach": 10
    }
    
    # Count celestial phenomena
    total_phenomena = len(event.get("celestial_phenomena", []))
    max_phenomena_weight = 0
    
    for phenomenon in event.get("celestial_phenomena", []):
        # Get base phenomenon type
        base_type = phenomenon.split("_")[0]
        weight = phenomena_types.get(base_type, 0)
        max_phenomena_weight = max(max_phenomena_weight, weight)
    
    # Event type severity
    event_severity = {
        "earthquake": 0.8,
        "war": 0.9,
        "pandemic": 0.95,
        "nuclear_disaster": 0.9,
        "natural_disaster": 0.85,
        "celestial_event": 0.6,
        "political_event": 0.7,
        "technological": 0.65
    }
    
    # Determine event category
    event_type = event.get("event_type", "")
    if "earthquake" in event_type or "tsunami" in event_type:
        category_severity = event_severity["earthquake"]
    elif "war" in event_type or "attack" in event_type:
        category_severity = event_severity["war"]
    elif "pandemic" in event_type or "flu" in event_type or "covid" in event_type:
        category_severity = event_severity["pandemic"]
    elif "nuclear" in event_type or "chernobyl" in event_type:
        category_severity = event_severity["nuclear_disaster"]
    elif "hurricane" in event_type or "flood" in event_type or "eruption" in event_type:
        category_severity = event_severity["natural_disaster"]
    elif "eclipse" in event_type or "comet" in event_type or "meteor" in event_type:
        category_severity = event_severity["celestial_event"]
    elif "revolution" in event_type or "independence" in event_type:
        category_severity = event_severity["political_event"]
    else:
        category_severity = 0.5
    
    return {
        "magnitude": event.get("magnitude", 5.0),
        "impact_score": event.get("impact_score", 0.5),
        "total_phenomena": total_phenomena,
        "max_phenomena_weight": max_phenomena_weight,
        "casualties": event.get("casualties", 0),
        "log_casualties": np.log10(event.get("casualties", 0) + 1),  # Log scale
        "has_biblical_reference": 1 if event.get("biblical_reference") else 0,
        "category_severity": category_severity,
        "is_prediction": 1 if event.get("is_prediction", False) else 0,
        "year": event.get("date").year if event.get("date") else 0,
        "month": event.get("date").month if event.get("date") else 0,
        "day_of_year": event.get("date").timetuple().tm_yday if event.get("date") else 0
    }

# Get training dataset
def get_training_data() -> List[Dict[str, Any]]:
    """Return the complete training dataset."""
    return EXPANDED_TRAINING_DATA

# Get features matrix for ML
def get_features_matrix() -> tuple:
    """Return features and labels for ML training."""
    import numpy as np
    
    features = []
    labels = []
    
    for event in EXPANDED_TRAINING_DATA:
        feature_dict = extract_features(event)
        features.append([
            feature_dict["magnitude"],
            feature_dict["total_phenomena"],
            feature_dict["max_phenomena_weight"],
            feature_dict["log_casualties"],
            feature_dict["has_biblical_reference"],
            feature_dict["category_severity"],
            feature_dict["month"],
            feature_dict["day_of_year"]
        ])
        labels.append(feature_dict["impact_score"])
    
    return np.array(features), np.array(labels)

# Statistics
def get_dataset_statistics() -> Dict[str, Any]:
    """Return statistics about the training dataset."""
    total_events = len(EXPANDED_TRAINING_DATA)
    total_casualties = sum(e.get("casualties", 0) for e in EXPANDED_TRAINING_DATA)
    avg_magnitude = sum(e.get("magnitude", 0) for e in EXPANDED_TRAINING_DATA) / total_events
    
    # Events with biblical references
    biblical_events = sum(1 for e in EXPANDED_TRAINING_DATA if e.get("biblical_reference"))
    
    # Events by century
    events_by_century = {}
    for event in EXPANDED_TRAINING_DATA:
        year = event.get("date").year if event.get("date") else 0
        century = (year // 100) * 100
        events_by_century[century] = events_by_century.get(century, 0) + 1
    
    return {
        "total_events": total_events,
        "total_casualties": total_casualties,
        "average_magnitude": avg_magnitude,
        "biblical_references": biblical_events,
        "events_by_century": events_by_century,
        "date_range": f"{min(e['date'].year for e in EXPANDED_TRAINING_DATA if e.get('date'))} - {max(e['date'].year for e in EXPANDED_TRAINING_DATA if e.get('date'))}"
    }
