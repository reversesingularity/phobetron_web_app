"""
Theological data models for biblical prophecies and celestial signs.

This module contains models for User Story 2 - Prophetic Content Management:
- Prophecies: Biblical prophecy records with scripture references
- CelestialSigns: Theological interpretations of celestial events
- ProphecySignLinks: Many-to-many relationship between prophecies and signs
- FeastDay: Jewish biblical feast days (Hebrew calendar)
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, ARRAY, Index, UniqueConstraint, CheckConstraint, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Prophecies(Base):
    """
    Biblical prophecies with scripture references and categorization.
    
    Stores prophecy records from books like Revelation, Isaiah, Joel, Zechariah
    with their associated scripture text, event descriptions, and chronological ordering.
    
    Examples:
    - Sixth Seal Judgment (Revelation 6:12-14)
    - Blood Moons Prophecy (Joel 2:31)
    - Day of the Lord (Isaiah 13:9-13)
    """
    __tablename__ = "prophecies"
    
    # Primary key - SERIAL for reference data
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Core identification
    event_name = Column(String(255), nullable=False, comment="Name of prophetic event (e.g., 'Sixth Seal Judgment')")
    
    # Scripture information
    scripture_reference = Column(String(255), nullable=False, comment="Bible reference (e.g., 'Revelation 6:12-14')")
    scripture_text = Column(Text, nullable=False, comment="Full text of the prophecy passage")
    
    # Event details
    event_description = Column(Text, nullable=True, comment="Description of the prophetic events")
    
    # Categorization
    prophecy_category = Column(
        String(100), 
        nullable=False,
        comment="Category: SEAL_JUDGMENT, TRUMPET_JUDGMENT, BOWL_JUDGMENT, DAY_OF_LORD, SECOND_COMING, etc."
    )
    
    # Ordering for chronological/sequential prophecies
    chronological_order = Column(
        Integer, 
        nullable=True,
        comment="Sequential order within a category (e.g., Seal 1-7, Trumpet 1-7)"
    )
    
    # Notes and interpretation
    theological_notes = Column(Text, nullable=True, comment="Additional theological context or interpretive notes")
    
    # Relationships
    # Many-to-many relationship with CelestialSigns through ProphecySignLinks
    celestial_signs = relationship(
        "CelestialSigns",
        secondary="prophecy_sign_links",
        back_populates="prophecies"
    )
    
    # Table-level constraints and indexes
    __table_args__ = (
        Index('idx_prophecy_category', 'prophecy_category'),
        Index('idx_prophecy_order', 'chronological_order'),
        CheckConstraint(
            "prophecy_category IN ('SEAL_JUDGMENT', 'TRUMPET_JUDGMENT', 'BOWL_JUDGMENT', "
            "'DAY_OF_LORD', 'SECOND_COMING', 'TRIBULATION', 'MILLENNIAL_REIGN', "
            "'COSMIC_DISTURBANCE', 'OTHER')",
            name='ck_prophecy_category'
        ),
        {'comment': 'Biblical prophecies with scripture references and theological categorization'}
    )
    
    def __repr__(self):
        return f"<Prophecies(id={self.id}, event_name='{self.event_name}', reference='{self.scripture_reference}')>"


class CelestialSigns(Base):
    """
    Celestial signs with theological interpretations.
    
    Represents prophetic signs that can be correlated with astronomical/geophysical events:
    - Great Earthquake
    - Sun Darkened
    - Moon to Blood
    - Stars Falling from Heaven
    - Heavens Rolled Up Like Scroll
    - Wormwood Star
    - Third of Sun Struck
    
    Each sign includes theological interpretation and multiple scripture references.
    """
    __tablename__ = "celestial_signs"
    
    # Primary key - SERIAL for reference data
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Core identification
    sign_name = Column(
        String(255), 
        nullable=False, 
        unique=True,
        comment="Unique name of the celestial sign (e.g., 'Great Earthquake', 'Blood Moon')"
    )
    
    # Description and interpretation
    sign_description = Column(
        Text, 
        nullable=False,
        comment="Physical description of the sign as recorded in scripture"
    )
    
    theological_interpretation = Column(
        Text, 
        nullable=False,
        comment="Theological meaning and significance of the sign"
    )
    
    # Scripture references
    primary_scripture = Column(
        String(255), 
        nullable=False,
        comment="Main scripture reference for this sign (e.g., 'Revelation 6:12')"
    )
    
    related_scriptures = Column(
        ARRAY(String), 
        nullable=True,
        comment="Array of additional scripture references that mention this sign"
    )
    
    # Categorization
    sign_type = Column(
        String(100),
        nullable=True,
        comment="Type: COSMIC, TERRESTRIAL, ATMOSPHERIC, SOLAR, LUNAR, STELLAR, SEISMIC, VOLCANIC"
    )
    
    # Relationships
    # Many-to-many relationship with Prophecies through ProphecySignLinks
    prophecies = relationship(
        "Prophecies",
        secondary="prophecy_sign_links",
        back_populates="celestial_signs"
    )
    
    # One-to-many relationship with DataTriggers (from alerts.py)
    data_triggers = relationship("DataTriggers", back_populates="celestial_sign", cascade="all, delete")
    
    # Table-level constraints and indexes
    __table_args__ = (
        Index('idx_sign_name', 'sign_name'),
        Index('idx_sign_type', 'sign_type'),
        CheckConstraint(
            "sign_type IN ('COSMIC', 'TERRESTRIAL', 'ATMOSPHERIC', 'SOLAR', 'LUNAR', "
            "'STELLAR', 'SEISMIC', 'VOLCANIC', 'COMBINED', 'OTHER') OR sign_type IS NULL",
            name='ck_sign_type'
        ),
        {'comment': 'Celestial signs with theological interpretations and scripture references'}
    )
    
    def __repr__(self):
        return f"<CelestialSigns(id={self.id}, sign_name='{self.sign_name}', type='{self.sign_type}')>"


class ProphecySignLinks(Base):
    """
    Many-to-many junction table linking prophecies to celestial signs.
    
    Allows a single prophecy to be associated with multiple signs, and a single sign
    to appear in multiple prophecies. For example:
    - Sixth Seal Judgment → Great Earthquake, Sun Darkened, Moon to Blood, Stars Falling
    - Great Earthquake → Multiple prophecies across Revelation, Isaiah, Zechariah
    
    ON DELETE CASCADE ensures that when a prophecy or sign is deleted, the links
    are automatically removed to maintain referential integrity.
    """
    __tablename__ = "prophecy_sign_links"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign keys with CASCADE delete
    prophecy_id = Column(
        Integer,
        ForeignKey('prophecies.id', ondelete='CASCADE'),
        nullable=False,
        comment="Reference to prophecies table"
    )
    
    sign_id = Column(
        Integer,
        ForeignKey('celestial_signs.id', ondelete='CASCADE'),
        nullable=False,
        comment="Reference to celestial_signs table"
    )
    
    # Optional contextual information
    link_notes = Column(
        Text,
        nullable=True,
        comment="Optional notes about this specific prophecy-sign relationship"
    )
    
    # Table-level constraints and indexes
    __table_args__ = (
        UniqueConstraint('prophecy_id', 'sign_id', name='uq_prophecy_sign'),
        Index('idx_prop_sign_prophecy', 'prophecy_id'),
        Index('idx_prop_sign_sign', 'sign_id'),
        {'comment': 'Many-to-many junction table linking prophecies to celestial signs'}
    )
    
    def __repr__(self):
        return f"<ProphecySignLinks(id={self.id}, prophecy_id={self.prophecy_id}, sign_id={self.sign_id})>"


class FeastDay(Base):
    """
    Jewish biblical feast days calculated from Hebrew calendar.
    
    Stores the seven major biblical feasts (Moedim - appointed times):
    Spring Feasts:
    - Passover (Pesach) - Nisan 14
    - Unleavened Bread - Nisan 15-21
    - Pentecost (Shavuot) - 50 days after Passover
    
    Fall Feasts:
    - Feast of Trumpets (Rosh Hashanah) - Tishrei 1
    - Day of Atonement (Yom Kippur) - Tishrei 10
    - Feast of Tabernacles (Sukkot) - Tishrei 15-21
    
    Used for correlating celestial events (especially blood moons) with feast days.
    """
    __tablename__ = "feast_days"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Feast identification
    feast_type = Column(
        String(50),
        nullable=False,
        comment="Feast identifier: passover, unleavened_bread, pentecost, trumpets, atonement, tabernacles"
    )
    
    name = Column(
        String(255),
        nullable=False,
        comment="Full name of the feast (e.g., 'Passover (Pesach)', 'Day of Atonement (Yom Kippur)')"
    )
    
    # Hebrew calendar date
    hebrew_date = Column(
        String(100),
        nullable=False,
        comment="Hebrew calendar date (e.g., 'Nisan 14', 'Tishrei 1', 'Tishrei 15-21')"
    )
    
    # Gregorian calendar date
    gregorian_date = Column(
        Date,
        nullable=False,
        index=True,
        comment="Gregorian calendar date (or start date for multi-day feasts)"
    )
    
    gregorian_year = Column(
        Integer,
        nullable=False,
        index=True,
        comment="Gregorian year for easy querying"
    )
    
    # For multi-day feasts (Unleavened Bread, Tabernacles)
    end_date = Column(
        Date,
        nullable=True,
        comment="End date for multi-day feasts (null for single-day feasts)"
    )
    
    is_range = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="True if feast spans multiple days"
    )
    
    # Description and significance
    significance = Column(
        Text,
        nullable=True,
        comment="Biblical and theological significance of the feast"
    )
    
    # Data source tracking
    data_source = Column(
        String(100),
        default="hebrew_calendar_module",
        comment="Source of calculation (e.g., 'hebrew_calendar_module', 'manual_entry')"
    )
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Table-level constraints and indexes
    __table_args__ = (
        Index('idx_feast_type_year', 'feast_type', 'gregorian_year'),
        Index('idx_feast_date', 'gregorian_date'),
        UniqueConstraint('feast_type', 'gregorian_year', name='uq_feast_type_year'),
        CheckConstraint(
            "feast_type IN ('passover', 'unleavened_bread', 'pentecost', 'trumpets', 'atonement', 'tabernacles')",
            name='ck_feast_type'
        ),
        {'comment': 'Jewish biblical feast days calculated from Hebrew calendar'}
    )
    
    def __repr__(self):
        date_str = f"{self.gregorian_date}" if not self.is_range else f"{self.gregorian_date} to {self.end_date}"
        return f"<FeastDay(id={self.id}, name='{self.name}', date={date_str})>"
