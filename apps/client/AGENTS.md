# AGENTS.md - Client Project (LingoScript → JavaScript)

## Project Overview

Translation of LingoScript (Macromedia Director MX 2004) to JavaScript with Vite.
Working directory: `apps/client/`. The original `.cct` cast files have been extracted and their `.ls` scripts live in `apps/client/src/game/`, organized by cast name. Each cast has its own `index.js` that registers members and imports translated files.

---

## ⚠️ AGENT RULES — READ BEFORE ANYTHING

1. **The agent does NOT make decisions.** It translates LingoScript to JavaScript following the established pattern. Nothing more.
2. **The agent does NOT invent functions.** If a handler doesn't exist in the `.ls` file, it does NOT exist in the `.js` output. No `construct()`, no `prepareMovie()`, no extras — only what's literally in the source.
3. **The agent does NOT add missing functions on its own.** If a function is missing:
   - **Search the `.ls` files** — it's defined in another script
   - If it IS a native Director function truly missing → **ask the user** before adding to `runtime.js`
   - If uncertain → **ask the user**
4. **The agent follows the pattern exactly.** No deviations, no "improvements", no "completions".

### Where things go:

| What | Where |
|------|-------|
| Native Director functions added to `runtime.js` | Incremental implementation of Director's native API. Only when user approves. |
| Abstractions, helper functions, variables for Director API | `core.js` — classes, helpers, internal state |
| User-facing API to interact with Director runtime | `index.js` — `createBitmapMember`, `registerCast`, etc. |
| Special syntax or unknown constructs | **Ask the user. Do NOT implement workarounds.** |

---

## Director Architecture

### Globals

**Only ONE JavaScript global: `_director`** (`globalThis._director = {}`)

| Name | Type | How to access |
|------|------|---------------|
| `_director` | **JS global** (`globalThis`) | Direct — no import needed. Auto-populated by `registerGlobalHandlers()` in `index.js`. |
| `_global` | **JS export** from `runtime.js` | **MUST be imported** from `../../director`. Used for shared state (`_global.gCore`, `_global.gError`, etc.). |

### Director Layer Files

| File | Purpose |
|------|---------|
| **`core.js`** | Classes (`Member`, `CastLibrary`, `Sprite`, `Movie`, `Player`, `List`), `_params`, helpers, abstractions, internal state |
| **`runtime.js`** | **ONLY native Director functions**: `_global`, `_movie`, `_player`, `EMPTY`, `VOID`, `RETURN`, `TAB`, `castLib`, `member`, `sprite`, `voidp`, `list`, `propList`, `call`, `go`, `field`, `value`, `string`, `put`, `pass`, `netDone`, `ilk`, `stringp`, `symbolp`, `integerp`, `listp`, `objectp`, `chars`, `length`, `offset`, `random`, `date`, `time`, `timeout`, `script`, `getPref`, `setPref`, `newMember`, `openNetPage`, `gotoNetPage`, `param`, `puppetTempo`, `stopEvent` |
| **`index.js`** | Translation API (`createBitmapMember`, `createScriptMember`, `registerCast`, etc.), barrel re-exports, `_director` setup. `start()` calls `registerGlobalHandlers()` which copies all movie script factory returns to `_director`. |
| **`loader.js`** | Preload simulation. Do NOT edit. |
| **`the.js`** | `the.property` proxy. Do NOT edit. |

### How `_director` Works

```
index.js start() — called when preload finishes:
  1. For each MOVIE_SCRIPT:
     a. factory = member._raw()
     b. for (const prop in factory) _director[prop] = factory[prop]
  2. Dispatch 'prepareMovie' on canvas
```

**Every function returned by a movie script factory is automatically `_director.functionName()`. No manual registration needed.**

---

## Commands

```bash
npm run dev       # Vite dev server with external params from .env.development
npm run build     # Exports mount(el, params) function + casts as separate chunks
npm run preview   # Preview the build
```

---

## Translation Pattern (1:1 LITERAL TRANSLATION)

### THE ONLY PATTERN

```js
// Lingo: 6_Object API.ls

global gCore

on constructObjectManager me
  if objectp(gCore) then
    return gCore
  end if
  // ... body
end

on getObjectManager
  if voidp(gCore) then
    return constructObjectManager()
  end if
  return gCore
end

on createObject tID
  // ... body
end
```

```js
// JavaScript: object-api.js

import { _global, field, listp, objectp, param, RETURN, script, value, voidp } from "../../director";

export default function () {
  _global.gCore = _global.gCore ?? null;

  return {
    constructObjectManager() {
      if (objectp(_global.gCore)) {
        return _global.gCore;
      }
      // ... body
    },

    getObjectManager() {
      if (voidp(_global.gCore)) {
        return this.constructObjectManager();
      }
      return _global.gCore;
    },

    createObject(tID) {
      // ... body
    },
  };
}
```

**That's it. That's the entire pattern.**

- Every `on handlerName me, args` → method in return object: `handlerName(args) { }`
- Every `global gVar` → `_global.gVar = _global.gVar ?? defaultValue` at top of factory
- `global gVar` accesses → `_global.gVar`
- Everything else is a direct Lingo → JS translation

### Behavior Script (sprite-attached)

Same pattern. Return object with event handlers:

```js
import { call, list, listp, pass, propList, sprite, stopEvent, stringp, symbolp, the, VOID, voidp } from "../../director";

export default function () {
  return {
    // properties
    id: 0,
    pSprite: null,

    // event handlers from .ls file
    mouseEnter() { /* ... */ },
    mouseUp() { /* ... */ },

    // custom methods from .ls file
    redirectEvent(tEvent) { /* ... */ },
  };
}
```

### Parent Script (class-like)

Same pattern. Return object with methods:

```js
import { list, voidp } from "../../director";

export default function () {
  return {
    pData: null,

    construct() {
      this.pData = list();
      return true;
    },

    someMethod(arg) { /* ... */ },
  };
}
```

---

## Lingo → JS Mapping

| Lingo | JavaScript |
|-------|-----------|
| `property pFoo` | `pFoo: null` (property on returned object) |
| `on construct me` | `construct() { return true; }` — **ONLY if it exists in .ls** |
| `on methodName me, args` | `methodName(args) { /* ... */ }` |
| `global gVar` | `_global.gVar = _global.gVar ?? defaultValue` (**import `_global`**) |
| `[: ]` (propList) | `propList()` with bracket access `obj[key]` |
| `[ ]` (linear list) | `[]` Array |
| `voidP(x)` | `voidp(x)` |
| `x.ilk = #symbol` | `typeof x === 'symbol'` or `ilk(x)` |
| `member("name")` | `member()` |
| `sprite(n)` | `sprite()` |
| `timeout().new()` | `timeout()` |
| `script("Name").new()` | `script().new()` |
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

---

## Script Types

**The AI agent must ask the user what type a script is before translating.**

| Type | Usage |
|------|-------|
| `MOVIE_SCRIPT` | Global handlers. Single instance. Functions auto-registered in `_director`. |
| `BEHAVIOR_SCRIPT` | Attached to sprites. New instance per sprite. Event handlers on sprite events. |
| `PARENT_SCRIPT` | Class-like. Instantiated via `script("Name").new()`. New instance per call. |

### Lingo Symbols

Use `Symbol.for("name")`. Strip the `#`:

```js
// Lingo: #mouseEnter, #session
Symbol.for("mouseEnter")
Symbol.for("session")
```

---

## Import Rules

| From | What |
|------|------|
| `../../director` | Native Director functions (`castLib`, `member`, `sprite`, `voidp`, `list`, `propList`, `call`, `go`, `field`, `value`, `string`, `put`, `pass`, `netDone`, `ilk`, `stringp`, `symbolp`, `integerp`, `listp`, `objectp`, `chars`, `length`, `offset`, `random`, `date`, `time`, `timeout`, `script`, `getPref`, `setPref`, `newMember`, `openNetPage`, `gotoNetPage`, `param`, `puppetTempo`, `stopEvent`, `EMPTY`, `VOID`, `RETURN`, `TAB`) |
| `../../director` | **`_global`** — shared state (**MUST be imported**) |
| `../../director` | Translation API: `registerCast`, `createScriptMember`, `createBitmapMember`, `createFieldMember`, `MOVIE_SCRIPT`, `BEHAVIOR_SCRIPT`, `PARENT_SCRIPT` |
| Cast-local | `./object-api.js`, `./variable-api.js` (relative) |

**`_director` is the only JS global — no import needed.**

Import **only what you use**.

---

## ⚠️ runtime.js Rules

**`runtime.js` = ONLY native Director functions.**

If a function like `convertToPropList` is missing → it's defined in a `.ls` file, NOT in runtime. **Search the `.ls` files first.**

### When editing `runtime.js`:
1. **NEVER overwrite** — read first, add only what's missing
2. **Alphabetical order** for new functions
3. **Never delete** existing functions
4. Internal state under `// ── Internal state ──`
5. Constants under `// ── Constants ──`
6. **Ask the user** before adding anything

---

## Translation Workflow

### Order
1. **habbo** → entry point
2. **fuse_client** → core framework
3. **hh_* casts** → per `client/external/external_variables.txt`

### Naming
- `6_Object API.ls` → `object-api.js`
- `33_Connection Manager Class.ls` → `connection-manager-class.js`
- Lowercase, hyphens, strip number prefixes

### Tasks (`tasks/` directory)
Each cast has a `.md` TODO checklist. When translating:
1. Translate entire `.ls` → `.js`
2. If function missing → search `.ls` files
3. If dependency not translated → placeholder + add subtask
4. After completion → check for resolvable placeholders

---

## File Organization

```
apps/client/
├── src/
│   ├── main.js
│   ├── director/
│   │   ├── index.js       # Translation API + barrel exports + _director
│   │   ├── core.js        # Classes, helpers, abstractions
│   │   ├── runtime.js     # ONLY native Director functions + _global
│   │   ├── loader.js      # Preload simulation
│   │   └── the.js         # the.property proxy
│   └── game/
│       └── <cast>/
│           ├── index.js   # registerCast()
│           ├── *.js       # Translated files
│           └── *.png      # Assets
└── tasks/
    └── *.md               # TODO checklists
```

### Cast Registration

```js
import { BEHAVIOR_SCRIPT, MOVIE_SCRIPT, createBitmapMember, createScriptMember, registerCast } from '../../director'

registerCast('Internal', [
  createScriptMember('Initialization', MOVIE_SCRIPT, Initialization),
  createBitmapMember('Logo', Logo),
])
```

### Asset Handling
- Images: `import Logo from './logo.png'` → URL
- Text: `import Props from './props.txt?raw'` → string
- Stay in cast directories. No `public/` folder.

### Stage: 720x540 canvas, `image-rendering: pixelated`

---

## Canvas Rendering

**Everything on Canvas.** No DOM overlays.
- Sprite system emulates Director's sprite channels
- All UI drawn on canvas
- Mouse/keyboard events routed through canvas
