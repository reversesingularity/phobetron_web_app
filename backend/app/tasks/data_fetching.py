"""
Real-Time Data Fetching Service
Implements automated USGS/NASA data pipeline with Celery
"""

from celery import Celery
from celery.schedules import crontab
import httpx
import asyncio
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.events import Earthquake, CelestialEvent, SolarEvent, NEOObject
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)

# Celery configuration
celery_app = Celery(
    "phobetron_tasks",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


# ============================================================================
# TASK 1: Fetch USGS Earthquakes (Daily)
# ============================================================================

@celery_app.task(name="fetch_usgs_earthquakes")
def fetch_usgs_earthquakes():
    """
    Fetch M4.0+ earthquakes from last 24 hours
    Runs daily at midnight UTC
    """
    asyncio.run(_fetch_usgs_earthquakes_async())


async def _fetch_usgs_earthquakes_async():
    """Async implementation of USGS fetching"""
    
    # USGS API endpoint
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    
    # Get earthquakes from last 24 hours, M4.0+
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=1)
    
    params = {
        "format": "geojson",
        "starttime": start_time.isoformat(),
        "endtime": end_time.isoformat(),
        "minmagnitude": 4.0,
        "orderby": "time-asc"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        
        earthquakes_added = 0
        
        async for db in get_db():
            for feature in data.get("features", []):
                props = feature["properties"]
                coords = feature["geometry"]["coordinates"]
                
                # Check if earthquake already exists
                usgs_id = feature["id"]
                existing = await db.execute(
                    select(Earthquake).where(Earthquake.usgs_id == usgs_id)
                )
                if existing.scalar_one_or_none():
                    continue  # Skip duplicates
                
                # Create new earthquake record
                earthquake = Earthquake(
                    usgs_id=usgs_id,
                    magnitude=props["mag"],
                    location=props["place"],
                    latitude=coords[1],
                    longitude=coords[0],
                    depth_km=coords[2],
                    timestamp=datetime.fromtimestamp(props["time"] / 1000),
                    url=props.get("url"),
                    felt_reports=props.get("felt", 0),
                    significance=props.get("sig", 0)
                )
                
                db.add(earthquake)
                earthquakes_added += 1
            
            await db.commit()
        
        logger.info(f"✅ Fetched {earthquakes_added} new earthquakes from USGS")
        return {"status": "success", "count": earthquakes_added}
        
    except Exception as e:
        logger.error(f"❌ USGS fetch failed: {str(e)}")
        return {"status": "error", "message": str(e)}


# ============================================================================
# TASK 2: Fetch NASA NEO Data (Weekly)
# ============================================================================

@celery_app.task(name="fetch_nasa_neos")
def fetch_nasa_neos():
    """
    Fetch upcoming NEO close approaches from NASA
    Runs weekly on Sundays at 6 AM UTC
    """
    asyncio.run(_fetch_nasa_neos_async())


async def _fetch_nasa_neos_async():
    """Async implementation of NASA NEO fetching"""
    
    NASA_API_KEY = "DEMO_KEY"  # Replace with actual key from .env
    url = "https://api.nasa.gov/neo/rest/v1/feed"
    
    # Get next 7 days
    start_date = datetime.utcnow().date()
    end_date = start_date + timedelta(days=7)
    
    params = {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "api_key": NASA_API_KEY
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        
        neos_added = 0
        
        async for db in get_db():
            for date_str, neos in data.get("near_earth_objects", {}).items():
                for neo in neos:
                    # Check if NEO already exists
                    neo_id = neo["id"]
                    existing = await db.execute(
                        select(NEOObject).where(NEOObject.nasa_id == neo_id)
                    )
                    if existing.scalar_one_or_none():
                        continue
                    
                    # Get closest approach data
                    approach = neo["close_approach_data"][0]
                    
                    # Create NEO record
                    neo_obj = NEOObject(
                        nasa_id=neo_id,
                        name=neo["name"],
                        designation=neo.get("designation"),
                        diameter_km_min=neo["estimated_diameter"]["kilometers"]["estimated_diameter_min"],
                        diameter_km_max=neo["estimated_diameter"]["kilometers"]["estimated_diameter_max"],
                        is_potentially_hazardous=neo["is_potentially_hazardous_asteroid"],
                        close_approach_date=datetime.fromisoformat(approach["close_approach_date_full"].replace("Z", "+00:00")),
                        miss_distance_km=float(approach["miss_distance"]["kilometers"]),
                        relative_velocity_km_s=float(approach["relative_velocity"]["kilometers_per_second"]),
                        orbiting_body=approach["orbiting_body"]
                    )
                    
                    db.add(neo_obj)
                    neos_added += 1
            
            await db.commit()
        
        logger.info(f"✅ Fetched {neos_added} new NEOs from NASA")
        return {"status": "success", "count": neos_added}
        
    except Exception as e:
        logger.error(f"❌ NASA NEO fetch failed: {str(e)}")
        return {"status": "error", "message": str(e)}


# ============================================================================
# TASK 3: Calculate Correlations (Hourly)
# ============================================================================

@celery_app.task(name="calculate_correlations")
def calculate_correlations():
    """
    Calculate correlations between celestial events and earthquakes
    Runs every hour
    """
    asyncio.run(_calculate_correlations_async())


async def _calculate_correlations_async():
    """Calculate celestial-seismic correlations"""
    
    from app.ml.seismos_correlations import calculate_event_correlation
    
    # Get earthquakes from last 7 days
    cutoff_date = datetime.utcnow() - timedelta(days=7)
    
    correlations_found = 0
    
    async for db in get_db():
        # Get recent earthquakes
        earthquakes = await db.execute(
            select(Earthquake).where(Earthquake.timestamp >= cutoff_date)
        )
        earthquakes = earthquakes.scalars().all()
        
        # Get recent celestial events
        celestial = await db.execute(
            select(CelestialEvent).where(CelestialEvent.event_date >= cutoff_date)
        )
        celestial = celestial.scalars().all()
        
        # Calculate correlations
        for eq in earthquakes:
            for cel in celestial:
                # Check if events are within 7 days
                time_diff = abs((eq.timestamp - cel.event_date).days)
                if time_diff <= 7:
                    # Calculate correlation score
                    correlation = calculate_event_correlation(eq, cel)
                    
                    if correlation["score"] >= 0.7:  # High confidence
                        # Store correlation
                        from app.models.correlations import Correlation
                        corr = Correlation(
                            earthquake_id=eq.id,
                            celestial_event_id=cel.id,
                            correlation_score=correlation["score"],
                            time_difference_hours=time_diff * 24,
                            confidence_level="HIGH"
                        )
                        db.add(corr)
                        correlations_found += 1
        
        await db.commit()
    
    logger.info(f"✅ Found {correlations_found} new correlations")
    return {"status": "success", "count": correlations_found}


# ============================================================================
# CELERY BEAT SCHEDULE
# ============================================================================

celery_app.conf.beat_schedule = {
    # Fetch USGS earthquakes daily at midnight UTC
    "fetch-usgs-earthquakes": {
        "task": "fetch_usgs_earthquakes",
        "schedule": crontab(hour=0, minute=0)
    },
    
    # Fetch NASA NEOs weekly on Sunday at 6 AM UTC
    "fetch-nasa-neos": {
        "task": "fetch_nasa_neos", 
        "schedule": crontab(day_of_week=0, hour=6, minute=0)
    },
    
    # Calculate correlations every hour
    "calculate-correlations": {
        "task": "calculate_correlations",
        "schedule": crontab(minute=0)  # Every hour on the hour
    }
}


if __name__ == "__main__":
    # For testing individual tasks
    print("Testing USGS earthquake fetch...")
    fetch_usgs_earthquakes()
    
    print("\nTesting NASA NEO fetch...")
    fetch_nasa_neos()
    
    print("\nTesting correlation calculation...")
    calculate_correlations()
