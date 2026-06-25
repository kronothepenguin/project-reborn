---
name: linguoscript-to-javascript
description: Translate LingoScript (.ls) files from any Macromedia Director version to JavaScript 1:1 using the director runtime shim. Use when translating .ls cast scripts to .js, generating per-cast index.js registrations, or mapping Lingo constructs (symbols, chunks, put, the, script types) to JavaScript. Covers movie/parent/behavior script shapes, Members.csv registration, and the full Lingo to JS construct mapping.
license: MIT
compatibility: opencode
metadata:
  audience: lingo-translators
  project: project-reborn
  reference: docs/drmx2004_scripting_ref.txt
---

# LingoScript to JavaScript Translation

Translate LingoScript (`.ls`) from any Macromedia Director version (6, 7, 8, 8.5, MX, MX 2004) to JavaScript 1:1 via the `@project-reborn/director` runtime shim. No parser, no AST, no codegen. Translation = copy `.ls`, rewrite syntax to JS, import primitives from `@project-reborn/director/api` and `@project-reborn/director/syntax`. `packages/director/src/core/` is private — translated code must not import from it.

## When to use

- Translate a `.ls` file or whole cast to JavaScript.
- Write or update a per-cast `index.js` registration.
- Map a Lingo construct to JavaScript.
- Identify the script type of a `.ls` file.

Not for building the `@project-reborn/director` shim itself — this skill consumes it.

## Hard rules

1. **Lingo symbols → `Symbol.for(name)`**, never `Symbol()`. `PropList` compares keys by `===` identity; `Symbol.for` is globally interned across modules, `Symbol()` is not. `#null` → `Symbol.for("null")`.
2. **Shape mirrors `property` block, binary.** No `property` keyword → movie shape (exported functions). Has `property` keyword → class shape (`export default class`). parent↔behavior share the class shape; the difference is `type` metadata in `index.js`, not JS shape.
3. **`index.js` owns the script type**, not the `.js` file. Type (`movie` | `parent` | `behavior`) is registration metadata in `createScriptMember({ type })`.
4. **One resolution rule: API import, `this.method`, or `_global.name`.** If a name is imported from `@project-reborn/director/api` → call directly. If it's a class method → `this.name()`. Otherwise → `_global.name` (covers Lingo `global`-declared vars AND movie script handler calls). `_global` is `globalThis` direct (live, no snapshot), exported from `@project-reborn/director/api`. Only import functions listed in `packages/director/src/api/index.js` (see API list below) — anything else is a movie handler, call via `_global.name()`.
5. **Preserve handler names verbatim.** `on getID me` → `getID()`, `on getTheID me` → `getTheID()`, `on construct me` → `construct()`. One exception: `on new me` → `constructor()` (JS reserved word; `script("Foo").new(args)` → `new Foo(args)` auto-fires `constructor`).
6. **`Members.csv` maps 1:1 to the registration array**, same order. Do not skip, merge, or reorder rows. `Members.csv` `Type` column is `script`/`field`/`palette`/`bitmap` — NOT movie/parent/behavior. Subtype comes from the `.ls` source via `property` keyword.
7. **No parser/AST/codegen.** Translation is manual rewrite.

## Procedure (per `.ls` file)

1. **Determine shape** from the `property` block (binary): no `property` → movie (exported functions); has `property` → class (`export default class`). parent↔behavior is registration metadata only, set `type` in `index.js`. `Members.csv` `Type` is `script`/`field`/`palette`/`bitmap` — not subtype.
2. **Get cast + member number** from `Members.csv` (`Number`, `Name`).
3. **List `property` declarations** (class shape only) → class fields initialised in `constructor`. Movie shape has none.
4. **List handlers (`on ... end`)** → class methods (class shape) or `export function` (movie shape). Preserve names verbatim, except `on new me` → `constructor` (class shape only).
5. **Resolve every name** using the one resolution rule (hard rule 4): imported from `@project-reborn/director/api`? → direct call. Class method? → `this.name`. Otherwise → `_global.name` (movie handler or `global`-declared var). When unsure if API, default to `_global.name`.
6. **Translate body** using the mapping tables below.
7. **Write `.js`** at `apps/client/src/game/<cast>/<NN>_<Name>.js`.
8. **Update `apps/client/src/game/<cast>/index.js`** with a `createScriptMember(...)` entry.

## Symbol mapping

| Lingo                 | JavaScript                              |
| --------------------- | --------------------------------------- |
| `#null`               | `Symbol.for("null")`                    |
| `#room`               | `Symbol.for("room")`                    |
| `#foo`                | `Symbol.for("foo")`                     |
| `if x = #foo then`    | `if (x === Symbol.for("foo"))`          |
| `case x of #foo: ...` | `switch` with `case Symbol.for("foo"):` |

### `case ... of`

Always `switch`. Lingo symbols become `Symbol.for(name)`, so the switch compares identity via `===`:

```js
// Lingo: case x of #foo: doFoo() #baz, #qux: doEither() otherwise: doOther() end case
switch (x) {
  case Symbol.for("foo"):
    doFoo();
    break;
  case Symbol.for("baz"):
  case Symbol.for("qux"):   // grouped Lingo cases → fallthrough
    doEither();
    break;
  default:
    doOther();               // Lingo `otherwise` → JS `default`
}
```

- Lingo grouped cases (`#baz, #qux:`) → consecutive JS `case` labels with fallthrough.
- Non-symbol cases mix freely: `case 5:`, `case "hello":`.
- Every case body ends with `break;` unless it is a fallthrough label.

## Literal mapping

| Lingo          | JavaScript                              | Source                          |
| -------------- | --------------------------------------- | ------------------------------- |
| `EMPTY`        | `""`                                    | `@project-reborn/director/api` |
| `VOID`         | `undefined`                             | `@project-reborn/director/api` |
| `TRUE`         | `true`                                  | `@project-reborn/director/api` |
| `FALSE`        | `false`                                 | `@project-reborn/director/api` |
| `[]`           | `list()`                                | `@project-reborn/director/api` |
| `[:]`          | `propList()`                            | `@project-reborn/director/api` |
| `["a","b"]`    | `list("a", "b")`                        | `@project-reborn/director/api` |
| `[#k: v]`      | `propList(Symbol.for("k"), v)`          | `@project-reborn/director/api` |
| `point(x,y)`   | `point(x, y)`                           | `@project-reborn/director/api` |
| `rect(...)`    | `rect(...)`                             | `@project-reborn/director/api` |
| `rgb(r,g,b)`   | `color(r, g, b)`                        | `@project-reborn/director/api` |
| `member(n)`    | `member(n)`                             | `@project-reborn/director/api` |
| `member(n, c)` | `member(n, c)`                          | `@project-reborn/director/api` |

## Syntax mapping

| Lingo                                          | JavaScript                                              | Source                              |
| ---------------------------------------------- | ------------------------------------------------------- | ----------------------------------- |
| `property pFoo, pBar`                          | class fields `pFoo; pBar;` (init in `constructor`)      | —                                   |
| `global gX, gY`                                | `import { _global } from "@project-reborn/director/api"` + `_global.gX` / `_global.gY` references (file-wide, reads + writes) | `@project-reborn/director/api` |
| `getVariable("x")` (not in API list)           | `_global.getVariable("x")`                              | `@project-reborn/director/api` |
| `createObject(tID, "Class")` (not in API)      | `_global.createObject(tID, "Class")`                    | `@project-reborn/director/api` |
| `on new me`                                    | `constructor(args) { /* me = this */ }`                 | —                                   |
| `on construct me`                              | `construct() { /* me = this */ }`                       | —                                   |
| `on handlerName me, a, b`                      | `handlerName(a, b) { /* this = me */ }`                 | —                                   |
| `on handlerName me`                            | `handlerName() { /* this = me */ }`                     | —                                   |
| `me.getID()`                                   | `this.getID()`                                          | —                                   |
| `me.pFoo`                                      | `this.pFoo`                                             | —                                   |
| `put x into y`                                 | `putInto(y, x)`                                         | `@project-reborn/director/syntax` |
| `put x after y`                                | `putAfter(y, x)`                                        | `@project-reborn/director/syntax` |
| `put x before y`                               | `putBefore(y, x)`                                       | `@project-reborn/director/syntax` |
| `the mouseH`                                   | `the.mouseH`                                            | `@project-reborn/director/syntax` |
| `the frame`                                    | `the.frame`                                             | `@project-reborn/director/syntax` |
| `char 2 of "abc"`                              | `char(2, "abc")`                                        | `@project-reborn/director/syntax` |
| `word 2 of "a b c"`                            | `word(2, "a b c")`                                      | `@project-reborn/director/syntax` |
| `item 2 of "a,b,c"`                            | `item(2, "a,b,c")`                                      | `@project-reborn/director/syntax` |
| `line 2 of "a\nb"`                             | `line(2, "a\nb")`                                       | `@project-reborn/director/syntax` |
| `repeat with i = 1 to 10` `  ...` `end repeat` | `for (let i = 1; i <= 10; i++) { ... }`                 | —                                   |
| `repeat with i = 10 down to 1`                 | `for (let i = 10; i >= 1; i--) { ... }`                 | —                                   |
| `repeat while x` `end repeat`                  | `while (x) { ... }`                                     | —                                   |
| `exit repeat`                                  | `break`                                                 | —                                   |
| `abort`                                        | `break` (or labeled break from nested)                  | —                                   |
| `exit`                                         | `return`                                                | —                                   |
| `case x of A: ... end case`                    | `switch (x) { case Symbol.for("A"): ...; break; ... default: ...; }`  | —                      |
| `otherwise`                                    | `default:`                                              | —                                   |
| `if x then` `else` `end if`                    | `if (x) { ... } else { ... }`                           | —                                   |
| `not x`, `x and y`, `x or y`                   | `!x`, `x && y`, `x \|\| y`                              | —                                   |
| `x = 5` (assignment)                           | `x = 5`                                                 | —                                   |
| `if x = 5 then` (comparison)                   | `if (x === 5)`                                          | —                                   |
| `x <> y`                                       | `x !== y`                                               | —                                   |
| `x contains y`                                 | `x.includes(y)`                                         | —                                   |
| `x starts y`                                   | `x.startsWith(y)`                                       | —                                   |
| `x & y`                                        | `x + "" + y`                                            | —                                   |
| `x && y`                                       | `String(x) + " " + String(y)`                           | —                                   |

**Comparison vs assignment:** Lingo `=` is both. Use `===` for comparison (in `if`/`case`/`return`), `=` for assignment (statement).

### Version-specific constructs

When a construct is not in the table, check the reference doc for the source version and map to the closest JS equivalent, importing from the shim.

| Version          | Added constructs                                     | Mapping                              |
| ---------------- | ---------------------------------------------------- | ------------------------------------ |
| Director 8       | Dot syntax (`sprite(1).loc`), expanded behaviors     | Direct property/method access        |
| Director 8.5     | 3D Lingo (`member("scene").model("box")`)            | Flag if shim lacks 3D support        |
| Director MX      | OOP refinements, `ancestor` property                 | `ancestor` → JS `extends` or proxy   |
| Director MX 2004 | JavaScript syntax option (alongside Lingo)           | Not Lingo — out of scope             |

## API + syntax imports

```js
import {
  abs, atan, cos, sin, sqrt, max, min, random, power, log,
  getNetText, gotoNetPage, getStreamStatus,
  alert, beep, delay, go, goLoop, goNext, goPrevious,
  list, propList, point, rect, color, member, sprite, castLib, script,
  EMPTY, VOID, TRUE, FALSE,
  _global, _movie,
} from "@project-reborn/director/api";

import {
  putInto, putAfter, putBefore,
  char, word, item, line,
  the,
} from "@project-reborn/director/syntax";
```

Only import what the file actually uses. `_global` is imported when the file calls movie handlers or uses `global`-declared vars. `_movie` is rarely needed directly (most movie state surfaces through api functions or `the`). Import only from the package subpaths (`@project-reborn/director/api`, `@project-reborn/director/syntax`, `@project-reborn/director/runtime`), never from individual files. `packages/director/src/core/` is private — do not import from it; use the api factory functions (`list()`, `propList()`, `point()`, `rect()`, `color()`, `member()`) instead of the core classes. See `packages/director/src/api/index.js` for the full API export list (107 functions + constants + `_global` + `_movie`).

## Script-type shapes

Two shapes, binary discriminator = `property` keyword.

### Movie shape — exported functions (no `property` block)

```js
// 1_thread.index.js  (no `property` keyword)
import { _global } from "@project-reborn/director/api";   // for movie handler calls / global vars

export function startMovie() {}
export function doThing(arg) {
  _global.getVariable("key");             // movie handler, not API
  return arg + 1;
}
```

Edge case — movie-shape handler with `me` (no `property`): keep `me` as first parameter, do not use `this`:

```js
// Lingo: on foo me, arg
export function foo(me, arg) { /* me is caller-passed, not this */ }
```

```js
createScriptMember({
  number: 1,
  name: "thread.index",
  type: "movie",
  module: { startMovie, doThing },   // plain object of named exports
})
```

Runtime: `Object.assign(globalThis, module)` — handlers accessible via `_global.<name>` from any translated code.

### Class shape — `export default class` (has `property` block)

Used for both `parent` and `behavior` scripts. The distinction is `type` metadata in `createScriptMember`, not JS shape.

```js
// 3_Room Interface Class.js  (has `property` block)
import { _global } from "@project-reborn/director/api";

export default class {
  constructor() {
    this.pInfoConnID = undefined;
    this.pRoomConnID = undefined;
  }

  construct() {
    this.pInfoConnID = _global.getVariable("connection.info.id");
    this.pRoomConnID = _global.getVariable("connection.room.id");
    return 1;
  }

  deconstruct() {}
  getID() {}
}
```

```js
createScriptMember({
  number: 3,
  name: "Room Interface Class",
  type: "parent",          // or "behavior" — only difference
  module: RoomInterface,
})
```

Runtime: register class in script-by-name registry. `script("Foo").new(args)` → `new module(args)` (auto-fires `constructor`). `obj.construct()` in Lingo → `obj.construct()` in JS — translate call sites verbatim.

## Per-cast `index.js`

Every cast folder under `apps/client/src/game/<cast>/` gets an `index.js` that imports every translated module and asset, then exports a `defineCast(...)` call. `Members.csv` is the source of truth.

> **Planned, not yet exported.** `defineCast`, `createScriptMember`, `createFieldMember`, `createImageMember` are the target registration API for `@project-reborn/director/runtime`. They are **not yet exported** — `runtime/index.js` currently exposes only `loadCast`, the lifecycle dispatchers, canvas functions, `registerCustomElements`, `_createMovie`, and the event-loop controls. Until the registration helpers land, translated casts cannot run end-to-end; flag this in the Escalate section rather than guessing an alternative shape.

```js
// apps/client/src/game/hh_room/index.js
import { defineCast, createFieldMember, createScriptMember, createImageMember } from "@project-reborn/director/runtime";

import threadIndex    from "./1_thread.index.txt";
import variableIndex  from "./2_variable.index.txt";
import roomLoaderWin  from "./9_room_loader.window.txt";

import RoomInterface  from "./3_Room Interface Class.js";
import RoomComponent  from "./4_Room Component Class.js";
import RoomHandler    from "./5_Room Handler Class.js";
import SpectatorSystem from "./6_Spectator System Class.js";
import RoomGeometry   from "./7_Room Geometry Class.js";
import RoomHiliter    from "./8_Room Hiliter Class.js";

import roomPng from "./assets/room_loader.png";

export default defineCast("hh_room", 1, [
  createFieldMember({ number:  1, name: "thread.index",         content: threadIndex }),
  createFieldMember({ number:  2, name: "variable.index",       content: variableIndex }),
  createScriptMember({ number: 3, name: "Room Interface Class", type: "parent", module: RoomInterface }),
  createScriptMember({ number: 4, name: "Room Component Class",  type: "parent", module: RoomComponent }),
  createScriptMember({ number: 5, name: "Room Handler Class",    type: "parent", module: RoomHandler }),
  createScriptMember({ number: 6, name: "Spectator System Class",type: "parent", module: SpectatorSystem }),
  createScriptMember({ number: 7, name: "Room Geometry Class",   type: "parent", module: RoomGeometry }),
  createScriptMember({ number: 8, name: "Room Hiliter Class",    type: "parent", module: RoomHiliter }),
  createFieldMember({ number:  9, name: "room_loader.window",    content: roomLoaderWin }),
  // ...rest per Members.csv
]);
```

### `defineCast` signature

```js
defineCast(name?: string, number?: number, members: MemberEntry[]): CastLibraryRef
```

`name` and `number` are optional but recommended explicit (match Director's cast editor). If omitted, `loadCast` falls back to URL basename extraction.

### `create*Member` helpers

| Helper              | Required                            | Optional    |
| ------------------- | ----------------------------------- | ----------- |
| `createFieldMember` | `number`, `name`, `content`         | `regPoint`  |
| `createScriptMember`| `number`, `name`, `type`, `module`  | —           |
| `createImageMember` | `number`, `name`, `src`             | `regPoint`  |

`type` is `"movie" | "parent" | "behavior"`. For movie, `module` is a plain object of named function exports. For parent/behavior, `module` is the class itself.

Runtime branches on `type`:
- `movie` → `Object.assign(globalThis, module)` (handlers accessible via `_global.<name>`).
- `parent` / `behavior` → register class in script-by-name registry; `script("Foo").new(args)` → `new module(args)`.

## Reference layout

```
  packages/director/src/                       ← the shim package (consume, don't build)
    api/        top-level Lingo functions     import as "@project-reborn/director/api"
    core/       Director object classes       PRIVATE — do not import from translated code
    syntax/     chunks, put, the-proxy        import as "@project-reborn/director/syntax"
    runtime/    cast-loader, event-loop,
                custom-elements, canvas,
                script-lifecycle              import as "@project-reborn/director/runtime"

  apps/client/src/game/<cast>/                ← per-cast translation target (unchanged)
    <NN>_<Name>.ls                             original Lingo (source of truth)
    <NN>_<Name>.js                             translated JS
    <NN>_<Name>.txt                            field member content (asset)
    *.png                                      image assets
    Members.csv                                cast manifest (1:1 with index.js)
    index.js                                   defineCast(...) registration

  docs/drmx2004_scripting_ref.txt             ← Lingo reference (MX 2004)
```

## Escalate

- Lingo construct with no mapping table entry and no reference doc section → flag as shim gap, use a placeholder, document the gap in a `.js` comment.
- `.ls` mixes script types → flag as misclassified in `Members.csv`.
- `createObject(name, "ClassName")` references an untranslated class → leave the call, add `// TODO: translate <ClassName>`.
- Version-specific construct (3D Lingo, `ancestor` chains) with no shim support → flag rather than guess.
- Registration helpers (`defineCast`, `createScriptMember`, `createFieldMember`, `createImageMember`) are not yet exported from `@project-reborn/director/runtime` — every cast `index.js` needs them, so flag until they land; do not invent an alternative registration shape.
