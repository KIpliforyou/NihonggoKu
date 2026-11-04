#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Import H6.txt ke content/kotoba/data.json
Format: Kanji | Bacaan | Contoh kata | Arti contoh | Catatan JLPT
"""
import json
import logging
import sys

# Path configuration
JLPT_FILE = r"C:\Users\USER\Desktop\project HERMES AGENT\JLPT\H6.txt"
OUTPUT_FILE = r"C:\Users\USER\Desktop\project HERMES AGENT\nihonggoku\content\kotoba\data.json"

def parse_h6_file(filepath):
    """Parse H6.txt and convert to kotoba schema"""
    items = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Skip header lines (1-3): title, empty, header row
    # Data starts from line 4 (index 4)
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Skip empty lines and header rows
        if not line or line.startswith('| Kanji') or line.startswith('|------|--------') or line.startswith('| Daftar') or line.startswith('|------|--------'):
            continue
        
        # Skip lines that start with '|' but are not data rows
        if not line.startswith('|'):
            continue
        
        # Split by pipe and strip whitespace
        parts = [p.strip() for p in line.split('|')]
        
        # Expected: Kanji | Bacaan | Contoh kata | Arti contoh | Catatan JLPT
        if len(parts) < 4:
            logging.warning(f"Skipping malformed line {i+1}: {line}")
            continue
        
        kanji_col = parts[0]
        bacaan = parts[1]
        contoh_kata = parts[2]
        arti = parts[3]
        catatan = parts[4] if len(parts) > 4 else ""
        
        # Skip empty rows
        if not kanji_col and not bacaan:
            continue
        
        # Determine the word and kanji
        # For kana-only words (like おそらく, 気配), kanji is empty
        # For kanji words, both Kanji and Bacaan are filled
        # For kotowaza, the Kanji column contains the full phrase
        
        word = kanji_col if kanji_col else bacaan
        kanji = kanji_col if kanji_col else ""
        
        # Create examples array
        examples = []
        if contoh_kata and contoh_kata != "–" and contoh_kata != "-":
            examples = [{
                "japanese": contoh_kata,
                "translation": arti
            }]
        
        # Determine note
        note = catatan
        
        item = {
            "id": f"h6-{i:04d}",
            "word": word,
            "kanji": kanji,
            "reading": bacaan,
            "meaning": arti,
            "partOfSpeech": None,
            "examples": examples,
            "tags": ["H6"],
            "contentVersion": "1.0.0",
            "contentId": "mock-tests",
            "createdAt": 0,
            "updatedAt": 0,
            "note": note
        }
        
        items.append(item)
    
    return items

def merge_kotoba_data(existing_data, new_items):
    """Merge new H6 items into existing kotoba data"""
    # Create a set of existing IDs for quick lookup
    existing_ids = {item["id"] for item in existing_data}
    new_items = [item for item in new_items if item["id"] not in existing_ids]
    
    # Append new items
    existing_data.extend(new_items)
    return existing_data

def main():
    # Parse H6.txt
    items = parse_h6_file(JLPT_FILE)
    
    print(f"Parsed {len(items)} items from H6.txt")
    
    # Load existing data
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading existing data: {e}")
        existing_data = []
    
    # Merge new data
    merged_data = merge_kotoba_data(existing_data, items)
    
    # Write to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    print(f"Total kotoba items: {len(merged_data)}")
    print(f"H6 items added: {len(items)}")
    
    # Verify tag counts
    h6_count = sum(1 for item in merged_data if "H6" in item.get("tags", []))
    print(f"H6 tags: {h6_count}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
