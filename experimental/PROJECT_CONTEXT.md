# LingoScript to JavaScript Translation Project

## Context
This file serves as a reference for future conversations about the LingoScript to JavaScript translation project.

## Goal
Translate Macromedia Director MX 2004 LingoScript code from `.dcr`/`.cct` cast files into JavaScript for web execution using Canvas.

## Architecture
- **Source**: `./casts/` folder containing 49 cast subdirectories
- **Output**: `./experimental/` folder for translated JavaScript
- **Modular loading**: Each `.cct`/`.dcr` cast maps to a module, with future plans to use WASM for dynamic `.cct` loading

## Cast Loading Order
1. `./casts/habbo/` → `habbo.dcr` (main entry point, preloads fuse_client)
2. `./casts/fuse_client/` → `fuse_client.cct` (core FuseClient framework, 90 files)
3. **All `hh_*` casts are fully translated** to JS modules — each cast is a module
4. **Furniture loading** (`hh_furni_classes/`) → translated as a module, BUT contains
   the internal `.cct` dynamic loading system (`CastLoad Manager Class`) which handles
   loading external `.cct`/`.cst` files at runtime (e.g. furni icons, room items)
5. The `.cct` loading system → future WASM module to parse binary cast files

## LingoScript Patterns to Translate

### Object System
- Lingo uses `property`, `global`, `on construct me`, `on deconstruct me`
- Objects created via `createObject(tID, tClassList)` with **ancestor chaining**
- Multiple classes layered: `tObject[#ancestor] = tTemp`
- Maps to JavaScript ES6 classes with inheritance/composition

### Event Handlers
- `on exitFrame me` → Animation frame loop
- `on prepareMovie me` → Initialization
- `on mouseDown/Up me` → Canvas event listeners
- `on stepFrame me` → Per-frame updates

### Global Managers
- `gCore` global → Singleton or module exports
- `getManager(tID)`, `createManager(tID, tClassList)` → Dependency injection / service registry

### Window System
- XML-like `.window.txt` files define UI layouts
- Elements with rect, member, media type, ink, blend, stretch
- Maps to Canvas rendering + DOM overlay system

### Encryption
- `72_RC4 Class.ls` → Standard RC4
- `86_tYy1rX5j7e4PLYJLER.ls` → Enhanced RC4 with triple-swap perturbation, key mixing modes

### Character Encoding
- Shift JIS, Windows-1251 → Unicode maps
- JavaScript handles UTF-8 natively, but decoding may be needed

## Key Casts

| Cast | Description |
|------|-------------|
| `habbo/` | Main entry (Initialization, Init, Loop scripts) |
| `fuse_client/` | Core framework (Object API, Event Broker, Window system, RC4, APIs) |
| `hh_shared/` | Shared components (46 files) |
| `hh_room/` | Room system (13 files) |
| `hh_room_ui/` | Room UI |
| `hh_room_utils/` | Room utilities |
| `hh_navigator/` | Room navigator (23 files) |
| `hh_instant_messenger/` | IM system (11 files) |
| `hh_ig/`, `hh_ig_interface/` | Minigames (52 scripts, 116 windows) |
| `hh_human*/` | Avatar system (body, face, hair, hats, accessories, 5.0 variants) |
| `hh_furni_classes/` | Furniture classes → **internal .cct loader** |
| `hh_pets/`, `hh_pets_common/` | Pet systems |
| `hh_kiosk_room/` | Kiosk room |
| `hh_club/` | Habbo Club |
| `hh_friend_list/` | Friend list |
| `hh_guide/` | Guide system |
| `hh_tutorial/` | Tutorial |
| `hh_poll/` | Poll system |
| `hh_recycler/` | Recycler |
| `hh_photo/` | Photo system |
| `hh_cat_*/` | Catalog system (code + graphics) |
| `hh_entry_*/` | Entry/avatar animation |
| `hh_buffer/` | Buffer component |
| `hh_dynamic_downloader/` | Dynamic downloading |
| `hh_patch_uk/` | UK patch |
| `hh_interface/` | General interface (600+ bitmaps, 42 windows) |

## .cct/.cst Dynamic Loading System
Located in `fuse_client/32_CastLoad Manager Class.ls` and related files:
- `CastLoad Manager Class` — manages download queue, cast library registration
- `CastLoad Instance Class` — individual cast download instance
- `CastLoad Task Class` — task wrapper for async loading
- Uses `preloadNetThing()` to download `.cct`/`.cst` files
- `Casts.csv` defines cast library slots (73 slots in habbo.dcr)
- Empty casts point to `empty.cst` placeholder
- Future: WASM module parses binary `.cct` format and exposes script members

## Translation Strategy
1. **1:1 mapping** where possible - preserve Lingo structure
2. Each `.ls` file → corresponding `.js` file
3. Maintain module boundaries per cast
4. Use Canvas for rendering (equivalent to Director's stage)
5. Event system maps to JS events or custom event emitter
6. Threading system maps to `requestAnimationFrame` or Web Workers

## Dev Server & Build System (Vite)

### Development
```bash
deno task dev
npm run dev   # (alternative)
```
- External params from `.env` file (`VITE_PROCESS_LOG_URL`, `VITE_ACCOUNT_ID`, etc.)
- Vite auto-injects `import.meta.env.VITE_*` into the client
- Hot module reloading

### Build
```bash
deno task build
npm run build   # (alternative)
```
- **Main bundle**: `dist/fuse-client.main.js` (ESM) — habbo + fuse_client → exports `mount()`
- **Cast bundles**: `dist/casts/fuse-client.hh_*.js` — each cast as independent ESM bundle
- **Shared chunks**: `dist/chunks/` — Vite code splitting

### mount() API
```js
import { mount } from 'fuse-client';
const client = await mount('#canvas', {
  processLogUrl: '...',
  accountId: '...',
  width: 800,
  height: 600,
  serverHost: '...',
  serverPort: 30001,
  debug: true,
  customParams: { /* extra Lingo external params */ },
});
client.unmount();
```

## Translation Tasks

All translation work is tracked in `./tasks/`. One `.md` file per cast with:
description, key classes, window files, translation criteria, dependencies.

- **Index**: `tasks/README.md` — 26 tasks, priorities P0–P8
- **Per-cast**: `tasks/00-fuse_client-core.md` … `tasks/25-hh_patch_uk.md`

Open a task file to see what needs translating. Status is tracked per file (`🔴 Not started`, `🟡 Partial`, `✅ Done`).

## Current Status (82 JS files translated)

### Completed — fuse_client (63/72 files, ~88%)
- ✅ ALL 17 APIs (Object, Thread, Resource, Download, Connection, CastLoad, Timeout, Window, Broker, Variable, String Services, Write, Binary, Sprite, Text, Special Services, Multiuser)
- ✅ ALL 20 Manager classes (Object, Thread, Resource, Download, Connection, CastLoad, Timeout, Window, Broker, Variable Container, Special Services, Manager Template, Visualizer, Error, Text, String Services, Writer, Binary, Method, Multiuser)
- ✅ ALL 9 Instance classes (Connection, Window, Visualizer, CastLoad + Task, Download, Multiuser, Thread, HttpCookie)
- ✅ ALL 11 Element wrappers (Element, Grouped, Unique, Image, Text, Field, Pattern, Dropdown, Scrollbar, Visualizer Part)
- ✅ ALL Button classes (Image Button, Icon Button)
- ✅ Utility classes (Event Broker, Event Agent, Loading Bar, Layout Parser, FPS Test, RC4, RC4 Extended, Core Thread, Visualizer Part Wrapper, HttpCookie Instance)
- 🔴 Remaining: 2_System Texts.txt, 5 .window.txt files, BigInt stubs (native JS BigInt replaces these), encoding maps (native UTF-8 handles this)

### Completed — habbo (3/3 files, 100%)
- ✅ Initialization, Init, Loop scripts

### Completed — Core runtime (7 files, 100%)
- ✅ Lingo runtime (VOID, property lists, type helpers, messages)
- ✅ Stage emulation, Frame loop
- ✅ Network stub, System props, Encryption
- ✅ Sprite Manager, Visualizer (engine)

### Pending — hh_* casts (47 directories, ~600+ files)
- All not started. See `tasks/` for priority-ordered task files.

### Next Steps
1. Complete fuse_client remaining items (window.txt parsing, system texts)
2. Start P1: hh_shared + hh_interface
3. Then P2: hh_room + hh_room_ui + hh_room_utils
4. Then P3: hh_human + hh_furni_classes
