# Task: hh_kiosk_room — Roomatic (Room Creation Kiosk)

**Priority:** P7  
**Status:** 🔴 Not started  
**Source:** `casts/hh_kiosk_room/` (2 scripts, 10 `.window.txt`, thread.index, variable.index, memberalias.index, bitmaps)

## Description

The Roomatic — the room creation/modification kiosk. Players use this to create new rooms, modify existing rooms, and manage room settings.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `RoomKiosk Interface/Component/Handler Class` | 3 scripts | Roomatic kiosk system |
| `Roommatic Class` | 1 script | The Roomatic machine furniture |

## Thread Index
```
thread.id = roomkiosk
```

## Window Files (10)
- `roomatic1-7.window.txt` — Roomatic machine screens (7 steps)
- `roomatic_club.window.txt` — HC-only room features

## Bitmaps
- Roomatic machine parts (screen, upper, sides, lower)
- Green checkbox/radio buttons
- Room layout previews (models a-r through q)
- Arrow buttons, HC badge

## Translation Criteria

1. **RoomKiosk Interface**: Multi-step room creation wizard
2. **Roommatic Machine**: Furniture item that opens the kiosk when clicked
3. **Room Creation Flow**: Name → description → model → max users → access type → tags
4. **HC Features**: Club-only room options (special decorations, features)
5. **Layout Previews**: Show room model preview images

## Cross-Cast Dependencies
- Uses `hh_room` for room creation API
- Uses `hh_club` for HC-only room features
- Uses `hh_interface` for UI elements
