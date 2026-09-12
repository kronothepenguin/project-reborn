---

description: "Task list for the consolidated Director Runtime contract reconciliation"
---

# Tasks: Director Runtime (Consolidated)

**Input**: Design documents from `/specs/015-director-runtime/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md,
data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED — spec FR-007 and the constitution mandate red-green tests for every
behavior. Each task below states the red step (write/adjust tests first, observe failure) then
the fix.

**Organization**: Tasks are grouped by user story in priority order (P1 stories first:
US1–US6 and US10; then P2: US7–US9; then P3: US11). This is a brownfield reconciliation:
"implement" tasks verify the contract and close the gaps registered in
`data-model.md#known-implementation-gaps`; they do not rebuild shipped behavior.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Package root: `packages/director/`
- Source and co-located tests: `packages/director/src/**/__tests__/*.test.js`
- Generated packs: `packages/client-r26/src/game/` (habbo, fuse_client)
- Spec artifacts: `specs/015-director-runtime/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Freeze the baseline and verify the consolidation state before any fix.

- [ ] T001 Run the baseline gate `pnpm --filter @project-reborn/director test` and record the pass count and any pre-existing failures (no file change)
- [ ] T002 [P] Verify consolidation state: `specs/archive/001-director-runtime`…`011-scripting-objects` exist, `specs/015-director-runtime/` holds spec/plan/research/data-model/contracts/quickstart/checklists, and `.specify/feature.json` points to `specs/015-director-runtime`
- [ ] T003 [P] Cross-check `specs/015-director-runtime/data-model.md` "Known implementation gaps" against current code and update the register if drift is found

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-cutting contracts every story task depends on.

**⚠️ CRITICAL**: No story work should start until these pass.

- [ ] T004 [P] Red-green the entry-point contract test per FR-002/FR-006/SC-013 in `packages/director/src/__tests__/entry-points.test.js` (root/lingo/browser import clean; exact export categories)
- [ ] T005 [P] Align the API owner registry with FR-043/R-24 in `packages/director/src/api/methods/registry.js` and the audit test (file set == registry, `// @owner` tag on every module)
- [ ] T006 [P] Verify the test harness (vitest + jsdom, mocked Worker/OffscreenCanvas/AudioContext, no package-local shims) in `packages/director/vitest.config.js` and `packages/director/src/player/__tests__/`
- [ ] T007 Re-check the Constitution Check in `specs/015-director-runtime/plan.md` after design artifacts exist (no violations expected)

**Checkpoint**: Foundation ready — story reconciliation can proceed.

---

## Phase 3: User Story 1 - Director Data-Types & Constants (Priority: P1) 🎯 MVP

**Goal**: The five data types and eleven constants match the consolidated contract exactly.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/engine/base`.

- [ ] T008 [P] [US1] Red-green data-type conformance per FR-008–FR-013 in `packages/director/src/engine/base/__tests__/` (Color clamp + paletteIndex, List/PropList command tables, Point/Rect brackets, Rect no width/height, creators exported from methods)
- [ ] T009 [P] [US1] Red-green constants per FR-014/R-10 in `packages/director/src/engine/base/__tests__/constants.test.js` (`BACKSPACE` `"\b"`, `ENTER` `"\x03"`, `RETURN` `"\r"`, TRUE/FALSE coercion)
- [ ] T010 [US1] Fix any data-type deviations found in `packages/director/src/engine/base/{color,list,prop-list,point,rect}.js` (documented members only; no convenience members)
- [ ] T011 [US1] Verify creator ownership: `packages/director/src/api/index.js` re-exports `color/list/point/propList/rect` from `packages/director/src/api/methods/`, base classes stay in `engine/base`

**Checkpoint**: US1 independently green.

---

## Phase 4: User Story 2 - Syntax Stand-ins & `the` Proxy (Priority: P1)

**Goal**: Chunks, put helpers, and the `the` proxy match FR-015–FR-020 and the R-25/R-26 rulings.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/engine/syntax`.

- [ ] T012 [P] [US2] Red-green chunk semantics per FR-015/FR-016 in `packages/director/src/engine/syntax/__tests__/` (1-based, out-of-range, clamping, delimiters, empty chunks, range joins)
- [ ] T013 [P] [US2] Red-green `putInto`/`putBefore`/`putAfter` per FR-017 in `packages/director/src/engine/syntax/__tests__/put-*.test.js`
- [ ] T014 [P] [US2] Red-green the `the` table per FR-018/FR-019 in `packages/director/src/engine/syntax/__tests__/the-proxy.test.js` (read-only throws, unknown throws, aliases, count/last forms, score-backed rows, no word/line delimiters)
- [ ] T015 [US2] Fix `the.movieName`/movie-facing rows to read the active context per FR-018 and R-02 in `packages/director/src/engine/syntax/the-proxy.js` (gap 17)
- [ ] T016 [US2] Verify the 12-name stand-in export surface and context independence per FR-020 in `packages/director/src/engine/syntax/index.js` + `packages/director/src/api/index.js`

**Checkpoint**: US2 independently green.

---

## Phase 5: User Story 3 - Context, Accessor & Subsystems (Priority: P1)

**Goal**: Context ownership, accessor resolution, defaults, and idempotent destroy match FR-021–FR-023.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/engine/subsystem`.

- [ ] T017 [P] [US3] Red-green context/accessor/destroy behavior per FR-021–FR-023 in `packages/director/src/engine/subsystem/__tests__/context.test.js` (const ownership, accessor switching, default instances, destroy releases exactly once)
- [ ] T018 [US3] Fix any accessor/default/destroy gaps in `packages/director/src/engine/subsystem/{context,accessor,singletons}.js`

**Checkpoint**: US3 independently green.

---

## Phase 6: User Story 4 - Score & Lifecycle (Priority: P1)

**Goal**: Score navigation, tempo, lifecycle order (R-04), handler-error halt, and single `stopMovie` match FR-024–FR-027.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/engine/subsystem/__tests__/score.test.js src/engine/subsystem/__tests__/lifecycle.test.js`.

- [ ] T019 [P] [US4] Rewrite red-green lifecycle order tests to R-04 in `packages/director/src/engine/subsystem/__tests__/lifecycle.test.js` and `.../frame-step-sprite.test.js` (all `beginSprite` ascending, then all `endSprite` ascending)
- [ ] T020 [P] [US4] Red-green Score navigation incl. empty-score no-op per FR-025/R-06 in `packages/director/src/engine/subsystem/__tests__/score.test.js` (gaps 21)
- [ ] T021 [US4] Fix `frameStep()` dispatch order in `packages/director/src/engine/subsystem/context.js` (gap 1)
- [ ] T022 [US4] Fix empty-Score `goLoop`/`goPrevious` to no-op in `packages/director/src/engine/subsystem/score.js` (gap 21)
- [ ] T023 [US4] Implement lifecycle handler-throw behavior (post error + halt movie) per FR-026 clarify in `packages/director/src/engine/subsystem/context.js` and `packages/director/src/player/event-loop.js`
- [ ] T024 [US4] Make `stopMovie` fire exactly once on destroy per FR-023/FR-058 in `packages/director/src/player/worker-entry.js` + `packages/director/src/engine/subsystem/context.js` (gap 9)
- [ ] T025 [US4] Fix `mount.js` loop/event target to the context per FR-027 in `packages/director/src/player/mount.js` (gap 6)

**Checkpoint**: US4 independently green.

---

## Phase 7: User Story 5 - Core Objects & Functional Sprites (Priority: P1)

**Goal**: Core-object surface, live sprite resolution, puppets, hitTest, and constraints match FR-028–FR-033.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/engine/core`.

- [ ] T026 [P] [US5] Red-green core-object documented surface per FR-028 in `packages/director/src/engine/core/__tests__/`
- [ ] T027 [P] [US5] Red-green functional sprites per FR-029–FR-032 in `packages/director/src/engine/core/__tests__/{sprite-functional,hit-test,constraint}.test.js`
- [ ] T028 [US5] Fix sprite resolution/hydration/puppet/constraint gaps in `packages/director/src/engine/core/sprite.js`, `packages/director/src/engine/subsystem/sprite-hydrate.js`, `packages/director/src/engine/core/movie.js`
- [ ] T029 [US5] Verify `Window` full surface with MIAW/`openMovie` documented no-op per FR-033 in `packages/director/src/engine/core/window.js`

**Checkpoint**: US5 independently green.

---

## Phase 8: User Story 6 - Public API & Owner Registry (Priority: P1)

**Goal**: Pure/stateful/net methods, type introspection, and ownership match FR-043–FR-048.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/api`.

- [ ] T030 [P] [US6] Red-green pure methods per FR-044 in `packages/director/src/api/methods/__tests__/`
- [ ] T031 [P] [US6] Red-green stateful delegation + no-context neutral returns per FR-045
- [ ] T032 [P] [US6] Red-green `value()`/`symbol()`/`ilk()`/predicates per FR-047/R-12/R-13
- [ ] T033 [US6] Fix owner-registry categories (`castlib`, `soundchannel`, `spritechannel`) and audit equality per FR-043 in `packages/director/src/api/methods/registry.js` (gap 16)
- [ ] T034 [US6] Implement `halt()` through the Player per FR-048/R-23 in `packages/director/src/engine/core/player.js` + `packages/director/src/api/methods/halt.js` (gap 14)
- [ ] T035 [US6] Make `externalParamName`/`externalParamValue` read the frozen snapshot per FR-063 in `packages/director/src/engine/core/player.js` (gap 13)
- [ ] T036 [US6] Wire `SoundObject.channel(n)` to the context's Web Audio graph per FR-061 in `packages/director/src/engine/core/sound.js` + `packages/director/src/player/audio.js` (gap 15)
- [ ] T037 [US6] Red-green net fail-soft per FR-046/R-15 with a rejecting `fetch` in `packages/director/src/api/methods/__tests__/net-*.test.js`

**Checkpoint**: US6 independently green.

---

## Phase 9: User Story 10 - Player Runner (Priority: P1)

**Goal**: Protocol, bootstrap, ingest, rendering, input, audio, net relay, and externalEvent match FR-054–FR-065.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/player`.

- [ ] T038 [P] [US10] Red-green protocol/handle tests per FR-054/FR-055/FR-064 in `packages/director/src/player/__tests__/runner.test.js` (queue-until-ready, message kinds, handle events)
- [ ] T039 [P] [US10] Red-green worker bootstrap/globals per FR-056 in `packages/director/src/player/__tests__/`
- [ ] T040 [P] [US10] Red-green rendering incl. fallback drawing/order per FR-059 in `packages/director/src/player/__tests__/renderer.test.js`
- [ ] T041 [P] [US10] Red-green input/audio/net relay per FR-060–FR-062 in `packages/director/src/player/__tests__/`
- [ ] T042 [US10] Fix the `externalEvent` bridge and flat W→MT payload shapes per FR-063 in `packages/director/src/api/methods/externalEvent.js`, `packages/director/src/player/external-event.js`, `packages/director/src/player/run.js` (gaps 3, 4)
- [ ] T043 [US10] Implement the `gotoNetMovie` sender + relay/teardown-rerun semantics and fail-soft per FR-062/R-15 in `packages/director/src/engine/core/scripting/net-lingo.js` + `packages/director/src/player/worker-entry.js` (gap 5)
- [ ] T044 [US10] Queue all MT→W messages until `ready`, handle `lifecycle`, add `getLifecycleSnapshot()` per FR-055/FR-064 in `packages/director/src/player/run.js` (gap 8)
- [ ] T045 [US10] Draw the actual frame in the `paint` fallback and re-dispatch `paint` per FR-059/FR-067 in `packages/director/src/player/renderer.js` (gap 11)
- [ ] T046 [US10] Add bundle validation (`kind`/`name`/`casts`) with `InvalidBundleError` per FR-053 in `packages/director/src/player/ingest.js` (gap 12)
- [ ] T047 [US10] Implement `updateStage()`'s synchronous re-render per FR-059 in `packages/director/src/engine/core/movie.js` (gap 14)
- [ ] T048 [US10] Repair or remove legacy `cast-loader` statics and align loader to FR-057 in `packages/director/src/player/cast-loader.js` (gap 2)
- [ ] T049 [US10] Resolve `createContext({worker:"auto"})` (spin a worker or reject the option) per FR-054/FR-071 in `packages/director/src/browser/index.js` (gap 19)

**Checkpoint**: US10 independently green.

---

## Phase 10: User Story 7 - Member Media Classes (Priority: P2)

**Goal**: 8 functional + 11 empty documented stubs, payload handling, and `newMember` match FR-034–FR-038.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/engine/core/media`.

- [ ] T050 [P] [US7] Red-green media classes per FR-035/FR-036 in `packages/director/src/engine/core/media/__tests__/media-classes.test.js` (exactly 11 empty stubs; legacy `FlashMember` unclassified; `SoundMember` functional per surface)
- [ ] T051 [US7] Empty `AnimatedGIFMember`/`LinkedMovieMember` extra members and fix class counts per R-22/FR-036 in `packages/director/src/engine/core/media/` (gap 10)
- [ ] T052 [P] [US7] Red-green `newMember` mapping/registration per FR-038 in `packages/director/src/engine/core/__tests__/newMember.test.js`
- [ ] T053 [US7] Verify no payload mirroring (payload stays on `MemberObject.payload`) per FR-037 in `packages/director/src/engine/core/media/` + `packages/director/src/engine/core/member.js`

**Checkpoint**: US7 independently green.

---

## Phase 11: User Story 8 - Scripting Objects & `xtra()` (Priority: P2)

**Goal**: Four scripting objects, `xtra()` factory, NetLingo ownership match FR-039–FR-042.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/engine/core/scripting`.

- [ ] T054 [P] [US8] Red-green `xtra()` + object surfaces per FR-039/FR-040 in `packages/director/src/engine/core/scripting/__tests__/scripting-objects.test.js`
- [ ] T055 [P] [US8] Red-green NetLingo ownership + top-level delegation per FR-041/R-14 in `packages/director/src/engine/core/scripting/__tests__/`
- [ ] T056 [US8] Replace the NetLingo `externalEvent` stub with the documented object behavior per FR-042 in `packages/director/src/engine/core/scripting/net-lingo.js`

**Checkpoint**: US8 independently green.

---

## Phase 12: User Story 9 - Pack Definition Contract & Generation (Priority: P2)

**Goal**: Builders, generated packs, and ingestion match FR-049–FR-053.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/pack src/player/__tests__/ingest`.

- [ ] T057 [P] [US9] Red-green builder conformance per FR-049–FR-051 in `packages/director/src/pack/__tests__/builder-shape.test.js` (`kind:"movie"`, `totalCastSlots`, empty-slot padding, C8 fields)
- [ ] T058 [US9] Fix `movie.build()` and generator emission of `kind`/`totalCastSlots`/empty slots per FR-049/FR-051 in `packages/director/src/pack/movie.js` + `packages/director/scripts/generate-pack.mjs` (gap 7)
- [ ] T059 [P] [US9] Red-green habbo/fuse_client ingestion per FR-052/FR-057 in `packages/director/src/player/__tests__/ingest-habbo.test.js`
- [ ] T060 [US9] Regenerate and verify committed packs per FR-052 in `packages/client-r26/src/game/habbo/index.js` and `packages/client-r26/src/game/fuse_client/index.js`

**Checkpoint**: US9 independently green.

---

## Phase 13: User Story 11 - Browser Custom Elements (Priority: P3)

**Goal**: Elements, params, canvas/paint, input, lifecycle, and run() equivalence match FR-066–FR-070.

**Independent Test**: `pnpm --filter @project-reborn/director test -- src/browser`.

- [ ] T061 [P] [US11] Red-green custom elements per FR-066–FR-069 in `packages/director/src/browser/custom-elements/__tests__/custom-elements.test.js`
- [ ] T062 [P] [US11] Red-green element ≡ `run()` equivalence per FR-070/SC-012 in `packages/director/src/browser/custom-elements/__tests__/equivalence.test.js`
- [ ] T063 [US11] Fix event relay/paint re-dispatch and stale worker-subpath handling per FR-067 in `packages/director/src/browser/custom-elements/index.js` + `packages/director/src/player/worker-host.js` (gaps 11, 18)

**Checkpoint**: US11 independently green.

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, end-to-end validation, and analysis.

- [ ] T064 [P] Update documentation references to the consolidated contract in `specs/015-director-runtime/contracts/build-plan.md` (historical framing + archive paths) and the `specs/006-api/research.md` comment in `packages/director/src/api/methods/registry.js`
- [ ] T065 [P] Review `Color` accessor-backed channels and `the` local-only rows against FR-004/FR-009/FR-018 and record the accepted exception (gap 20) in `specs/015-director-runtime/data-model.md`
- [ ] T066 Run the full gate and `specs/015-director-runtime/quickstart.md` end-to-end validation, fixing any regression
- [ ] T067 Run `/speckit.analyze` on spec/plan/tasks and resolve CRITICAL findings before client verification
- [ ] T068 Verify the implementation against the real client point by point and route any new deviation through the spec pipeline before coding

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: after Setup — blocks all stories
- **User stories**: after Foundational; within P1, US1→US2→US3→US4→US5→US6→US10 recommended (shared context/Score first); P2 (US7–US9) and P3 (US11) follow
- **Polish (Phase 14)**: after all story phases

### Story Dependencies

- US1–US3 are independent foundations.
- US4 depends on US3 (context/Score wiring).
- US5 depends on US4 (live sprites need Score hydration).
- US6/US10 depend on US3–US5.
- US7–US9 depend on US3/US4 for registration and ingestion.
- US11 depends on US10 (element wraps `run()`).

### Within Each Story

- Write/adjust tests first, observe red, then fix; keep the package gate green after each story.
- Fix contracts/schemas before consumers.

### Parallel Opportunities

- T002/T003, T004–T006, then all `[P]` test tasks per story (different test files).
- Stories can be split across workers once Foundational is done, respecting the dependency chain above.

---

## Parallel Example: User Story 1

```bash
Task: "T008 [P] [US1] Red-green data-type conformance in src/engine/base/__tests__/"
Task: "T009 [P] [US1] Red-green constants in src/engine/base/__tests__/constants.test.js"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. US1 (data types/constants) → 4. stop and
validate independently. The consolidated runtime becomes trustworthy incrementally from there.

### Incremental Delivery

Setup + Foundational → US1 → US2 → US3 → US4 → US5 → US6 → US10 (full P1) → US7 → US8 →
US9 → US11 → Polish. Each story closes its part of the gap register without breaking earlier
stories; the gate stays green.

### Parallel Team Strategy

After Foundational, assign US1/US2/US3 in parallel; then US4/US5; then US6/US10; then P2/P3
stories. Keep one owner per file to avoid conflicts (`the-proxy.js`, `context.js`,
`score.js`, `run.js`, `movie.js`, `registry.js` are hotspots).

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] labels map tasks to spec user stories for traceability.
- Gaps referenced as `(gap N)` map to `specs/015-director-runtime/data-model.md#known-implementation-gaps`.
- Verify tests fail before implementing (red-green per constitution IV).
- Commit after each task or logical group; run the gate per story.
- Avoid vague tasks, same-file conflicts, and cross-story dependencies that break independence.
