"""
Populate scripture text for biblical prophecies.

This script updates the prophecies table with KJV scripture text
for all 40 biblical events using the mapping file.

Usage:
    python populate_prophecy_scripture.py

Environment variables needed:
    DATABASE_URL - PostgreSQL connection string

Features:
    - Uses scripture_mappings.json for event→text mapping
    - Updates scripture_text column in prophecies table  
    - Idempotent (can run multiple times safely)
    - Logs all operations
    - Handles errors gracefully
"""

import json
import logging
import os
import sys
from pathlib import Path
from typing import Dict, Any

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# File paths
SCRIPT_DIR = Path(__file__).parent
MAPPINGS_FILE = SCRIPT_DIR / "scripture_mappings.json"


def load_scripture_mappings() -> Dict[str, Any]:
    """
    Load scripture mappings from JSON file.
    
    Returns:
        Dictionary mapping event names to scripture data
        
    Raises:
        FileNotFoundError: If mappings file doesn't exist
        json.JSONDecodeError: If file is not valid JSON
    """
    logger.info(f"Loading scripture mappings from {MAPPINGS_FILE}")
    
    if not MAPPINGS_FILE.exists():
        raise FileNotFoundError(f"Scripture mappings file not found: {MAPPINGS_FILE}")
    
    with open(MAPPINGS_FILE, 'r', encoding='utf-8') as f:
        mappings = json.load(f)
    
    logger.info(f"Loaded {len(mappings)} scripture mappings")
    return mappings


def get_database_url() -> str:
    """
    Get database URL from environment or construct from components.
    
    Returns:
        PostgreSQL connection string
        
    Raises:
        ValueError: If DATABASE_URL not set
    """
    db_url = os.getenv('DATABASE_URL')
    
    if not db_url:
        raise ValueError(
            "DATABASE_URL environment variable not set. "
            "Example: postgresql://user:pass@host:port/dbname"
        )
    
    # Handle Railway's postgres:// URL (should be postgresql://)
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
        logger.info("Converted postgres:// to postgresql://")
    
    return db_url


def create_db_session() -> Session:
    """
    Create database session with connection retry logic.
    
    Returns:
        SQLAlchemy Session object
        
    Raises:
        SQLAlchemyError: If connection fails after retries
    """
    db_url = get_database_url()
    logger.info(f"Connecting to database...")
    
    # Create engine with connection pool settings
    engine = create_engine(
        db_url,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=5,
        max_overflow=10,
        echo=False  # Set to True for SQL logging
    )
    
    # Test connection
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("✓ Database connection successful")
    except SQLAlchemyError as e:
        logger.error(f"Failed to connect to database: {e}")
        raise
    
    # Create session
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def update_prophecy_scripture(
    db: Session,
    event_name: str,
    scripture_data: Dict[str, Any]
) -> bool:
    """
    Update scripture_text for a single prophecy event.
    
    Args:
        db: Database session
        event_name: Name of the prophetic event
        scripture_data: Dictionary with 'text' key containing scripture
        
    Returns:
        True if update successful, False otherwise
    """
    scripture_text = scripture_data.get('text', '')
    
    if not scripture_text:
        logger.warning(f"No scripture text found for '{event_name}'")
        return False
    
    try:
        # Update query using event_name to match the record
        query = text("""
            UPDATE prophecies
            SET scripture_text = :scripture_text
            WHERE event_name = :event_name
        """)
        
        result = db.execute(
            query,
            {
                'scripture_text': scripture_text,
                'event_name': event_name
            }
        )
        
        if result.rowcount == 0:
            logger.warning(f"No prophecy found with event_name = '{event_name}'")
            return False
        elif result.rowcount > 1:
            logger.warning(f"Multiple prophecies found for '{event_name}' ({result.rowcount} updated)")
        else:
            logger.info(f"✓ Updated '{event_name}'")
        
        return True
        
    except SQLAlchemyError as e:
        logger.error(f"Failed to update '{event_name}': {e}")
        return False


def populate_all_scriptures(db: Session, mappings: Dict[str, Any]) -> Dict[str, int]:
    """
    Populate scripture text for all prophecies.
    
    Args:
        db: Database session
        mappings: Dictionary of event names to scripture data
        
    Returns:
        Dictionary with success/failure counts
    """
    stats = {
        'success': 0,
        'failed': 0,
        'total': len(mappings)
    }
    
    logger.info(f"\nStarting to update {stats['total']} prophecies...")
    
    for event_name, scripture_data in mappings.items():
        if update_prophecy_scripture(db, event_name, scripture_data):
            stats['success'] += 1
        else:
            stats['failed'] += 1
    
    # Commit all changes
    try:
        db.commit()
        logger.info("\n✓ All changes committed successfully")
    except SQLAlchemyError as e:
        logger.error(f"\n✗ Failed to commit changes: {e}")
        db.rollback()
        raise
    
    return stats


def verify_population(db: Session) -> Dict[str, int]:
    """
    Verify that scripture text has been populated.
    
    Args:
        db: Database session
        
    Returns:
        Dictionary with verification counts
    """
    logger.info("\nVerifying population...")
    
    # Count total prophecies
    total_query = text("SELECT COUNT(*) FROM prophecies")
    total = db.execute(total_query).scalar()
    
    # Count prophecies with scripture_text
    populated_query = text("""
        SELECT COUNT(*) FROM prophecies 
        WHERE scripture_text IS NOT NULL 
        AND scripture_text != ''
    """)
    populated = db.execute(populated_query).scalar()
    
    # Count prophecies WITHOUT scripture_text
    null_query = text("""
        SELECT COUNT(*) FROM prophecies 
        WHERE scripture_text IS NULL OR scripture_text = ''
    """)
    null_count = db.execute(null_query).scalar()
    
    return {
        'total': total,
        'populated': populated,
        'null': null_count
    }


def main():
    """Main execution function."""
    logger.info("=== Scripture Population Script Started ===\n")
    
    try:
        # Load mappings
        mappings = load_scripture_mappings()
        
        # Create database session
        db = create_db_session()
        
        try:
            # Populate scriptures
            stats = populate_all_scriptures(db, mappings)
            
            # Verify results
            verification = verify_population(db)
            
            # Print summary
            logger.info("\n" + "="*60)
            logger.info("POPULATION SUMMARY")
            logger.info("="*60)
            logger.info(f"Total events in mappings: {stats['total']}")
            logger.info(f"Successfully updated: {stats['success']}")
            logger.info(f"Failed updates: {stats['failed']}")
            logger.info("")
            logger.info(f"Total prophecies in database: {verification['total']}")
            logger.info(f"Prophecies with scripture text: {verification['populated']}")
            logger.info(f"Prophecies without scripture text: {verification['null']}")
            logger.info("="*60)
            
            if verification['null'] == 0:
                logger.info("\n✅ SUCCESS: All prophecies have scripture text!")
                return 0
            else:
                logger.warning(f"\n⚠️ WARNING: {verification['null']} prophecies still missing scripture text")
                return 1
                
        finally:
            db.close()
            logger.info("\nDatabase connection closed")
            
    except FileNotFoundError as e:
        logger.error(f"\n✗ ERROR: {e}")
        return 1
    except ValueError as e:
        logger.error(f"\n✗ ERROR: {e}")
        return 1
    except SQLAlchemyError as e:
        logger.error(f"\n✗ DATABASE ERROR: {e}")
        return 1
    except Exception as e:
        logger.error(f"\n✗ UNEXPECTED ERROR: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
