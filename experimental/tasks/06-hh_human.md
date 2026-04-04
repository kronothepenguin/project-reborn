# Task: hh_human — Avatar Rendering Core

**Priority:** P3  
**Status:** 🔴 Not started  
**Source:** `casts/hh_human/` (10 script members, 4 `.window.txt`, variable.index, animation data files)

## Description

The avatar rendering engine — part-based compositing system. Assembles avatars from body parts (body, face, hair, hats, accessories, legs, shirts, shoes) using figure data and animation frames.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Human Class EX` | Script | ⭐ Main avatar class (1249+ lines), part-based rendering, animation |
| `Swimmer Class EX` | Script | Swimming avatar variant |
| `Bot Object Class` | Script | NPC/bot rendering |
| `Bodypart Class EX` | Script | Individual body part renderer |
| `Swimpart Class EX` | Script | Swimming body part |
| `Figure Data Class` | Script | Avatar figure data container |
| `Figure System Class` | Script | Figure assembly system |
| `Figure Preview Class` | Script | Avatar preview rendering |
| `Human Template Class` | Script | Figure template management |
| `Change Clothes Effect Class` | Script | Clothing change animation |

## Variable Index (`1_variable.index.txt`)
```
human.size.32 = sh          # Small 32px prefix
human.size.64 = h           # Large 64px prefix
human.canvas.sh = ...       # Canvas size for small avatars
human.canvas.h = ...        # Canvas size for large avatars
human.parts.*               # Body part rendering order lists
human.parts.*.*             # Per-part rendering order (body, face, hair, etc.)
```
- Hand item mapping: camera, right-hand items 3-30

## Animation Data Files (4)
- `dance.1` — Dance animation frame definitions
- `dance.2` — Dance 2 animation
- `dance.3` — Dance 3 animation
- `dance.4` — Dance 4 animation

## Window Files (4)
- Various avatar-related windows

## Avatar Sprite Data Casts (NOT translated — pure bitmaps)
These casts contain ONLY bitmap/palette data used by Human Class EX:

| Cast | Content |
|------|---------|
| `hh_human_body` | Body/torso sprites (stand, walk, sit, lay — directions 0-7) |
| `hh_human_face` | Face expressions (std, speak, smile, angry, sad, lay) + eye layers |
| `hh_human_hair` | Hair front/back sprites, 50+ styles (IDs 1-27, 200-203, 501-507) |
| `hh_human_acc_eye` | Eye accessories (glasses, IDs 1-6) |
| `hh_human_acc_face` | Face accessories (gas mask, tiki mask, doc mask, IDs 1-12) |
| `hh_human_acc_head` | Head accessories (IDs 1-10) |
| `hh_human_hats` | Hats, 27+ styles + palettes |
| `hh_human_item` | Held items (carry right, drink right, IDs 1-44) |
| `hh_human_leg` | Leg sprites (IDs 1-7, 200-201) |
| `hh_human_shirt` | Shirt/torso with sleeves (many IDs) |
| `hh_human_shoe` | Shoe sprites (IDs 1-8) |

### Small (32px) Variants
| Cast | Content |
|------|---------|
| `hh_human_50_body` | Small body sprites (`sh_std_bd`) |
| `hh_human_50_face` | Small face sprites (`sh_std_fc`) |
| `hh_human_50_hair` | Small hair sprites (`sh_std_hr`), 620+ members |
| `hh_human_50_acc_eye` | Small eye accessories |
| `hh_human_50_acc_face` | Small face accessories (with memberalias.index) |
| `hh_human_50_acc_head` | Small head accessories |
| `hh_human_50_hats` | Small hats (with memberalias.index) |

### Naming Convention
`{size}_{action}_{part}_{id}_{direction}_{frame}`
- Size: `h` (64px) or `sh` (32px)
- Action: `std` (standing), `wlk` (walking), `sit`, `lay`, `spk` (speaking), `sml` (smiling), `agr` (angry), `crr` (carrying), `drk` (drinking), `wav` (waving), `eyb` (eyes blinking)
- Part: `bd` (body), `fc` (face), `hr/hrb` (hair back), `ha` (hat), `lg` (leg), `ch` (chest/shirt), `sh` (shoe), `ea` (eye acc), `fa` (face acc), `he` (head acc), `ri` (right item)

## Translation Criteria

1. **Human Class EX**: ⭐ Most complex single class — part-based avatar compositing
   - Reads figure data (part IDs) → assembles layers in correct order
   - Animations: idle, walk, sit, lay, speak, smile, angry, wave, dance
   - Supports both 32px (small) and 64px (large) resolutions
   - Direction system: 8 directions (0-7) for isometric rotation

2. **Figure Data Class**: Container for figure string parsing
   - Figure string format: `partId-partId-partId...` for each body part
   - Parses figure data from server messages

3. **Bodypart Class EX**: Individual layer renderer
   - Each body part is a bitmap layer composited together
   - Handles color palettes for shirts, hair, etc.

4. **Figure Preview Class**: Avatar preview (e.g., in catalogue, profile)
   - Renders avatar at a specific pose/action for display

5. **Change Clothes Effect Class**: Animation when avatar changes appearance
   - Transition effect (fade, spin, etc.)

## Cross-Cast Dependencies
- Reads `human.parts.*` variables from all `hh_human_*` data casts
- References `#room` thread for geometry (tile-to-screen conversion)
- Uses members from `hh_interface` for typing bubble and shadow graphics

## Notes
- Avatar rendering is CRITICAL — every visible human in a room uses this
- The 32px vs 64px variants support different room resolutions
- Dance animations are defined in external data files (dance.1-4)
- Bot rendering is simpler (fixed figure, no customization)
- For MVP: can use simplified placeholder avatars with basic animations
