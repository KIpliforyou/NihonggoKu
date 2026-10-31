#!/usr/bin/env python3
"""Parse H1-H4V2 markdown files into JSON format for NihonggoKu."""
import re
import json
from pathlib import Path

BASE = Path(r"C:\Users\USER\Desktop\project HERMES AGENT\JLPT")
OUT_DIR = Path("content/kotoba")
BUNPOU_DIR = Path("content/bunpou")

def parse_table_file(filepath, tag):
    """Parse a markdown table file (H1/H2/H3 format)."""
    text = Path(filepath).read_text(encoding="utf-8")
    items = []
    for line in text.splitlines():
        m = re.match(r'\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|', line)
        if m:
            kanji = m.group(1).strip()
            reading = m.group(2).strip()
            example = m.group(3).strip()
            meaning = m.group(4).strip()
            # Skip header rows
            if any(skip in kanji for skip in ["Kanji", "Bacaan", "Contoh", "Arti", "Catatan"]):
                continue
            # Skip multi-char kanji rows without furigana (combined expressions)
            if len(kanji) > 3 and '（' not in kanji and '・' not in kanji:
                continue
            base_word = kanji
            items.append({
                "word": base_word,
                "kanji": kanji,
                "reading": reading,
                "meaning": meaning,
                "partOfSpeech": None,
                "examples": [{"japanese": example, "translation": meaning}],
                "tags": ["jlpt-n2", tag],
                "contentVersion": "1.0.0",
                "contentId": tag,
                "createdAt": 0,
                "updatedAt": 0
            })
    return items

def parse_h4():
    """Parse H4_v2.txt - kanji table section only."""
    text = (BASE / "H4_v2.txt").read_text(encoding="utf-8")
    
    # --- Part 1: Kanji vocabulary table (rows 8-30) ---
    kotoba_items = []
    in_table = False
    for line in text.splitlines():
        if "Daftar Kanji & Kosakata" in line:
            in_table = True
            continue
        if "---" in line and in_table and not line.startswith("|"):
            break
        if not in_table:
            continue
        m = re.match(r'\|\s*\d+\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|', line)
        if m:
            kanji = m.group(1).strip()
            reading = m.group(2).strip()
            example = m.group(3).strip()
            meaning = m.group(4).strip()
            if kanji in ("Kanji", "Bacaan", "Contoh kata", "Arti contoh"):
                continue
            if '（' in kanji and len(kanji) > 2:
                # For multi-char words like 海老で鯉を釣る, use full as word
                pass
            kotoba_items.append({
                "word": kanji,
                "kanji": kanji.split('（')[0] if '（' in kanji else kanji,
                "reading": reading,
                "meaning": meaning,
                "partOfSpeech": None,
                "examples": [{"japanese": kanji, "translation": meaning}],
                "tags": ["jlpt-n2", "h4"],
                "contentVersion": "1.0.0",
                "contentId": "h4",
                "createdAt": 0,
                "updatedAt": 0
            })
    
    # --- Part 2: Grammar patterns from H4 ---
    bunpou_items = []
    sections = text.split("## ")
    for section in sections:
        if "Ringkasan Pola Grammar" in section or "Pembahasan Soal" in section:
            # Extract pattern and example
            pat_m = re.search(r'\*\*(.+?)\*\*[^*]*→\s*(.+?)(?:\n|$)', section)
            ex_m = re.search(r'（.+?）\s*(.+?)\.?\s*$', section)
            # Look for example sentences after "###" headers
            for line in section.splitlines():
                if "Furigana:" in line:
                    # Extract the sentence with the blank
                    sent_m = re.search(r'【(.+?)】', line)
                    if sent_m:
                        sentence = sent_m.group(1).strip()
                    else:
                        # Try alternative format
                        sent_m = re.search(r'（.+?）(.+?)\.', line)
                        sentence = sent_m.group(1).strip() if sent_m else ""
                
                # Look for pattern info in the section
                pat_m2 = re.search(r'(\d+)\.\s+(.+?)\s*（(.+?)）', line)
                if pat_m2:
                    num = pat_m2.group(1)
                    pattern = pat_m2.group(2).strip()
                    reading = pat_m2.group(3).strip()
                    # Find meaning from furigana line or nearby
                    meaning = ""
    
    return kotoba_items

def parse_h4_grammar():
    """Extract grammar patterns from H4_v2 txt."""
    text = (BASE / "H4_v2.txt").read_text(encoding="utf-8")
    bunpou_items = []
    
    # Pattern: find numbered grammar questions and their patterns
    # Sections like "### 33." contain the answer pattern
    current_q = None
    current_pattern = None
    current_reading = None
    
    for line in text.splitlines():
        # Question header
        q_m = re.match(r'^###\s+(\d+)\.\s+(.+?)（(.+?)）\s*$', line)
        if q_m:
            if current_q and current_pattern:
                bunpou_items.append({
                    "id": f"h4g-{current_q}",
                    "pattern": current_pattern,
                    "meaning": "",  # Will fill below
                    "function": "",
                    "formation": f"{current_pattern}（{current_reading}）",
                    "examples": [],
                    "tags": ["jlpt-n2", "h4", "grammar"],
                    "contentVersion": "1.0.0",
                    "contentId": "h4",
                    "createdAt": 0,
                    "updatedAt": 0
                })
            current_q = q_m.group(1)
            current_pattern = q_m.group(2).strip()
            current_reading = q_m.group(3).strip()
            continue
        
        # Answer line containing the correct pattern
        ans_m = re.search(r'Jawaban:\s*\*\*(.+?)\*\*', line)
        if ans_m:
            if current_q:
                bunpou_items.append({
                    "id": f"h4g-{current_q}",
                    "pattern": ans_m.group(1).strip(),
                    "meaning": "",
                    "function": "",
                    "formation": f"{ans_m.group(1).strip()}",
                    "examples": [],
                    "tags": ["jlpt-n2", "h4", "grammar"],
                    "contentVersion": "1.0.0",
                    "contentId": "h4",
                    "createdAt": 0,
                    "updatedAt": 0
                })
                current_q = None
    
    return bunpou_items

def deduplicate(existing, new_items):
    existing_keys = {(item.get("word"), item.get("meaning")) for item in existing}
    result = []
    counter = 0
    for item in new_items:
        key = (item.get("word"), item.get("meaning"))
        if key not in existing_keys:
            counter += 1
            tag = item.get("tags", ["unknown"])[1]
            item["id"] = f"{tag}-{counter:03d}"
            result.append(item)
    return result

# Load existing data
existing_kotoba = json.loads((Path("content/kotoba/data.json")).read_text(encoding="utf-8"))
existing_bunpou = json.loads((Path("content/bunpou/data.json")).read_text(encoding="utf-8"))

print(f"Existing: {len(existing_kotoba)} kotoba, {len(existing_bunpou)} bunpou")

# Parse all H files
h1 = parse_table_file(BASE / "H1.txt", "h1")
h2 = parse_table_file(BASE / "H2.txt", "h2")
h3 = parse_table_file(BASE / "H3.txt", "h3")
h4 = parse_h4()
h4_grammar = parse_h4_grammar()

print(f"H1: {len(h1)} items")
print(f"H2: {len(h2)} items")
print(f"H3: {len(h3)} items")
print(f"H4: {len(h4)} items")
print(f"H4 Grammar: {len(h4_grammar)} items")

# Deduplicate kotoba
new_kotoba = deduplicate(existing_kotoba, h1 + h2 + h3 + h4)
print(f"New unique kotoba: {len(new_kotoba)}")

# Merge
all_kotoba = existing_kotoba + new_kotoba
print(f"Total kotoba: {len(all_kotoba)}")

# Write kotoba
with open("content/kotoba/data.json", "w", encoding="utf-8") as f:
    json.dump(all_kotoba, f, ensure_ascii=False, indent=2)
print("✓ content/kotoba/data.json written")

# Append grammar to bunpou (deduplicate by pattern)
existing_patterns = {b.get("pattern","") for b in existing_bunpou}
new_bunpou = [b for b in h4_grammar if b["pattern"] not in existing_patterns]
all_bunpou = existing_bunpou + new_bunpou
print(f"New bunpou: {len(new_bunpou)}, Total: {len(all_bunpou)}")

with open("content/bunpou/data.json", "w", encoding="utf-8") as f:
    json.dump(all_bunpou, f, ensure_ascii=False, indent=2)
print("✓ content/bunpou/data.json written")

# Update manifest
manifest = json.loads(Path("content/manifest.json").read_text(encoding="utf-8"))
manifest["bunpouCount"] = len(all_bunpou)
manifest["kotobaCount"] = len(all_kotoba)
manifest["lastUpdated"] = "2026-10-31T20:00:00.000Z"
with open("content/manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print("✓ content/manifest.json updated")
