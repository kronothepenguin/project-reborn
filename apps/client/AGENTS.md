# AGENTS.md - Client Project (LingoScript → JavaScript)

## Project Overview

Translation of LingoScript (Macromedia Director MX 2004) to JavaScript with Vite.
Working directory: `apps/client/`. The original `.cct` cast files have been extracted and their `.ls` scripts live in `apps/client/src/game/`, organized by cast name. Each cast has its own `index.js` that registers members and imports translated files as side-effects.

A Director compatibility layer lives in `apps/client/src/director/`, providing:
- **`apps/client/src/director/core.js`** — Helpers, variables, and abstractions to make the Director API work (`Member`, `CastLibrary`, `Sprite`, `Movie`, `Player`, `List` classes, `_params`).
- **`apps/client/src/director/runtime.js`** — **ONLY native Director methods and variables** (e.g., `_movie`, `_player`, `_global`, `castLib`, `puppetTempo`, `member`, `sprite`, `voidp`, `list`, `propList`, `call`, `go`, `netDone`, etc.). Imports helpers, variables, or abstractions from `core.js` as needed. **NO helpers, NO extra variables, NO abstractions** — anything non-native goes in `core.js` or `index.js`. If a native Director function is missing, it must be added here. **Special Director syntax that cannot be directly implemented in JS must be reported to the user for discussion.**
- **`apps/client/src/director/index.js`** — Translation API: functions like `createBitmapMember`, `createScriptMember`, `createFieldMember`, `registerCast`, movie startup, animation loop, `_director` setup. These are the functions, variables, and methods used by translations and users to run director translations or register director assets from JavaScript in the different modules of `apps/client/src/game/`.
- **`apps/client/src/director/loader.js`** — Preloader that simulates Director's `.cct` preload system. Director fully loaded all `.cct` files before executing. This is simulated in JS: images load via `new Image()`, modules via `import()`, and progress is tracked via `totalObjects()`, `objectsLoaded()`, `finished()`, `addFinishedListener()`. The movie doesn't start until everything is loaded.
- **`apps/client/src/director/the.js`** — Proxy that translates `the.property` syntax. Since Director's `the` is special syntax (not a normal variable), this proxy intercepts property access and returns values from `_movie`, `_player`, or other global Director objects. It also handles writes back to the underlying objects.

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

### Script Factory Pattern (CRITICAL)

Every translated `.ls` file uses the **factory pattern**: a default export function that returns an object with properties and handlers. The factory is called by the runtime when the script is instantiated.

```js
// Every translated .ls file:
export default function () {
  return {
    // properties (equivalent to Lingo `property`)
    id: 0,
    pSomeValue: null,

    // lifecycle
    construct() {
      return true;
    },

    // event handlers (movie scripts & behaviors)
    prepareMovie() { /* ... */ },
    exitFrame() { /* ... */ },
    mouseEnter() { /* ... */ },
    mouseUp() { /* ... */ },

    // custom methods
    someMethod(arg) { /* ... */ },
  };
}
```

The factory returns a **fresh object per call** — each invocation creates an independent instance with its own state. The runtime calls this factory when:
- **Movie scripts**: once at movie start (single instance, handlers registered globally)
- **Behavior scripts**: when attached to a sprite (new instance per sprite)
- **Parent scripts**: when `script("Name").new()` is called (new instance per call)

### Lingo → JS Mapping
| Lingo | JavaScript |
|-------|-----------|
| `property pFoo` | `pFoo: null` (property on returned object) |
| `on construct me` | `construct() { return true; }` |
| `on methodName me, args` | `methodName(args) { /* ... */ }` |
| `[: ]` (propList) | `{}` or `propList()` with `setaProp`/`getaProp` helpers |
| `[ ]` (linear list) | `[]` Array |
| `voidP(x)` | `voidp(x)` |
| `x.ilk = #symbol` | `typeof x === 'symbol'` or `ilk(x)` |
| `member("name")` | Member registry lookup via `member()` |
| `sprite(n)` | Sprite channel object |
| `the stage` | Canvas/stage singleton |
| `the mouseLoc` | Mouse position tracker |
| `timeout().new()` | Timeout manager |
| `script("name").new()` | Factory function via `script()` |
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

### Script Types

Every script must be declared with its **type** when registered in the cast's `index.js`. The AI agent **must ask the user** what type a script is before translating, as this cannot be inferred from the `.ls` file alone.

| Type | Symbol | Usage |
|------|--------|-------|
| **Movie script** | `MOVIE_SCRIPT` | Global handlers (`prepareMovie`, `stopMovie`, etc.). Single instance. Handlers are automatically registered in `_director` namespace at startup. |
| **Behavior script** | `BEHAVIOR_SCRIPT` | Attached to sprites. New instance per sprite attachment. Event handlers (`mouseEnter`, `mouseUp`, etc.) are dispatched when the sprite receives events. |
| **Parent script** | `PARENT_SCRIPT` | Class-like, instantiated via `script("Name").new()`. New instance per call. |

**Registration example (`index.js`):**

```js
import {
  BEHAVIOR_SCRIPT,
  MOVIE_SCRIPT,
  PARENT_SCRIPT,
  createBitmapMember,
  createScriptMember,
  registerCast,
} from '../../director'
import Logo from './Internal_4_Logo.png'
import Initialization from './initialization'    // movie script
import Init from './init'                          // behavior script
import SomeParent from './some-parent'            // parent script

registerCast('Internal', [
  createScriptMember('Initialization', MOVIE_SCRIPT, Initialization),
  createScriptMember('Init', BEHAVIOR_SCRIPT, Init),
  createScriptMember('SomeParent', PARENT_SCRIPT, SomeParent),
  createBitmapMember('Logo', Logo),
])
```

### Global Namespace (`_director`)

Movie script handlers are registered in `_director` at startup. When Lingo code calls a function that is defined in a movie script, it resolves as `_director.functionName()`:

```js
// Movie script translation:
export default function () {
  return {
    initCore() {
      // ...
    },
    prepareMovie() {
      // ...
    },
  };
}

// When called from another script:
_director.initCore();
```

`_global` (in `runtime.js`) is used **only** when the original Lingo code explicitly references `_global`:

```lingo
_global.myVar = 42
```

```js
_global.myVar = 42;
```

### Lingo Symbols

Lingo uses symbols like `#mouseEnter`, `#session`, `#null` as identifiers. In JavaScript, use `Symbol.for("name")` which uses the **global symbol registry** and guarantees identity. The `#` prefix from Lingo is **removed** when translating:

```js
// Lingo: #mouseEnter, #session, #image
Symbol.for("mouseEnter") === Symbol.for("mouseEnter") // true - same symbol
Symbol.for("session")
Symbol.for("image")
```

Always use `Symbol.for("name")` (without the `#` prefix) when translating Lingo symbols.

### Import Rules

Translated scripts import **only native Director functions** from the director layer:

```js
import {
  call,
  castLib,
  go,
  list,
  member,
  netDone,
  propList,
  puppetTempo,
  sprite,
  stopEvent,
  stringp,
  symbolp,
  the,
  VOID,
  voidp,
} from "../../director";
```

- Import **only what you use** in the current file
- No need to import `_global` — it's available globally from `runtime.js`
- No need to import `_director` — it's available globally from `index.js`
- Cast-local API files: `./object-api.js`, `./variable-api.js` (relative import)

### File Organization

```
apps/client/
├── src/
│   ├── main.js                                  # mount(el, params) entry point, game loop
│   ├── director/
│   │   ├── index.js                             # Translation API: barrel exports, createBitmapMember, registerCast, movie startup
│   │   ├── core.js                              # Helpers, variables, abstractions: Member, CastLibrary, Sprite, Movie, Player, List, _params
│   │   ├── runtime.js                           # Native Director API: _movie, _player, _global, castLib, member, sprite, voidp, etc.
│   │   ├── loader.js                            # Preloader simulation: loadImage, loadModule, totalObjects, finished
│   │   └── the.js                               # `the.property` proxy for Director's special syntax
│   └── game/
│       └── habbo/                               # Boot cast
│           ├── index.js                         # registerCast() with script types (MOVIE_SCRIPT, BEHAVIOR_SCRIPT, etc.)
│           ├── *.js                             # Translated .ls files (factory pattern)
│           └── *.png                            # Original assets
└── tasks/
    └── *.md                                     # TODO checklists per cast
```

- Each cast's `index.js` calls `registerCast(name, members)` with script/bitmap members
- Each translated `.js` file uses `export default function()` returning an object with handlers
- Translated `.js` files live alongside original `.ls` files and assets in `apps/client/src/game/<cast>/`
- No separate asset copying needed — assets stay in place
- Dynamic loading via `import()` for casts not in initial bundle
- Stage: 720x540 canvas, `image-rendering: pixelated`

### Member/Cast Registration

Each cast's `index.js` registers its members using the director layer:

```js
import {
  BEHAVIOR_SCRIPT,
  MOVIE_SCRIPT,
  createBitmapMember,
  createScriptMember,
  registerCast,
} from '../../director'
import Logo from './Internal_4_Logo.png'
import Initialization from './initialization'

registerCast('Internal', [
  createScriptMember('Initialization', MOVIE_SCRIPT, Initialization),
  createBitmapMember('Logo', Logo),
])
```

- `createScriptMember(name, type, factory)` — registers a LingoScript module with its type and factory function
- `createBitmapMember(name, imageUrl)` — registers a bitmap asset (Vite resolves the import to a URL)
- `registerCast(name, members)` — registers the cast with all its members
- Script types: `MOVIE_SCRIPT`, `BEHAVIOR_SCRIPT`, `PARENT_SCRIPT`

### Runtime Lingo (`apps/client/src/director/runtime.js`)

**STRICT RULES:** This file must contain **ONLY native Director variables and methods**. Nothing else.

- `_movie`, `_player`, `_global` — native Director globals
- Constants: `EMPTY`, `VOID`, `RETURN`, `TAB` — native Lingo constants
- Native functions: `castLib`, `puppetTempo`, `member`, `sprite`, `voidp`, `list`, `propList`, `call`, `go`, `netDone`, `listp`, `integerp`, `stringp`, `symbolp`, `objectp`, `ilk`, `chars`, `length`, `offset`, `random`, `string`, `value`, `date`, `time`, `put`, `pass`, `stopEvent`, `script`, `field`, `getPref`, `setPref`, `newMember`, `openNetPage`, `gotoNetPage`, `param`, etc.
- Imports helpers/abstractions from `core.js` as needed (e.g., `Member`, `Movie`, `Sprite`, `List` classes)
- **NO helpers, NO extra variables, NO abstractions** — anything non-native goes in `core.js` or `index.js`
- **Special Director syntax** (`the property`, `go to frame`, etc.) that cannot be directly mapped to JS function calls must be **reported to the user for discussion** — do NOT implement workarounds here

**CRITICAL: When editing `runtime.js`:**
1. **NEVER overwrite the file** — always read it first, then add only what's missing
2. **New functions must be added in alphabetical order** by function name
3. **Never delete existing functions** — if a function needs changes, edit it in place
4. Internal state variables (`_currentParams`, `_the`, `_timeouts`, etc.) go at the top under `// ── Internal state ──` comment
5. Constants (`EMPTY`, `VOID`, `RETURN`, `TAB`) go at the top under `// ── Constants ──`
6. If you accidentally overwrite the file, you MUST restore ALL existing functions before adding new ones

### Director Core (`apps/client/src/director/core.js`)

Helpers, variables, and abstractions to make the Director API work:
- `_params` — external parameters storage
- `Member`, `CastLibrary`, `Sprite`, `Movie`, `Player`, `List` classes
- Other helpers, variables, or abstractions needed to make the Director API work

### Director Index (`apps/client/src/director/index.js`)

Translation API — functions, variables, and methods used by translations and users to run director translations or register director assets from JavaScript:
- `createBitmapMember`, `createScriptMember`, `createFieldMember`, `registerCast` — asset registration for cast modules in `apps/client/src/game/`
- Movie startup logic, `_director` setup, canvas animation loop (`requestAnimationFrame`)
- Functions that need runtime variables from `runtime.js` but can't live in `core.js` (to avoid circular dependency)
- Barrel re-exports from `core.js`, `runtime.js`, and `the.js`

### Director Loader (`apps/client/src/director/loader.js`)

Preloader that simulates Director's `.cct` preload system:
- Director fully loaded all `.cct` files before executing any script
- Images load via `new Image()` with load/error event tracking
- Modules load via `import()` with promise tracking
- Progress tracked via `totalObjects()`, `objectsLoaded()`, `finished()`, `addFinishedListener()`
- The movie doesn't start until `finished()` returns true

### Director The Proxy (`apps/client/src/director/the.js`)

Proxy that translates Director's `the.property` syntax:
- `the` is special syntax in Director (not a normal variable)
- The proxy intercepts property access and returns values from `_movie`, `_player`, or other global Director objects
- Writes via `the.property = value` are routed back to the underlying objects
- Examples: `the.frame` → current frame, `the.mouseLoc` → mouse position, `the.keyboardFocusSprite` → focus sprite

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
import {
  BEHAVIOR_SCRIPT,
  MOVIE_SCRIPT,
  createBitmapMember,
  createScriptMember,
  registerCast,
} from '../../director'
import Logo from './Internal_4_Logo.png'
import Initialization from './initialization'
import Init from './init'

registerCast('Internal', [
  createScriptMember('Initialization', MOVIE_SCRIPT, Initialization),
  createScriptMember('Init', BEHAVIOR_SCRIPT, Init),
  createBitmapMember('Logo', Logo),
])
```

- **Script members**: `createScriptMember(name, type, factory)` — the factory function is stored and called by the runtime when the script is instantiated
- **Bitmap members**: `createBitmapMember(name, imageUrl)` — Vite resolves the image import to a URL, which is passed to `loadImage` from the loader
- **Cast registration**: `registerCast(name, members)` — creates a `CastLibrary` in `_movie` and registers each `Member`
- **Script types**: `MOVIE_SCRIPT` (global handlers), `BEHAVIOR_SCRIPT` (sprite-attached), `PARENT_SCRIPT` (class-like)

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
| `../../director` (barrel from `index.js`) | All native Director functions from `runtime.js`: `castLib`, `puppetTempo`, `member`, `sprite`, `voidp`, `list`, `propList`, `call`, `go`, `the`, `stopEvent`, `pass`, `netDone`, `ilk`, `stringp`, `symbolp`, `voidp`, `integerp`, `listp`, `objectp`, `field`, `put`, `random`, `string`, `value`, `chars`, `length`, `offset`, `date`, `time`, `timeout`, `script`, `getPref`, `setPref`, `newMember`, `openNetPage`, `gotoNetPage`, `param`, `EMPTY`, `VOID`, `RETURN`, `TAB`, `_global` |
| `../../director` (from `index.js`) | Translation API: `registerCast`, `createScriptMember`, `createBitmapMember`, `createFieldMember`, `MOVIE_SCRIPT`, `BEHAVIOR_SCRIPT`, `PARENT_SCRIPT` |
| Cast-local API files | `./object-api.js`, `./variable-api.js`, etc. (relative to the cast folder in `apps/client/src/game/<cast>/`) |
| `_director` | Available globally — no import needed. Contains movie script handlers registered at startup |
| `_global` | Available globally from `runtime.js` — no import needed. Only use when Lingo code explicitly references `_global` |

**File responsibility rules:**

- **`core.js`** — Helpers, variables, and abstractions for the Director API (`Member`, `CastLibrary`, `Sprite`, `Movie`, `Player`, `List`, `_params`). Editable.
- **`runtime.js`** — ONLY native Director variables and methods. Imports from `core.js` as needed. **Special Director syntax that can't be directly implemented in JS must be reported to the user.**
- **`index.js`** — Translation API: `createBitmapMember`, `createScriptMember`, `createFieldMember`, `registerCast`, movie startup, `_director` setup. Editable.
- **`loader.js`** — Preloader simulation. Do NOT edit unless you understand the preload system.
- **`the.js`** — `the.property` proxy. Do NOT edit unless necessary.

API functions (object-api, variable-api, etc.) are implemented per-cast and imported relatively, not from the director layer.

**Translated `.js` files do NOT need to import `_director` or `_global`** — both are globally available.

## Canvas Rendering

**Everything must be rendered on Canvas.** No DOM overlays.
- Sprite system emulates Director's sprite channels
- All UI elements drawn on canvas (text, images, shapes)
- Mouse/keyboard events routed through canvas
