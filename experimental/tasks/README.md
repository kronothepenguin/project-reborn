# Task Index — LingoScript → JavaScript Translation

## Priority Tiers

### P0 — Core Engine (Foundation)
| # | Task | Status | Source |
|---|------|--------|--------|
| 00 | [fuse_client-core](00-fuse_client-core.md) | 🟡 Partial | `casts/fuse_client/` — 72 .ls files, 5 windows, system props |

### P1 — Shared Foundation (Used by ALL other casts)
| # | Task | Status | Source |
|---|------|--------|--------|
| 01 | [hh_shared](01-hh_shared.md) | 🔴 | `casts/hh_shared/` — 14 scripts, 24 windows |
| 02 | [hh_interface](02-hh_interface.md) | 🔴 | `casts/hh_interface/` — 42 windows, 600+ bitmaps |

### P2 — Room System (Core Gameplay)
| # | Task | Status | Source |
|---|------|--------|--------|
| 03 | [hh_room](03-hh_room.md) | 🔴 | `casts/hh_room/` — 3 scripts, 4 windows |
| 04 | [hh_room_utils](04-hh_room_utils.md) | 🔴 | `casts/hh_room_utils/` — 20 scripts, 15 windows |
| 05 | [hh_room_ui](05-hh_room_ui.md) | 🔴 | `casts/hh_room_ui/` — 2 scripts, 29 windows |

### P3 — Avatar & Furniture
| # | Task | Status | Source |
|---|------|--------|--------|
| 06 | [hh_human](06-hh_human.md) | 🔴 | `casts/hh_human/` — 10 scripts, 4 windows, animation data |
| 07 | [hh_furni_classes](07-hh_furni_classes.md) | 🔴 | `casts/hh_furni_classes/` — 38 scripts, 1 window |

### P4 — Main Features
| # | Task | Status | Source |
|---|------|--------|--------|
| 08 | [hh_navigator](08-hh_navigator.md) | 🔴 | `casts/hh_navigator/` — 5 scripts, 15 windows |
| 09 | [hh_instant_messenger](09-hh_instant_messenger.md) | 🔴 | `casts/hh_instant_messenger/` — 5 scripts, 3 windows |
| 10 | [hh_cat_code](10-hh_cat_code.md) | 🔴 | `casts/hh_cat_code/` — 11 scripts, 4 windows |
| 11 | [hh_cat_gfx_all](11-hh_cat_gfx_all.md) | 🔴 | `casts/hh_cat_gfx_all/` — 28 windows, 400+ bitmaps |

### P5 — Social & Economy
| # | Task | Status | Source |
|---|------|--------|--------|
| 12 | [hh_pets](12-hh_pets.md) | 🔴 | `casts/hh_pets/` + `hh_pets_common/` — 2 scripts, 1 window, 600+ bitmaps |
| 13 | [hh_friend_list](13-hh_friend_list.md) | 🔴 | `casts/hh_friend_list/` — 7 scripts, 6 windows |
| 14 | [hh_club](14-hh_club.md) | 🔴 | `casts/hh_club/` — 3 scripts, 5 windows |
| 15 | [hh_recycler](15-hh_recycler.md) | 🔴 | `casts/hh_recycler/` — 3 scripts, 4 windows |
| 16 | [hh_photo](16-hh_photo.md) | 🔴 | `casts/hh_photo/` — 4 scripts, 3 windows |
| 17 | [hh_poll](17-hh_poll.md) | 🔴 | `casts/hh_poll/` — 3 scripts, 6 windows |

### P6 — Minigames
| # | Task | Status | Source |
|---|------|--------|--------|
| 18 | [hh_ig](18-hh_ig.md) | 🔴 | `casts/hh_ig/` + `hh_ig_interface/` — 52 scripts, 116 windows |

### P7 — Entry & Aux Systems
| # | Task | Status | Source |
|---|------|--------|--------|
| 19 | [hh_entry](19-hh_entry.md) | 🔴 | `casts/hh_entry_base/`, `hh_entry_init/`, `hh_entry_uk/` |
| 20 | [hh_kiosk_room](20-hh_kiosk_room.md) | 🔴 | `casts/hh_kiosk_room/` — 2 scripts, 10 windows |
| 21 | [hh_guide](21-hh_guide.md) | 🔴 | `casts/hh_guide/` — 3 scripts, 3 windows |
| 22 | [hh_tutorial](22-hh_tutorial.md) | 🔴 | `casts/hh_tutorial/` — 7 scripts, 6 windows |
| 23 | [hh_buffer](23-hh_buffer.md) | 🔴 | `casts/hh_buffer/` — 2 scripts |
| 24 | [hh_dynamic_downloader](24-hh_dynamic_downloader.md) | 🔴 | `casts/hh_dynamic_downloader/` — 3 scripts |

### P8 — Region Patches (Lowest)
| # | Task | Status | Source |
|---|------|--------|--------|
| 25 | [hh_patch_uk](25-hh_patch_uk.md) | 🔴 | `casts/hh_patch_uk/` — data only, no scripts |

## Translation Order Recommendation

1. Complete **P0** (fuse_client remaining APIs) — foundation must be solid
2. Do **P1** (hh_shared + hh_interface) — everything depends on these
3. Do **P2** (hh_room + utils + ui) — core gameplay loop
4. Do **P3** (hh_human + hh_furni_classes) — avatar + furniture rendering
5. Do **P4** (navigator, IM, catalogue) — main user-facing features
6. Pick from **P5-P7** based on which features are needed for MVP
7. **P8** can be deferred indefinitely

## Stats Summary

| Metric | Count |
|--------|-------|
| Total casts | 49 directories |
| Total .ls script files | ~700+ |
| Total .window.txt files | ~280+ |
| Total bitmap members | ~3000+ |
| Total task files | 26 |
| Priority tiers | 9 (P0-P8) |
