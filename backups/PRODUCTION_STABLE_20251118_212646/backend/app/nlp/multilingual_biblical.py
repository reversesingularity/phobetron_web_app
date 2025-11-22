"""
Multi-Language Biblical Text NLP Module
Supports Hebrew, Greek, and Aramaic text processing for prophecy analysis.
Includes transliteration, morphological analysis, and semantic extraction.
"""

import re
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BiblicalLanguage(Enum):
    """Supported biblical languages."""
    HEBREW = "hebrew"
    GREEK = "greek"
    ARAMAIC = "aramaic"
    ENGLISH = "english"


@dataclass
class BiblicalWord:
    """Represents a word in biblical text with linguistic metadata."""
    text: str
    language: BiblicalLanguage
    transliteration: str
    strong_number: Optional[str] = None
    morphology: Optional[str] = None
    meaning: Optional[str] = None
    root: Optional[str] = None


@dataclass
class ProphecyExtraction:
    """Extracted prophecy information from biblical text."""
    reference: str
    text: str
    language: BiblicalLanguage
    keywords: List[str]
    themes: List[str]
    timeframe: Optional[str] = None
    fulfillment_status: Optional[str] = None
    confidence: float = 0.0


class HebrewTextProcessor:
    """
    Process Hebrew biblical text (Old Testament).
    Handles Hebrew characters, vowel points (niqqud), and cantillation marks.
    """
    
    # Hebrew alphabet
    HEBREW_LETTERS = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת'
    
    # Hebrew vowel points (niqqud)
    HEBREW_VOWELS = 'ְֱֲֳִֵֶַָֹֺֻּֽ'
    
    # Transliteration mapping (simplified)
    TRANSLITERATION_MAP = {
        'א': "'", 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
        'ו': 'w', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
        'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
        'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': "'", 'פ': 'p',
        'ף': 'p', 'צ': 'ts', 'ץ': 'ts', 'ק': 'q', 'ר': 'r',
        'ש': 'sh', 'ת': 't'
    }
    
    # Common Hebrew prophecy keywords
    PROPHECY_KEYWORDS_HEBREW = {
        'נבואה': 'prophecy',
        'חזון': 'vision',
        'אות': 'sign',
        'מופת': 'wonder',
        'אחרית הימים': 'end of days',
        'יום יהוה': 'day of the Lord',
        'משיח': 'messiah',
        'גאולה': 'redemption',
        'ירושלים': 'Jerusalem',
        'ציון': 'Zion'
    }
    
    @staticmethod
    def is_hebrew(text: str) -> bool:
        """Check if text contains Hebrew characters."""
        return any(char in HebrewTextProcessor.HEBREW_LETTERS for char in text)
    
    @staticmethod
    def remove_vowel_points(text: str) -> str:
        """Remove Hebrew vowel points (niqqud) from text."""
        return ''.join(char for char in text if char not in HebrewTextProcessor.HEBREW_VOWELS)
    
    @staticmethod
    def transliterate(hebrew_text: str) -> str:
        """
        Transliterate Hebrew text to Latin characters.
        
        Args:
            hebrew_text: Hebrew text string
            
        Returns:
            Transliterated string
        """
        # Remove vowel points first
        clean_text = HebrewTextProcessor.remove_vowel_points(hebrew_text)
        
        # Transliterate each character
        result = []
        for char in clean_text:
            if char in HebrewTextProcessor.TRANSLITERATION_MAP:
                result.append(HebrewTextProcessor.TRANSLITERATION_MAP[char])
            elif char.isspace():
                result.append(' ')
            else:
                result.append(char)
        
        return ''.join(result)
    
    @staticmethod
    def extract_prophecy_keywords(text: str) -> List[Tuple[str, str]]:
        """
        Extract prophecy-related keywords from Hebrew text.
        
        Args:
            text: Hebrew text
            
        Returns:
            List of (hebrew_word, english_meaning) tuples
        """
        found_keywords = []
        for hebrew, english in HebrewTextProcessor.PROPHECY_KEYWORDS_HEBREW.items():
            if hebrew in text:
                found_keywords.append((hebrew, english))
        return found_keywords


class GreekTextProcessor:
    """
    Process Greek biblical text (New Testament).
    Handles both classical and Koine Greek.
    """
    
    # Greek alphabet
    GREEK_LETTERS = 'ΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσςΤτΥυΦφΧχΨψΩω'
    
    # Transliteration mapping
    TRANSLITERATION_MAP = {
        'Α': 'A', 'α': 'a', 'Β': 'B', 'β': 'b', 'Γ': 'G', 'γ': 'g',
        'Δ': 'D', 'δ': 'd', 'Ε': 'E', 'ε': 'e', 'Ζ': 'Z', 'ζ': 'z',
        'Η': 'Ē', 'η': 'ē', 'Θ': 'Th', 'θ': 'th', 'Ι': 'I', 'ι': 'i',
        'Κ': 'K', 'κ': 'k', 'Λ': 'L', 'λ': 'l', 'Μ': 'M', 'μ': 'm',
        'Ν': 'N', 'ν': 'n', 'Ξ': 'X', 'ξ': 'x', 'Ο': 'O', 'ο': 'o',
        'Π': 'P', 'π': 'p', 'Ρ': 'R', 'ρ': 'r', 'Σ': 'S', 'σ': 's', 'ς': 's',
        'Τ': 'T', 'τ': 't', 'Υ': 'Y', 'υ': 'y', 'Φ': 'Ph', 'φ': 'ph',
        'Χ': 'Ch', 'χ': 'ch', 'Ψ': 'Ps', 'ψ': 'ps', 'Ω': 'Ō', 'ω': 'ō'
    }
    
    # Common Greek prophecy keywords
    PROPHECY_KEYWORDS_GREEK = {
        'προφητεία': 'prophecy',
        'ὅραμα': 'vision',
        'σημεῖον': 'sign',
        'τέρας': 'wonder',
        'ἀποκάλυψις': 'revelation',
        'παρουσία': 'coming/presence',
        'ἐσχάτων': 'last things',
        'Χριστός': 'Christ',
        'Ἰησοῦς': 'Jesus',
        'Ἱερουσαλήμ': 'Jerusalem'
    }
    
    @staticmethod
    def is_greek(text: str) -> bool:
        """Check if text contains Greek characters."""
        return any(char in GreekTextProcessor.GREEK_LETTERS for char in text)
    
    @staticmethod
    def transliterate(greek_text: str) -> str:
        """
        Transliterate Greek text to Latin characters.
        
        Args:
            greek_text: Greek text string
            
        Returns:
            Transliterated string
        """
        result = []
        for char in greek_text:
            if char in GreekTextProcessor.TRANSLITERATION_MAP:
                result.append(GreekTextProcessor.TRANSLITERATION_MAP[char])
            elif char.isspace():
                result.append(' ')
            else:
                result.append(char)
        
        return ''.join(result)
    
    @staticmethod
    def extract_prophecy_keywords(text: str) -> List[Tuple[str, str]]:
        """
        Extract prophecy-related keywords from Greek text.
        
        Args:
            text: Greek text
            
        Returns:
            List of (greek_word, english_meaning) tuples
        """
        found_keywords = []
        for greek, english in GreekTextProcessor.PROPHECY_KEYWORDS_GREEK.items():
            if greek in text:
                found_keywords.append((greek, english))
        return found_keywords


class AramaicTextProcessor:
    """
    Process Aramaic biblical text (portions of Daniel and Ezra).
    Similar to Hebrew but with distinct vocabulary and grammar.
    """
    
    # Aramaic uses same alphabet as Hebrew
    ARAMAIC_LETTERS = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת'
    
    # Aramaic prophecy keywords (from Daniel)
    PROPHECY_KEYWORDS_ARAMAIC = {
        'חזו': 'vision',
        'מלכות': 'kingdom',
        'עתיק יומין': 'Ancient of Days',
        'בר אנש': 'Son of Man',
        'קדישין': 'holy ones/saints'
    }
    
    @staticmethod
    def is_aramaic(text: str) -> bool:
        """
        Check if text is likely Aramaic (heuristic).
        Note: Difficult to distinguish from Hebrew without context.
        """
        # Check for Aramaic-specific words
        aramaic_indicators = ['די', 'הוא', 'אנתון']
        return any(word in text for word in aramaic_indicators)
    
    @staticmethod
    def transliterate(aramaic_text: str) -> str:
        """
        Transliterate Aramaic text (uses Hebrew transliteration).
        
        Args:
            aramaic_text: Aramaic text string
            
        Returns:
            Transliterated string
        """
        return HebrewTextProcessor.transliterate(aramaic_text)
    
    @staticmethod
    def extract_prophecy_keywords(text: str) -> List[Tuple[str, str]]:
        """
        Extract prophecy-related keywords from Aramaic text.
        
        Args:
            text: Aramaic text
            
        Returns:
            List of (aramaic_word, english_meaning) tuples
        """
        found_keywords = []
        for aramaic, english in AramaicTextProcessor.PROPHECY_KEYWORDS_ARAMAIC.items():
            if aramaic in text:
                found_keywords.append((aramaic, english))
        return found_keywords


class MultilingualProphecyAnalyzer:
    """
    High-level analyzer for multilingual biblical prophecy texts.
    Automatically detects language and processes accordingly.
    """
    
    def __init__(self):
        """Initialize the multilingual analyzer."""
        self.hebrew_processor = HebrewTextProcessor()
        self.greek_processor = GreekTextProcessor()
        self.aramaic_processor = AramaicTextProcessor()
    
    def detect_language(self, text: str) -> BiblicalLanguage:
        """
        Detect the language of biblical text.
        
        Args:
            text: Biblical text
            
        Returns:
            Detected language enum
        """
        if self.greek_processor.is_greek(text):
            return BiblicalLanguage.GREEK
        elif self.aramaic_processor.is_aramaic(text):
            return BiblicalLanguage.ARAMAIC
        elif self.hebrew_processor.is_hebrew(text):
            return BiblicalLanguage.HEBREW
        else:
            return BiblicalLanguage.ENGLISH
    
    def process_text(
        self,
        text: str,
        reference: str,
        language: Optional[BiblicalLanguage] = None
    ) -> ProphecyExtraction:
        """
        Process biblical text and extract prophecy information.
        
        Args:
            text: Biblical text to process
            reference: Biblical reference (e.g., "Daniel 9:24-27")
            language: Language (auto-detected if None)
            
        Returns:
            ProphecyExtraction object
        """
        # Detect language if not provided
        if language is None:
            language = self.detect_language(text)
        
        # Extract keywords based on language
        keywords = []
        if language == BiblicalLanguage.HEBREW:
            keyword_pairs = self.hebrew_processor.extract_prophecy_keywords(text)
            keywords = [eng for _, eng in keyword_pairs]
        elif language == BiblicalLanguage.GREEK:
            keyword_pairs = self.greek_processor.extract_prophecy_keywords(text)
            keywords = [eng for _, eng in keyword_pairs]
        elif language == BiblicalLanguage.ARAMAIC:
            keyword_pairs = self.aramaic_processor.extract_prophecy_keywords(text)
            keywords = [eng for _, eng in keyword_pairs]
        
        # Extract themes based on keywords and reference
        themes = self._extract_themes(reference, keywords)
        
        # Determine timeframe
        timeframe = self._determine_timeframe(text, reference)
        
        # Calculate confidence based on keyword matches
        confidence = len(keywords) / 10.0  # Normalize to 0-1 scale
        confidence = min(confidence, 1.0)
        
        return ProphecyExtraction(
            reference=reference,
            text=text,
            language=language,
            keywords=keywords,
            themes=themes,
            timeframe=timeframe,
            confidence=confidence
        )
    
    def transliterate(
        self,
        text: str,
        language: Optional[BiblicalLanguage] = None
    ) -> str:
        """
        Transliterate biblical text to Latin characters.
        
        Args:
            text: Text to transliterate
            language: Source language (auto-detected if None)
            
        Returns:
            Transliterated text
        """
        if language is None:
            language = self.detect_language(text)
        
        if language == BiblicalLanguage.HEBREW:
            return self.hebrew_processor.transliterate(text)
        elif language == BiblicalLanguage.GREEK:
            return self.greek_processor.transliterate(text)
        elif language == BiblicalLanguage.ARAMAIC:
            return self.aramaic_processor.transliterate(text)
        else:
            return text
    
    def _extract_themes(
        self,
        reference: str,
        keywords: List[str]
    ) -> List[str]:
        """Extract thematic categories from prophecy."""
        themes = set()
        
        # Book-based themes
        if 'Revelation' in reference:
            themes.add('apocalyptic')
            themes.add('end_times')
        elif 'Daniel' in reference:
            themes.add('kingdoms')
            themes.add('eschatology')
        elif 'Isaiah' in reference or 'Jeremiah' in reference:
            themes.add('messianic')
            themes.add('restoration')
        elif 'Ezekiel' in reference:
            themes.add('visions')
            themes.add('temple')
        elif 'Joel' in reference:
            themes.add('day_of_lord')
            themes.add('celestial_signs')
        
        # Keyword-based themes
        if 'sign' in keywords or 'wonder' in keywords:
            themes.add('signs_wonders')
        if 'vision' in keywords:
            themes.add('visions')
        if 'messiah' in keywords or 'Christ' in keywords:
            themes.add('messianic')
        if 'Jerusalem' in keywords or 'Zion' in keywords:
            themes.add('jerusalem')
        if 'end' in keywords or 'last' in keywords:
            themes.add('end_times')
        
        return list(themes)
    
    def _determine_timeframe(
        self,
        text: str,
        reference: str
    ) -> Optional[str]:
        """Determine prophecy timeframe from text and context."""
        timeframe_indicators = {
            'near': ['soon', 'quickly', 'at hand', 'near'],
            'intermediate': ['days', 'years', 'generation'],
            'distant': ['end of days', 'last days', 'end times', 'forever']
        }
        
        text_lower = text.lower()
        for timeframe, indicators in timeframe_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                return timeframe
        
        return None
    
    def batch_process(
        self,
        texts: List[Tuple[str, str]]
    ) -> List[ProphecyExtraction]:
        """
        Process multiple prophecy texts in batch.
        
        Args:
            texts: List of (text, reference) tuples
            
        Returns:
            List of ProphecyExtraction objects
        """
        return [self.process_text(text, ref) for text, ref in texts]


# Example prophecy texts for testing
SAMPLE_PROPHECIES = [
    # Hebrew (Isaiah 7:14)
    ("לָכֵן יִתֵּן אֲדֹנָי הוּא לָכֶם אוֹת הִנֵּה הָעַלְמָה הָרָה וְיֹלֶדֶת בֵּן", "Isaiah 7:14"),
    
    # Greek (Matthew 24:29)
    ("Εὐθέως δὲ μετὰ τὴν θλῖψιν τῶν ἡμερῶν ἐκείνων ὁ ἥλιος σκοτισθήσεται", "Matthew 24:29"),
    
    # Aramaic (Daniel 7:13)
    ("חָזֵה הֲוֵית בְּחֶזְוֵי לֵילְיָא וַאֲרוּ עִם עֲנָנֵי שְׁמַיָּא", "Daniel 7:13"),
    
    # English
    ("And there shall be signs in the sun, and in the moon, and in the stars", "Luke 21:25")
]


# Example usage
if __name__ == "__main__":
    print("Multi-Language Biblical NLP Module")
    print("=" * 60)
    
    analyzer = MultilingualProphecyAnalyzer()
    
    print("\nProcessing sample prophecies:\n")
    for text, reference in SAMPLE_PROPHECIES:
        result = analyzer.process_text(text, reference)
        transliterated = analyzer.transliterate(text)
        
        print(f"Reference: {reference}")
        print(f"Language: {result.language.value}")
        print(f"Original: {text[:50]}...")
        print(f"Transliterated: {transliterated[:50]}...")
        print(f"Keywords: {', '.join(result.keywords)}")
        print(f"Themes: {', '.join(result.themes)}")
        print(f"Confidence: {result.confidence:.2f}")
        print("-" * 60)
    
    print("\n" + "=" * 60)
    print("Multilingual prophecy analysis ready.")
    print("Supports: Hebrew, Greek, Aramaic, English")
    print("=" * 60)
