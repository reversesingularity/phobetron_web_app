"""
Astronomical events endpoints (eclipses, celestial events).
"""
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Query, HTTPException
from app.integrations.eclipse_calculator import EclipseCalculator, get_lunar_eclipses, get_solar_eclipses

router = APIRouter()


@router.get("/events", tags=["astronomical"])
def get_astronomical_events(
    start_year: int = Query(..., description="Start year (e.g., 2024)", ge=1900, le=2100),
    end_year: int = Query(..., description="End year (e.g., 2025)", ge=1900, le=2100),
    event_type: Optional[str] = Query(None, description="Filter by type: lunar, solar, all"),
):
    """
    Retrieve astronomical events (eclipses) with Jerusalem visibility.
    
    Calculates solar and lunar eclipses for the given date range,
    including visibility from Jerusalem (31.7683°N, 35.2137°E).
    
    **Eclipse Types:**
    - `lunar`: Lunar eclipses (including blood moons)
    - `solar`: Solar eclipses
    - `all` or null: Both lunar and solar eclipses
    
    **Example:**
    ```
    GET /api/v1/astronomical/events?start_year=2024&end_year=2025
    GET /api/v1/astronomical/events?start_year=2024&end_year=2025&event_type=lunar
    ```
    
    **Returns:**
    - List of eclipse events with dates, types, and Jerusalem visibility
    - Blood moon indicators for total lunar eclipses
    """
    if start_year > end_year:
        raise HTTPException(status_code=400, detail="start_year must be <= end_year")
    
    if end_year - start_year > 20:
        raise HTTPException(status_code=400, detail="Date range cannot exceed 20 years")
    
    try:
        calc = EclipseCalculator()
        
        if event_type == "lunar":
            events = calc.find_lunar_eclipses(
                datetime(start_year, 1, 1),
                datetime(end_year, 12, 31)
            )
        elif event_type == "solar":
            events = calc.find_solar_eclipses(
                datetime(start_year, 1, 1),
                datetime(end_year, 12, 31)
            )
        else:  # all or None
            events = calc.find_all_eclipses(
                datetime(start_year, 1, 1),
                datetime(end_year, 12, 31)
            )
        
        # Format response
        formatted_events = []
        for event in events:
            formatted_events.append({
                "date": event["date"].isoformat(),
                "type": event["type"],
                "eclipse_type": event["eclipse_type"],
                "is_blood_moon": event["is_blood_moon"],
                "visible_from_jerusalem": event["visible_from_jerusalem"],
                "location": {
                    "name": "Jerusalem",
                    "latitude": event["latitude"],
                    "longitude": event["longitude"]
                }
            })
        
        return {
            "total": len(formatted_events),
            "start_year": start_year,
            "end_year": end_year,
            "event_type": event_type or "all",
            "data": formatted_events
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating eclipses: {str(e)}")


@router.get("/blood-moon-tetrads", tags=["astronomical"])
def get_blood_moon_tetrads(
    start_year: int = Query(2010, description="Start year", ge=1900, le=2100),
    end_year: int = Query(2030, description="End year", ge=1900, le=2100),
):
    """
    Find Blood Moon Tetrads (4 consecutive total lunar eclipses).
    
    A tetrad is prophetically significant when:
    - 4 total lunar eclipses occur in succession
    - Spaced roughly 6 months apart (lunar cycle pattern)
    - Often aligned with Jewish feast days
    
    **Famous Tetrads:**
    - 2014-2015: All 4 fell on Passover/Tabernacles
    - 1967-1968: During Six-Day War
    - 1949-1950: Israel's founding
    
    **Example:**
    ```
    GET /api/v1/astronomical/blood-moon-tetrads?start_year=2010&end_year=2020
    ```
    """
    if start_year > end_year:
        raise HTTPException(status_code=400, detail="start_year must be <= end_year")
    
    try:
        calc = EclipseCalculator()
        tetrads = calc.find_blood_moon_tetrads(
            datetime(start_year, 1, 1),
            datetime(end_year, 12, 31)
        )
        
        formatted_tetrads = []
        for tetrad in tetrads:
            formatted_tetrads.append({
                "start_date": tetrad["start_date"].isoformat(),
                "end_date": tetrad["end_date"].isoformat(),
                "count": tetrad["count"],
                "jerusalem_visible_count": tetrad["jerusalem_visible_count"],
                "eclipses": [
                    {
                        "date": e["date"].isoformat(),
                        "visible_from_jerusalem": e["visible_from_jerusalem"]
                    }
                    for e in tetrad["eclipses"]
                ]
            })
        
        return {
            "total": len(formatted_tetrads),
            "start_year": start_year,
            "end_year": end_year,
            "data": formatted_tetrads
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding tetrads: {str(e)}")
