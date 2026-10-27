---
description: "Task list for the Central Store Library feature"
---

# Tasks: Central Store Library

**Input**: Design documents from `/specs/013-store-library/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Included. The plan and quickstart define test-based verification gates, and the constitution requires `go vet` + `go test ./...` per affected module. Write tests first and observe them fail (red-green).

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task serves (US1–US6)
- Every task includes an exact file path

## Path Conventions

- Module root: `packages/store/`
- Skills: `.agents/skills/<name>/SKILL.md`
- Spec artifacts: `specs/013-store-library/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the module and the sqlc generation pipeline.

- [X] T001 Create the Go module at `packages/store/go.mod` (module `github.com/kronothepenguin/project-reborn/packages/store`, `go 1.27`) and register it with `go work use ./packages/store` in `go.work`.
- [X] T002 Add dependencies in `packages/store`: `go get modernc.org/sqlite@v1.58.0`, `go get -tool github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1`, then `go mod tidy` (writes `packages/store/go.mod`, `packages/store/go.sum`).
- [X] T003 [P] Create `packages/store/sqlc.yaml`: version 2, engine sqlite, `schema: schema`, `queries: queries`, gen.go package `store`, `out: .`, `emit_interface` off (per research D5).
- [X] T004 [P] Create `packages/store/Makefile` with `generate: go tool sqlc generate`, `check-docs` (added in T027), and `test: go vet ./... && go test ./... -race`.
- [X] T005 [P] Create `packages/store/schema/store.schema.sql` as a comment-only placeholder reserving the schema namespace; document why it exists (research D4).
- [X] T006 [P] Create `packages/store/queries/ping.query.sql` with `-- name: Ping :one` and `SELECT 1 AS ok;`.
- [X] T007 Run `go tool sqlc generate` in `packages/store`; verify `db.go`, `models.go`, and `ping.query.sql.go` are generated with package `store`.
- [X] T008 [P] Create `packages/store/doc.go` describing the package contract from `contracts/library-api.md` (single database owner, always-on foreign keys and WAL, additive schemas, documented via OKF).

**Checkpoint**: module builds and generates typed code.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core `Store` lifecycle and error classification that every story uses.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T009 [P] Create test fixtures `packages/store/testdata/schema/alpha.schema.sql` (table `widgets`: `id INTEGER PRIMARY KEY`, `name TEXT NOT NULL UNIQUE`, `description TEXT NOT NULL DEFAULT ''`, `is_active INTEGER NOT NULL DEFAULT 1`, `created_at INTEGER NOT NULL`) and `packages/store/testdata/schema/beta.schema.sql` (table `gadgets` with `widget_id INTEGER NOT NULL REFERENCES widgets(id)` and an index) using additive idempotent DDL per `contracts/sql-conventions.md`.
- [X] T010 Write failing tests (`store_test.go`): `TestOpenCreatesFile`, `TestOpenAppliesPragmas` (foreign_keys = 1, journal_mode = wal), `TestCloseIdempotent`, `TestOperationsAfterCloseFailClearly` (actionable error, never silent success), `TestOpenCorruptOrUnwritable` (missing parent dir, unwritable path, non-database file → error naming the path; file never deleted or overwritten) per `contracts/library-api.md`.
- [X] T011 [P] Write failing tests `packages/store/errors_test.go`: `TestIsNotFound` (`sql.ErrNoRows`), `TestIsConflict` (unique/primary-key), `TestIsForeignKey`, `TestIsBusy` (second store holds a write transaction) per research D7.
- [X] T012 [P] Implement `packages/store/store.go`: `Store` embedding the generated `*Queries`, `Open(path string) (*Store, error)` with DSN `file:<path>?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)`, `SetMaxOpenConns(1)`, `SetMaxIdleConns(1)`, `Close()`; do not apply schemas yet (added in T016).
- [X] T013 [P] Implement `packages/store/errors.go`: `IsNotFound`, `IsConflict`, `IsForeignKey`, `IsBusy` using `errors.As` with `*sqlite.Error` codes per research D7.
- [X] T014 Run `cd packages/store && go test ./...` until T010/T011 pass, then `go vet ./...`; report any red→green deviations.

**Checkpoint**: `Open`/`Close` and error helpers work (schema application is completed in T016, satisfying `contracts/library-api.md`); every story can build on them.

---

## Phase 3: User Story 1 - Applications get persistence without owning database code (Priority: P1) 🎯 MVP

**Goal**: Wire the store once; database and declared structure are created automatically; typed operations work; data persists; failures are distinguishable.

**Independent Test**: `go test ./... -run 'TestApplication|TestValueRoundTrip|TestForeignKeyViolation|TestDataPersists|TestUnique|TestMissing|TestPing'` from `packages/store` passes against a fresh temp-file database.

### Tests for User Story 1 ⚠️

> Write first; confirm they fail before T016.

- [X] T015 [US1] Write failing acceptance tests `packages/store/application_test.go`: `TestApplicationRoundTrip` (apply `testdata/schema/*.schema.sql` through the unexported applier, create/read/update/delete `widgets` using package-internal access, assert every value round-trips), `TestValueRoundTrip` (non-ASCII `description`, `is_active` 0/1, signed `id`, unix-seconds `created_at`), `TestForeignKeyViolationIsAtomic` (`IsForeignKey`; no partial rows), `TestDataPersistsAcrossOpen` (close and reopen the same path), `TestUniqueViolationIsConflictAndAtomic` (`IsConflict`; row count unchanged), `TestMissingRowIsNotFound` (`IsNotFound`, distinct from other failures), `TestPingGeneratedOperation` (typed `Ping` through `Store`).

### Implementation for User Story 1

- [X] T016 [US1] Implement `packages/store/schema.go`: `//go:embed schema/*.schema.sql`, apply files in lexicographic order via multi-statement `ExecContext`, expose an unexported `applySchemas(db, fsys)` for testdata; call it from `Open` in `store.go` (research D4, D12).
- [X] T017 [US1] Run US1 tests red→green; confirm `Store` exposes generated operations and `Open` remains idempotent on an existing database.

**Checkpoint**: MVP — a fresh deployment gets a working, typed, persistent store.

---

## Phase 4: User Story 2 - New features extend the shared data incrementally (Priority: P2)

**Goal**: A second schema/query family can be added without disturbing existing data or behavior.

**Independent Test**: `go test ./... -run 'TestExtension|TestUnknownTable|TestAllDeclared'`.

> T018–T020 are acceptance and regression coverage for behavior delivered by US1; if a test passes immediately, record it as regression coverage instead of forcing a red phase.

- [X] T018 [US2] Write failing tests `packages/store/extension_test.go`: `TestExtensionPreservesExistingData` (apply alpha, write a widget, apply alpha+beta, widget still present and gadgets usable), `TestUnknownTableUntouched` (create an undeclared table with raw SQL, then `Open` and assert it and its rows are untouched), `TestAllDeclaredStructuresAvailableAfterOneOpen`.
- [X] T019 [US2] Verify the applier executes only declared files and never drops/alters undeclared structures (`packages/store/schema.go`); fix gaps found by T018.
- [X] T020 [US2] Run US2 tests to green and record the additive guarantee in `packages/store/doc.go` if it is not already stated.

**Checkpoint**: features can contribute structures side by side.

---

## Phase 5: User Story 3 - One authoritative structure evolves without losing data (Priority: P2)

**Goal**: Reopening is a no-op; additive structural changes preserve existing data; older and newer structures coexist.

**Independent Test**: `go test ./... -run 'TestReopen|TestAdditiveChange|TestOlderVersionCoexists'`.

> T021–T022 are acceptance and regression coverage for behavior delivered by US1; if a test passes immediately, record it as regression coverage instead of forcing a red phase.

- [X] T021 [US3] Write tests `packages/store/evolution_test.go`: `TestReopenIsNoOp` (two consecutive `Open` calls on the same path leave data and structure unchanged), `TestAdditiveChangeRetainsData` (apply fixtures, write data, apply an extended fixture set, assert old data intact and new structure present), `TestOlderVersionCoexistsWithNewerStructure` (a superset fixture set creates a table; an older fixture subset opens the same database and leaves it untouched).
- [X] T022 [US3] Fix any applier gaps T021 exposes and run US3 tests to green.

**Checkpoint**: schema evolution is safe and repeatable.

---

## Phase 6: User Story 4 - Persisted data is documented and added through a repeatable workflow (Priority: P2)

**Goal**: OKF bundle covers every schema/query file; two skills make the contribution workflow repeatable; conformance is checkable.

**Independent Test**: `make check-docs` from `packages/store` exits 0; then follow `.agents/skills/adding-data-persistence/SKILL.md` on a scratch copy to add a table and query successfully.

### Documentation for User Story 4

- [X] T023 [P] [US4] Create the bundle scaffolding `packages/store/knowledge/index.md` (root, `okf_version: "0.2"`), `packages/store/knowledge/schemas/index.md`, and `packages/store/knowledge/queries/index.md` per `contracts/knowledge-bundle.md`.
- [X] T024 [P] [US4] Write the concepts `packages/store/knowledge/store.md`, `packages/store/knowledge/schemas/store.md`, and `packages/store/knowledge/queries/ping.md` with frontmatter (`type`, `title`, `description`, `resource`), body sections, and bundle-relative links; list them in the indexes.

### Implementation for User Story 4

- [X] T025 [P] [US4] Create `.agents/skills/documenting-with-okf/SKILL.md` per `contracts/skills.md`: description, OKF explanation, project bundle layout and types, frontmatter/body/index rules, conformance checklist, and links to okf.md, the Google Cloud announcement, and the knowledge-catalog repo.
- [X] T026 [P] [US4] Create `.agents/skills/adding-data-persistence/SKILL.md` per `contracts/skills.md`: the 8-step workflow (schema file → query file → OKF docs → `go tool sqlc generate` → consume via `store.Open` → verify) with a copy-paste checklist and a reference to the OKF skill.
- [X] T027 [US4] Add the `check-docs` target to `packages/store/Makefile`: fail on any non-reserved `knowledge/**/*.md` missing `^type:` in frontmatter, and on any `schema/*.schema.sql` or `queries/*.query.sql` without a `resource:` reference in the bundle (quickstart §7).
- [X] T028 [US4] Run `make check-docs`; fix the bundle until it exits 0.
- [X] T029 [US4] Exercise `adding-data-persistence` on a scratch copy under `/tmp/opencode/store-skill-check` (add a table, a read and a write query, docs, generate, test), timing the run against the SC-002 15-minute budget and recording the result in `specs/013-store-library/quickstart.md`; fix the skill if any step needs outside context or exceeds the budget; do not commit scratch files.

**Checkpoint**: documentation conforms and the workflow is proven.

---

## Phase 7: User Story 5 - Multi-step changes are all-or-nothing (Priority: P2)

**Goal**: Applications can group operations into atomic units with explicit commit/rollback.

**Independent Test**: `go test ./... -run TestTransaction`.

- [X] T030 [US5] Write failing tests `packages/store/transaction_test.go`: `TestTransactionCommitVisibility` (changes visible to a second store only after commit), `TestTransactionRollbackLeavesNoPartialChange`, `TestTransactionTerminalStateErrors` (commit after rollback and rollback after commit error), `TestCrashMidTransactionLeavesNoPartialChange` (helper subprocess begins a write and exits without commit).
- [X] T031 [US5] Implement `packages/store/tx.go`: `Tx` embedding the generated `*Queries` bound with `WithTx`, `(*Store).Begin(ctx) (*Tx, error)`, `Commit()`, `Rollback()` per `contracts/library-api.md`.
- [X] T032 [US5] Run US5 tests to green; `go vet ./...`.

**Checkpoint**: atomic units of work are available and tested.

---

## Phase 8: User Story 6 - Multiple applications share the store safely (Priority: P3)

**Goal**: Concurrent readers/writers across connections and processes stay consistent and fail cleanly.

**Independent Test**: `go test ./... -run 'TestSecondConnection|TestConflictingWrite|TestBusyAcrossProcesses'`.

- [X] T033 [US6] Write tests `packages/store/concurrency_test.go`: `TestSecondConnectionSeesCommittedChange`, `TestConflictingWriteWaitsOrIsBusy` (second write either succeeds within the 5s busy timeout or returns `IsBusy`; data intact), `TestBusyAcrossProcesses` (re-exec the test binary as a helper holding `BEGIN IMMEDIATE`).
- [X] T034 [US6] Run US6 tests; adjust pool/busy behavior in `packages/store/store.go` only if the tests expose a defect; confirm the guarantees are documented in `packages/store/knowledge/store.md`.

**Checkpoint**: all six stories are independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Repository consistency and final verification.

- [X] T035 [P] Update stale `packages/storage` references and the generation instructions in `README.md` to `packages/store` and `go tool sqlc generate`.
- [X] T036 Run the full gates: `go work sync`; `cd packages/store && go build ./... && go vet ./... && go test ./... -race`; `go tool sqlc generate && git diff --exit-code`; `make check-docs`.
- [X] T037 Validate `specs/013-store-library/quickstart.md` end to end (scenarios 1–9), update any drifted command names, and confirm the Constitution Check in `specs/013-store-library/plan.md` still holds (no domain tables, no wrapper layers, generated code in sync); run `rg -l "database/sql|modernc.org/sqlite" apps packages tools -g '*.go'` and confirm only `packages/store` files match.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies; T007 depends on T002, T003, T006.
- **Foundational (Phase 2)**: depends on Setup; blocks all stories.
- **User Stories (Phase 3+)**: all depend on Foundational. US1 (schema applier, `Open` complete) must precede US2, US3, US5, US6 tests; US4 can start after Setup because it documents the pipeline created there.
- **Polish (Phase 9)**: depends on all stories.

### Story Dependencies

- **US1 (P1)**: after Foundational — MVP.
- **US2 (P2)**: after US1 (uses the applier and fixtures).
- **US3 (P2)**: after US1; independent of US2.
- **US4 (P2)**: after Setup (documents `schema/`, `queries/`, and the generation pipeline); independent of US1–US3 runtime code.
- **US5 (P2)**: after US1; independent of US2–US4.
- **US6 (P3)**: after US5 (busy tests use transactions); independent otherwise.

### Parallel Opportunities

- Setup: T003, T004, T005, T006, T008 in parallel after T002.
- Foundational: T009, T011 in parallel; T012 and T013 in parallel after T010/T011 are written.
- US2, US3, US5, US6: separate test files, parallelizable once US1 lands.
- US4: T023, T024, T025, T026 in parallel (different files).

### Parallel Example: User Story 4

```bash
Task: "Create bundle scaffolding packages/store/knowledge/{index,schemas/index,queries/index}.md"
Task: "Write concepts packages/store/knowledge/{store,schemas/store,queries/ping}.md"
Task: "Create .agents/skills/documenting-with-okf/SKILL.md"
Task: "Create .agents/skills/adding-data-persistence/SKILL.md"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup (T001–T008) and Foundational (T009–T014).
2. Complete US1 (T015–T017).
3. **STOP and VALIDATE**: `go test ./...` and quickstart scenarios 1–6.

### Incremental Delivery

1. Setup + Foundational → pipeline and lifecycle ready.
2. US1 → typed store, MVP.
3. US4 → documentation and workflow (can be delivered in parallel with US2/US3/US5).
4. US2, US3, US5, US6 → additive evolution, atomicity, concurrency guarantees.
5. Polish → repository consistency and full gates.

---

## Notes

- [P] tasks touch different files and have no incomplete dependencies.
- Story labels map to `spec.md` user stories for traceability.
- Verify tests fail before implementing (constitution IV, red-green).
- Commit after each task or logical group with conventional messages.
- Never add domain tables to the store (decision C1) and never hand-edit generated `*.go` files.

---

## Phase: process store accessor (addendum 2026-09-16)

**Purpose**: `store.Must()` gives every consumer the one deployment store
without constructor threading or optional wiring. See the plan addendum.

- [ ] T038 Declare the `database` section in `packages/config/database/database.go` (`Path`, default `habbo.db`, non-empty validator), register it on `Config`, and add its unit tests per the `adding-config-sections` skill
- [ ] T039 [P] Add the full-pipeline tests `packages/config/database_pipeline_test.go` (create/defaults, missing key, explicit value, wrong type, empty value) using the `resetLoadState` helper
- [ ] T040 Implement `store.Must()` in `packages/store/store.go` over `config.Must().Database.Path` with a `sync.Once`-cached instance and panic-on-error semantics
- [ ] T041 [P] Write `packages/store/must_test.go` covering the accessor returning the opened store, caching across calls, and failure when the configured path cannot be opened
- [ ] T042 [P] Document the accessor in `packages/store/doc.go` and `packages/store/knowledge/store.md` (`Must()` in the contract, `Open(path)` for isolated stores)
- [ ] T043 Verify from `packages/config` and `packages/store`: config gates pass, `go vet ./...`/`go test ./...` pass, `make check-docs` exits 0, `go tool sqlc generate` leaves a clean diff
