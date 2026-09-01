# Feature Specification: 006 — API (Global Method Surface + Singletons)

**Feature Branch**: `006-api`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "Build the engine-api layer of the Director MX 2004 runtime simulator (`@project-reborn/director`): the full top-level Lingo method surface (`src/api/index.js` barrel + `methods/`), the 7 Director singletons bound as live slots, and the per-method depends-on-active-context state-tagging audit — per the master roadmap `docs/shockwave-player-runtime.md` and the ratified constitution v2.0.0. Reconcile or retire the 5 dormant creator modules; implement the palette form of `color()`; land the `symbol()/value()/ilk()` type-relationship work; `rgb()` must stay absent. Rewrite the deleted per-method tests red-green (vitest + jsdom)."

**Governance**: Defined-Before-Built — everything below is stated before implementation; anything the docs do not settle is marked `[CLARIFY]` and must be decided with the user before code (No Silent Interpretation). KISS/YAGNI — no speculative methods beyond the documented inventory, no extra store abstraction (decided). Red-green tests per constitution Test & Verification Discipline. Supersedes 001's FR-013/015/016 (export set + singletons) only where 002's creators-in-engine/base decision conflicts.

## Background (from the master roadmap, 006 section)

- **Priority**: P1 — the full top-level Lingo method surface + 7 singletons every translated script calls (`go`, `beep`, `postNetText`, `member()`, `netDone()`, `castLib()`, `halt`, `propList()`, …).
- **Scope**: ~130 documented top-level methods (one file each in `src/api/methods/`; 108 files exist — 105 real methods + 5 creators + `_netRegistry` internal) + the 7 singletons (`_movie` `_player` `_sound` `_key` `_mouse` `_system` `_global`) bound as live slots to the active context. **Per-method "depends-on-active-context" tagging**: pure (no player state) vs stateful (reads/writes `_movie`/`_sound`/`_player`/`_global` or `member()`/`castLib()`/net). **No extra store abstraction** (decided).
- **Size**: L — candidate to split into method categories: math+string / movie+player / sound+media / net / members+castLib / object+list / xtra.
- **Reuses**: 108 method files exist with real bodies (net ops = real `fetch` + `AbortController` + NetState); all imports repaired in 002. Tests deleted → rewritten (per-method + state-tagging audit).
- **Boundaries already decided**: creators `color()/list()/point()/propList()/rect()` now come from `engine/base` (002 amendment); the 5 dormant `src/api/methods/` creator modules get reconciled or retired here; **palette form of `color()`** implemented; `symbol()/value()/ilk()` type-relationship work lands here; `rgb()` must stay absent.
- **Depends on**: 002 (finished), 004 (context state, done), 005 (syntax, done).

## Clarifications

### Session 2026-09-01 (resolved — user decisions recorded verbatim)

- **C1 — authoritative method inventory**: audit `methods.txt`; verify the currently-implemented method files are **correct** per the docs — and if one must be deleted and recreated because it does not follow the plan, do it. (User: "audit methods.txt but verify the currently implemented ones are correct, and if you have to delete one of them and recreate because it does not follow the plan just do it.")
- **C2 — method ownership ground truth**: `director_core_objects.txt` is the authoritative owner table — not a generic pure/stateful heuristic. Each method's state deps derive from **which core object owns it** (Movie methods → `_movie`; Player → `_player`; Sound → `_sound`; System → `_system`; Global → `_global`; Key → `_key`; Window → window objects; net registry ops → standalone-stateful). Tag registry entries carry `owner` (core-object name, `"top"` for free functions, `"net"` for registry ops). (User: "director_core_objects.txt is what you looking for, some of these methods are part of system, one of the core objects…")
- **C3 — net-op offline behavior**: fail-soft, never throw — confirmed. When `fetch` rejects/offline: transaction completes as `Error`, `netDone()` = true, `netError()` = truthy error string, `netTextResult()` = `""`.
- **C4 — error/throw convention = follow the docs**: researched for the ambiguous set. Docs' own phrasing governs: where the reference spells "script error" (e.g. property-list misuse, out-of-range positions) → throw; where docs state a behavior for the edge (e.g. `value()` unparseable → VOID/"initial portion up to first syntax error"; `halt()`/`quit()` as commands; `delay()` pauses playhead; `abort` aborts current handler chain; `integer()` truncates) → implement that documented behavior. `quit()` in a browser context cannot exit → no-op (docs: "exits … projector"; our runtime has no projector exit — nearest documented no-op). `halt()` stops the movie → delegate to `_movie.halt()` (stops lifecycle; MovieObject field, 003 body).
- **C5 — palette form of `color()`: FULL palette support now** (not minimal): `color(intPaletteIndex)` single-int = 8-bit palette index (0–255 truncate), `color(intRed,intGreen,intBlue)` = RGB; built-in Director palettes by symbol (`#systemMac`, `#rainbow`, …) per `paletteRef`; Color carries `paletteIndex`; palette machinery (`paletteRef`, cast-member palettes) lands in 006, not 008. The stale gray-scale single-arg mapping is retired.
- **C6 — creators live in `api/methods/`**: `engine/base` holds the base types/classes (`Color`, `List`, `Point`, `PropList`, `Rect`); the *creators* `color/list/point/propList/rect` are **methods** and belong in `api/methods/` — the barrel must re-export them from there (currently `index.js` exports creators from `engine/base` — that reverses). The 5 method files stay as the creator method layer over the base classes.
- **C7 — `value()` expression evaluation**: implement expression eval per docs — parse the stringExpression, return its logical value; on unparseable input return the initial portion up to the first syntax error (docs), and `"penny"` → VOID. Overrides the 005-canonical parseFloat-only body.
- **C8 — singletons are the bad idea; state lives in the context**: the 7 core-object instances are **consts declared ON DirectorContext** (`context.movie`, `context.player`, … — one per context, one movie per worker). The module-level rebinding slot mechanism (`singletons.js` `export let _ovie` rewritten by `_installSingletons`) is retired; api methods resolve the active context through a single accessor and read `context.<owner>` — no globalThis installs, no mutable module-level singletons. The global state IS the core-object instances on the context. (User: "singletons was a really bad idea from the begging, but keep these consts declare in the context not, because this is the global state i was talking about at the begging, the global state came from core objects that you decide to leave to the end because some wrong reason")

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The top-level method surface imports clean and is callable without a context (Priority: P1)

Translated Lingo code imports the API as globals via `src/api/index.js`. Math/string/bit/log/list methods (e.g. `abs`, `integer`, `charToNum`, `bitAnd`, `length`, `min/max`, `random`, `sqrt`, `sin/cos/atan`, `string`, `float`) must behave per the scripting reference with **no** `DirectorContext.activate()` being required — they are pure.

**Why this priority**: The translated game code calls these from every script; without the pure slice nothing that walks strings/numbers runs. No player state → independently testable at import time.

**Independent Test**: A vitest suite importing individual methods from the public barrel (`src/api/index.js`), calling each pure method with documented inputs, asserting documented outputs — zero context activated.

**Acceptance Scenarios**:

1. **Given** the public barrel, **When** `abs(-4.2)` is called, **Then** the result is `4.2`.
2. **Given** `integer(4.78)`, **When** called, **Then** the result is `4` (truncation toward zero, not rounding).
3. **Given** `charToNum("A")`, **When** called, **Then** the result is `65`  (and `numToChar(65)` → `"A"`, round-trip).
4. **Given** `bitAnd(12, 10)`, **When** called, **Then** the result is `8`.
5. **Given** `min(3, 7, 2)` and `max(3, 7, 2)`, **When** called, **Then** results are `2` and `7` respectively.
6. **Given** `random(100)`, **When** called repeatedly, **Then** each value is an integer in `[1, 100]` inclusive.
7. **Given** `sqrt(16)` and `cos(0)`, **When** called, **Then** results are `4` and `1`.

---

### User Story 2 - Stateful methods route through the active context's core objects (Priority: P1)

Movie/player/sound/member/castLib-type methods resolve the **active context** and read/write `context.movie` / `context.player` / `context.sound` / etc. (`go` → `context.movie.go`, `member()` → `context.movie.castLib[i].member[id]`, `beep` → `context.sound.beep`, `alert` → `context.player.alert`). The 7 core-object instances are **consts on DirectorContext** (C8). With a context activated, methods route to its instances; with no context, they no-op/fail-soft rather than throw (C4). No new store abstraction — they keep delegating.

**Why this priority**: The game's main loop (`fuse_client`) is a long chain of such calls; 008's runner walks this surface. 004's context + registries give the delegation targets.

**Independent Test**: With `DirectorContext({castLibs/sprites})` activated, a per-method suite asserts delegation (e.g. `go(1)` → `context.movie.go(1)` spy); with no context, stateful methods return neutral values; the tag-audit test asserts the owner-based classification (C2) for every method.

**Acceptance Scenarios**:

1. **Given** an activated context with a member `"m"` in castLib 1, **When** `member("m")` is called, **Then** it returns that member object (routes `context.movie`).
2. **Given** `go(2)` with a movie whose Score has ≥2 frames, **When** called, **Then** `context.movie.go(2)` is invoked and the playhead moves.
3. **Given** `beep(2)`, **When** called with a sound stub, **Then** `context.sound.beep` runs twice.
4. **Given** no activated context, **When** `member("x")` is called, **Then** it returns `null` and does not throw.
5. **Given** the ownership registry (C2), **When** every `src/api/methods/*.js` file is checked, **Then** each exposes a matching `owner` entry and the registry matches the file set.

---

### User Story 3 - Net operations behave as documented, fail-soft when offline (Priority: P2)

`getNetText`/`postNetText`/`downloadNetThing`/`preloadNetThing`/`gotoNetMovie`/`gotoNetPage`/`netAbort`/`netDone`/`netError`/`netTextResult`/`netLastModDate`/`netMIME`/`getStrеamStatus` share the internal `_netRegistry` (already ported). Under vitest the environment has no network: `fetch` rejects. Methods must complete transactions as `Error` (fail-soft) **never throw**, with `netError()` returning the error string, `netDone()` → true, `netTextResult()` → `""`.

**Why this priority**: The game boots 55+ net-URL calls at startup; 008's Runner relays the browser `fetch`. Fail-soft semantics are the game-observable contract (it polls `netDone()` in the idle loop).

**Independent Test**: A vitest suite with a stubbed `globalThis.fetch` that rejects; asserting full lifecycle: call → transaction created → reject → `netDone()` true, `netError()` non-"OK"/truthy, `netTextResult()` `""`.

**Acceptance Scenarios**:

1. **Given** `fetch` rejects, **When** `getNetText("http://x")` is called, **Then** the call returns immediately, and later `netDone()` is `true`, `netError()` is truthy, `netTextResult()` is `""`.
2. **Given** `fetch` resolves with `{ok: false, status: 404}`, **When** `getNetText` completes, **Then** `netError()` is `"HTTP 404"` and `netDone()` is `true`.
3. **Given** `fetch` resolves with `{ok: true, text: "hello"}`, **When** `getNetText` completes, **Then** `netTextResult()` is `"hello"` and `netError()` is `"OK"`.
4. **Given** an in-flight transaction, **When** `netAbort(id)` is called, **Then** the transaction becomes `Error` state and `netDone()` is `true`.

---

### User Story 4 - Palette form of color() + creators as the method layer (Priority: P2)

`color()` with a single int arg is the 8-bit palette index form (`color(137)` → `paletteIndex === 137`, truncate 0–255); with 3 args the RGB form. Full palette support lands now (C5): built-in Director palettes by symbol (`#systemMac`, `#rainbow`, …), `paletteRef` semantics, cast-member palettes. The creators `color/list/point/propList/rect` are **methods owned by `api/methods/`** (C6); the barrel re-exports them from `.methods/`, not from `engine/base`. Base types stay in `engine/base`; `rgb` stays absent.

**Why this priority**: The game sets sprite colors with `color(137)` forms; the stale gray-scale mapping in `src/api/methods/color.js` contradicts paletteIndex semantics and would corrupt rendering once sprites live (003).

**Independent Test**: A vitest suite: `color(137)` → a color carrying `paletteIndex = 137`; `color(255,0,0)` → RGB Color; the barrel's `color` IS the `methods/color.js` creator (single source via methods); `rgb` is **not** exported from the barrel.

**Acceptance Scenarios**:

1. **Given** `color(137)`, **When** inspected, **Then** it exposes `paletteIndex === 137` and RGB channels derived from the corresponding built-in palette.
2. **Given** `color(255, 0, 0)`, **When** inspected, **Then** `red === 255, green === 0, blue === 0` and no palette index (RGB form).
3. **Given** the barrel import `color`, **When** compared to `api/methods/color.js`'s `color`, **Then** they are the same function (methods owns the creator).
4. **Given** the barrel, **When** `rgb` is accessed, **Then** it is `undefined` (stays absent).

---

### User Story 5 - symbol() / value() / ilk() and the *P predicates (Priority: P2)

Type-introspection trio lands: `symbol()` (doc form: `symbol("#name")` → the symbol), `value()` (**expression evaluation per docs** — parses stringExpression and returns its logical value; unparseable → initial portion up to first syntax error; `"penny"` → VOID; `"3+4"` → 7; `value("#sym")` → symbol), `ilk()` (returns the doc type name: `"integer"`, `"list"`, `"string"`, `"symbol"`, `"float"`, `"void"`, …) plus the existing `*P` predicates kept (`integerP`, `objectP`, `listP`, `stringP`, `symbolP`, `floatP`, `voidP`), sharing `engine/base` type helpers.

**Why this priority**: Translated game code type-switches on these (e.g. `ilk(x) = "list"` guards); the predicates are already called in game scripts.

**Independent Test**: A vitest suite asserting each trio member and each predicate against the documented type matrix, no context needed.

**Acceptance Scenarios**:

1. **Given** `ilk(3)`, **When** called, **Then** the result is `"integer"`.
2. **Given** `ilk([1, 2])` (a live list), **When** called, **Then** the result is `"list"`.
3. **Given** `value("3+4")`, **When** called, **Then** the result is `7` (expression evaluated per docs).
4. **Given** `symbol("#hop")`, **When** called, **Then** the result is the symbol `hop` and `symbolP(symbol("#hop"))` is `true`.
5. **Given** `integerP(3)`, **When** called, **Then** it is `true`; `integerP("3")` is `false`.

---

### Edge Cases

- Calling a stateful method with **no activated context** returns the neutral value (null/false/0/"" ) and does not throw (C4).
- Out-of-range numeric inputs clamp/truncate per docs (e.g. `color(-1)` palette → 0 [truncate]; RGB channels clamp 0-255 already via base).
- `abort`/`halt`/`quit`/`breakLoop` outside their valid call sites: docs say `halt`/`quit` are commands (no error documented) — `halt` stops the movie via `context.movie.halt()`, `quit` no-ops in a browser (no projector exit), `abort` aborts the current handler chain, `breakLoop` exits an `exit repeat` loop context (C4).
- A method file with no owner entry → ownership-audit test fails (enforces the discipline).
- Net ID arithmetic: `netAbort(netID)` with unknown id → no-op (registry miss; C4).
- Methods documented as top-level callables but implemented wrong per docs (C1) → deleted and recreated, per the user's direction.

---

## Dependencies / Sequence

- **Prereq**: 002 (base types — done), 004 (context/registries — done), 005 (syntax — done).
- **Scope boundary**: `src/api/index.js` barrel changes: singletons re-export source flips from `engine/subsystem/singletons.js` to an active-context accessor (C8), creators re-export source flips from `engine/base` to `.methods/` (C6). 006 touches: `api/methods/*` (audit + fix + owner tags), `api/index.js`, `engine/subsystem/{context,singletons}.js` (context consts, accessor), `engine/base/color.js` (palette form), new `api/methods/registry.js` (owner table).
- **Out of scope (008)**: worker runner, browser fetch wiring, event-loop scheduling, sprite rendering bodies (003).