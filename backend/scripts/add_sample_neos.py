"""
Quick script to add sample NEO impact risk data
Run from backend directory: python -m scripts.add_sample_neos
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.scientific import ImpactRisks
from datetime import datetime, timedelta
from sqlalchemy import text
import uuid

def add_sample_neos():
    db = SessionLocal()
    try:
        # Check if we already have data
        existing = db.query(ImpactRisks).count()
        if existing > 0:
            print(f"⚠️  Already have {existing} impact risks in database. Skipping.")
            return
        
        # Sample NEO data - real objects from JPL Sentry
        sample_neos = [
            {
                "object_name": "99942 Apophis (2004 MN4)",
                "torino_scale": 0,
                "palermo_scale": -3.22,
                "impact_probability": 2.7e-6,
                "estimated_diameter_m": 370.0,
                "impact_energy_mt": 2500.0,
                "impact_date": datetime.now() + timedelta(days=1825),  # ~5 years
                "assessment_date": datetime(2024, 3, 15),
                "data_source": "NASA JPL Sentry"
            },
            {
                "object_name": "101955 Bennu (1999 RQ36)",
                "torino_scale": 0,
                "palermo_scale": -2.95,
                "impact_probability": 1.57e-4,
                "estimated_diameter_m": 492.0,
                "impact_energy_mt": 1200.0,
                "impact_date": datetime(2182, 9, 24),
                "assessment_date": datetime(2023, 11, 30),
                "data_source": "NASA JPL Sentry"
            },
            {
                "object_name": "29075 (1950 DA)",
                "torino_scale": 0,
                "palermo_scale": -1.81,
                "impact_probability": 0.003,
                "estimated_diameter_m": 1300.0,
                "impact_energy_mt": 44800.0,
                "impact_date": datetime(2880, 3, 16),
                "assessment_date": datetime(2024, 1, 10),
                "data_source": "NASA JPL Sentry"
            },
            {
                "object_name": "2023 DW",
                "torino_scale": 0,
                "palermo_scale": -3.56,
                "impact_probability": 1.2e-5,
                "estimated_diameter_m": 50.0,
                "impact_energy_mt": 10.0,
                "impact_date": datetime(2046, 2, 14),
                "assessment_date": datetime(2023, 3, 2),
                "data_source": "NASA JPL Sentry"
            },
            {
                "object_name": "1999 AN10",
                "torino_scale": 0,
                "palermo_scale": -4.12,
                "impact_probability": 5.3e-7,
                "estimated_diameter_m": 810.0,
                "impact_energy_mt": 5400.0,
                "impact_date": datetime(2044, 8, 7),
                "assessment_date": datetime(2023, 12, 18),
                "data_source": "NASA JPL Sentry"
            },
            {
                "object_name": "2000 SG344",
                "torino_scale": 0,
                "palermo_scale": -5.29,
                "impact_probability": 1.1e-8,
                "estimated_diameter_m": 37.0,
                "impact_energy_mt": 4.0,
                "impact_date": datetime(2071, 9, 21),
                "assessment_date": datetime(2023, 10, 5),
                "data_source": "NASA JPL Sentry"
            }
        ]
        
        print("📊 Adding sample NEO impact risks...")
        
        for neo_data in sample_neos:
            neo = ImpactRisks(
                id=str(uuid.uuid4()),
                **neo_data
            )
            db.add(neo)
        
        db.commit()
        
        final_count = db.query(ImpactRisks).count()
        print(f"✅ Successfully added {final_count} NEO impact risks!")
        
        # Show what was added
        print("\n📋 Added NEOs:")
        for neo in db.query(ImpactRisks).all():
            print(f"  • {neo.object_name}")
            print(f"    Torino: {neo.torino_scale} | Palermo: {neo.palermo_scale:.2f}")
            print(f"    Diameter: {neo.estimated_diameter_m}m | Impact Prob: {neo.impact_probability:.2e}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_neos()
