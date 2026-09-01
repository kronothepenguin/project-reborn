# Tasks — 006 API (Method Surface × Active-Context Ownership + Palette + value() + Singleton Retirement)

**Branch**: `006-api` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

**Method**: red-green TDD (vitest + jsdom). Each task group: write tests first (RED gate,
failures observed) → implement (GREEN gate). Full gate after each group:
`pnpm --filter @project-reborn/director test`. Phase boundaries: commit as a logical
group AFTER user review of the summary. 002/004/005 committed tests (209) must stay green
(excluding the retirement-rewrite surface, recorded).

## Phase 0 — Method audit & owner table (research, no code)

- [x] T001 [RESEARCH] [US2/C2] Parse `director_core_objects.txt` Method-summary sections → owner map (movie/player/sound/key/mouse/system/global/member/castLib/sprite/channel/window/net/top).
- [x] T002 [RESEARCH] [US1/C1] Diff `methods.txt` top-level callables vs existing 108 files vs owner map → missing/extra/wrong list.
- [x] T003 [RESEARCH] [US1/C1] Per-file docs-vs-body audit → WRONG list (delete+recreate candidates; e.g. color.js single-arg gray, value.js non-evaluating). Record all in `research.md`.

## Phase 1 — Accessor + singleton retirement (US2/US3; RED)

- [x] T010 [RED] [US2] `engine/subsystem/__tests__/accessor.test.js` — getActiveDirectorContext/set; default null; activate() sets it; destroy() clears it.
- [x] T011 [RED] [US2] Rewrite `singletons.test.js` to the retired shape — active-context getters return `ctx.movie` etc.; no-context → default instances (fresh per module); `_score` still internal.
- [x] T012 [RED] [US2] Rewrite 004/005 consumers: `context.test.js`, `movie-score-bridge.test.js`, `the-score-wiring.test.js`, `browser` — bind contexts directly; delete `_installSingletons`/`_resetSingletons` imports.
- [x] T013 [GREEN] [US2] Implement `accessor.js`; retire `singletons.js` mutable exports; flip `api/index.js` singleton re-exports; `the`-proxy imports accessor; `browser/index.js` rewrite.
- [x] T014 [GREEN] [US2] Gate green (209 minus rewrites, fully green after Phase 1).

## Phase 2 — Method corrections (C1; RED)

- [x] T020 [RED] [US1] Recreate each WRONG-listed method file corrected per docs with owner header: per-method pure/math tests first (abs/integer/charToNum/bitAnd/min/max/random/sqrt/sin/cos/atan/string/float).
- [x] T021 [RED] [US5] `value()` expression engine tests (arithmetic, "3 5"→3, "penny"→VOID, TRUE/FALSE/EMPTY, "#sym"→symbol, bracketed list string→list, quoted→string, syntax-error→leading portion).
- [x] T022 [RED] [US5] `symbol()/ilk()/*P` predicate tests (ilk(3)→"integer", ilk(liveList)→"list", symbol("#hop"), integerP/objectP/listP/stringP/symbolP/floatP/voidP matrix).
- [x] T023 [GREEN] [US1] Corrected method bodies (delete+recreate per C1) + `value.jsz` expression engine (R7, no eval) + `symbol()/ilk()` + predicates.

## Phase 3 — Palette + creators (C5/C6; RED)

- [x] T030 [RED] [US4] `engine/base/color.js` palette-form tests: color(137) → {paletteIndex:137, rgb:pal[137]}; palette truncation 0–255; RGB form; PALETES symbols (#systemMac/#rainbow/#grayscale…); `rgb()` absent.
- [x] T031 [RED] [US4] Creator-method tests: barrel `color/list/point/propList/rect` re-export FROM `.methods/`, NOT engine/base; identical function identity.
- [x] T032 [GREEN] [US4] Implement palette form + built-in PALETES + creator method files; flip barrel creators to `.methods/`.
- [x] T033 [GREEN] [US4] Gate green (full suite, 209 + new).

## Phase 4 — Ownership registry + tag audit (C2; RED)

- [x] T040 [RED] [US2] `api/methods/registry.js` tests: owner map matches file set; every file has the `// @owner` header; header matches registry; no unknown owner.
- [x] T041 [RED] [US2] Per-owner delegation tests: movie (go/marker/label…), player (alert/quit/appMinimize…), sound (beep), key (flushInputEvents), mouse, system, global (clearGlobals), net (fail-soft), member/castLib/sprite/window.
- [x] T042 [GREEN] [US2] Add `registry.js` owner map; stamp owner headers on all 108 files; audit test.

## Phase 5 — Net fail-soft + no-context neutrals (C3/C4; RED)

- [x] T050 [RED] [US3] Net fail-soft tests: fetch rejects → Error tx, netDone()=true, netError()truthy, netTextResult()=""; fetch 404 → "HTTP 404"; success → text; netAbort(unknown) → no-op.
- [x] T051 [RED] [US2] No-context neutral tests: every stateful method with no ctx returns its neutral (movie→null, sound→null, member→null, key→false…); never throws.
- [x] T052 [GREEN] [US3] Net catch/reject wiring (C3) + per-owner neutral map (R8); gate green.

## Phase 6 — Docs + review + commit

- [x] T060 [DOCS] Update `docs/shockwave-player-runtime.md` roadmap status table (006 row), 005 cross-reference re singletons-retirement.
- [x] T061 [DOCS] Write `specs/006-api/quickstart.md` (test scenarios mirroring the vitest suite).
- [x] T062 [REVIEW] Present implementation + test summary to the user — NO commit before review (workflow commitment).
- [x] T063 [COMMIT] Commit 006 (spec/plan/research/tasks + code + tests + docs), review-approved.