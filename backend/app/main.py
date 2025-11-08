"""
FastAPI application entry point for Celestial Signs API.

This module sets up the FastAPI application with:
- CORS middleware
- Database session management
- API routers
- Health check endpoint
- OpenAPI documentation
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.api.v1.api import api_router
from app.api.routes.ml_routes import router as ml_router
from app.api.routes.ml import router as ml_enhanced_router  # Enhanced ML routes
from app.api.routes.data_sources import router as data_sources_router  # ESA/NASA fallback routes
from app.api.v1.ml_predictions import router as ml_predictions_router  # Production ML predictions
from app.api.routes.verification import router as verification_router  # Database verification endpoints
from app.core.config import settings

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for tracking celestial signs and correlating them with astronomical and geophysical events",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ml_router)  # ML/AI routes (legacy)
app.include_router(ml_enhanced_router)  # Enhanced ML/AI routes (new)
app.include_router(data_sources_router)  # Data sources with ESA/NASA fallback
app.include_router(ml_predictions_router)  # Production ML predictions
app.include_router(verification_router)  # Database verification and testing


@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Health status
    """
    return {
        "status": "ok",
        "version": settings.VERSION,
    }


@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint with API information.
    
    Returns:
        dict: Welcome message and API documentation link
    """
    return {
        "message": "Celestial Signs API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
