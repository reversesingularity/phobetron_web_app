"""Integration tests for theological data endpoints."""

import pytest
from datetime import datetime

from app.models.theological import Prophecies, CelestialSigns, ProphecySignLinks


class TestPropheciesEndpoint:
    """Tests for /api/v1/theological/prophecies endpoint."""
    
    def test_get_prophecies_empty(self, client):
        """Test getting prophecies when database is empty."""
        response = client.get("/api/v1/theological/prophecies")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["data"] == []
    
    def test_get_prophecies_with_data(self, client, db_session):
        """Test getting prophecies with records."""
        prophecy = Prophecies(
            event_name="The Great Tribulation",
            scripture_reference="Matthew 24:21",
            scripture_text="For then there will be great tribulation...",
            prophecy_category="TRIBULATION",
            chronological_order=50
        )
        db_session.add(prophecy)
        db_session.commit()
        
        response = client.get("/api/v1/theological/prophecies")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["event_name"] == "The Great Tribulation"
        assert data["data"][0]["scripture_reference"] == "Matthew 24:21"
    
    def test_prophecies_chronological_ordering(self, client, db_session):
        """Test that prophecies are ordered chronologically with nulls last."""
        # Add prophecies in random order
        db_session.add(Prophecies(
            event_name="Event C",
            scripture_reference="Rev 10:1",
            scripture_text="...",
            prophecy_category="SEAL_JUDGMENT",
            chronological_order=30
        ))
        db_session.add(Prophecies(
            event_name="Event A",
            scripture_reference="Rev 5:1",
            scripture_text="...",
            prophecy_category="SEAL_JUDGMENT",
            chronological_order=10
        ))
        db_session.add(Prophecies(
            event_name="Event D",
            scripture_reference="Rev 15:1",
            scripture_text="...",
            prophecy_category="OTHER",
            chronological_order=None  # No chronological order
        ))
        db_session.add(Prophecies(
            event_name="Event B",
            scripture_reference="Rev 8:1",
            scripture_text="...",
            prophecy_category="SEAL_JUDGMENT",
            chronological_order=20
        ))
        db_session.commit()
        
        response = client.get("/api/v1/theological/prophecies")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 4
        
        # Verify correct chronological order (nulls last)
        names = [p["event_name"] for p in data["data"]]
        assert names[:3] == ["Event A", "Event B", "Event C"]
        assert names[3] == "Event D"
    
    def test_filter_by_category(self, client, db_session):
        """Test filtering by prophecy category."""
        db_session.add(Prophecies(
            event_name="Second Coming",
            scripture_reference="Rev 19:11",
            scripture_text="...",
            prophecy_category="SECOND_COMING"
        ))
        db_session.add(Prophecies(
            event_name="Birth of Messiah",
            scripture_reference="Isaiah 7:14",
            scripture_text="...",
            prophecy_category="OTHER"
        ))
        db_session.commit()
        
        response = client.get("/api/v1/theological/prophecies?category=OTHER")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["event_name"] == "Birth of Messiah"
    
    def test_filter_by_event_name(self, client, db_session):
        """Test filtering by event name."""
        db_session.add(Prophecies(
            event_name="Rapture",
            scripture_reference="1 Thess 4:17",
            scripture_text="...",
            prophecy_category="OTHER"
        ))
        db_session.add(Prophecies(
            event_name="Tribulation",
            scripture_reference="Matt 24:21",
            scripture_text="...",
            prophecy_category="TRIBULATION"
        ))
        db_session.commit()
        
        response = client.get("/api/v1/theological/prophecies?event_name=Rapture")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["event_name"] == "Rapture"


class TestCelestialSignsEndpoint:
    """Tests for /api/v1/theological/celestial-signs endpoint."""
    
    def test_get_celestial_signs_empty(self, client):
        """Test getting celestial signs when database is empty."""
        response = client.get("/api/v1/theological/celestial-signs")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_celestial_signs_with_data(self, client, db_session):
        """Test getting celestial signs with records."""
        sign = CelestialSigns(
            sign_name="Sun Darkened",
            sign_description="The sun will be darkened",
            sign_type="SOLAR",
            theological_interpretation="Judgment and the Day of the Lord",
            primary_scripture="Joel 2:31",
            related_scriptures=["Matthew 24:29", "Acts 2:20", "Revelation 6:12"]
        )
        db_session.add(sign)
        db_session.commit()
        
        response = client.get("/api/v1/theological/celestial-signs")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["sign_name"] == "Sun Darkened"
        assert data["data"][0]["sign_type"] == "SOLAR"
        assert len(data["data"][0]["related_scriptures"]) == 3
    
    def test_filter_by_sign_type(self, client, db_session):
        """Test filtering by sign type."""
        db_session.add(CelestialSigns(
            sign_name="Blood Moon",
            sign_description="The moon turns blood red",
            sign_type="LUNAR",
            theological_interpretation="Divine judgment approaching",
            primary_scripture="Joel 2:31"
        ))
        db_session.add(CelestialSigns(
            sign_name="Stars Fall",
            sign_description="Stars falling from heaven",
            sign_type="STELLAR",
            theological_interpretation="End times cosmic signs",
            primary_scripture="Matthew 24:29"
        ))
        db_session.commit()
        
        response = client.get("/api/v1/theological/celestial-signs?sign_type=LUNAR")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["sign_name"] == "Blood Moon"
    
    def test_filter_by_sign_name(self, client, db_session):
        """Test filtering by sign name."""
        db_session.add(CelestialSigns(
            sign_name="Great Sign",
            sign_description="Woman clothed with the sun",
            sign_type="COMBINED",
            theological_interpretation="Israel and the Messiah",
            primary_scripture="Revelation 12:1"
        ))
        db_session.add(CelestialSigns(
            sign_name="Wormwood Star",
            sign_description="A great star fell from heaven",
            sign_type="STELLAR",
            theological_interpretation="Bitter judgment from heaven",
            primary_scripture="Revelation 8:10-11"
        ))
        db_session.commit()
        
        response = client.get("/api/v1/theological/celestial-signs?sign_name=Wormwood Star")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["sign_name"] == "Wormwood Star"


class TestProphecySignLinksEndpoint:
    """Tests for /api/v1/theological/prophecy-sign-links endpoint."""
    
    def test_get_prophecy_sign_links_empty(self, client):
        """Test getting links when database is empty."""
        response = client.get("/api/v1/theological/prophecy-sign-links")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
    
    def test_get_prophecy_sign_links_with_data(self, client, db_session):
        """Test getting prophecy-sign links with records."""
        # Create a prophecy
        prophecy = Prophecies(
            event_name="Day of the Lord",
            scripture_reference="Joel 2:30-31",
            scripture_text="I will show wonders in the heavens...",
            prophecy_category="DAY_OF_LORD"
        )
        db_session.add(prophecy)
        db_session.flush()
        
        # Create a celestial sign
        sign = CelestialSigns(
            sign_name="Sun Darkened",
            sign_description="The sun will be darkened",
            sign_type="SOLAR",
            theological_interpretation="Divine judgment",
            primary_scripture="Joel 2:31"
        )
        db_session.add(sign)
        db_session.flush()
        
        # Create link
        link = ProphecySignLinks(
            prophecy_id=prophecy.id,
            sign_id=sign.id,
            link_notes="Direct mention of celestial signs in prophecy"
        )
        db_session.add(link)
        db_session.commit()
        
        response = client.get("/api/v1/theological/prophecy-sign-links")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["prophecy_id"] == prophecy.id
        assert data["data"][0]["sign_id"] == sign.id
    
    def test_filter_by_prophecy_id(self, client, db_session):
        """Test filtering by prophecy_id."""
        # Create prophecies
        p1 = Prophecies(event_name="P1", scripture_reference="Rev 1:1", scripture_text="...", prophecy_category="SEAL_JUDGMENT")
        p2 = Prophecies(event_name="P2", scripture_reference="Rev 2:1", scripture_text="...", prophecy_category="TRUMPET_JUDGMENT")
        db_session.add_all([p1, p2])
        db_session.flush()
        
        # Create sign
        sign = CelestialSigns(sign_name="S1", sign_description="...", sign_type="LUNAR", theological_interpretation="...", primary_scripture="...")
        db_session.add(sign)
        db_session.flush()
        
        # Create links
        link1 = ProphecySignLinks(prophecy_id=p1.id, sign_id=sign.id)
        link2 = ProphecySignLinks(prophecy_id=p2.id, sign_id=sign.id)
        db_session.add_all([link1, link2])
        db_session.commit()
        
        response = client.get(f"/api/v1/theological/prophecy-sign-links?prophecy_id={p1.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["prophecy_id"] == p1.id
    
    def test_filter_by_sign_id(self, client, db_session):
        """Test filtering by sign_id."""
        # Create prophecy
        prophecy = Prophecies(event_name="P1", scripture_reference="Rev 1:1", scripture_text="...", prophecy_category="COSMIC_DISTURBANCE")
        db_session.add(prophecy)
        db_session.flush()
        
        # Create signs
        s1 = CelestialSigns(sign_name="S1", sign_description="...", sign_type="LUNAR", theological_interpretation="...", primary_scripture="...")
        s2 = CelestialSigns(sign_name="S2", sign_description="...", sign_type="SOLAR", theological_interpretation="...", primary_scripture="...")
        db_session.add_all([s1, s2])
        db_session.flush()
        
        # Create links
        link1 = ProphecySignLinks(prophecy_id=prophecy.id, sign_id=s1.id)
        link2 = ProphecySignLinks(prophecy_id=prophecy.id, sign_id=s2.id)
        db_session.add_all([link1, link2])
        db_session.commit()
        
        response = client.get(f"/api/v1/theological/prophecy-sign-links?sign_id={s2.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["data"][0]["sign_id"] == s2.id
    
    def test_pagination(self, client, db_session):
        """Test pagination for prophecy-sign links."""
        # Create 5 prophecies and 1 sign
        prophecies = [
            Prophecies(event_name=f"P{i}", scripture_reference=f"Rev {i}:1", scripture_text="...", prophecy_category="OTHER")
            for i in range(1, 6)
        ]
        db_session.add_all(prophecies)
        db_session.flush()
        
        sign = CelestialSigns(sign_name="S1", sign_description="...", sign_type="LUNAR", theological_interpretation="...", primary_scripture="...")
        db_session.add(sign)
        db_session.flush()
        
        # Create links
        links = [ProphecySignLinks(prophecy_id=p.id, sign_id=sign.id) for p in prophecies]
        db_session.add_all(links)
        db_session.commit()
        
        response = client.get("/api/v1/theological/prophecy-sign-links?skip=1&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5
        assert data["skip"] == 1
        assert data["limit"] == 2
        assert len(data["data"]) == 2
