# Implementation Plan: Director Runtime (Consolidated)

**Branch**: `015-director-runtime` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-director-runtime/spec.md`

## Summary

This feature is a **brownfield consolidation**: specs 001–011 (now archived under
`specs/archive/`) incrementally built `@project-reborn/director`, and this plan covers the
technical approach for making the implementation match the single consolidated contract in
`spec.md`. The runtime stack is already chosen and implemented — JavaScript ES modules in the
pnpm workspace package `packages/director`, isolated one-worker-per-movie execution, an
in-memory Score/lifecycle engine, a Web Audio player, an `OffscreenCanvas`/`paint` renderer,
and declarative custom elements. The technical approach is therefore **verify → gap-fix →
re-verify**, not greenfield construction: run the contract against the package, close the
concrete code-vs-spec gaps registered in [data-model.md](./data-model.md#known-implementation-gaps),
and hold the `vitest` + `jsdom` gate green under red-green discipline. Design artifacts are in
`research.md`, `data-model.md`, `contracts/`, and `quickstart.md`.

## Technical Context

**Language/Version**: JavaScript, ES modules (`"type": "module"`), Node ≥ 20 for tooling and
the pack generator; modern browsers for runtime (Web Workers, `OffscreenCanvas`, Web Audio,
custom elements).

**Primary Dependencies**: none at runtime (zero-dependency package); dev-only
`vitest ^4.1.8` + `jsdom ^29.1.1`. Pack generation uses Node built-ins.

**Storage**: N/A — movies/casts are in-memory pure-data definitions; media payloads are
inline in bundle modules; net state is per-context in memory. No database.

**Testing**: `vitest run` with the jsdom environment
(`pnpm --filter @project-reborn/director test`), no package-local shims; Worker,
`OffscreenCanvas`, and `AudioContext` are mocked/stubbed in tests; red-green per
constitution Test & Verification Discipline.

**Target Platform**: modern browsers; jsdom for the test suite; Node for the generator.

**Project Type**: library — the single workspace package `@project-reborn/director` with
subpath entry points `.`, `./lingo`, `./browser`.

**Performance Goals**: real-time playback at the movie tempo (default 30 fps) with flat-2D
per-frame rendering; latest-wins `paint` coalescing when the main thread lags. No other
performance targets are specified (out of scope).

**Constraints**: zero runtime dependencies; one worker per movie (isolation); media payloads
inline (no runtime media fetch); binary Director formats and Lingo→JS translation out of
scope; worker never touches the DOM; documented surface only (no fabricated behavior).

**Scale/Scope**: 245 files in the package (193 source / 52 test), ~350 tests; 73 cast slots in
the habbo pack (70 empty) + 89 members in fuse_client; 19 documented media classes; 13 core
objects + 4 scripting objects; the documented top-level method set with an enforced owner
registry; 73 FRs / 14 SCs in the consolidated spec.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Defined Before Built | Every behavior traces to `spec.md` FRs or a consolidation ruling; gaps are fixed via the spec pipeline, never invented | PASS — spec 015 defines all 73 FRs; App. A/B trace sources; gap register is factual, fixes follow spec |
| II. No Silent Interpretation | No unresolved ambiguity before implementation | PASS — 26 consolidation rulings + 2 clarify answers; 0 `[NEEDS CLARIFICATION]` markers |
| III. Specification-Driven Development | Artifacts under `specs/015-director-runtime/`; prioritized, independently testable stories; refactor documents removed patterns | PASS — spec + plan + research + data-model + contracts + quickstart authored; the consistency pass is explicitly the "refactor" and will record code-vs-spec fixes |
| IV. Test & Verification Discipline | Red-green for each fix; no orphaned tests; gate command | PASS — every gap fix gets a failing test first; existing tests asserting superseded behavior are rewritten in the same change |
| V. KISS | Simplest solution satisfying the spec; no added complexity | PASS — fixes stay inside the existing modules/subsystems; no new layers |
| VI. YAGNI | Only spec-mandated behavior; no speculative work | PASS — gap list derives from spec FRs only; no new features |
| VII. SOLID | One concern per class/module/subsystem; dependencies point at abstractions | PASS — context owns state; subsystems own shared concerns; player/browser depend on the handle contract |

No violations; Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/015-director-runtime/
├── spec.md              # Consolidated contract (73 FRs, 14 SCs, 11 stories, R-01..R-27)
├── plan.md              # This file
├── research.md          # Phase 0: decision/rationale/alternatives (13 areas)
├── data-model.md        # Entity catalog + validation + state machine + gap register
├── quickstart.md        # Runnable end-to-end validation guide
├── contracts/           # Interface contracts
│   ├── lingo-public-api.md
│   ├── pack-definition.md
│   ├── player-protocol.md
│   ├── custom-elements.md
│   ├── score-lifecycle.md
│   └── build-plan.md    # Historical build plan/roadmap (moved from docs/)
├── checklists/
│   └── requirements.md  # Spec quality checklist (13/13 passing)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/director/
├── package.json                 # @project-reborn/director; exports . / ./lingo / ./browser
├── vitest.config.js             # jsdom, src/**/__tests__/**/*.test.js
├── scripts/generate-pack.mjs    # 007 generator (cast/movie modes)
└── src/
    ├── index.js                 # root barrel = api + browser
    ├── engine/
    │   ├── base/                # Color/List/PropList/Point/Rect + constants
    │   ├── core/                # 13 X…Object + media/ (19+ classes) + scripting/ (4)
    │   ├── subsystem/           # context, accessor, singletons, score, registries, sprite-hydrate
    │   └── syntax/              # chunk helpers, put-*, the proxy
    ├── api/
    │   ├── index.js             # @/lingo barrel
    │   └── methods/             # one module per method + registry.js (@owner tags)
    ├── pack/                    # movie()/cast() builders (C8 shape)
    ├── player/                  # run, worker-entry/-host/-shim, ingest, event-loop, renderer,
    │                            # canvas, audio, input, external-event, cast-loader, mount
    └── browser/
        ├── index.js             # createContext/destroyContext/resetSingletons + builders
        └── custom-elements/     # <x-object>, <x-embed>, <x-param>
```

**Structure Decision**: Keep the ratified taxonomy (`engine/{base,core,subsystem,syntax}`,
`api/`, `pack/`, `player/`, `browser/`) exactly as FR-006 mandates. The consolidation changes
no package boundaries and adds no modules beyond what gaps require; `run()` remains the single
imperative entry and the custom elements remain a thin wrapper over it.

## Design Decisions (from Phase 0 research)

Full decision records are in [research.md](./research.md). The load-bearing choices:

1. **One worker per movie; context owns all state** (R-02): core-object instances are
   `DirectorContext` consts; a single accessor resolves the active context; worker bootstrap
   installs getter globals before the bundle import. No mutable module slots, no main-thread
   globals.
2. **Real Score + functional sprites** (R-03..R-09): frames/channels/cells/playhead/tempo in
   `engine/subsystem/score.js`; `frameStep()` advances and dispatches; sprites hydrate from
   cells, a puppet register preempts, `hitTest`/constraints are live.
3. **C8 pack contract** (R-16): frozen pure-data definitions with nested `options`,
   `totalCastSlots`, base64 bitmap payloads, name-canonical identity; builders and the
   generator emit the same shape and the ingester validates it.
4. **Player protocol** (R-17..R-21): `run(bundleUrl, {canvas, externalParams})`; queue-until-
   ready; `OffscreenCanvas` primary with `paint` fallback; flat-2D rendering; stage-space input;
   8-channel Web Audio; net relay; `externalEvent` bridge; `gotoNetMovie` tears down and reruns.
5. **Zero-dependency package + jsdom tests** (001 R1): mock Worker/OffscreenCanvas/AudioContext
   at the module boundary; red-green for every behavior.

## Implementation Strategy (brownfield)

The implementation exists and is partially inconsistent with the consolidated contract. Work
is organized so the contract becomes true without regressions:

1. **Baseline & analysis** — freeze current behavior with the test gate, then run
   `/speckit.analyze` against `spec.md`/`plan.md`/`tasks.md` to confirm/extend the gap register
   in `data-model.md` (21 gaps at planning time).
2. **P1 correctness gaps** — player/runtime integrity: `externalEvent` bridge wiring and
   payload shape; `gotoNetMovie` sender + fail-soft; `stopMovie` exactly once; `mount.js` loop
   target; all MT→W messages queued until `ready`; ingest validation (`kind`/`name`/`casts`);
   `halt()` + `updateStage()` real bodies; `externalParamName/Value` snapshot reads.
3. **P1 contract gaps** — lifecycle ordering (R-04: all `beginSprite` then all `endSprite`);
   empty-Score navigation no-ops; Score/lifecycle tests rewritten to the ruling; context
   accessor gaps.
4. **P2 surface gaps** — 19-media-class classification (empty documented stubs; legacy
   `FlashMember` unclassified); owner-registry categories and audit; `the.movieName` tracking;
   `newMember` registration; scripting-object surfaces; `xtra()` casing.
5. **P2/P3 player & browser gaps** — paint fallback draws the frame and is re-dispatched;
   `SoundObject.channel` reaches the Web Audio graph; custom-element event relay; element ≡
   `run()` equivalence; stale worker-subpath reference; legacy `cast-loader` statics removed or
   repaired to FR-057 semantics.
6. **Client verification** — after the gate is green, verify behavior against the real client
   point by point (per the user's plan); any further spec deviations re-enter via the pipeline
   (spec first, then plan/tasks if scope moves).

Every fix: write/adjust the failing test first (red), implement the minimal change, re-run the
package gate, and keep the archived rationale in mind (spec wins over code; archive explains
why).

## Verification Gates

- `pnpm --filter @project-reborn/director test` — the package gate; must end green with no
  pre-existing failures (SC-014).
- Entry-point import audit from a fresh process (SC-013).
- Owner-registry audit equals the method file set (SC-008).
- Pack conformance + habbo/fuse_client ingest (SC-010).
- Player protocol/lifecycle/render/input/audio/net/externalEvent integration tests under the
  mocked-worker harness (SC-011).
- Custom-element equivalence test (SC-012).
- `/speckit.analyze` after tasks: no CRITICAL constitution or coverage findings.
- Client verification pass (manual/point-by-point) after the gate is green.

## Complexity Tracking

> No constitution violations. No complexity to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
