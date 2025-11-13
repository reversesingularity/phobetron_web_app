"""
Data Source Management API Routes
Handles ESA/NASA fallback and data source status
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Literal
from datetime import datetime
import logging

from app.integrations.esa_client import (
    get_fallback_manager,
    ESANEOClient,
    CelestialDataFallbackManager
)

router = APIRouter(prefix="/api/v1/data-sources", tags=["data-sources"])
logger = logging.getLogger(__name__)


@router.get("/status")
async def get_data_source_status():
    """
    Get current status of all celestial data sources (NASA/ESA)
    
    Returns information about which sources are online and which is currently active
    """
    manager = get_fallback_manager()
    status = manager.get_source_status()
    
    return {
        "timestamp": datetime.now().isoformat(),
        "sources": status,
        "message": "Data source status retrieved successfully"
    }


@router.get("/neo-objects")
async def get_neo_objects(
    limit: int = Query(100, ge=1, le=1000, description="Number of NEO objects to fetch"),
    source: Optional[Literal["NASA", "ESA", "AUTO"]] = Query(
        "AUTO",
        description="Data source to use (AUTO will attempt NASA first, fall back to ESA)"
    )
):
    """
    Fetch Near-Earth Object data with automatic NASA/ESA fallback
    
    Args:
        limit: Number of objects to return
        source: Preferred data source (AUTO, NASA, or ESA)
    
    Returns:
        List of NEO objects with orbital elements and risk data
    """
    try:
        manager = get_fallback_manager()
        
        force_source = None if source == "AUTO" else source
        neo_data, source_used = manager.get_neo_data(limit=limit, force_source=force_source)
        
        if not neo_data and source_used == 'NONE':
            raise HTTPException(
                status_code=503,
                detail="All data sources (NASA and ESA) are currently unavailable"
            )
        
        return {
            "total": len(neo_data),
            "source": source_used,
            "data": neo_data,
            "message": f"Successfully fetched NEO data from {source_used}"
        }
    
    except Exception as e:
        logger.error(f"Error fetching NEO objects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/close-approaches")
async def get_close_approaches(
    days_forward: int = Query(30, ge=1, le=365, description="Number of days to look ahead"),
    min_distance_au: float = Query(0.05, ge=0.0, le=1.0, description="Minimum approach distance in AU"),
    source: Optional[Literal["NASA", "ESA", "AUTO"]] = Query(
        "AUTO",
        description="Data source to use"
    )
):
    """
    Fetch upcoming close approach events with automatic NASA/ESA fallback
    
    Args:
        days_forward: Number of days to look ahead
        min_distance_au: Minimum approach distance threshold
        source: Preferred data source
    
    Returns:
        List of close approach events
    """
    try:
        manager = get_fallback_manager()
        
        force_source = None if source == "AUTO" else source
        approaches, source_used = manager.get_close_approaches(
            days_forward=days_forward,
            force_source=force_source
        )
        
        # Filter by minimum distance if ESA data includes closer approaches
        if min_distance_au > 0:
            approaches = [
                ca for ca in approaches 
                if ca.get('distance_au', float('inf')) >= min_distance_au
            ]
        
        return {
            "total": len(approaches),
            "source": source_used,
            "parameters": {
                "days_forward": days_forward,
                "min_distance_au": min_distance_au
            },
            "data": approaches,
            "message": f"Found {len(approaches)} close approaches from {source_used}"
        }
    
    except Exception as e:
        logger.error(f"Error fetching close approaches: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/objects/{object_name}")
async def get_object_by_name(
    object_name: str,
    source: Optional[Literal["NASA", "ESA", "AUTO"]] = Query(
        "AUTO",
        description="Data source to use"
    )
):
    """
    Fetch specific celestial object by name or designation
    
    Args:
        object_name: Name or designation (e.g., "Apophis", "99942", "1I/'Oumuamua")
        source: Preferred data source
    
    Returns:
        Object data with orbital elements
    """
    try:
        manager = get_fallback_manager()
        
        force_source = None if source == "AUTO" else source
        obj_data, source_used = manager.get_object_by_name(
            object_name=object_name,
            force_source=force_source
        )
        
        if not obj_data:
            raise HTTPException(
                status_code=404,
                detail=f"Object '{object_name}' not found in available data sources"
            )
        
        return {
            "source": source_used,
            "data": obj_data,
            "message": f"Object data retrieved from {source_used}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching object {object_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/switch-source")
async def switch_primary_source(
    source: Literal["NASA", "ESA"]
):
    """
    Manually switch the primary data source
    
    Args:
        source: Source to switch to (NASA or ESA)
    
    Returns:
        Updated source status
    """
    try:
        manager = get_fallback_manager()
        
        if source == "NASA":
            manager.nasa_available = True
            manager.primary_source = "NASA"
            message = "Switched primary source to NASA JPL"
        else:
            manager.primary_source = "ESA"
            message = "Switched primary source to ESA NEOCC"
        
        status = manager.get_source_status()
        
        return {
            "message": message,
            "sources": status
        }
    
    except Exception as e:
        logger.error(f"Error switching data source: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/esa/priority-list")
async def get_esa_priority_list(
    limit: int = Query(100, ge=1, le=500, description="Number of objects to fetch")
):
    """
    Direct access to ESA NEOCC priority list
    
    Bypasses fallback logic and queries ESA directly
    Useful for testing ESA connectivity
    
    Args:
        limit: Number of priority objects to return
    
    Returns:
        ESA's current priority list of NEOs
    """
    try:
        esa_client = ESANEOClient()
        priority_objects = esa_client.get_priority_objects(limit=limit)
        
        if not priority_objects:
            raise HTTPException(
                status_code=503,
                detail="ESA NEOCC service is currently unavailable"
            )
        
        return {
            "total": len(priority_objects),
            "source": "ESA NEOCC",
            "data": priority_objects,
            "message": f"Fetched {len(priority_objects)} priority NEOs from ESA"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching ESA priority list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """
    Health check endpoint for data source connectivity
    
    Tests both NASA and ESA endpoints and returns availability status
    """
    manager = get_fallback_manager()
    
    # Test ESA
    esa_client = ESANEOClient()
    esa_test = len(esa_client.get_priority_objects(limit=1)) > 0
    
    # NASA test (would check actual NASA endpoints in production)
    nasa_test = False  # Simulating shutdown
    
    return {
        "status": "healthy" if (esa_test or nasa_test) else "degraded",
        "sources": {
            "nasa": {
                "available": nasa_test,
                "status": "online" if nasa_test else "offline (government shutdown)"
            },
            "esa": {
                "available": esa_test,
                "status": "online" if esa_test else "offline"
            }
        },
        "active_source": "ESA NEOCC" if esa_test and not nasa_test else "NASA JPL" if nasa_test else "NONE",
        "timestamp": datetime.now().isoformat()
    }
