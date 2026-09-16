# Phase 0 Research: Shared Configuration Layer

**Feature**: `016-shared-config` | **Date**: 2026-09-15

All technical unknowns from the plan's Technical Context are resolved below. Decisions marked "(user)" were chosen by the user during plan-time clarification; the rest follow directly from the spec and the project constitution.

## R1 — Missing keys keep declared defaults

**Decision**: Build the configuration by starting from a fully defaulted value and unmarshalling the file over it.

`Config` is instantiated with every declared default (`defaults() *Config` composes `Default<Field>()` functions), then `json.Unmarshal(fileBytes, cfg)` overwrites only the keys present in the file. Missing keys therefore keep their defaults (FR-006); present keys win (FR-007); a present wrong-typed value makes `Unmarshal` return an error and no fallback is applied (FR-008).

**Rationale**: Exactly the spec's precedence in the smallest amount of code; no merge pass, no pointer fields, no `map[string]any`.

**Alternatives considered**: (a) pointers everywhere plus a manual merge — more code and nil handling for no gain; (b) decode into `map[string]json.RawMessage` and read key by key — re-implements the standard decoder and obscures missing-key defaults; (c) two structs (zero + file) merged by hand — violates KISS.

## R2 — Once-only process-wide singleton

**Decision**: Package-level state guarded by `sync.Once`:

```go
var (
    once    sync.Once
    loaded  *Config
    loadErr error
)
```

`Load() (*Config, error)` runs the read/create/parse pipeline inside `once.Do` and returns the cached result on every later call; a failed load keeps returning the same error and never retries within the process.

**Rationale**: FR-010 and "inited only once"; `sync.Once` is the standard-library answer and is safe for concurrent consumers. Caching the error means a wrong configuration cannot ever start the program (C4).

**Alternatives considered**: (a) `init()` — cannot return an error and runs even when unused; (b) `sync.OnceValues` — equivalent but the explicit vars make the error cache and `Get`/`Must` layering obvious; (c) retry on later calls — contradicts "if config wrong just don't run" and would make behavior time-dependent.

## R3 — Public API: `Load`, `Must`, `Get` (user)

**Decision**:

```go
func Load() (*Config, error) // once-only read/create/parse
func Must() *Config          // returns Load()'s config, panics on error (template.Must shape)
func Get() *Config           // returns the singleton, calling Must(Load) on first use
```

`Must()` panics with the load error, exactly as `template.Must` panics on a bad template; `Get()` never returns nil because the user chose `Get()` to call `Must(Load)`.

**Rationale**: (user) `Must() *Config` panics; `Load() (*Config, error)` + `Must()` + `Get()`; `Get()` calls `Must(Load)`. FR-020 makes loading the first thing a program does, so panicking is the correct "stop before it runs" behavior.

**Alternatives considered**: `Must(cfg, err)` pass-through (rejected by the user); `Get` returning nil before load (rejected — nil dereference instead of a clear stop); renaming to `MustLoad` (no value).

## R4 — Creating `config.json` when absent

**Decision**: Read first; if the read returns `fs.ErrNotExist`, marshal the defaulted `Config` with `json.MarshalIndent` plus a trailing newline and write it with `os.WriteFile("config.json", data, 0o644)`; the written file is then used as the loaded content.

**Rationale**: FR-005 (create when absent). Configuration loads once at program initialization and programs are run one by one (C9), so no cross-process race handling is needed; a single stdlib write is the whole mechanism. Within one process `sync.Once` (R2) already guarantees a single load.

**Alternatives considered**: (a) exclusive create (`O_CREATE|O_EXCL`) with an `fs.ErrExist` fallback — complexity for contention the user ruled out; (b) temp file + `os.Rename` or `flock` — extra machinery for no benefit.

## R5 — Never rewriting an existing file

**Decision**: The only write in the package happens inside the create path (R4), triggered only by `fs.ErrNotExist` from the initial read. Parse, validation, and `Get` never write. Tests assert byte-for-byte equality after loading a hand-edited file.

**Rationale**: FR-011 and SC-003; the spec explicitly forbids inserting missing defaults, normalizing formatting, or dropping unknown keys.

**Alternatives considered**: rewriting after a successful load to "complete" the file — explicitly forbidden; backing up the file before writes — unnecessary because there are no writes.

## R6 — Unrecognized keys are ignored

**Decision**: Use plain `json.Unmarshal`; never call `Decoder.DisallowUnknownFields`. Keys the declared structs do not know are skipped by the decoder and remain untouched in the file.

**Rationale**: FR-015 and C7. LowerCamelCase tags (user decision) plus exact struct fields mean unknown keys are simply not mapped.

**Alternatives considered**: `DisallowUnknownFields` — fails on forward-compatible files, opposite of the spec; capturing unknowns into a `map` — nothing reads them (YAGNI).

## R7 — Errors name the file and the offending key (FR-009)

**Decision**: Wrap every failure as a `config: config.json: ...` error.

- Create/read failure other than "not exist": `config: config.json: <os error>`.
- Invalid JSON: `config: config.json: invalid JSON: <json syntax error>` (the syntax error carries the offset).
- Wrong type: format `*json.UnmarshalTypeError` as `<field>: expected <type>, got <value>`; the key is the JSON tag name (`UnmarshalTypeError.Field` uses the tag when present).
- Range/form rule: each `Validate<Field>` returns an error stating the expected form; the aggregating `Validate()` prefixes the key, and `Load` prefixes the file.

`Load` stops at the first error; no program continues (FR-008/FR-020).

**Rationale**: FR-009 requires file + key + expected form so the file can be fixed without reading code; stdlib error values already carry `Field`, `Value`, and `Type`.

**Alternatives considered**: a custom error type hierarchy — no consumer needs to inspect it (YAGNI); a token-walking `json.Decoder` for precise line numbers — more code than the spec's "name the key" requirement.

## R8 — Validation convention (user)

**Decision**: Symmetric to defaults, per field:

- `func Validate<Field>(value <Type>) error` lives beside `Default<Field>()` (in the section package, or in package `config` for a shared root setting).
- `func (s <Section>) Validate() error` calls each `Validate<Field>` and prefixes the key.
- `func (c *Config) Validate() error` calls the root settings' `Validate<Field>` and every section's `Validate()`; it returns nil today.
- `Load`/`parse` always calls `cfg.Validate()` after a successful unmarshal; defaults must satisfy their own validators (asserted by section tests).

**Rationale**: (user) `Validate<Field>` funcs plus aggregate `Validate()`. One declaration per setting carries its default and its rule (FR-019); no struct tags, no validator library, stdlib error values only.

**Alternatives considered**: struct tags — would need a hand-rolled tag parser or a dependency, both rejected by "standard library" and KISS; a single inline `Validate()` per section — rejected by the user; validating only when the key was present — defaults are declared to be valid, so uniform validation is simpler and catches a bad default immediately.

## R9 — Section packages and registration (user)

**Decision**: A section is an ordinary Go package at `packages/config/<section>` (directory name = package name = section name) inside the single `config` module. It declares:

```go
package <section>

type <Section> struct {
    <Field> <Type> `json:"<lowerCamelField>"`
}

func Default<Field>() <Type> { ... }
func Validate<Field>(value <Type>) error { ... }
func (s <Section>) Validate() error { ... }
```

The root registers it in `packages/config/config.go` in three places: a struct field `<Section> <section>.<Section> \`json:"<lowerCamelSection>"\``, the default composition in `defaults()`, and a `c.Validate()` call inside `Config.Validate()`. Sections never import package `config`; the root imports sections.

**Rationale**: (user) `packages/config/<Section>` locations, `Default<Field>()` shape, `type <Section> struct { ... }` shape, and `type Config struct { <Section> <Package>.<Type> }` registration. One module keeps `go.work` to a single new line and keeps section code a normal subpackage; static registration keeps the dependency direction one-way and the behavior greppable.

**Alternatives considered**: (a) separate Go module per section — forces a `go.work` edit and versioning per section for no benefit at this scale; (b) runtime registry with `init()` side-effect imports — hidden coupling, import cycles with the root, against KISS/YAGNI; (c) generics/reflection-driven registration — speculative abstraction, no requirement.

## R10 — Root/shared settings (user)

**Decision**: Project-wide settings are fields declared directly on `Config` in `packages/config/config.go`, each with its lowerCamelCase `json` tag, a `func Default<Field>() <Type>` in the same file, and a `func Validate<Field>(value <Type>) error` called by `Config.Validate()`. No shared setting is declared in this release (FR-013/FR-017).

**Rationale**: Spec C6/FR-018 and the user's "shared fields" directive; the root package is the only place shared settings need.

**Alternatives considered**: a `packages/config/shared` package — extra indirection for values that belong to the root (rejected by the user).

## R11 — JSON keys are lowerCamelCase (user)

**Decision**: Every `json` tag is explicit lowerCamelCase (`host`, `maxPlayers`). Section names in the root are lowerCamelCase too (`json:"server"`). Struct fields keep Go names.

**Rationale**: (user) lowerCamelCase. Explicit tags make the file contract independent of Go identifier changes.

**Alternatives considered**: all-lowercase and Go-name tags — rejected by the user.

## R12 — Standard library and module layout

**Decision**: `packages/config/go.mod` with module path `github.com/kronothepenguin/project-reborn/packages/config` (matching every existing module), `go.work` gains `./packages/config`. Imports are stdlib only: `encoding/json`, `os`, `io/fs`, `errors`, `fmt`, `sync`. Tests are `config_test.go` in package `config` beside the code (official Go layout), using `t.Chdir(t.TempDir())` so "working directory" behavior is testable without env vars.

**Rationale**: Constitution's Additional Constraints (one module per package, committed `go.work`, dev tools as tool directives — none needed here); the user's "standard library and official project structure".

**Alternatives considered**: a root `config` package outside `packages/` — breaks the packages/apps convention; `internal/` — the API is meant for consumers, it is not internal; `testdata/` fixtures — `t.Chdir` plus `t.TempDir()` is simpler and tests the real path.

## R13 — Authoring skill instead of one-off docs

**Decision**: Create `.agents/skills/adding-config-sections/SKILL.md` following the repository's skill conventions (frontmatter `name` + `description`; actionable instructions; verification steps; gotchas). It is the step-by-step workflow for adding a section or a shared setting, encodes R7–R11, and points at `packages/config/README.md` for the file contract.

**Rationale**: (user) asked for a skill; Constitution I requires the declaration rules to be defined before sections are built. A skill makes the workflow repeatable and is validated against the `reviewing-skills` skill during implementation.

**Alternatives considered**: a contributor guide in the README — static prose, easy to ignore; a code generator — speculative tooling (YAGNI) for a workflow that is three file edits.

## R14 — Base-layer tests vs. section tests

**Decision**: This release's tests cover everything the empty layer can express: create-on-absent with defaults, no rewrite on missing keys, explicit values win, invalid/empty JSON stops with a named file, unknown keys ignored, repeated calls return one instance, `Get`/`Must` panic behavior, and working-directory resolution. Type-error and range-error scenarios (US3) require a declared key, so the skill mandates them for the first real section; the layer mechanics (unmarshal errors + `Validate` call) are already in place and unit-tested where possible.

**Rationale**: FR-013/FR-017 forbid a setting now, so US3's wrong-value scenarios cannot exist yet; shipping a test-only setting would violate the spec. The skill closes the gap when the first section lands.

**Alternatives considered**: an internal example section behind a build tag — a second code path that is never exercised in the real build (KISS/YAGNI); skipping validation plumbing until the first section — leaves FR-008/FR-019 wiring undefined now.

## R15 — Documentation (user)

**Decision**: `packages/config/README.md`: `config.json` in the working directory is the project's single configuration source; no env vars; `Load`/`Must`/`Get`; defaults/validation; pointer to `adding-config-sections` for declaring settings.

**Rationale**: (user) README in the package; keeps root `README.md` untouched (FR-013) while satisfying FR-016.

**Alternatives considered**: root README section — touches unrelated docs; skill only — not discoverable as project documentation.
