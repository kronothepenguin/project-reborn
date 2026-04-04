# Task: hh_recycler — Furniture Recycling

**Priority:** P5  
**Status:** 🔴 Not started  
**Source:** `casts/hh_recycler/` (3 scripts, 4 `.window.txt`, thread.index, variable.index, 20+ bitmaps)

## Description

Furniture recycling system. Convert unwanted furniture into credits.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Recycler Interface Class` | Script | Main recycler window |
| `Recycler Component Class` | Script | Recycler state |
| `Recycler Handler Class` | Script | Server messages |
| `Recycler Progress Animation Class` | Script | Recycling progress animation |
| `Recycler Status Icon Class` | Script | Status indicator |

## Thread Index
```
thread.id = recycler
```

## Window Files (4)
- `recycler_notification.window.txt` — Notification dialog
- `ctlg_recycler_open/progress/ready.window.txt` — Catalogue recycler pages

## Bitmaps (20+)
- Recycler "jaw" mechanism, colored progress bars, icons

## Translation Criteria

1. **Recycler Interface**: Main window — drag furniture in, wait for processing, receive credits
2. **Progress Animation**: Jaw mechanism closing, progress bar filling
3. **Status Icon**: Shows recycling state (empty, processing, ready)
4. **Recyclable Check**: Server determines if furniture is recyclable

## Cross-Cast Dependencies
- Uses `hh_interface` for UI
- Referenced by `hh_cat_code` for recycler catalogue section
- Uses `hh_furni_classes` for furniture previews (recyclable tag)
