# AGENTS.md - Client Project (LingoScript → JavaScript)

## Project Overview

Traducción 1:1 de LingoScript (Macromedia Director MX 2004) a JavaScript con Vite.
Los casts originales están en `./casts/` y se traducen a `./src/`.

## Commands

```bash
npm run dev       # Vite dev server con external params desde .env.development
npm run build     # Exporta funcion mount(el, params) + casts como chunks separados
npm run preview   # Preview del build
```

## Translation Workflow

### Order of Translation
1. **habbo** → entry point (boot sequence)
2. **fuse_client** → core framework (APIs, managers, runtime)
3. **hh_* casts** → en orden de `cast.entry.#` desde `client/external/external_variables.txt`

### Naming Convention
- `6_Object API.ls` → `object-api.js`
- `33_Connection Manager Class.ls` → `connection-manager-class.js`
- `Internal_1_Initialization.ls` → `initialization.js`
- Lowercase, hyphens, no numbers prefix

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
2. If a Director function is not implemented → add to `core/lingo-runtime.js`
3. If code depends on a not-yet-translated file → create a placeholder + add subtask in the corresponding `tasks/<cast>.md`
4. After completing a file → check all `tasks/*.md` for placeholders that can now be resolved

### Asset Handling

**Assets must be copied from `./casts/<cast>/` to `./src/<cast>/`** preserving `Members.csv` names. Vite imports return URLs (not base64) for files >4KB, which are optimized and hashed.

```js
// In cast's index.js - import asset and register as member
import logoImg from './1_Logo.png'  // Vite returns URL string
registerMember('Logo', 4, 'bitmap', 'fuse_client', logoImg)
```

- Bitmap assets: copy `.png` files to `src/<cast>/` folder
- Text assets: keep `.txt` extension (e.g., `System Props.txt`)
- Vite optimizes and generates hashed URLs in build
- Do NOT use `public/` folder - assets in `src/` get optimized

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
| `member("name")` | Asset import or registry lookup |
| `sprite(n)` | Canvas sprite object |
| `sendSprite(id, #msg)` | Event dispatch to sprite |
| `puppetSprite(n, true)` | Take control of sprite |
| `the stage` | Canvas/stage singleton |
| `the mouseLoc` | Mouse position tracker |
| `timeout().new()` | `new Timeout()` |
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

Lingo uses symbols like `#mouseEnter`, `#session`, `#null` as identifiers. In JavaScript, use `Symbol.for('#name')` which uses the **global symbol registry** and guarantees identity:

```js
Symbol.for('#mouseEnter') === Symbol.for('#mouseEnter') // true - same symbol
Symbol('#mouseEnter') === Symbol('#mouseEnter')         // false - different symbols
```

Always use `Symbol.for('#name')` (or the `symbol('#name')` helper from runtime) when translating Lingo symbols. The `#` prefix must be preserved to make it clear these come from Lingo.

```js
import { symbol } from '../core/lingo-runtime.js'

// Correct:
getObject(symbol('#session'))
tList.setaProp(symbol('#mouseEnter'), [symbol('#null'), 0])

// WRONG - creates new symbol each call:
getObject(Symbol('session'))
```

### Member/CastLib Registry

Each cast's `index.js` registers its members based on the `Members.csv` file from the original `.cct` extraction. This allows `member(name)`, `member(num)`, `getmemnum(name)`, and `castLib(name/num)` to work correctly across casts.

**Registration pattern** (in each cast's `index.js`):
```js
import { registerMember, registerCastLib } from '../core/lingo-runtime.js'

registerCastLib('fuse_client', 2, 'fuse_client.cct')
registerMember('System Props', 1, 'field', 'fuse_client')
registerMember('Object API', 6, 'script', 'fuse_client')
registerMember('Logo', 4, 'bitmap', 'fuse_client')
```

Member types: `script`, `field`, `bitmap`, `text`. Numbers and names must match the original `Members.csv`.

### Director Movie Handlers

`prepareMovie`, `stopMovie`, and `exitFrame` are **special Director movie-level handlers**, not regular functions. They are called by the runtime at specific times, not imported by other code.

**Translation pattern:**
```js
// In the translated file:
import { registerMovieHandler } from '../core/lingo-runtime.js'

function prepareMovie() {
  // ... translated code
}

// Register as Director movie handler (side-effect)
registerMovieHandler('prepareMovie', prepareMovie, 'castName')
```

The cast's `index.js` imports files for their side-effects (handler registration), not for exports:
```js
import './initialization.js'  // registers prepareMovie, stopMovie
import './loop.js'            // registers exitFrame
```

### File Organization
- All casts in `src/` at root level: `src/fuse_client/`, `src/hh_entry_init/`, etc.
- Each cast has `index.js` that re-exports everything (simulates Director global scope)
- `src/core/lingo-runtime.js` - incremental Director function implementations
- `src/main.js` - entry point, exports `mount(el, params)`

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
Call prepareMovie handlers (registered by casts)
  ↓
Start requestAnimationFrame loop:
  └─ Each frame: call exitFrame handlers → render sprites
```

#### Lifecycle Callbacks

| Director Handler | When it fires | JS Implementation |
|-----------------|---------------|-------------------|
| `prepareMovie` | Once at startup | Called by `mount()` before game loop |
| `stopMovie` | On unmount | Called by `unmount()` |
| `exitFrame` | Every frame | Called in `requestAnimationFrame` loop |
| `beginSprite` | When sprite becomes visible | TODO: sprite system |
| `endSprite` | When sprite is removed | TODO: sprite system |

#### Mouse/Keyboard Tracking

```js
// Runtime globals (updated by canvas event listeners)
the mouseLoc   → { locH: x, locV: y }
the mouseH     → x coordinate
the mouseV     → y coordinate
the keyDown    → boolean
the milliSeconds → Date.now()
```

Events are tracked on the canvas element. Sprite-level event dispatch (mouseDown, mouseUp, etc.) is not yet implemented.

#### Build vs Dev

- **Dev**: `mount()` auto-calls on `DOMContentLoaded`, params from `.env.development`
- **Build**: exports `mount(element, params)` function for host page to call

### Runtime Lingo (`core/lingo-runtime.js`)

Implement functions **incrementally** as they are encountered during translation:
- Do NOT implement all Director functions upfront
- Only implement what the current file being translated needs
- Each function should be a named export

### Canvas Rendering

**Everything must be rendered on Canvas.** No DOM overlays.
- Sprite system emulates Director's sprite channels
- All UI elements drawn on canvas (text, images, shapes)
- Mouse/keyboard events routed through canvas

## Dynamic Cast Loading

Original Director behavior:
1. Load `external_variables.txt` → parse `cast.entry.#` entries
2. Concatenate each name with `.cct` → `startCastLoad(["hh_entry_uk.cct", ...])`
3. Director downloads .cct files, mounts them as castLibs, code/assets become globally available

JavaScript translation:
- `import.meta.glob('./**/index.js', { eager: false })` for implemented casts
- Registry generated from `external_variables.txt` at build time
- `import()` dynamic with mapped strings (Vite requires static analysis)
- Furnis .cct: `fetch(url).then(r => r.blob())` → future WASM extraction

See `CAST-LOADING.md` for detailed documentation.

## Architecture

```
src/
├── main.js              # mount(el, params) entry point, game loop, events
├── core/
│   └── lingo-runtime.js # Director functions (incremental)
├── habbo/               # Boot cast
│   ├── index.js         # Member registration + handler imports
│   └── *.js             # Translated .ls files
├── fuse_client/         # Core framework
│   ├── index.js         # Member registration + handler imports
│   └── *.js             # Translated .ls files
└── hh_*/                # Feature casts
    ├── index.js
    └── *.js
```

- `main.js` exports `mount(element, params)` for build mode
- Dev mode auto-mounts on `DOMContentLoaded`, reads params from `.env.development`
- Each cast's `index.js` registers members and imports translated files (side-effects)
- Dynamic loading via `import()` for casts not in initial bundle
- Stage: 720x540 canvas, `image-rendering: pixelated`
