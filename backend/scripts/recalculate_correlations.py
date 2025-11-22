"""
ML Correlation Recalculator for GitHub Actions
Recalculates correlations between celestial events and disasters
"""

import sys
import os
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session


def recalculate_correlations():
    """
    Recalculate ML correlations between celestial events and disasters
    """
    print("🤖 Recalculating ML correlations...")
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("  ❌ DATABASE_URL not set")
        return 0
    
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    engine = create_engine(database_url)
    
    correlations_found = 0
    
    with Session(engine) as session:
        # Get recent earthquakes (last 90 days)
        earthquakes = session.execute(
            text("""
                SELECT id, event_time, magnitude, latitude, longitude 
                FROM earthquakes 
                WHERE event_time >= NOW() - INTERVAL '90 days'
                ORDER BY event_time DESC
            """)
        ).fetchall()
        
        # Get NEO close approaches (last 90 days)
        neos = session.execute(
            text("""
                SELECT id, approach_date, miss_distance_au, diameter_max_km 
                FROM neo_close_approaches 
                WHERE approach_date >= NOW() - INTERVAL '90 days'
                ORDER BY approach_date DESC
            """)
        ).fetchall()
        
        print(f"  📊 Processing {len(earthquakes)} earthquakes and {len(neos)} NEOs...")
        
        # Simple correlation logic: events within 7 days + proximity
        for eq in earthquakes:
            for neo in neos:
                # Calculate time difference (in days)
                time_diff = abs((eq.event_time - neo.approach_date).days)
                
                if time_diff <= 7:  # Within 7 days
                    # Calculate correlation score (0-1)
                    # Closer NEO + higher magnitude = higher score
                    distance_factor = max(0, 1 - (neo.miss_distance_au / 0.1))  # 0.1 AU threshold
                    magnitude_factor = eq.magnitude / 10.0  # Normalize to 0-1
                    time_factor = 1 - (time_diff / 7.0)  # Closer in time = higher score
                    
                    correlation_score = (distance_factor * 0.4 + 
                                       magnitude_factor * 0.4 + 
                                       time_factor * 0.2)
                    
                    if correlation_score >= 0.5:  # Threshold for significance
                        # Check if correlation already exists
                        existing = session.execute(
                            text("""
                                SELECT id FROM correlations 
                                WHERE earthquake_id = :eq_id 
                                AND neo_approach_id = :neo_id
                            """),
                            {"eq_id": eq.id, "neo_id": neo.id}
                        ).fetchone()
                        
                        if not existing:
                            # Insert new correlation
                            session.execute(
                                text("""
                                    INSERT INTO correlations 
                                    (earthquake_id, neo_approach_id, correlation_score, 
                                     time_difference_days, confidence_level, created_at)
                                    VALUES 
                                    (:eq_id, :neo_id, :score, :time_diff, :confidence, :created)
                                """),
                                {
                                    "eq_id": eq.id,
                                    "neo_id": neo.id,
                                    "score": round(correlation_score, 3),
                                    "time_diff": time_diff,
                                    "confidence": "HIGH" if correlation_score >= 0.7 else "MEDIUM",
                                    "created": datetime.utcnow()
                                }
                            )
                            correlations_found += 1
        
        session.commit()
    
    print(f"  ✅ Found {correlations_found} new correlations")
    return correlations_found


if __name__ == '__main__':
    count = recalculate_correlations()
    print(f"\n✅ Correlation recalculation completed: {count} new correlations")
    sys.exit(0)
