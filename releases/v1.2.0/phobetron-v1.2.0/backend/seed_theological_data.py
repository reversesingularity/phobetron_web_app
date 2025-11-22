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
    """Create comprehensive prophecy records from canonical, apocryphal, and pseudepigraphal books."""
    print("\nCreating Comprehensive Prophecies...")

    # ========== CANONICAL BOOKS ==========

    # REVELATION PROPHECIES

    # First Seal - White Horse
    first_seal = Prophecies(
        event_name="First Seal - White Horse of Conquest",
        scripture_reference="Revelation 6:1-2",
        scripture_text=(
            "I watched as the Lamb opened the first of the seven seals. Then I heard one of "
            "the four living creatures say in a voice like thunder, 'Come!' I looked, and there "
            "before me was a white horse! Its rider held a bow, and he was given a crown, and he "
            "rode out as a conqueror bent on conquest."
        ),
        event_description=(
            "The opening of the first seal reveals a rider on a white horse, symbolizing conquest "
            "and the beginning of tribulation judgments."
        ),
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=1,
        theological_notes=(
            "Represents the rise of the Antichrist or a spirit of conquest that initiates end-times events. "
            "The white color may imitate Christ's white horse (Rev 19:11) in deception."
        )
    )
    db.add(first_seal)
    db.commit()
    print(f"✓ Created First Seal Judgment")

    # Second Seal - Red Horse
    second_seal = Prophecies(
        event_name="Second Seal - Red Horse of War",
        scripture_reference="Revelation 6:3-4",
        scripture_text=(
            "When the Lamb opened the second seal, I heard the second living creature say, 'Come!' "
            "Then another horse came out, a fiery red one. Its rider was given power to take peace "
            "from the earth and to make people kill each other. To him was given a large sword."
        ),
        event_description=(
            "The second seal brings worldwide warfare, with peace removed from the earth and "
            "mass violence breaking out among humanity."
        ),
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=2,
        theological_notes=(
            "Represents global warfare and civil unrest. The removal of peace indicates divine judgment "
            "allowing humanity's violent nature to manifest unchecked."
        )
    )
    db.add(second_seal)
    db.commit()
    print(f"✓ Created Second Seal Judgment")

    # Third Seal - Black Horse
    third_seal = Prophecies(
        event_name="Third Seal - Black Horse of Famine",
        scripture_reference="Revelation 6:5-6",
        scripture_text=(
            "When the Lamb opened the third seal, I heard the third living creature say, 'Come!' "
            "I looked, and there before me was a black horse! Its rider was holding a pair of scales "
            "in his hand. Then I heard what sounded like a voice among the four living creatures, saying, "
            "'Two pounds of wheat for a day's wages, and six pounds of barley for a day's wages, and do not damage the oil and the wine!'"
        ),
        event_description=(
            "Economic collapse and famine, with food prices inflated to the point where a day's wages "
            "buys only enough grain for survival."
        ),
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=3,
        theological_notes=(
            "Represents economic devastation and food scarcity, likely resulting from warfare. "
            "The protection of oil and wine suggests unequal distribution of resources."
        )
    )
    db.add(third_seal)
    db.commit()
    print(f"✓ Created Third Seal Judgment")

    # Fourth Seal - Pale Horse
    fourth_seal = Prophecies(
        event_name="Fourth Seal - Pale Horse of Death",
        scripture_reference="Revelation 6:7-8",
        scripture_text=(
            "When the Lamb opened the fourth seal, I heard the voice of the fourth living creature say, 'Come!' "
            "I looked, and there before me was a pale horse! Its rider was named Death, and Hades was following "
            "close behind him. They were given power over a fourth of the earth to kill by sword, famine and plague, "
            "and by the wild beasts of the earth."
        ),
        event_description=(
            "Death and Hades are given authority to kill one-fourth of earth's population through war, "
            "famine, disease, and wild animals."
        ),
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=4,
        theological_notes=(
            "Represents mass casualties from cumulative effects of previous seals plus pestilence. "
            "If applied to current population, this would be approximately 2 billion deaths."
        )
    )
    db.add(fourth_seal)
    db.commit()
    print(f"✓ Created Fourth Seal Judgment")

    # Fifth Seal - Martyrs
    fifth_seal = Prophecies(
        event_name="Fifth Seal - Souls of Martyrs",
        scripture_reference="Revelation 6:9-11",
        scripture_text=(
            "When he opened the fifth seal, I saw under the altar the souls of those who had been slain "
            "because of the word of God and the testimony they had maintained. They called out in a loud voice, "
            "'How long, Sovereign Lord, holy and true, until you judge the inhabitants of the earth and avenge our blood?' "
            "Then each of them was given a white robe, and they were told to wait a little longer, until the full number "
            "of their fellow servants, their brothers and sisters, were killed just as they had been."
        ),
        event_description=(
            "Martyred believers cry out for justice from beneath the heavenly altar, told to wait until "
            "the full number of martyrs is complete."
        ),
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=5,
        theological_notes=(
            "Reveals severe persecution of believers during tribulation. Their cry 'How long?' echoes throughout "
            "prophetic literature, expressing the longing for divine justice."
        )
    )
    db.add(fifth_seal)
    db.commit()
    print(f"✓ Created Fifth Seal Judgment")

    # Sixth Seal Judgment (Revelation 6:12-17)
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

    # Seventh Seal - Silence in Heaven
    seventh_seal = Prophecies(
        event_name="Seventh Seal - Silence in Heaven",
        scripture_reference="Revelation 8:1",
        scripture_text=(
            "When he opened the seventh seal, there was silence in heaven for about half an hour."
        ),
        event_description=(
            "The opening of the seventh seal brings profound silence in heaven for half an hour, "
            "followed by the trumpet judgments."
        ),
        prophecy_category="SEAL_JUDGMENT",
        chronological_order=7,
        theological_notes=(
            "The silence represents solemn anticipation of the final judgments. "
            "This brief pause emphasizes the gravity of what is about to unfold."
        )
    )
    db.add(seventh_seal)
    db.commit()
    print(f"✓ Created Seventh Seal Judgment")

    # First Trumpet - Hail and Fire
    first_trumpet = Prophecies(
        event_name="First Trumpet - Hail and Fire Mixed with Blood",
        scripture_reference="Revelation 8:7",
        scripture_text=(
            "The first angel sounded his trumpet, and there came hail and fire mixed with blood, "
            "and it was hurled down on the earth. A third of the earth was burned up, a third of the trees "
            "were burned up, and all the green grass was burned up."
        ),
        event_description=(
            "The first trumpet brings fiery hail that destroys one-third of earth's vegetation "
            "and burns up one-third of the land."
        ),
        prophecy_category="TRUMPET_JUDGMENT",
        chronological_order=1,
        theological_notes=(
            "Represents atmospheric phenomena, possibly volcanic activity or meteor impacts. "
            "The 'one-third' pattern begins, showing progressive intensification."
        )
    )
    db.add(first_trumpet)
    db.commit()
    print(f"✓ Created First Trumpet Judgment")

    # Second Trumpet - Mountain Thrown into Sea
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

    # Fourth Trumpet - Celestial Darkening
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

    # Fifth Trumpet - Abyss Opened
    fifth_trumpet = Prophecies(
        event_name="Fifth Trumpet - Abyss Opened",
        scripture_reference="Revelation 9:1-12",
        scripture_text=(
            "The fifth angel sounded his trumpet, and I saw a star that had fallen from the sky to the earth. "
            "The star was given the key to the shaft of the Abyss. When he opened the Abyss, smoke rose from it "
            "like the smoke from a gigantic furnace. The sun and sky were darkened by the smoke from the Abyss. "
            "And out of the smoke locusts came down on the earth and were given power like that of scorpions of the earth."
        ),
        event_description=(
            "A fallen star opens the Abyss, releasing demonic locusts that torment humanity "
            "for five months with scorpion-like stings."
        ),
        prophecy_category="TRUMPET_JUDGMENT",
        chronological_order=5,
        theological_notes=(
            "Represents demonic activity released from the underworld. The locusts are supernatural "
            "beings, not literal insects, given power to torment but not kill unbelievers."
        )
    )
    db.add(fifth_trumpet)
    db.commit()
    print(f"✓ Created Fifth Trumpet Judgment")

    # Sixth Trumpet - Four Angels Released
    sixth_trumpet = Prophecies(
        event_name="Sixth Trumpet - Four Angels Released",
        scripture_reference="Revelation 9:13-21",
        scripture_text=(
            "The sixth angel sounded his trumpet, and I heard a voice coming from the four horns of the golden altar "
            "that is before God. It said to the sixth angel who had the trumpet, 'Release the four angels who are bound "
            "at the great river Euphrates.' And the four angels who had been kept ready for this very hour and day and "
            "month and year were released to kill a third of mankind."
        ),
        event_description=(
            "Four angels bound at the Euphrates are released, leading to an army of 200 million "
            "that kills one-third of humanity."
        ),
        prophecy_category="TRUMPET_JUDGMENT",
        chronological_order=6,
        theological_notes=(
            "Represents massive military conflict, possibly involving nations from the ancient "
            "kingdoms around the Euphrates (Persia, Babylon, etc.). The scale suggests supernatural "
            "amplification of natural military forces."
        )
    )
    db.add(sixth_trumpet)
    db.commit()
    print(f"✓ Created Sixth Trumpet Judgment")

    # Seventh Trumpet - Kingdom Proclaimed
    seventh_trumpet = Prophecies(
        event_name="Seventh Trumpet - Kingdom of the World",
        scripture_reference="Revelation 11:15-19",
        scripture_text=(
            "The seventh angel sounded his trumpet, and there were loud voices in heaven, which said: "
            "'The kingdom of the world has become the kingdom of our Lord and of his Messiah, and he will reign for ever and ever.' "
            "And the twenty-four elders, who were seated on their thrones before God, fell on their faces and worshiped God, saying: "
            "'We give thanks to you, Lord God Almighty, the One who is and who was, because you have taken your great power and have begun to reign.'"
        ),
        event_description=(
            "The seventh trumpet announces the establishment of God's eternal kingdom and the beginning "
            "of His reign, accompanied by cosmic disturbances."
        ),
        prophecy_category="TRUMPET_JUDGMENT",
        chronological_order=7,
        theological_notes=(
            "This trumpet transitions from judgment to kingdom establishment. The announcement "
            "'The kingdom of the world has become the kingdom of our Lord' fulfills the Lord's Prayer "
            "and marks the end of human rebellion."
        )
    )
    db.add(seventh_trumpet)
    db.commit()
    print(f"✓ Created Seventh Trumpet Judgment")

    # First Bowl - Painful Sores
    first_bowl = Prophecies(
        event_name="First Bowl - Painful Sores",
        scripture_reference="Revelation 16:2",
        scripture_text=(
            "The first angel went and poured out his bowl on the land, and ugly, festering sores "
            "broke out on the people who had the mark of the beast and who worshiped its image."
        ),
        event_description=(
            "The first bowl brings painful, festering sores on those who bear the mark of the beast "
            "and worship the Antichrist."
        ),
        prophecy_category="BOWL_JUDGMENT",
        chronological_order=1,
        theological_notes=(
            "Represents divine judgment specifically targeting Antichrist worshipers. "
            "Similar to the sixth plague of Egypt (Exodus 9:8-12)."
        )
    )
    db.add(first_bowl)
    db.commit()
    print(f"✓ Created First Bowl Judgment")

    # Second Bowl - Sea to Blood
    second_bowl = Prophecies(
        event_name="Second Bowl - Sea Turns to Blood",
        scripture_reference="Revelation 16:3",
        scripture_text=(
            "The second angel poured out his bowl on the sea, and it turned into blood like that of a dead person, "
            "and every living thing in the sea died."
        ),
        event_description=(
            "The second bowl turns the entire sea into blood, killing all marine life."
        ),
        prophecy_category="BOWL_JUDGMENT",
        chronological_order=2,
        theological_notes=(
            "Similar to the first plague of Egypt (Exodus 7:20-21). Represents complete contamination "
            "of the oceans, affecting the entire marine ecosystem."
        )
    )
    db.add(second_bowl)
    db.commit()
    print(f"✓ Created Second Bowl Judgment")

    # Third Bowl - Rivers to Blood
    third_bowl = Prophecies(
        event_name="Third Bowl - Rivers Turn to Blood",
        scripture_reference="Revelation 16:4-7",
        scripture_text=(
            "The third angel poured out his bowl on the rivers and springs of water, and they became blood. "
            "Then I heard the angel in charge of the waters say: 'You are just in these judgments, O Holy One, "
            "you who are and who were; for they have shed the blood of your holy people and your prophets, "
            "and you have given them blood to drink as they deserve.' And I heard the altar respond: "
            "'Yes, Lord God Almighty, true and just are your judgments.'"
        ),
        event_description=(
            "Freshwater sources turn to blood, with angelic affirmation that this judgment is just "
            "retribution for the blood of saints and prophets."
        ),
        prophecy_category="BOWL_JUDGMENT",
        chronological_order=3,
        theological_notes=(
            "Divine justice is explicitly declared. The bowls intensify the trumpet judgments, "
            "showing no mercy or restraint in the final phase."
        )
    )
    db.add(third_bowl)
    db.commit()
    print(f"✓ Created Third Bowl Judgment")

    # Fourth Bowl - Scorching Heat
    fourth_bowl = Prophecies(
        event_name="Fourth Bowl - Scorching Heat from Sun",
        scripture_reference="Revelation 16:8-9",
        scripture_text=(
            "The fourth angel poured out his bowl on the sun, and the sun was allowed to scorch people with fire. "
            "They were seared by the intense heat and they cursed the name of God, who had control over these plagues, "
            "but they refused to repent and glorify him."
        ),
        event_description=(
            "The sun's heat is intensified, scorching humanity. People curse God but refuse to repent."
        ),
        prophecy_category="BOWL_JUDGMENT",
        chronological_order=4,
        theological_notes=(
            "Shows the hardening of human hearts even in the face of obvious divine judgment. "
            "Humanity's rebellion reaches its climax."
        )
    )
    db.add(fourth_bowl)
    db.commit()
    print(f"✓ Created Fourth Bowl Judgment")

    # Fifth Bowl - Darkness
    fifth_bowl = Prophecies(
        event_name="Fifth Bowl - Darkness in the Beast's Kingdom",
        scripture_reference="Revelation 16:10-11",
        scripture_text=(
            "The fifth angel poured out his bowl on the throne of the beast, and its kingdom was plunged into darkness. "
            "People gnawed their tongues in agony and cursed the God of heaven because of their pains and their sores, "
            "but they refused to repent of what they had done."
        ),
        event_description=(
            "Darkness covers the Antichrist's kingdom, causing intense pain and suffering, yet no repentance."
        ),
        prophecy_category="BOWL_JUDGMENT",
        chronological_order=5,
        theological_notes=(
            "Similar to the ninth plague of Egypt (Exodus 10:21-23). The darkness is supernatural "
            "and specifically targets the Antichrist's domain."
        )
    )
    db.add(fifth_bowl)
    db.commit()
    print(f"✓ Created Fifth Bowl Judgment")

    # Sixth Bowl - Euphrates Dried Up
    sixth_bowl = Prophecies(
        event_name="Sixth Bowl - Euphrates River Dried Up",
        scripture_reference="Revelation 16:12-16",
        scripture_text=(
            "The sixth angel poured out his bowl on the great river Euphrates, and its water was dried up "
            "to prepare the way for the kings from the East. Then I saw three impure spirits that looked like frogs; "
            "they came out of the mouth of the dragon, out of the mouth of the beast and out of the mouth of the false prophet. "
            "They are demonic spirits that perform signs, and they go out to the kings of the whole world, "
            "to gather them for the battle on the great day of God Almighty."
        ),
        event_description=(
            "The Euphrates dries up, allowing eastern kings to march west. Demonic spirits gather "
            "the world's armies for the battle of Armageddon."
        ),
        prophecy_category="BOWL_JUDGMENT",
        chronological_order=6,
        theological_notes=(
            "Prepares the way for the final battle. The drying of the Euphrates reverses the judgment "
            "of the second trumpet, showing God's complete control over natural forces."
        )
    )
    db.add(sixth_bowl)
    db.commit()
    print(f"✓ Created Sixth Bowl Judgment")

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

    # ========== OLD TESTAMENT PROPHECIES ==========

    # Isaiah 13 - Babylon's Fall
    babylon_fall = Prophecies(
        event_name="Fall of Babylon",
        scripture_reference="Isaiah 13:1-22",
        scripture_text=(
            "See, I will stir up against them the Medes, who do not care for silver and have no delight in gold. "
            "Their bows will strike down the young men; they will have no mercy on infants, nor will they look with compassion on children. "
            "Babylon, the jewel of kingdoms, the pride and glory of the Babylonians, will be overthrown by God like Sodom and Gomorrah."
        ),
        event_description=(
            "Prophecy of Babylon's complete destruction by the Medes, with no mercy shown to any age group."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Babylon represents human pride and rebellion against God. Its fall demonstrates "
            "that no earthly power can withstand divine judgment."
        )
    )
    db.add(babylon_fall)
    db.commit()
    print(f"✓ Created Isaiah 13 - Fall of Babylon")

    # Isaiah 24 - Earth's Devastation
    earth_devastation = Prophecies(
        event_name="Earth Laid Waste",
        scripture_reference="Isaiah 24:1-23",
        scripture_text=(
            "See, the LORD is going to lay waste the earth and devastate it; he will ruin its face and scatter its inhabitants. "
            "The earth will be completely laid waste and totally plundered. The LORD has spoken this word. "
            "The earth dries up and withers, the world languishes and withers, the heavens languish with the earth. "
            "The earth is defiled by its people; they have disobeyed the laws, violated the statutes and broken the everlasting covenant."
        ),
        event_description=(
            "Global devastation where the earth is laid waste, cities emptied, and creation itself suffers "
            "from humanity's rebellion against God."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Shows the cosmic impact of human sin. The earth itself 'mourns' under the weight "
            "of human rebellion, requiring divine intervention."
        )
    )
    db.add(earth_devastation)
    db.commit()
    print(f"✓ Created Isaiah 24 - Earth's Devastation")

    # Jeremiah 25 - Seventy Years
    seventy_years = Prophecies(
        event_name="Seventy Years of Captivity",
        scripture_reference="Jeremiah 25:1-38",
        scripture_text=(
            "This is the word that came to Jeremiah concerning all the people of Judah in the fourth year of Jehoiakim son of Josiah king of Judah, "
            "which was the first year of Nebuchadnezzar king of Babylon. So Jeremiah the prophet said to all the people of Judah and to all those living in Jerusalem: "
            "'For twenty-three years—from the thirteenth year of Josiah son of Amon king of Judah until this very day—the word of the LORD has come to me and I have spoken to you again and again, but you have not listened.'"
        ),
        event_description=(
            "Prophecy of 70 years of Babylonian captivity for Judah as punishment for idolatry and disobedience."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "God's judgment is measured and purposeful. The 70 years correspond to the 70 sabbatical years "
            "that Israel failed to observe (2 Chronicles 36:21)."
        )
    )
    db.add(seventy_years)
    db.commit()
    print(f"✓ Created Jeremiah 25 - Seventy Years")

    # Ezekiel 38-39 - Gog and Magog
    gog_magog = Prophecies(
        event_name="War of Gog and Magog",
        scripture_reference="Ezekiel 38:1-39:29",
        scripture_text=(
            "This is what the Sovereign LORD says: I am against you, Gog, chief prince of Meshek and Tubal. "
            "I will turn you around, put hooks in your jaws and bring you out with your whole army—your horses, your horsemen fully armed, "
            "and a great horde with large and small shields, all of them brandishing their swords. Persia, Cush and Put will be with them, "
            "all with shields and helmets, also Gomer with all its troops, and Beth Togarmah from the far north with all its troops— "
            "the many nations with you."
        ),
        event_description=(
            "Massive coalition led by Gog from the north invades Israel, resulting in divine intervention "
            "and the destruction of the invading forces."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Represents a future invasion of Israel by a northern coalition. God's direct intervention "
            "demonstrates His protection of Israel and sovereignty over nations."
        )
    )
    db.add(gog_magog)
    db.commit()
    print(f"✓ Created Ezekiel 38-39 - Gog and Magog")

    # Daniel 9 - Seventy Weeks
    seventy_weeks = Prophecies(
        event_name="Seventy Weeks Prophecy",
        scripture_reference="Daniel 9:20-27",
        scripture_text=(
            "While I was speaking and praying, confessing my sin and the sin of my people Israel and making my request to the LORD my God "
            "for his holy hill— while I was still in prayer, Gabriel, the man I had seen in the earlier vision, came to me in swift flight "
            "about the time of the evening sacrifice. He instructed me and said to me, 'Daniel, I have now come to give you insight and understanding. "
            "As soon as you began to pray, a word went out, which I have come to tell you, for you are highly esteemed. Therefore, consider the word and understand the vision.'"
        ),
        event_description=(
            "Daniel's prophecy of 70 weeks (490 years) divided into 7 weeks, 62 weeks, and 1 week, "
            "culminating in the coming of the Messiah and end-times events."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Provides the most precise timeline in biblical prophecy. The 69 weeks were fulfilled "
            "in Christ's first coming; the 70th week awaits future fulfillment."
        )
    )
    db.add(seventy_weeks)
    db.commit()
    print(f"✓ Created Daniel 9 - Seventy Weeks")

    # Joel 2 - Day of the Lord
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
    print(f"✓ Created Joel 2 - Day of the Lord")

    # Zechariah 12 - Jerusalem's Defense
    jerusalem_defense = Prophecies(
        event_name="Jerusalem's Defense",
        scripture_reference="Zechariah 12:1-14",
        scripture_text=(
            "This is the word of the LORD concerning Israel. The LORD, who stretches out the heavens, who lays the foundation of the earth, "
            "and who forms the spirit of man within him, declares: 'I am going to make Jerusalem a cup that sends all the surrounding peoples reeling. "
            "Judah will be besieged as well as Jerusalem. On that day, when all the nations of the earth are gathered against her, "
            "I will make Jerusalem an immovable rock for all the nations. All who try to move it will injure themselves.'"
        ),
        event_description=(
            "Jerusalem becomes a burdensome stone to all nations. When attacked, God Himself defends the city, "
            "causing confusion among the attacking armies."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Shows God's supernatural protection of Jerusalem in the end times. The city becomes "
            "a focal point of international conflict and divine intervention."
        )
    )
    db.add(jerusalem_defense)
    db.commit()
    print(f"✓ Created Zechariah 12 - Jerusalem's Defense")

    # Zechariah 14 - Valley of Decision
    valley_decision = Prophecies(
        event_name="Battle of the Valley of Decision",
        scripture_reference="Zechariah 14:1-21",
        scripture_text=(
            "A day of the LORD is coming, Jerusalem, when your possessions will be plundered and divided up within your very walls. "
            "I will gather all the nations to Jerusalem to fight against it; the city will be captured, the houses ransacked, "
            "and the women raped. Half of the city will go into exile, but the rest of the people will not be taken from the city. "
            "Then the LORD will go out and fight against those nations, as he fights on a day of battle. On that day his feet will stand "
            "on the Mount of Olives, east of Jerusalem, and the Mount of Olives will be split in two from east to west, forming a great valley, "
            "with half of the mountain moving north and half moving south."
        ),
        event_description=(
            "Final battle where nations attack Jerusalem, but God intervenes personally, splitting the Mount of Olives "
            "and establishing His millennial reign."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Describes the climactic battle of Armageddon and Christ's return. The geographical changes "
            "accompany the establishment of the millennial kingdom."
        )
    )
    db.add(valley_decision)
    db.commit()
    print(f"✓ Created Zechariah 14 - Valley of Decision")

    # ========== NEW TESTAMENT PROPHECIES ==========

    # Matthew 24 - Olivet Discourse
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
    print(f"✓ Created Matthew 24 - Olivet Discourse")

    # 2 Thessalonians 2 - Man of Lawlessness
    man_lawlessness = Prophecies(
        event_name="Rise of the Man of Lawlessness",
        scripture_reference="2 Thessalonians 2:1-12",
        scripture_text=(
            "Concerning the coming of our Lord Jesus Christ and our being gathered to him, we ask you, brothers and sisters, "
            "not to become easily unsettled or alarmed by the teaching allegedly from us—whether by a prophecy or by word of mouth or by letter— "
            "asserting that the day of Christ has already come. Don't let anyone deceive you in any way, for that day will not come until the rebellion occurs "
            "and the man of lawlessness is revealed, the man doomed to destruction. He will oppose and will exalt himself over everything that is called God "
            "or is worshiped, so that he sets himself up in God's temple, proclaiming himself to be God."
        ),
        event_description=(
            "The Antichrist will be revealed, exalting himself above God and sitting in the temple "
            "as if he were God, performing counterfeit miracles."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Describes the final human ruler who embodies rebellion against God. His revelation "
            "is preceded by a great apostasy and restrained by a currently active force."
        )
    )
    db.add(man_lawlessness)
    db.commit()
    print(f"✓ Created 2 Thessalonians 2 - Man of Lawlessness")

    # ========== APOCRYPHAL BOOKS ==========

    # 1 Enoch - Book of the Watchers
    enoch_watchers = Prophecies(
        event_name="Fall of the Watchers",
        scripture_reference="1 Enoch 6-16",
        scripture_text=(
            "And it came to pass when the children of men had multiplied that in those days were born unto them beautiful and comely daughters. "
            "And the angels, the children of the heaven, saw and lusted after them, and said to one another: 'Come, let us choose us wives from among the children of men "
            "and beget us children.' And Semjaza, who was their leader, said unto them: 'I fear ye will not indeed agree to do this deed, and I alone shall have to pay the penalty of a great sin.' "
            "And they all answered him and said: 'Let us all swear an oath, and all bind ourselves by mutual imprecations not to abandon this plan but to do this thing.'"
        ),
        event_description=(
            "The 200 fallen angels (Watchers) descend to earth, take human wives, and produce giant offspring, "
            "corrupting humanity and requiring divine judgment."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Explains the origin of evil spirits and giants before the Flood. The Watchers taught forbidden knowledge "
            "to humanity, leading to widespread corruption and necessitating the Flood judgment."
        )
    )
    db.add(enoch_watchers)
    db.commit()
    print(f"✓ Created 1 Enoch - Fall of the Watchers")

    # 1 Enoch - Prophecy of the Weeks
    enoch_weeks = Prophecies(
        event_name="Apocalypse of Weeks",
        scripture_reference="1 Enoch 93:1-10, 91:11-17",
        scripture_text=(
            "And after that Enoch both gave and began to recount from the books. And Enoch said: 'Concerning the children of righteousness and concerning the elect of the world, "
            "and concerning the plant of uprightness, I will speak these things. I Enoch was born the seventh in the first week, While judgement and righteousness still endured. "
            "And after me there shall arise in the second week great wickedness, And deceit shall have sprung up; And in it there shall be the first end. And in it a man shall be saved; "
            "And after it is ended, unrighteousness shall grow up, And a law shall be made for the sinners. And after that in the third week at its close A man shall be elected as the plant of righteous judgement, "
            "And his posterity shall become the plant of righteousness for evermore."
        ),
        event_description=(
            "Ten-week prophecy of world history from Enoch's time to the final judgment and new creation, "
            "with specific events in each week including the coming of the Messiah and final apostasy."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Provides a comprehensive timeline of redemptive history. The tenth week brings final judgment, "
            "the resurrection of the righteous, and the creation of a new heaven and earth."
        )
    )
    db.add(enoch_weeks)
    db.commit()
    print(f"✓ Created 1 Enoch - Apocalypse of Weeks")

    # 2 Esdras - Eagle Vision
    esdras_eagle = Prophecies(
        event_name="Vision of the Eagle",
        scripture_reference="2 Esdras 11-12",
        scripture_text=(
            "And I saw a dream, and behold, there came up from the sea an eagle, which had twelve feathered wings and three heads. "
            "And I looked, and behold, he spread his wings over all the earth, and all the winds of heaven blew upon him, and the clouds were gathered together unto him. "
            "And I beheld, and out of his wings there grew other wings; and they became little wings and small. But his heads were at rest: the head in the midst was greater than the other, yet rested it with them. "
            "Moreover I beheld, and lo, the eagle flew with his wings, and reigned upon earth, and over them that dwelt therein."
        ),
        event_description=(
            "Vision of a great eagle representing successive world empires that will rule until destroyed by the Messiah, "
            "symbolized by a lion who awakens and condemns the eagle to destruction."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Similar to Daniel's visions, this represents the succession of world empires. The lion (Messiah) "
            "ultimately destroys the eagle (final world empire) and establishes eternal peace."
        )
    )
    db.add(esdras_eagle)
    db.commit()
    print(f"✓ Created 2 Esdras - Eagle Vision")

    # 2 Esdras - Man from the Sea
    esdras_man_sea = Prophecies(
        event_name="Vision of the Man from the Sea",
        scripture_reference="2 Esdras 13",
        scripture_text=(
            "And it came to pass after seven days, I dreamed a dream by night: And, lo, there arose a wind from the sea, that it moved all the waves thereof. "
            "And I beheld, and, lo, that man waxed strong with the thousands of heaven: and when he turned his countenance to look, all the things trembled that were seen under him: "
            "and whensoever the voice went out of his mouth, all they burned that heard his voice, like as the earth faileth when it feeleth the fire. "
            "And after this I beheld, and, lo, there was gathered together a multitude of men, out of number, from the four winds of the heaven, to subdue the man that came out of the sea."
        ),
        event_description=(
            "A man emerges from the sea (Messiah) who destroys a hostile multitude with the breath of his mouth, "
            "then gathers a peaceful multitude and leads them to Mount Zion."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Clearly messianic, describing the Messiah's victory over hostile forces and establishment "
            "of His kingdom. The breath of His mouth destroying enemies parallels other prophetic imagery."
        )
    )
    db.add(esdras_man_sea)
    db.commit()
    print(f"✓ Created 2 Esdras - Man from the Sea")

    # Jubilees - Division of Days
    jubilees_days = Prophecies(
        event_name="Division of All the Days",
        scripture_reference="Jubilees 1:29-2:1",
        scripture_text=(
            "And he said to me: 'I will now make thee know the days of the division of all the days. "
            "For I know thy confusion of mind about the division of the days of the law and the testimony, "
            "and the weeks and the jubilees, and the years and the sabbaths. Behold, I will make thee know their division "
            "that thou mayest declare them to thy son and thy son's son after thee, and that generations of generations "
            "of thy seed may declare them to their sons, and may observe these statutes in all the days of their generations.'"
        ),
        event_description=(
            "God reveals to Moses the proper calendar and division of time, including sabbaths, weeks, "
            "jubilees, and festivals that must be observed throughout Israel's generations."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Emphasizes the importance of proper timekeeping and festival observance. The calendar "
            "is lunar-solar, with jubilee years every 49 years for land rest and debt forgiveness."
        )
    )
    db.add(jubilees_days)
    db.commit()
    print(f"✓ Created Jubilees - Division of Days")

    # Jubilees - Messiah Prophecy
    jubilees_messiah = Prophecies(
        event_name="Messiah and the End of Days",
        scripture_reference="Jubilees 23:18-31",
        scripture_text=(
            "And in those days the children will begin to study the laws, And to seek the commandments, And to return to the path of righteousness. "
            "And the days will begin to be fruitful and increase, And the children of men will live a full life of peace and joy, And there will be no Satan nor any evil destroyer; "
            "For all their days will be days of blessing and healing. And then the Lord will heal his servants, And they will rise up and see great peace, "
            "And they will drive out their adversaries. And the righteous will see and be thankful, And rejoice with joy for ever and ever; "
            "And they will see all their judgments and all their curses on their enemies. And their bones will rest in the earth, And their spirits will have much joy."
        ),
        event_description=(
            "Prophecy of a time when Israel returns to Torah observance, leading to peace, healing, "
            "and victory over enemies, culminating in resurrection and eternal joy."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Describes the messianic age with Torah observance, peace, and resurrection. "
            "Contrasts sharply with the preceding days of wickedness and judgment."
        )
    )
    db.add(jubilees_messiah)
    db.commit()
    print(f"✓ Created Jubilees - Messiah Prophecy")

    # ========== PSEUDEPIGRAPHAL BOOKS ==========

    # Apocalypse of Baruch - Coming Tribulation
    baruch_tribulation = Prophecies(
        event_name="Coming Tribulation and Messiah",
        scripture_reference="2 Baruch 25-30",
        scripture_text=(
            "And it will happen after these things, when the time of the appearance of the Messiah has been fulfilled, "
            "that he will return in glory. Then all who have fallen asleep in hope of him will rise again. "
            "And it will happen at that time that the treasuries will be opened in which is preserved the number of the souls of the righteous, "
            "and they will come out, and the multitudes of souls will appear together, in one assemblage, of one appearance; "
            "the first will rejoice, and the last will not be grieved. For they know that the time has come of which it is said, "
            "that it is the consummation of the times."
        ),
        event_description=(
            "The Messiah will appear in glory, resurrecting the righteous dead who will rejoice together "
            "at the consummation of the ages."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Emphasizes the joy of the resurrection and the unity of all righteous generations. "
            "The treasuries of souls concept is unique to this text."
        )
    )
    db.add(baruch_tribulation)
    db.commit()
    print(f"✓ Created 2 Baruch - Tribulation and Messiah")

    # Psalms of Solomon - Messiah Prophecy
    psalms_solomon = Prophecies(
        event_name="Messiah King from David",
        scripture_reference="Psalms of Solomon 17:21-46",
        scripture_text=(
            "Behold, O Lord, and raise up unto them their king, the son of David, At the time in which Thou seest, O God, "
            "that he may reign over Israel Thy servant. And gird him with strength, that he may shatter unrighteous rulers, "
            "And that he may purge Jerusalem from nations that trample her down to destruction. Wisely, righteously he shall thrust out sinners from the inheritance, "
            "He shall destroy the pride of the sinner as a potter's vessel. With a rod of iron he shall break in pieces all their substance, "
            "He shall destroy the godless nations with the word of his mouth; At his rebuke nations shall flee before him, "
            "And he shall reprove sinners for the thoughts of their heart."
        ),
        event_description=(
            "The Messiah, son of David, will reign over Israel, destroy unrighteous rulers, "
            "purge Jerusalem of Gentiles, and establish righteous rule with a rod of iron."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Strongly messianic, emphasizing the Davidic lineage and military victory over enemies. "
            "Written during the Hasmonean period, expressing hope for true messianic deliverance."
        )
    )
    db.add(psalms_solomon)
    db.commit()
    print(f"✓ Created Psalms of Solomon - Messiah King")

    # Testament of Moses - Final Conflict
    moses_testament = Prophecies(
        event_name="Final Conflict and Deliverance",
        scripture_reference="Assumption of Moses 10:1-10",
        scripture_text=(
            "Then His kingdom will appear throughout all His creation, And then Satan will be no more, And sorrow will depart with him. "
            "Then the hands of the angel will be filled, And he will be commissioned to avenge them of their enemies. "
            "For the Heavenly One will arise from His royal throne, And He will go forth from His holy habitation, With indignation and wrath on account of His sons. "
            "And the earth will tremble, Even to its ends it will be shaken, And the high mountains will be made low, And they will be shaken and fall. "
            "And the hills will be made a plain, And they will not endure. And He will arise with indignation, And with wrath to destroy the adversaries."
        ),
        event_description=(
            "The Messiah arises from His throne with wrath to destroy enemies, causing cosmic upheaval "
            "and establishing His eternal kingdom after Satan is destroyed."
        ),
        prophecy_category="OTHER",
        theological_notes=(
            "Describes the final divine intervention with cosmic signs and the complete destruction "
            "of evil. The Messiah's wrath is directed specifically against the adversaries of His people."
        )
    )
    db.add(moses_testament)
    db.commit()
    print(f"✓ Created Testament of Moses - Final Conflict")

    print(f"\n✅ Created comprehensive prophecies from:")
    print(f"   - Canonical books: Revelation, Isaiah, Jeremiah, Ezekiel, Daniel, Joel, Zechariah, Matthew, Thessalonians")
    print(f"   - Apocryphal books: 1 Enoch, 2 Esdras, Jubilees")
    print(f"   - Pseudepigraphal books: 2 Baruch, Psalms of Solomon, Testament of Moses")
    print(f"   - Total prophecies: 25+ with celestial sign correlations")


def main():
    """Seed theological data."""
    print("=== Seeding Theological Data ===\n")

    with Session(engine) as db:
        # Check if celestial signs already exist
        existing_signs = db.query(CelestialSigns).count()
        if existing_signs > 0:
            print(f"✓ Celestial signs already exist ({existing_signs} found), skipping creation")
            signs = {sign.sign_name: sign for sign in db.query(CelestialSigns).all()}
        else:
            # Create celestial signs first (no dependencies)
            signs = create_celestial_signs(db)

        # Create prophecies and link to signs
        create_prophecies(db, signs)
    
    print("\n=== Seed Complete ===")
    print("Database now contains:")
    print("  - 10 celestial signs")
    print("  - 25+ prophecies from canonical, apocryphal, and pseudepigraphal books")
    print("  - Multiple prophecy-sign relationships")
    print("\nYou can now query these records to see the relationships!")


if __name__ == "__main__":
    main()
