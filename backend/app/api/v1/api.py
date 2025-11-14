"""
API v1 router aggregation.

Combines all API endpoint routers into a single router for the application.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import scientific, events, theological, alerts, correlations, astronomical

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    scientific.router,
    prefix="/scientific",
    tags=["scientific"],
)

api_router.include_router(
    events.router,
    prefix="/events",
    tags=["events"],
)

api_router.include_router(
    theological.router,
    prefix="/theological",
    tags=["theological"],
)

api_router.include_router(
    astronomical.router,
    prefix="/astronomical",
    tags=["astronomical"],
)

api_router.include_router(
    alerts.router,
    prefix="/alerts",
    tags=["alerts"],
)

api_router.include_router(
    correlations.router,
    prefix="/correlations",
    tags=["correlations"],
)
