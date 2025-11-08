"""
Multi-Language Biblical NLP Module
Hebrew, Greek, and Aramaic Text Processing for Prophecy Analysis
"""

import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

# Hebrew/Greek NLP libraries (require installation)
try:
    import hebrew
    HEBREW_AVAILABLE = True
except ImportError:
    HEBREW_AVAILABLE = False
    print("Warning: python-hebrew not installed. Hebrew processing disabled.")
    print("Install with: pip install python-hebrew")

# Note: For production, consider using:
# - spaCy with Hebrew/Greek models
# - NLTK with unicode support
# - Stanza NLP from Stanford
# - Custom trained models


@dataclass
class BiblicalWord:
    """Represents a biblical word with linguistic metadata"""
    text: str
    transliteration: str
    strongs_number: Optional[str]
    part_of_speech: str
    definition: str
    language: str  # 'hebrew', 'greek', 'aramaic'
    context: str  # Surrounding verse text


class HebrewTextProcessor:
    """
    Hebrew Old Testament Text Processing
    Handles Biblical Hebrew (Classical Hebrew) with vowel points (nikud)
    """
    
    # Hebrew alphabet
    HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'
    FINAL_LETTERS = 'ךםןףץ'
    VOWEL_POINTS = 'ְֱֲֳִֵֶַָֹֻּֽ'  # Nikud marks
    
    # Common prophetic words in Hebrew
    PROPHETIC_KEYWORDS = {
        'נְבוּאָה': {'transliteration': 'nevu\'ah', 'meaning': 'prophecy', 'strongs': 'H5016'},
        'נָבִיא': {'transliteration': 'navi', 'meaning': 'prophet', 'strongs': 'H5030'},
        'חָזוֹן': {'transliteration': 'chazon', 'meaning': 'vision', 'strongs': 'H2377'},
        'שָׁמַיִם': {'transliteration': 'shamayim', 'meaning': 'heavens', 'strongs': 'H8064'},
        'אוֹת': {'transliteration': 'ot', 'meaning': 'sign', 'strongs': 'H226'},
        'זֶרַע': {'transliteration': 'zera', 'meaning': 'seed', 'strongs': 'H2233'},
        'גּוֹי': {'transliteration': 'goy', 'meaning': 'nation', 'strongs': 'H1471'},
        'יוֹם': {'transliteration': 'yom', 'meaning': 'day', 'strongs': 'H3117'},
        'אַחֲרִית': {'transliteration': 'acharit', 'meaning': 'end/latter days', 'strongs': 'H319'},
        'מָשִׁיחַ': {'transliteration': 'mashiach', 'meaning': 'messiah/anointed', 'strongs': 'H4899'}
    }
    
    def __init__(self):
        """Initialize Hebrew processor"""
        self.word_cache = {}
    
    def is_hebrew(self, text: str) -> bool:
        """Check if text contains Hebrew characters"""
        return any(c in self.HEBREW_LETTERS + self.FINAL_LETTERS for c in text)
    
    def remove_vowel_points(self, text: str) -> str:
        """Remove nikud (vowel points) to get consonantal text"""
        return ''.join(c for c in text if c not in self.VOWEL_POINTS)
    
    def extract_words(self, text: str) -> List[str]:
        """Extract Hebrew words from text"""
        # Split on whitespace and punctuation, keep only Hebrew words
        words = re.findall(r'[\u0590-\u05FF]+', text)
        return [w for w in words if self.is_hebrew(w)]
    
    def analyze_word(self, word: str) -> Optional[BiblicalWord]:
        """
        Analyze Hebrew word and return linguistic information
        
        Args:
            word: Hebrew word (with or without nikud)
        
        Returns:
            BiblicalWord object with metadata, or None if not found
        """
        # Remove nikud for lookup
        consonantal = self.remove_vowel_points(word)
        
        # Check prophetic keywords
        if consonantal in self.PROPHETIC_KEYWORDS:
            data = self.PROPHETIC_KEYWORDS[consonantal]
            return BiblicalWord(
                text=word,
                transliteration=data['transliteration'],
                strongs_number=data['strongs'],
                part_of_speech='noun',  # Simplified
                definition=data['meaning'],
                language='hebrew',
                context=''
            )
        
        # For production: Query Strong's Concordance database
        return None
    
    def translate_passage(self, hebrew_text: str) -> Dict:
        """
        Translate Hebrew passage with word-by-word analysis
        
        Args:
            hebrew_text: Hebrew verse or passage
        
        Returns:
            Dictionary with translation and word analysis
        """
        words = self.extract_words(hebrew_text)
        analyzed_words = []
        
        for word in words:
            analysis = self.analyze_word(word)
            if analysis:
                analyzed_words.append({
                    'hebrew': word,
                    'transliteration': analysis.transliteration,
                    'meaning': analysis.definition,
                    'strongs': analysis.strongs_number
                })
            else:
                analyzed_words.append({
                    'hebrew': word,
                    'transliteration': self._basic_transliterate(word),
                    'meaning': '[lookup required]',
                    'strongs': None
                })
        
        return {
            'original_text': hebrew_text,
            'words': analyzed_words,
            'prophetic_terms_found': [w for w in analyzed_words if w['strongs']],
            'language': 'Hebrew'
        }
    
    @staticmethod
    def _basic_transliterate(hebrew_word: str) -> str:
        """Basic Hebrew to Latin transliteration"""
        # Simplified transliteration map
        trans_map = {
            'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
            'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
            'כ': 'k', 'ך': 'kh', 'ל': 'l', 'מ': 'm', 'ם': 'm',
            'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': '', 'פ': 'p',
            'ף': 'f', 'צ': 'ts', 'ץ': 'ts', 'ק': 'q', 'ר': 'r',
            'ש': 'sh', 'ת': 't'
        }
        
        result = ''
        for char in hebrew_word:
            result += trans_map.get(char, char)
        return result


class GreekTextProcessor:
    """
    Greek New Testament Text Processing
    Handles Koine Greek with accents and breathings
    """
    
    # Greek alphabet
    GREEK_LETTERS = 'αβγδεζηθικλμνξοπρστυφχψω'
    GREEK_LETTERS_UPPER = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'
    
    # Common prophetic words in Greek
    PROPHETIC_KEYWORDS = {
        'προφητεία': {'transliteration': 'propheteia', 'meaning': 'prophecy', 'strongs': 'G4394'},
        'προφήτης': {'transliteration': 'prophetes', 'meaning': 'prophet', 'strongs': 'G4396'},
        'ὅραμα': {'transliteration': 'horama', 'meaning': 'vision', 'strongs': 'G3705'},
        'οὐρανός': {'transliteration': 'ouranos', 'meaning': 'heaven', 'strongs': 'G3772'},
        'σημεῖον': {'transliteration': 'semeion', 'meaning': 'sign/miracle', 'strongs': 'G4592'},
        'ἀποκάλυψις': {'transliteration': 'apokalypsis', 'meaning': 'revelation', 'strongs': 'G602'},
        'παρουσία': {'transliteration': 'parousia', 'meaning': 'coming/presence', 'strongs': 'G3952'},
        'ἐσχάτος': {'transliteration': 'eschatos', 'meaning': 'last/final', 'strongs': 'G2078'},
        'χριστός': {'transliteration': 'christos', 'meaning': 'christ/anointed', 'strongs': 'G5547'},
        'βασιλεία': {'transliteration': 'basileia', 'meaning': 'kingdom', 'strongs': 'G932'}
    }
    
    def __init__(self):
        """Initialize Greek processor"""
        self.word_cache = {}
    
    def is_greek(self, text: str) -> bool:
        """Check if text contains Greek characters"""
        return any(c in self.GREEK_LETTERS + self.GREEK_LETTERS_UPPER for c in text.lower())
    
    def remove_diacritics(self, text: str) -> str:
        """Remove Greek diacritical marks (accents, breathings)"""
        import unicodedata
        # Decompose and remove combining diacriticals
        nfd = unicodedata.normalize('NFD', text)
        return ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
    
    def extract_words(self, text: str) -> List[str]:
        """Extract Greek words from text"""
        words = re.findall(r'[\u0370-\u03FF\u1F00-\u1FFF]+', text)
        return [w for w in words if self.is_greek(w)]
    
    def analyze_word(self, word: str) -> Optional[BiblicalWord]:
        """
        Analyze Greek word and return linguistic information
        
        Args:
            word: Greek word (with or without diacritics)
        
        Returns:
            BiblicalWord object with metadata, or None if not found
        """
        # Remove diacritics for lookup
        base_form = self.remove_diacritics(word.lower())
        
        # Check prophetic keywords
        if base_form in self.PROPHETIC_KEYWORDS:
            data = self.PROPHETIC_KEYWORDS[base_form]
            return BiblicalWord(
                text=word,
                transliteration=data['transliteration'],
                strongs_number=data['strongs'],
                part_of_speech='noun',  # Simplified
                definition=data['meaning'],
                language='greek',
                context=''
            )
        
        return None
    
    def translate_passage(self, greek_text: str) -> Dict:
        """
        Translate Greek passage with word-by-word analysis
        
        Args:
            greek_text: Greek verse or passage
        
        Returns:
            Dictionary with translation and word analysis
        """
        words = self.extract_words(greek_text)
        analyzed_words = []
        
        for word in words:
            analysis = self.analyze_word(word)
            if analysis:
                analyzed_words.append({
                    'greek': word,
                    'transliteration': analysis.transliteration,
                    'meaning': analysis.definition,
                    'strongs': analysis.strongs_number
                })
            else:
                analyzed_words.append({
                    'greek': word,
                    'transliteration': self._basic_transliterate(word),
                    'meaning': '[lookup required]',
                    'strongs': None
                })
        
        return {
            'original_text': greek_text,
            'words': analyzed_words,
            'prophetic_terms_found': [w for w in analyzed_words if w['strongs']],
            'language': 'Greek'
        }
    
    @staticmethod
    def _basic_transliterate(greek_word: str) -> str:
        """Basic Greek to Latin transliteration"""
        trans_map = {
            'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e',
            'ζ': 'z', 'η': 'e', 'θ': 'th', 'ι': 'i', 'κ': 'k',
            'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o',
            'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't',
            'υ': 'y', 'φ': 'ph', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o'
        }
        
        result = ''
        for char in greek_word.lower():
            result += trans_map.get(char, char)
        return result


class AramaicTextProcessor:
    """
    Aramaic Biblical Text Processing
    Handles Imperial Aramaic (Daniel, Ezra portions)
    """
    
    # Aramaic uses Hebrew script but different vocabulary
    # Portions in Daniel 2:4-7:28 and Ezra 4:8-6:18, 7:12-26
    
    ARAMAIC_KEYWORDS = {
        'חֲזוֹ': {'transliteration': 'chazo', 'meaning': 'vision', 'strongs': 'A2370'},
        'מַלְכוּ': {'transliteration': 'malku', 'meaning': 'kingdom', 'strongs': 'A4437'},
        'בַּר': {'transliteration': 'bar', 'meaning': 'son', 'strongs': 'A1247'},
        'עַתִּיק': {'transliteration': 'attiq', 'meaning': 'ancient of days', 'strongs': 'A6268'}
    }
    
    def __init__(self):
        """Initialize Aramaic processor"""
        self.hebrew_processor = HebrewTextProcessor()
    
    def analyze_word(self, word: str) -> Optional[BiblicalWord]:
        """Analyze Aramaic word (uses Hebrew script)"""
        consonantal = self.hebrew_processor.remove_vowel_points(word)
        
        if consonantal in self.ARAMAIC_KEYWORDS:
            data = self.ARAMAIC_KEYWORDS[consonantal]
            return BiblicalWord(
                text=word,
                transliteration=data['transliteration'],
                strongs_number=data['strongs'],
                part_of_speech='noun',
                definition=data['meaning'],
                language='aramaic',
                context=''
            )
        
        return None


class MultiLanguageBiblicalNLP:
    """
    Unified interface for multi-language biblical text processing
    Supports Hebrew, Greek, and Aramaic analysis
    """
    
    def __init__(self):
        """Initialize all language processors"""
        self.hebrew = HebrewTextProcessor()
        self.greek = GreekTextProcessor()
        self.aramaic = AramaicTextProcessor()
    
    def detect_language(self, text: str) -> str:
        """Detect language of biblical text"""
        if self.greek.is_greek(text):
            return 'greek'
        elif self.hebrew.is_hebrew(text):
            # Could be Hebrew or Aramaic (both use Hebrew script)
            # In production, use context (book/chapter) to determine
            return 'hebrew'
        else:
            return 'unknown'
    
    def analyze_prophecy(self, text: str, language: Optional[str] = None) -> Dict:
        """
        Comprehensive prophecy analysis across languages
        
        Args:
            text: Biblical text in Hebrew, Greek, or Aramaic
            language: Explicit language hint ('hebrew', 'greek', 'aramaic')
        
        Returns:
            Dictionary with full linguistic analysis
        """
        if not language:
            language = self.detect_language(text)
        
        if language == 'greek':
            return self.greek.translate_passage(text)
        elif language == 'aramaic':
            # Use Hebrew processor with Aramaic keywords
            result = self.hebrew.translate_passage(text)
            result['language'] = 'Aramaic'
            return result
        elif language == 'hebrew':
            return self.hebrew.translate_passage(text)
        else:
            return {
                'error': 'Unsupported language',
                'text': text,
                'language': language
            }
    
    def compare_translations(self, hebrew_text: str, greek_text: str) -> Dict:
        """
        Compare Old Testament (Hebrew) and New Testament (Greek) parallel passages
        Example: Isaiah 7:14 (Hebrew) vs Matthew 1:23 (Greek quote)
        
        Returns:
            Comparison showing translation differences and insights
        """
        hebrew_analysis = self.hebrew.translate_passage(hebrew_text)
        greek_analysis = self.greek.translate_passage(greek_text)
        
        return {
            'hebrew': hebrew_analysis,
            'greek': greek_analysis,
            'comparison': {
                'prophetic_terms_hebrew': len(hebrew_analysis['prophetic_terms_found']),
                'prophetic_terms_greek': len(greek_analysis['prophetic_terms_found']),
                'note': 'LXX (Septuagint) translation may differ from Masoretic text'
            }
        }
    
    def search_strongs_concordance(self, strongs_number: str) -> Optional[Dict]:
        """
        Look up Strong's Concordance entry
        
        Args:
            strongs_number: Strong's number (e.g., 'H5030' for Hebrew, 'G4396' for Greek)
        
        Returns:
            Concordance entry with definition and usage
        """
        # In production, query Strong's Concordance database
        # For now, return from keywords
        all_keywords = {
            **self.hebrew.PROPHETIC_KEYWORDS,
            **self.greek.PROPHETIC_KEYWORDS,
            **self.aramaic.ARAMAIC_KEYWORDS
        }
        
        for word, data in all_keywords.items():
            if data['strongs'] == strongs_number:
                return {
                    'strongs_number': strongs_number,
                    'word': word,
                    'transliteration': data['transliteration'],
                    'meaning': data['meaning'],
                    'language': 'Hebrew' if strongs_number.startswith('H') else 'Greek' if strongs_number.startswith('G') else 'Aramaic'
                }
        
        return None


# Example usage
if __name__ == '__main__':
    nlp = MultiLanguageBiblicalNLP()
    
    # Example 1: Analyze Hebrew text (Joel 2:31)
    hebrew_text = "הַשֶּׁמֶשׁ יֵהָפֵךְ לְחֹשֶׁךְ"  # "The sun shall be turned to darkness"
    print("\n=== Hebrew Analysis (Joel 2:31) ===")
    hebrew_result = nlp.analyze_prophecy(hebrew_text, 'hebrew')
    print(f"Original: {hebrew_result['original_text']}")
    print(f"Prophetic terms found: {len(hebrew_result['prophetic_terms_found'])}")
    
    # Example 2: Analyze Greek text (Matthew 24:29)
    greek_text = "ὁ ἥλιος σκοτισθήσεται"  # "the sun will be darkened"
    print("\n=== Greek Analysis (Matthew 24:29) ===")
    greek_result = nlp.analyze_prophecy(greek_text, 'greek')
    print(f"Original: {greek_result['original_text']}")
    print(f"Prophetic terms found: {len(greek_result['prophetic_terms_found'])}")
    
    # Example 3: Strong's lookup
    print("\n=== Strong's Concordance Lookup ===")
    lookup = nlp.search_strongs_concordance('H5030')  # navi (prophet)
    if lookup:
        print(f"{lookup['strongs_number']}: {lookup['word']} ({lookup['transliteration']}) = {lookup['meaning']}")
