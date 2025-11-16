"""
Unit tests for theological models: Prophecies, CelestialSigns, ProphecySignLinks.

Tests cover:
- Basic CRUD operations
- Many-to-many relationships
- Cascade delete behavior
- Check constraints for categories
- Unique constraints
"""
import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from app.models.theological import Prophecies, CelestialSigns, ProphecySignLinks


def test_prophecies_create(db_session):
    """Test creating a prophecy record with all fields."""
    # Sixth Seal Judgment from Revelation
    prophecy = Prophecies(
        event_name="Sixth Seal Judgment",
        scripture_reference="Revelation 6:12-14",
        scripture_text=(
            "I watched as he opened the sixth seal. There was a great earthquake. "
            "The sun turned black like sackcloth made of goat hair, the whole moon "
            "turned blood red, and the stars in the sky fell to earth, as figs drop "
            "from a fig tree when shaken by a strong wind. The heavens receded like "
            "a scroll being rolled up, and every mountain and island was removed from its place."
        ),
        event_description="Cosmic disturbances including earthquake, solar darkening, blood moon, and falling stars",
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=6,
        theological_notes="Part of the seven seal judgments; represents divine wrath and cosmic upheaval"
    )
    
    db_session.add(prophecy)
    db_session.commit()
    
    # Query back
    result = db_session.query(Prophecies).filter_by(event_name="Sixth Seal Judgment").first()
    assert result is not None
    assert result.scripture_reference == "Revelation 6:12-14"
    assert result.prophecy_category == "SEAL_JUDGMENT"
    assert result.chronological_order == 6
    assert "great earthquake" in result.scripture_text.lower()


def test_celestial_signs_create(db_session):
    """Test creating celestial sign records with scripture arrays."""
    # Great Earthquake sign
    earthquake_sign = CelestialSigns(
        sign_name="Great Earthquake",
        sign_description="A massive seismic event of unprecedented magnitude",
        theological_interpretation=(
            "Represents divine judgment and the shaking of earthly powers. "
            "Often precedes major prophetic fulfillments and signifies God's intervention in human affairs."
        ),
        primary_scripture="Revelation 6:12",
        related_scriptures=[
            "Revelation 11:13",
            "Revelation 16:18",
            "Isaiah 13:13",
            "Haggai 2:6",
            "Zechariah 14:4-5"
        ],
        sign_type="SEISMIC"
    )
    
    # Blood Moon sign
    blood_moon_sign = CelestialSigns(
        sign_name="Moon to Blood",
        sign_description="The moon appears blood red in color",
        theological_interpretation=(
            "A celestial sign preceding the Day of the Lord. "
            "Associated with divine judgment and the end times."
        ),
        primary_scripture="Joel 2:31",
        related_scriptures=[
            "Revelation 6:12",
            "Acts 2:20",
            "Isaiah 13:10"
        ],
        sign_type="LUNAR"
    )
    
    db_session.add_all([earthquake_sign, blood_moon_sign])
    db_session.commit()
    
    # Query back
    result = db_session.query(CelestialSigns).filter_by(sign_name="Great Earthquake").first()
    assert result is not None
    assert result.sign_type == "SEISMIC"
    assert len(result.related_scriptures) == 5
    assert "Revelation 16:18" in result.related_scriptures
    
    moon_result = db_session.query(CelestialSigns).filter_by(sign_name="Moon to Blood").first()
    assert moon_result is not None
    assert moon_result.sign_type == "LUNAR"
    assert "Joel 2:31" == moon_result.primary_scripture


def test_prophecy_sign_links_many_to_many(db_session):
    """Test many-to-many relationship between prophecies and signs."""
    # Create prophecy
    prophecy = Prophecies(
        event_name="Sixth Seal Judgment",
        scripture_reference="Revelation 6:12-14",
        scripture_text="I watched as he opened the sixth seal...",
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=6
    )
    
    # Create multiple signs
    sign1 = CelestialSigns(
        sign_name="Great Earthquake",
        sign_description="Massive seismic event",
        theological_interpretation="Divine judgment",
        primary_scripture="Revelation 6:12",
        sign_type="SEISMIC"
    )
    
    sign2 = CelestialSigns(
        sign_name="Sun Darkened",
        sign_description="The sun turns black",
        theological_interpretation="Cosmic disturbance signaling judgment",
        primary_scripture="Revelation 6:12",
        sign_type="SOLAR"
    )
    
    sign3 = CelestialSigns(
        sign_name="Moon to Blood",
        sign_description="The moon turns blood red",
        theological_interpretation="End times sign",
        primary_scripture="Revelation 6:12",
        sign_type="LUNAR"
    )
    
    db_session.add_all([prophecy, sign1, sign2, sign3])
    db_session.commit()
    
    # Create links using the many-to-many relationship
    prophecy.celestial_signs.extend([sign1, sign2, sign3])
    db_session.commit()
    
    # Query prophecy and verify all signs are linked
    result = db_session.query(Prophecies).filter_by(event_name="Sixth Seal Judgment").first()
    assert len(result.celestial_signs) == 3
    
    sign_names = {sign.sign_name for sign in result.celestial_signs}
    assert "Great Earthquake" in sign_names
    assert "Sun Darkened" in sign_names
    assert "Moon to Blood" in sign_names
    
    # Query sign and verify prophecy is linked
    sign_result = db_session.query(CelestialSigns).filter_by(sign_name="Great Earthquake").first()
    assert len(sign_result.prophecies) == 1
    assert sign_result.prophecies[0].event_name == "Sixth Seal Judgment"


def test_prophecy_sign_links_manual_creation(db_session):
    """Test manually creating junction table entries with notes."""
    # Create entities
    prophecy = Prophecies(
        event_name="Day of the Lord",
        scripture_reference="Joel 2:30-31",
        scripture_text="I will show wonders in the heavens and on the earth...",
        prophecy_category="DAY_OF_LORD"
    )
    
    sign = CelestialSigns(
        sign_name="Blood Moon Tetrad",
        sign_description="Four consecutive total lunar eclipses",
        theological_interpretation="Rare celestial phenomenon with prophetic significance",
        primary_scripture="Joel 2:31",
        sign_type="LUNAR"
    )
    
    db_session.add_all([prophecy, sign])
    db_session.commit()
    
    # Manually create link with notes
    link = ProphecySignLinks(
        prophecy_id=prophecy.id,
        sign_id=sign.id,
        link_notes="The blood moon tetrad of 2014-2015 coincided with Jewish feast days"
    )
    
    db_session.add(link)
    db_session.commit()
    
    # Verify link exists
    result = db_session.query(ProphecySignLinks).filter_by(
        prophecy_id=prophecy.id,
        sign_id=sign.id
    ).first()
    
    assert result is not None
    assert "2014-2015" in result.link_notes


def test_cascade_delete_prophecy(db_session):
    """Test CASCADE delete: deleting prophecy removes links automatically."""
    # Create prophecy and sign
    prophecy = Prophecies(
        event_name="Test Prophecy",
        scripture_reference="Test 1:1",
        scripture_text="Test text",
        prophecy_category="OTHER"
    )
    
    sign = CelestialSigns(
        sign_name="Test Sign",
        sign_description="Test description",
        theological_interpretation="Test interpretation",
        primary_scripture="Test 1:1",
        sign_type="OTHER"
    )
    
    db_session.add_all([prophecy, sign])
    db_session.commit()
    
    # Create link
    link = ProphecySignLinks(
        prophecy_id=prophecy.id,
        sign_id=sign.id
    )
    db_session.add(link)
    db_session.commit()
    
    # Verify link exists
    link_count = db_session.query(ProphecySignLinks).count()
    assert link_count == 1
    
    # Delete prophecy
    db_session.delete(prophecy)
    db_session.commit()
    
    # Verify link was automatically deleted (CASCADE)
    link_count_after = db_session.query(ProphecySignLinks).count()
    assert link_count_after == 0
    
    # Sign should still exist
    sign_exists = db_session.query(CelestialSigns).filter_by(id=sign.id).first()
    assert sign_exists is not None


def test_cascade_delete_sign(db_session):
    """Test CASCADE delete: deleting sign removes links automatically."""
    # Create prophecy and sign
    prophecy = Prophecies(
        event_name="Test Prophecy 2",
        scripture_reference="Test 2:2",
        scripture_text="Test text 2",
        prophecy_category="OTHER"
    )
    
    sign = CelestialSigns(
        sign_name="Test Sign 2",
        sign_description="Test description 2",
        theological_interpretation="Test interpretation 2",
        primary_scripture="Test 2:2",
        sign_type="OTHER"
    )
    
    db_session.add_all([prophecy, sign])
    db_session.commit()
    
    # Create link
    link = ProphecySignLinks(
        prophecy_id=prophecy.id,
        sign_id=sign.id
    )
    db_session.add(link)
    db_session.commit()
    
    # Delete sign
    db_session.delete(sign)
    db_session.commit()
    
    # Verify link was automatically deleted (CASCADE)
    link_count = db_session.query(ProphecySignLinks).count()
    assert link_count == 0
    
    # Prophecy should still exist
    prophecy_exists = db_session.query(Prophecies).filter_by(id=prophecy.id).first()
    assert prophecy_exists is not None


def test_unique_sign_name_constraint(db_session):
    """Test unique constraint on celestial_signs.sign_name."""
    sign1 = CelestialSigns(
        sign_name="Great Earthquake",
        sign_description="First earthquake",
        theological_interpretation="Interpretation 1",
        primary_scripture="Rev 6:12",
        sign_type="SEISMIC"
    )
    
    db_session.add(sign1)
    db_session.commit()
    
    # Attempt duplicate sign name
    sign2 = CelestialSigns(
        sign_name="Great Earthquake",  # Duplicate
        sign_description="Second earthquake",
        theological_interpretation="Interpretation 2",
        primary_scripture="Rev 11:13",
        sign_type="SEISMIC"
    )
    
    db_session.add(sign2)
    
    with pytest.raises(IntegrityError) as exc_info:
        db_session.commit()
    
    assert "unique constraint" in str(exc_info.value).lower() or "duplicate key" in str(exc_info.value).lower()
    db_session.rollback()


def test_unique_prophecy_sign_link_constraint(db_session):
    """Test unique constraint on (prophecy_id, sign_id) in prophecy_sign_links."""
    # Create entities
    prophecy = Prophecies(
        event_name="Test Prophecy 3",
        scripture_reference="Test 3:3",
        scripture_text="Test text 3",
        prophecy_category="OTHER"
    )
    
    sign = CelestialSigns(
        sign_name="Test Sign 3",
        sign_description="Test description 3",
        theological_interpretation="Test interpretation 3",
        primary_scripture="Test 3:3",
        sign_type="OTHER"
    )
    
    db_session.add_all([prophecy, sign])
    db_session.commit()
    
    # Create first link
    link1 = ProphecySignLinks(
        prophecy_id=prophecy.id,
        sign_id=sign.id,
        link_notes="First link"
    )
    db_session.add(link1)
    db_session.commit()
    
    # Attempt duplicate link
    link2 = ProphecySignLinks(
        prophecy_id=prophecy.id,
        sign_id=sign.id,
        link_notes="Duplicate link"
    )
    db_session.add(link2)
    
    with pytest.raises(IntegrityError) as exc_info:
        db_session.commit()
    
    assert "unique constraint" in str(exc_info.value).lower() or "duplicate key" in str(exc_info.value).lower()
    db_session.rollback()


def test_prophecy_category_check_constraint(db_session):
    """Test check constraint on prophecy_category allows valid values."""
    valid_categories = [
        "SEAL_JUDGMENT",
        "TRUMPET_JUDGMENT",
        "BOWL_JUDGMENT",
        "DAY_OF_LORD",
        "SECOND_COMING",
        "TRIBULATION",
        "MILLENNIAL_REIGN",
        "COSMIC_DISTURBANCE",
        "OTHER"
    ]
    
    # Test valid category
    prophecy = Prophecies(
        event_name="Test Valid Category",
        scripture_reference="Test 4:4",
        scripture_text="Test text",
        prophecy_category="TRUMPET_JUDGMENT"
    )
    
    db_session.add(prophecy)
    db_session.commit()
    
    result = db_session.query(Prophecies).filter_by(event_name="Test Valid Category").first()
    assert result.prophecy_category == "TRUMPET_JUDGMENT"


def test_sign_type_check_constraint(db_session):
    """Test check constraint on sign_type allows valid values and NULL."""
    # Test valid type
    sign1 = CelestialSigns(
        sign_name="Test Cosmic Sign",
        sign_description="Test description",
        theological_interpretation="Test interpretation",
        primary_scripture="Test 5:5",
        sign_type="COSMIC"
    )
    
    db_session.add(sign1)
    db_session.commit()
    
    # Test NULL type (allowed)
    sign2 = CelestialSigns(
        sign_name="Test Null Type Sign",
        sign_description="Test description",
        theological_interpretation="Test interpretation",
        primary_scripture="Test 6:6",
        sign_type=None
    )
    
    db_session.add(sign2)
    db_session.commit()
    
    result = db_session.query(CelestialSigns).filter_by(sign_name="Test Null Type Sign").first()
    assert result.sign_type is None
