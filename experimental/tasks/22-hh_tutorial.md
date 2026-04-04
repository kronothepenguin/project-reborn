# Task: hh_tutorial — Tutorial & New User Help (NUH)

**Priority:** P7  
**Status:** 🔴 Not started  
**Source:** `casts/hh_tutorial/` (7 scripts, 6 `.window.txt`, thread.index, variable.index)

## Description

Tutorial system and New User Help (NUH). Animated guide character walks new players through basic features.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Tutorial Interface/Component/Handler Class` | 3 scripts | Tutorial system |
| `Tutor Character Class` | Script | ⭐ Animated guide character |
| `Bubble Class` | Script | Tutorial speech bubble |
| `Link Bubble Class` | Script | Bubble with clickable links |
| `Static Bubble Class` | Script | Non-interactive bubble |
| `Update Bubble Class` | Script | Bubble with updateable content |
| `NUH Interface/Component/Handler Class` | 3 scripts | New User Help system |

## Thread Index
```
thread.id = tutorial
```

## Window Files (6)
- `guide_character.window.txt` — Guide character display
- `bubble/bubble_text/bubble_links/bubble_static.window.txt` — Bubble variants
- `tutorial_exit_menu.window.txt` — Exit tutorial menu

## Translation Criteria

1. **Tutorial System**: Step-by-step tutorial with animated guide character
2. **Tutor Character**: Animated character that appears in room, moves to point of interest, speaks
3. **Bubble System**: Speech bubbles with text, links, or static info
4. **NUH**: New User Help — simplified tutorial for first-time players
5. **Exit Menu**: Option to skip/exit tutorial

## Cross-Cast Dependencies
- Uses `hh_interface` for bubble graphics
- Referenced by `hh_room_ui` for NUH invitation in rooms
