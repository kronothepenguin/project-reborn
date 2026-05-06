# AGENTS.md - Client (LingoScript → JavaScript)

## Quick Reference

| Need | Solution |
|------|----------|
| Import native function | `import { func } from "../../director"` |
| Call non-native function | `_director.funcName()` |
| Global variable | `_global.gVar` (import from `../../director`) |
| Property declaration | `pFoo: VOID` in return object |
| Local variable | `let tVar` hoisted before return |
| Symbol `#key` | `Symbol.for("key")` |
| String chunks `t.item[i]` | `itemOf(t)[i]` |

**Import paths:** `../../director` (native funcs), `./local-file.js` (cast-local)

---

## ⚠️ AGENT RULES

1. **NO decisions** — translate literally, nothing more
2. **NO inventing** — if handler not in `.ls`, not in `.js`
3. **NO file searches** — non-natives become `_director.funcName()`
4. **NO deviations** — follow pattern exactly, no "improvements"
5. **Ask user** script type (`MOVIE_SCRIPT`, `BEHAVIOR_SCRIPT`, `PARENT_SCRIPT`) before registration
6. **Match Members.csv** — use `Number` column for order, register **ALL** members (not just scripts)
7. **Verify 1:1** — compare original `.ls` to translated `.js` before finishing
8. **No runtime.js inventions** — only add native Director functions (verify against docs)
9. **Missing source file** — create placeholder with comment indicating pending translation

### Where Things Go

| What | Where |
|------|-------|
| Native Director API | `runtime.js` (user approval required) |
| Classes, helpers, state | `core.js` |
| User-facing API (member creators) | `index.js` |
| `the.*` properties + chunks | `syntax.js` |
| Preload tracking | `loader.js` |
| Unknown constructs | **Ask user** |

---

## Architecture

### Globals

```
_director  → globalThis (auto-populated)
_global    → import from ../../director
```

### Director Files

| File | Purpose |
|------|---------|
| `index.js` | Translation API (`createBitmapMember`, `registerCast`), barrel exports, `_director` setup |
| `core.js` | Classes (`Point`, `Rect`, `Color`, `Member`, `Sprite`, `Movie`, `Player`, `List`, `PropList`), internal state |
| `runtime.js` | Native Director functions (`_movie`, `_player`, `list`, `propList`, `script`, `go`, `field`, `voidp`, `ilk`, etc.) |
| `syntax.js` | Lingo syntax workarounds: `the.*` properties, chunk helpers (`itemOf`, `wordOf`, `lineOf`, `charOf`), range syntax (`1..5`), string extraction |
| `loader.js` | Preload tracking (`loadImage`, `loadModule`, `loadPromise`) |

### How `_director` Works

```
index.js start():
  1. For each MOVIE_SCRIPT: factory = member._raw(); copy props to _director
  2. Dispatch 'prepareMovie' on canvas
```

Every movie script factory return becomes `_director.functionName()`.

---

## Translation Pattern

### Movie Script / Parent Script / Behavior Script

```js
// JavaScript (all types same pattern)
import { _global, objectp, voidp, VOID } from "../../director";

export default function () {
  // Global declarations
  _global.gCore = _global.gCore ?? VOID;

  // Implicit locals (hoisted)
  let tVar;

  return {
    // Properties
    pFoo: VOID,

    // Handlers
    constructObjectManager() {
      if (objectp(_global.gCore)) return _global.gCore;
    },

    someMethod(arg) { /* ... */ },
  };
}
```

### Lingo → JS Mapping

| Lingo | JavaScript |
|-------|-----------|
| `property pFoo` | `pFoo: VOID` (return object) |
| `on handler me, args` | `handler(args) { }` |
| `global gVar` | `_global.gVar = _global.gVar ?? VOID` |
| `[ : ]` | `propList()` |
| `[ ]` | `list()` |
| `voidp(x)` | `voidp(x)` |
| `x.ilk = #sym` | `ilk(x) === Symbol.for("sym")` |
| `t contains "str"` | `t.includes("str")` |
| `repeat with i = 1 to n` | `for (let i = 1; i <= n; i++)` |
| `repeat with x in list` | `for (const x of list)` |
| `case x of ... otherwise: ... end case` | `switch(x) { ... default: ... }` |
| `EMPTY` / `VOID` | `EMPTY` / `VOID` |
| `the paramCount` | `arguments.length` |
| `param(n)` | `arguments[n - 1]` |
| `t.item[i]` | `itemOf(t)[i]` |
| `t.item.count` | `itemOf(t).count` |
| `t.item[first..last]` | `itemOf(t).slice(first, last)` |
| `tProps[#key]` | `tProps[Symbol.for("key")]` |
| `"a" && "b"` | `` `a b` `` |
| `str1 & str2` | `str1 + str2` |
| `put str` | `put(str)` |
| `me.method()` | `this.method()` (never call runtime functions on this) |
| `call(#h, obj, args)` | `call(Symbol.for("h"), obj, args)` |
| `return 1` / `return 0` | `return 1` / `return 0` |

### Me Handling

**ALWAYS translate `me.method()` as `this.method()`** — never call native runtime functions on `this`.

```js
// Lingo: me.getProp(#key)
// JS: this.getProp(Symbol.for("key"))  ← NOT getProp(...) from runtime

// Lingo: me.construct()
// JS: this.construct()  ← NOT the native constructor
```

This applies to ALL methods called on `me`, even if they match native Director function names.

### Implicit Variable Scope

- **`property`** → in return object (persistent)
- **Implicit local** (`tVar = ...`) → hoisted `let tVar` before return object

### JS Keyword Conflicts

| Lingo Handler | JS Method |
|---------------|-----------|
| `on try me` | `tryFn()` |
| `on catch me` | `catchFn()` |
| `on delete me` | `deleteFn()` |

Use `_director.tryFn()` for calls.

---

## Script Types

| Type | Usage | Registration |
|------|-------|--------------|
| `MOVIE_SCRIPT` | Global handlers, single instance | Auto-registered in `_director` |
| `BEHAVIOR_SCRIPT` | Sprite-attached, new instance per sprite | Via `createScriptMember` |
| `PARENT_SCRIPT` | Class-like, `script("Name").new()` | Via `createScriptMember` |

**Ask user** for script type before registration.

---

## Import Resolution

```
Step 1: Native Director API?     → import from ../../director
Step 2: Exported in runtime.js? → import from ../../director
Step 3: NOT native?             → _director.funcName()
Step 4: Unknown?                → Ask user
```

| Source | What |
|--------|------|
| `../../director` | Native functions + `_global` |
| Cast-local | `./file.js` (relative) |
| `globalThis` | `_director` only |

---

## runtime.js vs core.js

### runtime.js
- **ONLY native Director functions** (verify against MX 2004 docs)
- Alphabetical order
- Constants under `// ── Constants ──`
- Internal state under `// ── Internal state ──`
- **Never delete existing functions**

### core.js
- Classes (`List`, `PropList`, `Member`, `Sprite`, etc.)
- Internal helpers
- Non-native logic

**Boundary:** If it's in Director docs → `runtime.js`. If it's your helper → `core.js`.

---

## Workflow

1. **Read** original `.ls` file completely
2. **Translate** → `.js` (1:1 literal)
3. **Verify** → compare every line to original
4. **Register** in module's `index.js` (order by Members.csv `Number` column)
5. **Ask user** script type if unknown

### File Naming
- `6_Object API.ls` → `object-api.js`
- Lowercase, hyphens, strip number prefixes

### Tasks Directory
Each cast has `.md` checklist. Use as TODO tracker.

### Missing Source Files

If the `.ls` source file is missing but the member exists in `Members.csv`:

```js
// <Member Name>
// Translated from: <Number>_<Name>.ls (NOT YET TRANSLATED - PENDING)

export default function () {
  return {};
}
```

- Add comment with original file reference
- Return empty factory object `return {}`
- Still register in `index.js` with correct type

---

## File Organization

```
apps/client/
├── src/
│   ├── main.js
│   ├── director/
│   │   ├── index.js       # API + exports + _director
│   │   ├── core.js        # Classes, helpers
│   │   ├── runtime.js     # Native Director functions
│   │   ├── syntax.js      # the.* + chunk helpers
│   │   └── loader.js      # Preload
│   └── game/
│       └── <cast>/
│           ├── Members.csv
│           ├── index.js    # registerCast()
│           ├── *.js        # Translated
│           └── *.png       # Assets
└── tasks/
    └── *.md                # TODO checklists
```

### Registration Example

```js
import { 
  BEHAVIOR_SCRIPT, MOVIE_SCRIPT, PARENT_SCRIPT,
  createBitmapMember, createFieldMember, createPaletteMember,
  createScriptMember, createSoundMember, createTextMember,
  registerCast 
} from '../../director'

import Logo from './logo.png'
import Props from './props.txt?raw'

registerCast('fuse_client', [
  createFieldMember('System Props', Props),
  createScriptMember('Event Broker Behavior', BEHAVIOR_SCRIPT, EventBrokerBehavior),
  createBitmapMember('Logo', Logo),
  // ... ALL members in Members.csv Number order
])
```

**Order MUST match Members.csv `Number` column.**
**Register ALL members from Members.csv**, not just scripts.

---

## Member Types

| CSV Type | JS Helper | Import |
|----------|-----------|--------|
| `script` | `createScriptMember(name, type, factory)` | Translated `.js` file |
| `field` | `createFieldMember(name, content)` | Text file with `?raw` |
| `text` | `createTextMember(name, content)` | Text file with `?raw` (TBD) |
| `bitmap` | `createBitmapMember(name, src)` | Image import |
| `palette` | `createPaletteMember(name, src)` | Image import (TBD) |
| `sound` | `createSoundMember(name, src)` | Audio import (TBD) |
| `shape` | `createShapeMember(name, shapeType)` | TBD |
| `font` | `createFontMember(name, fontName)` | TBD |

**(TBD)** = Helper not yet implemented in `index.js`.

---

## Common Pitfalls

| Mistake | Fix |
|---------|-----|
| Using `.length` on List | Use `.count` |
| Using `.push()` on List | Use `.add()` |
| Forgetting `Symbol.for()` | All symbols need it |
| Missing `this.` on property access | Properties require `this.pFoo` |
| Forgetting 1-based indexing | String chunks are 1-based |
| Using `===` when Lingo uses `=` | Lingo `=` is comparison |
| Not importing `_global` | Required for `global gVar` |

---

## TBD Patterns

Some Lingo syntax patterns are not yet implemented. See `src/director/TBD.md` for the full list.

Currently missing:
- `the last char in tName` / `the last word in tStr`
- `the number of castLibs` / `the number of castMembers of castLib N`
- `the number of items in tLine` / `the number of lines in tStr`

When translating, use the closest workaround available or **ask user**.

---

## Canvas Rendering

Everything on canvas. No DOM overlays. Sprite system emulates Director channels. Mouse/keyboard events route through canvas.

Stage: 720x540, `image-rendering: pixelated`
