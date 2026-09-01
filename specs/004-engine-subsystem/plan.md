# Implementation Plan: Engine Subsystem (Glue + State) + Score

**Branch**: `004-engine-subsystem` | **Date**: 2026-09-01 | **Spec**: [/specs/004-engine-subsystem/spec.md](./spec.md)

**Input**: Feature spec 004 (C1–C3 resolved), master roadmap `docs/shockwave-player-runtime.md` §004, 001 research R2/R3/R4/R7 (kept), `docs/drmx2004_scripting_ref/methods.txt` (go/goLoop/goNext/goPrevious verbatim JSDoc already in `engine/core/movie.js`), current `packages/director/src/engine/subsystem/*`.

## Summary

Build the engine-subsystem layer of `@project-reborn/director`: (1) add the **Score subsystem** (`score.js`) — the runtime's playhead/channel data model (frames × ≤48 channels, markers, movie-level tempo, `go*` navigation per the verbatim docs, empty-score playback canonical per C1); (2) wire **`DirectorContext`** to own the Score + dispatch the Score-backed lifecycle (`frameStep()`: advance → `prepareFrame`→`enterFrame`→(`beginSprite`→`endSprite` per populated channel)→`exitFrame`); (3) add the `_score` live-binding slot to `singletons.js` (module slot only — NOT a `globalThis` singleton); (4) rewire the 005 `the`-proxy rows `frame`/`frameLabel`/`frameTempo` off their no-op/defaults onto the live Score (the roadmap's "score-backed `the` values wired when 004 lands"); (5) wire the `MovieObject` `go`/`goLoop`/`goNext`/`goPrevious`/`puppetTempo` stub bodies to the Score (the game calls `go(the.frame)`, `puppetTempo(15)`, reads `the.frameTempo`); (6) rewrite the deleted subsystem tests red-green (context, singletons, 3 registries) + new Score/lifecycle/the-wiring tests. Supersedes 001 FR-031 (Score stubbed → real). `browser/index.js`, `api/*`, `engine/core/*` beyond the 5 method bodies, and `engine/syntax/index.js` untouched.

## Technical Context

**Language/Version**: JavaScript, ES modules (`"type": "module"`), Node ≥ 20.

**Primary Dependencies**: zero runtime dependencies; vitest ^4.1.8 + jsdom ^29.1.1 (dev).
**Testing**: vitest `environment: "jsdom"`; gate `pnpm --filter @project-reborn/director test`.
**Target Platform**: Browser (worker) runtime + Node test environment; pure data model + dispatch.

**Performance Goals**: cell read O(1) per channel (sparse map lookups); `populatedChannels()` O(48) worst case per tick — negligible at 30/60 fps; marker lookup O(frames) at `go("name")` only.

**Constraints**:
- No `#` private fields, no static members (package AGENTS.md); Score is a subsystem instance owned by `DirectorContext` (FR-005).
- No package-local test shims; jsdom only.
- `engine/core/movie.js` method-body wiring only (go/loop/next/previous/puppetTempo): bodies delegate to the Score; NO JSDoc changes on those 5 methods (verbatim docs already in place) and no touching any other core file.
- `engine/syntax/the-proxy.js`: add ONE new row kind ("score"); rewire exactly `frame`, `frameLabel`, `frameTempo`; leave all other rows (incl. `marker`/`markerList`/`label`/`labelList`/`lastChannel`) untouched (no game usage — C9 "game > docs" rule from 005).
- `singletons.js`: `_score` is NOT installed on `globalThis` (not a documented Director singleton; only the 7 are).
- Translation of Lingo→JS out of scope; `updateStage`/rendering stays 008's (C3; rendering is not 004).

**Scale/Scope**: 5 source files (1 new: `score.js`) + 9 test files; 8 rewritten per-spec, 1 net-new per layer; 001 FR-031 superseded here.

## Constitution Check

*GATE: passed before Phase 0 research; re-checked after Phase 1 design.* Checked against ratified v2.0.0. **PASS — no violations:**

- **I. Defined Before Built**: every behavior defined by spec 004 (US1–US4, FR-001–FR-013, C1–C3) or this plan's research decisions R1–R8 (anchored: verbatim movie.js JSDoc for go*/navigation, roadmap lifecycle order, game usage for the-proxy rewiring evidence).
- **II. No Silent Interpretation**: C1 (empty-score canonical), C2 (movie-level tempo only), C3 (events-only sprite wiring; puppetTempo mutates score, puppetSprite stays 003) resolved with the user. The one plan-level interpretation beyond the spec text — wiring the 5 `MovieObject` stub bodies so translated game code (`go`, `puppetTempo`, `the.frameTempo`) is reachable — is an explicitly recorded plan decision (R2) shown to the user in the review summary, not a silent guess.
- **III. Specification-Driven Development**: artifacts under `specs/004-engine-subsystem/` (spec, plan, research, data-model, contracts/lifecycle, tasks, quickstart).
- **IV. Test & Verification Discipline**: red-green mandated by FR-013; tests written before implementation; gate = `pnpm --filter @project-reborn/director test`; 002's 73 + 005's 147 existing tests must stay green.
- **V. KISS**: Score is one module, plain data + go*; dispatch is one context method built on the existing per-hook lifecycle methods (no new dispatch abstraction); proxy wiring = one new row kind. No sprite-object model (003), no rendering (008), no net/audio/window behavior post-port.
- **VI. YAGNI**: no per-frame timing overrides (C2), no programmatic frame building (C1), no marker list/marker wiring beyond what `go("name")` needs (game reads only `frame`/`frameLabel`/`frameTempo`); puppetSprite untouched; registries ported as-is.
- **VII. SOLID**: Score (data model) / context (ownership + dispatch) / singletons slots (binding) / the-proxy rows (read path) — single responsibility each; registries unchanged.

**Complexity Tracking**: No violations; R2 (movie-stub wiring) is required by the game's translated call sites, not generality. Table intentionally left empty.

## Phase 0 — Research (R1–R8)

- **R1 — Score = new subsystem module** (decided): `src/engine/subsystem/score.js`, a plain class (no statics, no `#`), instantiated by `DirectorContext` as `this.score`. Cell data is a passthrough plain object (`{ member, …placement }`) — 007 ships the serialized shape; 003 consumes cells for live sprites; 008 renders them. 004 only stores + indexes + navigates.
- **R2 — Movie↔Score bridge** (decided, flagged for user review): the translated game calls `go(the.frame)` (api `go()` → `_movie.go`), `puppetTempo(15)` (bare global → 006 surface → `_movie.puppetTempo`), and reads `the.frameTempo`. The 5 `MovieObject` stub bodies (`go`, `goLoop`, `goNext`, `goPrevious`, `puppetTempo`) delegate to the active context's Score via the `_score` live slot. This makes 004's Score reachable from the top-level method surface without 006 existing yet, and leaves the full doc-surface/verbatim-JSDoc pass to 003.
- **R3 — the-proxy rewiring** (decided): new row kind `score` reading `_score[field]`; rows `frame` (`field: "frame"`, ro) → live playhead; `frameLabel` (`field: "frameLabel"`, ro) → current marker label or `""`; `frameTempo` (`field: "tempo"`, ro) → live Score tempo. 005 set `frame`/`frameLabel` noop def 0 and `frameTempo` core→`movie.frameTempo` ro def 15; 004 amends those three rows only (amendment note recorded in data-model). Read-only stays (Director: playhead/tempo mutated via go*/puppetTempo, not by direct write).
- **R4 — dispatch order** (decided, per roadmap line 148–150 and spec US3): per tick — `prepareFrame` → `enterFrame` → for each populated channel in channel order (1..48) `beginSprite` → `endSprite` → `exitFrame`. (001 R7's older per-sprite `exitFrame` wording is superseded by the roadmap order.) Events are `CustomEvent`s on the context with detail `{ movie, score, frame, channel?, cell? }`.
- **R5 — `_score` live slot** (decided): `singletons.js` adds `export let _score = new Score()` + install/reset; `_installSingletons` sets it; `globalThis` gets only the 7 documented singletons.
- **R6 — navigation semantics** (decided per verbatim movie.js JSDoc): `go(n|name)` — number → clamp to `[1, frames.length]` (out of range → clamp; empty score → no-op, playhead stays 0); marker name → first frame with that marker (1-based); unknown marker → **no-op** (spec FR-008). `goLoop` — previous marker (one back from current frame if no marker on it; current frame if it has one); fallback: next marker to the right (no marker on current), current frame (has marker), frame 1 (no markers). `goNext` — next marker; none right → last marker, or frame 1 if no markers. `goPrevious` — two markers back from current (no marker on current) or one back (marker on current); fallback same as goLoop's.
- **R7 — empty-score playback** (decided, C1): `frames = []` → playhead stays `0`; `the.frame` reads `0`; `advance()` no-ops; `goNext`/`goPrevious`/`goLoop` no-op safely; `populatedChannels()` → `[]`; ticks dispatch frame events only (no sprite events) — FR-037 preserved.
- **R8 — tempo default** (decided): Score `tempo = 30` (context default; `movie.frameTempo` field untouched at 15 — the live read path is the Score). `setTempo(n)` (puppetTempo): stores `n` clamped to `Math.max(1, Math.floor(n))`; next tick uses it (the re-arm itself is 008's loop job).

## Phase 1 — Design (data model + surface)

### Score (new — `src/engine/subsystem/score.js`)

```js
export class Score {
  constructor({ frames = [], tempo = 30 } = {}) {…}
  frame;            // getter → playhead (number, 0 with no frames)
  frameLabel;       // getter → current frame marker label | ""
  tempo;            // number (≥1) — live, read by 008's loop
  setTempo(n);      // puppetTempo; clamp per R8
  advance();        // playhead+1 clamp at last frame (hold); no-op when frames empty
  go(frameNameOrNum);    // R6
  goLoop(); goNext(); goPrevious();   // R6
  channel(n);          // cell at (current frame, channel n) | null; n=0 → STAGE
  populatedChannels();  // sorted channel numbers with cells (1..48) in current frame
  markers();            // [{ marker, frame }] index derived from frames (computed on demand)
}
export const STAGE = …;  // shared immutable stage marker for channel(0)
```

Frame normalization: input `frames` = array of `{ marker?, channels? }`; `channels` accepted as (a) sparse plain object `{1: cell, 5: cell}` or (b) array `[cell,…]` (index+1 = channel, max 48; index 0 = stage, ignored). Cells passed through as-is. `marker` = string label (""/undefined = markerless). Frame number = array index + 1.

### DirectorContext (`context.js` — extended)

- New field `this.score = new Score({ frames: options.score?.frames ?? [], tempo: options.tempo ?? 30 })`.
- New method `frameStep()` — R4 order; calls the existing `prepareFrame()`/`enterFrame()`/`exitFrame()` hooks and new `beginSprite(channel, cell)`/`endSprite(channel, cell)` hooks (go* navigation is invoked by scripts, not by the tick).
- `destroy()` unchanged in surface; Score holds no external refs (cells are data) → nothing extra to release (FR-012 parity: no stale refs by construction).
- `activate(globalObject)` unchanged (Score is NOT on `globalThis`).

### singletons.js (extended)

- `export let _score = new Score();` `_installSingletons`: `_score = ctx.score`; `_resetSingletons`: new Score().
- `globalThis` install unchanged (7 only).

### the-proxy.js (rewired)

- Import `_score` from singletons; new `score` row kind in `read()` → `_score?.[row.field] ?? row.def` (write path never reached — all three rows ro).
- Rows: `frame: { kind: "score", field: "frame", ro: true, def: 0 }`, `frameLabel: { kind: "score", field: "frameLabel", ro: true, def: "" }`, `frameTempo: { kind: "score", field: "tempo", ro: true, def: 30 }`. 005's `frameTempo` core→`movie.frameTempo` row is REPLACED (amendment to 005 recorded).
- `KNOWN`/`ownKeys`/`getOwnPropertyDescriptor` unchanged (rows stay in TABLE).

### MovieObject bridge (`core/movie.js` — 5 bodies)

- `go(frameNameOrNum, movieName)` → `_score.go(frameNameOrNum)` (movieName: load-other-movie deferred — MIAW, out of scope; ignored).
- `goLoop()` → `_score.goLoop()`; `goNext()` → `_score.goNext()`; `goPrevious()` → `_score.goPrevious()`.
- `puppetTempo(intTempo)` → `_score.setTempo(intTempo)`.
- Import `{ _score }` from `../subsystem/singletons.js` (live slot — no cycle: this matches the existing accepted direction, e.g. `api/methods/go.js` already imports from `engine/subsystem/singletons.js`).

No other core file touched (R2 boundary). Registries ported as-is (US4 → they already exist; tests only).

## Submission Artifacts (spec 004)

| File | Kind | Status |
|---|---|---|
| `specs/004-engine-subsystem/spec.md` | spec (C1–C3 resolved) | done |
| `specs/004-engine-subsystem/checklists/requirements.md` | checklist | done |
| `specs/004-engine-subsystem/plan.md` | this plan | done |
| `specs/004-engine-subsystem/research.md` | R1–R8 | done |
| `specs/004-engine-subsystem/data-model.md` | Score + context model (Phase 1) | next |
| `specs/004-engine-subsystem/contracts/lifecycle.md` | lifecycle/dispatch contract for 008 | next |
| `specs/004-engine-subsystem/tasks.md` | T001+ | next (/speckit.tasks) |
| `specs/004-engine-subsystem/quickstart.md` | test scenarios | next |