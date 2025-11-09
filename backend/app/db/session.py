"""Database session factory and engine configuration."""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Create SQLAlchemy engine lazily with Railway-compatible connection
_engine = None

def get_engine():
    """Get or create SQLAlchemy engine with Railway-compatible DATABASE_URL"""
    global _engine
    if _engine is None:
        # Get DATABASE_URL with correct dialect (postgresql+psycopg2://)
        database_url = settings.DATABASE_URL
        _engine = create_engine(
            database_url,
            pool_pre_ping=True,  # Verify connections before using
            pool_recycle=300,    # Recycle connections after 5 minutes
            echo=False
        )
    return _engine

# For backward compatibility
engine = get_engine()

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session for FastAPI.
    
    Yields:
        Session: SQLAlchemy database session
        
    Example:
        ```python
        from fastapi import Depends
        from app.db.session import get_db
        
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
        ```
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
