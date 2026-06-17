#!/usr/bin/env python3
"""
Extract inventory of all methods and properties from Director MX 2004 Scripting Reference.

This script parses the reference document and extracts:
- All methods from Chapter 12 (Methods)
- All properties from Chapter 14 (Properties)

Output: JSON inventory with line numbers for each entry.
"""

import json
import re
from pathlib import Path


def read_document(path: str) -> list[str]:
    """Read document and return list of lines."""
    with open(path, "r", encoding="utf-8") as f:
        return f.readlines()


def find_chapter_boundaries(lines: list[str]) -> dict:
    """Find the line numbers where each chapter starts."""
    boundaries = {}
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Chapter 12: Methods
        if stripped == "CHAPTER 12" and i > 11000:
            for j in range(i + 1, min(i + 5, len(lines))):
                if lines[j].strip() == "Methods":
                    boundaries["methods_start"] = j + 2  # Skip intro text
                    break
        
        # Chapter 13: Operators (marks end of methods)
        if stripped == "CHAPTER 13" and i > 30000:
            boundaries["operators_start"] = i
        
        # Chapter 14: Properties
        if stripped == "CHAPTER 14" and i > 31000:
            for j in range(i + 1, min(i + 5, len(lines))):
                if lines[j].strip() == "Properties":
                    boundaries["properties_start"] = j + 2  # Skip intro text
                    break
        
        # INDEX marks end of properties
        if stripped == "INDEX" and i > 56000:
            boundaries["index_start"] = i
    
    return boundaries


def is_valid_entry_name(name: str, is_method: bool) -> bool:
    """Check if a string is a valid method or property name."""
    # Must not be empty
    if not name:
        return False
    
    # Must not be too long (names are typically short)
    if len(name) > 80:
        return False
    
    # Must not be a page number
    if re.match(r"^\d+$", name):
        return False
    
    # Must not be a section header
    if name in ["Usage", "Description", "Parameters", "Example", "See also", 
                "Methods", "Properties", "Operators", "Keywords", "Constants"]:
        return False
    
    # Must not start with common non-name patterns
    if name.startswith(("--", "//", "•", "-", "This ", "The ", "A ", "An ", 
                       "See ", "For ", "If ", "When ", "Note", "Chapter ")):
        return False
    
    # Must not contain certain characters that indicate it's code or a sentence
    # Allow brackets [] for array-like properties (face[index], modifier[])
    if any(c in name for c in ['"', "'", "{", "}", ";", ":", "=", "+", "*", "/"]):
        return False
    
    # Must not contain parentheses except at end or in specific patterns
    if "(" in name:
        # Allow patterns like:
        # - "add (3D texture)" - identifier with parenthetical suffix
        # - "channel() (Top level)" - identifier() with parenthetical context
        # - method names ending with ()
        pattern1 = r"^[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]+\)$"  # name (context)
        pattern2 = r"^[a-zA-Z_][a-zA-Z0-9_]*\(\)\s*\([^)]+\)$"  # name() (context)
        pattern3 = r"^[a-zA-Z_][a-zA-Z0-9_]*\(\)$"  # name()
        
        if not (re.match(pattern1, name) or re.match(pattern2, name) or re.match(pattern3, name)):
            return False
    
    # Must not be a sentence (too many words)
    # Allow up to 6 words for properties like "number of members"
    words = name.split()
    if len(words) > 6:
        return False
    
    # Must start with letter or underscore
    if not re.match(r"^[a-zA-Z_]", name):
        return False
    
    # Valid patterns:
    # 1. Simple identifier: alertHook, deleteMotion
    # 2. Identifier with (): abs(), deleteMotion()
    # 3. Identifier with space and parenthetical: add (3D texture), collision (modifier)
    # 4. Identifier () with parenthetical: channel() (Top level), crop() (Image)
    # 5. Object.property: _movie.allowZooming, memberObjRef.closed
    # 6. Combinations: sprite.blend, member.name
    
    # Pattern 1: Simple identifier
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", name):
        return True
    
    # Pattern 2: Identifier with ()
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*\(\)$", name):
        return True
    
    # Pattern 3: Identifier with parenthetical suffix
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]+\)$", name):
        return True
    
    # Pattern 4: Identifier () with parenthetical context
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*\(\)\s*\([^)]+\)$", name):
        return True
    
    # Pattern 5: Object.property (with optional more dots)
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$", name):
        return True
    
    # Pattern 6: Object.property with parenthetical
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*\s*\([^)]+\)$", name):
        return True
    
    # Pattern 7: Properties with brackets (face[index], modifier[], face[ ])
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*\[[^\]]*\]", name):
        return True
    
    # Pattern 8: Object.property with brackets
    if re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*\[[^\]]*\]", name):
        return True
    
    # Pattern 9: Multi-word property names (number of members, number of xtras)
    # Allow if all words are simple identifiers
    if all(re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", word) for word in words):
        return True
    
    return False


def is_entry_start(lines: list[str], i: int, is_method: bool) -> tuple[bool, str]:
    """
    Check if line i is the start of a new entry.
    Returns (is_start, name).
    
    Pattern: entry name on line i, "Usage" on line i+1
    """
    line = lines[i].strip()
    
    # Skip empty lines
    if not line:
        return False, ""
    
    # Skip page numbers
    if line.isdigit():
        return False, ""
    
    # Skip chapter headers
    if line.startswith("Chapter "):
        return False, ""
    
    # Check if next line is "Usage"
    if i + 1 < len(lines) and lines[i + 1].strip() == "Usage":
        # Validate that this looks like a valid entry name
        if is_valid_entry_name(line, is_method):
            return True, line
    
    return False, ""


def find_entry_end(lines: list[str], start: int, chapter_end: int, is_method: bool) -> int:
    """Find the end line of an entry (line before next entry starts)."""
    i = start + 1
    
    while i < chapter_end:
        is_start, _ = is_entry_start(lines, i, is_method)
        if is_start:
            return i - 1
        i += 1
    
    return chapter_end - 1


def extract_entry_text(lines: list[str], start: int, end: int) -> str:
    """Extract the text of an entry."""
    return "".join(lines[start:end + 1])


def categorize_method(text: str, name: str) -> str:
    """Categorize a method based on its description."""
    text_lower = text.lower()
    # Clean name for matching
    name_clean = re.sub(r"\s*\(.*\)$", "", name).rstrip("()")
    
    # Check for 3D methods
    if "3d command" in text_lower or "3d model" in text_lower or "3d camera" in text_lower:
        return "3d"
    if "3d meshdeform" in text_lower or "3d modifier" in text_lower:
        return "3d"
    if "(3d" in name.lower():
        return "3d"
    
    # Check for DVD methods
    if "dvd" in text_lower or "dvdobjref" in text_lower:
        return "dvd"
    
    # Check for network methods
    network_names = ["getNetText", "postNetText", "netDone", "netError", "netTextResult",
                     "netAbort", "netLastModDate", "netMIME", "preloadNetThing", 
                     "getStreamStatus", "gotoNetPage", "gotoNetMovie", "downloadNetThing"]
    if name_clean in network_names:
        return "network"
    
    # Check for sound methods
    sound_names = ["beep", "playSound", "queueSound", "soundBusy", "sound"]
    if name_clean in sound_names:
        return "sound"
    
    # Check for list methods
    list_names = ["add", "addAt", "append", "deleteAt", "deleteOne", "deleteProp", 
                  "getAt", "getOne", "getPos", "setAt", "sort", "count", "duplicate",
                  "getLast", "addProp", "findPos", "getaProp", "getProp", "getPropAt",
                  "setaProp", "findPosNear", "list", "propList", "makeSubList", "union"]
    if name_clean in list_names:
        return "list"
    
    # Check for math methods
    math_names = ["abs", "atan", "cos", "sin", "tan", "sqrt", "log", "power", "max", "min", "random"]
    if name_clean in math_names:
        return "math"
    
    # Check for type check methods
    typecheck_names = ["voidP", "voidp", "integerP", "integerp", "floatP", "floatp", 
                       "listP", "listp", "objectP", "objectp", "stringP", "stringp", 
                       "symbolP", "symbolp", "ilk"]
    if name_clean in typecheck_names or name_clean.lower() in [n.lower() for n in typecheck_names]:
        return "typecheck"
    
    # Check for conversion methods
    conversion_names = ["integer", "float", "string", "value", "symbol", "charToNum", "numToChar"]
    if name_clean in conversion_names:
        return "conversion"
    
    # Check for member/sprite access methods
    access_names = ["member", "sprite", "castLib", "script", "point", "rect", "color"]
    if name_clean in access_names:
        return "access"
    
    # Check for control flow methods
    control_names = ["abort", "halt", "quit", "stopEvent", "go", "exit"]
    if name_clean in control_names:
        return "control"
    
    # Check for bitwise methods
    bitwise_names = ["bitAnd", "bitNot", "bitOr", "bitXor"]
    if name_clean in bitwise_names:
        return "bitwise"
    
    # Default to general
    return "general"


def categorize_property(name: str, text: str) -> str:
    """Categorize a property based on its name."""
    # Remove any parenthetical suffix for matching
    name_clean = re.sub(r"\s*\(.*\)$", "", name)
    
    # Top-level properties (start with _)
    if name_clean.startswith("_"):
        return "top-level"
    
    # Object properties (contain .)
    if "." in name_clean:
        parts = name_clean.split(".")
        obj = parts[0]
        
        if obj == "sprite":
            return "sprite"
        elif obj == "member" or obj == "memberObjRef":
            return "member"
        elif obj in ["_movie", "movie"]:
            return "movie"
        elif obj in ["_player", "player", "playerObjRef"]:
            return "player"
        elif obj in ["_sound", "sound", "dvdObjRef"]:
            return "sound"
        elif obj in ["_key", "key"]:
            return "key"
        elif obj in ["_mouse", "mouse"]:
            return "mouse"
        elif obj in ["_system", "system"]:
            return "system"
        elif obj == "window":
            return "window"
        elif obj == "timeout":
            return "timeout"
        else:
            return f"object-{obj}"
    
    # Simple property names
    return "simple"


def extract_entries(lines: list[str], start: int, end: int, is_method: bool) -> list[dict]:
    """Extract all entries from a chapter."""
    entries = []
    i = start
    
    while i < end:
        is_start, name = is_entry_start(lines, i, is_method)
        
        if is_start:
            entry_end = find_entry_end(lines, i, end, is_method)
            text = extract_entry_text(lines, i, entry_end)
            
            if is_method:
                category = categorize_method(text, name)
            else:
                category = categorize_property(name, text)
            
            entries.append({
                "name": name,
                "startLine": i + 1,  # 1-indexed
                "endLine": entry_end + 1,  # 1-indexed
                "category": category
            })
            
            i = entry_end + 1
        else:
            i += 1
    
    return entries


def generate_summary(methods: list[dict], properties: list[dict]) -> dict:
    """Generate summary statistics."""
    method_categories = {}
    for m in methods:
        cat = m["category"]
        method_categories[cat] = method_categories.get(cat, 0) + 1
    
    property_categories = {}
    for p in properties:
        cat = p["category"]
        property_categories[cat] = property_categories.get(cat, 0) + 1
    
    return {
        "methods": {
            "total": len(methods),
            "byCategory": method_categories
        },
        "properties": {
            "total": len(properties),
            "byCategory": property_categories
        }
    }


def main():
    doc_path = Path("docs/drmx2004_scripting_ref.txt")
    output_path = Path("docs/director-inventory.json")
    
    print(f"Reading document: {doc_path}")
    lines = read_document(doc_path)
    print(f"Total lines: {len(lines)}")
    
    print("\nFinding chapter boundaries...")
    boundaries = find_chapter_boundaries(lines)
    print(f"Boundaries found: {boundaries}")
    
    # Extract methods
    methods_start = boundaries.get("methods_start", 11735)
    methods_end = boundaries.get("operators_start", 31000)
    
    print(f"\nExtracting methods (lines {methods_start}-{methods_end})...")
    methods = extract_entries(lines, methods_start, methods_end, is_method=True)
    print(f"Found {len(methods)} methods")
    
    # Extract properties
    props_start = boundaries.get("properties_start", 31406)
    props_end = boundaries.get("index_start", len(lines))
    
    print(f"\nExtracting properties (lines {props_start}-{props_end})...")
    properties = extract_entries(lines, props_start, props_end, is_method=False)
    print(f"Found {len(properties)} properties")
    
    # Generate summary
    summary = generate_summary(methods, properties)
    
    # Build output
    output = {
        "source": str(doc_path),
        "totalLines": len(lines),
        "chapterBoundaries": {k: v + 1 for k, v in boundaries.items()},  # 1-indexed
        "summary": summary,
        "methods": methods,
        "properties": properties
    }
    
    # Write output
    print(f"\nWriting inventory to: {output_path}")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    
    # Print summary
    print("\n" + "=" * 60)
    print("INVENTORY SUMMARY")
    print("=" * 60)
    print(f"\nMethods: {summary['methods']['total']}")
    for cat, count in sorted(summary['methods']['byCategory'].items()):
        print(f"  {cat}: {count}")
    
    print(f"\nProperties: {summary['properties']['total']}")
    for cat, count in sorted(summary['properties']['byCategory'].items()):
        print(f"  {cat}: {count}")
    
    print("\n" + "=" * 60)
    print(f"Inventory saved to: {output_path}")


if __name__ == "__main__":
    main()
