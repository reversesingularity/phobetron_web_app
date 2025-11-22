"""
Multi-Language Biblical NLP Module
===================================

Advanced Natural Language Processing for biblical prophecy texts in:
- Hebrew (עברית) - Original Old Testament
- Greek (Ελληνικά) - Original New Testament  
- Aramaic (ܐܪܡܝܐ) - Daniel, Ezra, and Gospels
- Latin (Latinus) - Vulgate
- English - Modern translations

Features:
- Morphological analysis
- Semantic similarity matching
- Named entity recognition (locations, people, events)
- Cross-reference detection
- Prophecy fulfillment correlation
- Timeline extraction
"""

import re
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


@dataclass
class ProphecyText:
    """Structured prophecy text with metadata"""
    text: str
    language: str
    book: str
    chapter: int
    verse: int
    translation: str = "KJV"
    original_script: Optional[str] = None
    transliteration: Optional[str] = None


@dataclass
class ProphecyEntity:
    """Named entity extracted from prophecy"""
    text: str
    type: str  # 'LOCATION', 'PERSON', 'EVENT', 'TIME', 'SIGN'
    original_language: str
    confidence: float
    context: str


class MultilingualBiblicalNLP:
    """
    NLP processor for multi-language biblical texts
    """
    
    def __init__(self):
        """Initialize NLP processor with language models"""
        self.hebrew_patterns = self._load_hebrew_patterns()
        self.greek_patterns = self._load_greek_patterns()
        self.aramaic_patterns = self._load_aramaic_patterns()
        self.prophecy_keywords = self._load_prophecy_keywords()
        
    def _load_hebrew_patterns(self) -> Dict[str, List[str]]:
        """Load Hebrew word patterns for prophecy detection"""
        return {
            'earthquake': [
                'רעש',  # ra'ash - earthquake/shaking
                'רגז',  # ragaz - tremble/quake
                'זעזע',  # za'aza - shake violently
                'רעד',  # ra'ad - trembling
            ],
            'sign': [
                'אות',  # ot - sign/omen
                'מופת',  # mofet - wonder/miracle
                'נס',  # nes - miracle/banner
            ],
            'heavens': [
                'שמים',  # shamayim - heavens/sky
                'רקיע',  # raqia - firmament/expanse
                'כוכבים',  # kokhavim - stars
                'ירח',  # yareach - moon
                'שמש',  # shemesh - sun
            ],
            'day': [
                'יום',  # yom - day
                'יום־יהוה',  # yom-YHWH - Day of the LORD
                'האחרון',  # ha-acharon - the last
            ],
            'judgment': [
                'משפט',  # mishpat - judgment
                'דין',  # din - judgment/law
                'פקד',  # paqad - visit/punish
            ]
        }
    
    def _load_greek_patterns(self) -> Dict[str, List[str]]:
        """Load Greek word patterns for New Testament prophecy"""
        return {
            'earthquake': [
                'σεισμός',  # seismos - earthquake/shaking
                'σείω',  # seiō - shake/agitate
            ],
            'sign': [
                'σημεῖον',  # sēmeion - sign/mark
                'τέρας',  # teras - wonder/portent
            ],
            'heavens': [
                'οὐρανός',  # ouranos - heaven/sky
                'ἀστήρ',  # astēr - star
                'σελήνη',  # selēnē - moon
                'ἥλιος',  # hēlios - sun
            ],
            'day': [
                'ἡμέρα',  # hēmera - day
                'ὥρα',  # hōra - hour/time
                'καιρός',  # kairos - appointed time
            ],
            'tribulation': [
                'θλῖψις',  # thlipsis - tribulation/affliction
                'ἀνάγκη',  # anankē - necessity/distress
            ],
            'parousia': [
                'παρουσία',  # parousia - coming/presence
                'ἐπιφάνεια',  # epiphaneia - appearing/manifestation
            ]
        }
    
    def _load_aramaic_patterns(self) -> Dict[str, List[str]]:
        """Load Aramaic word patterns for Daniel and Gospels"""
        return {
            'kingdom': [
                'מלכו',  # malku - kingdom
                'שלטן',  # sholtan - dominion/authority
            ],
            'vision': [
                'חזו',  # chezu - vision
                'חלם',  # chelem - dream
            ],
            'time': [
                'עדן',  # iddan - time/season
                'זמן',  # zeman - appointed time
            ],
            'beast': [
                'חיוה',  # cheyva - beast/living creature
            ]
        }
    
    def _load_prophecy_keywords(self) -> Dict[str, List[str]]:
        """Load English prophecy keywords for detection"""
        return {
            'temporal': [
                'last days', 'end times', 'latter days', 'that day',
                'the day', 'soon', 'quickly', 'near', 'at hand',
                'generation', 'hour', 'moment', 'season'
            ],
            'celestial': [
                'sun', 'moon', 'stars', 'heavens', 'sky',
                'darkness', 'blood moon', 'eclipse', 'sign in heaven',
                'cosmic', 'planets', 'constellations'
            ],
            'seismic': [
                'earthquake', 'quake', 'trembling', 'shaking',
                'mountains', 'earth moved', 'foundations',
                'rocks rent', 'ground', 'tremor'
            ],
            'judgment': [
                'wrath', 'judgment', 'vengeance', 'punishment',
                'destruction', 'desolation', 'tribulation',
                'day of the lord', 'anger', 'fury'
            ],
            'deliverance': [
                'salvation', 'rescue', 'redeem', 'deliver',
                'save', 'protect', 'refuge', 'escape'
            ]
        }
    
    def analyze_prophecy(self, text: ProphecyText) -> Dict[str, Any]:
        """
        Comprehensive analysis of prophecy text
        
        Args:
            text: Prophecy text with metadata
            
        Returns:
            Analysis results with entities, themes, and correlations
        """
        analysis = {
            'reference': f"{text.book} {text.chapter}:{text.verse}",
            'language': text.language,
            'translation': text.translation,
            'entities': [],
            'themes': [],
            'temporal_indicators': [],
            'celestial_references': [],
            'seismic_references': [],
            'confidence_score': 0.0,
            'prophecy_type': None,
            'fulfillment_status': None
        }
        
        # Extract entities
        analysis['entities'] = self.extract_entities(text)
        
        # Identify themes
        analysis['themes'] = self.identify_themes(text)
        
        # Extract temporal markers
        analysis['temporal_indicators'] = self.extract_temporal_markers(text)
        
        # Find celestial references
        analysis['celestial_references'] = self.find_celestial_references(text)
        
        # Find seismic references
        analysis['seismic_references'] = self.find_seismic_references(text)
        
        # Classify prophecy type
        analysis['prophecy_type'] = self.classify_prophecy_type(text)
        
        # Calculate confidence
        analysis['confidence_score'] = self.calculate_confidence(analysis)
        
        return analysis
    
    def extract_entities(self, text: ProphecyText) -> List[ProphecyEntity]:
        """Extract named entities from prophecy text"""
        entities = []
        
        # Location patterns
        location_patterns = [
            r'\b(Jerusalem|Zion|Israel|Babylon|Egypt|Syria|Damascus|Tyre|Sidon)\b',
            r'\b(Mount of Olives|Mount Sinai|Mount Zion)\b',
            r'\b(Mediterranean|Red Sea|Jordan|Euphrates|Nile)\b'
        ]
        
        for pattern in location_patterns:
            matches = re.finditer(pattern, text.text, re.IGNORECASE)
            for match in matches:
                entities.append(ProphecyEntity(
                    text=match.group(),
                    type='LOCATION',
                    original_language=text.language,
                    confidence=0.9,
                    context=text.text[max(0, match.start()-50):min(len(text.text), match.end()+50)]
                ))
        
        # Person patterns (biblical figures)
        person_patterns = [
            r'\b(Messiah|Christ|Son of Man|Lord|God|YHWH)\b',
            r'\b(Daniel|Isaiah|Ezekiel|Joel|Zechariah|John|Peter|Paul)\b',
            r'\b(Antichrist|Beast|False Prophet)\b'
        ]
        
        for pattern in person_patterns:
            matches = re.finditer(pattern, text.text, re.IGNORECASE)
            for match in matches:
                entities.append(ProphecyEntity(
                    text=match.group(),
                    type='PERSON',
                    original_language=text.language,
                    confidence=0.85,
                    context=text.text[max(0, match.start()-50):min(len(text.text), match.end()+50)]
                ))
        
        # Event patterns
        event_patterns = [
            r'\b(earthquake|tribulation|judgment|wrath|destruction)\b',
            r'\b(rapture|resurrection|return|coming|parousia)\b',
            r'\b(war|battle|conflict|invasion)\b'
        ]
        
        for pattern in event_patterns:
            matches = re.finditer(pattern, text.text, re.IGNORECASE)
            for match in matches:
                entities.append(ProphecyEntity(
                    text=match.group(),
                    type='EVENT',
                    original_language=text.language,
                    confidence=0.8,
                    context=text.text[max(0, match.start()-50):min(len(text.text), match.end()+50)]
                ))
        
        return entities
    
    def identify_themes(self, text: ProphecyText) -> List[Dict[str, Any]]:
        """Identify major themes in prophecy"""
        themes = []
        
        for theme_name, keywords in self.prophecy_keywords.items():
            matches = 0
            matched_keywords = []
            
            for keyword in keywords:
                if keyword.lower() in text.text.lower():
                    matches += 1
                    matched_keywords.append(keyword)
            
            if matches > 0:
                themes.append({
                    'theme': theme_name,
                    'relevance': matches / len(keywords),
                    'keywords_found': matched_keywords,
                    'count': matches
                })
        
        # Sort by relevance
        themes.sort(key=lambda x: x['relevance'], reverse=True)
        
        return themes
    
    def extract_temporal_markers(self, text: ProphecyText) -> List[Dict[str, str]]:
        """Extract time references from prophecy"""
        markers = []
        
        temporal_patterns = [
            (r'(?:in|on|at|during) (?:the )?(last|latter|end) days?', 'eschatological'),
            (r'(?:that|the|this) day', 'prophetic_day'),
            (r'\d+ (?:days?|years?|months?|weeks?)', 'duration'),
            (r'(?:soon|quickly|near|at hand|imminent)', 'immediacy'),
            (r'(?:generation|age|season|time)', 'era'),
            (r'(?:before|after|when|until)', 'sequence')
        ]
        
        for pattern, marker_type in temporal_patterns:
            matches = re.finditer(pattern, text.text, re.IGNORECASE)
            for match in matches:
                markers.append({
                    'text': match.group(),
                    'type': marker_type,
                    'position': match.start()
                })
        
        return markers
    
    def find_celestial_references(self, text: ProphecyText) -> List[str]:
        """Find references to celestial phenomena"""
        celestial_refs = []
        
        patterns = [
            r'sun (?:shall be )?(?:darkened|black|turned to darkness)',
            r'moon (?:shall be )?(?:blood|red|darkened|not give (?:her|its) light)',
            r'stars (?:shall )?fall',
            r'signs? in (?:the )?(?:sun|moon|stars|heaven)',
            r'powers of (?:the )?heaven',
            r'eclipse|alignment|conjunction'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text.text, re.IGNORECASE)
            for match in matches:
                celestial_refs.append(match.group())
        
        return list(set(celestial_refs))  # Remove duplicates
    
    def find_seismic_references(self, text: ProphecyText) -> List[str]:
        """Find references to seismic activity"""
        seismic_refs = []
        
        patterns = [
            r'earth(?:quake|s)?(?: shall)? (?:shake|tremble|quake|move)',
            r'great earthquake',
            r'mountains? (?:shall )?(?:shake|tremble|melt|fall)',
            r'(?:foundations|rocks) (?:shall )?(?:shake|tremble|split)',
            r'ground (?:shall )?(?:shake|tremble|split)',
            r'islands? (?:shall )?(?:move|flee|vanish)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text.text, re.IGNORECASE)
            for match in matches:
                seismic_refs.append(match.group())
        
        return list(set(seismic_refs))
    
    def classify_prophecy_type(self, text: ProphecyText) -> str:
        """Classify the type of prophecy"""
        # Count theme occurrences
        theme_scores = {
            'eschatological': 0,
            'judgment': 0,
            'messianic': 0,
            'warning': 0,
            'blessing': 0
        }
        
        text_lower = text.text.lower()
        
        # Eschatological indicators
        if any(word in text_lower for word in ['last days', 'end times', 'day of the lord', 'that day']):
            theme_scores['eschatological'] += 2
        
        # Judgment indicators
        if any(word in text_lower for word in ['wrath', 'judgment', 'destroy', 'punishment', 'tribulation']):
            theme_scores['judgment'] += 2
        
        # Messianic indicators
        if any(word in text_lower for word in ['messiah', 'son of man', 'coming', 'return', 'king']):
            theme_scores['messianic'] += 2
        
        # Warning indicators
        if any(word in text_lower for word in ['beware', 'watch', 'flee', 'escape', 'prepare']):
            theme_scores['warning'] += 1
        
        # Blessing indicators
        if any(word in text_lower for word in ['bless', 'save', 'deliver', 'redeem', 'rescue']):
            theme_scores['blessing'] += 1
        
        # Return type with highest score
        max_type = max(theme_scores.items(), key=lambda x: x[1])
        return max_type[0] if max_type[1] > 0 else 'general'
    
    def calculate_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calculate confidence score for prophecy analysis"""
        score = 0.0
        
        # Entity count (max 0.3)
        entity_score = min(len(analysis['entities']) / 10, 0.3)
        score += entity_score
        
        # Theme relevance (max 0.3)
        if analysis['themes']:
            theme_score = min(analysis['themes'][0]['relevance'], 0.3)
            score += theme_score
        
        # Temporal indicators (max 0.2)
        temporal_score = min(len(analysis['temporal_indicators']) / 5, 0.2)
        score += temporal_score
        
        # Celestial references (max 0.1)
        celestial_score = min(len(analysis['celestial_references']) / 3, 0.1)
        score += celestial_score
        
        # Seismic references (max 0.1)
        seismic_score = min(len(analysis['seismic_references']) / 3, 0.1)
        score += seismic_score
        
        return round(score, 2)
    
    def cross_reference_prophecies(
        self,
        prophecies: List[ProphecyText]
    ) -> List[Dict[str, Any]]:
        """Find cross-references between prophecies"""
        cross_refs = []
        
        for i, prop1 in enumerate(prophecies):
            for prop2 in prophecies[i+1:]:
                similarity = self.calculate_semantic_similarity(prop1, prop2)
                
                if similarity > 0.5:  # Threshold for meaningful correlation
                    cross_refs.append({
                        'prophecy_1': f"{prop1.book} {prop1.chapter}:{prop1.verse}",
                        'prophecy_2': f"{prop2.book} {prop2.chapter}:{prop2.verse}",
                        'similarity': similarity,
                        'shared_themes': self.find_shared_themes(prop1, prop2)
                    })
        
        # Sort by similarity
        cross_refs.sort(key=lambda x: x['similarity'], reverse=True)
        
        return cross_refs
    
    def calculate_semantic_similarity(
        self,
        text1: ProphecyText,
        text2: ProphecyText
    ) -> float:
        """Calculate semantic similarity between two prophecy texts"""
        # Simple word overlap-based similarity
        # In production, use word embeddings or transformer models
        
        words1 = set(re.findall(r'\w+', text1.text.lower()))
        words2 = set(re.findall(r'\w+', text2.text.lower()))
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        # Jaccard similarity
        return len(intersection) / len(union) if union else 0.0
    
    def find_shared_themes(
        self,
        text1: ProphecyText,
        text2: ProphecyText
    ) -> List[str]:
        """Find themes shared between two prophecies"""
        themes1 = set(t['theme'] for t in self.identify_themes(text1))
        themes2 = set(t['theme'] for t in self.identify_themes(text2))
        
        return list(themes1.intersection(themes2))


# Example usage
if __name__ == "__main__":
    nlp = MultilingualBiblicalNLP()
    
    # Example prophecy text
    prophecy = ProphecyText(
        text="And there shall be signs in the sun, and in the moon, and in the stars; "
             "and upon the earth distress of nations, with perplexity; the sea and the waves roaring; "
             "Men's hearts failing them for fear, and for looking after those things which are coming on the earth: "
             "for the powers of heaven shall be shaken.",
        language="English",
        book="Luke",
        chapter=21,
        verse=25,
        translation="KJV"
    )
    
    # Analyze
    analysis = nlp.analyze_prophecy(prophecy)
    
    print(f"Reference: {analysis['reference']}")
    print(f"Prophecy Type: {analysis['prophecy_type']}")
    print(f"Confidence: {analysis['confidence_score']}")
    print(f"Themes: {[t['theme'] for t in analysis['themes'][:3]]}")
    print(f"Celestial References: {analysis['celestial_references']}")
    print(f"Entities: {len(analysis['entities'])}")
