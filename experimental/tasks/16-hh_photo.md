# Task: hh_photo — Photo/Camera System

**Priority:** P5  
**Status:** 🔴 Not started  
**Source:** `casts/hh_photo/` (4 scripts, 3 `.window.txt`, thread.index, bitmaps)

## Description

Camera and photo system. Take photos in rooms, display photos, photo items on walls.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Photo Interface Class` | Script | Camera controller |
| `Photo Component Class` | Script | Photo state |
| `Photo Handler Class` | Script | Server messages |
| `Photo Item Class` | Script | Photo as wall furniture |

## Thread Index
```
thread.id = photo
```

## Window Files (3)
- `camera_dialog.window.txt` — Camera take photo dialog
- `photo_camera.window.txt` — Camera sprite UI
- `photo_window.window.txt` — Photo display window

## Bitmaps
- Camera sprites, photo placeholders, window controls, zoom/shoot/save buttons, noise overlays
- Photo display sprites for avatars: `sh_crr_ri_75`, `h_crr_ri_75`, `sh_drk_ri_75`, `h_drk_ri_75` (camera carrying/drinking animations)

## Translation Criteria

1. **Photo Interface**: Camera dialog — choose zoom level, take photo, save to inventory
2. **Photo Item**: Photo as wall-mounted furniture — displayed like posters
3. **Camera Sprite**: Camera appears in avatar's hand when using it
4. **Noise Overlay**: Flash effect when taking photo

## Cross-Cast Dependencies
- Referenced by `hh_cat_code` for camera catalogue section
- Photos placed on walls → uses `hh_room` item placement
- Camera carrying animation → uses `hh_human` item system
