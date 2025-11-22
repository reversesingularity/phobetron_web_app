"""
Extract scripture mappings from seed_theological_data.py
This script parses the seed file and creates scripture_mappings.json
"""
import re
import json

def extract_prophecies_from_seed(seed_file_path):
    """Extract prophecies from seed file"""
    with open(seed_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    mappings = {}
    
    # Find all Prophecies(...) blocks
    pattern = r'Prophecies\s*\(\s*event_name="([^"]+)",\s*scripture_reference="([^"]+)",\s*scripture_text=\(\s*"([^"]+(?:"\s*"[^"]+)*)"'
    
    matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        event_name = match.group(1)
        scripture_ref = match.group(2)
        scripture_text_raw = match.group(3)
        
        # Clean up scripture text (remove Python string continuation)
        scripture_text = scripture_text_raw.replace('"\n            "', ' ').replace('"\n        "', ' ').strip()
        
        # Parse scripture reference
        # Format: "Book Chapter:Verse-Verse" or "Book Chapter:Verse"
        ref_pattern = r'([12]?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?'
        ref_match = re.match(ref_pattern, scripture_ref)
        
        if ref_match:
            book = ref_match.group(1).strip()
            chapter = int(ref_match.group(2))
            verse_start = int(ref_match.group(3))
            verse_end = int(ref_match.group(4)) if ref_match.group(4) else verse_start
            
            mappings[event_name] = {
                "book": book,
                "chapter": chapter,
                "verse_start": verse_start,
                "verse_end": verse_end,
                "text": scripture_text
            }
    
    return mappings

if __name__ == "__main__":
    seed_file = "f:/Projects/phobetron_web_app/backend/seed_theological_data.py"
    output_file = "f:/Projects/phobetron_web_app/backend/scripts/scripture_mappings.json"
    
    print("Extracting scripture mappings from seed file...")
    mappings = extract_prophecies_from_seed(seed_file)
    
    print(f"Found {len(mappings)} prophecies")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(mappings, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Created {output_file} with {len(mappings)} mappings")
    
    # Print first 5 event names
    print("\nFirst 5 events:")
    for i, event_name in enumerate(list(mappings.keys())[:5]):
        print(f"  {i+1}. {event_name}")
