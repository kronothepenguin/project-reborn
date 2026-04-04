# Task: hh_room_utils — Room Subsystems

**Priority:** P2  
**Status:** 🔴 Not started  
**Source:** `casts/hh_room_utils/` (20 script members, 15 `.window.txt`)

## Description

Supporting room subsystems instantiated by hh_room but kept as separate casts. Includes trading, chat, furniture moving, badges, doorbell, and more.

## Key Classes (20 scripts)

### Trading & Furniture
| Member | Description |
|--------|-------------|
| `Safe Trader Class` | ⭐ Full trading system (878 lines) — trade negotiation, item verification |
| `Furni Chooser Class` | Furniture picker UI |
| `Container Hand Class` | Hand item container (strip items, placing furniture) |
| `Object Mover Class` | ⭐ Drag-and-drop furniture placement |
| `OneWayDoor Manager Class` | One-way door handling |

### Chat System
| Member | Description |
|--------|-------------|
| `Chat Manager` | Chat message routing |
| `Chat Display` | Chat rendering in room |
| `Chat Bubble Normal` | Normal chat bubble |
| `Chat Bubble Unheard` | Unheard/muted chat bubble |
| `Chat Bubble Info Basic` | Info/system chat bubble |
| `Flood Blocking Class` | Chat flood protection |

### UI & Management
| Member | Description |
|--------|-------------|
| `Room Info Class` | Room information display |
| `Badge Manager Class` | Badge management |
| `Badge Effect Class` | Badge visual effects |
| `Badge List Class` | Badge display grid |
| `Ignore List Class` | Chat ignore list |
| `Info Stand Class` | Furni info display |
| `User Chooser Class` | User selection UI |
| `Group Info Class` | Group information |
| `Details Bubble Class` | Detail tooltip bubbles |

### Room Events & Ads
| Member | Description |
|--------|-------------|
| `RoomEvent List Class` | Room event browser |
| `RoomEvent Browser Class` | Room event display |
| `Ad Manager` | Advertisement system |
| `Interstitial Manager` | Interstitial ad display |

### Dialogs & Misc
| Member | Description |
|--------|-------------|
| `Dialog Thread Class` | In-room dialogs |
| `Dialog Handler Class` | Dialog message handling |
| `HumanExtra Sign Class` | User sign/carrying indicator |
| `Select Arrow Class` | Selection arrow |
| `Doorbell Class` | Room doorbell system |
| `Shadow Manager` | Avatar shadow rendering |

## Window Files (15)
- `group_info.window.txt` — Group info panel
- `room_bar.window.txt` — Main room bar
- `info_stand.window.txt` — Info stand display
- `object_interface.window.txt` — Object interaction panel
- `habbo_trading.window.txt` — Trading window
- `chooser.window.txt` — Item chooser
- `habbo_doorbell.window.txt` — Doorbell dialog
- `roomevent_browser.window.txt` — Event browser
- `roomevent_create.window.txt` — Event creation
- Plus more...

## Translation Criteria

1. **Safe Trader**: Full trade protocol — must match server messages exactly
2. **Chat System**: Canvas-based bubble rendering with pointer tails
3. **Object Mover**: Mouse drag → isometric tile snap → server `MOVE` message
4. **Doorbell**: Knock notification when someone enters room
5. **Flood Blocking**: Timer-based message throttling
6. **Badge Manager**: Badge effects, display grid, selection
7. **Ad Manager**: Periodic interstitial display

## Cross-Cast Dependencies
- `Safe Trader` references `#room` thread, `#dynamicdownloader` thread, `Preview_renderer` object (from `hh_furni_classes`), `session` thread
- `Chat system` uses members from `hh_interface` for bubble graphics
- `Container Hand Class` uses `#dynamicdownloader` for icon downloads
- References `#room` thread extensively

## Notes
- Safe Trader is the largest single file (878 lines) — critical for trading feature
- Chat system is the most frequently used visual feature
- Object Mover requires precise isometric coordinate math
