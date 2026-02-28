"""
Solar Event Data Fetcher for GitHub Actions
Fetches solar flare and geomagnetic storm data from NASA DONKI API.

The old implementation used the NOAA GOES real-time X-ray sensor feed
(services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json) which only
provides sensor readings for the last 7 days — after the initial import
every record was a duplicate, so nothing new was ever inserted.

The NASA DONKI API (https://kauai.ccmc.gsfc.nasa.gov/DONKI) provides a
proper event catalog (solar flares + geomagnetic storms) going back years,
with unique event IDs, so historical back-fills and incremental monthly
updates both work correctly.  API key is optional (rate-limited but usable
without one).
"""

import requests
import sys
import os
import argparse
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# NASA DONKI base URL
DONKI_BASE = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get"


def _date_range(days: int):
    """Return (start_date_str, end_date_str) for the last `days` days."""
    end = datetime.utcnow().date()
    start = end - timedelta(days=days)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


def fetch_solar_flares(start_date: str, end_date: str) -> list:
    """Fetch solar flare events from NASA DONKI FLR endpoint."""
    url = f"{DONKI_BASE}/FLR"
    params = {"startDate": start_date, "endDate": end_date}

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json() or []
    except Exception as e:
        print(f"  ⚠️ Could not fetch solar flares: {e}")
        return []

    events = []
    for flare in data:
        begin_time = flare.get("beginTime") or flare.get("peakTime")
        if not begin_time:
            continue

        try:
            event_start = datetime.strptime(begin_time[:16], "%Y-%m-%dT%H:%M")
        except ValueError:
            continue

        end_time = flare.get("endTime")
        if end_time:
            try:
                event_end = datetime.strptime(end_time[:16], "%Y-%m-%dT%H:%M")
            except ValueError:
                event_end = event_start + timedelta(minutes=30)
        else:
            event_end = event_start + timedelta(minutes=30)

        # classType looks like "M5.0", "X1.2", "C3.4" — store the letter
        class_type = (flare.get("classType") or "C").strip()
        intensity = class_type[0].upper() if class_type else "C"

        events.append({
            'donki_id': flare.get("flrID", ""),
            'event_type': 'solar_flare',
            'event_start': event_start,
            'event_end': event_end,
            'intensity': intensity,
            'kp_index': None,
            'data_source': 'NASA DONKI',
            'created_at': datetime.utcnow()
        })

    print(f"  ☀️  Fetched {len(events)} solar flare events from DONKI")
    return events


def fetch_geomagnetic_storms(start_date: str, end_date: str) -> list:
    """Fetch geomagnetic storm events from NASA DONKI GST endpoint."""
    url = f"{DONKI_BASE}/GST"
    params = {"startDate": start_date, "endDate": end_date}

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json() or []
    except Exception as e:
        print(f"  ⚠️ Could not fetch geomagnetic storms: {e}")
        return []

    events = []
    for storm in data:
        start_time = storm.get("startTime")
        if not start_time:
            continue

        try:
            event_start = datetime.strptime(start_time[:16], "%Y-%m-%dT%H:%M")
        except ValueError:
            continue

        # kpIndex is a list of measurements — take the max
        kp_values = [
            float(m.get("kpIndex", 0))
            for m in (storm.get("allKpIndex") or [])
            if m.get("kpIndex") is not None
        ]
        kp_index = max(kp_values) if kp_values else None

        events.append({
            'donki_id': storm.get("gstID", ""),
            'event_type': 'geomagnetic_storm',
            'event_start': event_start,
            'event_end': event_start + timedelta(hours=24),  # storms last ~24 h
            'intensity': None,
            'kp_index': kp_index,
            'data_source': 'NASA DONKI',
            'created_at': datetime.utcnow()
        })

    print(f"  🌐 Fetched {len(events)} geomagnetic storm events from DONKI")
    return events


def fetch_solar_events(days: int = 30):
    """
    Fetch solar events (flares + geomagnetic storms) from NASA DONKI API.

    Args:
        days: Number of days to look back
    """
    print(f"☀️ Fetching solar events from last {days} days via NASA DONKI API...")

    start_date, end_date = _date_range(days)

    events = fetch_solar_flares(start_date, end_date)
    events += fetch_geomagnetic_storms(start_date, end_date)

    print(f"  ✅ Total solar events to process: {len(events)}")

    insert_solar_events(events)
    return len(events)


def _has_donki_id_column(session) -> bool:
    """Return True if the solar_events table has a donki_id column."""
    result = session.execute(
        text("""
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'solar_events'
              AND column_name = 'donki_id'
        """)
    )
    return result.fetchone() is not None


def insert_solar_events(events):
    """Insert solar events into database, skipping duplicates.

    Checks ONCE whether the donki_id column exists before looping.
    This avoids the PostgreSQL "InFailedSqlTransaction" cascade that
    occurs when an exception inside the loop aborts the transaction and
    all subsequent statements are ignored.
    """

    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("  ❌ DATABASE_URL not set")
        return

    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    engine = create_engine(database_url)

    inserted = 0
    skipped = 0

    with Session(engine) as session:
        # Detect schema capability once — outside the event loop
        has_donki_col = _has_donki_id_column(session)

        for event in events:
            donki_id = event.pop('donki_id', None)

            # --- Deduplication ---
            if has_donki_col and donki_id:
                result = session.execute(
                    text("SELECT id FROM solar_events WHERE donki_id = :did"),
                    {"did": donki_id}
                )
                if result.fetchone():
                    skipped += 1
                    continue
            else:
                # Time-window dedup (±1 hour) — same as the old NOAA approach
                result = session.execute(
                    text("""
                        SELECT id FROM solar_events
                        WHERE event_type  = :event_type
                          AND event_start >= :start_w
                          AND event_start <= :end_w
                    """),
                    {
                        "event_type": event['event_type'],
                        "start_w": event['event_start'] - timedelta(hours=1),
                        "end_w":   event['event_start'] + timedelta(hours=1),
                    }
                )
                if result.fetchone():
                    skipped += 1
                    continue

            # --- Insert (no try/except so the transaction stays clean) ---
            if has_donki_col:
                session.execute(
                    text("""
                        INSERT INTO solar_events
                            (donki_id, event_type, event_start, event_end,
                             intensity, kp_index, data_source, created_at)
                        VALUES
                            (:donki_id, :event_type, :event_start, :event_end,
                             :intensity, :kp_index, :data_source, :created_at)
                    """),
                    {**event, 'donki_id': donki_id}
                )
            else:
                session.execute(
                    text("""
                        INSERT INTO solar_events
                            (event_type, event_start, event_end,
                             intensity, kp_index, data_source, created_at)
                        VALUES
                            (:event_type, :event_start, :event_end,
                             :intensity, :kp_index, :data_source, :created_at)
                    """),
                    event
                )
            inserted += 1

        session.commit()

    print(f"  📊 Inserted: {inserted} | Skipped (duplicates): {skipped}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fetch NOAA solar event data')
    parser.add_argument('--days', type=int, default=30, help='Days to look back')
    
    args = parser.parse_args()
    
    count = fetch_solar_events(args.days)
    
    print(f"\n✅ Solar event update completed: {count} records processed")
    sys.exit(0)
