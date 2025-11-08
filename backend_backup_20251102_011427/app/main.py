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
