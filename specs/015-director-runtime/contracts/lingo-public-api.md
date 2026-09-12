# Contract — Lingo Public API (`@project-reborn/director/lingo`)

**Feature**: `015-director-runtime` | **Spec**: [../spec.md](../spec.md) | **Source**: `packages/director/src/`

The public contract for translated Lingo JavaScript and runtime consumers. Requirements:
FR-002, FR-004, FR-008–FR-014, FR-020, FR-022, FR-028, FR-034–FR-048, R-02, R-10–R-15, R-23–R-26.

## 1. Entry points and export categories (FR-002, FR-006)

Exactly three public entry points, exported from `package.json`:

| Entry | Path | Export categories |
|-------|------|-------------------|
| package root | `@project-reborn/director` → `src/index.js` | `@/lingo` + `@/browser` |
| lingo | `@project-reborn/director/lingo` → `src/api/index.js` | Director public API only |
| browser | `@project-reborn/director/browser` → `src/browser/index.js` | pack builders (`movie`, `cast`), imperative runtime (`run`), custom elements (`registerCustomElements`), host helpers (`createContext`, `destroyContext`, `resetSingletons`) |

Contract: all three import cleanly in a fresh process with no stale module paths and no import-time
side effects (FR-006). No undocumented top-level method or singleton may be exported (FR-002).
Importing the browser entry in a DOM environment auto-registers the custom elements idempotently;
in a DOM-free process it does not touch globals.

## 2. Lingo surface (`src/api/index.js`)

Categories: singletons; constants; syntax stand-ins; data-type classes + creators; top-level
methods. Core/media/scripting classes are exported from the package root via
`src/engine/core/index.js` when consumed directly, but the documented public door is the lingo
entry + the three-entry contract above.

### 2.1 Singletons (R-02, FR-021, FR-022, FR-056)

| Export | Resolves to | Semantics |
|--------|-------------|-----------|
| `_movie` | `_getMovie()` | active context's `MovieObject`; default instance when none |
| `_player` | `_getPlayer()` | active context's `PlayerObject`; default when none |
| `_sound` | `_getSound()` | active context's `SoundObject`; default when none |
| `_key` | `_getKey()` | active context's `KeyObject`; default when none |
| `_mouse` | `_getMouse()` | active context's `MouseObject`; default when none |
| `_system` | `_getSystem()` | active context's `SystemObject`; default when none |
| `_global` | `_getGlobal()` | active context's `GlobalObject`; default when none |

Semantics: there is no mutable module-level singleton slot and no `globalThis` install at import;
the seven names are getters over the single active-context pointer (`engine/subsystem/accessor.js`)
via the facade (`engine/subsystem/singletons.js`). `DirectorContext.activate()` sets the pointer;
with no active context each read resolves a module-scoped default instance so pure modules and
tests work. Inside a movie worker, bootstrap installs accessor getters for the seven names, `the`,
and the API method names on the worker global **before** the bundle import (FR-056). Each worker
has its own module graph, so contexts never leak across movies (FR-071).

`_getNetLingo()` / `_getNetState()` are facade helpers (not documented Lingo names) used by the
net method modules and the compatibility alias `context.netState === context.netLingo.netState`.

### 2.2 Constants (FR-014, R-10)

| Export | Value |
|--------|-------|
| `EMPTY` | `""` |
| `VOID` | `null` |
| `RETURN` | `"\r"` |
| `SPACE` | `" "` |
| `TAB` | `"\t"` |
| `BACKSPACE` | `String.fromCharCode(8)` (`"\b"`) |
| `ENTER` | `String.fromCharCode(3)` (`"\x03"`) |
| `QUOTE` | `'"'` |
| `TRUE` | `true` |
| `FALSE` | `false` |
| `PI` | `Math.PI` |

`FALSE` behaves as numeric 0 and any nonzero integer evaluates true; `BACKSPACE`/`ENTER` are ANSI
characters for `_key.key` comparisons — the docs' JavaScript-column keyCodes are not constant
values.

### 2.3 Syntax stand-ins (FR-015–FR-020, R-25, R-26)

Exactly twelve exports from the lingo entry: `char`, `charRange`, `item`, `itemRange`, `line`,
`lineRange`, `word`, `wordRange`, `the`, `putInto`, `putBefore`, `putAfter`. They behave
identically with no context, default singletons, or an activated context.

Chunk helper forms:

| Form | Meaning |
|------|---------|
| `char(n).of(str)` / `item(n).of(str)` / `line(n).of(str)` / `word(n).of(str)` | single chunk, 1-based; out of range → `""` |
| `char(n).to(m).of(str)` (same for item/line/word) | inclusive range; end clamps; `start > end` or `start < 1` → `""` |
| `charRange(a,b)`, `itemRange(a,b)`, `lineRange(a,b)`, `wordRange(a,b)` | shorthand for `kind(a).to(b)` |
| `putInto(chunkExpr, value)` | replace the target chunk; returns the new string |
| `putBefore(chunkExpr, value)` / `putAfter(chunkExpr, value)` | insert without replacing; returns the new string |

Reads return a string-valued `ChunkBound` (also carrying the target span used by `put*`); string
contexts, `String()`, and `==` see the chunk text. Non-existent put targets append at the
boundary. Delimiters: words split on spaces/whitespace, lines on CR only, items on the live
`the.itemDelimiter`; empty chunks count; no `wordDelimiter`/`lineDelimiter` property exists.

`the` contract:

- Single exported proxy; **not** installed on `globalThis` at import; the player/runner installs it
  (FR-018, R-26).
- Reads delegate live through the active context (defaults with none); `frame`, `frameLabel`,
  `frameTempo` read the active Score (FR-019); computed date/time rows come from JS.
- Writes to read-only rows and reads/writes of unknown names throw script errors; read/write rows
  round-trip.
- The property surface is exactly the table in [../data-model.md](../data-model.md#3-the-property-table--enginesyntaxthe-proxyjs-fr-018fr-020);
  count/last function forms are callable (`numberOfCharsIn`, `numberOfItemsIn`, `numberOfLinesIn`,
  `numberOfWordsIn`, `lastCharIn`, `lastWordIn`, `lastItemIn`, `lastLineIn`,
  `numberOfCastMembersOfCastLib`). Casing aliases: `milliSeconds` → `milliseconds`,
  `maxinteger` → `maxInteger`.

### 2.4 Data types and creators (FR-008–FR-013, R-11)

Classes: `Color`, `List`, `PropList`, `Point`, `Rect` (exact documented surfaces — see
[../data-model.md](../data-model.md#1-data-types--constants)). Creators are **API methods** in
`api/methods/` (owner `creator`) and are re-exported from the barrel: `color()`, `list()`,
`point()`, `propList()`, `rect()`. `color(index)` is the palette-index form and `color(r,g,b)` the
RGB form; `rgb()` is absent.

### 2.5 Documented classes and naming (FR-004, FR-028, FR-034–FR-042)

| Group | Classes | Naming |
|-------|---------|--------|
| core objects (13) | `CastLibraryObject`, `GlobalObject`, `KeyObject`, `MemberObject`, `MouseObject`, `MovieObject`, `PlayerObject`, `SoundObject`, `SoundChannelObject`, `SpriteObject`, `SpriteChannelObject`, `SystemObject`, `WindowObject` | `X...Object`, one class per module, source file keeps the documented name |
| media members (19 + legacy) | 8 functional (`BitmapMember`, `ButtonMember`, `ColorPaletteMember`, `CursorMember`, `FieldMember`, `FontMember`, `SoundMember`, `TextMember`) + 11 documented stubs + legacy `FlashMember` | `X...Member`, extend `MemberObject` |
| scripting objects (4) | `FileioObject`, `NetLingoObject`, `SpeechXtraObject`, `XMLParserObject` | `X...Object`; created via `new xtra(name)` |

Every documented class uses public plain fields (no `#` private syntax), exposes no undocumented
static methods/subsystems, and carries verbatim documentation JSDoc. Shared concerns (member
lookup, windows) are owned by exactly one subsystem per context (FR-005).

### 2.6 Top-level methods and the owner registry (FR-043–FR-048, R-23, R-24)

- One module per method in `src/api/methods/`, each with `// @owner <owner>`.
- `METHODS_OWNERS` maps every method file (minus `registry.js`) to exactly one owner; the audit
  test enforces registry ⇄ file-set equality and `@owner` agreement.
- Ownership derives from `director_core_objects.txt`; documented owner categories
  (FR-043): `movie`, `player`, `sound`, `key`, `mouse`, `system`, `global`, `member`, `window`,
  `castlib`, `soundchannel`, `spritechannel`, `top`, `net`. The implementation registry also uses
  `sprite`, `channel`, and `creator` and spells `castLib` with a capital L (no
  `soundchannel`/`spritechannel`); see the owner-registry gap in the data model.
- Pure methods (math/string/bit/list/type, owner `top`) work with no context (FR-044).
- Stateful methods resolve the active context and delegate to its core objects; with no context
  they return neutral values (`null`/`false`/`0`/`""`) and never throw (FR-045).
- Commands: `halt()` stops the movie through the Player (owner `player`, R-23); `quit()` cannot
  exit a browser and is a no-op; `abort` aborts the current handler chain; `delay` pauses the
  playhead per the docs; documented script-error cases throw (FR-048).
- `value()` evaluates the documented expression subset without `eval()` (unparseable input yields
  the leading parsable portion; a bare non-numeric word yields `VOID`); `symbol()` produces the
  named symbol; `ilk()` returns the documented type symbols and supports the two-argument alias
  form; the `*P` predicates follow the documented type matrix (FR-047).
- `xtra()` is owner `top`, case-insensitive, and returns the scripting class or `null` (FR-040).

## 3. Net fail-soft contract (FR-046, R-14, R-15)

- Every net method delegates to the active context's `NetLingoObject` (which owns the logic and
  the `NetState` registry); `context.netState` aliases `netLingo.netState`.
- Net calls never throw and never crash the host. A rejected/failed fetch completes the
  transaction as an error: `netDone()` is `true`, `netError()` is a truthy message (`"HTTP 404"`-
  style for HTTP failures), and `netTextResult()` is `""`.
- Unknown `netAbort` ids are no-ops; `netAbort` on an in-flight op completes it as an error.
- `gotoNetMovie`/`gotoNetPage` are relayed to the main thread; the worker never touches the DOM
  (see [player-protocol.md](./player-protocol.md)).
- The object form `new xtra("netlingo").externalEvent(...)` is a deterministic no-op in v1; the
  top-level `externalEvent` bridges worker → host (see gaps in the data model for the current
  no-op stub).

## 4. Strict output (FR-002, R-24)

- The lingo entry exports only the documented names above.
- The root entry composes lingo + browser.
- Importing any entry must not create a context, install `globalThis` names, auto-start a loop, or
  otherwise mutate process state.
