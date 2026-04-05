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

- Use relative imports from casts: `import img from "../../../../casts/fuse_client/1_Logo.png"`
- If Vite has issues with extensions, copy assets to local folder preserving Members.csv names
- Keep `.txt` extension if needed: `System Props.txt`

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

### File Organization
- All casts in `src/` at root level: `src/fuse_client/`, `src/hh_entry_init/`, etc.
- Each cast has `index.js` that re-exports everything (simulates Director global scope)
- `src/core/lingo-runtime.js` - incremental Director function implementations
- `src/main.js` - entry point, exports `mount(el, params)`

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
├── main.js              # mount(el, params) entry point
├── core/
│   └── lingo-runtime.js # Director functions (incremental)
├── habbo/               # Boot cast
│   └── index.js
├── fuse_client/         # Core framework
│   └── index.js
└── hh_*/                # Feature casts
    └── index.js
```

- `main.js` exports `mount(element, params)` for build mode
- Dev mode reads params from `.env.development`
- Each cast's `index.js` re-exports all translated files
- Dynamic loading via `import()` for casts not in initial bundle
