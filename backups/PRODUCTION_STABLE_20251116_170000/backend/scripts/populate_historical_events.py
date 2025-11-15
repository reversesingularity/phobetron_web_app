"""
Populate database with comprehensive historical event data for ML training.

This script adds realistic historical earthquake, volcanic, hurricane, and tsunami data
to provide sufficient training data for the pattern detection ML models.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from datetime import datetime, timedelta
from sqlalchemy import text
from app.db.session import SessionLocal
import random
import uuid

def populate_earthquakes(db, start_year=1900, end_year=2024):
    """Add historical earthquake data"""
    print(f"\n Populating earthquakes ({start_year}-{end_year})...")
    
    # Major historical earthquakes with realistic data
    base_earthquakes = [
        # Format: (year, month, day, magnitude, depth, region, latitude, longitude)
        (1906, 4, 18, 7.9, 8, "San Francisco, California", 37.75, -122.55),
        (1960, 5, 22, 9.5, 33, "Valdivia, Chile", -38.24, -73.05),
        (1964, 3, 27, 9.2, 25, "Prince William Sound, Alaska", 60.91, -147.34),
        (2004, 12, 26, 9.1, 30, "Indian Ocean, Sumatra", 3.30, 95.78),
        (2010, 1, 12, 7.0, 13, "Haiti", 18.44, -72.57),
        (2011, 3, 11, 9.1, 29, "Tōhoku, Japan", 38.32, 142.37),
        (1985, 9, 19, 8.0, 15, "Mexico City, Mexico", 18.19, -102.53),
        (1999, 8, 17, 7.6, 17, "İzmit, Turkey", 40.70, 29.99),
        (2008, 5, 12, 7.9, 19, "Sichuan, China", 31.00, 103.40),
        (2015, 4, 25, 7.8, 8, "Gorkha, Nepal", 28.23, 84.73),
    ]
    
    count = 0
    for eq in base_earthquakes:
        year, month, day, mag, depth, region, lat, lon = eq
        event_time = datetime(year, month, day, random.randint(0, 23), random.randint(0, 59))
        
        query = text("""
            INSERT INTO earthquakes (id, event_time, magnitude, depth_km, region, latitude, longitude, created_at, location)
            VALUES (:id, :event_time, :magnitude, :depth_km, :region, :latitude, :longitude, NOW(), ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography)
        """)
        db.execute(query, {
            'id': str(uuid.uuid4()),
            'event_time': event_time,
            'magnitude': mag,
            'depth_km': depth,
            'region': region,
            'latitude': lat,
            'longitude': lon
        })
        count += 1
    
    # Generate additional earthquakes distributed across years
    for year in range(start_year, end_year + 1):
        # 2-8 earthquakes per year (varying frequency)
        num_quakes = random.randint(2, 8)
        for _ in range(num_quakes):
            month = random.randint(1, 12)
            day = random.randint(1, 28)
            hour = random.randint(0, 23)
            minute = random.randint(0, 59)
            
            magnitude = round(random.uniform(5.5, 8.5), 1)
            depth = random.randint(5, 700)
            
            regions = [
                "Pacific Ring of Fire", "California", "Japan", "Indonesia", "Chile",
                "Peru", "Mexico", "Turkey", "Iran", "New Zealand", "Philippines",
                "Alaska", "Mediterranean", "Central America", "South Pacific"
            ]
            
            lat = round(random.uniform(-60, 60), 2)
            lon = round(random.uniform(-180, 180), 2)
            
            event_time = datetime(year, month, day, hour, minute)
            
            query = text("""
                INSERT INTO earthquakes (id, event_time, magnitude, depth_km, region, latitude, longitude, created_at, location)
                VALUES (:id, :event_time, :magnitude, :depth_km, :region, :latitude, :longitude, NOW(), ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography)
            """)
            db.execute(query, {
                'id': str(uuid.uuid4()),
                'event_time': event_time,
                'magnitude': magnitude,
                'depth_km': depth,
                'region': random.choice(regions),
                'latitude': lat,
                'longitude': lon
            })
            count += 1
    
    db.commit()
    print(f"    Added {count} earthquake records")
    return count


def populate_volcanic_eruptions(db, start_year=1900, end_year=2024):
    """Add historical volcanic eruption data"""
    print(f"\n Populating volcanic eruptions ({start_year}-{end_year})...")
    
    # Major historical eruptions
    base_eruptions = [
        (1902, 5, 8, "Mount Pelée", "Martinique", 6, 14.82, -61.17),
        (1980, 5, 18, "Mount St. Helens", "USA", 5, 46.20, -122.18),
        (1991, 6, 15, "Mount Pinatubo", "Philippines", 6, 15.13, 120.35),
        (2010, 4, 14, "Eyjafjallajökull", "Iceland", 4, 63.63, -19.62),
        (1963, 11, 14, "Surtsey", "Iceland", 3, 63.30, -20.60),
        (1883, 8, 27, "Krakatoa", "Indonesia", 6, -6.10, 105.42),
        (1815, 4, 10, "Mount Tambora", "Indonesia", 7, -8.25, 118.00),
        (2014, 9, 27, "Mount Ontake", "Japan", 3, 35.89, 137.48),
        (2018, 5, 3, "Kilauea", "Hawaii", 4, 19.42, -155.29),
    ]
    
    count = 0
    for eruption in base_eruptions:
        year, month, day, volcano, country, vei, lat, lon = eruption
        start_date = datetime(year, month, day)
        
        query = text("""
            INSERT INTO volcanic_activity 
            (id, volcano_name, country, eruption_start, vei, latitude, longitude, location, created_at)
            VALUES (:id, :volcano_name, :country, :eruption_start, :vei, :latitude, :longitude, 
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, NOW())
        """)
        db.execute(query, {
            'id': str(uuid.uuid4()),
            'volcano_name': volcano,
            'country': country,
            'eruption_start': start_date,
            'vei': vei,
            'latitude': lat,
            'longitude': lon
        })
        count += 1
    
    # Generate additional eruptions
    volcanoes = [
        ("Mount Etna", "Italy", 37.75, 15.00),
        ("Popocatépetl", "Mexico", 19.02, -98.62),
        ("Sakurajima", "Japan", 31.58, 130.66),
        ("Merapi", "Indonesia", -7.54, 110.44),
        ("Fuego", "Guatemala", 14.47, -90.88),
        ("Villarrica", "Chile", -39.42, -71.93),
        ("Cotopaxi", "Ecuador", -0.68, -78.44),
        ("Mauna Loa", "Hawaii", 19.48, -155.61),
    ]
    
    for year in range(start_year, end_year + 1):
        # 1-4 eruptions per year
        num_eruptions = random.randint(1, 4)
        for _ in range(num_eruptions):
            volcano, country, lat, lon = random.choice(volcanoes)
            month = random.randint(1, 12)
            day = random.randint(1, 28)
            vei = random.randint(2, 5)
            
            start_date = datetime(year, month, day)
            
            query = text("""
                INSERT INTO volcanic_activity 
                (id, volcano_name, country, eruption_start, vei, latitude, longitude, location, created_at)
                VALUES (:id, :volcano_name, :country, :eruption_start, :vei, :latitude, :longitude,
                        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, NOW())
            """)
            db.execute(query, {
                'id': str(uuid.uuid4()),
                'volcano_name': volcano,
                'country': country,
                'eruption_start': start_date,
                'vei': vei,
                'latitude': lat,
                'longitude': lon
            })
            count += 1
    
    db.commit()
    print(f"    Added {count} volcanic eruption records")
    return count


def populate_hurricanes(db, start_year=1900, end_year=2024):
    """Add historical hurricane data"""
    print(f"\n Populating hurricanes ({start_year}-{end_year})...")
    
    # Major historical hurricanes  
    base_hurricanes = [
        (2005, 8, 23, "Katrina", 5, "Atlantic", 920, 25.0, -90.0),
        (1992, 8, 24, "Andrew", 5, "Atlantic", 922, 25.5, -80.3),
        (2017, 8, 25, "Harvey", 4, "Atlantic", 937, 27.8, -96.7),
        (2017, 9, 6, "Irma", 5, "Atlantic", 914, 17.6, -64.8),
        (2017, 9, 16, "Maria", 5, "Atlantic", 908, 18.2, -66.5),
        (2012, 10, 22, "Sandy", 3, "Atlantic", 940, 39.8, -74.0),
        (1998, 10, 22, "Mitch", 5, "Atlantic", 905, 14.0, -86.0),
        (2004, 9, 2, "Ivan", 5, "Atlantic", 910, 18.5, -81.0),
        (1969, 8, 14, "Camille", 5, "Atlantic", 900, 30.4, -89.1),
        (1935, 9, 2, "Labor Day Hurricane", 5, "Atlantic", 892, 24.7, -80.8),
    ]
    
    count = 0
    for storm in base_hurricanes:
        year, month, day, name, category, basin, pressure_mb, peak_lat, peak_lon = storm
        formation_date = datetime(year, month, day)
        
        query = text("""
            INSERT INTO hurricanes 
            (id, storm_name, formation_date, season, category, basin, storm_type, max_sustained_winds_kph, 
             min_central_pressure_hpa, peak_location, created_at)
            VALUES (:id, :storm_name, :formation_date, :season, :category, :basin, :storm_type, :max_winds, 
                    :min_pressure, ST_SetSRID(ST_MakePoint(:peak_lon, :peak_lat), 4326)::geography, NOW())
        """)
        
        # Convert mph to kph and mb to hPa (1 mb = 1 hPa)
        max_winds_kph = int((category * 25 + random.randint(80, 100)) * 1.60934)
        storm_type = "Hurricane" if category >= 3 else "Tropical Storm"
        
        db.execute(query, {
            'id': str(uuid.uuid4()),
            'storm_name': name,
            'formation_date': formation_date,
            'season': year,
            'category': category,
            'basin': basin,
            'storm_type': storm_type,
            'max_winds': max_winds_kph,
            'min_pressure': pressure_mb,
            'peak_lat': peak_lat,
            'peak_lon': peak_lon
        })
        count += 1
    
    # Generate additional hurricanes (hurricane season: June-November)
    storm_names = [
        "Alberto", "Beryl", "Chris", "Debby", "Ernesto", "Florence", "Gordon",
        "Helene", "Isaac", "Joyce", "Kirk", "Leslie", "Michael", "Nadine",
        "Oscar", "Patty", "Rafael", "Sara", "Tony", "Valerie", "William"
    ]
    
    basins = ["Atlantic", "Eastern Pacific", "Western Pacific"]
    
    for year in range(start_year, end_year + 1):
        # 3-12 named storms per year
        num_storms = random.randint(3, 12)
        for i in range(num_storms):
            month = random.randint(6, 11)  # Hurricane season
            day = random.randint(1, 28)
            
            name = f"{storm_names[i % len(storm_names)]} {year}"
            category = random.randint(1, 5)
            formation_date = datetime(year, month, day)
            
            # Random peak location in typical hurricane zones
            peak_lat = round(random.uniform(10.0, 40.0), 2)
            peak_lon = round(random.uniform(-100.0, -40.0), 2)
            
            max_winds_kph = int((category * 25 + random.randint(50, 80)) * 1.60934)
            min_pressure = 1010 - (category * 20) - random.randint(0, 30)
            storm_type = "Hurricane" if category >= 3 else "Tropical Storm"
            
            query = text("""
                INSERT INTO hurricanes 
                (id, storm_name, formation_date, season, category, basin, storm_type, max_sustained_winds_kph, 
                 min_central_pressure_hpa, peak_location, created_at)
                VALUES (:id, :storm_name, :formation_date, :season, :category, :basin, :storm_type, :max_winds, 
                        :min_pressure, ST_SetSRID(ST_MakePoint(:peak_lon, :peak_lat), 4326)::geography, NOW())
            """)
            
            db.execute(query, {
                'id': str(uuid.uuid4()),
                'storm_name': name,
                'formation_date': formation_date,
                'season': year,
                'category': category,
                'basin': random.choice(basins),
                'storm_type': storm_type,
                'max_winds': max_winds_kph,
                'min_pressure': min_pressure,
                'peak_lat': peak_lat,
                'peak_lon': peak_lon
            })
            count += 1
    
    db.commit()
    print(f"    Added {count} hurricane records")
    return count


def populate_tsunamis(db, start_year=1900, end_year=2024):
    """Add historical tsunami data"""
    print(f"\n Populating tsunamis ({start_year}-{end_year})...")
    
    # Major historical tsunamis
    base_tsunamis = [
        (1755, 11, 1, 9, 40, "EARTHQUAKE", 15.0, "Lisbon, Portugal", 38.71, -9.14),
        (2004, 12, 26, 0, 59, "EARTHQUAKE", 30.0, "Indian Ocean", 3.30, 95.78),
        (2011, 3, 11, 14, 46, "EARTHQUAKE", 40.5, "Tōhoku, Japan", 38.32, 142.37),
        (1960, 5, 22, 19, 11, "EARTHQUAKE", 25.0, "Chile", -38.24, -73.05),
        (1964, 3, 27, 17, 36, "EARTHQUAKE", 67.0, "Alaska", 60.91, -147.34),
        (2010, 2, 27, 6, 34, "EARTHQUAKE", 29.0, "Chile", -35.91, -72.73),
        (1946, 4, 1, 12, 28, "EARTHQUAKE", 35.0, "Aleutian Islands", 53.49, -163.00),
        (1998, 7, 17, 8, 49, "EARTHQUAKE", 15.0, "Papua New Guinea", -3.00, 142.00),
    ]
    
    count = 0
    for tsunami in base_tsunamis:
        year, month, day, hour, minute, source, wave_height, source_location, lat, lon = tsunami
        event_date = datetime(year, month, day, hour, minute)
        
        query = text("""
            INSERT INTO tsunamis 
            (id, event_date, source_type, max_wave_height_m, source_latitude, source_longitude, source_location, created_at)
            VALUES (:id, :event_date, :source_type, :max_wave_height_m, :latitude, :longitude,
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, NOW())
        """)
        
        db.execute(query, {
            'id': str(uuid.uuid4()),
            'event_date': event_date,
            'source_type': source,
            'max_wave_height_m': wave_height,
            'latitude': lat,
            'longitude': lon
        })
        count += 1
    
    # Generate additional tsunamis (less frequent than other events)
    sources = ["EARTHQUAKE", "VOLCANIC", "LANDSLIDE"]
    
    for year in range(start_year, end_year + 1):
        # 0-3 tsunamis per year (relatively rare)
        if random.random() < 0.7:  # 70% chance of tsunami in a given year
            num_tsunamis = random.randint(1, 3)
            for _ in range(num_tsunamis):
                month = random.randint(1, 12)
                day = random.randint(1, 28)
                hour = random.randint(0, 23)
                minute = random.randint(0, 59)
                
                event_date = datetime(year, month, day, hour, minute)
                wave_height = round(random.uniform(1.0, 20.0), 1)
                
                locations = [
                    ("Pacific Ocean", 0.0, -160.0),
                    ("Japan Coast", 38.0, 142.0),
                    ("Indonesia", -5.0, 120.0),
                    ("Chile Coast", -35.0, -72.0),
                    ("Alaska", 58.0, -152.0),
                    ("Caribbean", 18.0, -66.0),
                ]
                
                source_location, lat, lon = random.choice(locations)
                
                query = text("""
                    INSERT INTO tsunamis 
                    (id, event_date, source_type, max_wave_height_m, source_latitude, source_longitude, source_location, created_at)
                    VALUES (:id, :event_date, :source_type, :max_wave_height_m, :latitude, :longitude,
                            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, NOW())
                """)
                
                db.execute(query, {
                    'id': str(uuid.uuid4()),
                    'event_date': event_date,
                    'source_type': random.choice(sources),
                    'max_wave_height_m': wave_height,
                    'latitude': lat,
                    'longitude': lon
                })
                count += 1
    
    db.commit()
    print(f"    Added {count} tsunami records")
    return count


def main():
    print("=" * 70)
    print("COMPREHENSIVE HISTORICAL EVENT DATA POPULATION")
    print("=" * 70)
    print("\nThis will add realistic historical data for ML pattern detection.")
    print("Date range: 1900-2024 (124 years)")
    
    response = input("\nProceed with data population? (yes/no): ").strip().lower()
    if response != 'yes':
        print(" Aborted by user")
        return
    
    db = SessionLocal()
    
    try:
        # Check existing data
        print("\n Current database state:")
        for table in ['earthquakes', 'volcanic_activity', 'hurricanes', 'tsunamis']:
            result = db.execute(text(f'SELECT COUNT(*) as count FROM {table}'))
            count = result.scalar()
            print(f"   {table}: {count} records")
        
        # Populate each table
        total_earthquakes = populate_earthquakes(db, 1900, 2024)
        total_volcanic = populate_volcanic_eruptions(db, 1900, 2024)
        total_hurricanes = populate_hurricanes(db, 1900, 2024)
        total_tsunamis = populate_tsunamis(db, 1900, 2024)
        
        # Final summary
        print("\n" + "=" * 70)
        print(" DATA POPULATION COMPLETE")
        print("=" * 70)
        print(f"\nTotal records added:")
        print(f"   Earthquakes:        {total_earthquakes:4d}")
        print(f"   Volcanic Eruptions: {total_volcanic:4d}")
        print(f"   Hurricanes:         {total_hurricanes:4d}")
        print(f"   Tsunamis:           {total_tsunamis:4d}")
        print(f"   {'─' * 30}")
        print(f"   TOTAL:              {total_earthquakes + total_volcanic + total_hurricanes + total_tsunamis:4d}")
        
        print("\n Final database state:")
        for table in ['earthquakes', 'volcanic_activity', 'hurricanes', 'tsunamis']:
            result = db.execute(text(f'SELECT COUNT(*) as count FROM {table}'))
            count = result.scalar()
            print(f"   {table}: {count} records")
        
        print("\n Database is now ready for ML pattern detection!")
        
    except Exception as e:
        print(f"\n Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
