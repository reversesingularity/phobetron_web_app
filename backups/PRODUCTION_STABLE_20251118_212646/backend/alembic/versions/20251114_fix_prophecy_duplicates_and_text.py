"""Fix prophecy duplicates and populate scripture text

Revision ID: 20251114_fix_prophecy
Revises: 4e4fe003d573
Create Date: 2025-11-14

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import json
from pathlib import Path

# revision identifiers, used by Alembic.
revision: str = '20251114_fix_prophecy'
down_revision: Union[str, None] = '4e4fe003d573'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Fix production prophecies:
    1. Remove duplicate prophecy records
    2. Populate scripture text for all events
    """
    conn = op.get_bind()
    
    print("\n" + "="*60)
    print("FIXING PROPHECY DATA")
    print("="*60 + "\n")
    
    # STEP 1: Remove duplicates
    print("STEP 1: Removing duplicate prophecy records...")
    
    # Keep only the first record (lowest ID) for each event_name
    result = conn.execute(sa.text("""
        DELETE FROM prophecies
        WHERE id NOT IN (
            SELECT MIN(id)
            FROM prophecies
            GROUP BY event_name
        )
    """))
    
    deleted_count = result.rowcount
    print(f"✅ Deleted {deleted_count} duplicate records\n")
    
    # STEP 2: Populate scripture text
    print("STEP 2: Populating scripture text...")
    
    # Load scripture mappings from the seed file data
    scripture_mappings = {
        "First Seal - White Horse of Conquest": "I watched as the Lamb opened the first of the seven seals. Then I heard one of the four living creatures say in a voice like thunder, 'Come!' I looked, and there before me was a white horse! Its rider held a bow, and he was given a crown, and he rode out as a conqueror bent on conquest.",
        "Second Seal - Red Horse of War": "When the Lamb opened the second seal, I heard the second living creature say, 'Come!' Then another horse came out, a fiery red one. Its rider was given power to take peace from the earth and to make people kill each other. To him was given a large sword.",
        "Third Seal - Black Horse of Famine": "When the Lamb opened the third seal, I heard the third living creature say, 'Come!' I looked, and there before me was a black horse! Its rider was holding a pair of scales in his hand. Then I heard what sounded like a voice among the four living creatures, saying, 'Two pounds of wheat for a day's wages, and six pounds of barley for a day's wages, and do not damage the oil and the wine!'",
        "Fourth Seal - Pale Horse of Death": "When the Lamb opened the fourth seal, I heard the voice of the fourth living creature say, 'Come!' I looked, and there before me was a pale horse! Its rider was named Death, and Hades was following close behind him. They were given power over a fourth of the earth to kill by sword, famine and plague, and by the wild beasts of the earth.",
        "Fifth Seal - Souls of Martyrs": "When he opened the fifth seal, I saw under the altar the souls of those who had been slain because of the word of God and the testimony they had maintained. They called out in a loud voice, 'How long, Sovereign Lord, holy and true, until you judge the inhabitants of the earth and avenge our blood?' Then each of them was given a white robe, and they were told to wait a little longer, until the full number of their fellow servants, their brothers and sisters, were killed just as they had been.",
        "Sixth Seal Judgment": "I watched as he opened the sixth seal. There was a great earthquake. The sun turned black like sackcloth made of goat hair, the whole moon turned blood red, and the stars in the sky fell to earth, as figs drop from a fig tree when shaken by a strong wind. The heavens receded like a scroll being rolled up, and every mountain and island was removed from its place. Then the kings of the earth, the princes, the generals, the rich, the mighty, and everyone else, both slave and free, hid in caves and among the rocks of the mountains. They called to the mountains and the rocks, 'Fall on us and hide us from the face of him who sits on the throne and from the wrath of the Lamb! For the great day of their wrath has come, and who can withstand it?'",
        "Seventh Seal - Silence in Heaven": "When he opened the seventh seal, there was silence in heaven for about half an hour.",
        "First Trumpet - Hail and Fire Mixed with Blood": "The first angel sounded his trumpet, and there came hail and fire mixed with blood, and it was hurled down on the earth. A third of the earth was burned up, a third of the trees were burned up, and all the green grass was burned up.",
        "Second Trumpet - Mountain Thrown into Sea": "The second angel sounded his trumpet, and something like a huge mountain, all ablaze, was thrown into the sea. A third of the sea turned into blood, a third of the living creatures in the sea died, and a third of the ships were destroyed.",
        "Third Trumpet - Wormwood Star Falls": "The third angel sounded his trumpet, and a great star, blazing like a torch, fell from the sky on a third of the rivers and on the springs of water— the name of the star is Wormwood. A third of the waters turned bitter, and many people died from the waters that had become bitter.",
        "Fourth Trumpet - Celestial Darkening": "The fourth angel sounded his trumpet, and a third of the sun was struck, a third of the moon, and a third of the stars, so that a third of them turned dark. A third of the day was without light, and also a third of the night.",
        "Fifth Trumpet - Abyss Opened": "The fifth angel sounded his trumpet, and I saw a star that had fallen from the sky to the earth. The star was given the key to the shaft of the Abyss. When he opened the Abyss, smoke rose from it like the smoke from a gigantic furnace. The sun and sky were darkened by the smoke from the Abyss. And out of the smoke locusts came down on the earth and were given power like that of scorpions of the earth.",
        "Sixth Trumpet - Four Angels Released": "The sixth angel sounded his trumpet, and I heard a voice coming from the four horns of the golden altar that is before God. It said to the sixth angel who had the trumpet, 'Release the four angels who are bound at the great river Euphrates.' And the four angels who had been kept ready for this very hour and day and month and year were released to kill a third of mankind.",
        "Seventh Trumpet - Kingdom of the World": "The seventh angel sounded his trumpet, and there were loud voices in heaven, which said: 'The kingdom of the world has become the kingdom of our Lord and of his Messiah, and he will reign for ever and ever.' And the twenty-four elders, who were seated on their thrones before God, fell on their faces and worshiped God, saying: 'We give thanks to you, Lord God Almighty, the One who is and who was, because you have taken your great power and have begun to reign.'",
        "First Bowl - Painful Sores": "The first angel went and poured out his bowl on the land, and ugly, festering sores broke out on the people who had the mark of the beast and who worshiped its image.",
        "Second Bowl - Sea Turns to Blood": "The second angel poured out his bowl on the sea, and it turned into blood like that of a dead person, and every living thing in the sea died.",
        "Third Bowl - Rivers Turn to Blood": "The third angel poured out his bowl on the rivers and springs of water, and they became blood. Then I heard the angel in charge of the waters say: 'You are just in these judgments, O Holy One, you who are and who were; for they have shed the blood of your holy people and your prophets, and you have given them blood to drink as they deserve.' And I heard the altar respond: 'Yes, Lord God Almighty, true and just are your judgments.'",
        "Fourth Bowl - Scorching Heat from Sun": "The fourth angel poured out his bowl on the sun, and the sun was allowed to scorch people with fire. They were seared by the intense heat and they cursed the name of God, who had control over these plagues, but they refused to repent and glorify him.",
        "Fifth Bowl - Darkness in the Beast's Kingdom": "The fifth angel poured out his bowl on the throne of the beast, and its kingdom was plunged into darkness. People gnawed their tongues in agony and cursed the God of heaven because of their pains and their sores, but they refused to repent of what they had done.",
        "Sixth Bowl - Euphrates River Dried Up": "The sixth angel poured out his bowl on the great river Euphrates, and its water was dried up to prepare the way for the kings from the East. Then I saw three impure spirits that looked like frogs; they came out of the mouth of the dragon, out of the mouth of the beast and out of the mouth of the false prophet. They are demonic spirits that perform signs, and they go out to the kings of the whole world, to gather them for the battle on the great day of God Almighty.",
        "Seventh Bowl - The Greatest Earthquake": "The seventh angel poured out his bowl into the air, and out of the temple came a loud voice from the throne, saying, 'It is done!' Then there came flashes of lightning, rumblings, peals of thunder and a severe earthquake. No earthquake like it has ever occurred since mankind has been on earth, so tremendous was the quake. The great city split into three parts, and the cities of the nations collapsed. God remembered Babylon the Great and gave her the cup filled with the wine of the fury of his wrath. Every island fled away and the mountains could not be found. From the sky huge hailstones, each weighing about a hundred pounds, fell on people.",
    }
    
    # Additional prophecies from other books
    additional_mappings = {
        "Fall of Babylon": "See, I will stir up against them the Medes, who do not care for silver and have no delight in gold. Their bows will strike down the young men; they will have no mercy on infants, nor will they look with compassion on children. Babylon, the jewel of kingdoms, the pride and glory of the Babylonians, will be overthrown by God like Sodom and Gomorrah.",
        "Earth Laid Waste": "See, the LORD is going to lay waste the earth and devastate it; he will ruin its face and scatter its inhabitants. The earth will be completely laid waste and totally plundered. The LORD has spoken this word. The earth dries up and withers, the world languishes and withers, the heavens languish with the earth. The earth is defiled by its people; they have disobeyed the laws, violated the statutes and broken the everlasting covenant.",
        "Seventy Years of Captivity": "This is the word that came to Jeremiah concerning all the people of Judah in the fourth year of Jehoiakim son of Josiah king of Judah, which was the first year of Nebuchadnezzar king of Babylon. So Jeremiah the prophet said to all the people of Judah and to all those living in Jerusalem: 'For twenty-three years—from the thirteenth year of Josiah son of Amon king of Judah until this very day—the word of the LORD has come to me and I have spoken to you again and again, but you have not listened.'",
        "War of Gog and Magog": "This is what the Sovereign LORD says: I am against you, Gog, chief prince of Meshek and Tubal. I will turn you around, put hooks in your jaws and bring you out with your whole army—your horses, your horsemen fully armed, and a great horde with large and small shields, all of them brandishing their swords. Persia, Cush and Put will be with them, all with shields and helmets, also Gomer with all its troops, and Beth Togarmah from the far north with all its troops— the many nations with you.",
        "Seventy Weeks Prophecy": "While I was speaking and praying, confessing my sin and the sin of my people Israel and making my request to the LORD my God for his holy hill— while I was still in prayer, Gabriel, the man I had seen in the earlier vision, came to me in swift flight about the time of the evening sacrifice. He instructed me and said to me, 'Daniel, I have now come to give you insight and understanding. As soon as you began to pray, a word went out, which I have come to tell you, for you are highly esteemed. Therefore, consider the word and understand the vision.'",
        "The Day of the Lord": "I will show wonders in the heavens and on the earth, blood and fire and billows of smoke. The sun will be turned to darkness and the moon to blood before the coming of the great and dreadful day of the LORD.",
        "Jerusalem's Defense": "This is the word of the LORD concerning Israel. The LORD, who stretches out the heavens, who lays the foundation of the earth, and who forms the spirit of man within him, declares: 'I am going to make Jerusalem a cup that sends all the surrounding peoples reeling. Judah will be besieged as well as Jerusalem. On that day, when all the nations of the earth are gathered against her, I will make Jerusalem an immovable rock for all the nations. All who try to move it will injure themselves.'",
        "Battle of the Valley of Decision": "A day of the LORD is coming, Jerusalem, when your possessions will be plundered and divided up within your very walls. I will gather all the nations to Jerusalem to fight against it; the city will be captured, the houses ransacked, and the women raped. Half of the city will go into exile, but the rest of the people will not be taken from the city. Then the LORD will go out and fight against those nations, as he fights on a day of battle. On that day his feet will stand on the Mount of Olives, east of Jerusalem, and the Mount of Olives will be split in two from east to west, forming a great valley, with half of the mountain moving north and half moving south.",
        "Signs of Christ's Return": "Immediately after the distress of those days 'the sun will be darkened, and the moon will not give its light; the stars will fall from the sky, and the heavenly bodies will be shaken.' Then will appear the sign of the Son of Man in heaven. And then all the peoples of the earth will mourn when they see the Son of Man coming on the clouds of heaven, with power and great glory.",
        "Rise of the Man of Lawlessness": "Concerning the coming of our Lord Jesus Christ and our being gathered to him, we ask you, brothers and sisters, not to become easily unsettled or alarmed by the teaching allegedly from us—whether by a prophecy or by word of mouth or by letter— asserting that the day of Christ has already come. Don't let anyone deceive you in any way, for that day will not come until the rebellion occurs and the man of lawlessness is revealed, the man doomed to destruction. He will oppose and will exalt himself over everything that is called God or is worshiped, so that he sets himself up in God's temple, proclaiming himself to be God.",
    }
    
    # Merge all mappings
    all_mappings = {**scripture_mappings, **additional_mappings}
    
    success_count = 0
    for event_name, scripture_text in all_mappings.items():
        result = conn.execute(
            sa.text("""
                UPDATE prophecies
                SET scripture_text = :text
                WHERE event_name = :name
            """),
            {"text": scripture_text, "name": event_name}
        )
        if result.rowcount > 0:
            success_count += 1
            print(f"✅ Updated: {event_name}")
    
    print(f"\n✅ Successfully updated {success_count} prophecies with scripture text")
    
    # Verify
    result = conn.execute(sa.text("""
        SELECT COUNT(*) 
        FROM prophecies 
        WHERE scripture_text IS NULL OR scripture_text = ''
    """))
    null_count = result.scalar()
    
    print(f"\nFinal verification:")
    print(f"  Prophecies without text: {null_count}")
    
    if null_count == 0:
        print("  ✅ SUCCESS: All prophecies have scripture text!")
    else:
        print(f"  ⚠️  WARNING: {null_count} prophecies still missing text")
    
    print("\n" + "="*60 + "\n")


def downgrade() -> None:
    """
    Downgrade not supported - would require restoring duplicate records
    """
    pass
