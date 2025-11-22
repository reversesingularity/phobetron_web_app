"""
AI Canvas Updates API Router
============================

API endpoints for AI-powered canvas updates:
- GET /api/v1/ml/canvas/updates - Get real-time canvas updates
- POST /api/v1/ml/canvas/apply-update - Apply a specific update
- GET /api/v1/ml/canvas/alerts - Get active alerts
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio

from app.ml.ai_canvas_updates import AICanvasUpdateService, CanvasUpdate

router = APIRouter(prefix="/ml/canvas", tags=["AI Canvas Updates"])

# Global service instance
canvas_service = AICanvasUpdateService()

# Initialize service on startup
# @router.on_event("startup")  # Deprecated - using lifespan instead
# async def startup_event():
#     await canvas_service.initialize_ai_models()

# Request/Response Models
class CanvasUpdateRequest(BaseModel):
    """Request for canvas updates"""
    current_time: datetime
    include_historical: bool = False
    max_updates: Optional[int] = 50

class CanvasUpdateResponse(BaseModel):
    """Response with canvas updates"""
    updates: List[Dict[str, Any]]
    total_count: int
    timestamp: datetime
    alerts_count: int

class ApplyUpdateRequest(BaseModel):
    """Request to apply a specific update"""
    update_id: str
    confirmed: bool = True

@router.get("/updates", response_model=CanvasUpdateResponse)
async def get_canvas_updates(
    current_time: str = Query(..., description="Current simulation time (ISO format)"),
    include_historical: bool = Query(False, description="Include historical updates"),
    max_updates: Optional[int] = Query(50, description="Maximum number of updates to return")
):
    """
    Get real-time canvas updates for AI-powered visualization.

    Returns updates for:
    - NEO (Near-Earth Object) tracking
    - Interstellar object trajectories
    - Solar flare activity
    - Planetary conjunctions
    - AI-detected anomalies
    """
    try:
        # Parse current time
        current_datetime = datetime.fromisoformat(current_time.replace('Z', '+00:00'))

        # Get updates from AI service
        updates = await canvas_service.get_canvas_updates(current_datetime)

        # Filter and limit updates
        if not include_historical:
            # Only include recent updates (last 24 hours)
            cutoff_time = current_datetime - asyncio.timedelta(hours=24)
            updates = [u for u in updates if u.timestamp >= cutoff_time]

        if max_updates:
            updates = updates[:max_updates]

        # Convert to response format
        update_dicts = []
        for update in updates:
            update_dict = {
                "update_type": update.update_type,
                "object_id": update.object_id,
                "position": update.position,
                "velocity": update.velocity,
                "metadata": update.metadata,
                "priority": update.priority,
                "timestamp": update.timestamp.isoformat()
            }
            update_dicts.append(update_dict)

        return CanvasUpdateResponse(
            updates=update_dicts,
            total_count=len(update_dicts),
            timestamp=datetime.now(),
            alerts_count=len([u for u in updates if u.priority >= 3])
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get canvas updates: {str(e)}")

@router.post("/apply-update")
async def apply_canvas_update(request: ApplyUpdateRequest):
    """
    Apply a specific canvas update (confirm or acknowledge).
    """
    try:
        # In a real implementation, this would update the canvas state
        # For now, just acknowledge the update
        return {
            "message": f"Update {request.update_id} {'applied' if request.confirmed else 'acknowledged'}",
            "update_id": request.update_id,
            "confirmed": request.confirmed,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply update: {str(e)}")

@router.get("/alerts")
async def get_active_alerts():
    """
    Get currently active alerts and high-priority updates.
    """
    try:
        # Get active alerts from service
        alerts = canvas_service.active_alerts

        alert_list = []
        for alert_id, update in alerts.items():
            alert_list.append({
                "alert_id": alert_id,
                "update_type": update.update_type,
                "object_id": update.object_id,
                "priority": update.priority,
                "metadata": update.metadata,
                "timestamp": update.timestamp.isoformat()
            })

        return {
            "alerts": alert_list,
            "count": len(alert_list),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")

@router.get("/neo-tracking")
async def get_neo_tracking_data():
    """
    Get detailed NEO tracking information for visualization.
    """
    try:
        # Get NEO-specific updates
        current_time = datetime.now()
        all_updates = await canvas_service.get_canvas_updates(current_time)
        neo_updates = [u for u in all_updates if u.update_type == "neo"]

        neo_data = []
        for update in neo_updates:
            neo_data.append({
                "id": update.object_id,
                "name": update.metadata.get("name", "Unknown"),
                "position": update.position,
                "magnitude": update.metadata.get("magnitude"),
                "diameter": update.metadata.get("diameter"),
                "hazardous": update.metadata.get("hazardous", False),
                "close_approach": update.metadata.get("close_approach"),
                "priority": update.priority
            })

        return {
            "neo_objects": neo_data,
            "count": len(neo_data),
            "timestamp": current_time.isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get NEO data: {str(e)}")

@router.get("/interstellar-objects")
async def get_interstellar_objects():
    """
    Get interstellar object tracking data.
    """
    try:
        current_time = datetime.now()
        all_updates = await canvas_service.get_canvas_updates(current_time)
        interstellar_updates = [u for u in all_updates if u.update_type == "interstellar"]

        interstellar_data = []
        for update in interstellar_updates:
            interstellar_data.append({
                "id": update.object_id,
                "name": update.metadata.get("name", "Unknown"),
                "position": update.position,
                "discovery_date": update.metadata.get("discovery_date"),
                "trajectory": update.metadata.get("trajectory"),
                "first_interstellar": update.metadata.get("first_interstellar", False),
                "priority": update.priority
            })

        return {
            "interstellar_objects": interstellar_data,
            "count": len(interstellar_data),
            "timestamp": current_time.isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get interstellar data: {str(e)}")

@router.get("/solar-activity")
async def get_solar_activity():
    """
    Get solar activity and flare data.
    """
    try:
        current_time = datetime.now()
        all_updates = await canvas_service.get_canvas_updates(current_time)
        solar_updates = [u for u in all_updates if u.update_type == "solar_flare"]

        solar_data = []
        for update in solar_updates:
            solar_data.append({
                "flare_id": update.object_id,
                "classification": update.metadata.get("classification"),
                "intensity": update.metadata.get("intensity"),
                "begin_time": update.metadata.get("begin_time"),
                "peak_time": update.metadata.get("peak_time"),
                "end_time": update.metadata.get("end_time"),
                "source_location": update.metadata.get("source_location"),
                "active_region": update.metadata.get("active_region"),
                "priority": update.priority
            })

        return {
            "solar_flares": solar_data,
            "count": len(solar_data),
            "timestamp": current_time.isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get solar activity: {str(e)}")

@router.get("/planetary-conjunctions")
async def get_planetary_conjunctions():
    """
    Get planetary conjunction data.
    """
    try:
        current_time = datetime.now()
        all_updates = await canvas_service.get_canvas_updates(current_time)
        conjunction_updates = [u for u in all_updates if u.update_type == "conjunction"]

        conjunction_data = []
        for update in conjunction_updates:
            conjunction_data.append({
                "conjunction_id": update.object_id,
                "planets": update.metadata.get("planets", []),
                "separation": update.metadata.get("separation"),
                "visibility": update.metadata.get("visibility"),
                "significance": update.metadata.get("significance"),
                "timestamp": update.metadata.get("timestamp"),
                "priority": update.priority
            })

        return {
            "conjunctions": conjunction_data,
            "count": len(conjunction_data),
            "timestamp": current_time.isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conjunction data: {str(e)}")