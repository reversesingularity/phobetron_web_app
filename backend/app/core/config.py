"""
Application configuration settings.

Loads configuration from environment variables with sensible defaults.
"""
import os
import json
from typing import List, Optional
from pydantic import computed_field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Project metadata
    PROJECT_NAME: str = "Celestial Signs API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration - Railway provides DATABASE_URL
    # Default for local development
    DATABASE_URL: str = "postgresql+psycopg2://celestial_app:Hx3$oTc8Ja9^tL2w@localhost:5432/celestial_signs"
    
    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        """
        Get database URL with correct SQLAlchemy 2.0 dialect.
        Railway provides postgresql://, but we need postgresql+psycopg2://
        """
        url = self.DATABASE_URL
        if url.startswith("postgresql://") and not url.startswith("postgresql+"):
            # Convert to SQLAlchemy 2.0 compatible format
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url
    
    # CORS origins - will be loaded from environment or use defaults
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React dev server
        "http://localhost:8000",  # FastAPI dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "https://phobetronwebapp-production.up.railway.app",  # Railway production
        "https://phobetron-web-app.vercel.app",  # Vercel production (if used)
    ]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS origins from environment if available
        cors_env = os.getenv("BACKEND_CORS_ORIGINS")
        if cors_env:
            try:
                self.BACKEND_CORS_ORIGINS = json.loads(cors_env)
            except json.JSONDecodeError:
                # If parsing fails, keep defaults
                pass
    
    # Pagination defaults
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 1000
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"  # Ignore extra environment variables


# Create global settings instance
settings = Settings()
