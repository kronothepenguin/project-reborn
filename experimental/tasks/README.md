# Task Index — LingoScript → JavaScript Translation

## Status Legend
- `✅ Done` — All files in this cast translated
- `🟡 Partial` — Some files translated, more remaining
- `🔴 Not started` — Nothing translated yet

---

## Priority Tiers

### P0 — Core Engine (Foundation)
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 00 | [fuse_client-core](00-fuse_client-core.md) | 🟡 In Progress | 72 .ls, 5 windows, system props | Translated: ALL APIs (Object, Thread, Resource, Download, Connection, CastLoad, Timeout, Window, Broker, Variable, String Services, Write, Binary, Sprite, Text, Special Services, Multiuser). ALL Manager classes. ALL Instance classes. ALL Element wrappers (Button, Scrollbar, Dropdown, Image, Text, Field, Pattern, Grouped, Unique). RC4 + RC4Extended, Layout Parser, Event Agent, Loading Bar, FPS Test, Core Thread, Visualizer Part Wrapper, HttpCookie. Remaining: .window.txt parsing, actual image/Canvas rendering implementations |

### P1 — Shared Foundation (Used by ALL other casts)
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 01 | [hh_shared](01-hh_shared.md) | 🔴 | 14 scripts, 24 windows | See [01-hh_shared.md](01-hh_shared.md) |
| 02 | [hh_interface](02-hh_interface.md) | 🔴 | 42 windows, 600+ bitmaps | See [02-hh_interface.md](02-hh_interface.md) |

### P2 — Room System (Core Gameplay)
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 03 | [hh_room](03-hh_room.md) | 🔴 | 3 scripts, 4 windows | See [03-hh_room.md](03-hh_room.md) |
| 04 | [hh_room_utils](04-hh_room_utils.md) | 🔴 | 20 scripts, 15 windows | See [04-hh_room_utils.md](04-hh_room_utils.md) |
| 05 | [hh_room_ui](05-hh_room_ui.md) | 🔴 | 2 scripts, 29 windows | See [05-hh_room_ui.md](05-hh_room_ui.md) |

### P3 — Avatar & Furniture
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 06 | [hh_human](06-hh_human.md) | 🔴 | 10 scripts, 4 windows, animation data | See [06-hh_human.md](06-hh_human.md) |
| 07 | [hh_furni_classes](07-hh_furni_classes.md) | 🔴 | 38 scripts, 1 window | See [07-hh_furni_classes.md](07-hh_furni_classes.md) |

### P4 — Main Features
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 08 | [hh_navigator](08-hh_navigator.md) | 🔴 | 5 scripts, 15 windows | See [08-hh_navigator.md](08-hh_navigator.md) |
| 09 | [hh_instant_messenger](09-hh_instant_messenger.md) | 🔴 | 5 scripts, 3 windows | See [09-hh_instant_messenger.md](09-hh_instant_messenger.md) |
| 10 | [hh_cat_code](10-hh_cat_code.md) | 🔴 | 11 scripts, 4 windows | See [10-hh_cat_code.md](10-hh_cat_code.md) |
| 11 | [hh_cat_gfx_all](11-hh_cat_gfx_all.md) | 🔴 | 28 windows, 400+ bitmaps | See [11-hh_cat_gfx_all.md](11-hh_cat_gfx_all.md) |

### P5 — Social & Economy
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 12 | [hh_pets](12-hh_pets.md) | 🔴 | 2 scripts + 600+ bitmaps, 1 window | See [12-hh_pets.md](12-hh_pets.md) |
| 13 | [hh_friend_list](13-hh_friend_list.md) | 🔴 | 7 scripts, 6 windows | See [13-hh_friend_list.md](13-hh_friend_list.md) |
| 14 | [hh_club](14-hh_club.md) | 🔴 | 3 scripts, 5 windows | See [14-hh_club.md](14-hh_club.md) |
| 15 | [hh_recycler](15-hh_recycler.md) | 🔴 | 3 scripts, 4 windows | See [15-hh_recycler.md](15-hh_recycler.md) |
| 16 | [hh_photo](16-hh_photo.md) | 🔴 | 4 scripts, 3 windows | See [16-hh_photo.md](16-hh_photo.md) |
| 17 | [hh_poll](17-hh_poll.md) | 🔴 | 3 scripts, 6 windows | See [17-hh_poll.md](17-hh_poll.md) |

### P6 — Minigames
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 18 | [hh_ig](18-hh_ig.md) | 🔴 | 52 scripts, 116 windows | See [18-hh_ig.md](18-hh_ig.md) |

### P7 — Entry & Aux Systems
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 19 | [hh_entry](19-hh_entry.md) | 🔴 | 12 scripts, 7 windows | See [19-hh_entry.md](19-hh_entry.md) |
| 20 | [hh_kiosk_room](20-hh_kiosk_room.md) | 🔴 | 2 scripts, 10 windows | See [20-hh_kiosk_room.md](20-hh_kiosk_room.md) |
| 21 | [hh_guide](21-hh_guide.md) | 🔴 | 3 scripts, 3 windows | See [21-hh_guide.md](21-hh_guide.md) |
| 22 | [hh_tutorial](22-hh_tutorial.md) | 🔴 | 7 scripts, 6 windows | See [22-hh_tutorial.md](22-hh_tutorial.md) |
| 23 | [hh_buffer](23-hh_buffer.md) | 🔴 | 2 scripts | See [23-hh_buffer.md](23-hh_buffer.md) |
| 24 | [hh_dynamic_downloader](24-hh_dynamic_downloader.md) | 🔴 | 3 scripts | See [24-hh_dynamic_downloader.md](24-hh_dynamic_downloader.md) |

### P8 — Region Patches (Lowest)
| # | Task | Status | Source | Details |
|---|------|--------|--------|---------|
| 25 | [hh_patch_uk](25-hh_patch_uk.md) | 🔴 | data only, no scripts | See [25-hh_patch_uk.md](25-hh_patch_uk.md) |

---

## Overall Progress

| Category | Files Done | Files Total | Progress |
|----------|-----------|-------------|----------|
| **habbo/** (entry) | 3 | 3 | 100% |
| **fuse_client/** (core) | 63 | 72+ | ~88% |
| **hh_*/** (features) | 0 | ~600+ | 0% |
| **core/** (runtime) | 3 | 3 | 100% |
| **engine/** (rendering) | 2 | 2 | 100% |
| **system/** (services) | 2 | 2 | 100% |
| **ALL** | ~73 | ~700+ | ~10% |

### Translated Files (Complete List — 73 files)

#### Core Runtime (3)
```
✅ src/core/lingo-runtime.js
✅ src/core/stage.js
✅ src/core/frame-loop.js
```

#### System (2)
```
✅ src/system/network.js
✅ src/system/encryption.js
```

#### Engine (2)
```
✅ src/engine/sprite-manager.js
✅ src/engine/visualizer.js
```

#### habbo Cast (4)
```
✅ src/casts/habbo/initialization.js
✅ src/casts/habbo/init.js
✅ src/casts/habbo/loop.js
✅ src/casts/habbo/index.js
```

#### fuse_client APIs (16)
```
✅ src/casts/fuse_client/object-api.js
✅ src/casts/fuse_client/thread-api.js
✅ src/casts/fuse_client/resource-api.js
✅ src/casts/fuse_client/download-api.js
✅ src/casts/fuse_client/connection-api.js
✅ src/casts/fuse_client/castload-api.js
✅ src/casts/fuse_client/timeout-api.js
✅ src/casts/fuse_client/window-api.js
✅ src/casts/fuse_client/broker-api.js
✅ src/casts/fuse_client/variable-api.js
✅ src/casts/fuse_client/string-services-api.js
✅ src/casts/fuse_client/write-api.js
✅ src/casts/fuse_client/binary-api.js
✅ src/casts/fuse_client/sprite-api.js
✅ src/casts/fuse_client/text-api.js
✅ src/casts/fuse_client/special-services-api.js
✅ src/casts/fuse_client/multiuser-api.js
```

#### fuse_client Manager Classes (17)
```
✅ src/casts/fuse_client/object-manager-class.js
✅ src/casts/fuse_client/thread-manager-class.js
✅ src/casts/fuse_client/resource-manager-class.js
✅ src/casts/fuse_client/download-manager-class.js
✅ src/casts/fuse_client/connection-manager-class.js
✅ src/casts/fuse_client/castload-manager-class.js
✅ src/casts/fuse_client/timeout-manager-class.js
✅ src/casts/fuse_client/window-manager-class.js
✅ src/casts/fuse_client/broker-manager-class.js
✅ src/casts/fuse_client/variable-container-class.js
✅ src/casts/fuse_client/special-services-class.js
✅ src/casts/fuse_client/manager-template-class.js
✅ src/casts/fuse_client/visualizer-manager-class.js
✅ src/casts/fuse_client/error-manager-class.js
✅ src/casts/fuse_client/text-manager-class.js
✅ src/casts/fuse_client/string-services-class.js
✅ src/casts/fuse_client/writer-manager-class.js
✅ src/casts/fuse_client/binary-manager-class.js
✅ src/casts/fuse_client/method-manager-class.js
✅ src/casts/fuse_client/multiuser-manager-class.js
```

#### fuse_client Instance Classes (9)
```
✅ src/casts/fuse_client/connection-instance-class.js
✅ src/casts/fuse_client/window-instance-class.js
✅ src/casts/fuse_client/visualizer-instance-class.js
✅ src/casts/fuse_client/castload-instance-class.js
✅ src/casts/fuse_client/castload-task-class.js
✅ src/casts/fuse_client/download-instance-class.js
✅ src/casts/fuse_client/multiuser-instance-class.js
✅ src/casts/fuse_client/thread-instance-class.js
✅ src/casts/fuse_client/httpcookie-instance-class.js
```

#### fuse_client Element Wrappers (11)
```
✅ src/casts/fuse_client/element-wrapper-class.js
✅ src/casts/fuse_client/grouped-element-class.js
✅ src/casts/fuse_client/unique-element-class.js
✅ src/casts/fuse_client/image-wrapper-class.js
✅ src/casts/fuse_client/text-wrapper-class.js
✅ src/casts/fuse_client/field-wrapper-class.js
✅ src/casts/fuse_client/pattern-wrapper-class.js
✅ src/casts/fuse_client/dropdown-class.js
✅ src/casts/fuse_client/scrollbar-class.js
✅ src/casts/fuse_client/visualizer-part-wrapper-class.js
```

#### fuse_client Button Classes (2)
```
✅ src/casts/fuse_client/image-button-class.js
✅ src/casts/fuse_client/icon-button-class.js
```

#### fuse_client Utility Classes (7)
```
✅ src/casts/fuse_client/event-broker.js
✅ src/casts/fuse_client/event-agent-class.js
✅ src/casts/fuse_client/loading-bar-class.js
✅ src/casts/fuse_client/layout-parser-class.js
✅ src/casts/fuse_client/fps-test-class.js
✅ src/casts/fuse_client/rc4-class.js
✅ src/casts/fuse_client/core-thread-class.js
```

#### fuse_client Entry (2)
```
✅ src/casts/fuse_client/client-initialization.js
✅ src/casts/fuse_client/error-api.js
✅ src/casts/fuse_client/index.js
```

#### Main Entry (1)
```
✅ src/index.js
```

### Remaining fuse_client Files (~9 files)
```
🔴 2_System Texts.txt (localized strings)
🔴 75-79_*.window.txt (5 window layout files — modal, system, empty, error, performance)
🔴 82_CBigInt16.ls (BigInt arithmetic — can use native JS BigInt)
🔴 83_JSBigInt.ls (BigInt stub — native JS BigInt replaces this)
🔴 84_JavaScript Proxy.ls (JS bridge stub — already handled by mount())
🔴 85_UTF8 To Locale Class.ls (UTF-8 locale — native JS handles this)
🔴 86_tYy1rX5j7e4PLYJLER.ls (obfuscated — RC4Extended already covers this)
🔴 87/88_* encoding maps (character encoding — native UTF-8 handles this)
🔴 System Props parsing full implementation (partial — needs cast-by-cast loading)
```

### Remaining hh_* Casts
- All 47 hh_* casts not started (see individual task files)

---

## Translation Order Recommendation

1. Complete **P0** remaining items (window.txt parsing, system texts)
2. Do **P1** (hh_shared + hh_interface) — everything depends on these
3. Do **P2** (hh_room + utils + ui) — core gameplay loop
4. Do **P3** (hh_human + hh_furni_classes) — avatar + furniture rendering
5. Do **P4** (navigator, IM, catalogue) — main user-facing features
6. Pick from **P5-P7** based on which features are needed for MVP
7. **P8** can be deferred indefinitely

## Stats Summary

| Metric | Count |
|--------|-------|
| Total cast directories | 49 |
| Total .ls script files | ~700+ |
| Total .window.txt files | ~280+ |
| Total bitmap members | ~3000+ |
| Total task files | 26 |
| Priority tiers | 9 (P0-P8) |
| Script files translated | 73 |
| Script files remaining | ~650+ |
