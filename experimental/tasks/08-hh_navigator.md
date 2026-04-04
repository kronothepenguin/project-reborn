# Task: hh_navigator — Room Browser & Navigator

**Priority:** P4  
**Status:** 🔴 Not started  
**Source:** `casts/hh_navigator/` (5 script members, 15 `.window.txt`, thread.index, variable.index)

## Description

The room browser/navigator system. Players use this to browse, search, and enter rooms. Includes room listings, categories, favorites, and room management.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Navigator Window Interface Class` | Script | Main navigator window |
| `Navigator Roomlist Interface Class` | Script | Room list display |
| `Navigator Component Class` | Script | Navigator state/component |
| `Navigator Handler Class` | Script | Server message handling |
| `Navigator Info Broker Class` | Script | Shares room data between systems |

## Thread Index (`1_thread.index.txt`)
```
thread.id = navigator
interface.class = [Navigator Roomlist Interface Class, Navigator Window Interface Class]
component.class = Navigator Component Class
handler.class = Navigator Handler Class
```

## Window Files (15)
- `nav_pr.window.txt` — Private rooms
- `nav_gr0.window.txt` — Group rooms
- `nav_gr_src.window.txt` — Group rooms (source)
- `nav_gr_own.window.txt` — Group rooms (owned)
- `nav_gr_fav.window.txt` — Group rooms (favorites)
- `nav_gr_password.window.txt` — Password-protected rooms
- `nav_gr_modify_delete*.window.txt` — Room modify/delete dialogs
- `nav_remove_rights.window.txt` — Remove rights dialog

## Translation Criteria

1. **Navigator Window**: Main browser — tabs for public, private, favorites, categories
2. **Room List**: Paginated list with room name, occupancy, description, thumbnail
3. **Info Broker**: Shares room data with `hh_room_ui` (navigator popup in room)
4. **Room Management**: Create/delete/modify rooms, set passwords, manage rights
5. **Categories**: Public rooms, tagged rooms, popular, group rooms

## Cross-Cast Dependencies
- Uses `hh_interface` for UI widgets
- Uses `hh_shared` for connection info
- Referenced by `hh_room_ui` for navigator popup in rooms
