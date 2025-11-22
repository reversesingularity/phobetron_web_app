"""
Seed theological data with biblical prophecies and celestial signs.

Populates the database with:
- Major prophecies from Revelation, Isaiah, Joel, Zechariah
- Celestial signs (earthquakes, blood moons, darkened sun, falling stars, etc.)
- Relationships between prophecies and signs
"""
from sqlalchemy.orm import Session
from app.db.session import engine
from app.models.theological import Prophecies, CelestialSigns, ProphecySignLinks


def create_celestial_signs(db: Session):
    """Create celestial sign records."""
    signs = [
        CelestialSigns(
            sign_name="Great Earthquake",
            sign_description="A massive seismic event of unprecedented magnitude causing global devastation",
            theological_interpretation=(
                "Represents divine judgment and the shaking of earthly powers. "
                "Often precedes major prophetic fulfillments and signifies God's direct intervention. "
                "Symbolizes the overthrow of kingdoms and the instability of human systems before divine authority."
            ),
            primary_scripture="Revelation 6:12",
            related_scriptures=[
                "Revelation 11:13",
                "Revelation 16:18",
                "Isaiah 13:13",
                "Haggai 2:6-7",
                "Zechariah 14:4-5",
                "Ezekiel 38:19-20"
            ],
            sign_type="SEISMIC"
        ),
        CelestialSigns(
            sign_name="Sun Darkened",
            sign_description="The sun becomes black and ceases to give light",
            theological_interpretation=(
                "A cosmic sign of the Day of the Lord and divine judgment. "
                "Represents the withdrawal of God's favor and the darkening of human understanding. "
                "Often associated with the tribulation period and God's wrath upon the earth."
            ),
            primary_scripture="Joel 2:31",
            related_scriptures=[
                "Revelation 6:12",
                "Isaiah 13:10",
                "Amos 8:9",
                "Matthew 24:29",
                "Mark 13:24",
                "Acts 2:20"
            ],
            sign_type="SOLAR"
        ),
        CelestialSigns(
            sign_name="Moon to Blood",
            sign_description="The moon appears blood red in color",
            theological_interpretation=(
                "A celestial sign preceding the Day of the Lord, often linked to blood moons and lunar eclipses. "
                "Symbolizes judgment, warfare, and the shedding of blood. "
                "Historically associated with significant events affecting Israel and the nations."
            ),
            primary_scripture="Joel 2:31",
            related_scriptures=[
                "Revelation 6:12",
                "Acts 2:20",
                "Isaiah 13:10"
            ],
            sign_type="LUNAR"
        ),
        CelestialSigns(
            sign_name="Stars Falling from Heaven",
            sign_description="Stars fall to earth like figs from a fig tree shaken by wind",
            theological_interpretation=(
                "Represents the fall of angelic powers and earthly authorities. "
                "May symbolize meteor showers, comets, or the casting down of spiritual beings. "
                "Indicates cosmic upheaval and the dismantling of established orders."
            ),
            primary_scripture="Revelation 6:13",
            related_scriptures=[
                "Matthew 24:29",
                "Mark 13:25",
                "Isaiah 34:4",
                "Daniel 8:10"
            ],
            sign_type="STELLAR"
        ),
        CelestialSigns(
            sign_name="Heavens Rolled Up Like Scroll",
            sign_description="The sky recedes and rolls up like a scroll being wound",
            theological_interpretation=(
                "Represents the dissolution of the current heavens and the transformation of cosmic order. "
                "Symbolizes the end of the present age and preparation for new heavens and new earth. "
                "Indicates the finality of God's judgment and the transition to eternal states."
            ),
            primary_scripture="Revelation 6:14",
            related_scriptures=[
                "Isaiah 34:4",
                "Hebrews 1:10-12",
                "2 Peter 3:10-12"
            ],
            sign_type="COSMIC"
        ),
        CelestialSigns(
            sign_name="Mountains and Islands Moved",
            sign_description="Every mountain and island removed from its place",
            theological_interpretation=(
                "Symbolizes complete geographical upheaval and the removal of what was thought permanent. "
                "Represents God's power over creation and the instability of earthly foundations. "
                "May indicate massive tectonic activity during the tribulation period."
            ),
            primary_scripture="Revelation 6:14",
            related_scriptures=[
                "Revelation 16:20",
                "Isaiah 40:4",
                "Zechariah 14:10"
            ],
            sign_type="TERRESTRIAL"
        ),
        CelestialSigns(
            sign_name="Wormwood Star",
            sign_description="A great star falls from heaven, blazing like a torch, making waters bitter",
            theological_interpretation=(
                "A celestial object (comet or asteroid) that contaminates water sources. "
                "Symbolizes divine judgment through cosmic impacts and environmental catastrophe. "
                "The name 'Wormwood' suggests bitterness and poison, bringing death to many."
            ),
            primary_scripture="Revelation 8:10-11",
            related_scriptures=[
                "Jeremiah 9:15",
                "Jeremiah 23:15",
                "Amos 5:7"
            ],
            sign_type="STELLAR"
        ),
        CelestialSigns(
            sign_name="Third of Sun Struck",
            sign_description="A third of the sun, moon, and stars darkened",
            theological_interpretation=(
                "Partial darkening of celestial luminaries, reducing light by one-third. "
                "May represent atmospheric darkening from volcanic ash, meteor impacts, or supernatural dimming. "
                "Symbolizes partial judgment with worse to come."
            ),
            primary_scripture="Revelation 8:12",
            related_scriptures=[
                "Exodus 10:21-23",
                "Isaiah 13:10"
            ],
            sign_type="COMBINED"
        ),
        CelestialSigns(
            sign_name="Total Eclipse of Sun and Moon",
            sign_description="Both sun and moon cease to give light simultaneously",
            theological_interpretation=(
                "Complete darkness over the earth, a supernatural sign of God's judgment. "
                "Represents the end of natural order and the beginning of divine intervention. "
                "Associated with the Day of the Lord and Christ's second coming."
            ),
            primary_scripture="Matthew 24:29",
            related_scriptures=[
                "Joel 2:10",
                "Joel 3:15",
                "Amos 8:9"
            ],
            sign_type="COMBINED"
        ),
        CelestialSigns(
            sign_name="Great Hailstorm",
            sign_description="Enormous hailstones weighing about 100 pounds each fall from heaven",
            theological_interpretation=(
                "Divine judgment through atmospheric phenomena of unprecedented scale. "
                "Recalls the seventh plague of Egypt and represents God's wrath in physical form. "
                "Symbolizes the destructive power of God's judgment."
            ),
            primary_scripture="Revelation 16:21",
            related_scriptures=[
                "Exodus 9:23-25",
                "Joshua 10:11",
                "Isaiah 28:2",
                "Ezekiel 13:11"
            ],
            sign_type="ATMOSPHERIC"
        ),
    ]
    
    db.add_all(signs)
    db.commit()
    print(f"✓ Created {len(signs)} celestial signs")
    return {sign.sign_name: sign for sign in signs}


def create_prophecies(db: Session, signs: dict):
    """Create prophecy records and link them to signs."""
    
    # Sixth Seal Judgment
    sixth_seal = Prophecies(
        event_name="Sixth Seal Judgment",
        scripture_reference="Revelation 6:12-17",
        scripture_text=(
            "I watched as he opened the sixth seal. There was a great earthquake. "
            "The sun turned black like sackcloth made of goat hair, the whole moon "
            "turned blood red, and the stars in the sky fell to earth, as figs drop "
            "from a fig tree when shaken by a strong wind. The heavens receded like "
            "a scroll being rolled up, and every mountain and island was removed from its place. "
            "Then the kings of the earth, the princes, the generals, the rich, the mighty, "
            "and everyone else, both slave and free, hid in caves and among the rocks of the mountains. "
            "They called to the mountains and the rocks, 'Fall on us and hide us from the face "
            "of him who sits on the throne and from the wrath of the Lamb! For the great day "
            "of their wrath has come, and who can withstand it?'"
        ),
        event_description=(
            "The sixth seal brings cosmic catastrophes: a great earthquake, "
            "solar and lunar darkening, stars falling, sky receding like a scroll, "
            "and massive geographical upheaval. Human authorities flee in terror, "
            "recognizing this as divine judgment."
        ),
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=6,
        theological_notes=(
            "This seal represents the penultimate judgment before the seventh seal. "
            "It combines terrestrial and celestial signs, showing God's sovereignty over "
            "both earth and heaven. The reaction of earth's inhabitants shows universal "
            "recognition of divine wrath."
        )
    )
    db.add(sixth_seal)
    db.commit()
    
    # Link to multiple signs
    sixth_seal.celestial_signs.extend([
        signs["Great Earthquake"],
        signs["Sun Darkened"],
        signs["Moon to Blood"],
        signs["Stars Falling from Heaven"],
        signs["Heavens Rolled Up Like Scroll"],
        signs["Mountains and Islands Moved"]
    ])
    db.commit()
    print(f"✓ Created Sixth Seal Judgment with 6 linked signs")
    
    # Day of the Lord Prophecy (Joel)
    day_of_lord = Prophecies(
        event_name="The Day of the Lord",
        scripture_reference="Joel 2:30-31",
        scripture_text=(
            "I will show wonders in the heavens and on the earth, blood and fire and billows of smoke. "
            "The sun will be turned to darkness and the moon to blood before the coming of the great "
            "and dreadful day of the LORD."
        ),
        event_description=(
            "Celestial signs preceding the Day of the Lord: wonders in heaven and earth, "
            "blood, fire, smoke pillars, sun darkened, and moon turned to blood."
        ),
        prophecy_category="DAY_OF_LORD",
        theological_notes=(
            "Peter quotes this passage in Acts 2:19-20, applying it to the last days. "
            "These signs serve as warnings before God's final judgment."
        )
    )
    db.add(day_of_lord)
    db.commit()
    
    day_of_lord.celestial_signs.extend([
        signs["Sun Darkened"],
        signs["Moon to Blood"]
    ])
    db.commit()
    print(f"✓ Created Day of the Lord prophecy with 2 linked signs")
    
    # Second Trumpet Judgment
    second_trumpet = Prophecies(
        event_name="Second Trumpet - Mountain Thrown into Sea",
        scripture_reference="Revelation 8:8-9",
        scripture_text=(
            "The second angel sounded his trumpet, and something like a huge mountain, "
            "all ablaze, was thrown into the sea. A third of the sea turned into blood, "
            "a third of the living creatures in the sea died, and a third of the ships were destroyed."
        ),
        event_description=(
            "A massive burning object like a mountain is cast into the sea, "
            "causing catastrophic marine devastation: water turns to blood, "
            "one-third of sea life dies, one-third of ships destroyed."
        ),
        prophecy_category="TRUMPET_JUDGMENT",
        chronological_order=2,
        theological_notes=(
            "This may represent a large asteroid or volcanic island impact in the ocean. "
            "The 'one-third' pattern repeats throughout the trumpet judgments, "
            "showing progressive intensification of divine wrath."
        )
    )
    db.add(second_trumpet)
    db.commit()
    print(f"✓ Created Second Trumpet Judgment")
    
    # Third Trumpet - Wormwood
    third_trumpet = Prophecies(
        event_name="Third Trumpet - Wormwood Star Falls",
        scripture_reference="Revelation 8:10-11",
        scripture_text=(
            "The third angel sounded his trumpet, and a great star, blazing like a torch, "
            "fell from the sky on a third of the rivers and on the springs of water— "
            "the name of the star is Wormwood. A third of the waters turned bitter, "
            "and many people died from the waters that had become bitter."
        ),
        event_description=(
            "A great star called Wormwood falls from heaven, contaminating freshwater sources. "
            "One-third of rivers and springs become bitter poison, causing mass casualties."
        ),
        prophecy_category="TRUMPET_JUDGMENT",
        chronological_order=3,
        theological_notes=(
            "Wormwood (Artemisia absinthium) is a bitter plant used biblically to symbolize "
            "calamity and sorrow. This trumpet may represent a comet or asteroid fragmenting "
            "over land, dispersing toxic material into water supplies."
        )
    )
    db.add(third_trumpet)
    db.commit()
    
    third_trumpet.celestial_signs.append(signs["Wormwood Star"])
    db.commit()
    print(f"✓ Created Third Trumpet Judgment linked to Wormwood Star")
    
    # Fourth Trumpet
    fourth_trumpet = Prophecies(
        event_name="Fourth Trumpet - Celestial Darkening",
        scripture_reference="Revelation 8:12",
        scripture_text=(
            "The fourth angel sounded his trumpet, and a third of the sun was struck, "
            "a third of the moon, and a third of the stars, so that a third of them "
            "turned dark. A third of the day was without light, and also a third of the night."
        ),
        event_description=(
            "Partial darkening of all celestial luminaries: sun, moon, and stars lose "
            "one-third of their brightness. Daytime and nighttime are both affected."
        ),
        prophecy_category="TRUMPET_JUDGMENT",
        chronological_order=4,
        theological_notes=(
            "This darkening may result from atmospheric contamination from previous trumpet "
            "judgments (volcanic ash, meteor debris, smoke from fires). It foreshadows the "
            "complete darkness to come in later judgments."
        )
    )
    db.add(fourth_trumpet)
    db.commit()
    
    fourth_trumpet.celestial_signs.append(signs["Third of Sun Struck"])
    db.commit()
    print(f"✓ Created Fourth Trumpet Judgment")
    
    # Seventh Bowl - Greatest Earthquake
    seventh_bowl = Prophecies(
        event_name="Seventh Bowl - The Greatest Earthquake",
        scripture_reference="Revelation 16:17-21",
        scripture_text=(
            "The seventh angel poured out his bowl into the air, and out of the temple "
            "came a loud voice from the throne, saying, 'It is done!' Then there came "
            "flashes of lightning, rumblings, peals of thunder and a severe earthquake. "
            "No earthquake like it has ever occurred since mankind has been on earth, "
            "so tremendous was the quake. The great city split into three parts, and "
            "the cities of the nations collapsed. God remembered Babylon the Great and "
            "gave her the cup filled with the wine of the fury of his wrath. Every island "
            "fled away and the mountains could not be found. From the sky huge hailstones, "
            "each weighing about a hundred pounds, fell on people."
        ),
        event_description=(
            "The greatest earthquake in human history splits Jerusalem, collapses cities worldwide, "
            "causes islands to disappear, levels mountains, and is accompanied by 100-pound hailstones."
        ),
        prophecy_category="BOWL_JUDGMENT",
        chronological_order=7,
        theological_notes=(
            "This is the culmination of God's wrath in the tribulation period. "
            "The phrase 'It is done' echoes Christ's words on the cross, showing completion of judgment. "
            "The earthquake's unprecedented magnitude suggests massive tectonic shifts worldwide."
        )
    )
    db.add(seventh_bowl)
    db.commit()
    
    seventh_bowl.celestial_signs.extend([
        signs["Great Earthquake"],
        signs["Mountains and Islands Moved"],
        signs["Great Hailstorm"]
    ])
    db.commit()
    print(f"✓ Created Seventh Bowl Judgment with 3 linked signs")
    
    # Olivet Discourse
    olivet_discourse = Prophecies(
        event_name="Signs of Christ's Return",
        scripture_reference="Matthew 24:29-30",
        scripture_text=(
            "Immediately after the distress of those days 'the sun will be darkened, "
            "and the moon will not give its light; the stars will fall from the sky, "
            "and the heavenly bodies will be shaken.' Then will appear the sign of the "
            "Son of Man in heaven. And then all the peoples of the earth will mourn when "
            "they see the Son of Man coming on the clouds of heaven, with power and great glory."
        ),
        event_description=(
            "Cosmic signs immediately before Christ's visible return: solar darkening, "
            "lunar darkening, stars falling, heavens shaken, followed by the sign of the Son of Man."
        ),
        prophecy_category="SECOND_COMING",
        theological_notes=(
            "Jesus' own prophecy in the Olivet Discourse. These signs precede His second coming "
            "and are visible to all peoples of earth. They fulfill Old Testament prophecies "
            "from Joel, Isaiah, and others."
        )
    )
    db.add(olivet_discourse)
    db.commit()
    
    olivet_discourse.celestial_signs.extend([
        signs["Sun Darkened"],
        signs["Total Eclipse of Sun and Moon"],
        signs["Stars Falling from Heaven"]
    ])
    db.commit()
    print(f"✓ Created Olivet Discourse prophecy with 3 linked signs")
    
    print(f"\n✅ Created 7 prophecies with multiple sign relationships")


def main():
    """Seed theological data."""
    print("=== Seeding Theological Data ===\n")
    
    with Session(engine) as db:
        # Create celestial signs first (no dependencies)
        signs = create_celestial_signs(db)
        
        # Create prophecies and link to signs
        create_prophecies(db, signs)
    
    print("\n=== Seed Complete ===")
    print("Database now contains:")
    print("  - 10 celestial signs")
    print("  - 7 prophecies")
    print("  - Multiple prophecy-sign relationships")
    print("\nYou can now query these records to see the relationships!")


if __name__ == "__main__":
    main()
