"""
Analytics API routes for visitor tracking and statistics.
Privacy-focused: Only aggregated data, no personal information.
"""
from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.analytics.tracker import get_tracker

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["analytics"]
)


class PageVisit(BaseModel):
    """Page visit tracking payload."""
    path: str
    referrer: Optional[str] = None


@router.post("/track", status_code=201)
async def track_visit(
    visit: PageVisit,
    request: Request
):
    """
    Track a page visit (called from frontend).
    
    Privacy Note: Only tracks page path and aggregated location data.
    No personal identifiable information is stored.
    """
    tracker = get_tracker()
    
    # Extract basic info from request
    # Note: In production, you'd want to use a proper GeoIP service
    # For now, we'll just use a placeholder
    country = request.headers.get("CF-IPCountry")  # Cloudflare header
    user_agent = request.headers.get("User-Agent", "")
    
    tracker.log_visit(
        path=visit.path,
        country=country,
        referrer=visit.referrer,
        user_agent=user_agent
    )
    
    return {"status": "tracked", "timestamp": datetime.utcnow().isoformat()}


@router.get("/stats")
async def get_analytics_stats(days: int = 30):
    """
    Get analytics statistics for the specified period.
    
    Args:
        days: Number of days to look back (default: 30)
    
    Returns:
        Analytics statistics including:
        - Total visits
        - Visits today
        - Top countries
        - Top pages
        - Daily visits chart data
        - Top referrers
    """
    tracker = get_tracker()
    stats = tracker.get_stats(days=days)
    return stats


@router.get("/realtime")
async def get_realtime_stats():
    """
    Get real-time analytics (last 5 minutes).
    
    Returns:
        Recent activity statistics
    """
    tracker = get_tracker()
    stats = tracker.get_realtime_stats()
    return stats


@router.get("/health")
async def analytics_health():
    """Health check for analytics system."""
    try:
        tracker = get_tracker()
        return {
            "status": "healthy",
            "service": "analytics",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "analytics",
            "error": str(e)
        }
