"""
Admin endpoints for database management.
WARNING: These should be protected in production!
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import subprocess
import os
from typing import Dict, List

from app.db.session import get_db
from app.integrations.external_apis import USGSEarthquakeClient
from app.models.events import Earthquakes

router = APIRouter(tags=["admin"])


@router.get("/ping")
async def admin_ping():
    """Simple ping endpoint to verify admin routes are accessible."""
    return {
        "status": "ok",
        "message": "Admin endpoints are accessible",
        "timestamp": "2025-11-12T00:00:00Z"
    }


@router.post("/run-migrations")
async def run_migrations():
    """
    Run database migrations via Alembic.
    WARNING: This endpoint should be protected or removed in production!
    """
    try:
        # Run alembic upgrade head
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            cwd="/app"  # Railway container working directory
        )
        
        return {
            "status": "success" if result.returncode == 0 else "error",
            "return_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/populate-database")
async def populate_database():
    """
    Populate database with celestial signs and astronomical data.
    WARNING: This endpoint should be protected or removed in production!
    """
    try:
        # Run database population script
        result = subprocess.run(
            ["python", "populate_database.py"],
            capture_output=True,
            text=True,
            cwd="/app"  # Railway container working directory
        )

        return {
            "status": "success" if result.returncode == 0 else "error",
            "return_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/check-tables")
async def check_tables():
    """
    Check if database tables exist.
    """
    try:
        from app.db.session import SessionLocal
        from sqlalchemy import inspect
        
        # Use a session to get the engine
        db = SessionLocal()
        try:
            inspector = inspect(db.bind)
            tables = inspector.get_table_names()
            
            return {
                "status": "success",
                "table_count": len(tables),
                "tables": sorted(tables),
            }
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch-latest-data")
async def fetch_latest_data(db: Session = Depends(get_db)) -> Dict:
    """
    Manually trigger data fetch from USGS and NASA APIs.
    Railway-safe: No background tasks, synchronous execution.
    
    Returns:
        Summary of fetched data with counts and sample entries
    """
    try:
        results = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "earthquakes": {"fetched": 0, "new": 0, "updated": 0, "sample": []},
            "status": "success"
        }
        
        # Fetch USGS earthquakes (M4.5+ from last 30 days)
        usgs_client = USGSEarthquakeClient()
        earthquakes = usgs_client.get_recent_earthquakes(min_magnitude=4.5, days_back=30)
        
        results["earthquakes"]["fetched"] = len(earthquakes)
        
        # Save to database (upsert logic)
        for eq in earthquakes[:50]:  # Limit to 50 to avoid timeout
            # Extract event_id from URL or use magnitude+time combo
            event_id = eq.get('url', '').split('/')[-1] if eq.get('url') else None
            if not event_id:
                # Create pseudo-ID from magnitude, lat, lon, time
                event_id = f"eq_{eq['magnitude']}_{eq['latitude']}_{eq['longitude']}_{eq['time']}"
            
            # Check if exists
            existing = db.query(Earthquakes).filter(Earthquakes.event_id == event_id).first()
            
            if not existing:
                # Create new record
                earthquake = Earthquakes(
                    event_id=event_id,
                    event_time=datetime.fromisoformat(eq['time'].replace('Z', '+00:00')) if eq.get('time') else None,
                    magnitude=eq.get('magnitude'),
                    magnitude_type='mw',  # Default
                    latitude=eq.get('latitude'),
                    longitude=eq.get('longitude'),
                    depth_km=eq.get('depth'),
                    region=eq.get('place', 'Unknown'),
                    data_source='USGS'
                )
                db.add(earthquake)
                results["earthquakes"]["new"] += 1
                
                # Add first 3 as samples
                if len(results["earthquakes"]["sample"]) < 3:
                    results["earthquakes"]["sample"].append({
                        "event_id": event_id,
                        "magnitude": eq.get('magnitude'),
                        "region": eq.get('place'),
                        "time": eq.get('time')
                    })
        
        db.commit()
        
        return results
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Data fetch failed: {str(e)}"
        )
        return {
            "status": "error",
            "error": str(e),
            "table_count": 0,
            "tables": []
        }
