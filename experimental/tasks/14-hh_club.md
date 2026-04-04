# Task: hh_club — Habbo Club (HC) System

**Priority:** P5  
**Status:** 🔴 Not started  
**Source:** `casts/hh_club/` (3 scripts, 5 `.window.txt`, thread.index, bitmaps)

## Description

Habbo Club membership system. Purchase HC, check status, view benefits.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Club Interface Class` | Script | HC window/controller |
| `Club Component Class` | Script | HC state |
| `Club Handler Class` | Script | Server messages |

## Thread Index
```
thread.id = club
```

## Window Files (5)
- `habbo_club_buy.window.txt` — Purchase HC dialog
- `habbo_club_buy_jp.window.txt` — JP variant
- `habbo_club_ended.window.txt` — HC ended notification
- `habbo_club_confirm.window.txt` — Purchase confirmation
- `habbo_club_status.window.txt` — HC status display

## Bitmaps
- HC badges (old style), timeline graphics, portier character

## Translation Criteria

1. **Club Interface**: Purchase dialog with duration options, price display
2. **Status Display**: Current membership status, days remaining
3. **Ended Notification**: Alert when membership expires
4. **HC Benefits**: Access to exclusive rooms, furniture, features

## Cross-Cast Dependencies
- Uses `hh_interface` for UI
- Referenced by `hh_kiosk_room` for HC-only room features
- Referenced by `hh_cat_code` for HC catalogue pages
