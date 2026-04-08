# AGENTS.md - Client Project (LingoScript → JavaScript)

## Project Overview

Translation of LingoScript (Macromedia Director MX 2004) to JavaScript with Vite.
Working directory: `apps/client/`. The original `.cct` cast files have been extracted and their `.ls` scripts live in `apps/client/src/game/`, organized by cast name. Each cast has its own `index.js` that registers members and imports translated files as side-effects.

A Director compatibility layer lives in `apps/client/src/director/`, providing:
- **`apps/client/src/director/core.js`** — Helpers and abstractions that simulate basic Director behavior for this project (Member, CastLibrary, Sprite, Movie, Player classes, asset loading, cast registration, event system, `loadImage`/`loadModule`/`loadPromise` from loader). **This file is NOT edited by the AI agent.** If the AI determines that `core.js` needs a new helper, class, or modification, it must **stop and notify the user in the chat** with a clear suggestion. The user decides whether to apply the change.
- **`apps/client/src/director/runtime.js`** — Native Macromedia Director MX 2004 Lingo functions implemented incrementally as they are needed during translation. This file must contain **only Director native functions** (e.g., `castLib`, `puppetTempo`, `member`, `sprite`, `voidP`, etc.). No helpers, no loose variables, no abstractions. If the AI needs a helper or utility that is not a native Director function, it must **stop and notify the user in the chat** to add it to `apps/client/src/director/core.js`.
- **`apps/client/src/director/index.js`** — Entry point that re-exports `core.js` and `runtime.js`, and initializes `globalThis._global = {}` for Lingo global function registration.
- **`apps/client/src/director/loader.js`** — Mini HTTP-based asset preloader that simulates Director's cast loading (`loadImage`, `loadModule`, `loadPromise`, progress tracking via `totalObjects()`, `objectsLoaded()`, `finished()`, `addFinishedListener()`).

## Commands

```bash
npm run dev       # Vite dev server with external params from .env.development
npm run build     # Exports mount(el, params) function + casts as separate chunks
npm run preview   # Preview the build
```

## Translation Workflow

### Scope
The AI agent is responsible for translating LingoScript (`.ls`) files from `apps/client/src/game/` to JavaScript (`.js`). Each cast's `.ls` files are translated into `.js` files placed alongside the original assets in the same directory.

### Order of Translation
1. **habbo** → entry point (boot sequence)
2. **fuse_client** → core framework (APIs, managers, runtime)
3. **hh_* casts** → in order of `cast.entry.#` from `client/external/external_variables.txt`

### Naming Convention
- `6_Object API.ls` → `object-api.js`
- `33_Connection Manager Class.ls` → `connection-manager-class.js`
- `Internal_1_Initialization.ls` → `initialization.js`
- Lowercase, hyphens, no number prefixes

### Tasks System (`tasks/` directory)

Each cast has a `.md` file in `tasks/` with a TODO checklist:

```markdown
# fuse_client Cast

- [ ] 6_Object API.ls → object-api.js
- [ ] 3_Event Broker Behavior.ls → event-broker-behavior.js
  - [ ] Placeholder: `getObjectManager()` needs object-api.js
```

**When translating a file:**
1. Translate the entire `.ls` file → `.js` (not procedure by procedure)
2. If a Director function is not implemented in `runtime.js` → add it there
3. If code depends on a not-yet-translated file → create a placeholder + add subtask in the corresponding `tasks/<cast>.md`
4. After completing a file → check all `tasks/*.md` for placeholders that can now be resolved

## Code Style

### Lingo → JS Mapping
| Lingo | JavaScript |
|-------|-----------|
| `property pFoo` | `this.pFoo` (class) or module-level `let pFoo` |
| `on construct me` | `constructor()` or `function init()` |
| `[: ]` (propList) | `{}` or `new Map()` with `setaProp`/`getaProp` helpers |
| `[ ]` (linear list) | `[]` Array |
| `voidP(x)` | `x === undefined || x === null` |
| `x.ilk = #symbol` | `typeof x === 'symbol'` or custom type check |
| `member("name")` | Member registry lookup via `member()` |
| `sprite(n)` | Sprite channel object |
| `the stage` | Canvas/stage singleton |
| `the mouseLoc` | Mouse position tracker |
| `timeout().new()` | Timeout manager |
| `script("name").new()` | Factory function |
| `setaProp(#key, val)` | `obj.setaProp('key', val)` |
| `getaProp(#key)` | `obj.getaProp('key')` |
| `list.add(x)` | `list.push(x)` |
| `list.count` | `list.length` |
| `repeat with i = 1 to n` | `for (let i = 1; i <= n; i++)` |
| `repeat with x in list` | `for (const x of list)` |
| `case x of ... end case` | `switch(x) { ... }` |
| `EMPTY` | `""` |
| `VOID` | `null` |
| `return 1` (success) | `return true` |
| `return 0` (failure) | `return false` |

### Lingo Symbols

Lingo uses symbols like `#mouseEnter`, `#session`, `#null` as identifiers. In JavaScript, use `Symbol.for("name")` which uses the **global symbol registry** and guarantees identity. The `#` prefix from Lingo is **removed** when translating:

```js
// Lingo: #mouseEnter, #session, #image
Symbol.for("mouseEnter") === Symbol.for("mouseEnter") // true - same symbol
Symbol.for("session")
Symbol.for("image")
```

Always use `Symbol.for("name")` (without the `#` prefix) when translating Lingo symbols.

### Function Classification Rules

Every Lingo function falls into one of three categories:

| Category | Where it goes | Examples |
|----------|--------------|----------|
| **Native Director function** | `runtime.js` ONLY | `castLib`, `puppetTempo`, `go`, `theFrame`, `netDone`, `voidP`, `member`, `sprite` |
| **Director event handler** | Local function + `on()` in the translated `.js` file | `prepareMovie`, `stopMovie`, `exitFrame`, `beginSprite` |
| **Custom/game function** | Register in `_global` or ask the user | `initCore`, API functions, manager classes |

**Rules:**
- `runtime.js` — **ONLY** native Director functions. No variables, no helpers, no abstractions. If you need state (e.g. `_currentFrame`), **stop and ask the user** to add it in `core.js`.
- Event handlers are local — they do NOT go in `_global`.
- If a function doesn't belong to the above two categories and you can't find it in the current cast's `.js` files, **ask the user** before implementing.

### Global Function Registration (`_global`)

Every translated `.js` file must register its functions in `_global` (initialized in `apps/client/src/director/index.js` as `globalThis._global = {}`). This simulates Director's global function scope where any handler can call any function across scripts:

```js
// When a function is called from another cast/script (e.g., initCore from habbo calling fuse_client):
_global.initCore = function() {
  // implementation
};

// Then from any other file:
_global.initCore();
```

**Rules:**
- Each `.js` file registers its public functions in `_global`
- When calling a function from a not-yet-translated cast, use `_global.functionName()` as a placeholder
- The actual implementation will be added when that cast/file is translated
- `_global` is available globally, no need to import it

### Director Movie Handlers

`prepareMovie`, `stopMovie`, and `exitFrame` are **special Director movie-level handlers**. They are registered using the `on()` helper from the director layer:

```js
import { on } from '../../director'

function prepareMovie() {
  // ... translated code
}

function stopMovie() {
  // ... translated code
}

on('prepareMovie', prepareMovie)
on('stopMovie', stopMovie)
```

### File Organization

```
apps/client/
├── src/
│   ├── main.js                                  # mount(el, params) entry point, game loop
│   ├── director/
│   │   ├── index.js                             # Re-exports core + runtime, initializes globalThis._global
│   │   ├── core.js                              # Director helpers (Member, CastLibrary, Movie, Player, registerCast, on, etc.)
│   │   ├── runtime.js                           # Native Lingo functions (castLib, puppetTempo, etc.) — incremental
│   │   └── loader.js                            # HTTP-based asset preloader (loadImage, loadModule, loadPromise)
│   └── game/
│       └── habbo/                               # Boot cast
│           ├── index.js                         # registerCast() + member registration
│           ├── *.js                             # Translated .ls files
│           └── *.png                            # Original assets
└── tasks/
    └── *.md                                     # TODO checklists per cast
```

- Each cast's `index.js` calls `registerCast(name, members)` with script/bitmap members
- Translated `.js` files live alongside original `.ls` files and assets in `apps/client/src/game/<cast>/`
- No separate asset copying needed — assets stay in place
- Dynamic loading via `import()` for casts not in initial bundle
- Stage: 720x540 canvas, `image-rendering: pixelated`

### Member/Cast Registration

Each cast's `index.js` registers its members using the director layer:

```js
import { registerCast, createScriptMember, createBitmapMember } from '../../director'
import Logo from './Internal_4_Logo.png'

registerCast('Internal', [
  createScriptMember('Initialization', import('./initialization')),
  createBitmapMember('Logo', Logo),
])
```

- `createScriptMember(name, importPromise)` — registers a LingoScript module
- `createBitmapMember(name, imageUrl)` — registers a bitmap asset (Vite resolves the import to a URL)
- `registerCast(name, members)` — registers the cast with all its members

### Runtime Lingo (`apps/client/src/director/runtime.js`)

Native Director/Lingo functions are implemented here **incrementally** as they are encountered during translation:
- Do NOT implement all Director functions upfront
- Only implement what the current file being translated needs
- Each function should be a named export
- **This file must contain ONLY native Director functions** (e.g., `castLib`, `puppetTempo`, `member`, `sprite`, `voidP`, `listp`, `integerp`, `stringp`, etc.)
- **NO helpers, NO loose variables, NO abstractions** — if you need something that isn't a native Director function, notify the user to add it to `apps/client/src/director/core.js`

### Director Helpers (`apps/client/src/director/core.js`)

Helpers and abstractions that simulate Director behavior live here:
- `Member`, `CastLibrary`, `Sprite`, `Movie`, `Player` classes
- `registerCast()`, `createScriptMember()`, `createBitmapMember()`
- `on(event, callback)` — event registration for movie handlers
- `_params` — external parameters storage
- `_movie`, `_player` — singletons for movie and player state
- Re-exports from `loader.js`: `loadImage`, `loadModule`, `loadPromise`

**IMPORTANT: `apps/client/src/director/core.js` is NOT edited by the AI agent.** If during translation you determine that `core.js` needs a new helper, class, method, or modification, you must **stop and notify the user in the chat** with a clear description of what needs to be added and why. The user decides whether to apply the change. Do not proceed with editing `core.js`.

### Asset Handling

Assets stay in their cast directories (`apps/client/src/game/<cast>/`). Vite imports return URLs (not base64) for files >4KB, which are optimized and hashed.

```js
import Logo from './Internal_4_Logo.png'  // Vite returns URL string
```

- Bitmap assets: keep `.png` files in the cast folder
- Text assets: keep `.txt` extension
- Vite optimizes and generates hashed URLs in build
- Do NOT use `public/` folder — assets in `src/` get optimized

### Canvas Runtime

**Stage dimensions: 720x540** (Director MX 2004 default). Everything renders on a single `<canvas>` element. No DOM overlays.

#### Game Loop (`main.js`)

```
mount(element, params)
  ↓
Create canvas (720x540), set as stage
  ↓
Setup mouse/keyboard event listeners
  ↓
Dispatch 'prepareMovie' event on canvas
  ↓
Start requestAnimationFrame loop:
  └─ Each frame: dispatch 'exitFrame' → render sprites
```

#### Mouse/Keyboard Tracking

```js
// Runtime globals (updated by canvas event listeners)
the mouseLoc   → { locH: x, locV: y }
the mouseH     → x coordinate
the mouseV     → y coordinate
the keyDown    → boolean
the milliSeconds → Date.now()
```

#### Sprite System

Director's sprite channels are emulated with `sprite(n)` objects:

```js
const sprNum = reserveSprite(clientID)
const sp = sprite(sprNum)

sp.member = member('Logo')
sp.locH = 100
sp.locV = 200
sp.visible = true
sp.blend = 100

puppetSprite(sprNum, true)
releaseSprite(sprNum)
```

**Member images**: When a bitmap member is registered, the runtime creates an `Image()` object. The sprite renderer draws this image each frame.

**Rendering**: All visible sprites drawn sorted by `locZ`. Supports: blend/opacity, flipH/flipV, position, member images.

#### Build vs Dev

- **Dev**: `mount()` auto-calls on `DOMContentLoaded`, params from `.env.development`
- **Build**: exports `mount(element, params)` function for host page to call

## Dynamic Cast Loading

### Current System

Each cast in `apps/client/src/game/<cast>/` has its own `index.js` that calls `registerCast(name, members)` using the director layer. The cast's members (scripts and bitmaps) are registered at import time:

```js
// apps/client/src/game/habbo/index.js
import { registerCast, createScriptMember, createBitmapMember } from '../../director'
import Logo from './Internal_4_Logo.png'

registerCast('Internal', [
  createScriptMember('Initialization', import('./initialization')),
  createBitmapMember('Logo', Logo),
])
```

- **Script members**: `createScriptMember(name, import('./file.js'))` — the import promise is stored and the module is loaded via `apps/client/src/director/loader.js` (`loadModule`)
- **Bitmap members**: `createBitmapMember(name, imageUrl)` — Vite resolves the image import to a URL, which is passed to `loadImage` from the loader
- **Cast registration**: `registerCast(name, members)` — creates a `CastLibrary` in `_movie` and registers each `Member`

### Preload Tracking

The loader (`apps/client/src/director/loader.js`) tracks all async loading:

```js
import { totalObjects, objectsLoaded, finished, addFinishedListener } from '../../director'

// Check progress
totalObjects()       // total items being loaded
objectsLoaded()      // items completed
finished()           // boolean: everything done?
addFinishedListener(() => { /* all loaded */ })
```

This simulates Director's `netDone()` and cast loading progress callbacks.

### Future: Unimplemented Casts

Casts not yet translated will be loaded dynamically:
- `import.meta.glob('./**/index.js', { eager: false })` for auto-discovery at build time
- Registry generated from `client/external/external_variables.txt`
- `import()` dynamic with mapped strings (Vite requires static analysis)

### Future: Furni Dynamic Downloads

Furniture `.cct` files loaded at runtime from the game server:
- Template: `dynamic.download.url + "hh_furni_xx_" + typeid + ".cct"`
- `fetch(url).then(r => r.blob())` → future WASM extraction

## Import Rules (CRITICAL)

The director layer exports are available via the relative path from each cast folder:

| Import FROM | What to import |
|-------------|---------------|
| `apps/client/src/director/index.js` (as `../../director`) | All exports from `core.js` + `runtime.js`: `registerCast`, `createScriptMember`, `createBitmapMember`, `on`, `_params`, `_movie`, `_player`, `castLib`, `puppetTempo`, etc. |
| Cast-local API files | `./object-api.js`, `./variable-api.js`, etc. (relative to the cast folder in `apps/client/src/game/<cast>/`) |

**`apps/client/src/director/runtime.js`** — Only native Director functions. If you need something that isn't a native Lingo function, notify the user to add it to `apps/client/src/director/core.js`.

**`apps/client/src/director/core.js`** — Do NOT edit. Notify the user in the chat if changes are needed.

API functions (object-api, variable-api, etc.) are implemented per-cast and imported relatively, not from the director layer.

## Canvas Rendering

**Everything must be rendered on Canvas.** No DOM overlays.
- Sprite system emulates Director's sprite channels
- All UI elements drawn on canvas (text, images, shapes)
- Mouse/keyboard events routed through canvas
