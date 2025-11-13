"""Pytest configuration and fixtures."""

import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db.base import Base
from app.main import app
from app.db.session import get_db


@pytest.fixture(scope="session")
def test_database_url():
    """
    Test database URL.
    
    Returns the test database URL from environment or uses default.
    Using postgresql+psycopg:// for psycopg3 driver.
    """
    return os.getenv(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://celestial_app:celestial2025@localhost:5432/celestial_signs_test"
    )


@pytest.fixture(scope="session")
def engine(test_database_url):
    """
    Create test database engine.
    
    Creates a SQLAlchemy engine for testing.
    """
    return create_engine(test_database_url, echo=False)


@pytest.fixture(scope="function")
def tables(engine):
    """
    Create all tables before each test and drop after.
    
    Ensures a clean database state for each test.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(engine, tables):
    """
    Create a new database session for a test.
    
    Returns a SQLAlchemy session that automatically rolls back
    after the test completes.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a FastAPI TestClient with test database session.
    
    Overrides the get_db dependency to use the test database session.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()
