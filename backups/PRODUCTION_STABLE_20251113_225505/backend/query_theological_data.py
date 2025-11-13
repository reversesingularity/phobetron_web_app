"""
Query theological data to demonstrate relationships.
Shows how prophecies link to multiple celestial signs.
"""
from sqlalchemy.orm import Session
from app.db.session import engine
from app.models.theological import Prophecies, CelestialSigns


def main():
    """Query and display theological relationships."""
    print("=== Theological Data Relationships ===\n")
    
    with Session(engine) as db:
        # Query all prophecies with their linked signs
        prophecies = db.query(Prophecies).order_by(Prophecies.chronological_order).all()
        
        print(f"Total Prophecies: {len(prophecies)}\n")
        
        for prophecy in prophecies:
            print(f"{'='*80}")
            print(f"📖 {prophecy.event_name}")
            print(f"   Scripture: {prophecy.scripture_reference}")
            print(f"   Category: {prophecy.prophecy_category}")
            if prophecy.chronological_order:
                print(f"   Order: #{prophecy.chronological_order}")
            
            print(f"\n   🌟 Linked Celestial Signs ({len(prophecy.celestial_signs)}):")
            for sign in prophecy.celestial_signs:
                print(f"      • {sign.sign_name} ({sign.sign_type})")
            
            print()
        
        # Query specific sign and show all prophecies
        print(f"\n{'='*80}")
        print("🔍 Example: 'Great Earthquake' Sign Details\n")
        
        earthquake = db.query(CelestialSigns).filter_by(sign_name="Great Earthquake").first()
        if earthquake:
            print(f"Sign: {earthquake.sign_name}")
            print(f"Type: {earthquake.sign_type}")
            print(f"Primary Scripture: {earthquake.primary_scripture}")
            print(f"\nRelated Scriptures:")
            for ref in earthquake.related_scriptures:
                print(f"  • {ref}")
            
            print(f"\n📚 Appears in {len(earthquake.prophecies)} Prophecies:")
            for prophecy in earthquake.prophecies:
                print(f"  • {prophecy.event_name} ({prophecy.scripture_reference})")
        
        # Query by category
        print(f"\n{'='*80}")
        print("📋 Prophecies by Category:\n")
        
        seal_judgments = db.query(Prophecies).filter_by(
            prophecy_category="SEAL_JUDGMENT"
        ).order_by(Prophecies.chronological_order).all()
        
        print(f"SEAL_JUDGMENT ({len(seal_judgments)}):")
        for p in seal_judgments:
            print(f"  {p.chronological_order}. {p.event_name}")
        
        trumpet_judgments = db.query(Prophecies).filter_by(
            prophecy_category="TRUMPET_JUDGMENT"
        ).order_by(Prophecies.chronological_order).all()
        
        print(f"\nTRUMPET_JUDGMENT ({len(trumpet_judgments)}):")
        for p in trumpet_judgments:
            print(f"  {p.chronological_order}. {p.event_name}")
        
        bowl_judgments = db.query(Prophecies).filter_by(
            prophecy_category="BOWL_JUDGMENT"
        ).order_by(Prophecies.chronological_order).all()
        
        print(f"\nBOWL_JUDGMENT ({len(bowl_judgments)}):")
        for p in bowl_judgments:
            print(f"  {p.chronological_order}. {p.event_name}")
        
        # Sign types summary
        print(f"\n{'='*80}")
        print("🌠 Celestial Signs by Type:\n")
        
        sign_types = db.query(
            CelestialSigns.sign_type,
            db.query(CelestialSigns).filter(
                CelestialSigns.sign_type == CelestialSigns.sign_type
            ).count()
        ).group_by(CelestialSigns.sign_type).all()
        
        all_signs = db.query(CelestialSigns).order_by(CelestialSigns.sign_type, CelestialSigns.sign_name).all()
        
        current_type = None
        for sign in all_signs:
            if sign.sign_type != current_type:
                current_type = sign.sign_type
                print(f"\n{current_type}:")
            print(f"  • {sign.sign_name}")


if __name__ == "__main__":
    main()
