---

description: "Task list for Shared Configuration Layer"
---

# Tasks: Shared Configuration Layer

**Input**: Design documents from `/specs/016-shared-config/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (config-file.md, library-api.md), quickstart.md

**Tests**: Required. Constitution IV mandates red-green, plan.md tests `Load`/`Must`/`Get` first, and quickstart.md defines the automated suite. Write tests, observe them FAIL, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. All stories P1 (US1–US3) are sequential because they share `packages/config/config.go` and `packages/config/config_test.go`; US4 (P2) is documentation/skill only and can run in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Go module root package: `packages/config/` (module `github.com/kronothepenguin/project-reborn/packages/config`, added to `go.work`)
- Section packages (future): `packages/config/<section>/`
- Skill: `.agents/skills/adding-config-sections/SKILL.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the new module in the workspace

- [X] T001 Create `packages/config/go.mod` declaring `module github.com/kronothepenguin/project-reborn/packages/config` and `go 1.27` (stdlib only, no requires)
- [X] T002 Add `./packages/config` to the `use` block in `go.work` and add `/config.json` to the root `.gitignore` (after T001: the `go.work` entry requires an existing module)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `Config` type and extension points every story builds on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create `packages/config/config.go` with the package skeleton: the `config.json` filename, `type Config struct{}`, unexported `defaults() *Config` returning `&Config{}`, and `func (c *Config) Validate() error` returning nil (extension point for sections/shared settings per contracts/library-api.md)

**Checkpoint**: `Config` exists and `go build ./...` passes in `packages/config`

---

## Phase 3: User Story 1 - One shared layer serves configuration from a single file (Priority: P1)

**Goal**: Consumers obtain configuration only through `config.Load`/`Must`/`Get`, which reads exactly `config.json` from the process working directory; no environment variable is consulted.

**Independent Test**: With `config.json` present in the working directory, a consumer reads it through the layer and the file is the only source (an env var pointing at another path changes nothing).

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T004 [US1] Write failing tests in `packages/config/config_test.go`: `TestLoadUsesWorkingDirectory` (t.Chdir(t.TempDir()), write `config.json`, `Load()` returns non-nil config and nil error; repeated `Load`/`Get` return the same instance) and `TestNoEnvironmentVariableConsulted` (t.Chdir with a valid `config.json`, t.Setenv `CONFIG`/`CONFIG_JSON` to a nonexistent path, `Load()` still succeeds from the working directory). Add a test helper that resets the package load state (`once`, cached config, cached error) and registers it with `t.Cleanup`, because load state is process-wide

### Implementation for User Story 1

- [X] T005 [US1] Implement `Load() (*Config, error)`, `Must() *Config`, and `Get() *Config` in `packages/config/config.go`: package-level `sync.Once` with cached `*Config` and cached `error`; `Load` reads exactly `config.json` from the working directory and unmarshals it over `defaults()`; `Must` panics with the load error (template.Must shape); `Get` calls `Must(Load)`; later calls return the cached instance or the cached error, never retrying (research R2/R3)

**Checkpoint**: US1 works with an existing file; `go test ./...` in `packages/config` passes

---

## Phase 4: User Story 2 - Missing configuration never blocks (Priority: P1)

**Goal**: No `config.json` means the layer creates `{}\n` from declared defaults; an existing file is never rewritten.

**Independent Test**: Consume configuration with no `config.json`; assert the file is created with declared defaults (empty object today) and returned; load a hand-edited file and assert its bytes are unchanged.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [US2] Write failing tests in `packages/config/config_test.go`: `TestLoadCreatesFileWhenAbsent` (no `config.json`; `Load()` succeeds and returns the defaults instance; file content is exactly `{}\n`; mode `0644`) and `TestLoadLeavesExistingFileByteIdentical` (write `{\n  "future": true\n}\n` by hand; bytes equal before and after `Load`; the unknown key is ignored, no defaults inserted, formatting not normalized) (FR-005, FR-011, FR-015, SC-003, SC-010)

### Implementation for User Story 2

- [X] T008 [US2] Implement the create-on-absent path in `packages/config/config.go`: when the initial read returns `fs.ErrNotExist`, marshal `defaults()` with `json.MarshalIndent` plus a trailing newline and write it with `os.WriteFile("config.json", data, 0o644)`; the written file is then used as the loaded content; keep the create path the only write in the package (research R4/R5)

**Checkpoint**: US1 and US2 both work; file creation and no-rewrite guarantees are test-verified

---

## Phase 5: User Story 3 - A wrong configuration stops the program (Priority: P1)

**Goal**: Invalid JSON, unreadable files, and later wrong-typed or out-of-range values stop the program before it runs, with an error naming `config.json` and the offending key with its expected form.

**Independent Test**: Place `{` and an unreadable `config.json` in the working directory and attempt `Load`/`Must`/`Get`; assert failure before use, error naming `config.json`, panic behavior, and no retry after correcting the file.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [US3] Write failing tests in `packages/config/config_test.go`: `TestLoadRejectsInvalidJSON` (file `{` and an empty file both fail with an error containing `config.json`) and `TestLoadRejectsUnreadableFile` (a directory named `config.json` fails with an error containing `config.json`) (FR-008, FR-009)
- [X] T010 [US3] Write failing tests in `packages/config/config_test.go`: `TestMustAndGetPanicOnFailure` (`Must` and `Get` panic with the load error) and `TestFailedLoadIsNotRetried` (invalid file fails; correct the file; `Load` still returns the same cached error; error strings identify the file) (C4, FR-020, research R2). Wrong-type and out-of-range scenarios require a declared key and land with the first section via the skill (research R14)

### Implementation for User Story 3

- [X] T011 [US3] Implement error reporting and validation in `packages/config/config.go`: wrap every read/create/parse failure as `config: config.json: <detail>`; format `*json.UnmarshalTypeError` as `<key>: expected <type>, got <value>` using `Field`, `Type`, and `Value`; call `cfg.Validate()` after a successful unmarshal; never fall back to a default for a present-but-invalid value and never continue after an error (research R7/R8, contracts/library-api.md)

**Checkpoint**: All P1 stories work; every failure stops before the program runs with the file and key named

---

## Phase 6: User Story 4 - The configuration grows one declared section at a time (Priority: P2)

**Goal**: The authoring conventions for adding a section or shared root setting are documented and repeatable, so future components extend the layer without changing existing declarations.

**Independent Test**: Read `packages/config/README.md` and `.agents/skills/adding-config-sections/SKILL.md`; confirm both describe the single-file contract, the three root registration points, and the mandatory defaults/validation/tests a new declaration must carry.

### Implementation for User Story 4

- [X] T012 [P] [US4] Write `packages/config/README.md` (FR-016): `config.json` in the working directory is the project's single configuration source; no environment variables; `Load`/`Must`/`Get`; defaults and validation conventions; pointer to the `adding-config-sections` skill (research R15)
- [X] T013 [P] [US4] Write `.agents/skills/adding-config-sections/SKILL.md` with frontmatter (`name`, `description`) and an actionable workflow: section package location `packages/config/<section>`, `type <Section> struct` with lowerCamelCase `json` tags, `Default<Field>()`, `Validate<Field>()`, section `Validate()`, the three root registration edits in `config.go` (struct field, `defaults()` composition, `Validate()` aggregation), shared root settings declared directly in `config.go`, mandatory section tests (create/defaults, missing key/default and explicit-value precedence, wrong type asserting the report names `config.json` and the key with the expected type, out of range), and gotchas (never rewrite the file, ignore unknown keys, no env vars, defaults must satisfy their validators) (research R9–R13, contracts/library-api.md)
- [X] T014 [US4] Validate `.agents/skills/adding-config-sections/SKILL.md` with the `reviewing-skills` skill and apply its findings (frontmatter, description quality, progressive disclosure, instruction clarity)

**Checkpoint**: A future developer can add a section following the skill alone

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification across all stories

- [X] T015 Run `gofmt -l .`, `go vet ./...`, and `go test ./...` from `packages/config`; fix any failure
- [X] T016 Run the quickstart.md manual scenarios from a scratch directory (first use creates `config.json`; a wrong configuration stops the program; a hand-edited file keeps identical hashes) and confirm the documented expectations
- [X] T017 [P] Audit the final diff to confirm FR-013/FR-017: only `go.work`, `.gitignore`, `packages/config/*`, and `.agents/skills/adding-config-sections/*` changed, no existing application or setting was added, and no environment variable is read anywhere in `packages/config/config.go`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup; BLOCKS all user stories
- **User Stories (Phases 3–6)**: Depend on Foundational completion
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational; no dependency on other stories
- **US2 (P1)**: After US1 — shares `config.go` and `config_test.go`
- **US3 (P1)**: After US2 — shares `config.go` and `config_test.go`
- **US4 (P2)**: After Foundational; documentation/skill only, so it can run in parallel with US1–US3 (different files)

### Within Each User Story

- Tests MUST be written and observed failing before implementation (Constitution IV)
- Read/create pipeline before error formatting; error formatting before panic/retry tests pass
- Story complete and `go test ./...` green before moving to the next priority

### Parallel Opportunities

- Setup: T002 depends on T001 (`go.work` must reference an existing module) → run sequentially
- US4: T012 and T013 are different files → run in parallel; both can proceed while US1–US3 are implemented
- Polish: T017 can run in parallel with T016
- US1 → US2 → US3 are sequential: same two files (`config.go`, `config_test.go`)

---

## Sequential Setup

```bash
# T002 requires T001 first (go.work must reference an existing module):
Task: "Create packages/config/go.mod with module github.com/kronothepenguin/project-reborn/packages/config"
Task: "Add ./packages/config to the use block in go.work and add /config.json to .gitignore"
```

## Parallel Example: User Story 4

```bash
# Launch both documentation tasks together (different files):
Task: "Write packages/config/README.md"
Task: "Write .agents/skills/adding-config-sections/SKILL.md"
```

---

## Implementation Strategy

### MVP First (P1 Stories: US1 + US2 + US3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US1 (single-file API)
4. Complete Phase 4: US2 (create when absent, never rewrite)
5. Complete Phase 5: US3 (invalid configuration stops with a named file/key)
6. **STOP and VALIDATE**: all P1 stories are required by the spec for a working layer — US1 alone cannot handle a missing file, US2 alone has no API, US3 alone cannot report errors. Test the three together
7. Deploy/demo the module

### Incremental Delivery

1. Setup + Foundational → module compiles
2. US1 → reads an existing `config.json` through `Load`/`Must`/`Get`
3. US2 → missing file is created from defaults; existing files untouched
4. US3 → wrong configuration stops the program with `config: config.json: <key>: <expected form>`
5. US4 → README and the `adding-config-sections` skill enable the next component to declare a section
6. Polish → gates, quickstart scenarios, FR-013 audit

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Tests are mandatory for this feature: Constitution IV (red-green), plan.md Testing, quickstart.md automated verification
- Test package is `config` (same package) so tests can reset package-level `sync.Once` state between cases; every test isolates the working directory with `t.Chdir(t.TempDir())`
- Wrong-type, out-of-range, and the missing-key/default and explicit-value precedence (FR-006, FR-007, SC-008) cannot be exercised until the first real section exists (FR-013/FR-017 forbid a setting now); the skill (T013) mandates those tests for the first section (research R14)
- No environment variables are ever read by the layer; tests may set them only to prove they are ignored
- Commit after each task or logical group with conventional commit messages
