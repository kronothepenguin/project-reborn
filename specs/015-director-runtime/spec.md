# Feature Specification: Director Runtime (Consolidated)

**Feature Branch**: `015-director-runtime`

**Created**: 2026-09-12

**Status**: Consolidated — authoritative contract. Sources 001–011 are implemented; this spec
supersedes them and is the single contract for the `@project-reborn/director` package.

**Input**: User description: "Merge specs 001 to 011 into a single Director Runtime spec. All
specs 001–011 describe the same library called Director Runtime but were built as independent
specs, so the library looks inconsistent. Create a consolidated, supersession-resolved spec
(015) covering the whole runtime, preserving every decision, and archive 001–011 as historical
records. Later, run `/speckit.analyze` against this consolidated spec to drive a consistency
pass, then verify against the actual client point by point."

## Purpose, Sources & Authority

This specification is the consolidated, authoritative contract for the Director MX 2004 /
Shockwave runtime package (`@project-reborn/director`): a browser runtime that executes
already-translated Lingo JavaScript and plays virtual movie/cast bundles built from decompiled
Director assets. It merges the eleven feature specs that incrementally built the package:

| Source | Archived at | Role |
|--------|-------------|------|
| 001-director-runtime | `specs/archive/001-director-runtime/` | Original vision, imperative runtime, custom elements, public API contracts |
| 002-engine-base | `specs/archive/002-engine-base/` | Data types, constants, package stabilization, test cleanup |
| 003-engine-core | `specs/archive/003-engine-core/` | Functional sprites (Sprite ↔ Score) |
| 004-engine-subsystem | `specs/archive/004-engine-subsystem/` | `DirectorContext`, subsystems, Score, lifecycle |
| 005-engine-syntax | `specs/archive/005-engine-syntax/` | Chunk helpers, `put*`, `the` proxy |
| 006-api | `specs/archive/006-api/` | Top-level method surface, owner registry, active-context model |
| 007-pack | `specs/archive/007-pack/` | Movie/cast/member definition contract, pack generator |
| 008-player | `specs/archive/008-player/` | Worker runner, rendering, input, audio, net relay |
| 009-browser | `specs/archive/009-browser/` | `<x-object>`, `<x-embed>`, `<x-param>` |
| 010-member-classes | `specs/archive/010-member-classes/` | 19 member media classes, `newMember` |
| 011-scripting-objects | `specs/archive/011-scripting-objects/` | Fileio, NetLingo, SpeechXtra, XMLParser, `xtra()` |

Authority rules:

- This spec is the contract. Where a source spec, plan, contract, or research note conflicts
  with a consolidation ruling in this document, the ruling wins.
- The archived documents remain the rationale record. The Traceability and Supersession
  appendices map merged requirements to sources and record what changed.
- The authoritative behavioral reference for Director semantics is
  `docs/drmx2004_scripting_ref/`; where the docs are silent, ambiguous, or contradictory, the
  established project rule applies: **game usage > docs** (a surface the game uses is kept and
  docs inform its defaults), and anything neither settled by docs nor used by the game is out
  of scope rather than invented.
- Package path names, runtime mechanisms (workers, `OffscreenCanvas`, Web Audio), and class
  naming are explicit product requirements inherited from the original directive, not
  implementation choices; they are in scope for this spec by user mandate.

## Clarifications

### Session 2026-09-12 (consolidation rulings)

These rulings resolve every conflict found while merging the eleven sources. They are binding.

- **R-01 — Rect members**: `Rect` exposes only the documented `left`, `top`, `right`,
  `bottom` members. `width`/`height` are not Rect members; consumers derive them from the
  edges. (Supersedes 001's mention of Rect `width`/`height`.)
- **R-02 — Singleton binding model**: Core-object instances are **consts declared on
  `DirectorContext`** (`movie`, `player`, `sound`, `key`, `mouse`, `system`, `global`). API
  methods resolve the active context through a single accessor; module-level mutable
  singleton slots and main-thread `globalThis` installs are retired. Inside a movie worker,
  bootstrap installs accessor **getters** for the seven names, `the`, and the method names on
  the worker global before the bundle import. (006 C8 + 008 C1 supersede 001 FR-003/016 and
  004's live-binding slots.)
- **R-03 — Score and sprites are real**: The Score subsystem is implemented (001 FR-031 is
  void), and `Sprite`/`SpriteChannel` are functional, not shells (001 FR-007 partial and 001
  FR-010 are superseded). Score-dependent sprite behavior is live.
- **R-04 — Sprite lifecycle order**: Each tick runs `score.advance()` → `prepareFrame` →
  `enterFrame` → **all** `beginSprite` dispatches in ascending channel order → **all**
  `endSprite` dispatches in ascending channel order → `exitFrame`. Events carry live
  `SpriteObject` references.
- **R-05 — Playhead origin**: The Score playhead starts at `0` (no current frame) and becomes
  `1` on the first `advance()`; frame numbers are 1-based and `the.frame` reports the
  playhead.
- **R-06 — Frame navigation**: `go` accepts a frame number or marker name; `goNext`/
  `goPrevious` are **marker-based** with the documented fallbacks (not simple frame ±1), and
  empty-score navigation is a no-op.
- **R-07 — Tempo authority**: `puppetTempo` (and tempo options) set the Score's movie-level
  tempo; the player's event loop reads it and re-arms its timer on each tick. Per-frame tempo
  overrides are not modeled.
- **R-08 — hitTest bounds**: A sprite's hit bounds derive from `locH`/`locV` plus
  `width`/`height` (the `rect`/`left`/`top`/`right`/`bottom` fields are synchronized mirrors).
  `hitTest(point)` returns the topmost visible sprite by `(locZ, channel)`, or `VOID`/`null`.
- **R-09 — constraint**: `constrainH`/`constrainV` and the sprite `constraint` field clamp the
  constrained sprite's `loc` inside the constrainer's bounds through runtime helper calls;
  there is no property-assignment interception on sprites.
- **R-10 — Key constants**: `BACKSPACE` = backspace character (`"\b"`), `ENTER` = numeric
  keypad Enter (`"\x03"`), `RETURN` = carriage return (`"\r"`), `SPACE` = `" "`, `TAB` =
  `"\t"`. The constants.txt JavaScript-column keyCodes are alternatives for `_key.keyCode`
  comparisons, not Lingo constant values.
- **R-11 — Creators and `color()`**: Base types live in `engine/base`; the creators
  `color/list/point/propList/rect` are API methods in `api/methods/` and the barrel re-exports
  them from there. `color(intPaletteIndex)` is the palette-index form and
  `color(r,g,b)` the RGB form; `Color` carries `paletteIndex`; built-in palettes are addressed
  by symbol (`#systemMac`, `#rainbow`, …). `rgb()` stays absent.
- **R-12 — `ilk()` and `value()`**: `ilk(object)` returns the documented type **symbol**
  (`Symbol.for("integer")`, `"list"`, `"string"`, `"symbol"`, `"float"`, `"void"`, …) and the
  two-argument form answers type-match questions per the docs alias table. `value(string)`
  evaluates the documented expression subset (literals, constants, arithmetic, lists,
  symbols, quoted strings) without `eval()`; unparseable input yields the leading parsable
  portion, and a bare non-numeric word yields `VOID`.
- **R-13 — `integer()`**: rounds to the nearest integer per the scripting reference (e.g.
  `integer(3.75)` → `4`); 001's "truncate toward zero" wording is superseded.
- **R-14 — Net ownership**: `NetLingoObject` owns the net logic and its transaction state
  (internally a `NetState` registry). Every context owns exactly one `NetLingo`; the context's
  `netState` is a compatibility alias of `netLingo.netState`. The top-level net API methods
  delegate to the active context's `NetLingo`. (011 D2 supersedes 006's registry-first
  framing; 001/004's per-context `NetState` stands as the storage.)
- **R-15 — Net fail-soft**: net calls never throw. A rejected/failed fetch completes the
  transaction as an error: `netDone()` is `true`, `netError()` is a truthy message, and
  `netTextResult()` is `""`. HTTP failures report `"HTTP 404"`-style messages. Unknown
  `netAbort` ids are no-ops.
- **R-16 — Pack definition contract**: The C8 shape from 007 is authoritative (nested
  `options`, `totalCastSlots`, optional `score`, base64 bitmap `data`, `registrationPoint`,
  `number` as metadata). It supersedes 001's flat builder shape and inline typed-array bitmap
  payload wording.
- **R-17 — `run()` input**: `run(bundleUrl, { canvas, externalParams })` is the primary form;
  the worker imports the bundle itself. An inline definition object remains accepted for tests
  only.
- **R-18 — Player protocol additions**: The 001 message table stands, plus the rendering
  fallback `paint` message and the utility messages `setTempo`, `poll-lifecycle`, and the
  generic `handle.post(kind, payload)` channel. Handle events include `ready`, `error`,
  `externalEvent`, `paint`, `gotoNetMovie`, and `gotoNetPage`.
- **R-19 — Input before ready**: Main-thread messages (start and input) are queued by the
  handle until the worker reports `ready`, then flushed in order.
- **R-20 — Canvas transfer**: The custom element creates and appends the `<canvas>`; `run()`
  calls `transferControlToOffscreen()` on it when available and transfers the result in the
  `init` message. When unsupported, the worker renders via the `paint` message and the element
  paints the `ImageData`.
- **R-21 — Audio nodes**: Each of the 8 `SoundChannel`s owns a `GainNode` (volume 0–1) and a
  `PannerNode` (pan −100..100 mapped to −1..1), plus per-play buffer sources.
  `fadeIn`/`fadeOut` ramp gain over ticks. Decode failure leaves the channel idle.
- **R-22 — Media class count**: 19 documented media types — 8 functional (`Bitmap`, `Button`,
  `ColorPalette`, `Cursor`, `Field`, `Font`, `Sound`, `Text`) and 11 documented stubs
  (`AnimatedGIF`, `DVD`, `FilmLoop`, `FlashComponent`, `LinkedMovie`, `QuickTime`,
  `RealMedia`, `Shockwave3D`, `ShockwaveAudio`, `VectorShape`, `WindowsMedia`). A legacy
  `FlashMember` file may remain as an unclassified stub but is not one of the 19 documented
  types. (This ruling fixes the 11-vs-12 stub drift and the misclassification of
  `AnimatedGIF`/`Sound` found in code.)
- **R-23 — `halt` ownership**: `halt()` is a Player method per the authoritative owner table
  (not Movie); it stops the movie through the active context's player. `quit()` cannot exit a
  browser and is a no-op; `abort` aborts the current handler chain.
- **R-24 — Method inventory authority**: The documented top-level method inventory is derived
  from `docs/drmx2004_scripting_ref/methods.txt` with ownership from
  `director_core_objects.txt`. Every method module carries an `// @owner <owner>` tag; the
  owner registry must match the method file set exactly (the audit test enforces this). No
  fixed count is normative; the registry/file-set equality is.
- **R-25 — Chunk values**: Chunk reads are string-valued (a `ChunkBound` string value that
  also carries the target span used by `put*`). String contexts, `String()`, and `==`
  comparisons see the chunk text; put helpers accept the chunk expression as the target.
- **R-26 — `the` registration**: `the` is exported from the lingo entry and is **not**
  installed on `globalThis` at import; the player/runner installs the runtime globals before
  the movie bundle import.
- **R-27 — Status of this document**: 001–011 are already implemented. This consolidated spec
  is the contract against which the follow-up `/speckit.analyze` consistency pass verifies the
  implementation; gaps discovered later are fixed point by point.

### Session 2026-09-12 (clarify)

- Q: When a translated lifecycle handler throws during a frame tick inside the worker, what
  should the runtime do? → A: Post the error to the host and halt the movie (`stopMovie`); the
  loop does not continue after a handler error.
- Q: What should `gotoNetMovie(url)` do in v1 when a movie is already playing? → A: Relay to
  the main thread; the handle tears down the current runtime and runs the new bundle in a fresh
  worker.

### Carried decisions from the sources

Preserved from the source specs' clarification sessions (all still binding):

- **Data types (002)**: undocumented convenience members on `Color` (`hex`, `rgb`,
  `equals()`) are removed; `rgb()` stays absent from the API. Doc-silent behaviors: `List`
  setAt pads with `0` beyond the end; `List.deleteAt`/`PropList.deleteAt` on absent positions
  are no-ops; `List.getLast()` on empty is `VOID`; `PropList.findPosNear` is nearest by
  alphanumeric order. Bracketed/dot property access rules per the scripting reference.
- **Syntax (005)**: chunk helpers use the chained `.of(...)`/`.to(...)` forms; out-of-range
  single reads are `""`; range end clamps; start > end and start < 1 yield `""`; items split
  on the live `itemDelimiter`; words split on spaces/whitespace; lines split on CR only; empty
  chunks count as chunks; `put*` take the chunk first and return the new string; `the`
  read-only writes and unknown properties throw script errors; `the` property surface is the
  doc-derived table (no `wordDelimiter`/`lineDelimiter`); computed date/time values come from
  JS; casing aliases `milliSeconds`/`maxinteger` are accepted; `randomSeed` is settable.
- **Context / Score (004)**: Score models frames in order, up to 48 sprite channels, per-frame
  markers, and per-channel cells (member ref + placement props); `sprite(0)` is the stage;
  playback runs with an empty score; navigation over whatever frames exist; per-frame tempo
  overrides deferred; the lifecycle service dispatches in the documented order and is
  Score-independent.
- **API (006)**: method ownership derives from `director_core_objects.txt`; the five dormant
  creator modules are the creator method layer; palette form of `color()` is fully supported
  (built-in palettes by symbol, `paletteRef`, cast-member palettes); `value()` evaluates
  expressions; `*P` predicates kept; `halt`/`quit`/`abort` follow the docs' command semantics;
  stateful methods with no active context return neutral values without throwing (no extra
  store abstraction).
- **Sprites (003)**: puppet register lives on the context keyed by channel 1..48 and preempts
  the Score; `puppetSprite(n,FALSE)` restores Score control;
  `makeScriptedSprite`/`removeScriptedSprite` operate on the register; `sprite(0)` is an inert
  stage sprite; unknown channels resolve to `null`.
- **Media (010)**: documented fields only (no payload mirroring — payload stays on
  `MemberObject.payload`); `newMember(type)` accepts symbol or string, maps to the media
  class, sets the documented type symbol, and registers in the first empty cast slot when a
  context is active (member returned unregistered otherwise).
- **Scripting (011)**: `xtra()` is a top-level method (`@owner top`), case-insensitive,
  returning the scripting class or `null`; NetLingo implements the net methods over its
  internal state and the top-level net API delegates to it; the other three expose the full
  documented surface with Fileio/Speech deterministic stubs and XMLParser minimally real via
  `DOMParser`.
- **Player (008)**: bundle URL primary; worker imports the bundle; globals installed before
  import; one worker per run; flat-2D rendering (loc, size, visibility) with ink/rotation/
  blend deferred; `paint` fallback; poll-only lifecycle observation; 8 audio channels; net
  fetch in-worker; `externalEvent` bridging; `stop()` is resumable, `destroy()` is terminal.
- **Browser (009)**: attributes `src` (alias `data`) required, `width`/`height` default
  640×480, optional `tempo`; `<x-param>` children snapshotted at connect (post-connect
  mutations are stale by contract); input events forwarded via `handle.post`; `paint` drawn to
  the element canvas; disconnect destroys; element ≡ imperative `run()` surface.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Director Data-Types & Constants (Priority: P1)

A developer (or translated Lingo script) uses the five documented Director data-types —
`Color`, `List`, `PropList`, `Point`, `Rect` — and the eleven documented Lingo constants
exactly as described by the Macromedia Director MX 2004 reference: documented members only,
documented defaults, 1-based indexing, documented command results and error/return
conventions, and RGB channel clamping.

**Why this priority**: These are the foundational vocabulary every object, method, and script
depends on; independently constructible and testable with no context, worker, or host.

**Independent Test**: Import the types and constants from the public lingo entry and exercise
every documented operation (channel clamping, list/prop-list commands, bracket/property
syntax, defaults, constant values and coercions).

**Acceptance Scenarios**:

1. **Given** the lingo entry, **When** the five types and eleven constants are imported,
   **Then** each exposes exactly its documented surface and no undocumented members.
2. **Given** `Color` values outside 0–255 or fractional, **When** channels are set or read,
   **Then** every channel is truncated/clamped to an integer 0–255.
3. **Given** `List` and `PropList`, **When** the documented commands run (add/addAt/append/
   deleteAt/deleteOne/setAt/sort/get*), **Then** results follow the docs, including 1-based
   indexing, blank-padding on `List.setAt`, and documented missing-property results.
4. **Given** `Point`/`Rect`, **When** coordinates are read/written via property and bracket
   syntax, **Then** both syntaxes agree, and `Rect.width`/`height` are consumer-derived.
5. **Given** the constants, **When** used in character, logical, and numeric contexts,
   **Then** `FALSE` behaves as 0, nonzero integers evaluate true, and key constants map to
   their documented characters (`BACKSPACE` = backspace, `ENTER` = keypad Enter).

---

### User Story 2 - Syntax Stand-ins & the `the` Proxy (Priority: P1)

Translated code uses `char/item/line/word` (single and range forms), `putInto`/`putBefore`/
`putAfter`, and the `the` proxy exactly as the translation contract defines: 1-based chunks,
empty-string out-of-range reads, clamping ranges, live `itemDelimiter`, documented `put*`
semantics, and the doc-derived `the` property table with read-only enforcement.

**Why this priority**: Thousands of translated call sites depend on these pure helpers and
`the.*` reads; they are testable with no context and unblock all string/movie-state logic.

**Independent Test**: Import the 12 stand-ins from the lingo entry; exercise chunk boundaries,
delimiters, put helpers, the full `the` table (read-only rejection, read/write round-trip,
count/last function forms), with no context and with an activated context.

**Acceptance Scenarios**:

1. **Given** `"red,yellow,blue green,orange"`, **When** item 3 is requested, **Then** the
   result is `"blue green"`, and a 3..5 range clamps to `"blue green, orange"`.
2. **Given** `"fox dog cat"`, **When** `putBefore(word(2).of(s), "elk ")` runs, **Then** the
   result is `"fox elk dog cat"` (insertion without replacement).
3. **Given** a read-only `the` property, **When** written, **Then** a script error is thrown
   and the value is unchanged; unknown properties throw too.
4. **Given** a read/write property such as `the.itemDelimiter`, **When** changed and read
   back, **Then** item chunking uses the new delimiter.
5. **Given** an activated context, **When** `the.frame`/`the.frameTempo` are read, **Then**
   they reflect the context's Score, and after reset return documented defaults.
6. **Given** the full 12-name stand-in surface, **When** imported with no context, **Then**
   every helper behaves identically to the default-singleton state.

---

### User Story 3 - Context, Active-Context Resolution & Subsystems (Priority: P1)

A movie runs inside a dedicated worker with exactly one `DirectorContext` that owns the seven
core-object instances, the Score, the registries, and the ambient resources. API methods
resolve the active context through one accessor; worker bootstrap installs global getters so
translated scripts can read `_movie`, `the`, `_key`, etc.; destroying is idempotent and
releases resources.

**Why this priority**: Every method, object, and player feature reads state through this glue;
without it no translated script resolves its globals.

**Independent Test**: Construct/activate/destroy contexts directly; assert accessor
resolution, default instances without a context, per-context isolation, worker getter
installation, and idempotent resource release.

**Acceptance Scenarios**:

1. **Given** a fresh context, **When** activated, **Then** the accessor resolves that context
   and all seven core-object consts are its instances.
2. **Given** two contexts, **When** each activates, **Then** the accessor tracks the latest
   and state does not leak between them.
3. **Given** no activated context, **When** singletons are read, **Then** default instances
   resolve so modules and tests still work.
4. **Given** a worker bootstrap, **When** globals are installed before the bundle import,
   **Then** `_movie`, `_player`, …, `the`, and method names resolve through live getters on the
   worker global.
5. **Given** an activated context, **When** `destroy()` runs twice, **Then** the second call is
   a no-op, the loop stops, audio closes, the canvas reference releases, and no further
   lifecycle events fire.

---

### User Story 4 - Score & Lifecycle (Priority: P1)

The runtime models Director's Score — frames in order, up to 48 channels, per-frame markers,
and per-channel cells — with a playhead that advances at the movie tempo, marker-aware
navigation, stage resolution for `sprite(0)`, and the full documented lifecycle sequence
dispatched in order, independent of whether the Score is empty.

**Why this priority**: `go`-style game logic, sprite objects, rendering, and the runner all
read this model; it is the state layer the player executes.

**Independent Test**: Drive a Score and the context's `frameStep()` directly with fake timers:
advance, navigate, read `the.frame`, run the lifecycle sequence with empty and populated
scores, and verify `stopMovie` on destroy.

**Acceptance Scenarios**:

1. **Given** a Score with frames, **When** the playhead advances or `go`/`goNext`/`goPrevious`/
   `goLoop` run, **Then** `the.frame` reflects the documented target and navigation clamps to
   valid marker/frame data.
2. **Given** an empty Score, **When** ticks run, **Then** playback continues and frame events
   still fire in order with no sprite events and no errors.
3. **Given** `puppetTempo(n)`, **When** the next tick occurs, **Then** the loop uses the new
   tempo (movie-level tempo is the single authority).
4. **Given** a populated frame, **When** a tick runs, **Then** dispatch order is
   `prepareFrame → enterFrame → beginSprite* → endSprite* → exitFrame` with live sprite refs,
   and `beginSprite`/`endSprite` fire for populated and puppeted channels in channel order.
5. **Given** a movie playing, **When** `destroy()` is called, **Then** `stopMovie` fires once,
   exactly once, and no further frame events fire.

---

### User Story 5 - Core Objects & Functional Sprites (Priority: P1)

A developer uses the thirteen documented core objects. `Sprite`/`SpriteChannel` are
functional: `sprite(n)` resolves the live sprite for the current frame's channel (or the
puppet register), sprites hydrate from Score cells and from script mutations, `hitTest`
returns the topmost sprite at a point, `constrainH/V` clamp against a constrainer, and
lifecycle events carry live sprite objects. `Window` exposes its full documented surface while
MIAW is a documented no-op.

**Why this priority**: Core objects are the heart of the Lingo surface and the target of most
translated calls.

**Independent Test**: Import each core object and assert documented fields/methods; exercise
sprite resolution, puppeteering, hydration, `hitTest`, constraints, and lifecycle payloads
against a context with a Score.

**Acceptance Scenarios**:

1. **Given** the docs list a property/method on a core object, **When** accessed from the lingo
   entry, **Then** it exists, is public, and matches the documented behavior.
2. **Given** a frame with a populated channel, **When** `sprite(n)` is read, **Then** it
   returns a live `SpriteObject` hydrated from the cell; unknown channels return `null`, and
   `sprite(0)` returns the inert stage sprite.
3. **Given** `puppetSprite(n, TRUE)`, **When** the channel is read, **Then** the puppet
   register wins over the Score; `puppetSprite(n, FALSE)` restores Score control.
4. **Given** overlapping visible sprites, **When** `hitTest(point)` is called, **Then** the
   topmost by `(locZ, channel)` whose bounds contain the point is returned, else `VOID`.
5. **Given** `constrainH`/`constrainV`, **When** the constrained sprite's loc moves, **Then**
   it is clamped inside the constrainer's bounds.
6. **Given** `Window`, **When** `openMovie`/sibling-window execution is attempted, **Then** it
   is a documented no-op while the rest of the Window surface and the root/stage window work.

---

### User Story 6 - Public API Surface & Owner Registry (Priority: P1)

Translated scripts import the documented top-level Lingo methods from the lingo entry. Pure
methods (math/string/bit/type) work with no context; stateful methods route to the active
context's core objects; net methods are fail-soft; `symbol()`, `value()`, `ilk()`, and the
`*P` predicates provide documented type introspection.

**Why this priority**: This is the consumer-facing surface every translated script calls; the
game boots through it.

**Independent Test**: Import individual methods from the barrel; call pure methods with
documented inputs; with a context activated assert delegation to `context.movie`/`player`/
`sound`/…; with no context assert neutral no-throw returns; run the owner-registry audit.

**Acceptance Scenarios**:

1. **Given** the barrel, **When** pure methods run (`abs`, `integer`, `charToNum`, `bitAnd`,
   `min`/`max`, `random`, `sqrt`), **Then** results match the scripting reference.
2. **Given** an activated context, **When** stateful methods run (`go`, `member`, `beep`,
   `alert`, `halt`), **Then** they delegate to that context's instances.
3. **Given** no activated context, **When** a stateful method runs, **Then** it returns a
   neutral value (`null`/`false`/`0`/`""`) and never throws.
4. **Given** a stubbed `fetch` that rejects, **When** `getNetText(...)` completes, **Then**
   `netDone()` is `true`, `netError()` is truthy, and `netTextResult()` is `""`.
5. **Given** `ilk(3)` and `ilk([1,2])`, **When** called, **Then** the results are the
   documented type symbols; `value("3+4")` is `7`; `symbol("#hop")` is the `hop` symbol.
6. **Given** every `api/methods/*.js` file, **When** the registry audit runs, **Then** each
   file has a matching `// @owner` tag and the registry equals the file set.

---

### User Story 7 - Member Media Classes (Priority: P2)

A developer uses the base `Member` object and its 19 documented media-type subclasses: 8
functional classes exposing exactly their documented media-specific fields, and 11 documented
stubs that the runtime recognizes without failing. `newMember(type)` constructs the right
class and registers it in the movie's casts when a context is active.

**Why this priority**: Typed, media-aware members are how casts expose bitmaps, text, sound,
and other assets to scripts and to the renderer.

**Independent Test**: Construct each class and assert included types expose exactly their
documented surface (with documented default values) while excluded types are empty
`MemberObject` subclasses; drive `newMember` with symbol and string types with and without a
context.

**Acceptance Scenarios**:

1. **Given** the base `MemberObject`, **When** inspected, **Then** only documented base
   members exist (no media pollution).
2. **Given** an included type (`Bitmap`, `Button`, `ColorPalette`, `Cursor`, `Field`, `Font`,
   `Sound`, `Text`), **When** constructed, **Then** it extends `MemberObject` and exposes
   exactly its documented fields with documented defaults.
3. **Given** an excluded type, **When** referenced, **Then** the runtime recognizes it via an
   empty `MemberObject` subclass and does not throw.
4. **Given** `newMember(#button)` or `newMember("button")` with an active context, **When**
   called, **Then** a `ButtonMember` with the documented type symbol is returned and
   registered in the first empty cast slot; with no context it is returned unregistered.
5. **Given** a member whose payload is embedded in the bundle, **When** its media class is
   inspected, **Then** the payload remains on `MemberObject.payload` (no field mirroring) and
   the class holds only documented Director fields.

---

### User Story 8 - Scripting Objects & `xtra()` (Priority: P2)

Translated scripts create the documented scripting objects with `new xtra("fileio")` etc. and
use their full documented surfaces. NetLingo owns the net logic and state; Fileio and
SpeechXtra are deterministic stubs where the platform cannot perform the operation; XMLParser
is minimally real for XML strings.

**Why this priority**: The four scripting objects close the remaining documented object
surface and the net delegation path used by game scripts.

**Independent Test**: Create each object through `xtra()` (case-insensitive, unknown → null);
exercise each documented method surface; drive a net flow in a context and assert top-level
delegates see the same result.

**Acceptance Scenarios**:

1. **Given** `new xtra("fileio")`, **When** constructed, **Then** a `FileioObject` is
   returned; unknown names return `null`; casing is ignored.
2. **Given** Fileio/SpeechXtra, **When** their documented methods are called, **Then** they
   return deterministic documented results without filesystem/TTS access.
3. **Given** XMLParser, **When** a well-formed XML string is parsed (and when malformed input
   arrives), **Then** `parseString`/`count`/`name`/`getError` behave per the documented
   surface (`child` is a property).
4. **Given** an active context, **When** `net.getNetText(...)` completes, **Then** top-level
   `netDone`/`netError`/`netTextResult` read the same transaction; each context owns exactly
   one NetLingo and `context.netState === context.netLingo.netState`.

---

### User Story 9 - Pack Definition Contract & Generation (Priority: P2)

A developer defines a virtual movie/cast with the builder helpers or generates it from
decompiled `Casts.csv`/`Members.csv`; both produce the same frozen, pure-data definition shape
that the player ingests. Generated definitions are committed as the virtual files the browser
imports.

**Why this priority**: Bundles are the unit the player mounts; the contract must be stable
across builders, generator, and ingester.

**Independent Test**: Build a movie/cast with the builders and generate the habbo and
fuse_client packs; assert both conform to the C8 shape and that the generated packs ingest into
a context with the expected casts, members, and optional score.

**Acceptance Scenarios**:

1. **Given** the `movie` builder, **When** casts/options/score are chained and `build()` runs,
   **Then** a frozen definition matching the C8 contract is produced.
2. **Given** a `cast` builder, **When** members are registered (typed helpers or generic), **Then**
   member numbers are assigned sequentially by registration position (metadata; name is
   canonical) and the build is frozen.
3. **Given** the generator, **When** run against habbo and fuse_client, **Then** it emits
   C8-shaped `index.js` files with the generated header, bitmap payloads as inline base64
   data, sibling cast imports, and empty cast slots filled.
4. **Given** a generated or built definition, **When** ingested by the player, **Then** casts
   (including 70+ empty slots for habbo), members by name/number, and an optional score are
   constructed and registered.
5. **Given** a malformed definition (missing name/casts or wrong `kind`), **When** ingested,
   **Then** an invalid-bundle error surfaces without crashing the host.

---

### User Story 10 - Player Runner (Priority: P1)

A developer runs a movie imperatively: `run(bundleUrl, { canvas, externalParams })` spawns a
dedicated worker that installs the runtime globals, imports the bundle, ingests the definition,
activates the context, and starts a tempo-driven event loop; rendering goes to the transferred
`OffscreenCanvas` (or the `paint` fallback); input feeds `_key`/`_mouse`; audio plays through 8
Web Audio channels; net operations fetch in-worker; `externalEvent` reaches the host handle.

**Why this priority**: The runner is where the movie actually plays; everything else exists to
make it work.

**Independent Test**: With a mocked worker (in-process `EventTarget`) and jsdom, ingest a
fixture definition, assert the message sequence (`init → ready → start → lifecycle`), frame
event order, render draw order/placement via the fallback, input state/coordinate translation,
audio channel graph via a stub `AudioContext`, net relay, and `externalEvent` re-dispatch;
assert `stop` is resumable and `destroy` is terminal/idempotent.

**Acceptance Scenarios**:

1. **Given** a valid bundle URL, **When** `run()` is called with a canvas, **Then** the worker
   reaches `ready` and the context owns the definition's casts and score.
2. **Given** `handle.start()`, **When** ticks run, **Then** the documented lifecycle fires in
   order at the movie tempo, and `handle.stop()` halts without destroying (resumable).
3. **Given** a frame with channels `{1: Logo, 7: Field}`, **When** rendered, **Then** draws
   occur in ascending channel order at each sprite's `(loc, size)`; an empty frame clears to
   `bgColor`; `updateStage` re-renders.
4. **Given** a `keydown` and a `mousemove` over the canvas, **When** ingested, **Then**
   `_key`/`_mouse` reflect them with stage-space, y-flipped coordinates.
5. **Given** `sound(1).play(member)`, `setVolume`, `setPan`, and fades, **When** driven, **Then**
   the channel's gain/pan nodes reflect the documented values and decode failures leave the
   channel idle.
6. **Given** `externalEvent("foo", 1, "a")`, **When** posted, **Then** the handle dispatches
   `CustomEvent("externalEvent", { detail: { name: "foo", args: [1, "a"] } })`.
7. **Given** `handle.destroy()`, **When** called twice, **Then** `stopMovie` fires once, the
   worker terminates, resources release, and the second call is a no-op.

---

### User Story 11 - Browser Custom Elements (Priority: P3)

A declarative page uses `<x-object>`/`<x-embed>` with nested `<x-param>` children to load and
play a movie bundle, replacing the legacy HTML4 + NPAPI surface. The element is a thin wrapper
over `run()`: it creates the canvas, snapshots params, forwards input, relays events and paint
output, and destroys the runtime on disconnect.

**Why this priority**: The declarative path is the flagship host experience; it depends on the
whole runtime and is intentionally thin.

**Independent Test**: Define the elements in jsdom and attach `<x-embed>` with `<x-param>`
children against a mocked worker; assert canvas insertion/sizing, param snapshot, auto-start
after `ready`, event re-dispatch, input forwarding with scaling, paint drawing, and
disconnect-driven destroy; assert element ≡ imperative `run()` surface equivalence.

**Acceptance Scenarios**:

1. **Given** `<x-embed src=... width=... height=...>` with `<x-param>` children, **When**
   connected, **Then** a sized canvas is inserted, params snapshotted in order, `run()` called,
   and `start()` issued after `ready`.
2. **Given** an `<x-object>` with the same source/params, **When** connected, **Then** it
   behaves equivalently to `<x-embed>`.
3. **Given** no `OffscreenCanvas` support, **When** the worker posts `paint`, **Then** the
   element draws the `ImageData` to its DOM canvas.
4. **Given** input events on the element, **When** forwarded, **Then** coordinates are scaled
   from element space to stage space and sent via `handle.post`.
5. **Given** the element is removed from the DOM, **When** it disconnects, **Then** the handle
   is destroyed and resources release; re-connection works.
6. **Given** the same movie mounted via the element and via `run()`, **When** both run, **Then**
   the observable surface (handle-kind, events, external params) is equivalent.

### Edge Cases

- Member referenced by a cast/member not declared in the bundle → documented empty result, no
  crash; `Movie.member` by name across castLibs follows declaration order.
- Member referenced by name and number that disagree → name is canonical; number is metadata.
- Two castLibs with the same member name → first in castLib declaration order wins.
- `<x-object>`/`<x-embed>` connected with conflicting or malformed `<x-param>`s → clear error,
  host page not crashed.
- Context destroyed while translated scripts still hold references → references become inert
  defaults; no further events fire.
- Data-type constructor with out-of-range/fractional/wrong-arity inputs → documented
  clamp/default/error conventions; no invented coercion.
- Chunk reads on empty/non-string containers, delimiter changes mid-use, ranges with
  start > end or start < 1 → documented empty-string results.
- Writes to read-only or unknown `the` properties → script error, value unchanged.
- `go`/`goNext`/`goPrevious`/`goLoop` with an empty Score or unknown marker → no-op, no error.
- Sprite channel not populated in the current frame and not puppeted → `null`.
- `hitTest` outside every sprite → `VOID`; non-live Flash-symbol returns remain excluded-media
  stubs.
- `puppetSprite(TRUE)` on an unpopulated channel → an empty scripted sprite exists in the
  register; `puppetSprite(FALSE)` restores the cell (or nothing).
- Score tempo set to 0/negative/non-integer → clamped to a valid tempo (≥1 integer).
- Lifecycle handler throws inside the worker during a frame → the error is posted to the host
  and the movie halts (`stopMovie`); no further frame events fire.
- Host lifecycle polling lags high-frequency frame events → backpressure/coalescing by the
  handle.
- Bundle `import()` fails (404/CORS/bad module) or default export is invalid → `error`
  message, host surface, worker tears down.
- Embedded media payload malformed or wrong shape → decode failure leaves the member/renderer
  idle without throwing.
- Bundle with inline media exceeding practical memory/decode budget → documented failure path,
  no host crash.
- Net failures (offline, CORS, 404) → `netError` captures it, `netDone` flips true,
  `netTextResult` empty; `netAbort` on an in-flight op completes it as an error.
- `gotoNetMovie` mid-run → the main-thread handle tears the current context down, then runs
  the new bundle in a fresh worker (per-movie isolation).
- Worker `AudioContext` suspended/locked (no user gesture) → queued sounds play silent/queued
  until resumed; no crash.
- `externalEvent` with no host listener → no-op (no queue growth).
- `<x-param>`s added/removed after connect → stale run-config snapshot by contract.
- `Window.openMovie`/child-window properties in v1 → documented no-op/empty behavior.
- Event-loop tempo > display refresh or mis-set → timing follows the tempo authority without
  error.
- Input forwarded while the worker is busy or mid-frame → queued/coalesced per the contract,
  never reordered within a channel.
- Browser without `OffscreenCanvas` → `paint` fallback; `paint` slower than frames →
  latest-wins coalescing.

## Requirements *(mandatory)*

### Functional Requirements

#### Package, Authority & Conventions

- **FR-001**: The runtime MUST implement only behavior described in the Director MX 2004
  documentation or explicitly ratified by this spec; undocumented behavior is stubbed until
  clarified, and doc ambiguities MUST be surfaced rather than silently resolved. Where the
  game uses a surface the docs omit, the game wins and docs inform defaults.
- **FR-002**: The package MUST expose exactly three public entry points — package root
  (`@project-reborn/director`), lingo surface (`@/lingo`), and browser host (`@/browser`) — with
  the export categories defined here: lingo = Director public API (data types, constants,
  syntax stand-ins, core/scripting/media objects, singletons, top-level methods, creators);
  browser = pack builders, imperative runtime, custom elements, host helpers; root = both. No
  undocumented top-level method or singleton may be exported.
- **FR-003**: The runtime MUST NOT support binary Director/Shockwave formats (`.dcr`, `.dir`,
  `.cct`, `.cst`), and Lingo-to-JavaScript translation tooling is out of scope.
- **FR-004**: Every documented class MUST be one class per module, use public plain fields (no
  `#` private syntax for documented members), expose no undocumented static methods or
  subsystems, keep verbatim documentation JSDoc, and follow the `X...Object` (core/scripting)
  and `X...Member` (media) naming conventions with source files keeping the documented name.
- **FR-005**: Where a shared concern spans multiple documented classes (e.g. member lookup),
  exactly one documented subsystem MUST own it and every caller MUST route through it; when an
  undocumented subsystem is required, the touching code stays a stub until the subsystem is
  built, documented, and wired.
- **FR-006**: The package MUST keep the ratified source taxonomy —
  `src/engine/{base,core,subsystem,syntax}`, `src/api/{index,methods}`, `src/pack`,
  `src/player`, `src/browser/{index,custom-elements}` — and all public entry points MUST import
  cleanly in a fresh process with no stale module paths and no import-time side effects.
- **FR-007**: Behavior in this spec MUST be verified red-green (tests written first and
  observed failing) with the package test gate (`pnpm --filter @project-reborn/director test`,
  vitest + jsdom, no package-local shims); all tests MUST pass at completion with no
  pre-existing failures.

#### Data Types & Constants

- **FR-008**: The runtime MUST expose the five documented data types — `Color`, `List`,
  `PropList`, `Point`, `Rect` — each with exactly its documented member surface and behavior
  (documented defaults, 1-based list indexing, bracket/property syntax, documented
  return/error conventions) and nothing invented.
- **FR-009**: `Color` MUST truncate and clamp every channel to an integer 0–255 on
  construction and assignment, support the palette-index form with a `paletteIndex` value and
  built-in palettes addressed by symbol, and expose only the documented members (no
  `hex`/`rgb`/`equals` convenience members).
- **FR-010**: `List` MUST implement the documented command set with documented semantics:
  1-based indexing, sorted-state persistence and number-before-string ordering, `setAt`
  blank-padding beyond the end, absent-position deletes as no-ops, `getOne`/`getPos` sentinel
  `0`, `getLast` empty → `VOID`, duplicate deep-copying, and bracket/proxy access equivalent
  to `getAt`/`setAt`.
- **FR-011**: `PropList` MUST implement the documented command set with documented semantics:
  ordered name/value entries, `addProp` duplicating an existing property, missing-property
  results per the docs (`getaProp`/`findPos` → `VOID`; `getProp`/`getPropAt`/`getAt`
  out-of-range → script error), `findPosNear` as nearest alphanumeric property,
  `deleteOne` removing value + property, and bracket/dot read/write rules per the reference.
- **FR-012**: `Point` and `Rect` MUST expose only documented members (`locH`/`locV`;
  `left`/`top`/`right`/`bottom`) with bracket-syntax access to their elements; `Rect`
  `width`/`height` are consumer-derived.
- **FR-013**: The creators `color/list/point/propList/rect` MUST be exposed as API methods in
  the methods layer (base classes remain in `engine/base`), supporting both RGB and palette
  `color()` forms; `rgb()` MUST remain absent.
- **FR-014**: The runtime MUST expose the eleven documented constants (`EMPTY`, `VOID`,
  `RETURN`, `SPACE`, `TAB`, `BACKSPACE`, `ENTER`, `QUOTE`, `TRUE`, `FALSE`, `PI`) with the
  values in R-10 and the documented TRUE/FALSE numeric semantics (`FALSE` = 0; any nonzero
  integer evaluates true).

#### Syntax Stand-ins & `the` Proxy

- **FR-015**: The runtime MUST provide the four documented chunk kinds (chars, items, lines,
  words) in single and range forms, chained via `.of(...)`/`.to(...)`, with 1-based positions,
  empty-string results for out-of-range singles, range-end clamping, empty results for
  start > end / start < 1, and empty results for empty/non-string containers.
- **FR-016**: Chunk delimiters MUST follow the docs: words split on spaces (Tab/CR treated as
  spaces), lines split on carriage returns only, and items split on the live `itemDelimiter`
  (`","` default, settable through `the`); range joins preserve included delimiters, and
  trailing/consecutive delimiters produce real empty chunks.
- **FR-017**: `putInto`/`putBefore`/`putAfter` MUST take the chunk expression first and the
  value second, stringify the value, insert without replacing container content (before/after)
  or replace the target chunk (into), append at the boundary when the target chunk does not
  exist, and return the new string.
- **FR-018**: The runtime MUST export a single `the` proxy from the lingo entry that exposes
  the doc-derived property table (movie/player/sound/key/mouse/system/score state, computed
  date/time values, constants), supports the documented count/last function forms, accepts
  the approved casing aliases, rejects writes to read-only properties with a script error,
  throws on unknown properties, and delegates live reads/writes through the active context
  (defaults when none). It MUST NOT be installed on `globalThis` at import; the player
  registers it.
- **FR-019**: Score-backed `the` rows (`frame`, `frameLabel`, `frameTempo`) MUST read live
  Score values, and no undocumented `the` properties (including `wordDelimiter`/
  `lineDelimiter`) may be exposed.
- **FR-020**: All twelve syntax stand-ins (`char`, `charRange`, `item`, `itemRange`, `line`,
  `lineRange`, `word`, `wordRange`, `the`, `putInto`, `putBefore`, `putAfter`) MUST be
  exported from the lingo entry and behave identically with no context, default singletons, or
  an activated context.

#### Context, Subsystems & Score

- **FR-021**: Each movie MUST run with exactly one `DirectorContext` per worker that owns the
  seven core-object instances as consts (`movie`, `player`, `sound`, `key`, `mouse`, `system`,
  `global`), exactly one `MemberRegistry`, one `WindowRegistry`, one `NetLingo` (owning the net
  state; `context.netState` aliases `netLingo.netState`), one Score, and the ambient resources
  (`audioContext`, `canvas`, `eventLoopHandle`, frozen `externalParams`). The context MUST be
  an `EventTarget`.
- **FR-022**: Context activation MUST resolve through a single active-context accessor;
  module-level mutable singleton slots and main-thread `globalThis` installs MUST NOT be used.
  Without an activated context, documented default instances MUST resolve so modules and tests
  work.
- **FR-023**: `DirectorContext.destroy()` MUST be idempotent, stop the loop, stop the movie
  (`stopMovie`), close the audio context, release the canvas reference, and detach the active
  pointer; after destroy no lifecycle event may fire.
- **FR-024**: The Score subsystem MUST model frames in order, up to 48 sprite channels per
  frame, per-channel cells (member reference + placement props), per-frame markers, a
  movie-level tempo (frames/second, integer ≥ 1, default 30), a 1-based playhead starting at
  0, and `sprite(0)`/`channel(0)` stage resolution.
- **FR-025**: Score navigation MUST implement `go(frameOrMarker)` (unknown marker → no-op),
  `goLoop`/`goNext`/`goPrevious` with the documented marker semantics and fallbacks, and
  no-op behavior on an empty Score; `puppetTempo`/tempo options mutate the movie tempo and the
  player loop re-arms from it.
- **FR-026**: The runtime MUST dispatch the documented lifecycle in order: `prepareMovie` →
  `startMovie` → per tick (`score.advance()` → `prepareFrame` → `enterFrame` → all
  `beginSprite` in ascending channel order → all `endSprite` in ascending channel order →
  `exitFrame`) → `stopMovie` on destroy, plus `idle`/`timeout` per the docs. Sprite events
  MUST fire for populated and puppeted channels and carry live `SpriteObject` references; the
  sequence MUST run with an empty Score. If a lifecycle handler throws, the runtime MUST post
  the error to the host and halt the movie (`stopMovie`); the loop MUST NOT continue after a
  handler error.
- **FR-027**: `frameStep()` MUST be the context-level tick that advances the Score and
  dispatches the lifecycle; script mutations to live sprites MUST persist between frames while
  re-hydration occurs on playhead changes.

#### Core Objects & Functional Sprites

- **FR-028**: The runtime MUST implement the thirteen documented core objects —
  `CastLibrary`, `Global`, `Key`, `Member`, `Mouse`, `Movie`, `Player`, `Sound`,
  `SoundChannel`, `Sprite`, `SpriteChannel`, `System`, `Window` — each with all documented
  properties and methods, as `X...Object` classes in the core layer.
- **FR-029**: `sprite(n)` MUST resolve the live `SpriteObject` for the current frame's channel
  (0 = inert stage sprite), hydrating documented fields (`loc`/`locH`/`locV`, `width`/
  `height`, `visible`, `member`, `puppet`, bounds mirrors, ink/blend/rotation data) from the
  cell; unknown channels resolve to `null`.
- **FR-030**: The context MUST maintain a puppet register keyed by channel 1..48 that
  preempts the Score; `puppetSprite(n, TRUE/FALSE)` registers/removes, and
  `SpriteChannel.makeScriptedSprite`/`removeScriptedSprite` create/remove scripted sprites in
  the register.
- **FR-031**: `Sprite.hitTest(point)` MUST return the topmost visible sprite whose bounds
  contain the point (topmost by `(locZ, channel)`, bounds from loc + size) or `VOID`; the
  top-level `hitTest` delegates to it.
- **FR-032**: `Movie.constrainH`/`constrainV` and the sprite `constraint` field MUST clamp the
  constrained sprite's loc inside the constrainer's bounds through runtime helper calls.
- **FR-033**: `Window` MUST expose its full documented property/method surface, and the
  root/stage window bound to the host MUST work; `Window.openMovie` and sibling-movie (MIAW)
  execution MUST be documented no-ops in v1.

#### Member Media Classes

- **FR-034**: The base `MemberObject` MUST expose only the documented `Member` surface and
  MUST NOT carry media-specific members.
- **FR-035**: The runtime MUST implement the eight functional media classes — `BitmapMember`,
  `ButtonMember`, `ColorPaletteMember`, `CursorMember`, `FieldMember`, `FontMember`,
  `SoundMember`, `TextMember` — each extending `MemberObject` and exposing exactly its
  documented fields with documented defaults (Button `hilite`; ColorPalette
  `color()`/`palette`/`paletteMapping`/`depth`; Cursor `castMemberList`/`cursorSize`/`hotSpot`/
  `interval`; Font `bitmapSizes`/`characterSet`/`fontStyle`/`originalFont`/`recordFont`;
  Sound no own API; Bitmap/Field/Text their documented surfaces).
- **FR-036**: The runtime MUST provide the eleven documented stub classes (`AnimatedGIFMember`,
  `DVDMember`, `FilmLoopMember`, `FlashComponentMember`, `LinkedMovieMember`, `QuickTimeMember`,
  `RealMediaMember`, `Shockwave3DMember`, `ShockwaveAudioMember`, `VectorShapeMember`,
  `WindowsMediaMember`) as empty `MemberObject` subclasses, and MAY keep the legacy
  `FlashMember` file as an unclassified stub; none may add media-specific behavior.
- **FR-037**: Media payloads MUST be embedded inline in bundles (typed arrays/strings/base64
  data) and decoded in-memory; media classes MUST NOT mirror payload data into fields (the
  payload stays on `MemberObject.payload`), and no media class performs rendering (rendering
  is the player's job).
- **FR-038**: `Member.newMember(type)` MUST accept symbol or string type, construct the
  matching media class with the documented type symbol, and — when a context is active —
  register it in the first empty cast slot (assigning the next free number per cast library);
  unknown types yield a generic `MemberObject` carrying that type, and with no active context
  the member is returned unregistered.

#### Scripting Objects

- **FR-039**: The runtime MUST implement the four documented scripting objects — `Fileio`,
  `NetLingo`, `SpeechXtra`, `XMLParser` — alongside core objects in the core/scripting layer,
  each with its full documented surface.
- **FR-040**: `xtra()` MUST be a top-level API method (`@owner top`) with case-insensitive
  lookup returning the class for `fileio`/`netlingo`/`speechxtra`/`xmlparser` and `null` for
  unknown names, so `new xtra("fileio")` constructs the object.
- **FR-041**: `NetLingoObject` MUST own the net logic and transaction state; the top-level net
  API methods MUST delegate to the active context's NetLingo; each context owns exactly one
  NetLingo and `context.netState` MUST alias its registry.
- **FR-042**: Fileio and SpeechXtra MUST expose the full documented surface as deterministic
  stubs (no filesystem/TTS access); XMLParser MUST be minimally real for XML strings via
  `DOMParser` with `child` as a documented property and a documented error string for
  malformed input.

#### Public API & Owner Registry

- **FR-043**: The runtime MUST implement the documented top-level method set as one module per
  method in `src/api/methods/`, each carrying an `// @owner <owner>` tag; the owner registry
  MUST match the method file set exactly and be enforced by the audit test. Ownership derives
  from `director_core_objects.txt` (`movie`, `player`, `sound`, `key`, `mouse`, `system`,
  `global`, `member`, `window`, `castlib`, `soundchannel`, `spritechannel`, `top`, `net`).
- **FR-044**: Pure methods (math/string/bit/list/type) MUST behave per the scripting reference
  with no context required.
- **FR-045**: Stateful methods MUST resolve the active context and read/write its core-object
  instances; with no active context they MUST return neutral values (`null`/`false`/`0`/`""`)
  and never throw.
- **FR-046**: Net methods MUST follow the fail-soft contract (R-15): never throw, complete
  transactions as `done`/`error`, reflect HTTP failures as error strings, return `""` text on
  failure, and treat unknown abort ids as no-ops.
- **FR-047**: `value()` MUST evaluate the documented expression subset without `eval()`;
  `symbol()` MUST produce the named symbol; `ilk()` MUST return documented type symbols with
  the two-argument alias form; the `*P` predicates (`integerP`, `objectP`, `listP`, `stringP`,
  `symbolP`, `floatP`, `voidP`) MUST answer per the documented type matrix.
- **FR-048**: Command-style methods MUST follow the owner-table semantics: `halt()` stops the
  movie through the Player; `quit()` is a browser no-op; `abort` aborts the current handler
  chain; `delay` pauses the playhead per the docs; documented script-error cases throw.

#### Pack Definition Contract

- **FR-049**: The `movie`/`cast` builders MUST produce frozen pure-data definitions matching
  the C8 contract: `MovieDefinition { name, totalCastSlots, casts[], options: { tempo, width,
  height, src }, score? }`; `CastDefinition { kind: "cast", name, members[] }`;
  `MemberDefinition { kind: "member", name, mediaType, payload, registrationPoint?, number? }`.
- **FR-050**: Cast members MUST be identified canonically by name with `number` assigned
  sequentially by registration position (compacted, metadata only); member media types cover
  the documented set (`script`, `bitmap`, `field`, `text`, `sound`, `button`, `colorPalette`,
  `cursor`, `font`, `empty`); bitmap payloads are base64 `{ data, width, height }`; all
  payloads are inline (never URL references).
- **FR-051**: A movie definition MUST declare its casts table with empty slots represented as
  `{ kind: "cast", name, members: [] }` (habbo: 73 slots with Internal + fuse_client populated);
  the optional `score` section MUST follow the Score model.
- **FR-052**: A Node generator (`generate-pack.mjs`) MUST turn decompiled `Casts.csv`
  (`Number,Name,Filename`) and `Members.csv` (`Number,Type,Name,Registration Point,Filename`)
  into C8-shaped `index.js` files with the generated header, committed as the browser-imported
  virtual files; the `director-cast-to-javascript` skill MUST document the generator; the
  habbo and fuse_client packs MUST be generated (remaining casts are mechanical re-runs).
- **FR-053**: Bundle validation MUST reject a definition that is not a `kind: "movie"` object
  with a non-empty name and non-empty casts with a surfaced `error` (InvalidBundleError
  semantics), without crashing the host.

#### Player Runner

- **FR-054**: `run(input, { canvas, externalParams })` MUST be the imperative main-thread entry
  point that spawns one dedicated worker per run and returns a control handle
  (`EventTarget`). A bundle URL is the primary input (the worker imports it); an inline
  definition object is accepted for tests only.
- **FR-055**: The main↔worker message protocol MUST support: MT→W `init` (bundle URL/definition,
  externalParams, transferred OffscreenCanvas), `start`, `stop`, `destroy`, `goToFrame`,
  `poll-lifecycle`, `setTempo`, and input messages (`keydown`, `keyup`, `mousedown`, `mouseup`,
  `mousemove`, `focus`, `blur`); W→MT `ready`, `error`, `lifecycle`, `paint`
  (`{imageData,width,height,seq}`), `externalEvent`, `gotoNetMovie`, and `gotoNetPage`. The
  handle exposes `post(kind, payload)`, `start`, `stop`, `destroy`, `goToFrame`, `poll`, and
  `getLifecycleSnapshot`.
- **FR-056**: Worker bootstrap MUST install accessor getters for the seven singleton names,
  `the`, and the API method names on the worker global before importing the bundle, so
  translated scripts read runtime globals; the worker then imports the bundle, ingests the
  definition, activates the context, and reports `ready`.
- **FR-057**: Ingestion MUST construct and register the movie's casts/members (including empty
  slots and member-name canonical lookup), set the context's name/dimensions/tempo/src from the
  definition options, and load the optional Score section.
- **FR-058**: The event loop MUST be tempo-driven inside the worker (`setTimeout` re-arm from
  the Score tempo), call `frameStep()` per tick, and support resumable `stop` and terminal,
  idempotent `destroy` (which dispatches `stopMovie` once, closes audio, and terminates the
  worker).
- **FR-059**: Rendering MUST draw the current frame's populated channels in ascending channel
  order at each sprite's placement (flat 2D: loc, size/stretch, visibility) onto the
  transferred `OffscreenCanvas`, or emit `paint` messages when unsupported; empty frames clear
  to the movie background color; `updateStage` forces a synchronous re-render; slower main
  threads get latest-wins `paint` coalescing.
- **FR-060**: Input messages MUST update `_key`/`_mouse` state (key/charCode, button state,
  click location, focus loss releasing held keys) with coordinates translated to stage space
  (scaled, y-flipped per the Director origin) and clamped to the stage.
- **FR-061**: Audio MUST provide eight `SoundChannel`s inside the worker, each with a
  `GainNode` (volume 0–1) and a `PannerNode` (pan −100..100), decoding inline sound bytes via
  `decodeAudioData`; play/pause/volume/pan/`fadeIn`/`fadeOut` operate per the SoundChannel
  semantics, and decode failures leave the channel idle without throwing.
- **FR-062**: Net operations MUST perform real `fetch()` inside the worker (006/011 semantics);
  `gotoNetMovie`/`gotoNetPage` MUST be relayed to the main thread as tagged messages — the
  worker never touches the DOM. `gotoNetPage` navigates the host page (`window.open`/location)
  on the main thread. `gotoNetMovie` is handled by the main-thread handle, which tears down the
  current runtime and runs the new bundle in a fresh worker (001 contract).
- **FR-063**: `externalEvent(name, ...args)` MUST post to the main thread, where the handle (or
  the custom element for the declarative path) re-dispatches a DOM `CustomEvent` with
  `detail { name, args }`; `externalParamName`/`externalParamValue` MUST read the frozen
  params snapshot captured at connect/run time and forwarded into the worker.
- **FR-064**: Main-thread messages issued before `ready` MUST be queued by the handle and
  flushed in order after `ready`; `start()` before `ready` is supported by this queueing.
- **FR-065**: A failed bundle import / invalid definition / ingest error MUST post an `error`
  message, surface it on the handle, and tear the worker down without affecting other runs;
  multiple runs MUST remain isolated (one worker each).

#### Browser Custom Elements

- **FR-066**: The `@/browser` entry MUST provide the custom elements `<x-object>`, `<x-embed>`,
  and `<x-param>` (registered idempotently), with `src` (alias `data`) required and
  `width`/`height` defaulting to 640×480 and optional `tempo` overriding the bundle's tempo
  only when present; Shockwave-era plugin attributes are ignored.
- **FR-067**: On connect, the element MUST create and size a `<canvas>`, snapshot its
  `<x-param>` children (name/value, order preserved) into `externalParams`, call `run()`
  (which calls `transferControlToOffscreen()` when available), auto-`start()` after `ready`,
  and relay `externalEvent`/`error`/`gotoNetMovie`/`gotoNetPage`/`paint` as `CustomEvent`s on
  the element.
- **FR-068**: Without `OffscreenCanvas`, the element MUST draw `paint` `ImageData` onto its DOM
  canvas; post-connect `<x-param>` mutations are ignored (stale snapshot by contract, no
  MutationObserver).
- **FR-069**: The element MUST attach listeners for `keydown`/`keyup`/`mousedown`/`mouseup`/
  `mousemove`/`focus`/`blur`, translate mouse coordinates to stage space, and forward through
  `handle.post`; on disconnect it MUST destroy the handle; it MUST expose `.handle`,
  `.movieName`, and `.frame` for debugging only.
- **FR-070**: The element path and the imperative `run()` path MUST be behaviorally
  equivalent for the same bundle/params (the element is a thin wrapper): same handle kind,
  same events, same params.

#### Isolation & Cross-Cutting

- **FR-071**: Movies MUST be isolated per worker; singletons, registries, Score, and audio
  MUST NOT leak across contexts, and destroying one runtime MUST NOT affect another.
- **FR-072**: `externalParams` MUST be captured once (connect/run time), frozen (cloned
  name/value entries), and shared into the worker; runtime code MUST NOT read the DOM.
- **FR-073**: MIAW/sibling-movie execution and any Score-independent surface not otherwise
  specified remain documented no-ops; no fabricated behavior may be added to fill gaps.

### Key Entities *(include if feature involves data)*

- **Director Data-Types**: `Color`, `List`, `PropList`, `Point`, `Rect` — documented behavior
  1:1; JS-native reuse where the docs map directly.
- **Lingo Constants**: eleven documented constants with documented values/coercions.
- **Chunk Expression**: a container plus a 1-based position/range over one of four chunk
  kinds; string-valued with target metadata for `put*`.
- **`the` Property Table**: doc-derived name → source, read-only/read-write, default; plus the
  callable count/last function forms.
- **DirectorContext**: one per worker/movie; owns the seven core-object instances, registries,
  Score, NetLingo, ambient resources, frozen params; EventTarget; idempotent destroy.
- **Active-Context Accessor**: the single module pointer resolving the current context and
  backing the singleton facade; default instances when none.
- **Score / Frame / Channel / Cell / Playhead**: frames in order (≤48 channels each), cells
  (member + placement), markers, 1-based playhead starting at 0, movie-level tempo.
- **Lifecycle Events**: `prepareMovie`, `startMovie`, `prepareFrame`, `enterFrame`,
  `beginSprite`, `endSprite`, `exitFrame`, `stopMovie`, `idle`, `timeout` — dispatched in
  order on the context, carrying live sprite refs and frame data.
- **Core Objects**: the thirteen `X...Object` classes.
- **Puppet Register**: context-owned channel→`SpriteObject` map preempting the Score.
- **Member Media Classes**: 19 documented classes (8 functional, 11 stubs) + unclassified
  legacy `FlashMember` stub.
- **Scripting Objects**: `Fileio`, `NetLingo`, `SpeechXtra`, `XMLParser` + `xtra()` factory.
- **NetLingo / NetState**: per-context owner of net logic and transactions (`context.netState`
  aliases `netLingo.netState`).
- **API Owner Registry**: `name → owner` map for every method module, enforced against
  `director_core_objects.txt`.
- **MovieDefinition / CastDefinition / MemberDefinition / ScoreDefinition**: the C8 pure-data
  bundle contract.
- **MainThreadImperativeHandle**: the `run()` control handle (post/start/stop/destroy/
  goToFrame/poll; EventTarget with `ready`/`error`/`externalEvent`/`paint`/`gotoNetMovie`/
  `gotoNetPage` and `destroyed`).
- **Message Protocol**: the tagged MT↔W message set (FR-055).
- **Custom Elements**: `<x-object>`, `<x-embed>`, `<x-param>` — declarative host wrapper.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the documented data-type operations and all eleven constants are
  exercised by tests with doc-defined expected results and pass.
- **SC-002**: All twelve syntax stand-ins import from the lingo entry; 100% of the `the`
  property table rows are readable, every read-only row rejects writes, every read/write row
  round-trips, and no row outside the table is exposed.
- **SC-003**: A context activates/destroys cleanly: accessor and worker getters resolve its
  instances, no state leaks across two contexts, and double-destroy releases resources exactly
  once.
- **SC-004**: Score playback and navigation pass with populated and empty scores; lifecycle
  dispatch order is asserted for both; `stopMovie` fires exactly once on destroy.
- **SC-005**: `sprite(n)` resolution, puppet-register preemption, `hitTest` topmost
  resolution, and constraint clamping are all covered by passing tests.
- **SC-006**: The full documented core-object and scripting-object surfaces are present as
  `X...Object` classes; MIAW remains a verified no-op.
- **SC-007**: The 8 functional media classes expose exactly their documented fields and the 11
  documented stubs add no behavior; `newMember` mapping/registration is verified with and
  without a context.
- **SC-008**: 100% of `api/methods/` modules carry matching `@owner` tags and the registry
  equals the file set; pure methods pass doc tests without a context; stateful methods
  delegate with a context and return neutral values without one; net fail-soft is verified
  with a rejecting `fetch`.
- **SC-009**: `value()`, `symbol()`, `ilk()` (including the two-arg form), and every `*P`
  predicate pass their documented type-matrix tests.
- **SC-010**: Builder- and generator-produced definitions conform to the C8 contract and the
  generated habbo/fuse_client packs ingest with 73/89 members respectively and correct
  name/number lookup.
- **SC-011**: `run()` boots a bundle in a worker, dispatches the documented lifecycle at
  tempo, renders channels in ascending order (or emits `paint`), translates input into stage
  space, wires 8 audio channels, relays net navigation and `externalEvent`, and destroys
  idempotently with `stopMovie` once.
- **SC-012**: Custom elements mount/relay/forward/destroy correctly and the element ≡ `run()`
  equivalence test passes; the `paint` fallback draws in environments without
  `OffscreenCanvas`.
- **SC-013**: The three public entry points import cleanly in a fresh process with zero stale
  module paths and expose exactly the specified export categories.
- **SC-014**: `pnpm --filter @project-reborn/director test` passes with no pre-existing
  failures, and every behavior above has red-green coverage (tests observed failing first).

## Assumptions

- The Director MX 2004 scripting reference (`docs/drmx2004_scripting_ref/`) is the behavioral
  authority; game usage outranks stale docs where the game exercises a surface.
- All 001–011 features are implemented to varying depth; this spec defines the final contract
  and the later `/speckit.analyze` pass drives the remaining consistency work, verified against
  the real client point by point.
- One worker per movie is the isolation model; main-thread context execution is a testing
  convenience only.
- Inline media in bundles is the media-provenance model; only bundle import and net operations
  fetch at runtime.
- `@/lingo` is the single public API surface; the package root composes `@/lingo` + `@/browser`.
- Test infrastructure is vitest + jsdom with mocked Worker/OffscreenCanvas/AudioContext; browser
  behaviors that jsdom lacks use documented fallbacks.
- The archived 001–011 directories remain the rationale record; this spec's appendices map the
  lineage. No Spec Kit configuration marks them; they are not active features.

## Appendix A — Traceability (merged requirements → sources)

| Merged | Source(s) |
|--------|-----------|
| FR-001 | 001 FR-014, 002 FR-011, 005 C9 |
| FR-002 | 001 FR-022, 001 FR-015/016, 002 FR-007, 007 C8 |
| FR-003 | 001 FR-023/024 |
| FR-004 | 001 FR-005/009/013, 002 FR-004, roadmap conventions |
| FR-005 | 001 FR-004/006, 004 FR-012 |
| FR-006 | 002 FR-007/008, 002 research (layout), 005/006 barrels |
| FR-007 | 002 FR-010, 005 FR-015, 004 FR-013 |
| FR-008–FR-014 | 002 FR-001–FR-006/FR-010, 006 C5/C6 + US4, 001 US1/US4 |
| FR-015–FR-020 | 005 FR-001–FR-014, C1–C9 |
| FR-021–FR-023 | 004 FR-001–FR-005, 006 C8, 008 C1 |
| FR-024–FR-027 | 004 FR-006–FR-011, C1–C3, 003 R6 |
| FR-028–FR-033 | 001 FR-007/010, 003 spec+plan R1–R7, 010 D1 |
| FR-034–FR-038 | 001 FR-011/012, 010 spec + D1/D2, 007/008 payload handling |
| FR-039–FR-042 | 001 FR-008, 011 spec + D1–D3, 006 C4 net |
| FR-043–FR-048 | 006 FR (US1–US5), C1–C8, 011 D2 |
| FR-049–FR-053 | 007 spec + C8/C9, 001 US6 |
| FR-054–FR-065 | 001 US7/FR-019/026/028/033–035, 008 spec + C1–C9 |
| FR-066–FR-070 | 001 US8/FR-020/021/029/030, 009 spec + C1–C5 |
| FR-071–FR-073 | 001 FR-021/036, 004 FR-012, 009 C2 |

## Appendix B — Supersession Matrix

| Original decision | Source | Final resolution |
|-------------------|--------|------------------|
| Score out of scope; `Sprite`/`SpriteChannel` API shells | 001 FR-007/010/031 | Real Score + functional sprites (R-03) |
| Live-binding module singleton slots + `globalThis` install at activate | 001 FR-003/016, 004 FR-003 | Context consts + single accessor; worker getters (R-02) |
| Rect exposes `width`/`height` | 001 US1 AS6 | Rect edges only; consumer-derived (R-01) |
| Sprite lifecycle per-sprite ordering with per-sprite `exitFrame` | 001 research R7 | Two ascending begin/endSprite loops per tick (R-04) |
| Playhead starts at frame 1 | 004 spec US2 | Playhead starts at 0; first advance → 1 (R-05) |
| `goNext`/`goPrevious` clamp frame ±1 | 004 spec US2 AS1 | Marker-based navigation with fallbacks (R-06) |
| `constraint` intercepts `loc` assignment | 003 spec decisions | Helper-based clamping; plain fields (R-09) |
| hitTest bounds from `rect` mirrors | 003 plan R4 | Bounds from loc + size; mirrors synced (R-08) |
| Bitmap payload inline typed arrays; flat builder `MovieDefinition` | 001 FR-017/032, contracts | C8 contract with base64 bitmap data and nested options (R-16) |
| `run(definition)` first-class; `run(URL)` one option | 001 FR-019/contract | Bundle URL primary; inline definition tests-only (R-17) |
| Singleton rebound per activate; `_score` slot module-level | 004/005/006 | NetLingo owns net state; `_score` via context accessor (R-14/R-02) |
| `integer()` truncates toward zero | 006 spec US1 AS2 | Rounds to nearest per docs (R-13) |
| `ilk()` returns strings | 006 spec US5 | Returns documented type symbols + two-arg form (R-12) |
| NetLingo delegates to top-level net methods | 011 spec | NetLingo owns logic/state; top-level delegates to it (R-14) |
| 11 media stubs / Flash unclassified | 010 spec | 11 documented stubs; `FlashMember` remains unclassified legacy (R-22) |
| `halt()` as Movie method | 001/006 draft | Player method per owner table (R-23) |
| Protocol additions limited to `paint` | 008 C2 | `paint` + `setTempo`/`poll-lifecycle` + `handle.post` (R-18) |
| Input before ready dropped | 008 edge list | Queued and flushed after `ready` (R-19) |
| OffscreenCanvas transferred by the element | 001 contract | `run()` transfers the element-owned canvas (R-20) |
| StereoPanner vs PannerNode ambiguity | 001 R8 / 008 C4 | `PannerNode`, pan −100..100 (R-21) |
| Word/line delimiters exposed | 005 pre-C8 | Removed; items only (R-19/005 C8) |

## Appendix C — Archived Sources

See `specs/archive/README.md` for the full index with commits. Archived paths:
`specs/archive/001-director-runtime/` … `specs/archive/011-scripting-objects/`.
