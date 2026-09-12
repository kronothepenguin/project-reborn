# Research — Director Runtime (Consolidated 015)

Phase 0 design record for the consolidated contract. Every entry below restates a
decision already ratified by [spec.md](./spec.md) (FR/ruling/SC) or by the archived
001–011 sources; it records the rationale and the losing options only. There are no
open questions and no new decisions. Where the archive shows a choice that was later
overruled, it is marked "superseded".

**Sources** (shorthand used in citations):

- `FR-xxx`, `R-xx`, `SC-xxx` — [spec.md](./spec.md).
- `001`…`011` — `specs/archive/NNN-*/research.md` (R-numbers) and their contracts:
  `001 imperative-runtime`, `001 custom-elements`, `001 packaging-builders`,
  `004 lifecycle`, `005 syntax-lingo`.
- `impl` — the current `packages/director/src` implementation used only to note drift.

Authority rule (spec "Authority rules"): the spec wins over any archived note; the
archive remains the rationale record; docs are the behavioral reference, game usage
outranks stale docs, and nothing unratified is invented.

---

## 1. Architecture & Package Taxonomy

### D1.1 — Documented behavior only; game usage outranks docs (FR-001, FR-073)

**Decision**: Implement only documented Director behavior or behavior explicitly
ratified by the spec; stub the rest; surface doc ambiguities instead of resolving
them silently; where the game uses a surface the docs omit, keep it and let the docs
inform defaults; MIAW and unspecified Score-independent surfaces stay no-ops.

**Rationale**: The runtime exists to run translated game code faithfully against the
MX 2004 reference; inventing behavior would diverge from Director and from the game
(005 C9 "game > docs"; 006 R8; 011 D3).

**Alternatives considered**: implementing plausible-but-undocumented surfaces —
rejected because it fabricates semantics (FR-073); docs-only reading without game
checks — rejected because it drops surfaces the client exercises (005 C9).

### D1.2 — Exactly three public entry points (FR-002)

**Decision**: Package root `@project-reborn/director` (lingo + browser), `@/lingo`
(Director API: data types, constants, syntax stand-ins, core/scripting/media objects,
singletons, methods, creators), `@/browser` (pack builders, imperative runtime,
custom elements, host helpers). No undocumented method or singleton may be exported.

**Rationale**: One stable consumer surface for translated code (`@/lingo`) and one for
host integration (`@/browser`), composed at the root; the export categories were fixed
in 001 (`lingo-public-api`, `packaging-builders`) and stabilized in 002 FR-007.

**Alternatives considered**: a single flat entry — rejected because it mixes
translated-script vocabulary with DOM host code and breaks tree-shaking intent;
per-area subpaths beyond the three — rejected as undocumented surface creep.

### D1.3 — Ratified source taxonomy (FR-006)

**Decision**: `src/engine/{base,core,subsystem,syntax}`, `src/api/{index,methods}`,
`src/pack`, `src/player`, `src/browser/{index,custom-elements}`; entry points import
cleanly in a fresh process with no stale paths and no import-time side effects.

**Rationale**: Folder names mirror the layer each module belongs to, keeping class
files clean and the public names stable while internals move (002 R3, user directive
2026-08-31; 005/006 barrels). This is the layout the current implementation follows.

**Alternatives considered**: the pre-refactor `engine/{objects,types}` + `runtime/*`
layout — rejected by the user directive (002 R3); deleting `api/index.js` — rejected
because it is the canonical public barrel; recreating `defineMovie`/`defineCast`
stubs — rejected because `run()` is the ingest path and the 001 refactor deleted them.

### D1.4 — One class per module, documented naming, plain public fields (FR-004)

**Decision**: Every documented class is one class per module, keeps its documented
source name, uses `X...Object` (core/scripting) and `X...Member` (media) names,
exposes documented members as plain public fields (no `#`), carries no undocumented
statics or subsystems, and keeps verbatim documentation JSDoc.

**Rationale**: Keeps the class surface directly auditable against the reference and
prevents private state from hiding documented members (001 FR-005/009/013, 002 FR-004,
roadmap conventions).

**Alternatives considered**: bundling related classes per file — rejected (audit
granularity); `#` private members — rejected because documented fields must be public
and inspectable; class-level statics for shared state — rejected under FR-005.

### D1.5 — One owning subsystem per shared concern (FR-005)

**Decision**: Where a concern spans classes (member lookup, net state, windows),
exactly one documented subsystem owns it and every caller routes through it; if an
undocumented subsystem is needed, the touching code stays a stub until the subsystem
is built and wired.

**Rationale**: Single reason to change per module (SOLID); prevents duplicated lookup
logic across `Movie`/`CastLibrary`/`member()` (001 R4 member registry) and keeps
class files free of statics.

**Alternatives considered**: a `static` map on `CastLibraryObject` — rejected by
FR-005; each class owning a private `Map` — rejected as duplicated logic (001 R4).

### D1.6 — Binary formats and translation tooling out of scope (FR-003)

**Decision**: No `.dcr`/`.dir`/`.cct`/`.cst` parsing; Lingo-to-JS translation tooling
is not part of this package — the runtime executes already-translated JS.

**Rationale**: The original directive scoped the package to executing translated
scripts against virtual bundles (001 FR-023/024); translation is a separate concern
(`lingo` skill), and binary parsing is not needed by the game path.

**Alternatives considered**: embedding decompilers/decoders — rejected as scope
expansion with no consumer in the runtime contract.

---

## 2. Worker Isolation + Context / Accessor / Singleton Model

### D2.1 — One `DirectorContext` per worker, `EventTarget` (FR-021, FR-071)

**Decision**: Each movie runs with exactly one context per worker. The context owns
the seven core-object instances as consts (`movie`, `player`, `sound`, `key`, `mouse`,
`system`, `global`), one `MemberRegistry`, one `WindowRegistry`, one `NetLingo` (with
`netState` aliasing `netLingo.netState`), one Score, and the ambient resources
(`audioContext`, `canvas`, `eventLoopHandle`, frozen `externalParams`). It extends
`EventTarget`; lifecycle events dispatch on it.

**Rationale**: `EventTarget` is native in workers and gives one object both ownership
and event dispatch with no wrapper (001 R2). Per-worker isolation means no state can
leak across movies (FR-071).

**Alternatives considered**: a free-standing `EventTarget` composed into the context —
rejected as pointless indirection; dispatching on `globalThis` — rejected as global
pollution (001 R2); main-thread contexts as the production model — rejected; they are
a testing convenience only (spec Assumptions).

### D2.2 — Context consts + single accessor; retired mutable singleton slots (R-02)

**Decision**: Core-object instances are consts on `DirectorContext`. The API methods,
`the` proxy, and singleton facade resolve the active context through one accessor
(`getActiveDirectorContext`/`setActiveDirectorContext`). Module-level mutable
singleton slots and main-thread `globalThis` installs at activate are retired.

**Rationale**: One source of truth for "which context is live", no per-singleton
binding churn, and per-worker module graphs give isolation for free (006 C8 + 008 C1).
This supersedes 001 R3's dual module-slot/`globalThis` writes and 004 R5's `_score`
module slot: rejected because parallel mutable slots could drift from the context and
`globalThis` installs are process-global.

**Alternatives considered**: `globalThis`-only bindings (breaks module importers) and
module-slots-only (contradicts bundle scripts reading globals) — both were 001 R3
options, both rejected; keeping the 874-line proxy's local singleton map — rejected
because it duplicated core state (005 R3).

### D2.3 — Default instances with no active context (FR-022)

**Decision**: Without an activated context, documented default instances resolve so
modules and tests still work; stateful calls return neutral values (`null`/`false`/
`0`/`""`) and never throw.

**Rationale**: Pure modules and tests must run with no movie; the 006 neutral map is
the contract for "no context" behavior, and it avoids an extra store abstraction
(006 R8).

**Alternatives considered**: throwing when no context — rejected (breaks libraries and
no-context unit tests); lazily creating a hidden context — rejected as unexpected
global state.

### D2.4 — Worker bootstrap installs getters before the bundle import (FR-056)

**Decision**: Inside a movie worker, bootstrap installs accessor **getters** for the
seven names, `the`, and the method names on the worker global *before* the bundle
`import()`, so translated scripts resolve them as globals; the getters read the live
context through the accessor.

**Rationale**: Translated bundles often reference `_movie`, `the`, `go` without
importing; getters are immutable (no assignment slots) and always live (008 C1,
006 C8).

**Alternatives considered**: writing values onto `globalThis` at activate (superseded
by R-02) — rejected for mutability/leaks; requiring bundles to import the barrel —
rejected because translated code uses globals.

### D2.5 — `destroy()` is idempotent and releases resources (FR-023)

**Decision**: `DirectorContext.destroy()` stops the loop, fires `stopMovie`, closes
the audio context, releases the canvas reference, and detaches the active pointer;
the second call is a no-op and no lifecycle event fires afterward.

**Rationale**: Teardown must be safe to call from both the imperative handle and the
declarative element, and terminal per the 001 contract (FR-023, 004; 008 destroy).

**Alternatives considered**: reference-counted teardown — rejected as unnecessary for
one-context-per-worker; silent partial teardown — rejected because resources must be
released exactly once.

### D2.6 — `externalParams` captured once, frozen, shared in (FR-072)

**Decision**: Params are snapshotted at connect/run time, cloned into frozen
name/value entries, forwarded into the worker in `init`, and never re-read from the
DOM by runtime code.

**Rationale**: The worker has no DOM; the frozen snapshot makes the stale-param
contract explicit and keeps reads deterministic (001 R10; 009 C2).

**Alternatives considered**: worker-side DOM reads — impossible in workers and
rejected; live re-collection per call — rejected because post-connect mutations are
stale by contract.

### D2.7 — Per-worker isolation is the production model (FR-071)

**Decision**: Singletons, registries, Score, and audio never leak across contexts;
destroying one run never affects another; one worker per run.

**Rationale**: The original directive mandates worker isolation; it also gives each
movie its own module graph, so the accessor pointer is naturally scoped (FR-071,
spec Assumptions).

**Alternatives considered**: multi-movie contexts or shared workers with routing —
rejected as unratified complexity; main-thread multiplexing — tests only.

---

## 3. Score + Lifecycle

### D3.1 — Score is a plain subsystem owned by the context (004 R1, FR-024)

**Decision**: `Score` is a plain class in `engine/subsystem/`, instantiated by
`DirectorContext`; it models ordered frames, up to 48 channels each, per-channel cells
(member + placement props), per-frame markers, and a movie-level tempo. Cells are
opaque passthrough objects; `sprite(0)`/`channel(0)` resolve the stage.

**Rationale**: One reason to change; serialization (007), live sprites (003), and
rendering (008) consume the same model without the Score knowing about them (004 R1).

**Alternatives considered**: Score as part of `MovieObject` — rejected because core
objects are the verbatim-JSDoc surface and shared state belongs to subsystems (004
R1).

### D3.2 — Playhead starts at 0; first advance reaches 1 (R-05)

**Decision**: `Score.frame` starts at `0` (no current frame); the first `advance()`
moves it to `1`; frame numbers are 1-based and `the.frame` reports the playhead. An
empty score stays at 0 and advance is a no-op.

**Rationale**: Mirrors Director's "before first frame" state and the game's
`the.frame` reads; empty-score playback is canonical (004 R7, FR-024).

**Alternatives considered**: starting at frame 1 (004 spec US2) — **superseded**: it
eliminated the pre-roll state and made empty-score reads ambiguous.

### D3.3 — Navigation is marker-based with documented fallbacks (R-06, FR-025)

**Decision**: `go(frameOrMarker)` accepts a number (clamped to existing frames) or a
marker name (unknown → no-op); `goLoop`/`goNext`/`goPrevious` follow the documented
marker search with the docs' fallbacks, not simple frame ±1; empty score → no-op.

**Rationale**: The archived `movie.js` JSDoc (quoted from `methods.txt`) specifies
marker semantics branch by branch; the game navigates by markers (004 R6).

**Alternatives considered**: `goNext`/`goPrevious` as frame ±1 (004 spec US2 AS1) —
**superseded**: it contradicts the documented marker model.

### D3.4 — Per-tick lifecycle: all begins, then all ends (R-04, FR-026)

**Decision**: Each tick is `score.advance()` → `prepareFrame` → `enterFrame` → **all**
`beginSprite` dispatches in ascending channel order → **all** `endSprite` dispatches
in ascending channel order → `exitFrame`. Sprite events fire for populated and
puppeted channels and carry live `SpriteObject` references.

**Rationale**: 004's `contracts/lifecycle.md` defines the two ascending passes; the
spec R-04 confirms it over 001 R7's per-sprite interleaving. **Superseded**: 001 R7
(`beginSprite` then per-sprite `exitFrame`) and 004 research R4's
`beginSprite→endSprite` per channel — rejected because the per-channel interleave is
not the contract order.

**Alternatives considered**: per-frame enter/leave across frame boundaries (real
Director list semantics) — deferred by 004 C3 and not modeled in v1 (004 R4).

### D3.5 — Tempo authority is the movie-level Score tempo (R-07, FR-025)

**Decision**: `puppetTempo`/tempo options set the Score's movie-level tempo (frames
per second, integer ≥ 1, default 30); the player loop reads it and re-arms its timer
each tick; per-frame tempo overrides are not modeled.

**Rationale**: The game reads `the.frameTempo` as a live divisor; a single authority
keeps `setTimeout` re-arm trivial and avoids a frame-override table nothing uses
(004 R8, FR-024).

**Alternatives considered**: fixed `setInterval` — rejected because tempo changes
require reset/recreate (001 R7); `requestAnimationFrame` — unavailable in workers;
per-frame tempo overrides — deferred (spec carried decisions).

### D3.6 — Lifecycle runs with an empty Score (FR-026, 004 R7)

**Decision**: Frame events fire every tick even when the Score has no frames; only
sprite events are absent; `stopMovie` fires exactly once on destroy.

**Rationale**: 001's Score-independent lifecycle contract survives; the runner must
observe frames even before Score data exists (004 R7, 001 R7).

**Alternatives considered**: suppressing frame events when no Score data exists —
rejected by FR-026/FR-037 (no event suppressed by absent sprite data).

### D3.7 — A throwing lifecycle handler halts the movie (clarify 2026-09-12)

**Decision**: If a translated lifecycle handler throws during a worker frame tick,
the runtime posts the error to the host and halts the movie (`stopMovie`); the loop
does not continue after the error.

**Rationale**: The consolidation clarify resolved the failure mode explicitly:
errors are observable on the host and a movie with a broken handler must not keep
ticking (spec Clarifications; FR-026).

**Alternatives considered**: skip the frame and continue — rejected as silent
data-loss behavior; catch-and-log only — rejected because the host is never told.

### D3.8 — `frameStep()` is the context-level tick (FR-027)

**Decision**: `frameStep()` advances the Score and dispatches the lifecycle. Script
mutations to live sprites persist between frames; re-hydration happens when the
playhead changes.

**Rationale**: 003 T012 requires the live `SpriteObject` identity to survive across
calls in a frame; re-hydrating only on playhead change preserves user mutations
(FR-027, 003).

**Alternatives considered**: re-hydrating every access — rejected because it would
discard scripted mutations; emulating ticks in each consumer — rejected as duplicated
order.

---

## 4. Data Types & Constants

### D4.1 — Five own classes; JS natives only for values (FR-008, 002 R1)

**Decision**: `Color`, `List`, `PropList`, `Point`, `Rect` keep their own class
representation in `engine/base`; JS natives are reused only for contained values.
Bracket/list-syntax access is provided by the existing proxy wrappers.

**Rationale**: 1-based indexing, `count` as a property, sorted-state, and
number-before-string ordering cannot be expressed by `Array` without polluting its
prototype; the reference distinguishes List from JavaScript Array (002 R1).

**Alternatives considered**: JS-Array-as-List, plain objects for Point/Rect, one
generic list base for List+PropList — all rejected in 002 R1 (lost 1-based/proxy
semantics, cross-type error conventions, or one-class-per-module).

### D4.2 — `Color`: clamp/truncate, palette form, documented members only (FR-009)

**Decision**: Every channel truncates and clamps to an integer 0–255 on construction
and assignment; `color(intPaletteIndex)` is the palette form with a `paletteIndex`
value and built-in palettes addressed by symbol; only documented members exist — no
`hex`/`rgb`/`equals()`.

**Rationale**: The reference states truncation and the palette form; the convenience
members were undocumented and removed in 002 R1/R2 (carried decisions).

**Alternatives considered**: keeping `hex`/`rgb`/`equals()` — rejected as undocumented
invention; single-arg `color(i)` as gray RGB (006 current body) — rejected in favor of
the palette index (006 C5/R6); `rgb()` as a top-level creator — stays absent.

### D4.3 — `List`: documented command semantics (FR-010, 002 R1/R5)

**Decision**: 1-based indexing; sorted state persists; numbers sort before strings;
`setAt` pads with `0`; absent-position `deleteAt` is a no-op; `getOne`/`getPos`
return sentinel `0`; `getLast()` on empty is `VOID`; `duplicate` deep-copies;
bracket/proxy access equals `getAt`/`setAt` (with documented out-of-range errors).

**Rationale**: Each rule maps to a doc line recorded in 002 R1; the padding filler
and empty-sentinel were the spec-authorized doc-silent decisions.

**Alternatives considered**: raw JS `<`/`>` sort comparators and splice-based deletes
(found in old code) — rejected because they coerce mixed types and delete from the
end; returning `undefined` for missing values — rejected in favor of `VOID`/errors.

### D4.4 — `PropList`: documented command semantics (FR-011, 002 R1/R5)

**Decision**: Ordered name/value entries; `addProp` duplicates an existing property;
`getaProp`/`findPos` missing → `VOID`; `getProp`/`getPropAt`/`getAt` out-of-range →
script error; `findPosNear` is nearest by alphanumeric order; `deleteOne` removes
value + property; bracket/dot read/write follow the reference (bracket-set on a
missing property adds it).

**Rationale**: 002 R1 quotes each doc anchor; the old implementation's Levenshtein
`findPosNear` and `undefined` sentinels were the drift.

**Alternatives considered**: Levenshtein similarity — rejected as an invented metric;
silent `setAt` no-op beyond count — rejected (docs: script error).

### D4.5 — `Point`/`Rect`: documented members, edges only (R-01, FR-012)

**Decision**: `Point` exposes `locH`/`locV`; `Rect` exposes `left`/`top`/`right`/
`bottom`; both support bracket syntax. `Rect.width`/`height` are not members —
consumers derive them from the edges.

**Rationale**: The `width`/`height` property entries apply to Image/Member/Sprite,
not the Rect data type; the reference shows `right - left` derivation (002 R1, R-01).
**Superseded**: 001 US1 AS6's Rect `width`/`height` members — rejected because they
are not Rect members.

**Alternatives considered**: plain objects without proxies — rejected because
documented list-syntax access would be lost; JS operator overloading for rect math —
rejected as impossible in JS (doc quirk deferred).

### D4.6 — Creators live in the method layer (R-11, FR-013)

**Decision**: Base classes stay in `engine/base`; `color/list/point/propList/rect` are
top-level API methods in `api/methods/` and the lingo barrel re-exports them from
there. `color()` supports both palette-index and RGB forms; `rgb()` stays absent.

**Rationale**: The creator functions are documented as top-level functions; 006 C6/R6
fixed the layer split and the palette scope (built-in palettes by symbol,
`paletteRef`, cast-member palettes via 008).

**Alternatives considered**: exporting creators from the base layer (002 removed them
from `@/lingo`, then 006 restored them as methods) — rejected; gray fallback for the
single-arg form — rejected (palette index is the doc semantics).

### D4.7 — Eleven constants with Lingo character semantics (R-10, FR-014, 002 R2)

**Decision**: `EMPTY=""`, `VOID=null`, `RETURN="\r"`, `SPACE=" "`, `TAB="\t"`,
`BACKSPACE="\b"`, `ENTER="\x03"`, `QUOTE='"'`, `TRUE=true`, `FALSE=false`,
`PI=Math.PI`; `FALSE` behaves as 0 and any nonzero integer evaluates true.

**Rationale**: Every key constant is documented as a character compared against
`_key.key`; the JS-column keyCodes are the alternative spelling for `_key.keyCode`
comparisons, not the constant values. The only historical drift was `BACKSPACE`
(002 R2).

**Alternatives considered**: keyCode-mirrored values (old code) — rejected because
`_key.key = BACKSPACE` would never match; `VOID=undefined` — rejected (the docs'
JS column maps VOID to `null`); TRUE/FALSE as numbers — rejected (JS booleans carry
the documented numeric coercions).

---

## 5. Syntax, Chunks & `the`

### D5.1 — Chained chunk selectors with a string-valued `ChunkBound` (FR-015, FR-025; 005 R1/R2)

**Decision**: `char/item/line/word` return selectors with `.of(str)` and `.to(m)`;
`charRange(a,b) ≡ char(a).to(b)` etc. Single reads are 1-based; out-of-range singles
are `""`; range ends clamp; `start > end` or `start < 1` yields `""`; empty/
non-string containers yield `""`. Reads return a `ChunkBound extends String` carrying
non-enumerable `{ kind, container, start, end }`; string contexts and `==` see the
text.

**Rationale**: The translation contract mandates the chained forms; `put*` needs
position metadata while reads must remain plain string values (005 R1, R-25). The
`String` subclass was chosen over a plain object because it preserves `.length` and
String methods.

**Alternatives considered**: positional `char(n, str)` reads (contradicts the mapping
contract, game uses chained) — rejected; a plain object with `toString` (loses String
API) — rejected; dropping the range stand-ins (12-name surface is final) — rejected.

### D5.2 — Delimiters: words whitespace, lines CR-only, items live (FR-016)

**Decision**: words split on spaces with Tab/CR treated as spaces; lines split on
carriage returns only; items split on the live `itemDelimiter` (`","` default,
settable through `the`); range joins preserve included delimiters; trailing/
consecutive delimiters produce real empty chunks.

**Rationale**: Each rule is doc-anchored (005 R1). `wordDelimiter`/`lineDelimiter`
properties were removed (005 C8, R-19) because they are undocumented and unused by
the game.

**Alternatives considered**: `split(/\s+/)` collapsing runs — rejected (empty chunks
are mandated); splitting lines on `\n` — rejected (docs say CR); exposing delimiter
properties — rejected.

### D5.3 — `put*` take the chunk first and return the new string (FR-017, 005 R2)

**Decision**: `putInto`/`putBefore`/`putAfter` receive the chunk expression first and
the value second, stringify the value, insert without replacing (before/after),
replace the target chunk (into), append at the boundary when the target chunk does
not exist, and return the new string. A plain-string target means the whole
container.

**Rationale**: The mapping contract's call shape is chunk-first; the game's 48 call
sites verify it; `ChunkBound` metadata resolves exact boundaries (005 R1/R2).

**Alternatives considered**: value-first char positions (contradicts C1) — rejected;
an explicit `(container, kind, n)` triple (second contract shape) — rejected;
mutation-by-reference (JS strings are immutable; game files that discard the result
are translation-quality issues out of scope) — rejected.

### D5.4 — Data-driven `the` proxy over a doc-derived table (FR-018, 005 R3)

**Decision**: A single `the` proxy exposes the doc-derived property table (movie/
player/sound/key/mouse/system/score state, computed date/time, constants), supports
count/last function forms, accepts the approved casing aliases
(`milliSeconds`/`maxinteger`), throws a script error on read-only writes and unknown
properties, and delegates live reads/writes through the active context (defaults
when none).

**Rationale**: The 874-line hand-written switch duplicated core state and claimed
every property (`has` always true); the data-driven table makes audit and alias/
function support tractable (005 R3, C5/C6). Defaults live with the classes they mirror
(e.g. `beepOn` false, `centerStage` true).

**Alternatives considered**: keeping the switch — rejected (state duplication,
claim-everything `has`); moving System properties onto core objects — rejected
because `engine/core` is owned elsewhere and the proxy-local backing covers only
fields with no core owner.

### D5.5 — Score-backed rows are live; no undocumented rows (FR-019, 004 R3, 005 C8)

**Decision**: `the.frame`/`frameLabel`/`frameTempo` read the live Score; `frameTempo`
defaults to 30, `frame` to 0 until the first advance; no `wordDelimiter`/
`lineDelimiter`, `numberOfSounds`, or `machineType` rows exist.

**Rationale**: The game reads `the.frame` and `the.frameTempo` directly; the removed
rows had zero game use and no doc anchor (004 R3, 005 C8/C9).

**Alternatives considered**: keeping stable no-op defaults for Score rows (005's
pre-004 contract) — superseded when 004 landed live values; keeping delimiter
properties — rejected.

### D5.6 — `the` is exported, not installed at import (R-26, FR-018, 005 R3)

**Decision**: `the` is exported from the lingo entry; it is **not** installed on
`globalThis` at import. The player/runner installs runtime globals before the movie
bundle import.

**Rationale**: Import-time global writes are side effects banned by FR-006; only the
runner knows when a movie realm exists (005 R3 user directive, 008 C1).

**Alternatives considered**: self-installing `the` like the old proxy — rejected
(import side effect); requiring explicit consumer installation — rejected because the
player already owns global installation.

### D5.7 — The 12 stand-ins behave identically with no context (FR-020)

**Decision**: `char`, `charRange`, `item`, `itemRange`, `line`, `lineRange`, `word`,
`wordRange`, `the`, `putInto`, `putBefore`, `putAfter` all export from `@/lingo` and
work with no context, default singletons, or an activated context.

**Rationale**: Translated code and unit tests call them before any movie exists; the
default-singleton state backs `the` reads (005 R4; FR-020).

**Alternatives considered**: context-required helpers — rejected (would break the
majority of pure string use).

---

## 6. Sprites, hitTest & Constraints

### D6.1 — The Score and sprites are real, not shells (R-03)

**Decision**: The Score subsystem is implemented and `Sprite`/`SpriteChannel` are
functional; Score-dependent sprite behavior is live.

**Rationale**: 001 shipped API shells with Score out of scope; 003 built the real
model and the consolidation ruling R-03 confirms the final state. **Superseded**: 001
FR-007 partial/FR-010/FR-031 (shells, Score out of scope) — rejected.

**Alternatives considered**: keeping sprite shells and deferring Score — rejected by
R-03.

### D6.2 — `sprite(n)` resolves live objects from register or cell (FR-029, 003)

**Decision**: `sprite(n)` returns the live `SpriteObject` for the current frame's
channel: channel 0 is the inert stage sprite; unknown channels are `null`; otherwise
the puppet register wins, then the Score cell is hydrated (loc, width/height,
visible, member, bounds mirrors, ink/blend/rotation data).

**Rationale**: Scripts mutate sprite fields and expect the same object across calls
within a frame; hydration centralizes cell→object mapping (003 R2, FR-027).

**Alternatives considered**: creating a fresh sprite per access — rejected (loses
script mutations); hydrating on every access — rejected.

### D6.3 — Puppet register keyed 1..48 (FR-030, 003)

**Decision**: The context owns a `puppetSprites` map keyed by channel 1..48 that
preempts the Score; `puppetSprite(n, TRUE/FALSE)` registers/removes; `SpriteChannel.
makeScriptedSprite`/`removeScriptedSprite` create/remove entries; `puppetSprite(n,
FALSE)` restores Score control.

**Rationale**: Matching Director's channel-keyed puppeteering keeps scripted sprites
independent of frame cells (003 clarification; spec carried decisions).

**Alternatives considered**: sprite objects owning their scripted flag globally —
rejected; per-frame puppet lists — rejected (keyed register is the contract).

### D6.4 — hitTest bounds from loc + size (R-08, FR-031)

**Decision**: A sprite's hit bounds derive from `locH`/`locV` plus `width`/`height`;
`rect`/`left`/`top`/`right`/`bottom` are synchronized mirrors. `hitTest(point)`
returns the topmost visible sprite by `(locZ, channel)`, else `VOID`/`null`.

**Rationale**: R-08 fixed the bounds source after 003's plan proposed reading the
`rect` mirrors; mirrors are outputs, not inputs. **Superseded**: 003 plan R4
(rect-mirror bounds) — rejected because mirrors can be stale relative to loc/size.

**Alternatives considered**: hit bounds from member dimensions only — rejected (size
is a sprite placement property); returning an index instead of a sprite — rejected
(top-level `hitTest` delegates to `Sprite.hitTest`).

### D6.5 — Constraint clamping through runtime helpers (R-09, FR-032)

**Decision**: `constrainH`/`constrainV` and the sprite `constraint` field clamp the
constrained sprite's `loc` inside the constrainer's bounds through helper calls;
there is no property-assignment interception on sprites.

**Rationale**: Plain documented fields and a deterministic helper keep the sprite
class free of accessors; R-09 fixed this after 003 considered intercepting `loc`.
**Superseded**: intercepting `loc` assignment (003 spec decisions) — rejected.

**Alternatives considered**: `loc` setter interception — rejected (hidden behavior,
field-surface conflicts); clamping only at render time — rejected (scripts read the
clamped loc).

### D6.6 — Window surface real; MIAW is a no-op (FR-033, FR-073)

**Decision**: `Window` exposes its full documented property/method surface and the
root/stage window bound to the host works; `Window.openMovie` and sibling-window
execution are documented no-ops in v1.

**Rationale**: The documented surface must exist (SC-006) while MIAW has no host
model; no fabricated behavior may fill the gap (FR-073).

**Alternatives considered**: implementing child windows — out of scope (FR-073);
omitting the methods — rejected (surface audit).

---

## 7. API, Owner Registry & Net Fail-Soft

### D7.1 — One method module + `@owner` + registry audit (R-24, FR-043)

**Decision**: Every documented top-level method is one module in `src/api/methods/`
carrying `// @owner <owner>`; the owner registry matches the method file set exactly,
enforced by an audit test. Ownership derives from `director_core_objects.txt`
(`movie`, `player`, `sound`, `key`, `mouse`, `system`, `global`, `member`, `window`,
`castlib`, `soundchannel`, `spritechannel`, `top`, `net`). No fixed count is
normative — registry/file-set equality is.

**Rationale**: The owner table is the docs' authority for where behavior lives; the
equality audit prevents drift between files and registry (006 C1/C2; R-24).

**Alternatives considered**: a single methods barrel without owner tags — rejected
(auditability); a fixed method count — rejected as brittle (R-24).

### D7.2 — Pure vs stateful; neutral no-context returns (FR-044, FR-045)

**Decision**: Pure methods (math/string/bit/list/type) are computed with no context;
stateful methods resolve the active context and delegate to its core objects; with no
context they return neutral values (`null`/`false`/`0`/`""`) and never throw.

**Rationale**: The game boots through these methods; library code must not require a
movie (006 R8 neutral map).

**Alternatives considered**: throwing without a context — rejected; a global default
context — rejected (leaks state).

### D7.3 — Net methods are fail-soft (R-15, FR-046)

**Decision**: Net calls never throw. A rejected/failed fetch completes the
transaction as an error: `netDone()` true, `netError()` a truthy message,
`netTextResult()` `""`; HTTP failures produce `"HTTP 404"`-style messages; unknown
`netAbort` ids are no-ops.

**Rationale**: The game polls net transactions during startup; failure must be
observable through the documented accessors, not exceptions (006 R9; R-15).

**Alternatives considered**: throwing/rejecting promises outward — rejected; leaving
transactions pending on failure — rejected (netDone would never flip).

### D7.4 — `value()`, `symbol()`, `ilk()`, `*P` (R-12, FR-047)

**Decision**: `value(string)` evaluates the documented expression subset (literals,
constants, arithmetic, lists, symbols, quoted strings) **without `eval()`**;
unparseable input yields the leading parsable portion and a bare non-numeric word
yields `VOID`. `symbol()` produces the named symbol. `ilk(object)` returns documented
type **symbols** (`Symbol.for("integer")`, `"list"`, …) with the two-argument alias
form. `integerP/objectP/listP/stringP/symbolP/floatP/voidP` follow the documented
matrix.

**Rationale**: `value()` is used on game data strings and must be safe; `ilk()`
returns symbols in Director. **Superseded**: `ilk()` returning strings and
`value()` via `eval()`/parseFloat (006 pre-clarify) — rejected (R-12; 006 R7).

**Alternatives considered**: `eval()` — rejected (security/semantics); full
expression parser with user handlers — deferred as out of scope (006 R7).

### D7.5 — Command semantics: halt/quit/abort/delay (R-23, FR-048)

**Decision**: `halt()` is a **Player** method per the owner table and stops the movie
through the active context's player; `quit()` is a browser no-op; `abort` aborts the
current handler chain; `delay` pauses the playhead per the docs; documented
script-error cases throw.

**Rationale**: The authoritative owner table places `halt` on the Player.
**Superseded**: `halt()` as a Movie method (001/006 draft) — rejected (R-23).

**Alternatives considered**: routing `halt` to `movie.halt()` (old body) — rejected;
making `quit()` close the window — rejected (cannot exit a browser).

### D7.6 — `integer()` rounds to nearest (R-13, FR-047)

**Decision**: `integer()` rounds to the nearest integer (e.g. `integer(3.75)` → 4).

**Rationale**: The scripting reference defines rounding. **Superseded**: 001's
"truncate toward zero" wording — rejected (R-13).

**Alternatives considered**: truncation — rejected; `Math.floor` — rejected (negative
values differ).

### D7.7 — Internal creators and net are owner categories, not exceptions (R-24, FR-043)

**Decision**: `creator` and `net` are owner categories in the registry alongside the
core-object owners; `color/list/point/propList/rect` are creator-owned modules and
the 13 net modules are `@owner net` delegates.

**Rationale**: The owner table must describe the whole file set; special-casing
creators/net outside the registry would defeat the equality audit (006 C2, 011 D2).

**Alternatives considered**: treating creators as base-layer exports — rejected
(creators are top-level functions); keeping net state in an api module — superseded
by R-14.

---

## 8. Member Media Classes

### D8.1 — Base `MemberObject` carries only the documented `Member` surface (FR-034)

**Decision**: The base member exposes only documented members and no media-specific
fields; media payloads never leak into the base.

**Rationale**: A clean base keeps the 19 media subclasses' surfaces auditable and
prevents duplicates (010 D2).

**Alternatives considered**: pushing common media fields onto the base — rejected
(surface pollution).

### D8.2 — Eight functional media classes (FR-035, 010)

**Decision**: `Bitmap`, `Button`, `ColorPalette`, `Cursor`, `Field`, `Font`, `Sound`,
`Text` extend `MemberObject` and expose exactly their documented fields with
documented defaults (e.g. Button `hilite`; ColorPalette `color()`/`palette`/
`paletteMapping`/`depth`; Cursor `castMemberList`/`cursorSize`/`hotSpot`/`interval`;
Font `bitmapSizes`/`characterSet`/`fontStyle`/`originalFont`/`recordFont`; Sound has
no own API).

**Rationale**: `media_types.txt` defines each field set; 010 authored the five
missing classes from it with verbatim JSDoc.

**Alternatives considered**: implementing all 19 types behaviorally — rejected (no
documented behavior for the excluded types); payload mirroring — rejected (D8.4).

### D8.3 — Eleven documented stubs; legacy `FlashMember` unclassified (R-22, FR-036)

**Decision**: `AnimatedGIF`, `DVD`, `FilmLoop`, `FlashComponent`, `LinkedMovie`,
`QuickTime`, `RealMedia`, `Shockwave3D`, `ShockwaveAudio`, `VectorShape`,
`WindowsMedia` are empty `MemberObject` subclasses; the legacy `FlashMember` file may
remain as an unclassified stub but is not one of the 19 documented types.

**Rationale**: R-22 fixed the 11-vs-12 stub drift and the AnimatedGIF/Sound
misclassification. **Superseded**: the 010 spec's 11-stub/Flash-unclassified wording
drift — resolved by R-22.

**Alternatives considered**: 12 documented stubs — rejected; making AnimatedGIF
functional and Sound a stub — rejected.

### D8.4 — Payloads stay on `MemberObject.payload` (FR-037, 010 D2)

**Decision**: Inline media payloads (typed arrays/strings/base64) live on
`MemberObject.payload` and are decoded in memory; media classes do not mirror payload
data into fields and do no rendering.

**Rationale**: One payload storage point keeps documented field surfaces exact; the
player owns rendering (010 D2; 008 R4).

**Alternatives considered**: mirroring payload keys as class fields — rejected
(undocumented fields); rendering from media classes — rejected (renderer's job).

### D8.5 — `newMember(type)` maps and registers (FR-038, 010 D1)

**Decision**: `newMember` accepts a symbol or string, constructs the matching media
class with the documented type symbol, and — with an active context — registers it in
the movie's first empty cast slot (next free number per cast library); unknown types
yield a generic `MemberObject` carrying that type; with no context the member is
returned unregistered.

**Rationale**: The docs' cast-member creation flow; the no-context fallback keeps
unit use possible (010 D1; FR-038).

**Alternatives considered**: throwing on unknown types — rejected (the docs allow
Xtra types); always registering globally — rejected (needs a movie).

---

## 9. Scripting Objects & `xtra()`

### D9.1 — Four scripting objects, full documented surfaces (FR-039, 011)

**Decision**: `Fileio`, `NetLingo`, `SpeechXtra`, `XMLParser` live alongside core
objects in the core/scripting layer and expose their full documented method surface.

**Rationale**: `scripting_objects.txt` defines the remaining object surface; leaving
them out would fail the surface audit (011; SC-006).

**Alternatives considered**: deferring scripting objects — rejected (game net path
depends on them).

### D9.2 — `xtra()` is a top-level creator (`@owner top`) (FR-040, 011 D1)

**Decision**: `xtra()` is an API method with `@owner top`, case-insensitive lookup,
returning the class for `fileio`/`netlingo`/`speechxtra`/`xmlparser` and `null` for
unknown names, so `new xtra("fileio")` constructs the object.

**Rationale**: The documented creation form is `new xtra(name)`; the method belongs
in the registry with the rest of the free functions (011 D1).

**Alternatives considered**: global class names per Xtra — rejected (docs use the
factory); a separate factory module — rejected (registry equality).

### D9.3 — `NetLingoObject` owns net logic and state (R-14, FR-041)

**Decision**: `NetLingoObject` implements the net methods and owns the transaction
state (internally a `NetState` registry). Every context owns exactly one `NetLingo`;
`context.netState` aliases `netLingo.netState`. Top-level net methods delegate to the
active context's `NetLingo`.

**Rationale**: One owner prevents two divergent registries; the delegation direction
was flipped by the 011 user directive and ratified as R-14. **Superseded**: 006's
registry-first framing and the early 011 draft where NetLingo delegated to top-level
methods — rejected because the object must own its transaction lifecycle.

**Alternatives considered**: module-global `_netRegistry` (old) — rejected (state
outside the context); per-context `NetState` accessed directly by methods — superseded
by the object owner.

### D9.4 — Fileio/Speech deterministic stubs; XMLParser minimally real (FR-042, 011 D3)

**Decision**: Fileio and SpeechXtra expose the full documented surface as
deterministic stubs (no filesystem/TTS access); XMLParser is minimally real for XML
strings via `DOMParser` with `child` as a documented property and a documented error
string for malformed input.

**Rationale**: The worker/browser platform cannot do FS/TTS; deterministic returns
keep scripts running. XML parsing is DOM-available where the runtime runs (011 D3).

**Alternatives considered**: real file/TTS engines — rejected (platform); fully
stubbed XMLParser — rejected because `DOMParser` gives real behavior cheaply; the
`externalEvent()` object form stays a deterministic no-op (011 out-of-scope).

---

## 10. Pack Definition + Generator

### D10.1 — The C8 definition shape is authoritative (R-16, FR-049/FR-051)

**Decision**: `MovieDefinition { name, totalCastSlots, casts[], options: { tempo,
width, height, src }, score? }`; `CastDefinition { kind: "cast", name, members[] }`;
`MemberDefinition { kind: "member", name, mediaType, payload, registrationPoint?,
number? }`. Bitmap payloads are base64 `{ data, width, height }`; all payloads are
inline.

**Rationale**: One frozen pure-data contract shared by builders, generator, and
ingester prevents drift (007 C8). **Superseded**: 001's flat builder shape and inline
typed-array bitmap wording — rejected (R-16).

**Alternatives considered**: a class-based definition — rejected (pure data for
bundles); URL-referenced payloads — rejected (inline provenance model).

### D10.2 — Names canonical; numbers metadata (FR-050)

**Decision**: Cast members are identified canonically by name; `number` is assigned
sequentially by registration position (compacted, metadata only). Media types cover
`script`, `bitmap`, `field`, `text`, `sound`, `button`, `colorPalette`, `cursor`,
`font`, `empty`.

**Rationale**: Decompiled CSVs carry both; name lookup is the stable identity across
castLibs and empty slots, while number keeps the original slot hint (007 C8; spec
Edge Cases: name is canonical).

**Alternatives considered**: number as identity — rejected (renumbering/empty slots
break scripts); per-member files — rejected (one index.js per cast/movie).

### D10.3 — Empty slots are explicit cast entries (FR-051)

**Decision**: `totalCastSlots` declares the movie's cast table; empty slots are
`{ kind: "cast", name, members: [] }` (habbo: 73 slots, Internal + fuse_client
populated); the optional `score` section follows the Score model.

**Rationale**: `castLib(n)` indexing and first-empty-slot registration depend on slots
existing at their original numbers (007 C8; 008 R2).

**Alternatives considered**: sparse maps — rejected (breaks ordinal castLib access).

### D10.4 — Node generator + committed virtual packs + skill (FR-052, 007 R10–R12)

**Decision**: `scripts/generate-pack.mjs` turns `Casts.csv` (`Number,Name,Filename`)
and `Members.csv` (`Number,Type,Name,Registration Point,Filename`) into C8-shaped
`index.js` files with the generated header, committed as the browser-imported virtual
files; the `director-cast-to-javascript` skill documents the generator; the habbo and
fuse_client packs are generated (remaining casts are mechanical re-runs).

**Rationale**: Generated files are portable data committed with the client; the
generator mirrors the builder shape by hand so generated files need no runtime import
(007 R10–R12).

**Alternatives considered**: runtime CSV parsing — rejected (build-time output is
committed and reviewable); sharing builder code with the generator — rejected because
generated files must stay portable.

### D10.5 — Bundle validation surfaces an error (FR-053, 001 R6)

**Decision**: Ingestion rejects a definition that is not a `kind: "movie"` object with
a non-empty name and non-empty casts, surfacing an `error` (InvalidBundleError
semantics) without crashing the host.

**Rationale**: A malformed bundle should fail loudly at the boundary while the host
keeps running (001 R6; 008 error path).

**Alternatives considered**: partial ingestion — rejected (half-built contexts);
throwing into the host — rejected (must surface as a message).

### D10.6 — Builders are fluent and return frozen plain data (FR-049, 001 R5)

**Decision**: `movie(name)` chains `.cast()`/`.dimension()`/`.tempo()`/`.src()`/
`.score()`/`.build()`; `cast(name)` registers typed members or generic `.member()` by
name; `.build()` freezes the plain-object definition; numbers are assigned by
registration order.

**Rationale**: Name-first registration with typed inline payloads matches the
original DSL example and keeps bundle authoring self-documenting (001 R5).

**Alternatives considered**: a single polymorphic `.member()` only (less discoverable
— kept as fallback); mutable builders returning live core objects — rejected (pure
data).

---

## 11. Player Runtime

### D11.1 — `run(bundleUrl, { canvas, externalParams })` is primary (R-17, FR-054)

**Decision**: `run()` is the imperative main-thread entry; it spawns one dedicated
worker per run and returns an `EventTarget` control handle. A bundle URL is primary
(the worker imports it); an inline definition object is accepted for tests only.

**Rationale**: Bundle/per-movie isolation plus ES-module import as the loading model
(001 R6; 008 C7). **Superseded**: 001's `run(definition)` first-class with URL as one
option — rejected (R-17).

**Alternatives considered**: `fetch()` + `new Function` bundles — rejected;
import-map resolution — rejected; main-thread execution as production — rejected.

### D11.2 — Message protocol incl. paint/setTempo/poll/post (R-18, FR-055)

**Decision**: MT→W `init` (bundle URL/definition, externalParams, transferred
OffscreenCanvas), `start`, `stop`, `destroy`, `goToFrame`, `poll-lifecycle`,
`setTempo`, and input messages (`keydown`, `keyup`, `mousedown`, `mouseup`,
`mousemove`, `focus`, `blur`); W→MT `ready`, `error`, `lifecycle`, `paint`
(`{imageData,width,height,seq}`), `externalEvent`, `gotoNetMovie`, `gotoNetPage`.
The handle exposes `post(kind,payload)`, `start`, `stop`, `destroy`, `goToFrame`,
`poll`, `getLifecycleSnapshot`.

**Rationale**: 001's protocol table stands; the consolidation added the rendering
fallback and utility messages plus the generic `post` channel (R-18). **Superseded**:
008 C2's "paint only" protocol addition — expanded by R-18.

**Alternatives considered**: direct method calls across the worker boundary —
rejected (workers are message-based); per-feature ad-hoc messages — rejected (one
tagged protocol).

### D11.3 — Worker boot order: globals → import → ingest → ready (FR-056/FR-057)

**Decision**: The worker installs global getters, imports the bundle, ingests the
definition (casts/members incl. empty slots, name canonical lookup, options,
optional Score), activates the context, and reports `ready`.

**Rationale**: Global installation must precede the bundle import so top-level script
code resolves; ingestion must precede `start` so the first tick has state (008 C1/C7,
R1/R2).

**Alternatives considered**: installing globals after import — rejected (top-level
reads fail); ingesting on first tick — rejected (startup races).

### D11.4 — Tempo-driven loop; `stop` resumable, `destroy` terminal (FR-058)

**Decision**: The loop is `setTimeout`-re-armed from the Score tempo, calls
`frameStep()` per tick, and supports resumable `stop` and terminal, idempotent
`destroy` (which dispatches `stopMovie` once, closes audio, terminates the worker).

**Rationale**: Re-arm-on-tick is the 001 contract and the only way tempo changes take
effect; stop/destroy semantics match the host lifecycle (001; 008 R3).

**Alternatives considered**: fixed `setInterval` — rejected (tempo mutation);
`destroy` as a stop alias — rejected (resources must release).

### D11.5 — Flat-2D rendering with paint fallback (FR-059, 008 C5/C6)

**Decision**: Draw the current frame's populated channels in ascending order at each
sprite's placement (flat 2D: loc, size/stretch, visibility) onto the transferred
`OffscreenCanvas`, or emit `paint` messages when unsupported; empty frames clear to
the movie background color; `updateStage` forces a synchronous re-render; slower
main threads get latest-wins coalescing.

**Rationale**: v1 renders what the Score models; ink/rotation/blend are deferred;
`paint` lets jsdom/no-OffscreenCanvas hosts show pixels (008 R4, C5/C6).

**Alternatives considered**: full ink/blend pipeline — deferred; refusing to run
without `OffscreenCanvas` — rejected (paint fallback mandated).

### D11.6 — Input translated to stage space (FR-060, 008 R6)

**Decision**: Input messages update `_key`/`_mouse` (key/charCode, button state,
click location, focus loss releasing held keys); coordinates scale to the stage and
flip y per Director's bottom-left origin, clamped to the stage.

**Rationale**: Translated scripts read stage coordinates; client-space pixels are
meaningless to `_mouse` (008 R6).

**Alternatives considered**: passing client coordinates through — rejected (wrong
coordinate space); flipping in the element — rejected (one translation point in the
worker).

### D11.7 — Eight Web Audio channels with gain + panner (R-21, FR-061)

**Decision**: Each of 8 `SoundChannel`s owns a `GainNode` (volume 0–1) and a
`PannerNode` (pan −100..100 mapped to −1..1), plus per-play buffer sources;
`play`/`pause`/`setVolume`/`setPan`/`fadeIn`/`fadeOut` follow the channel semantics;
decode failure leaves the channel idle and does not throw.

**Rationale**: The worker's Web Audio graph is the only audio path; the 001 clarify
left StereoPanner vs PannerNode ambiguous and R-21 fixes `PannerNode` with the
documented pan range. **Superseded**: `StereoPannerNode` (001 R8) — rejected.

**Alternatives considered**: main-thread `<audio>` — rejected (no DOM in worker);
throwing on decode failure — rejected (channel idles).

### D11.8 — Net fetch in-worker; navigation relayed (FR-062, clarify 2026-09-12)

**Decision**: Net operations perform real `fetch()` inside the worker;
`gotoNetMovie`/`gotoNetPage` are relayed to the main thread as tagged messages — the
worker never touches the DOM. `gotoNetPage` navigates the host page on the main
thread. `gotoNetMovie` is handled by the main-thread handle, which tears down the
current runtime and runs the new bundle in a fresh worker.

**Rationale**: Fetch works in workers; DOM navigation does not. The clarify answer
fixed the mid-run `gotoNetMovie` behavior to a fresh worker for per-movie isolation
(spec Clarifications; 001 contract).

**Alternatives considered**: fetching on the main thread and forwarding results —
rejected (extra hop); in-place bundle swap in the same worker — rejected (state
leakage).

### D11.9 — `externalEvent` bridge and param reads (FR-063, 001 R10)

**Decision**: `externalEvent(name, ...args)` posts to the main thread, where the
handle (or element) re-dispatches a DOM `CustomEvent` with `detail { name, args }`;
`externalParamName`/`externalParamValue` read the frozen snapshot captured at
connect/run time and forwarded into the worker.

**Rationale**: Workers cannot dispatch DOM events; the handle is the natural
re-dispatch point and the snapshot is the only DOM-free param source (001 R10).

**Alternatives considered**: worker DOM access — impossible; event queues — rejected
(no listener means no-op).

### D11.10 — Pre-ready messages are queued (R-19, FR-064)

**Decision**: Main-thread messages issued before `ready` are queued by the handle and
flushed in order after `ready`; `start()` before `ready` is supported by this queue.

**Rationale**: Hosts (and translated scripts) may start or send input immediately;
dropping them was an 008 edge behavior and is superseded by R-19.

**Alternatives considered**: dropping pre-ready messages (008 edge list) —
**superseded**; blocking `start()` until ready with no queue — rejected (loses input
ordering).

### D11.11 — Error teardown and run isolation (FR-065)

**Decision**: A failed import, invalid definition, or ingest error posts an `error`
message, surfaces it on the handle, and tears the worker down without affecting other
runs; multiple runs stay isolated (one worker each).

**Rationale**: The host must observe mount failures and continue; isolation is the
worker-per-run model (001 R6; FR-071).

**Alternatives considered**: retrying imports — rejected (no documented retry);
shared worker pool — rejected (isolation).

---

## 12. Custom Elements

### D12.1 — `<x-object>`/`<x-embed>`/`<x-param>` attributes (FR-066, 009 C1)

**Decision**: The `@/browser` entry provides the three elements, registered
idempotently; `src` (alias `data`) is required; `width`/`height` default 640×480;
optional `tempo` overrides the bundle's tempo only when present; Shockwave-era plugin
attributes are ignored.

**Rationale**: The declarative path replaces the legacy HTML4 + NPAPI surface with a
minimal attribute set (001 custom-elements; 009 C1).

**Alternatives considered**: supporting plugin attributes — rejected (no plugin
runtime); `data` as primary name — rejected (alias only).

### D12.2 — Connect pipeline is a thin `run()` wrapper (FR-067, 009 R3/R4)

**Decision**: On connect, the element creates and sizes a `<canvas>`, snapshots its
`<x-param>` children (name/value, order preserved), calls `run()` (which calls
`transferControlToOffscreen()` when available), auto-`start()`s after `ready`, and
relays `externalEvent`/`error`/`gotoNetMovie`/`gotoNetPage`/`paint` as `CustomEvent`s
on the element.

**Rationale**: The element has no runtime of its own; every behavior composes from
`run()` so the two paths cannot drift (009 R3; FR-070).

**Alternatives considered**: the pre-008 element that created the context and loop
itself (`_createMovie`/`loadCast` wiring) — rejected (duplicate runtime); transferring
the canvas from the element — superseded (R-20 places the transfer in `run()`).

### D12.3 — Paint fallback and stale params (FR-068)

**Decision**: Without `OffscreenCanvas`, the element draws `paint` `ImageData` onto
its DOM canvas; post-connect `<x-param>` mutations are ignored (stale snapshot by
contract, no MutationObserver).

**Rationale**: jsdom and older browsers need the fallback; a snapshot is the
documented param model (009 C2/C4).

**Alternatives considered**: a MutationObserver — rejected (runtime param changes are
out of contract); refetching params per call — rejected.

### D12.4 — Input forwarding, disconnect destroy, debug getters (FR-069)

**Decision**: The element listens for `keydown`/`keyup`/`mousedown`/`mouseup`/
`mousemove`/`focus`/`blur`, translates mouse coordinates to stage space, and forwards
via `handle.post`; on disconnect it destroys the handle; it exposes `.handle`,
`.movieName`, `.frame` for debugging only.

**Rationale**: The element owns DOM events; destroy-on-disconnect prevents leaked
workers; the getters are explicitly debug-only (009 R3/R5, 001 custom-elements).

**Alternatives considered**: global input listeners — rejected (per-element scope);
keeping the handle alive after disconnect — rejected (leak).

### D12.5 — Element ≡ `run()` equivalence (FR-070, SC-012)

**Decision**: The element path and imperative path are behaviorally equivalent for
the same bundle/params: same handle kind, events, and params, proven by a test.

**Rationale**: The element is a thin wrapper by construction; the equivalence test
guards against wrapper drift (009 T005; SC-012).

**Alternatives considered**: separate element-level behavior — forbidden by FR-070.

---

## 13. Testing Strategy

### D13.1 — Vitest + jsdom is the environment (FR-007, 001 R1)

**Decision**: Tests run under `vitest` with `environment: "jsdom"`, co-located in
`__tests__/` directories, driven by `pnpm --filter @project-reborn/director test`.

**Rationale**: jsdom covers the DOM side (custom elements, events) while the in-worker
modules import cleanly because they need browser APIs only at runtime; it is the
workspace convention (001 R1, 002 R4).

**Alternatives considered**: Playwright/WebDriver browser suites — rejected (slow,
flaky, no fidelity gain for a library, deferred to the JS client integration);
happy-dom — rejected (jsdom already configured, KISS); running tests inside a real
worker — rejected (bundling friction).

### D13.2 — Mock Worker, OffscreenCanvas, AudioContext at the boundary (001 R1, 008)

**Decision**: Use an in-process `EventTarget` Worker mock, the `paint` fallback where
jsdom lacks `OffscreenCanvas`, and an injected stub `AudioContext`; the worker
bootstrap is exercised by passing a sandbox object to `installGlobals`.

**Rationale**: jsdom implements none of these APIs; mocking the boundary keeps tests
fast while asserting the protocol and node graph rather than pixels (001 R1; 008
Technical Context).

**Alternatives considered**: real browser APIs per test — rejected (flaky/slow);
canvas npm package — rejected (not needed; fallback path is the contract).

### D13.3 — Red-green verification and the package gate (FR-007, SC-014)

**Decision**: Every behavior is verified red-green (tests written first and observed
failing) and the gate must pass with no pre-existing failures.

**Rationale**: Spec discipline inherited from 002 R4/005 R4; the gate is the
workspace's single verification command (FR-007).

**Alternatives considered**: implementation-first with ad-hoc checks — rejected.

### D13.4 — No package-local shims (FR-007, 002 R4)

**Decision**: The package carries no shim files; `vitest.config.js` has no
`setupFiles` and mocks are created per test at the boundary.

**Rationale**: The 002 cleanup deleted the 132 stale tests and four `__test-shims__`
files; recreating shims was explicitly forbidden (002 R4).

**Alternatives considered**: shared global shims — rejected (hidden test coupling).

### D13.5 — Surface audits as tests (FR-043, SC-004/SC-007/SC-008)

**Decision**: Surface/audit assertions are real tests: entry-point import checks, the
owner-registry/file-set equality audit, documented-member scans, and the element ≡
`run()` equivalence check.

**Rationale**: The contract's measurable outcomes are surface equality; tests make
drift visible mechanically (002 R4 surface checks; SC-008/SC-012).

**Alternatives considered**: manual review checklists — rejected (not enforceable in
the gate).

---

## Consolidation

No `[NEEDS CLARIFICATION]` items remain. Every decision above traces to a ruling or
FR in [spec.md](./spec.md) or to an archived 001–011 research/contract record; the
spec's Appendix B carries the authoritative supersession matrix, and the follow-up
`/speckit.analyze` consistency pass (R-27) verifies the implementation point by point
against this record.
