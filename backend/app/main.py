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
from contextlib import asynccontextmanager

from app.db.session import get_db, get_engine
from app.api.v1.api import api_router
from app.api.routes.ml_routes import router as ml_router
from app.api.routes.ml import router as ml_enhanced_router  # Enhanced ML routes
from app.api.routes.data_sources import router as data_sources_router  # ESA/NASA fallback routes
from app.api.v1.ml_predictions import router as ml_predictions_router  # Production ML predictions
from app.api.routes.verification import router as verification_router  # Database verification endpoints
from app.api.routes.admin import router as admin_router  # Admin/migration endpoints
from app.api.routes.admin_populate import router as admin_populate_router  # Temporary: Populate feast days
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events - startup and shutdown"""
    # Startup
    import sys
    sys.stdout.flush()
    print("=" * 60, flush=True)
    print("Starting Phobetron API...", flush=True)
    print(f"Version: {settings.VERSION}", flush=True)
    print(f"Pool config: size=20, max_overflow=40, timeout=60s", flush=True)
    print(f"CORS Origins: {settings.BACKEND_CORS_ORIGINS}", flush=True)
    print("=" * 60, flush=True)
    
    # Load ML models
    print("Loading ML models...", flush=True)
    try:
        from app.ml.model_loader import model_loader
        model_loader.load_all_models()
        print("SUCCESS: ML models loaded successfully", flush=True)
    except Exception as e:
        print(f"WARNING: ML model loading failed: {e}", flush=True)
        print("API will continue with limited ML functionality", flush=True)
    
    print("Application startup complete!", flush=True)
    print("Database connection will be established on first request", flush=True)
    sys.stdout.flush()
    yield
    # Shutdown
    print("Shutting down Phobetron API...", flush=True)


# Create FastAPI application with lifespan
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for tracking celestial signs and correlating them with astronomical and geophysical events",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
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
app.include_router(admin_router, prefix=f"{settings.API_V1_STR}/admin")  # Admin and migration endpoints
app.include_router(admin_populate_router, prefix=f"{settings.API_V1_STR}")  # Temporary: Admin populate endpoint


@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint - simple status without database dependency.
    
    Returns:
        dict: Health status
    """
    try:
        return {
            "status": "healthy",
            "version": settings.VERSION,
            "service": "phobetron-api",
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
        }


@app.get("/test", tags=["health"])
async def test_endpoint():
    """
    Simple test endpoint to verify API is responding.
    """
    return {
        "message": "API is working!",
        "timestamp": "2025-11-12T00:00:00Z",
        "cors_origins": settings.BACKEND_CORS_ORIGINS,
    }


@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint with API information.
    
    Returns:
        dict: Welcome message and API documentation link
    """
    try:
        return {
            "message": "Celestial Signs API",
            "version": settings.VERSION,
            "docs": "/docs",
            "health": "/health",
            "status": "running",
        }
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
