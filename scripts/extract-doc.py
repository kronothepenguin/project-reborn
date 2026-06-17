#!/usr/bin/env python3
"""
Extract full documentation for a specific method or property from Director MX 2004 reference.

Usage:
    python3 extract-doc.py <name> [--type method|property]
    
Example:
    python3 extract-doc.py "add" --type method
    python3 extract-doc.py "addAt" --type method
"""

import json
import sys
from pathlib import Path


def load_inventory():
    """Load the inventory JSON."""
    with open("docs/director-inventory.json", "r") as f:
        return json.load(f)


def read_document():
    """Read the reference document."""
    with open("docs/drmx2004_scripting_ref.txt", "r") as f:
        return f.readlines()


def extract_section(text: str, section_name: str) -> str:
    """Extract a section from the entry text."""
    lines = text.split("\n")
    result = []
    in_section = False
    
    for line in lines:
        stripped = line.strip()
        
        # Check if we're starting the requested section
        if stripped == section_name:
            in_section = True
            continue
        
        # Check if we're hitting the next section
        if in_section and stripped in ["Usage", "Description", "Parameters", "Example", "See also"]:
            break
        
        if in_section:
            result.append(line)
    
    return "\n".join(result).strip()


def extract_usage_lingo(text: str) -> str:
    """Extract Lingo syntax from Usage section."""
    lines = text.split("\n")
    result = []
    in_usage = False
    in_lingo = False
    
    for line in lines:
        stripped = line.strip()
        
        if stripped == "Usage":
            in_usage = True
            continue
        
        if in_usage and stripped == "--Lingo syntax":
            in_lingo = True
            continue
        
        if in_usage and stripped == "-- Lingo syntax":
            in_lingo = True
            continue
        
        if in_lingo and (stripped.startswith("//") or stripped == "Description" or stripped == ""):
            if stripped == "Description":
                break
            if stripped.startswith("//"):
                continue
            continue
        
        if in_lingo and stripped and not stripped.startswith("//"):
            # Check if we've hit the next section
            if stripped in ["Description", "Parameters", "Example", "See also"]:
                break
            result.append(line)
        
        if in_usage and stripped in ["Description", "Parameters", "Example", "See also"]:
            break
    
    return "\n".join(result).strip()


def format_doc(name: str, start_line: int, end_line: int, text: str) -> str:
    """Format the documentation as a spec file."""
    # Extract sections
    usage = extract_usage_lingo(text)
    description = extract_section(text, "Description")
    parameters = extract_section(text, "Parameters")
    example = extract_section(text, "Example")
    see_also = extract_section(text, "See also")
    
    # Build the spec
    spec = f"""## {name}

**Source**: `docs/drmx2004_scripting_ref.txt` lines {start_line}-{end_line}

### Usage
```lingo
{usage}
```

### Description
{description}

### Parameters
{parameters if parameters else "None."}

### Example
```lingo
{example}
```

### See also
{see_also if see_also else "N/A"}

### Implementation
- **File**: `apps/client/src/director/core/<file>.js`
- **Test**: `apps/client/src/director/core/__tests__/<file>.test.js`
- **Dependencies**: <list dependencies>
"""
    
    return spec


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract-doc.py <name> [--type method|property]")
        sys.exit(1)
    
    name = sys.argv[1]
    entry_type = "method"  # default
    
    if "--type" in sys.argv:
        idx = sys.argv.index("--type")
        if idx + 1 < len(sys.argv):
            entry_type = sys.argv[idx + 1]
    
    # Load inventory
    inventory = load_inventory()
    
    # Find the entry
    entries = inventory["methods"] if entry_type == "method" else inventory["properties"]
    entry = None
    
    for e in entries:
        if e["name"] == name:
            entry = e
            break
    
    if not entry:
        print(f"Error: {entry_type} '{name}' not found in inventory")
        sys.exit(1)
    
    # Read document
    lines = read_document()
    
    # Extract text
    start_idx = entry["startLine"] - 1  # Convert to 0-indexed
    end_idx = entry["endLine"]  # endLine is already 1-indexed inclusive
    text = "".join(lines[start_idx:end_idx])
    
    # Format and output
    spec = format_doc(name, entry["startLine"], entry["endLine"], text)
    print(spec)


if __name__ == "__main__":
    main()
