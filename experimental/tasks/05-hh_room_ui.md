# Task: hh_room_ui — Room GUI & HUD

**Priority:** P2  
**Status:** 🔴 Not started  
**Source:** `casts/hh_room_ui/` (2 `.ls` scripts + other members, 29 `.window.txt`, variable.index)

## Description

The in-room HUD — room bar, info panels, object display windows. All UI elements visible while inside a room.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Room GUI Class` | Script | Main room bar controller |
| `Room Bar Class` | Script | Room bar UI element |
| `Room Info Class` | Script | Room information display |
| `Room Object Displayer Class` | Script | Object info windows |
| `Room Object Window Creator Class` | Script | Factory for object info windows |
| `Tag List Class` | Script | Tag list UI |
| `Infostand Text Scroller Class` | Script | Scrolling text in info stands |
| `Popup Controller Class` | Script | Popup window management |
| `Navigator Popup Class` | Script | Navigator popup (embedded in room) |
| `Room Bar Extensions Manager` | Script | Extension system for room bar |
| `Invitation Class` | Script | Room invitation handling |
| `Instant Friend Request Class` | Script | Friend request UI |

## Window Files (29)

### Object Displayers
- `obj_disp_human.window.txt` — Human avatar info panel
- `obj_disp_furni.window.txt` — Furniture info panel
- `obj_disp_pet.window.txt` — Pet info panel
- `obj_disp_links_own.window.txt` — Owner links panel
- `obj_disp_actions_own.window.txt` — Owner actions panel
- `obj_disp_actions_peer.window.txt` — Peer actions panel
- `obj_disp_actions_furni.window.txt` — Furniture actions panel

### Room Info
- `room_info.window.txt` — Main room info panel
- `room_info_event_details.window.txt` — Event details
- `navigator_popup.window.txt` — Navigator popup (in-room)

### Social
- `invitation.window.txt` — Room invitation
- `instant_friend_request.window.txt` — Friend request
- `nuh_invitation.window.txt` — New User Help invitation
- `badge_info.window.txt` — Badge info display

## Translation Criteria

1. **Room GUI Class**: Controller for the room bar — shows room name, owner, occupancy, tools
2. **Object Displayers**: Show info when clicking on humans, furniture, or pets in the room
3. **Popup Controller**: Manages z-ordering and visibility of popup windows
4. **Navigator Popup**: Embedded room navigator accessible from within a room
5. **Tag List**: Displays room tags/keywords
6. **Room Bar Extensions**: Plugin system for adding custom buttons/features to room bar

## Cross-Cast Dependencies
- Uses `hh_interface` for window chrome and UI elements
- Uses `hh_shared` for moderation tools
- References `#room` thread
- References `#navigator` thread for navigator popup

## Notes
- This cast is primarily UI windows — less complex logic than hh_room or hh_room_utils
- Object displayers need to show different info types (human, furni, pet) with appropriate actions
- Popup controller needs z-ordering and click-outside-to-close behavior
