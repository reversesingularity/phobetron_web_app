"""
Admin endpoints for database management.
WARNING: These should be protected in production!
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
import subprocess
import os

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.post("/run-migrations")
async def run_migrations():
    """
    Run database migrations via Alembic.
    WARNING: This endpoint should be protected or removed in production!
    """
    try:
        # Run alembic upgrade head
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            cwd="/app"  # Railway container working directory
        )
        
        return {
            "status": "success" if result.returncode == 0 else "error",
            "return_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/check-tables")
async def check_tables():
    """
    Check if database tables exist.
    """
    from app.db.session import get_engine
    
    try:
        engine = get_engine()
        with engine.connect() as conn:
            # Query to list all tables
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result]
            
            return {
                "status": "success",
                "table_count": len(tables),
                "tables": tables,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
