# Tasks: Director Engine Base — 002-engine-base

**Input**: Design documents from `/specs/002-engine-base/` (plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/library-lingo-api.md)

**Branch**: `002-engine-base` | **Package**: `@project-reborn/director` at `packages/director/` | **Repo root**: `/mnt/media/Projects/habbo`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md R1–R5 (port/constants/broken-import/test-strategy tables), data-model.md (member-surface source of truth), contracts/library-lingo-api.md (002 export set + boundaries), quickstart.md (8 validation scenarios).

**Tests**: MANDATORY per FR-010 (red-green: write tests first, observe FAIL, then implement). Gate: `pnpm --filter @project-reborn/director test` (vitest, jsdom env, `include: ["src/**/__tests__/**/*.test.js"]`). 7 new test files replace the 132 deleted stale ones (US4).

**Organization**: Phases are ordered by EXECUTION DEPENDENCY, not by story priority: Setup → Foundational (which delivers the US4 cleanup scope and the US3 stabilization scope as the blocking prerequisites — see "US3 & US4 delivery note" and the dependency section for why these two stories physically execute before US1/US2 even though US4 is P2) → US1 → US2 → Polish. The 7 new test files are written inside Foundational BEFORE the import repairs, per research.md R4, so every new test is observed red at write time (module-resolution red), then red on behavior, then green.

## Format: `- [ ] [TaskID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: `[US1]`/`[US2]` labels appear ONLY in user-story phases (rule: none in Setup/Foundational/Polish). US3/US4 scope executes unlabeled inside Foundational.
- Checkpoints end every phase; stop there and validate before continuing.
- All paths are repo-root-relative under `packages/director/` unless noted.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish and record the agreed test/package baseline before any deletion or repair. Both tasks are read-only verification (no edits in this phase — the actual `vitest.config.js` edit is T005 in Foundational).

- [ ] T001 [P] Verify the current state of `packages/director/vitest.config.js` and record the target state: `environment: "jsdom"` and `include: ["src/**/__tests__/**/*.test.js"]` stay UNCHANGED; `setupFiles: ["./src/__test-shims__/index.js"]` is the one item to be removed (in T005). No other edits.
- [ ] T002 [P] Verify `packages/director/package.json`: `"type": "module"`, exports map (`.` → `./src/index.js`, `./lingo` → `./src/api/index.js` (amended 2026-08-31), `./browser` → `./src/browser/index.js`), devDependencies `vitest ^4.1.8` + `jsdom ^29.1.1`, script `"test": "vitest run"`. Only the `./lingo` target changed with the layer restructure; nothing else.

**Checkpoint**: Baseline recorded — vitest target state (jsdom, no setupFiles) and package.json no-change confirmed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Unblock everything in the exact order research.md R4 mandates: (a) **Block A0 — layer restructure** (user directive; folders renamed to the layer taxonomy so folders reflect where they belong; DONE at plan-amendment time, verified here); (b) US4 scope — remove all stale tests/shims/dead trees so the suite is a clean slate; (c) write the 7 new test files and OBSERVE RED on all of them; (d) US3 scope — repair every broken import against the layer layout so the package imports cleanly; (e) observe the intermediate state (entry-points/point/rect green, behavior tests still red). **No user story work can begin until this phase is complete.**

### Block A0 — Layer layout (user directive, executed with the 2026-08-31 plan amendment)

The source folders are renamed to match the layer taxonomy (base/core/subsystem/syntax/api/player/pack/browser). Complete via `git mv` (history preserved). Marked `[x]`: already executed; verify each item.

- [x] T002a [P] Rename folders to the layer layout via `git mv`: `src/engine/types` → `src/engine/base` (+ `src/runtime/constants.js` → `src/engine/base/constants.js`), `src/engine/objects` → `src/engine/core`, `src/runtime/subsystems/*` → `src/engine/subsystem` (+ `src/runtime/context.js`, `src/runtime/singletons.js`), `src/runtime/syntax` → `src/engine/syntax`, `src/lingo` → `src/api` (index + methods), `src/runtime/package` → `src/pack`, `src/runtime/player` → `src/player`, `src/player/custom-elements/` → `src/browser/custom-elements/`. Also delete the legacy re-export shim `src/player/custom-elements.js` (its `player/custom-elements/index.js` target no longer exists — the browser layer owns custom elements).
- [x] T002b [P] Delete `src/runtime/index.js` — the old internal barrel is superseded by `src/api/index.js`; `src/runtime/` now holds only the to-be-deleted stale `__tests__/`.
- [x] T002c [P] Update `packages/director/package.json` exports map: `"./lingo": "./src/lingo/index.js"` → `"./lingo": "./src/api/index.js"` (public subpath name `@/lingo` unchanged).
- [x] T002d [P] Update `packages/director/src/index.js` root barrel: `export * from "./lingo/index.js"` → `export * from "./api/index.js"`.
- [x] T002e [P] Update `packages/director/AGENTS.md`: Architecture section rewritten to the layer taxonomy; "Test Shims" section removed (jsdom-only environment).

**Checkpoint**: layout matches the layer taxonomy; package wiring (exports map, root barrel, AGENTS.md) reflects it.

### Block A — US4 scope: test cleanup (spec FR-009; first executable work)

- [ ] T003 Delete all 132 stale `*.test.js` files in `packages/director/src` — the 9 `__tests__` directories, verified counts: `src/__tests__/` (1: `public-barrels.test.js`), `src/engine/base/__tests__/` (5), `src/api/methods/__tests__/` (106), `src/runtime/__tests__/` (3), `src/pack/__tests__/` (1), `src/player/__tests__/` (4), `src/browser/custom-elements/__tests__/` (1), `src/engine/subsystem/__tests__/` (3), `src/engine/syntax/__tests__/` (8). DELETE, never patch or adapt (FR-009: revival = fresh rewrite only). Do not touch any non-test source file.
- [ ] T004 [P] Delete `packages/director/src/__test-shims__/` entirely (4 files: `index.js`, `worker-shim.js`, `audio-context-shim.js`, `offscreen-canvas-shim.js`) — spec-ordered (clarify session; spec line 17). Browser-like behavior in tests comes only from the jsdom environment.
- [ ] T005 [P] Edit `packages/director/vitest.config.js`: remove the `setupFiles: ["./src/__test-shims__/index.js"]` line; keep `environment: "jsdom"` and the include pattern as recorded in T001.
- [ ] T006 [P] Delete the dead tree `packages/director/src/engine/packaging/` (2 stale stub files `cast-library.js`, `movie.js` returning `{}`) — zero importers verified; absent from the target layout (plan.md Project Structure).
- [ ] T007 [P] Delete the dead scaffold tree `packages/director/architecture/` (4 files under `architecture/core/`) — zero importers verified; not in the target layout.
- [ ] T008 [P] Docs touch-up in `packages/director/AGENTS.md` — EXECUTED with T002e (Block A0); verify no stale references remain: no `runtime/objects/`, `runtime/methods/`, `runtime/package/`, `runtime/syntax/`, `__test-shims__`, `engine/types/`, `engine/objects/` mentions in the Architecture/rules/test sections.
- [ ] T009 Run `pnpm --filter @project-reborn/director test` and confirm vitest finds ZERO test files (expect the "no test files" exit — record it as the clean-slate baseline) and that `src/__test-shims__/` no longer exists.

**Checkpoint**: Clean slate — 132 stale tests + 4 shims + 2 dead trees gone; vitest config in agreed target state (jsdom, no setupFiles); no stray references to the pre-refactor layout.

### Block B — Write the 7 new test files, then observe RED (FR-010)

All 7 files import the documented surface THROUGH the lingo barrel (`src/api/index.js`) so that at write time the still-broken barrel produces observable module-resolution red (research.md R4 step 2→3), and after repair the same files exercise the real behavior. Write exactly these files; do not add any other test file.

- [ ] T010 [P] Write `packages/director/src/engine/base/__tests__/color.test.js` — import `Color` from `../../../api/index.js`; assert per data-model.md Color table + quickstart scenario 2/3: prototype surface is exactly `red`/`green`/`blue` (get/set, `Object.getOwnPropertyNames(ctor.prototype)` minus `constructor`, no `hex`/`rgb`/`equals`); constructor and setter truncation to integer 0–255 (negative, >255, fractional — e.g. `new Color(-5, 300, 12.9)` → `0,255,12`); defaults `(0,0,0)`.
- [ ] T011 [P] Write `packages/director/src/engine/base/__tests__/list.test.js` — import `List` from `../../../api/index.js`; assert per data-model.md List table + quickstart scenario 4: 1-based `getAt`/`addAt`; unsorted `add` appends; `sort()` → typed alphanumeric order (numbers before strings) and sets `sorted = true`; sorted `add` inserts at proper position; `setAt` beyond end pads blanks with `0` (D-2); `deleteAt` on position < 1 or > count is a NO-OP; `deleteOne` deletes first occurrence only; `duplicate()` independence (nested deep copy); `getLast()` on empty → `null` (VOID, D-3); `getAt`/bracket read out of range THROWS; bracket write → `setAt` semantics; `getOne`/`getPos` absent → 0; `count`.
- [ ] T012 [P] Write `packages/director/src/engine/base/__tests__/prop-list.test.js` — import `PropList` from `../../../api/index.js`; assert per data-model.md PropList table + quickstart scenario 5: `addProp` appends when unsorted and CREATES a duplicate entry when the property already exists; `getaProp`/`findPos` missing → `null` (VOID); `getProp`/`getPropAt` missing → THROW; bracket read of a missing property (`pl["zzz"]`, symbol keys) → THROW while class members (`count`, `entries`, methods) still resolve; bracket write of a missing property ADDS it; dot-write only for existing; `setaProp` replaces and adds-when-absent; `setAt` position > count → THROW; `deleteProp` deletes first entry with that name only; `deleteOne` deletes the entry whose VALUE matches (property+value); `getOne` returns the PROPERTY (absent → 0); `getPos` absent → 0; `sort()` alphabetical by property names; `findPosNear` returns a 1-based position by alphanumeric order (D-4, no Levenshtein); `count`.
- [ ] T013 [P] Write `packages/director/src/engine/base/__tests__/point.test.js` — import `Point` from `../../../api/index.js`; assert per data-model.md Point table + quickstart scenario 6: `locH`/`locV` plain fields with constructor defaults `(0,0)`; list-syntax read/write `pt[1]` ↔ `locH`, `pt[2]` ↔ `locV`. Expect GREEN after stabilization (port — no source changes, R5).
- [ ] T014 [P] Write `packages/director/src/engine/base/__tests__/rect.test.js` — import `Rect` from `../../../api/index.js`; assert per data-model.md Rect table + quickstart scenario 6: `left`/`top`/`right`/`bottom` fields, defaults `(0,0,0,0)`; list-syntax `r[1]`..`r[4]` ↔ left, top, right, bottom; width is consumer-derived (`r.right - r.left` ≡ `r[3] - r[1]`) and `width`/`height` are ABSENT members (no `"width" in r`). Expect GREEN after stabilization (port — no source changes, R5).
- [ ] T015 [P] Write `packages/director/src/engine/base/__tests__/constants.test.js` — import all 11 constants from `../../../api/index.js`; assert the data-model.md constants table + quickstart scenario 7: `EMPTY === ""`, `VOID === null`, `RETURN === "\r"`, `SPACE === " "`, `TAB === "\t"`, `BACKSPACE === "\b"`, `ENTER === "\x03"`, `QUOTE === '"'`, `TRUE === true`, `FALSE === false`, `PI === Math.PI`; numeric coercion `Number(FALSE) === 0` and `Number(TRUE)` nonzero.
- [ ] T016 [P] Write `packages/director/src/__tests__/entry-points.test.js` — import all three public entries fresh (`../index.js`, `../api/index.js`, `../browser/index.js`); assert zero module-resolution errors, no import-time side effects, no context activation required (FR-007/FR-008; contracts testability section); surface presence from `@/lingo`: 5 classes (`Color`, `List`, `PropList`, `Point`, `Rect`), 11 constants, 7 singletons (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`), 12 syntax stand-ins, plus spot-checked method exports (e.g. `go`, `beep`, `halt`); boundary absences: the 5 creator functions `color`/`list`/`point`/`propList`/`rect` are NOT exported from `@/lingo` (006 boundary, contract §Removed), and `defineMovie`/`defineCast` are NOT exported from `../browser/index.js`. Replaces the deleted `public-barrels.test.js` coverage, expressed fresh (FR-009).
- [ ] T017 Run `pnpm --filter @project-reborn/director test` at `packages/director/` and OBSERVE RED: all 7 new test files fail to load with module-resolution errors (pre-repair imports: `src/api/index.js` → `../runtime/methods/*` + `../runtime/{constants,syntax,singletons}`, `src/api/methods/*` → `../singletons.js` / `../types/*` / `../objects/*`, `src/engine/core/index.js` → `../types/*`, `src/browser/index.js` → `../runtime/creators/*`). Record the failure output — this is the FR-010 red evidence for the US1/US2/US3 tests at write time (research.md R4 step 3). Do not fix anything yet.

**Checkpoint**: 7 in-scope test files exist; suite is RED with zero pre-existing noise (the 132 are gone). Clean-slate red recorded.

### Block C — US3 scope: stabilization (import-path repair against the layer layout — no rewrites; resolver-driven per research.md R3 table; 42 source files)

- [ ] T018 [P] Fix `packages/director/src/api/index.js`: the method re-exports resolve to `./methods/<X>.js` (all 107 targets exist); fix the remaining stale imports — `../runtime/constants.js` → `../engine/base/constants.js`, `../runtime/syntax/index.js` → `../engine/syntax/index.js`, `../runtime/singletons.js` → `../engine/subsystem/singletons.js`, and `../engine/types/*` → `../engine/base/*`; REMOVE the 5 creator re-exports (`color`, `list`, `point`, `propList`, `rect` — deferred to 006, contract §Removed); ADD 5 class exports from `../engine/base/{color,list,prop-list,point,rect}.js`.
- [ ] T019 [P] Fix `packages/director/src/browser/index.js`: change `../runtime/creators/movie.js` → `../pack/movie.js` and `../runtime/creators/cast.js` → `../pack/cast.js`; REMOVE the dangling `defineMovie`/`defineCast` exports (their modules were deliberately deleted by the 001 refactor, refactor.md 211–227; contract §Removed); remaining exports (`createContext`, `destroyContext`, `resetSingletons`, `registerCustomElements`, `_createMovie`, `movie`, `cast`) unchanged.
- [ ] T020 [P] Fix `packages/director/src/engine/core/index.js`: the 5 type re-exports `../types/X.js` → `../base/X.js`; the 13 object re-exports `./X.js` are already correct within the layer.
- [ ] T021 [P] Fix `packages/director/src/engine/subsystem/context.js`: 7 × `./objects/<X>.js` → `../core/<X>.js` (verify any further stale imports by resolver — e.g. `./types/*` → `../base/*`, player/syntax references → `src/player` / `src/engine/syntax`).
- [ ] T022 [P] Fix `packages/director/src/engine/subsystem/singletons.js`: 7 × `./objects/<X>.js` → `../core/<X>.js`.
- [ ] T023 [P] Fix `packages/director/src/player/cast-loader.js`: `../objects/cast-library.js` → `../engine/core/cast-library.js`.
- [ ] T024 [P] Fix `packages/director/src/engine/syntax/the-proxy.js`: `../objects/cast-library.js` → `../core/cast-library.js`.
- [ ] T025 [P] Fix the singleton import in 12 method files under `packages/director/src/api/methods/`: `../singletons.js` → `../../engine/subsystem/singletons.js` in `alert.js`, `appMinimize.js`, `beep.js`, `beginRecording.js`, `breakLoop.js`, `callFrame.js`, `castLib.js`, `cursor.js`, `delay.js`, `externalParamName.js`, `externalParamValue.js`, `flushInputEvents.js`.
- [ ] T026 [P] Fix the singleton import in the remaining 12 method files under `packages/director/src/api/methods/`: `../singletons.js` → `../../engine/subsystem/singletons.js` in `go.js`, `goLoop.js`, `goNext.js`, `goPrevious.js`, `halt.js`, `idleLoadDone.js`, `insertFrame.js`, `marker.js`, `quit.js`, `sound.js`, `sprite.js`, `stopEvent.js`.
- [ ] T027 [P] Fix the types import in 10 method files under `packages/director/src/api/methods/`: `../types/<X>.js` → `../../engine/base/<X>.js` in `color.js`, `flashToStage.js`, `list.js`, `listP.js`, `makeSubList.js`, `max.js`, `min.js`, `point.js`, `propList.js`, `rect.js`. IMPORT FIXES ONLY — the 5 creator modules (`color`, `list`, `point`, `propList`, `rect`) stay dormant with no behavior work (006 owns them; contract §Removed).
- [ ] T028 [P] Fix `packages/director/src/api/methods/ilk.js`: 5 × `../types/*.js` → `../../engine/base/*.js` and 7 × `../objects/*.js` (including `../objects/index.js`) → `../../engine/core/*.js`.
- [ ] T028a [P] Resolver pass over `packages/director/src/player/*`: `worker-shim.js` (`../context.js` → `../engine/subsystem/context.js`) and any other stale imports in `mount.js`, `event-loop.js`, `canvas.js`, `script-lifecycle.js` resolve against the layer layout (objects → `../engine/core/*`, subsys → `../engine/subsystem/*`, syntax → `../engine/syntax/*`, types → `../engine/base/*`); no behavior changes.
- [ ] T029 Run `pnpm --filter @project-reborn/director test` and OBSERVE the intermediate state: `src/__tests__/entry-points.test.js`, `point.test.js` and `rect.test.js` now GREEN (imports repaired; point/rect are correct ports, R5); `color.test.js`, `list.test.js`, `prop-list.test.js`, `constants.test.js` still RED on behavior assertions (undocumented `hex`/`rgb`/`equals` present; sort comparator coercion; `getAt`/`deleteAt`/`getLast` semantics; prop-list proxy + VOID sentinels + `findPosNear` + `setAt`; `BACKSPACE` `"3"` ≠ `"\b"`). Record this as the second (behavior) red observation.

**Checkpoint**: Foundation ready — all three public entries import with zero module-resolution errors (SC-004); the US3 regression test (entry-points) is green; the 4 behavior-pending test files are red with recorded evidence; no stale tests remain; the only `package.json` change is the `./lingo` export target (`src/api/index.js`, amendment) (SC-005/SC-007 partially gated).

---

## Phase 3: User Story 1 — Director Data-Types (Priority: P1)

**Goal**: The five data-type classes expose exactly their documented member surface and behavior per the Director MX 2004 reference (FR-001…FR-004); the 5 pre-written type test files (T010–T014) go red → green.

**Independent Test**: `pnpm --filter @project-reborn/director test` — the 5 files under `packages/director/src/engine/base/__tests__/` pass, exercising every documented operation with doc-defined expected results, including the quickstart scenarios 2–6 surface audit.

### Tests for User Story 1 (written in Foundational — T010–T014; red observed at T017/T029)

> Per FR-010 the tests already exist and are red; this phase re-confirms the red leg before any implementation.

- [ ] T030 [US1] Run `pnpm --filter @project-reborn/director test` and confirm the red state: `color.test.js`, `list.test.js`, `prop-list.test.js` FAIL on behavior while `point.test.js`/`rect.test.js` are already green — pre-implementation red leg for US1 (FR-010 evidence). Record the failing assertions.

### Implementation for User Story 1

- [ ] T031 [P] [US1] Fix `packages/director/src/engine/base/color.js`: remove the undocumented `hex` getter, `rgb` getter, `equals()` method, and the `toHex2` helper plus their JSDoc blocks (clarify Q1, FR-004, research R5); keep the clamping logic intact (`Math.trunc` + 0/255 clamp on construction AND on the `red`/`green`/`blue` setters) and the verbatim JSDoc of the remaining members; keep `_red/_green/_blue` implementation fields (D-1).
- [ ] T032 [P] [US1] Fix `packages/director/src/engine/base/list.js` (port-with-fixes, R5): (a) `sort()` comparator becomes typed — numbers sort BEFORE strings, strings lexicographic by initial letters, no raw JS `<`/`>` coercion (essentials 1759); (b) `getAt()` and proxy bracket reads throw a script error for position < 1 or > count (methods.txt 5193–5201); (c) `deleteAt()` position < 1 or > count is a NO-OP (D-3 — no `splice(-1,1)` from-the-end deletion); (d) `getLast()` on an empty list returns VOID (`null`, D-3); keep `setAt` blank-padding with 0 (D-2), sorted-state persistence, `duplicate()` nested deep-copy, `Symbol.iterator`, and `count`.
- [ ] T033 [P] [US1] Fix `packages/director/src/engine/base/prop-list.js` (port-with-fixes, R5): (a) proxy `get` handles both string-keyed (`pl["prop"]`) and symbol-keyed reads — missing property read THROWS (script error, methods.txt 5183–5184) while class members (`count`, `entries`, method names) resolve first; (b) `getaProp()`/`findPos()` missing → VOID (`null`, R2); (c) `setAt()` position > count THROWS (15739–15740); (d) `findPosNear()` → nearest entry by alphanumeric (sort) order, DROP the Levenshtein implementation (D-4); keep duplicate-`addProp`, bracket-write-adds, `getProp`/`getPropAt` throwing, `setaProp` add/replace, `deleteProp` first-only.
- [ ] T034 [US1] Run `pnpm --filter @project-reborn/director test` → the 5 type test files are all GREEN (color/list/prop-list fixed; point/rect port-verified with zero source changes); the FR-004 surface-audit assertions pass (prototype member scan per quickstart scenario 2 and the contract's audit rule). **Checkpoint: US1 complete.**

---

## Phase 4: User Story 2 — Lingo Constants (Priority: P1)

**Goal**: All eleven Lingo constants exported from `@/lingo` with doc-conformant values (FR-005/FR-006); the pre-written constants test (T015) goes red → green.

**Independent Test**: `pnpm --filter @project-reborn/director test` — `packages/director/src/engine/base/__tests__/constants.test.js` passes, asserting all 11 values (quickstart scenario 7).

### Tests for User Story 2 (written in Foundational — T015; red observed at T017/T029)

- [ ] T035 [US2] Run `pnpm --filter @project-reborn/director test` and confirm `constants.test.js` is RED on `BACKSPACE` (current value `String.fromCharCode(51)` = `"3"` versus expected `"\b"`) while all other 10 constant assertions are green — pre-implementation red leg for US2 (FR-010 evidence; research R2).

### Implementation for User Story 2

- [ ] T036 [US2] Fix `packages/director/src/engine/base/constants.js`: change `BACKSPACE` to `String.fromCharCode(8)` (`"\b"`, Lingo character semantics per R2 — the constants.txt keyCode columns 51/3/36/49/48 are the JS-syntax ALTERNATIVE, not the constant values); do NOT touch the other 10 constants (all verified doc-conformant; `ENTER` = chr(3) is already correct); keep the verbatim JSDoc blocks.
- [ ] T037 [US2] Run `pnpm --filter @project-reborn/director test` → `constants.test.js` GREEN; all 7 in-scope test files pass (SC-003/SC-006); zero pre-existing failures. **Checkpoint: US2 complete — all in-scope tests green.**

---

## US3 & US4 delivery note (coverage mapping — no separate phases)

The template reserves story labels for user-story phases, so the work of these two stories executes UNLABELED inside Phase 2 Foundational, where the dependency order places it:

| Story (priority) | Delivered by | Verified by |
| --- | --- | --- |
| US4 — Test Cleanup (P2) | T003 (132 tests), T004 (shims), T005 (vitest config), T006/T007 (dead trees), T008 (AGENTS.md) | T009 (clean-slate run), T040 (final tree state); acceptance scenarios 1–3 |
| US3 — Stabilization (P1) | T018–T028a (all repaired files from research.md R3) | T016 + T029 (entry-points regression), T039 (static audit); acceptance scenarios 1–5 |

Rationale (spec/plan/research-grounded): US4 executes first because it is the FIRST executable thing — it unblocks the suite (a clean slate is required before any new test is written or run, US4 why + research R4 step 1) despite being P2. US3 is the other gate: research.md R4 step 2–4 requires the 7 test files to be written BEFORE the import repairs so their red is observable at write time (therefore test-writing (Block B) sits between US4 cleanup (Block A) and US3 repairs (Block C)). US1/US2 phases then contain only their behavior fixes plus green gates.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Prove the feature end-to-end against quickstart.md, prove the static audit (SC-007), and lock the final green state.

- [ ] T038 [P] Run quickstart.md validation at `packages/director/`: scenarios 1–8 (inline node one-liners for fresh-process entry imports, surface audit, color truncation, list semantics, propList semantics, point/rect syntax, constants table, and the full `pnpm --filter @project-reborn/director test`); all eight expected outputs confirmed.
- [ ] T039 [P] Static import audit (SC-007): grep `packages/director/src` for stale-path patterns — `../runtime/`, `src/runtime/`, `src/lingo/`, `../lingo/`, `../engine/types/`, `../engine/objects/`, `./objects/`, `./types/` (from `engine/subsystem`), `../types/`, `../objects/`, `../singletons.js` (from `api/methods`) — zero remaining references in any module reachable from the three public entries.
- [ ] T040 Final gate: run `pnpm --filter @project-reborn/director test` → exactly 7 test files in `src`, all green, zero pre-existing failures (SC-006); confirm `src/__test-shims__/`, `src/engine/packaging/`, `architecture/`, `src/runtime/`, and `src/lingo/` are absent (the layer layout `src/{api,engine,player,pack,browser}` is in place); commit the feature branch state. **Checkpoint: feature 002 complete.**

---

## Dependencies & Execution Order

### Phase Dependencies

```text
T001–T002 (Setup: baseline record)
   ↓
T003–T009 (US4 scope: cleanup — gates all test runs)
   ↓
T010–T016 (write the 7 new test files — after cleanup so the suite is unambiguous)
   ↓
T017 (RUN → RED ×7 on module resolution) — red evidence #1
   ↓
T018–T028a (US3 scope: stabilization repairs; all [P] — different files)
   ↓
T029 (RUN → entry-points/point/rect GREEN; color/list/prop-list/constants RED on behavior) — red evidence #2
   ↓
T030–T034 (US1: red-confirm → color/list/prop-list fixes → GREEN)
   ↓
T035–T037 (US2: red-confirm → BACKSPACE fix → GREEN)
   ↓
T038–T040 (Polish: quickstart audit, static audit, final gate)
```

- **Setup (Phase 1)**: No dependencies; read-only verification.
- **Foundational (Phase 2)**: Depends on Setup. INTRAPHASE ORDER IS MANDATORY: layer restructure (T002a–T002e, done) → cleanup (T003–T009) → write the 7 tests (T010–T016) → observed red (T017) → stabilization repairs (T018–T028a) → intermediate observed red (T029). No user story work may start before this completes.
- **User Stories (Phases 3–4: US1, US2)**: Depend on Foundational completion — a clean suite (US4, T003–T009), a resolvable barrel (US3, T018–T028a), and the pre-written red test files (T010–T016, red observed at T017/T029) are all required before the US1/US2 behavior fixes can be validated. US1 and US2 are mutually independent (disjoint files: `src/engine/base/{color,list,prop-list}.js` vs `src/engine/base/constants.js`) and run sequentially here in story priority order.
- **Polish (Phase 5)**: Depends on all in-scope tests being green (US1 + US2 complete) and on stabilization being final.

### User Story Dependencies

- **User Story 1 (P1)** — Data-Types: Starts after Foundational. No dependency on US2 or any other story. Its 5 test files already exist since Foundational (T010–T014); the phase re-confirms red (T030), implements (T031–T033), and gates green (T034).
- **User Story 2 (P1)** — Constants: Starts after Foundational. No dependency on US1 — its single implementation file (`src/engine/base/constants.js`) is disjoint from the US1 files, so the two stories COULD run in parallel if staffed; executed sequentially here (P1 → P1 order). Its test file exists since Foundational (T015, red at T017/T029).
- **User Story 3 (P1)** — Stabilization: Delivered INSIDE Foundational (T018–T029) because it is the gate: no type/constants test can load until the lingo barrel resolves. It depends only on the cleanup block (T003–T009).
- **User Story 4 (P2)** — Test Cleanup: Delivered FIRST inside Foundational (T003–T009). It is the first executable work: it unblocks every subsequent test run, and its P2 priority never blocks consumers because US3 (which does) lands in the same phase. Depends only on Setup.

### Within Each User Story

- Tests MUST already exist and be observed FAILING before implementation (FR-010). For this feature the tests were written in Foundational (T010–T016) and red was observed (T017, T029); each story phase therefore RE-CONFIRMS the red leg (T030, T035) and records the failing assertions before touching any implementation file.
- Implementation tasks run next (one file per task: T031–T033, T036), then the green-gate run (T034, T037) closes the story.
- Story complete before moving to the next in priority order.

---

## Parallel Opportunities

All tasks below are marked `[P]` in the list — they touch different files with no dependencies and can be launched together. The run/gate tasks (T009, T017, T029, T030, T034, T035, T037, T040) are never `[P]`: each observes/verifies the state produced by its batch.

| Batch | Tasks | Files touched (disjoint) |
| --- | --- | --- |
| Setup verification | T001, T002 | `vitest.config.js`, `package.json` |
| US4 cleanup (after T003) | T004, T005, T006, T007, T008 | `src/__test-shims__/`, `vitest.config.js`, `src/engine/packaging/`, `architecture/`, `AGENTS.md` |
| 7 new test files | T010–T016 | each a distinct new `__tests__/*.test.js` file |
| US3 stabilization (after T017) | T018–T028a | `api/index.js`, `browser/index.js`, `engine/core/index.js`, `engine/subsystem/context.js`, `engine/subsystem/singletons.js`, `player/cast-loader.js`, `engine/syntax/the-proxy.js`, 3 disjoint `api/methods/` file groups (T025/T026/T027), `ilk.js`, `player/*` resolver pass |
| US1 type fixes (after T030) | T031, T032, T033 | `engine/base/color.js`, `engine/base/list.js`, `engine/base/prop-list.js` |
| Polish | T038, T039 | quickstart runs vs static import audit |

Notes on the partitioning: T003 (the 132-test sweep) is deliberately NOT `[P]` — it must land before any test write or run — while T004/T005/T006/T007/T008 are parallel with each other. T025/T026 split the 24 singleton-import method files into two review-sized groups; both groups remain disjoint from T027 (types-import group), T028 (`ilk.js`), and T028a (`player/*` resolver pass). Within US1, T031–T033 are disjoint files and parallel; the creator-fix group inside T027 is import-only (see Notes).

---

## Parallel Example

```bash
# US4 cleanup batch — launch together after T003 (the 132-test sweep):
Task: "Delete src/__test-shims__/ (T004)"
Task: "Remove setupFiles from vitest.config.js (T005)"
Task: "Delete src/engine/packaging/ (T006)"
Task: "Delete architecture/ (T007)"
Task: "AGENTS.md touch-up (T008)"

# Red leg — all 7 new test files launched together (after T009 clean-slate run):
Task: "src/engine/base/__tests__/color.test.js (T010)"
Task: "src/engine/base/__tests__/list.test.js (T011)"
Task: "src/engine/base/__tests__/prop-list.test.js (T012)"
Task: "src/engine/base/__tests__/point.test.js (T013)"
Task: "src/engine/base/__tests__/rect.test.js (T014)"
Task: "src/engine/base/__tests__/constants.test.js (T015)"
Task: "src/__tests__/entry-points.test.js (T016)"
# then, together as the observed-red step: run the test command (T017)

# US3 stabilization batch — all 12 repair tasks launched together (after red evidence):
Task: "api/index.js re-exports + export set (T018)"
Task: "browser/index.js creators + drop defineMovie/defineCast (T019)"
Task: "engine/core/index.js type re-exports (T020)"
Task: "engine/subsystem/context.js (T021)"
Task: "engine/subsystem/singletons.js (T022)"
Task: "player/cast-loader.js (T023)"
Task: "engine/syntax/the-proxy.js (T024)"
Task: "12 method files, singleton imports, group 1 (T025)"
Task: "12 method files, singleton imports, group 2 (T026)"
Task: "10 method files, types imports, creators dormant (T027)"
Task: "ilk.js paths (T028)"
Task: "player/* resolver pass (T028a)"

# US1 fixes batch — launch together after red re-confirmation (T030):
Task: "color.js remove hex/rgb/equals (T031)"
Task: "list.js typed sort/throws/no-op/VOID (T032)"
Task: "prop-list.js proxy/sentinels/findPosNear (T033)"
```

---

## Implementation Strategy

### MVP First (Foundation → US1)

1. Complete Phase 1: Setup (verify baseline — T001, T002).
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories):
   - US4 cleanup first (T003–T009) — clean slate;
   - write the 7 new test files (T010–T016) and observe RED at write time (T017) — FR-010 evidence #1;
   - US3 stabilization (T018–T028a) — barrel resolves;
   - observe the split state (T029): entry-points/point/rect green, color/list/prop-list/constants still red on behavior — FR-010 evidence #2.
   - **STOP and VALIDATE**: foundation ready — entries import, suite is unambiguous, red legs recorded.
3. Complete Phase 3: User Story 1 (red re-confirm T030 → fixes T031–T033 → green T034).
4. **STOP and VALIDATE**: the five data types are green and independently testable (MVP).
5. Complete Phase 4: User Story 2 (red re-confirm T035 → `BACKSPACE` fix T036 → green T037).
6. Complete Phase 5: Polish (quickstart 1–8, static audit, final gate T038–T040).

**MVP statement**: the MVP deliverable is the foundation slice — the clean suite, the stabilized package, and the five documented data-types green — i.e. Phase 1 + Phase 2 (US3 + US4 delivered inside Foundational, tests written red) + Phase 3 US1. US2 (constants) and Polish complete the feature.

### Incremental Delivery

1. Setup + Foundational → foundation ready: US3 + US4 delivered, 7 tests exist, red-green evidence recorded. **Stop, validate.**
2. Add User Story 1 → five data-types green → MVP. **Stop, validate.**
3. Add User Story 2 → constants green → full in-scope suite green. **Stop, validate.**
4. Polish → quickstart scenarios 1–8 pass, static audit clean, final gate. **Commit.**

Each increment adds value without breaking the previous one; the suite is green only at steps 2–4 (never at the recorded red legs, which are run-and-record steps by design).

---

## Notes

- **[P] tasks** = different files, no dependencies. Run/gate tasks (T009, T017, T029, T030, T034, T035, T037, T040) are sequential by nature and never `[P]`.
- **[Story] labels** appear only in user-story phases (US1/US2). US3 and US4 scope executes unlabeled in Phase 2 Foundational per the template rule; their delivery mapping is in the "US3 & US4 delivery note" above.
- **Creator functions deferred to 006** (contract §Removed): `color()`, `list()`, `point()`, `propList()`, `rect()` are NOT exported from `@/lingo` in 002; `rgb()` must not exist. The 5 creator modules in `src/api/methods/` receive IMPORT FIXES ONLY (via T027, inside the 10-file types-import group) — they stay dormant with zero behavior work until 006. `symbol()`/`value()`/`ilk()` relationship work is likewise 006-owned; `ilk.js` here gets path fixes only (T028).
- **No silent scope creep**: every source edit in this feature is enumerated above and in plan.md/research.md R3/R5. The only layout changes are the user-ordered layer restructure (Block A0, amendment 2026-08-31) and the resulting `./lingo` export target in `package.json`; no new abstractions, factories, or wrappers (KISS/YAGNI); `src/api/index.js` is fixed, not enriched.
- **Red-green evidence record (FR-010)**: T017 (all 7 new files red on module resolution), T029 (4 test files still red on behavior after stabilization), T030/T035 (in-phase red re-confirmation immediately before each story's fixes). Each red leg's failing output is captured before the corresponding fix task runs; the test command is the verification gate (`pnpm --filter @project-reborn/director test`).
- **Constitution gates**: defined-before-built — every edit traces to spec.md, data-model.md, the contract, or plan decisions D-1…D-4 (spec-authorized Edge Cases: setAt padding 0, deleteAt no-op, getLast-on-empty VOID, findPosNear sort-order); no silent interpretation — the BACKSPACE keyCode/character ambiguity is resolved in research R2 and the discrepancy recorded; test discipline — red-green per this list, gate is the pnpm filter command.
- **Doc-conformant JSDoc**: any edit to `color.js`/`list.js`/`prop-list.js`/`constants.js` preserves verbatim quoting of all remaining documented members (contract §JSDoc; AGENTS.md rules 4–6). Implementation storage fields (`_red/_green/_blue`, `items`, `entries`, `sorted`) remain plain public fields per D-1.
- **Commit after each task or logical group**; never commit a red state as final — the red observations (T017, T029, T030, T035) are recorded evidence steps, not commits of broken code.
- **Out of scope re-verified**: no changes to `src/engine/core/` sources (except the barrel path fix T020), `src/pack/`, `src/engine/subsystem/` (except import fixes), `src/player/` (except import fixes), or `src/engine/syntax/` sources; no test suites outside `packages/director/` are touched (spec Assumptions); two-active-contexts isolation is a later spec's concern.