# Task: hh_interface — Shared UI Graphics Foundation

**Priority:** P1  
**Status:** 🔴 Not started  
**Source:** `casts/hh_interface/` (0 scripts, 42 `.window.txt`, 600+ bitmaps, memberalias.index, variable.index)

## Description

The shared UI graphics foundation used by ALL other casts. Complete UI widget library: window chrome, buttons, dropdowns, chat bubbles, navigator icons, room bar elements, catalogue thumbnails, and 600+ bitmap members.

## Window Files (42)

### System Windows
- `general_loader.window.txt` — Loading screen
- `habbo_simple/basic/full/system.window.txt` — Main application window variants
- `habbo_message_dialog.window.txt` — Message/alert dialog
- `habbo_decision_dialog.window.txt` — Yes/no confirmation dialog
- `habbo_alert_a/b/c.window.txt` — Alert variants

### Purse & Help
- `habbo_purse.window.txt` — Credits display
- `habbo_help.window.txt` — Help panel
- `habbo_ph_tickets.window.txt` — Passport/tickets display
- `habbo_badge_select.window.txt` — Badge selection grid

### Moderation
- `habbo_hobba_compose.window.txt` — Compose moderation message
- `habbo_hobba_alertsent.window.txt` — Alert sent confirmation

### Widgets
- `habbo_stickies/stickie_vd.window.txt` — Sticky notes
- `achievements.window.txt` — Achievement badges
- `credit_redeem.window.txt` — Credit redemption dialog
- `help_tooltip.window.txt` — Help tooltip
- `ig_arena_queue.window.txt` — Arena queue display
- `badge_select.window.txt` — Badge picker
- `scrollbar/dropdown/button elements` — Widget templates

## Bitmap Categories (600+)

| Category | Description |
|----------|-------------|
| Window chrome | Top/middle/bottom corners and edges |
| Panels | Grid and content panel backgrounds |
| Tabs | Tab control graphics |
| Shadows | Shadow elements for depth |
| Buttons | Close, radio, checkbox, scroll, a/b/c/d/e variants |
| Dropdowns | Two dropdown styles |
| Cursors | Finger, scale cursors |
| System icons | Club, hobba, messenger, building, credits, help, brochure, hand, gift, mod tool, redeem |
| Navigator icons | Help, room, info, people, colored room, multi-room, lock states |
| Room bar | Occupancy indicators, popup corners, balloon elements |
| Chat bubbles | Left/middle/right/pointer/typing, colored variants |
| Event browser | Event browser graphics |
| Popup invitation | Popup invitation graphics |
| Public room thumbnails | 50+ public room thumbnails (pizzeria, cinema, cafe, park, etc.) |
| Post-it notes | Various colors and message counts |
| Furniture icons | Small furniture icons for catalogue |
| Sound icons | Sound on/off, ticket icon, film icon |
| Debug UI | Debug UI elements |

## Translation Criteria

1. **Window files**: Parse XML-like layout → JS objects for Canvas rendering
2. **Bitmaps**: In the JS version, these will be loaded as image assets or drawn procedurally
3. **Widget system**: Create reusable Canvas/DOM widget components
4. **Chat bubbles**: Critical — implement with Canvas path drawing for the pointer tail
5. **Window chrome**: 9-slice scaling for window borders (corners fixed, edges stretch)
6. **Icons**: Can be SVG or Canvas-drawn for scalability

## Dependencies
- `fuse_client` (Window API, Visualizer API)
- This cast has NO scripts — it's pure data/graphics consumed by other casts

## Notes
- This is the LARGEST graphics cast
- No code to translate — only window layouts and bitmaps
- For MVP, can use placeholder shapes/colors instead of exact bitmaps
- Window layout parsing is critical for the window system to work
