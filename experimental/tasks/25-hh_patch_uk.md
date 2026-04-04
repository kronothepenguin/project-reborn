# Task: hh_patch_uk — UK Region Patch

**Priority:** P8 (Lowest)  
**Status:** 🔴 Not started  
**Source:** `casts/hh_patch_uk/` (0 scripts, lists, palettes)

## Description

UK-specific patch data — character continent/country lists, swimmer figure IDs, messenger button palettes, poster index list, catalogue headline graphics for various themes.

## Contents

- **NO scripts** — pure data cast
- Character continent/country lists
- Swimmer figure IDs for UK region
- Messenger button palettes
- Poster index list
- Catalogue headline graphics for various themes (seasonal events, etc.)

## Translation Criteria

1. **Data Only**: No code to translate — this is configuration/graphics data
2. **Region-Specific**: UK-only customizations (hotel name, character names, etc.)
3. **Catalogue Headlines**: Theme-specific headline graphics for catalogue pages
4. **Swimmer Figures**: UK-specific swimmer avatar variants

## Cross-Cast Dependencies
- Used by `hh_entry_uk` for UK entry graphics
- Used by `hh_cat_code` for themed catalogue headlines

## Notes
- This is the LOWEST priority cast — UK-specific customizations
- Can be safely deferred or stubbed for initial release
- Data can be embedded as JSON configuration
