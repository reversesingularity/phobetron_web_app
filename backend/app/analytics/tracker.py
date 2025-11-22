"""
Simple analytics tracker for Phobetron webapp.
Tracks visitor counts and basic location data using SQLite.
Privacy-focused: No personal data stored, only aggregated stats.
"""
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import json
from collections import Counter

# SQLite database path
DB_PATH = Path(__file__).parent / "analytics.db"


class AnalyticsTracker:
    """Lightweight analytics tracker for visitor statistics."""
    
    def __init__(self):
        """Initialize database and create tables if needed."""
        self._init_db()
    
    def _init_db(self):
        """Create analytics tables if they don't exist."""
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        # Visits table - stores individual page visits
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS visits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME NOT NULL,
                path TEXT NOT NULL,
                country TEXT,
                city TEXT,
                referrer TEXT,
                user_agent TEXT
            )
        """)
        
        # Daily aggregates table - for faster queries
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_stats (
                date DATE PRIMARY KEY,
                total_visits INTEGER DEFAULT 0,
                unique_paths INTEGER DEFAULT 0,
                top_countries TEXT,
                top_pages TEXT
            )
        """)
        
        # Create indexes for performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_visits_timestamp 
            ON visits(timestamp)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_visits_country 
            ON visits(country)
        """)
        
        conn.commit()
        conn.close()
    
    def log_visit(
        self,
        path: str,
        country: Optional[str] = None,
        city: Optional[str] = None,
        referrer: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """
        Log a page visit.
        
        Args:
            path: Page path (e.g., "/dashboard", "/solar-system")
            country: Country code (e.g., "NZ", "US")
            city: City name
            referrer: Referrer URL
            user_agent: User agent string (truncated to 200 chars)
        """
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO visits (timestamp, path, country, city, referrer, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            datetime.utcnow(),
            path,
            country,
            city,
            referrer,
            user_agent[:200] if user_agent else None
        ))
        
        conn.commit()
        conn.close()
    
    def get_stats(self, days: int = 30) -> Dict:
        """
        Get analytics statistics for the specified period.
        
        Args:
            days: Number of days to look back
            
        Returns:
            Dict with statistics including total visits, unique visitors, etc.
        """
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Total visits in period
        cursor.execute("""
            SELECT COUNT(*) FROM visits
            WHERE timestamp >= ?
        """, (cutoff_date,))
        total_visits = cursor.fetchone()[0]
        
        # Visits today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        cursor.execute("""
            SELECT COUNT(*) FROM visits
            WHERE timestamp >= ?
        """, (today_start,))
        visits_today = cursor.fetchone()[0]
        
        # Top countries
        cursor.execute("""
            SELECT country, COUNT(*) as count
            FROM visits
            WHERE timestamp >= ? AND country IS NOT NULL
            GROUP BY country
            ORDER BY count DESC
            LIMIT 10
        """, (cutoff_date,))
        top_countries = [
            {"country": row[0], "visits": row[1]}
            for row in cursor.fetchall()
        ]
        
        # Top pages
        cursor.execute("""
            SELECT path, COUNT(*) as count
            FROM visits
            WHERE timestamp >= ?
            GROUP BY path
            ORDER BY count DESC
            LIMIT 10
        """, (cutoff_date,))
        top_pages = [
            {"path": row[0], "visits": row[1]}
            for row in cursor.fetchall()
        ]
        
        # Daily visits (last 30 days)
        cursor.execute("""
            SELECT DATE(timestamp) as date, COUNT(*) as count
            FROM visits
            WHERE timestamp >= ?
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
            LIMIT 30
        """, (cutoff_date,))
        daily_visits = [
            {"date": row[0], "visits": row[1]}
            for row in cursor.fetchall()
        ]
        
        # Top referrers
        cursor.execute("""
            SELECT referrer, COUNT(*) as count
            FROM visits
            WHERE timestamp >= ? AND referrer IS NOT NULL AND referrer != ''
            GROUP BY referrer
            ORDER BY count DESC
            LIMIT 10
        """, (cutoff_date,))
        top_referrers = [
            {"referrer": row[0], "visits": row[1]}
            for row in cursor.fetchall()
        ]
        
        conn.close()
        
        return {
            "period_days": days,
            "total_visits": total_visits,
            "visits_today": visits_today,
            "top_countries": top_countries,
            "top_pages": top_pages,
            "daily_visits": daily_visits,
            "top_referrers": top_referrers,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def get_realtime_stats(self) -> Dict:
        """
        Get real-time statistics (last 5 minutes).
        
        Returns:
            Dict with recent activity stats
        """
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        five_min_ago = datetime.utcnow() - timedelta(minutes=5)
        
        cursor.execute("""
            SELECT COUNT(*) FROM visits
            WHERE timestamp >= ?
        """, (five_min_ago,))
        visits_last_5min = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT path, COUNT(*) as count
            FROM visits
            WHERE timestamp >= ?
            GROUP BY path
            ORDER BY count DESC
            LIMIT 5
        """, (five_min_ago,))
        active_pages = [
            {"path": row[0], "visits": row[1]}
            for row in cursor.fetchall()
        ]
        
        conn.close()
        
        return {
            "visits_last_5min": visits_last_5min,
            "active_pages": active_pages,
            "timestamp": datetime.utcnow().isoformat()
        }


# Singleton instance
_tracker = None


def get_tracker() -> AnalyticsTracker:
    """Get or create the analytics tracker singleton."""
    global _tracker
    if _tracker is None:
        _tracker = AnalyticsTracker()
    return _tracker
