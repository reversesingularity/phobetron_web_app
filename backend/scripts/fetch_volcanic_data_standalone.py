"""
Volcanic Activity Data Fetcher for GitHub Actions
Fetches recent volcanic eruption data from Smithsonian Global Volcanism Program.
Standalone - no FastAPI dependencies.

Previous version fetched the static Holocene volcano catalog which never
changes after the first import (every record became a duplicate on every
subsequent run).  This version queries the GVP *eruption results* WFS layer
and filters to eruptions that started in the current year, so each monthly
run only inserts genuinely new events.
"""

import requests
import os
import uuid
from datetime import datetime, date
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

GVP_API_BASE = "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows"
# Layer was renamed — old: Smithsonian_VOTW_Eruption_Results (removed)
GVP_ERUPTIONS_LAYER = "GVP-VOTW:E3WebApp_Eruptions1960"


def fetch_recent_eruptions(year: int = None) -> list:
    """
    Fetch confirmed eruption events from Smithsonian GVP.
    Defaults to the current calendar year so monthly runs only pull new data.
    """
    if year is None:
        year = date.today().year

    print(f"🌋 Fetching GVP eruption events for {year} from Smithsonian GVP...")

    # The CQL_FILTER parameter causes a WFS ServiceException on this GeoServer.
    # Fetch all features and filter by year client-side instead.
    params = {
        'service': 'WFS',
        'version': '1.0.0',
        'request': 'GetFeature',
        'typeName': GVP_ERUPTIONS_LAYER,
        'outputFormat': 'application/json',
        'maxFeatures': 2000,
    }

    try:
        response = requests.get(GVP_API_BASE, params=params, timeout=60)
        response.raise_for_status()
        if not response.content:
            print(f"  ⚠️ GVP returned empty response")
            return []
        data = response.json()
    except ValueError:
        # JSON parse failed — server likely returned an XML WFS exception
        raw = response.text[:500] if response.text else "(empty)"
        print(f"  ❌ GVP returned non-JSON response: {raw}")
        return []
    except Exception as e:
        print(f"  ❌ Error fetching eruption data: {e}")
        return []

    eruptions = []
    for feature in data.get('features', []):
        props = feature.get('properties', {})

        # E3WebApp_Eruptions1960 field names differ from the old layer
        start_year = props.get('StartDateYear')
        try:
            start_year_int = int(start_year)
        except (TypeError, ValueError):
            continue
        if start_year_int != year:
            continue

        start_month = props.get('StartDateMonth') or 1
        start_day = props.get('StartDateDay') or 1
        try:
            eruption_start = datetime(start_year_int, int(start_month), int(start_day))
        except (TypeError, ValueError):
            eruption_start = datetime(year, 1, 1)

        # Parse eruption end date (may be ongoing)
        end_year = props.get('EndDateYear')
        end_month = props.get('EndDateMonth') or 12
        end_day = props.get('EndDateDay') or 28
        try:
            eruption_end = datetime(int(end_year), int(end_month), min(int(end_day), 28))
        except (TypeError, ValueError):
            eruption_end = eruption_start

        vei = props.get('ExplosivityIndexMax')
        try:
            vei = int(vei) if vei is not None else None
        except (TypeError, ValueError):
            vei = None

        eruptions.append({
            'id': str(uuid.uuid4()),
            'volcano_name': props.get('VolcanoName', 'Unknown'),
            'country': 'Unknown',  # not in this layer
            'vei': vei,
            'eruption_start': eruption_start,
            'eruption_end': eruption_end,
            'latitude': float(props.get('LatitudeDecimal') or 0.0),
            'longitude': float(props.get('LongitudeDecimal') or 0.0),
            'eruption_type': 'Confirmed',
            'data_source': 'Smithsonian GVP',
        })

    print(f"  ✅ Fetched {len(eruptions)} eruption records for {year}")
    return eruptions


def insert_volcanic_data(volcanoes):
    """Insert volcanic eruption events into database, skipping duplicates."""
    added = 0
    skipped = 0

    print("💾 Inserting volcanic data into database...")

    # Get DATABASE_URL from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")

    # Create engine and session
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    engine = create_engine(database_url)

    with Session(engine) as session:
        for volcano_data in volcanoes:
            # Deduplicate by volcano name + eruption start date
            result = session.execute(
                text("""
                    SELECT id FROM volcanic_activity
                    WHERE volcano_name = :name AND eruption_start = :start
                """),
                {
                    "name": volcano_data['volcano_name'],
                    "start": volcano_data['eruption_start']
                }
            )

            if result.fetchone():
                skipped += 1
                continue

            # Insert volcanic event
            session.execute(
                text("""
                    INSERT INTO volcanic_activity
                    (id, volcano_name, country, vei, eruption_start, eruption_end,
                     latitude, longitude, eruption_type, data_source, created_at)
                    VALUES (:id, :volcano_name, :country, :vei, :eruption_start, :eruption_end,
                            :latitude, :longitude, :eruption_type, :data_source, :created_at)
                """),
                {
                    **volcano_data,
                    'created_at': datetime.utcnow()
                }
            )
            added += 1

        session.commit()

    print(f"  ✅ Added {added} volcanic records")
    print(f"  ⏭️  Skipped {skipped} duplicates")

    return added


def main():
    """Main execution function — fetch current and prior year to catch late-reported events."""
    today = date.today()
    errors = 0

    for year in sorted({today.year - 1, today.year}):
        try:
            eruptions = fetch_recent_eruptions(year)
            if eruptions:
                count = insert_volcanic_data(eruptions)
                print(f"\n🎉 Successfully added {count} volcanic records for {year}")
            else:
                print(f"\n⚠️  No volcanic eruption data fetched for {year}")
        except Exception as e:
            print(f"\n❌ Error processing {year}: {e}")
            errors += 1

    return errors


if __name__ == "__main__":
    import sys
    from datetime import date
    sys.exit(main())
