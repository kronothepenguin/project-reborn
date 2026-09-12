# Tasks — Engine Subsystem + Score

**Branch**: `004-engine-subsystem` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Method**: red-green TDD (vitest + jsdom). Each task group: write tests first (RED gate,
failures observed) → implement (GREEN gate). Full gate after each group:
`pnpm --filter @project-reborn/director test`. Phase boundaries: commit as a logical
group AFTER user review of the summary.

## Phase 0 — Baseline

- [x] T001 [BLK] [US4] Run the full gate and record baseline (16 files / 147 tests green, git clean). Confirm `_resetSingletons`/`_installSingletons` current surface for the extension.
- [x] T002 [BLK] [US4] Inventory registries + context public surface for the ported tests (record in research.md additions if surface changed — none expected).

## Phase 1 — Score subsystem (US2; RED)

- [x] T003 [RED] [US2] Create `src/engine/subsystem/__tests__/score.test.js` — construction/normalization: frames array → normalized `{ marker, channels }`; sparse object + array channel forms; markerless frames; channels > 48 truncated; tempo default 30.
- [x] T004 [RED] [US2] Same file — playhead: `frame` getter 0 with no frames, 1 at first frame; `advance()` steps + clamps at last frame (hold); empty-score advance no-op.
- [x] T005 [RED] [US2] Same file — tempo: `setTempo` mutation live; clamp `Math.max(1, floor(n))` (0/negative/float).
- [x] T006 [RED] [US2] Same file — navigation R6: `go(n)` clamp [1..len]; `go("marker")` first match; unknown → no-op; `goLoop`/`goNext`/`goPrevious` per verbatim docs (marker sets: none / current has marker / current markerless / no left markers / no right markers / no markers at all).
- [x] T007 [RED] [US2] Same file — channels: `channel(n)` current-frame cell / null; `channel(0)` → STAGE; `populatedChannels()` ascending; `markers()` derived index.

## Phase 2 — Context + singletons (US1/US4; RED)

- [x] T008 [RED] [US1+US4] Create `src/engine/subsystem/__tests__/context.test.js` — ownership: 7 singletons, 3 registries, score; options (name/src/tempo/width/height/castLibs/externalParams frozen); defaults.
- [x] T009 [RED] [US1] Same file — activate dual binding: `_movie…_global` slots + `globalThis` slots = context instances; last-activate-wins detaches first; `_score` slot = context score; globalThis has no `_score`.
- [x] T010 [RED] [US1] Same file — destroy idempotent: double-destroy no-op; loop handle stop called; audioContext.close called; canvas null; no events after destroy.
- [x] T011 [RED] [US4] Create `src/engine/subsystem/__tests__/member-registry.test.js` — register (auto/explicit numbers), lookup by number/name-in-castLib/name-in-movie (declaration order, first match), unregisterAll cleanup incl. cross-castLib name list.
- [x] T012 [RED] [US4] Create `src/engine/subsystem/__tests__/net-state.test.js` — begin/update/isDone/isError/textResult/mime/lastModDate/streamStatus/abort/forget/gotoNetMoviePending take/clear.
- [x] T013 [RED] [US4] Create `src/engine/subsystem/__tests__/window-registry.test.js` — register/unregister/lookup/list/frontWindow/moveToFront/moveToBack/reset; two registries isolated.
- [x] T014 [RED] [US1] Create `src/engine/subsystem/__tests__/singletons.test.js` — defaults exist (incl. `_score`), `_installSingletons(ctx)` rebinds all 8, `_resetSingletons` restores.

## Phase 3 — Lifecycle + the-wiring (US3; RED)

- [x] T015 [RED] [US3] Create `src/engine/subsystem/__tests__/lifecycle.test.js` — `frameStep()` dispatch order (empty score): frame events only; `frame` in detail reflects advance.
- [x] T016 [RED] [US3] Same file — populated score: beginSprite/endSprite per channel ascending, both fired per tick, `{ channel, cell }` in detail; enterFrame→beginSprite→endSprite→exitFrame nesting.
- [x] T017 [RED] [US3] Same file — idle/timeout hooks dispatch (idle on tick, timeout on threshold model per 001).
- [x] T018 [RED] [US3] Create `src/engine/syntax/__tests__/the-score-wiring.test.js` — the-proxy × context: after `activate(ctx)` with a score, `the.frame` / `the.frameLabel` / `the.frameTempo` read live (advance via score, tempo via puppetTempo/setTempo); empty-score defaults (0 / "" / 30); still read-only (writes throw).

## Phase 4 — Movie bridge (R2; RED)

- [x] T019 [RED] [R2] Create `src/engine/core/__tests__/movie-score-bridge.test.js` — with an activated context score: `_movie.go(n|"marker")`, `_movie.goLoop/goNext/goPrevious`, `_movie.puppetTempo(n)` reach the Score (frame/tempo assertions).

## Phase 5 — Implement GREEN (all of the above in dependency order)

- [x] T020 [GRN] Implement `score.js` (R1/R6/R7/R8) — GREEN gate for T003–T007.
- [x] T021 [GRN] Extend `singletons.js` (`_score` slot, install, reset) — GREEN gate T014.
- [x] T022 [GRN] Extend `context.js` (`score`, `frameStep`, `beginSprite`, `endSprite`) — GREEN gate T008–T010, T015–T017.
- [x] T023 [GRN] Rewire `the-proxy.js` (score kind + 3 rows) — GREEN gate T018 + full 005 suite still green (the-proxy tests assert frameTempo not-undefined, not value; verify).
- [x] T024 [GRN] Wire 5 `MovieObject` bodies — GREEN gate T019 + full suite.
- [x] T025 [GRN] Full gate: all files (002 base +005 syntax + 004 subsystem) green; verify `src/engine/syntax/index.js`, `src/api/index.js`, `src/browser/index.js` diff-free; `globalThis` untouched by the-proxy (no leak) re-asserted by surface test.

## Phase 6 — Docs + review

- [x] T026 [DOC] Update `docs/shockwave-player-runtime.md` status table (004 ✅) + 005's "score-backed values wired in 004" cross-reference note; write `quickstart.md` (per-construct test scenarios mirroring the vitest suite).
- [x] T027 [REV] Present implementation + test summary to the user for review BEFORE any commit (review-before-commit workflow).

## Inventory

| File | Action |
|---|---|
| `src/engine/subsystem/score.js` | NEW |
| `src/engine/subsystem/context.js` | EXTEND (score/frameStep/beginSprite/endSprite) |
| `src/engine/subsystem/singletons.js` | EXTEND (`_score` slot) |
| `src/engine/syntax/the-proxy.js` | REWIRE (3 rows + score kind) |
| `src/engine/core/movie.js` | WIRE (5 method bodies) |
| `src/engine/subsystem/__tests__/{score,context,member-registry,net-state,window-registry,singletons,lifecycle}.test.js` | NEW |
| `src/engine/syntax/__tests__/the-score-wiring.test.js` | NEW |
| `src/engine/core/__tests__/movie-score-bridge.test.js` | NEW |
| `specs/004-engine-subsystem/{spec,plan,research,data-model,tasks,quickstart}.md` + `contracts/lifecycle.md` | docs |
| `docs/shockwave-player-runtime.md` | UPDATE status |