# Tasks: Director Engine Syntax — 005-engine-syntax

**Input**: Design docs from `/specs/005-engine-syntax/` (plan.md, spec.md, research.md R1–R5, data-model.md, contracts/syntax-lingo.md, quickstart.md).

**Branch**: `005-engine-syntax` | **Package**: `@project-reborn/director` at `packages/director/` | **Repo root**: `/mnt/media/Projects/habbo`

**Prerequisites**: plan.md (required), spec.md (required for stories), research.md R1–R5, data-model.md (property table source of truth), contracts/syntax-lingo.md (public contract), quickstart.md (10 scenarios).

**Tests**: MANDATORY per FR-015 (red-green). Gate: `pnpm --filter @project-reborn/director test` (vitest, jsdom, include `src/**/__tests__/**/*.test.js`). 9 new syntax test files join the 7 green files from 002.

**Organization**: Phases by EXECUTION DEPENDENCY: Setup (baseline, read-only) → Foundational (write the 9 test files, observe RED, no implementation) → US1 (chunk helpers) → US2 (put-*) → US3 (the proxy) → US4 (public surface) → Polish. `[US]` labels appear only in user-story phases.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: record the agreed pre-005 baseline; read-only.

- [x] T001 [P] Verify `packages/director/src/engine/syntax/`: the 8 source files (char/item/line/word, put-after/before/into, the-proxy, index.js) present; `__tests__/` absent (deleted in 002). Record the baseline shape: `char(n, str)` positional reads; `putAfter(value, chunkStart, chunkEnd, str)` value-first; `the`-proxy `has` = claim-everything, `maxInteger = Number.MAX_SAFE_INTEGER`, BACKING defaults (`beepOn:true`, `centerStage:false`, `soundLevel:0`, `lineDelimiter:"\n"`, `wordDelimiter:" "`). No edits.
- [x] T002 [P] Verify `packages/director/vitest.config.js` (jsdom, include pattern, no setupFiles) and `package.json` (type module, vitest ^4.1.8 + jsdom ^29.1.1, `"test":"vitest run"`, exports map) need NO changes for 005. No edits.

**Checkpoint**: baseline recorded — no config/package edits expected in this feature.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: write the 9 feature test files FIRST and observe RED (FR-015) before any implementation.

### Block A — write the 9 test files (import through `src/api/index.js` or `src/engine/syntax/*`)

- [x] T003 [P] Write `packages/director/src/engine/syntax/__tests__/char.test.js` — per US1: `char(1).of("$9.00") === "$"`; `char(5).of("$9.00") === "0"`; `char(1).to(5).of("$9.00") === "$9.00"`; out-of-range `char(9)` → `""`; `char(0)`/`char(-1)` → `""`; end-clamp `char(1).to(99).of("hi") === "hi"`; `start>end` → `""`; `start<1` → `""`; empty/non-string container → `""` no throw; reads are strings (`String()`/`==`).
- [x] T004 [P] Write `item.test.js` — US1 scenarios 1/2 + C3: `item(3).of("red,yellow,blue green,orange") === "blue green"`; `item(3).to(5).of(...) === "blue green, orange"` (clamp + rejoin); `item(9)` → `""`; trailing/consecutive delimiters → empty chunks; live delimiter: `the.itemDelimiter=":"` → `item(2).of("a:b")==="b"`, range rejoin with `":"`, restore `","` returns prior behavior; `itemRange(a,b) ≡ item(a).to(b)`.
- [x] T005 [P] Write `line.test.js` — US1 scenario 5: `line(2).of("a\rb") === "b"`; `line(1).to(2).of("a\rb") === "a\rb"` (delimiter preserved); multi-line range; trailing CR → trailing empty chunk; out-of-range `""`; `lineRange` alias.
- [x] T006 [P] Write `word.test.js` — FR-003: `word(2).of("fox dog cat") === "dog"`; `word(1).to(3).of(...) === "fox dog cat"`; `word(5).of("fox elk dog cat") === ""` (doc example); Tab and CR behave as spaces; consecutive delimiters → empty chunks; `wordRange` alias.
- [x] T007 [P] Write `put-after.test.js` — US2: whole-container `putAfter("abc","X")==="abcX"`; chunk-target `putAfter(word(2).of("fox dog cat"),"X")` inserts after word 2 without replacing; nonexistent `putAfter(char(99).of("abc"),"X")==="abcX"`; stringify `putAfter("abc",5)==="abc5"` and `putAfter("abc",null)==="abc"`; empty container.
- [x] T008 [P] Write `put-before.test.js` — US2 scn 1: `putBefore(word(2).of("fox dog cat"),"elk ") === "fox elk dog cat"` (doc example); whole-container prepend; nonexistent → append; stringify.
- [x] T009 [P] Write `put-into.test.js` — US2 scn 3/6: `putInto(line(2).of("a\rb"),"Y") === "a\rY"` (replace, first intact); whole-container `putInto("abc","X")==="X"`; empty whole-container → value; nonexistent → append; stringify.
- [x] T010 [P] Write `the-proxy.test.js` — US3 + data-model table: (a) `the` imports from the lingo entry and reads defaults with no context; importing does NOT leak `the` onto `globalThis`; (b) every table row family reads a defined value of documented type; (c) every read-only row rejects a write (C5 — sample frame/mouseH/key/maxInteger/milliseconds); (d) RW rows store-and-read-back (itemDelimiter, exitLock, beepOn, centerStage, keyboardFocusSprite, soundLevel, randomSeed, selStart/selEnd); (e) function forms `the.numberOfCharsIn/ItemsIn/LinesIn/WordsIn` + `lastCharIn/WordIn/ItemIn/LineIn` on known strings and empties, live-delim item count (C3), and `char(1).to(the.numberOfCharsIn(...)).of(...)` chained count (C4); (f) aliases `the.milliSeconds` and `the.maxinteger` equal the canonical; (g) `the.zzz` read/write throws (C6); `the.wordDelimiter`/`the.lineDelimiter` throws (C8); `the.void === null`; `the.maxInteger === 2147483647`.
- [x] T011 [P] Write `surface.test.js` — US4 + research R5: all 12 names import from `src/api/index.js` and resolve to callables; helper results identical with no context vs default-singleton state; YAGNI absence: `"zzz" in the` is false and reading it throws; importing does not leak `the` onto `globalThis`; undocumented names absent (`numberOfSounds`, `machineType`, `wordDelimiter`, `lineDelimiter`).

### Block B — observe RED

- [x] T012 Run `pnpm --filter @project-reborn/director test` and OBSERVE RED, recording output as FR-015 evidence: chunk tests fail with `char(1).of is not a function`; put tests fail on argument order/targets; line/word fail on delimiter; the-proxy fails on claim-everything `has`, missing function forms, `maxInteger`, `the.void`, decentralized defaults, alias absence, word/lineDelimiter not throwing; surface fails the YAGNI-absence assertions. (002 files remain green.) Do not fix yet.

**Checkpoint**: 9 feature test files exist; suite red with recorded failures; no pre-existing noise.

## Phase 3: User Story 1 — Chunk-expression helpers (Priority: P1)

**Goal**: chained `char/item/line/word` selectors per FR-001–FR-005/FR-009 (research R1).

**Independent Test**: `pnpm --filter @project-reborn/director test` — char/item/line/word test files green.

- [x] T013 [US1] Add internal `packages/director/src/engine/syntax/chunk-split.js` (NOT exported): `splitChars`, `splitItems(str, delim)`, `splitLines` (CR), `splitWords` (`/[ \t\r\n]/`), per data-model; consumed by selectors and the-proxy function forms.
- [x] T014 [P] [US1] Rewrite `packages/director/src/engine/syntax/char.js` — chained selector + `ChunkBound` (String subclass, non-enumerable `kind/container/start/end`); `charRange(a,b) ≡ char(a).to(b)`; 1-based; out-of-range/`start<1`/`start>end`/empty/non-string → `""`; end clamps. (Depends T013.)
- [x] T015 [P] [US1] Rewrite `packages/director/src/engine/syntax/item.js` — chained selector; live `the.itemDelimiter` fallback (imported from `./the-proxy.js`) `","` (C3); range rejoin with then-current delimiter; `itemRange` alias; drop positional delimiter arg. (Depends T013.)
- [x] T016 [P] [US1] Rewrite `packages/director/src/engine/syntax/line.js` — CR-only split; range preserves `\r`; `lineRange` alias; remove `the.lineDelimiter` read (C8). (Depends T013.)
- [x] T017 [P] [US1] Rewrite `packages/director/src/engine/syntax/word.js` — whitespace-class split; `wordRange` alias; remove `the.wordDelimiter` read (C8). (Depends T013.)
- [x] T018 [US1] Run `pnpm --filter @project-reborn/director test` → char/item/line/word test files GREEN; 002 files still green. **Checkpoint: US1 complete.**

## Phase 4: User Story 2 — put-before/after/into (Priority: P1)

**Goal**: `put*(chunkTarget, value)` per FR-006 (research R2).

**Independent Test**: suite green on the 3 put test files (US2 six scenarios).

- [x] T019 [P] [US2] Rewrite `packages/director/src/engine/syntax/put-after.js` — `putAfter(target, value)`; whole-container (plain string) + `ChunkBound` resolution; stringify value; nonexistent → append at end.
- [x] T020 [P] [US2] Rewrite `packages/director/src/engine/syntax/put-before.js` — same contract; insert without replace.
- [x] T021 [P] [US2] Rewrite `packages/director/src/engine/syntax/put-into.js` — replace semantics; whole-container replace; empty whole-container → value.
- [x] T022 [US2] Run `pnpm --filter @project-reborn/director test` → 3 put files GREEN. **Checkpoint: US2 complete.**

## Phase 5: User Story 3 — the proxy (Priority: P1)

**Goal**: data-driven `the` proxy per FR-007/FR-008/FR-010/FR-011/FR-012/FR-013 (research R3).

**Independent Test**: suite green on `the-proxy.test.js` (79-row table, RO/RW, aliases, function forms, no-op defaults).

- [x] T023 [US3] Rewrite `packages/director/src/engine/syntax/the-proxy.js`: property TABLE (79 rows + 8 function forms + alias map milliSeconds/maxinteger) per data-model.md; `get/set` traps with C5 (read-only write throws) and C6 (unknown read/write throws); `has` = known-only (FR-012); delegate live reads to `_movie/_player/_sound/_key/_mouse/_system` with `=== undefined` → table default; local backing for system/script props (itemDelimiter, floatPrecision, randomSeed, selection/selStart/selEnd); computed date/time family (C9, Intl/Date); constants incl. `maxInteger = 2147483647` and `void = null`; REMOVE wordDelimiter/lineDelimiter/numberOfSounds/machineType (C8/FR-013); export `the` from the module (no `globalThis` self-install — registering runtime globals is the player/runner's job in feature 008); keep `_reset()` (test reset, not barrel-exported); import `chunk-split.js` for function forms. (Depends T013.)
- [x] T024 [US3] Run `pnpm --filter @project-reborn/director test` → `the-proxy.test.js` GREEN. **Checkpoint: US3 complete.**

## Phase 6: User Story 4 — Public surface (Priority: P2)

**Goal**: 12-name surface + context-independence per FR-014 (research R5).

**Independent Test**: `surface.test.js` green (12 names, no-context/default behavior, YAGNI absence).

- [x] T025 [US4] Verify `packages/director/src/engine/syntax/index.js` is UNCHANGED (12 export names; `chunk-split` NOT exported) and `packages/director/src/api/index.js` line 25 unchanged — record the 1:1 export-name audit (FR-014).
- [x] T026 [US4] Run the full suite — `surface.test.js` green (12 importable, results identical no-context vs default singleton state, undocumented names absent).
- [x] T027 [US4] Final full gate `pnpm --filter @project-reborn/director test` — 16 files (7 from 002 + 9 new) green, zero pre-existing failures (SC-004/SC-005). **Checkpoint: US4 complete.**

## Phase 7: Polish & Cross-Cutting

- [x] T028 [P] Surface audit (FR-013/SC-006): add/assert an audit walking the data-model table so every runtime `the` name/alias has a row with a doc anchor or approved clarify note, and every table row is implemented — no runtime property outside the table.
- [x] T029 [P] Run quickstart.md scenarios 1–10 manually (node one-liners + gate); fix any drift between the one-liners and the unit tests.
- [x] T030 Final gate + record SC-001..SC-006 status; confirm zero residual clarify markers (FR-016).

## Dependencies & Execution Order

### Phase Dependencies
- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup; BLOCKS all user stories.
- US1/US2/US3 (P1): after Foundational; US2 depends on US1's `ChunkBound` (implement US1 before US2). US3 depends on Foundational + T013.
- US4 (P2): depends on US1–US3 complete.
- Polish: depends on all stories.

### Within Each Story
- Tests already written and red (Foundational T003–T012) per FR-015.
- US1: splitter before selectors (T013 → T014–T017).
- US2: after US1 (reuses `ChunkBound`).
- US3: after splitter; independent of US1/US2 otherwise.

### Parallel Opportunities
- Foundational test-writing T003–T011: all [P] (different files).
- US1 impl T014–T017: all [P] after T013.
- US2 impl T019–T021: all [P].
- Polish T028/T029: [P].

## Implementation Strategy

### MVP First (US1 + US2 + US3 — the pile the game code needs)
1. Complete Phase 1 + 2 (baseline, tests, red).
2. Complete US1 (chunk helpers — hundreds of game calls) → validate.
3. Complete US2 (put — 48 game calls) → validate.
4. Complete US3 (the proxy — 850+ game reads; required by US1's live itemDelimiter) → validate.
5. STOP and run the full gate (16 files green).

### Incremental Delivery
US1 → US2 → US3 are each independently testable P1 increments; US4 (P2) locks packaging and context-independence last.

## Notes
- [P] tasks = different files, no dependencies. Story labels only in story phases.
- Verify tests fail before implementing (Foundational red record).
- Commit after each task or logical group (conventional style); the user reviews the tasks.md summary before the first commit.