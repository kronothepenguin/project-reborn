# Director MX 2004 API Inventory

This document summarizes the complete inventory of Director MX 2004 methods and properties extracted from the official scripting reference.

## Source

- **Document**: `docs/drmx2004_scripting_ref.txt`
- **Total Lines**: 57,648
- **Extraction Script**: `scripts/extract-director-inventory.py`
- **Output**: `docs/director-inventory.json`

## Summary

### Methods (Chapter 12)
- **Total**: 486 methods
- **Unique**: 484 methods
- **Line Range**: 11,734 - 30,369

#### Categories
| Category | Count | Description |
|----------|-------|-------------|
| 3d | 76 | 3D modeling, camera, and scene methods |
| dvd | 15 | DVD playback control methods |
| general | 311 | General purpose methods |
| list | 27 | List manipulation methods |
| network | 13 | Network and URL operations |
| math | 11 | Mathematical functions |
| access | 7 | Member/sprite/cast access |
| conversion | 7 | Type conversion functions |
| control | 5 | Flow control (halt, quit, go) |
| bitwise | 4 | Bitwise operations |
| typecheck | 8 | Type checking functions |
| sound | 2 | Sound playback methods |

### Properties (Chapter 14)
- **Total**: 763 properties
- **Unique**: 763 properties
- **Line Range**: 31,405 - 57,648

#### Categories
| Category | Count | Description |
|----------|-------|-------------|
| simple | 755 | Simple property names |
| top-level | 7 | Top-level objects (_global, _movie, etc.) |
| object-face[index] | 1 | 3D face array property |

## Implementation Status

### Do Not Implement (Per User Requirements)
- **3D Methods**: 76 methods marked as "3d" category
- **DVD Methods**: 15 methods marked as "dvd" category
- **Total Excluded**: 91 methods

### To Implement
- **Methods**: 395 methods (486 - 91 excluded)
- **Properties**: 763 properties

## File Structure

Each method/property will have its own spec file containing:
1. Full documentation from Director MX 2004 reference
2. Usage (Lingo syntax only)
3. Description
4. Parameters
5. Example (for test generation)
6. Implementation notes (file location, dependencies)

## Next Steps

1. Update `director-architecture` change with spec template
2. Create per-area changes with full documentation:
   - Core data types (List, PropList, Point, Rect, Color)
   - Core ref classes (MemberRef, SpriteRef, MovieRef, etc.)
   - API functions (grouped by category)
   - Runtime (canvas, custom elements, event loop)
   - Syntax (the proxy, chunk expressions)

## Statistics

- **Total API Surface**: 1,249 items (486 methods + 763 properties)
- **Implementable**: 1,158 items (395 methods + 763 properties)
- **Excluded**: 91 items (3D + DVD methods)
- **Spec Files to Create**: ~1,158 files
- **Estimated Changes**: ~25 OpenSpec changes
