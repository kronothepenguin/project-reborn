# AGENTS.md - Client Project (LingoScript → JavaScript)

## Project Overview

Translation of LingoScript (Macromedia Director MX 2004) to JavaScript with Vite.
Working directory: `apps/client/`. The original `.cct` cast files have been extracted and their `.ls` scripts live in `apps/client/src/game/`, organized by cast name. Each cast has its own `index.js` that registers members and imports translated files.

---

## ⚠️ AGENT RULES — READ BEFORE ANYTHING

1. **The agent does NOT make decisions.** It translates LingoScript to JavaScript following the established pattern. Nothing more.
2. **The agent does NOT invent functions.** If a handler doesn't exist in the `.ls` file, it does NOT exist in the `.js` output. No `construct()`, no `prepareMovie()`, no extras — only what's literally in the source.
3. **The agent does NOT search `.ls` files.** Never search across files to find function definitions. All non-native function calls translate to `_director.funcName()` or `_director.keywordFn()`.
4. **The agent follows the pattern exactly.** No deviations, no "improvements", no "completions".
5. **The agent MUST ask the user the script type** (`MOVIE_SCRIPT`, `BEHAVIOR_SCRIPT`, `PARENT_SCRIPT`) before translating. The agent cannot determine this on its own.

### Where things go:

| What | Where |
|------|-------|
| Native Director API functions | `runtime.js` — ONLY when user approves adding a missing function |
| Classes, helpers, internal state | `core.js` — `List`, `PropList`, `Member`, `Sprite`, etc. |
| User-facing translation API | `index.js` — `createBitmapMember`, `registerCast`, etc. |
| Special syntax or unknown constructs | **Ask the user. Do NOT implement workarounds.** |

---

## Director Architecture

### Globals

**Only ONE JavaScript global: `_director`** (`globalThis._director = {}`)

| Name | Type | How to access |
|------|------|---------------|
| `_director` | **JS global** (`globalThis`) | Direct — no import needed. Auto-populated by `registerGlobalHandlers()` in `index.js`. |
| `_global` | **JS export** from `runtime.js` | **MUST be imported** from `../../director`. Used for shared state (`_global.gCore`, `_global.gError`, etc.). Translates Lingo `global gVar` declarations 1:1. |

### Director Layer Files

| File | Purpose |
|------|---------|
| **`core.js`** | Classes (`Member`, `CastLibrary`, `Sprite`, `Movie`, `Player`, `List`, `PropList`), `_params`, helpers, internal state (`_timeouts`, etc.) |
| **`runtime.js`** | **ONLY native Director functions**: `_global`, `_movie`, `_player`, `EMPTY`, `VOID`, `RETURN`, `TAB`, `castLib`, `member`, `sprite`, `voidp`, `list`, `propList`, `call`, `go`, `field`, `value`, `string`, `put`, `pass`, `netDone`, `ilk`, `stringp`, `symbolp`, `integerp`, `listp`, `objectp`, `chars`, `length`, `offset`, `random`, `date`, `time`, `timeout`, `script`, `getPref`, `setPref`, `newMember`, `openNetPage`, `gotoNetPage`, `puppetTempo`, `stopEvent` |
| **`index.js`** | Translation API (`createBitmapMember`, `createScriptMember`, `registerCast`, etc.), barrel re-exports, `_director` setup. `start()` calls `registerGlobalHandlers()` which copies all movie script factory returns to `_director`. |
| **`loader.js`** | Preload simulation. Ask user before editing. |
| **`the.js`** | `the.property` proxy. Ask user before editing. |

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

import { _global, field, listp, objectp, RETURN, script, value, voidp } from "../../director";

export default function () {
  _global.gCore = _global.gCore ?? VOID;

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
- Every `global gVar` → `_global.gVar = _global.gVar ?? VOID` at top of factory
- `global gVar` accesses → `_global.gVar`
- Everything else is a direct Lingo → JS translation

### Behavior Script (sprite-attached)

Same pattern. Return object with event handlers:

```js
import { call, list, listp, pass, propList, sprite, stopEvent, stringp, symbolp, the, VOID, voidp } from "../../director";

export default function () {
  return {
    // properties
    id: VOID,
    pSprite: VOID,

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
    pData: VOID,

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
| `property pFoo` | `pFoo: VOID` (property on returned object) |
| `on methodName me, args` | `methodName(args) { /* ... */ }` |
| `global gVar` | `_global.gVar = _global.gVar ?? VOID` (**import `_global`**) |
| `[ : ]` (propList) | `propList()` |
| `[ ]` (linear list) | `list()` |
| `voidP(x)` | `voidp(x)` |
| `x.ilk = #symbol` | `ilk(x)` |
| `member("name")` | `member()` |
| `sprite(n)` | `sprite()` |
| `timeout().new()` | `timeout()` |
| `script("Name").new()` | `script().new()` |
| `setaProp(#key, val)` | `obj.setaProp('key', val)` |
| `getaProp(#key)` | `obj.getaProp('key')` |
| `list.add(x)` | `list.push(x)` (List class method) |
| `list.count` | `list.length` (List class property) |
| `repeat with i = 1 to n` | `for (let i = 1; i <= n; i++)` |
| `repeat with x in list` | `for (const x of list)` |
| `case x of ... end case` | `switch(x) { ... }` |
| `EMPTY` | `EMPTY` (import from `../../director`) |
| `VOID` | `VOID` (import from `../../director`) |
| `return 1` (success) | `return true` |
| `return 0` (failure) | `return false` |
| `the paramCount` | `arguments.length` |
| `param(n)` | `arguments[n - 1]` |

### JavaScript Keyword Conflicts

When a Lingo handler name collides with a JavaScript keyword, append `Fn` suffix to both the **definition** and the **call**:

| Lingo Handler | JS Method Name | JS Call |
|---------------|---------------|---------|
| `on try me` | `tryFn()` | `_director.tryFn()` |
| `on catch me` | `catchFn()` | `_director.catchFn()` |
| `on delete me` | `deleteFn()` | `_director.deleteFn()` |
| `on void me` | `voidFn()` | `_director.voidFn()` |

Native JS operations (`delete obj.prop`, `typeof x`, `void 0`) are used as-is — this rule only applies to Lingo handler definitions and their `_director` calls.

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
| `../../director` | Native Director functions (import only what you use) |
| `../../director` | **`_global`** — shared state (**MUST be imported**) |
| Cast-local | `./object-api.js`, `./variable-api.js` (relative) |

**`_director` is the only JS global — no import needed.**

### How to resolve any function call

**Step 1:** Is it a native Lingo/Director API function?

**Step 2:** If native → import from `../../director`

**Step 3:** If it's native but NOT exported from `../../director` → ask the user to add it to `runtime.js`

**Step 4:** If NOT native → call via `_director.funcName()` (or `_director.keywordFn()` if it collides with a JS keyword)

| Type | How to use | Example |
|------|-----------|---------|
| Native Director function | `import { func } from "../../director"` | `objectp()`, `voidp()`, `script()`, `field()` |
| Non-native (from another `.ls`) | `_director.funcName()` | `_director.createObject()`, `_director.convertToPropList()` |
| JS keyword conflict | `_director.keywordFn()` | `_director.tryFn()`, `_director.catchFn()` |

Import **only what you use**.

---

## ⚠️ runtime.js Rules

**`runtime.js` = ONLY native Director functions.**

### When editing `runtime.js`:
1. **NEVER overwrite** — read first, add only what's missing
2. **Alphabetical order** for new functions
3. **Never delete** existing functions
4. Internal state under `// ── Internal state ──`
5. Constants under `// ── Constants ──`
6. **Ask the user** before adding anything
7. Helpers and non-native logic go in `core.js`, NOT `runtime.js`

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
2. If dependency not translated → placeholder + add subtask
3. After completion → check for resolvable placeholders

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
│           ├── Members.csv   # Source of truth for member order & types
│           ├── index.js      # registerCast() — created by user
│           ├── *.js          # Translated files
│           └── *.png         # Assets
└── tasks/
    └── *.md                  # TODO checklists
```

### Cast Registration

```js
import { BEHAVIOR_SCRIPT, MOVIE_SCRIPT, createBitmapMember, createScriptMember, registerCast } from '../../director'

registerCast('Internal', [
  createScriptMember('Initialization', MOVIE_SCRIPT, Initialization),
  createBitmapMember('Logo', Logo),
])
```

**Member registration order MUST match `Members.csv` exactly.** Use the `Number` column as the source of truth.

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
