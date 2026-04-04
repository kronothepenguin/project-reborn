# Task: hh_buffer — Furniture Buffer & Placeholders

**Priority:** P7  
**Status:** 🔴 Not started  
**Source:** `casts/hh_buffer/` (2 scripts, thread.index, variable.index, memberalias.index, bitmaps)

## Description

Furniture buffer/placeholder system for items loading into rooms. Shows animated loading placeholders while furniture is being downloaded.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Buffer Component Class` | Script | Buffer state management |
| `Buffer Handler Class` | Script | Buffer message handling |
| `Furniture Placeholder Class` | Script | Animated loading placeholder |

## Thread Index
```
thread.id = buffer
```

## Bitmaps
- Active placeholder animations (7 frames)
- Small placeholder variants
- Item placeholder sprites for leftwall mounting

## Translation Criteria

1. **Buffer Component**: Manages loading queue for furniture not yet downloaded
2. **Placeholder**: Animated sprite shown while actual furniture loads
3. **Dynamic Downloading**: Coordinates with `hh_dynamic_downloader` to fetch missing .cct casts
4. **Wall Items**: Special placeholder orientation for wall-mounted items

## Cross-Cast Dependencies
- Used by `hh_room` for loading furniture into rooms
- Coordinates with `hh_dynamic_downloader` for asset loading
- Uses `hh_furni_classes` for placeholder icons
