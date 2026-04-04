# Task: hh_pets — Pet System

**Priority:** P5  
**Status:** 🔴 Not started  
**Source:** `casts/hh_pets/` (2 scripts, 1 `.window.txt`, pet.definitions, petColors, memberalias.index)  
**Paired with:** `casts/hh_pets_common/` (0 scripts, 600+ bitmaps, 25+ palettes)

## Description

Pet behavior and rendering system. Supports dogs, cats, and crocodiles with part-based rendering (body, head, tail) and color customization.

## Key Classes (hh_pets)

| Member | Type | Description |
|--------|------|-------------|
| `Pet Class` | Script | Pet behavior and rendering |
| `Petpart Class` | Script | Pet body part rendering |

## Pet Sprite Data (hh_pets_common — 600+ bitmaps)

### Body Sprites
- `p_std_bd_round`, `p_wlk_bd_round`, `p_sit_bd_round`, `p_lay_bd_round`, `p_jmp_bd_round`
- Variants for each species: dog, cat, croco

### Head Sprites (per species)
- Expressions: std, eyb (blink), sml (smile), joy (joy), agr (angry), sad, mis (mischief), srp (surprise), puz (puzzled), tng (tongue), crz (crazy), snf (sniff), spk (speak), ded (dead), beg (begging), slp (sleep), eat (eating)

### Tail Sprites
- `p_std_tl_long`, `p_std_tl_short`, `p_std_tl_flat`

### Color Palettes (25+)
- Palette dogcat 000-024 (25 color variants for dogs/cats)
- Palette croco 000 (crocodile colors)

### Pet Items
- `petfood1-4`, `waterbowl`, `goodie1-2`, `nest`, `toy1`

## Data Files
- `pet.definitions` — Pet type definitions
- `petColors_dog/cat/croco` — Color mapping data
- `petstatus.window.txt` — Pet status display

## Offset Data
- Offset data for dog/cat/croco large/small variants

## Translation Criteria

1. **Pet Class**: Similar to Human Class but simpler — part-based rendering with body, head, tail
2. **Petpart Class**: Individual part renderer with color palette application
3. **Color System**: Apply color palettes to body parts (like hair color for humans)
4. **Expressions**: Map pet mood/state to specific animation frames
5. **Pet Items**: Food, toys, nest — placed in room as furniture (from `hh_furni_classes`)

## Cross-Cast Dependencies
- `hh_pets_common` provides bitmap data only
- Pet toys from `hh_furni_classes` (Pet Toy Class)
- Pets appear in rooms → uses room geometry from `hh_room`

## Notes
- Pet system is simpler than human avatars but uses similar compositing approach
- For MVP: can use simplified pet rendering with fewer expressions
