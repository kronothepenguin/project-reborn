# Task: hh_room — Room Core System

**Priority:** P2  
**Status:** 🔴 Not started  
**Source:** `casts/hh_room/` (3 `.ls` scripts + other members, 4 `.window.txt`, thread.index, variable.index)

## Description

The core room system — loading, geometry, and rendering. Coordinates all room subsystems: avatars, furniture, chat, trading, and room events.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Room Interface Class` | Script | Main room entry point, coordinates all subsystems |
| `Room Component Class` | Script | Room state management |
| `Room Handler Class` | Script | Server message handling for rooms |
| `Spectator System Class` | Script | Spectator mode |
| `Room Geometry Class` | Script | Isometric tile math, screen coordinate conversion |
| `Room Hilite Class` | Script | Tile highlighting / selection |

## Thread Index (`1_thread.index.txt`)
```
thread.id = room
interface.class = Room Interface Class
component.class = Room Component Class
handler.class = Room Handler Class
```

## Window Files (4)
- `room_loader.window.txt` — Room loading screen
- `room_loader_2.window.txt` — Room loading screen variant 2
- `room_loader_small.window.txt` — Small resolution loading screen
- `room_bar_spectator.window.txt` — Spectator bar

## Translation Criteria

1. **Room Interface Class**: Main coordinator — creates/destroys room objects, handles room lifecycle
2. **Room Geometry Class**: ⭐ Critical — isometric tile math:
   - Tile size: configurable (default ~32px or ~64px)
   - `tileToScreen(tileX, tileY)` → `{screenX, screenY}`
   - `screenToTile(screenX, screenY)` → `{tileX, tileY}`
   - Handles wall positions, furniture stacking, height levels
3. **Room Component Class**: State management — room data, owner, description, furniture list
4. **Room Handler Class**: Server message parsing — `ROOMDATA`, `USERS`, `ITEMS`, `HEIGHTMAP`, etc.
5. **Spectator System**: View-only mode without interaction
6. **Room Hiliter**: Visual feedback for hovered tiles

## Cross-Cast Dependencies
- Creates objects from `hh_room_utils` (Safe Trader, Object Mover, Doorbell, Room GUI, Info Stand, Badge Manager, Preview Renderer, Ignore List)
- References `#room` thread from many casts
- Uses `human.size.*` variables from `hh_human` for avatar sizing
- Uses `hh_buffer` for loading placeholders
- Uses `hh_furni_classes` for furniture object classes

## Notes
- This is one of the MOST complex casts — the heart of the game
- Room geometry uses isometric projection
- Server protocol: text-based messages over socket connection
- The Room Handler parses incoming server messages and updates room state
