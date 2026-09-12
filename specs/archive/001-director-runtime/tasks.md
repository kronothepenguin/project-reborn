# Tasks: Director Runtime (`@project-reborn/director`)

**Input**: Design documents from `specs/001-director-runtime/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, refactor.md

**Tests**: Tests are REQUIRED for this feature (per spec FR coverage). Vitest + jsdom is the test runner. Worker/OffscreenCanvas/AudioContext need shims. Refactor strategy: rewrite tests per refactored file.

**Organization**: Tasks grouped by user story (P1-P8) plus Setup, Foundational, and Polish phases. Refactor tasks (per `refactor.md`) interleaved within relevant story phases.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no dependencies)
- **[Story]**: Maps to user story (US1-US8) for story-phase tasks only
- All paths relative to `packages/director/src/runtime/`

## Path Conventions

- Public API (`@/lingo`): `packages/director/src/lingo/`
- Browser/packaging (`@/browser`): `packages/director/src/runtime/package/`, `player/`
- Runtime objects: `packages/director/src/runtime/objects/`
- Methods: `packages/director/src/runtime/methods/`
- Subsystems: `packages/director/src/runtime/subsystems/` (NEW folder)
- Types: `packages/director/src/runtime/types/`
- Syntax: `packages/director/src/runtime/syntax/`
- Tests: co-located `__tests__/` folders

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project scaffolding, build config, test harness foundations

- [x] T001 Verify `vitest` + `jsdom` configuration in `packages/director/package.json` and `vitest.config.*`; add worker-shim, OffscreenCanvas-shim, AudioContext-shim setup files in `packages/director/src/__test-shims__/`
- [x] T002 [P] Create `packages/director/src/runtime/subsystems/` folder placeholder (`index.js` re-exports)
- [x] T003 [P] Document coding conventions in `packages/director/AGENTS.md`: no `#` private fields (FR-013), no statics/subsystems as class members (FR-005), plain public fields with JSDoc quoted verbatim from `docs/drmx2004_scripting_ref/`, YAGNI/KISS — logic in method body, no premature abstraction
- [x] T004 [P] Verify `@/lingo` and `@/browser` subpath exports in `packages/director/package.json` `exports` map (per `plan.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Subsystems + context that ALL core objects/methods depend on. MUST complete before any user story implementation.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete (per spec FR-031, FR-036 deferred items)

- [x] T005 [P] Refactor existing types/color.js — remove `#` private fields, use plain public fields with JSDoc verbatim from `docs/drmx2004_scripting_ref/` Color chapter; keep RGB clamping behavior in setters; tests in `types/__tests__/color.test.js`
- [x] T006 [P] Refactor existing types/list.js — remove `#` private fields (`#items`, `#sorted`), plain public fields; keep Symbol.iterator; tests in `types/__tests__/list.test.js`
- [x] T007 [P] Refactor existing types/point.js — remove `#` private fields; tests in `types/__tests__/point.test.js`
- [x] T008 [P] Refactor existing types/rect.js — remove `#` private fields; tests in `types/__tests__/rect.test.js`
- [x] T009 [P] Refactor existing types/prop-list.js — remove `#` private fields; tests in `types/__tests__/prop-list.test.js`
- [x] T010 [P] Verify existing `syntax/` files pass lint after types refactor (char.js, item.js, line.js, word.js, put-*.js, the-proxy.js); no changes unless they use refactored type internals

**Checkpoint**: Foundation ready — Director data-types refactored. User story implementation (US1-US8) can now begin; US2 provides the context + subsystems the remaining stories depend on.

---

## Phase 3: User Story 1 - Director Data-Types (Priority: P1) 🎯 MVP

**Goal**: Director's core data types (Color, List, Point, Rect, PropList) fully usable from Lingo with correct Lingo semantics (1-indexed, `#symbol`-style symbols, chunk expressions).

**Independent Test**: Construct each data type, run getter/setter behaviors per `docs/drmx2004_scripting_ref/` chapters; verify Lingo semantics (1-indexed lists, RGB clamping, point/rect arithmetic).

### Tests for User Story 1

> Tests for color/list/point/rect/prop-list already covered as T005-T009 (refactor with rewritten tests).

### Implementation for User Story 1

- [x] T012 ~~Create `types/symbol.js`~~ — CANCELLED: Lingo `#name` maps directly to native `Symbol.for("name")` (no custom Symbol registry/file needed). PropList test (T014) verifies behavior using `Symbol.for` keys. The public `symbol()` API method is handled in US5 (T047–T053, one of the 108 top-level methods) as a thin wrapper `symbol(name) => Symbol.for(name)`.
- [x] T013 [P] [US1] Create `types/__tests__/list.test.js` — exhaustive Lingo List spec coverage (add/delete/append/sort/getAt/getPos/ILK semantics); rewrite from existing if present
- [x] T014 [P] [US1] Create `types/__tests__/prop-list.test.js` — PropList spec coverage (aProp/getAProp/setAProp/sorted flag); rewrite from existing if present
- [x] T015 [P] [US1] Create `types/__tests__/point.test.js` — Point arithmetic (locH/locV, +, -, distance); rewrite from existing if present
- [x] T016 [P] [US1] Create `types/__tests__/rect.test.js` — Rect geometry (left/top/right/bottom, width/height, union/intersect); rewrite from existing if present

**Checkpoint**: US1 fully functional — every Director data type round-trips with Lingo semantics.

---

## Phase 4: User Story 2 - Context & Subsystems Enabling Core Objects (Priority: P2)

**Goal**: Deliver the (a) **MovieContext** part — worker-scoped singletons + Score-independent lifecycle hooks — and (b) the three **subsystem** singletons (member-registry, net-state, window-registry), one task each, that core objects and downstream stories depend on.

**Independent Test**: Instantiate MovieContext inside a worker; verify singleton resolution (`_movie`, `_player`, `_key`, `_mouse`, `_system`, `_global`, `_sound`), per-subsystem add/lookup, and lifecycle hook dispatch.

### Implementation for User Story 2 — Context Part

- [x] T017 [US2] Refactor `context.js` — MovieContext per-worker scope (one movie per worker, research.md R2); resolve singletons `_movie`/`_player`/`_key`/`_mouse`/`_system`/`_global`/`_sound`; expose getters for each subsystem registered below; tests in `__tests__/context.test.js`
- [x] T018 [US2] Add Score-independent lifecycle hooks in `context.js` (FR-037): `prepareMovie`, `startMovie`, `stopMovie`, `enterFrame`, `exitFrame` — fire regardless of Score sprite placement; event-loop driver wiring defers to US7 (T068); tests in `__tests__/context-lifecycle.test.js`

### Implementation for User Story 2 — Subsystems (one task each, parallel)

- [x] T019 [P] [US2] Create `subsystems/member-registry.js` + `subsystems/__tests__/member-registry.test.js` — singleton: sequential member-number auto-assignment (per FR member-numbers-auto-assigned); lookup by number/name/castLib; cross-castLib sequential numbering
- [x] T020 [P] [US2] Create `subsystems/net-state.js` + `subsystems/__tests__/net-state.test.js` — singleton: tracks net-operation state for deferred FR-031 (downloadNetThing etc.); ready for US7 fetch-based net ops (research.md R9)
- [x] T021 [P] [US2] Create `subsystems/window-registry.js` + `subsystems/__tests__/window-registry.test.js` — singleton: tracks open MIAW/window instances for deferred FR-036 openMovie; tests verify add/remove/lookup

### Implementation for User Story 2 — Wiring

- [x] T022 [US2] Wire the three subsystems into MovieContext (T017): instantiate member-registry, net-state, window-registry per worker; expose via context getters; integration test in `__tests__/context-subsystems.test.js` covering cross-subsystem lookup + lifecycle dispatch

**Checkpoint**: US2 complete — context bootstraps singletons + the three subsystem singletons are each independently testable; ready to support US3 core objects.

---

## Phase 5: User Story 3 - Core & Scripting Objects (Priority: P3)

**Goal**: Core Director objects (Movie, Player, Key, Mouse, System, Global, Window, Sound/SoundChannel, Sprite/SpriteChannel, CastLibrary) refactored from AI files to canon style, fully wired to context.

**Independent Test**: Instantiate each core object via context; verify JSDoc verbatim from docs, no `#`/statics/Proxies, public fields only; run object-specific behavior tests.

### Tests for User Story 3

- [x] T023 [P] [US3] Rewrite `objects/__tests__/movie.test.js` — full MovieObject property/method coverage per spec; replace AI-style tests
- [x] T024 [P] [US3] Create `objects/__tests__/player.test.js` — Player object behavior (after player.js refactor)
- [x] T025 [P] [US3] Create `objects/__tests__/key.test.js`, `objects/__tests__/mouse.test.js`, `objects/__tests__/system.test.js`, `objects/__tests__/global.test.js` — singleton behavior coverage (refactor or verify canon files)
- [x] T026 [P] [US3] Create `objects/__tests__/window.test.js` — WindowObject behavior; verify no static `.window` reads (per refactor.md)
- [x] T027 [P] [US3] Create `objects/__tests__/sound.test.js`, `objects/__tests__/sound-channel.test.js`, `objects/__tests__/cast-library.test.js`

### Implementation for User Story 3

- [x] T028 [P] [US3] Refactor `objects/movie.js` — confirm canon style (already canon per refactor.md); add lifecycle event stubs (per FR-037 wiring needs from T018/T022); verify field JSDoc verbatim from Movie chapter
- [x] T029 [P] [US3] Refactor `objects/cast-library.js` — confirm canon style (already canon per refactor.md); wire into member-registry subsystem (from US2 T019); tests in `objects/__tests__/cast-library.test.js`
- [x] T030 [P] [US3] Refactor `objects/global.js`, `objects/key.js`, `objects/mouse.js`, `objects/system.js` — verify canon style (per refactor.md canon); tests in respective `__tests__/`
- [x] T031 [P] [US3] Refactor `objects/member.js` — confirm canon style (per refactor.md canon); wire member-number registration into member-registry (from US2 T019); tests in `objects/__tests__/member.test.js`
- [x] T032 [P] [US3] **Refactor `objects/player.js`** — remove `#` private fields, Proxies, static class members (per refactor.md); use plain public fields, use context for shared state; JSDoc verbatim from Player chapter
- [x] T033 [P] [US3] **Refactor `objects/sound-channel.js`** — remove `#` private; use Web Audio API in worker (per research.md R8); JSDoc verbatim from SoundChannel chapter
- [x] T034 [P] [US3] **Refactor `objects/sound.js`** — verify web audio wiring; JSDoc verbatim
- [x] T035 [P] [US3] **Refactor `objects/sprite-channel.js`** — remove `#` private; plain public fields; JSDoc verbatim from SpriteChannel chapter
- [x] T036 [P] [US3] **Refactor `objects/sprite.js`** — remove `#` private and derived geometry; per refactor.md use direct fields (no computed derivations unless spec-required); JSDoc verbatim
- [x] T037 [P] [US3] **Refactor `objects/window.js`** — remove `#` private; plain public fields; JSDoc verbatim from Window chapter
- [x] T038 [US3] **Refactor `methods/window.js`** — remove read of static `WindowObject.window`; use context-resolved singleton instead; per refactor.md

**Checkpoint**: US3 complete — all core/scripting objects refactored, canon-style, wired to context; AI-file debt cleared.

---

## Phase 6: User Story 4 - Member Base & Media-Type Subclasses (Priority: P4)

**Goal**: `Member` base class plus the many media-type subclasses (Text, Shape, Bitmap, Sound, Script, AnimatedGIF, etc.) with proper Lingo member-number registration via member-registry subsystem.

**Independent Test**: Construct each subclass, verify JSDoc verbatim, member numbers auto-assigned sequentially, type-specific properties/methods behave per docs.

### Tests for User Story 4

- [ ] T039 [P] [US4] Create `objects/media/__tests__/text-member.test.js` — TextMember property/method coverage
- [ ] T040 [P] [US4] Create `objects/media/__tests__/shape-member.test.js`, `bitmap-member.test.js`, `script-member.test.js`, `animated-gif-member.test.js` (refactor existing `animated-gif-member.js` test) — per subclass
- [ ] T041 [P] [US4] Create `objects/media/__tests__/sound-member.test.js`, `vector-shape-member.test.js`, `flash-member.test.js`, `font-member.test.js` — per remaining subclasses (verify exact list against `docs/drmx2004_scripting_ref/` Member chapter)

### Implementation for User Story 4

- [ ] T042 [P] [US4] Refactor `objects/member.js` if needed for subclass base — confirm public-field base, no `#`/statics; tests in `objects/__tests__/member.test.js`
- [ ] T043 [P] [US4] Refactor `objects/media/animated-gif-member.js` — remove `#` private if present; JSDoc verbatim
- [ ] T044 [P] [US4] Create `objects/media/text-member.js`, `shape-member.js`, `bitmap-member.js`, `script-member.js` — plain public fields, JSDoc verbatim
- [ ] T045 [P] [US4] Create `objects/media/sound-member.js`, `vector-shape-member.js`, `flash-member.js`, `font-member.js` and remaining subclass files per docs chapters
- [ ] T046 [US4] Verify each subclass registers with member-registry (US2 T019); sequential number assignment across castLibs; tests in `subsystems/__tests__/member-registry-member-subclass.test.js`

**Checkpoint**: US4 complete — every Member media type independently constructible and testable.

---

## Phase 7: User Story 5 - Public Director API (Priority: P5)

**Goal**: Top-level methods (108 existing method files) + singletons exported via `@/lingo` subpath; delete/refactor any methods not in docs, wire rest to context singletons.

**Independent Test**: Import `@/lingo`; verify every method has JSDoc verbatim from docs; verify singleton access (`the movie`, `player`, etc.); run method behavior tests.

### Tests for User Story 5

- [ ] T047 [P] [US5] Audit 108 existing `methods/*.js` files against `docs/drmx2004_scripting_ref/` — list files to delete (not in docs), files needing refactor (AI style, `#`, statics, browser APIs), canon files passing
- [ ] T048 [P] [US5] Generate per-method test files in `methods/__tests__/` for each method kept — replace AI-style tests with spec-canon tests (recommended strategy: rewrite tests per refactored file)

### Implementation for User Story 5

- [ ] T049 [US5] Delete non-docs method files per T047 audit; update `methods/index.js` re-exports
- [ ] T050 [P] [US5] Refactor method files needing update (per T047) — remove `#`/statics/Proxies, JSDoc verbatim, use context for singletons (replace `_movie`/`_player`/`_sound`/`_key`/`_mouse`/`_system`/`_global` globals with context-resolved instances); spread across method files (parallel — different files)
- [ ] T051 [P] [US5] Verify/refactor 25 methods using singletons (per `methods/*.js` grep `alert.js`, `appMinimize.js`, `beep.js`, `callFrame.js`, `castLib.js`, `cursor.js`, `delay.js`, `externalParamName.js`, etc.) — wire to context-resolved singletons
- [ ] T052 [US5] Wire `@/lingo` subpath export: top-level methods + singletons (Movie/Player/Key/Mouse/System/Global) bound to globalThis per FR-005 + research.md R3
- [ ] T053 [US5] Verify `methods/index.js` barrel export covers all kept methods; compute closure of methods in docs

**Checkpoint**: US5 complete — `import * from '@/lingo'` yields the canon Director top-level API.

---

## Phase 8: User Story 6 - Packaging System (Priority: P6)

**Goal**: Builder-pattern Movie/Cast/Member definition builders using pure data + `Object.freeze`; shipped via `@/browser` subpath; per `contracts/packaging-builders.md`.

**Independent Test**: Define a movie+cast with members via builders; freeze verifies immutability; bundle imports via dynamic `import()` per research.md R5.

### Tests for User Story 6

> `runtime/package/__tests__/creators.test.js` (6/6 pass — already done). Extend coverage to full builder-api contract.

- [ ] T054 [P] [US6] Extend `runtime/package/__tests__/creators.test.js` per `contracts/packaging-builders.md` — every public method on MovieBuilder/CastBuilder/MemberBuilder, freeze behavior, member-number assignment
- [ ] T055 [P] [US6] Create `runtime/package/__tests__/movie.test.js` — Movie `.build()` returns frozen object including all properties surfaced by contract
- [ ] T056 [P] [US6] Create `runtime/package/__tests__/cast.test.js` — Cast `.build()` returns frozen object; inline member construction (no Member factory module import)

### Implementation for User Story 6

- [ ] T057 [US6] Verify `runtime/package/cast.js` (already refactored — inline member construction, Object.freeze) matches `contracts/packaging-builders.md`
- [ ] T058 [US6] Verify `runtime/package/movie.js` (already canon + `.build()` freeze) matches contract; add any missing builder methods per contract
- [ ] T059 [US6] Wire `@/browser` subpath export for packaging builders: `cast.js`, `movie.js`; also export imperative runtime (T-US7) and custom elements (T-US8) via same subpath per `contracts/imperative-runtime.md` and `contracts/custom-elements.md`
- [ ] T060 [US6] Verify ES module bundle generation via dynamic `import()` per research.md R5 — packaging builders are tree-shakeable ESM, no URL media refs (inline typed-array payloads per FR)

**Checkpoint**: US6 complete — packaging API matches contract; defining a movie = `new MovieBuilder().addCast(...).build()`.

---

## Phase 9: User Story 7 - Imperative Runtime API (Priority: P7)

**Goal**: Imperative runtime lives in `runtime/player/` — loads a packaged movie, drives the event loop with `setTimeout` at movie tempo, fires lifecycle events Score-independently (FR-037), renders to `OffscreenCanvas`, plays audio via Web Audio in worker, performs net ops via `fetch()`, and posts `externalEvent` from worker→main-thread re-dispatched as `CustomEvent`.

**Independent Test**: Mount a packaged movie via imperative API in a worker; verify tempo runs, lifecycle events fire, canvas renders, audio plays, externalEvent reaches main-thread listener. Use `quickstart.md` validation scenarios.

### Tests for User Story 7

- [ ] T061 [P] [US7] Create `player/__tests__/worker-host.test.js` — verify worker spawned with bundled movie; per `contracts/imperative-runtime.md`
- [ ] T062 [P] [US7] Create `player/__tests__/event-loop.test.js` — `setTimeout`-driven loop at movie tempo (per research.md R7); verify lifecycle events fire Score-independently (FR-037)
- [ ] T063 [P] [US7] Create `player/__tests__/canvas.test.js` — refactored canvas renders to OffscreenCanvas in worker (per research.md R6); tests need OffscreenCanvas shim
- [ ] T064 [P] [US7] Create `player/__tests__/script-lifecycle.test.js` — verify prepareMovie/startMovie/stopMovie/enterFrame/exitFrame routing (per research.md R7, FR-037)
- [ ] T065 [P] [US7] Create `player/__tests__/cast-loader.test.js` — verify castLib + members loaded into worker, member-registry populated
- [ ] T066 [P] [US7] Create `player/__tests__/external-event.test.js` — verify externalEvent posts worker→main-thread and re-dispatches as CustomEvent (per research.md R10)
- [ ] T067 [P] [US7] Create `player/__tests__/mount.test.js` — verify mount attaches worker-host to a host element (canvas, container) on main-thread
- [ ] T068 [P] [US7] Create `player/__tests__/audio.test.js` — verify Web Audio API used in worker (per research.md R8) via shim

### Implementation for User Story 7

- [ ] T069 [US7] Refactor `player/worker-host.js` — remove browser-specific globals if AI-style; use context for the worker scope (per research.md R1 worker testing isolation); ensure one movie per worker
- [ ] T070 [US7] Refactor `player/event-loop.js` — `setTimeout`-driven loop at movie tempo; lifecycle event dispatch (FR-037); use context lifecycle hooks (T018/T022)
- [ ] T071 [US7] Refactor `player/canvas.js` — use `OffscreenCanvas` in worker (per research.md R6); no main-thread DOM access from worker scope; per `contracts/imperative-runtime.md`
- [ ] T072 [US7] Refactor `player/script-lifecycle.js` — route lifecycle events to MovieObject (T028) via context (T017/T018/T022); per FR-037
- [ ] T073 [US7] Refactor `player/cast-loader.js` — load packaged cast (T057) and members into worker; populate member-registry (T019); per `contracts/imperative-runtime.md`
- [ ] T074 [US7] Refactor `player/mount.js` — main-thread mount attaches worker-host to host element; per `contracts/imperative-runtime.md`
- [ ] T075 [US7] Refactor `player/worker-shim.js` — provide shims in worker for OffscreenCanvas/AudioContext/fetch where needed; per research.md R1 (testing), R6 (canvas), R8 (audio), R9 (net)
- [ ] T076 [US7] Implement `externalEvent` posting mechanism in worker-host + main-thread re-dispatch as `CustomEvent` (per research.md R10)
- [ ] T077 [US7] Delete `player/custom-elements.js` legacy file (replaced by US8 custom-elements folder)

**Checkpoint**: US7 complete — imperative runtime plays a packaged movie in a worker end-to-end.

---

## Phase 10: User Story 8 - Custom Elements Host Integration (Priority: P8)

**Goal**: `<x-object>`, `<x-embed>`, `<x-param>` custom elements on main-thread that declaratively mount a packaged movie via the imperative runtime (US7). Per `contracts/custom-elements.md`.

**Independent Test**: Author HTML with `<x-object data-movie="..."><x-embed ...><x-param ...></x-param></x-embed></x-object>`; verify custom elements upgrade, locate movie bundle, dispatch to imperative runtime (US7), and the movie renders.

### Tests for User Story 8

- [ ] T078 [P] [US8] Create `player/custom-elements/__tests__/x-object.test.js` — element upgrades and locates packaged movie URL/data
- [ ] T079 [P] [US8] Create `player/custom-elements/__tests__/x-embed.test.js` — embed element triggers imperative runtime mount (US7); per `contracts/custom-elements.md`
- [ ] T080 [P] [US8] Create `player/custom-elements/__tests__/x-param.test.js` — param element passes args to runtime; per `contracts/custom-elements.md`

### Implementation for User Story 8

- [ ] T081 [P] [US8] Create/refactor `player/custom-elements/index.js` — register `<x-object>`, `<x-embed>`, `<x-param>` custom elements; re-export for `@/browser` subpath
- [ ] T082 [P] [US8] Implement `player/custom-elements/x-object.js`, `x-embed.js`, `x-param.js` — per `contracts/custom-elements.md`; wire onto imperative runtime (US7 worker-host, mount)
- [ ] T083 [US8] Add `@/browser` subpath export for custom elements in `packages/director/package.json` exports map alongside packaging+imperative

**Checkpoint**: US8 complete — declarative `<x-object>` mounts packages movie end-to-end via custom elements.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story verification & docs

- [ ] T084 [P] Run `pnpm --filter @project-reborn/director test` — all tests green, no pre-existing 59 AI failures (all AI files refactored); document remaining failures if any
- [ ] T085 [P] Run lint, format, typecheck for `packages/director` (verify command in `package.json`); fix any issues introduced
- [ ] T086 Run all 8 `quickstart.md` validation scenarios as end-to-end smoke tests; document outcomes
- [ ] T087 [P] Audit overall `packages/director/src/runtime/` for residual `#` private fields, statics, Proxies, browser-API-in-worker leaks; fix any found across US2-US8 files
- [ ] T088 [P] Update `packages/director/README.md` with `@/lingo` and `@/browser` usage examples (deliberately minimal per AGENTS.md YAGNI; only if README exists — check first, don't create docs unprompted)
- [ ] T089 Final JSDoc audit — verify every public field/method JSDoc quoted verbatim from `docs/drmx2004_scripting_ref/` relevant chapter across all refactored/created files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phases 3-10)**: All depend on Foundational phase completion
  - US1 (data types) and US4 (_members) depend on foundational refactor of `types/` (T005-T009) and `subsystems/member-registry` (US2 T019)
  - US2 (context + subsystem wiring) depends on US1 types being refactored (subsystems refer to types)
  - US3 (core/scripting objects) depends on US2 (context resolves singletons + subsystems)
  - US4 (member subclasses) depends on US3 (`objects/member.js` confirmed canon, member-registry wired)
  - US5 (public API methods) depends on US3 (singletons wired to context)
  - US6 (packaging) depends on US4 (member subclasses available to builders)
  - US7 (imperative runtime) depends on US6 (packaged movies to load) and US5 (lingo API in worker)
  - US8 (custom elements) depends on US7 (imperative runtime to drive)
- **Polish (Phase 11)**: Depends on all desired user stories complete

### User Story Dependencies

- **US1 (P1) MVP**: Data types — start after Foundational. No other story dependencies
- **US2 (P2)**: Delivers the context part + the three subsystem singletons (each its own task: T019 member-registry, T020 net-state, T021 window-registry). Depends on US1 (subsystems use types). Independently testable per subsystem
- **US3 (P3)**: Depends on US2 (context). Independently testable per object
- **US4 (P4)**: Depends on US3 (member base + member-registry wired via US2 T019). Independent member subclass tests
- **US5 (P5)**: Depends on US3 (singletons wired). Independent method tests
- **US6 (P6)**: Depends on US4 (member subclasses). Builder tests independent
- **US7 (P7)**: Depends on US6 + US5. End-to-end runtime test independent
- **US8 (P8)**: Depends on US7. Custom-element tests independent

### Within Each User Story

- Tests written BEFORE implementation but after refactor of dependent phase (rewrite strategy per plan)
- Refactor canon-style files verifies before creating new ones
- Subclass files created before subclass registry wiring
- Builder methods before contract tests
- Runtime components before end-to-end scenarios

### Parallel Opportunities

- T002, T003, T004 can run together (Setup)
- All Foundational type refactors (T005-T009) parallel — different files
- US2 subsystem creations (T019, T020, T021) parallel — different subsystem files
- US1 tests (T012-T016) parallel
- US2 context part tasks (T017, T018) sequential (lifecycle builds on MovieContext); subsystem tasks (T019-T021) parallel — independent subsystem files
- US3 object refactors (T028-T038) all parallel — different object files
- US4 media subclass files (T043-T045) parallel
- US4 media tests (T039-T041) parallel
- US5 method audit (T047) and method tests (T048) parallel
- US5 method refactors (T050-T051) parallel across different method files
- US6 builder tests (T054-T056) parallel
- US7 player tests (T061-T068) parallel — different test files
- US8 custom element files (T081-T082) parallel
- Polish verifications (T084, T085, T087, T088) parallel

---

## Parallel Example: User Story 3

```bash
# Launch all object refactors for User Story 3 together:
Task: "Refactor objects/player.js"                    (T032)
Task: "Refactor objects/sound-channel.js"             (T033)
Task: "Refactor objects/sprite-channel.js"            (T035)
Task: "Refactor objects/sprite.js"                    (T036)
Task: "Refactor objects/window.js"                   (T037)
Task: "Refactor objects/methods/window.js"           (T038)
```

```bash
# Launch all US2 subsystem tasks in parallel:
Task: "Create subsystems/member-registry.js"          (T019)
Task: "Create subsystems/net-state.js"               (T020)
Task: "Create subsystems/window-registry.js"         (T021)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T011)
3. Complete Phase 3: US1 (T012-T016)
4. **STOP and VALIDATE**: All Director data types round-trip with Lingo semantics
5. Demo `@/lingo` types alone (no worker/canvas/audio needed)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently (MVP — data types alone usable)
3. Add US2 → Test context/subsystems
4. Add US3 → Test core objects (singletons functioning)
5. Add US4 → Test member subclasses
6. Add US5 → Test public API surface
7. Add US6 → Test packaging builders
8. Add US7 → Test end-to-end imperative runtime playing a packaged movie
9. Add US8 → Test declarative custom-element mount
10. Each story adds value without breaking previous stories; AI-file refactor debt cleared progressively.

### Parallel Team Strategy

With multiple developers post-Foundational:
- Dev A: US1 + US4 (member types track)
- Dev B: US2 + US3 (context + objects track)
- Dev C: US5 (method audit/refactor track)
- Dev D: US6 + US7 + US8 (packaging + runtime + DOM track)
Stories converge at US7 (runtime consumes everyone's work).

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to user story for traceability
- Refactor scope (per `refactor.md`): `objects/player.js`, `objects/sound-channel.js`, `objects/sprite-channel.js`, `objects/sprite.js`, `methods/window.js` (AI files), `types/color.js`, `types/list.js`, `types/point.js`, `types/rect.js`, `types/prop-list.js` (also `#` private — discovered during tasks generation)
- Original 59 pre-existing AI test failures should decrease to 0 as refactor tasks complete (all AI files refactored across US2-US8)
- No `.specify/extensions.yml` — no before/after tasks hooks dispatched
- `.specify/memory/constitution.md` is unfilled template — vacuous pass (no project principles enforced)
- Commit after each task or logical group; stop at any checkpoint to validate story independently