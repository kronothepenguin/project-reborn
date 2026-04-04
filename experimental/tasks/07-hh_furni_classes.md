# Task: hh_furni_classes — Furniture Object Classes

**Priority:** P3  
**Status:** 🔴 Not started  
**Source:** `casts/hh_furni_classes/` (38 script members, 1 `.window.txt`, variable.index, fuse.object.classes)

## Description

The furniture object class hierarchy. All furniture in rooms inherits from these base classes. Each furniture type has specific behavior (interactive, passive, animated, etc.).

## Key Classes (38 scripts)

### Base Classes
| Member | Description |
|--------|-------------|
| `Active Object Class` | ⭐ Base class for standing/walking furniture (animated) |
| `Passive Object Class` | Non-interactive furniture (static) |
| `Item Object Class` | Wall-mounted items |
| `Active Object Extension Class` | Extension behavior for active objects |
| `Item Object Extension Class` | Extension for wall items |
| `Preview Renderer Class` | ⭐ Renders item preview images (used everywhere) |

### Specific Furniture Types
| Member | Description |
|--------|-------------|
| `Habbo Wheel Class` | Wheel furniture |
| `PostIt Item/Manager Class` | Sticky notes (configurable message count) |
| `Pet Toy Class` | Pet interaction items |
| `Credit Redeem Confirmation/Furni Class` | Credit furniture |
| `Furniture Holo Class` | Hologram furniture (floating/translucent) |
| `Furniture Fridge/Sink/Toilet/Luxus TV Class` | Specific furniture types |
| `Furniture Teleport/Divider/Samovar/Edicehc Class` | Interactive furniture |
| `Furniture Score/Hockeylight/Traffic Light/Barrier Class` | Score/display furniture |
| `Trophy/Plate/Watermatic Class` | Decorative furniture |
| `Furniture Food/Waterbowl/IcecreamMachine Class` | Pet-related furniture |
| `Queue/Queue Public Class` | Queue furniture |
| `Furniture Scifirocket/Scifidoor/Scifiport Class` | Sci-fi themed furniture |
| `Furniture Club TV/StudyDesk/Solarium/Bottle Class` | Club/special furniture |
| `Furniture Red TV/OneWayDoor Class` | Special furniture |
| `E-Dice/Birdie/Present/Package Card/Fortune/Window Class` | Various interactive furniture |
| `Crossfade Furni/FadeAnimation Furni Class` | Animation effects |
| `Valentine Randomizer Class` | Event-specific furniture |

## fuse.object.classes (`2_fuse.object.classes.txt`)
Maps furniture class names to their Lingo script member. Format:
```
className = scriptMemberName
```

## Window Files (1)
- `package_card.window.txt` — Package card UI

## Bitmaps
- `room_object_placeholder_sd` / `room_object_placeholder` / `s_room_object_placeholder` — Furniture placeholders
- `watermatic_a_0_4_0` / `watermatic_sd` — Watermatic graphics
- `no_icon_small` — Missing icon placeholder
- `kiosk palette` — Color palette

## Translation Criteria

1. **Active Object Class**: Animated furniture — has states (stand, walk, sit, use)
2. **Passive Object Class**: Static furniture — no animation, just display
3. **Item Object Class**: Wall-mounted — different coordinate system (wall vs floor)
4. **Preview Renderer**: ⭐ Used by catalogue, hand strip, trading, info stands
   - Generates preview images of furniture at various sizes
   - Applies color palettes to furniture sprites
5. **Each furniture type**: Extends base class with specific behavior
   - Some have dialogs (PostIt, Trophy)
   - Some animate (Wheel, Holo, Scifiport)
   - Some interact with pets (Food, Waterbowl)
   - Some are tradeable (Credits, Presents)

## Cross-Cast Dependencies
- `Preview Renderer` is called from `hh_room_utils` (Safe Trader, Container Hand)
- Used by `hh_cat_code` for catalogue previews
- Used by `hh_recycler` for recycler preview

## Notes
- Each furniture type extends a base class (Active, Passive, or Item)
- The class registry (`fuse.object.classes.txt`) maps server class names to script members
- Furniture loading is dynamic — classes may be loaded on-demand from .cct files
- For MVP: can implement base classes + a few furniture types as proof of concept
