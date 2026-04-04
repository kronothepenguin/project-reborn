# Task: hh_cat_gfx_all — Catalogue Graphics

**Priority:** P4  
**Status:** 🔴 Not started  
**Source:** `casts/hh_cat_gfx_all/` (0 scripts, 28 `.window.txt`, 400+ bitmaps/palettes, memberalias.index)

## Description

The catalogue graphics layer. Contains 28 catalogue page window definitions, 400+ bitmap/palette members for catalogue pages, patterns, teasers, and preview images.

## Window Files (28)
- `ctlg_layout1/2.window.txt` — Catalogue page layouts
- `ctlg_frontpage1/2.window.txt` — Front pages
- `ctlg_productpage1/2/3/2b/3b.window.txt` — Product pages (variants)
- `ctlg_infopage1/2.window.txt` — Info pages
- `ctlg_loading.window.txt` — Loading screen
- `ctlg_spaces.window.txt` — Public rooms page
- `ctlg_plasto.window.txt` — Wall/floor patterns page
- `ctlg_club1/2.window.txt` — Habbo Club pages
- `ctlg_presents.window.txt` — Presents page
- `ctlg_norares.window.txt` — No rares page
- `ctlg_trophies.window.txt` — Trophies page
- `ctlg_pets/pets2.window.txt` — Pet catalogue pages
- `ctlg_recycler.window.txt` — Recycler page
- `ctlg_soundmachine.window.txt` — Sound machine page
- `ctlg_collectibles.window.txt` — Collectibles page
- `ctlg_purse.window.txt` — Purse display
- `ctlg_camera1/2.window.txt` — Camera pages

## Bitmap Categories (400+)
| Category | Description |
|----------|-------------|
| Page backgrounds | Catalogue page background graphics |
| Buttons | Catalogue navigation buttons |
| Dynamic deal graphics | Numbered deal images (deal 0-120+) |
| Wall/floor patterns | 20+ wall patterns, 15+ floor patterns, color variants |
| Landscape patterns | Pattern/gradient definitions |
| Seasonal teasers | Halloween, Xmas, Love, Easter, etc. |
| Pet teasers | Pet preview images |
| Limited edition teasers | Limited rare previews |
| Noob set previews | Starter package previews |

## Translation Criteria

1. **Page layouts**: 9-slice scaled backgrounds with product slots
2. **Pattern palettes**: Wall/floor/landscape color pickers — show pattern swatches
3. **Deal graphics**: Pre-rendered numbered images for dynamic deals
4. **Teasers**: Seasonal theme images — change based on current hotel event
5. **Window parsing**: Parse .window.txt files → Canvas layout objects

## Cross-Cast Dependencies
- Used by `hh_cat_code` for catalogue rendering
- Pattern palettes used by room wallpaper/floor selection

## Notes
- This is a pure graphics/data cast — no code to translate
- Window layouts define the catalogue page structure
- Bitmaps will be loaded as image assets or procedurally generated
