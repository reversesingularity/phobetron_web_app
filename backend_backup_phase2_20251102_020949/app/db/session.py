"""Database session factory and engine configuration."""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Get database URL from settings
DATABASE_URL = settings.DATABASE_URL

"""Database session factory and engine configuration."""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Get database URL from settings
DATABASE_URL = settings.DATABASE_URL

# Create SQLAlchemy engine lazily
_engine = None

def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            echo=False
        )
    return _engine

# For backward compatibility
engine = get_engine()

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=get_engine()
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
