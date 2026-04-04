# Task: hh_cat_code — Catalogue Logic

**Priority:** P4  
**Status:** 🔴 Not started  
**Source:** `casts/hh_cat_code/` (11 script members, 4 `.window.txt`, thread.index, variable.index)

## Description

The catalogue logic layer. Handles browsing, previewing, and purchasing furniture, clothing, pets, and other items from the catalogue.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Catalogue Interface Class` | Script | Main catalogue window |
| `Catalogue Component Class` | Script | Catalogue state/component |
| `Catalogue Handler Class` | Script | Server message handling |
| `Product Preview Class` | Script | Single product preview rendering |
| `Deal Preview Class` | Script | Multi-item deal preview |
| `Catalogue Loader Class` | Script | Catalogue data loading |
| `Catalogue Spaces Class` | Script | Public rooms catalogue section |
| `Catalogue Plasto Class` | Script | Wall/floor patterns section |
| `Catalogue Pets/Pets2 Class` | Script | Pet catalogue |
| `Catalogue Trophies Class` | Script | Trophy catalogue |
| `Catalogue Recycler Class` | Script | Recycler section in catalogue |
| `Catalogue Soundmachine Class` | Script | Sound machine catalogue |
| `Catalogue Purse Class` | Script | Credits/purse display |

## Thread Index
```
thread.id = catalogue
```

## Window Files (4)
- `habbo_orderinfo_dialog.window.txt` — Order info dialog
- `habbo_gift_dialog.window.txt` — Gift sending dialog
- `habbo_nocredits.window.txt` — No credits warning
- `habbo_cantbuycredits.window.txt` — Can't buy credits warning

## Translation Criteria

1. **Catalogue Interface**: Multi-page catalogue with categories, products, deals
2. **Product Preview**: Shows furniture preview image (from `Preview_renderer`), name, price, credits cost
3. **Deal Preview**: Multi-item bundle display with individual items and total price
4. **Catalogue Loader**: Parses catalogue data from server
5. **Special Sections**: Plasto (wallpaper/floor/landscape), Pets, Trophies, Recycler, Sound Machine
6. **Purchase Flow**: Buy → confirm → credits deduction → item added to inventory

## Cross-Cast Dependencies
- Uses `hh_cat_gfx_all` for catalogue graphics
- Uses `hh_furni_classes` for preview rendering (`Preview_renderer`)
- Uses `hh_recycler` for recycler catalogue section
- Uses `hh_photo` for camera catalogue section
