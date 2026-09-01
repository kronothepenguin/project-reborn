# Phase 0 Research — Engine Subsystem + Score

**Branch**: `004-engine-subsystem` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md) | [plan.md](./plan.md)

## R1 — Score = new subsystem module

**Decision**: a new plain class in `src/engine/subsystem/score.js`, instantiated and owned by `DirectorContext` as `this.score`. No statics, no `#` fields, no events — it is a data model + navigation authority. Cells are opaque passthrough plain objects (`{ member, ...placement }`): 007 ships the serialized shape, 003 consumes cells for live sprites, 008 renders them. 004 stores, indexes, and navigates only.

**Rationale**: the roadmap's "Score subsystem (the runtime's playhead/channel/rendering data model)" and the constitution's SOLID — one reason to change; the context stays the ownership/dispatch surface (FR-001/FR-002).

**Alternatives considered**: Score as part of `MovieObject` — rejected: core objects are the 003 surface (verbatim JSDoc); subsystem ownership is the established pattern for shared state (member/net/window registries).

## R2 — Movie↔Score bridge (flagged for user review)

**Decision**: wire the five empty `MovieObject` stub bodies (`go`, `goLoop`, `goNext`, `goPrevious`, `puppetTempo`) to delegate to `_score` (the live slot). Evidence: translated game code calls `go(the.frame)` (habbo/internal-2-init.js:6, internal-3-loop.js:3), `puppetTempo(15)` (habbo/internal-1-initialization.js:38), `puppetTempo(getIntVariable("system.tempo", 30))` (fuse_client/74-core-thread-class.js:253), and reads `the.frameTempo` as a ms-per-frame divisor (hh_entry_base/3-entry-interface-class.js:276, 299; hh_human/13-human-template-class.js:75; fuse_client/71-fps-test-class.js:36).

**Scope boundary**: bodies only; no JSDoc edits (verbatim docs already present from 001/003 surface work); no other core file touched. `puppetSprite` stays a stubbed Movie method (C3: 003's turf). The top-level `puppetTempo` *global* (api surface, currently missing from `src/api/methods/`) is 006's reconciliation job — 004 wires the Movie method it will route to.

**Rationale**: without this, the Score would be unreachable from the method surface (004's own FR-008/FR-009 navigation and tempo would have no caller), and 006 would ship delegations into no-op stubs. KISS — five one-line delegations.

## R3 — the-proxy rewiring

**Decision**: add one new row kind `score` (reads `_score[field]`); rewire exactly three rows: `frame` (noop def 0 → score.frame), `frameLabel` (noop def 0 → score.frameLabel), `frameTempo` (core→movie.frameTempo ro def 15 → score.tempo ro). All three stay read-only (playhead/tempo mutate via go*/puppetTempo — the docs' mutators). `marker`/`markerList`/`label`/`labelList`/`lastChannel`/`numberOfCastLibs`/`numberOfMembers`/`currentTime`/`timeoutLapsed` stay noop: zero game usage (grep full `apps/client/src/game`) — 005 C9 rule "game > docs".

**Rationale**: the roadmap's "score-backed `the` values wired when 004 lands"; game reads `the.frame` and `the.frameTempo` directly. Empty-score default: `the.frame` → 0 (plays before the first frame), `the.frameTempo` → 30.

## R4 — lifecycle dispatch order

**Decision**: per tick: `prepareFrame` → `enterFrame` → (`beginSprite` → `endSprite` per populated channel, channel order 1..48) → `exitFrame`. Movie-level: `prepareMovie` → (loop) → `stopMovie` on destroy; `idle`/`timeout` unchanged from 001 (fired by the loop driver when conditions hold).

**Rationale**: authoritative roadmap (line 148–150) and spec US3. This supersedes 001 R7's "exitFrame per sprite" ordering wording (001 had no sprite model; the roadmap fixed the order with sprites). Dispatch target: the context itself (R2 keeper), `CustomEvent`s with detail `{ movie, score, frame, channel?, cell? }`.

**Alternatives considered**: per-frame begin/endSprite across frame boundaries (real Director list-enter/leave semantics) — deferred to 003's live-sprite pass (C3): the roadmap's per-tick begin+end for populated channels is the v1 contract.

## R5 — `_score` live binding slot

**Decision**: `singletons.js` gains a module-level `_score` slot with a default `new Score()`; `_installSingletons` sets it from the context; `_resetSingletons` resets it. NOT installed on `globalThis`: the seven documented Director singletons are the only globals (FR-003/FR-027); the Score is an internal subsystem, reachable by import.

**Rationale**: matches R3/R2 consumers (`the` proxy and MovieObject bridge both import the slot); keeps global surface at the documented seven.

## R6 — navigation semantics

**Decision** (anchored to the verbatim movie.js JSDoc for go/goLoop/goNext/goPrevious):
- `go(n)`: clamp to `[1, frames.length]`; empty score → no-op (playhead stays 0).
- `go("marker")`: first frame (1-based) whose `marker` equals the name; unknown marker → no-op (spec FR-008).
- `goLoop()`: previous marker — current frame if it has one, else one marker back; if none left: next marker right (no marker on current) / current (has marker) / frame 1 (no markers).
- `goNext()`: next marker; none right → last marker, or frame 1 if no markers.
- `goPrevious()`: two markers back if current has no marker, one back if it has; fallback = `goLoop` fallack.

**Rationale**: the docs are the contract source (the movie.js verbatim JSDoc is already quoted from `docs/drmx2004_scripting_ref/methods.txt`); no silent interpretation — every branch traced to a doc sentence.

## R7 — empty-score playback

**Decision** (C1): `frames = []` → playhead stays `0` (`the.frame` → 0), `advance()` no-op, `goNext/goPrevious/goLoop` no-op, `populatedChannels()` → `[]`; frame lifecycle events still dispatch each tick with no sprite events — FR-037 preserved (no event suppressed by absent sprite data).

**Rationale**: US2 AS2 / US3 AS5; the roadmap's "playback runs even with an empty score".

## R8 — tempo default

**Decision**: Score `tempo = 30` (the context default). `setTempo(n)` clamps to `Math.max(1, Math.floor(n))`. The re-arm mechanics of the timer stay with 008's event loop (C2); 004 guarantees the *value* read at each tick.

**Rationale**: `puppetTempo`/`the frameTempo` in the game drive per-frame delays (`1000/the.frameTempo`), so the value must be sane and live. `movie.frameTempo` field (def 15) is untouched — the live path is the Score (R3 amendment).