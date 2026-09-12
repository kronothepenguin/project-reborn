# Tasks — 008 Player (Runner) + 007 pack contract slice

**Branch**: `008-player` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Method**: red-green TDD (vitest + jsdom, Worker/AudioContext/OffscreenCanvas mocks per 001 research R1). Each task group: write tests first (RED) → implement (GREEN). Full gate after each group: `pnpm --filter @project-reborn/director test`. Commit as a logical group AFTER user review.

## Phase A — Runner-core (US1; R1/R2/R3/R7)

- [x] T001 [RED] [US1/R1] `src/player/__tests__/worker-shim-globals.test.js` — installGlobals puts frozen getters for the 7 singleton names + `the` + a few sample barrel methods; reading `_movie` returns the active context's object; writes silently fail (frozen); no `_movie =` assignment possible.
- [x] T002 [RED] [US1/R2] `src/player/__tests__/ingest.test.js` — ingestDefinition: builds casts from C8 shape (populated + empty slots), fills member registry (name canonical, number = order), sets score from `score` section, activates.
- [x] T003 [RED] [US1/R3] `src/player/__tests__/event-loop.test.js` — loop rewired to `ctx.frameStep()`; per-tick order (advance→prepareFrame→enterFrame→beginSprite→endSprite per channel→exitFrame); tempo re-arm; start/stop/resume; tempo clamp.
- [x] T004 [RED] [US1/R7] `src/player/__tests__/run.test.js` — mock Worker; run(bundleUrl) message flow init→(import)→ready→start; inline MovieDefinition accepted; stop/destroy idempotent; invalid bundle → error.
- [x] T005 [GREEN] [US1] Implement worker-shim globals (R1), ingester (R2), event-loop rewiring (R3), run()/handle (R7). Gate green.

## Phase B — Score-rendering (US2; R4)

- [x] T010 [RED] [US2] `src/player/__tests__/renderer.test.js` — populated channels ascending draw order; loc/size/visibility flat-2D; empty frame clears to bgColor; member media drawn (fixture image/bitmap); updateStage sync re-render.
- [x] T011 [RED] [US2] Same file — fallback path: render produces ImageData + `{kind:"paint"}` messages with seq; latest-wins coalescing (backpressure).
- [x] T012 [GREEN] [US2] Implement renderer (R4) + wire loop hook + updateStage. Gate green.

## Phase C — Input/audio/net/events (US3/4/5; R5/R6/R9)

- [x] T020 [RED] [US3/R6] `src/player/__tests__/input.test.js` — keydown/keyup/mousedown/mouseup/mousemove/focus/blur → _key/_mouse fields; coordinate translation to stage space (scaled, y-flipped); out-of-stage clamp.
- [x] T021 [RED] [US4/R5] `src/player/__tests__/audio.test.js` — stubbed AudioContext; 8 channels wired with gain+pan; play(member) decode+connect; setVolume/pan; fadeIn/Out ramps over ticks; decode failure → idle no-throw.
- [x] T022 [RED] [US5/R9] `src/player/__tests__/net-relay.test.js` — goToNetMovie/goToNetPage relay messages to MT; externalEvent → CustomEvent on handle with {name,args}; net-* work in-worker (006 semantics).
- [x] T023 [GREEN] [US3/4/5] Implement input (R6), audio (R5), relay+events (R9). Gate green.

## Phase D — Pack contract + ingestion (US6; R8/R10)

- [x] T030 [RED] [US6/R8] `src/player/__tests__/cast-loader.test.js` — definition-shape load: `{kind:"cast", name, members[]}`; member registry name canonical / number order; empty casts.
- [x] T031 [RED] [US6/R10] `src/pack/__tests__/builder-shape.test.js` — movie().cast().score().build() conforms to C8 (frozen); cast().member() shape; PNG inline base64 payload.
- [x] T032 [RED] [US6] `src/player/__tests__/ingest-habbo.test.js` — fixture faithful to habbo Casts.csv: 73 casts populated 1-2 + 70 empty; member("Logo") resolves; score section ingested (tempo/frames).
- [x] T033 [GREEN] [US6] Cast-loader alignment (R8); builder conform (R10a); generate habbo + fuse_client packs via generator script (R10b); gate green.

## Phase E — Docs + review + commit

- [x] T040 [DOCS] Update `docs/shockwave-player-runtime.md` status table (008/007 rows).
- [x] T041 [DOCS] Write `specs/008-player/quickstart.md`.
- [x] T042 [REVIEW] Present implementation + test summary to user — NO commit before review (workflow).
- [x] T043 [COMMIT] Commit 008 + 007-slice, review-approved.