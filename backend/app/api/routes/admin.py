"""
Admin endpoints for database management.
WARNING: These should be protected in production!
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
import subprocess
import os

router = APIRouter(tags=["admin"])


@router.get("/ping")
async def admin_ping():
    """Simple ping endpoint to verify admin routes are accessible."""
    return {
        "status": "ok",
        "message": "Admin endpoints are accessible",
        "timestamp": "2025-11-12T00:00:00Z"
    }


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
    try:
        from app.db.session import SessionLocal
        from sqlalchemy import inspect
        
        # Use a session to get the engine
        db = SessionLocal()
        try:
            inspector = inspect(db.bind)
            tables = inspector.get_table_names()
            
            return {
                "status": "success",
                "table_count": len(tables),
                "tables": sorted(tables),
            }
        finally:
            db.close()
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "table_count": 0,
            "tables": []
        }
