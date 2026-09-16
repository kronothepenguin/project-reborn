# Implementation Plan: Shared Configuration Layer

**Branch**: `016-shared-config` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-shared-config/spec.md`. Implementation directives from the user: use the Go standard library and the official project layout to create a module in `packages/config` with its first file `packages/config/config.go`; declare `type Config struct{}`; parse `config.json` with the standard `json` package; the read function returns an error and the package provides a `Must` helper the way the standard `template` package does; the configuration is a process-wide singleton loaded once. Additionally, create the `adding-config-sections` skill so future settings are added as section packages under `packages/config/<Section>`, with shared root fields on `Config`, defaults as `func Default<Field>() <Type>`, structs as `type <Section> struct { <Field> <Type> `json:"<Name>"` }`, and root registration as `type Config struct { <Section> <Package>.<Type> }`.

## Summary

Deliver the shared configuration layer as a new Go module `github.com/kronothepenguin/project-reborn/packages/config` (standard library only, added to `go.work`). `config.go` declares an empty `type Config struct{}`, reads or creates `config.json` in the working directory, fills missing keys from declared defaults, validates present values, ignores unrecognized keys, never rewrites an existing file, creates the file only when absent, and exposes `Load() (*Config, error)`, `Must() *Config` (panics like `template.Must`), and `Get() *Config` (lazily `Must(Load)`s the singleton). Sections and shared root settings are added later, one at a time, following the conventions encoded in the new `adding-config-sections` skill; this release declares no setting (FR-013, FR-017). A short `packages/config/README.md` satisfies FR-016.

## Technical Context

**Language/Version**: Go 1.27 (workspace version in `go.work`); standard library only — `encoding/json`, `os`, `io/fs`, `errors`, `fmt`, `sync`, `testing`.

**Primary Dependencies**: None. No third-party packages, no env vars (FR-002).

**Storage**: A single plain-JSON file `config.json` in the process working directory (C5, FR-014); created with defaults only when absent (FR-005), never rewritten (FR-011).

**Testing**: `go vet ./...` and `go test ./...` from `packages/config` (stdlib `testing`; `t.Chdir(t.TempDir())` for working-directory isolation; repeated calls return the same instance, FR-010). Red-green per Constitution IV; section behavior tests land with the first real section, as the base layer declares no setting.

**Target Platform**: Any Go-supported platform (Linux is the development target).

**Project Type**: Library module in the monorepo `packages/` tree; no executable, no `cmd/`.

**Performance Goals**: Startup-only, one file read or one create; no runtime reload (out of scope).

**Constraints**: Wrong present value or unreadable file stops the program before it runs with the file and key named (FR-008, FR-009); unrecognized keys ignored and left untouched (FR-015); key casing lowerCamelCase; exactly-once load per process (FR-010); no setting in this release (FR-013, FR-017).

**Scale/Scope**: One module: `go.mod`, `config.go`, `config_test.go`, `README.md`; plus one skill; `go.work` gains one `use` line and `.gitignore` one entry. Root `Config` is empty.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
|------|--------|----------|
| I. Defined Before Built | PASS | Spec 016 (C1–C9 and its functional requirements) plus the plan-time clarifications recorded below define the layer; the skill is authored before any section is built, so no future section requires invention |
| II. No Silent Interpretation | PASS | Session 2026-09-15 resolved the four open points with the user: `Must()` panics on error; `Load() (*Config, error)` + `Must()` + `Get()`, with `Get()` calling `Must(Load)`; shared root settings and their defaults live in package `config` itself; sections are directories inside the one module and the skill is named `adding-config-sections`; validation is `Validate<Field>` funcs plus aggregate `Validate()`; JSON keys are lowerCamelCase; FR-016 docs live in `packages/config/README.md` |
| III. Specification-Driven Development | PASS | Feature flows through branch `016-shared-config` with `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`; tasks follow from `/speckit.tasks` |
| IV. Test & Verification Discipline | PASS | Tests first (red-green) for `Load`/`Must`/`Get` behavior; gates are `go vet ./...` + `go test ./...` in `packages/config`; the skill mandates section tests with each section |
| V. KISS | PASS | One file, one `sync.Once`, explicit static registration; pre-filled unmarshal target is the only merge mechanism; no reflection, no registry, no generics machinery |
| VI. YAGNI | PASS | Empty `Config`, no setting or placeholder (FR-013/FR-017); `Config.Validate()` is the load pipeline's validation step (FR-008/FR-019), a no-op nil return today, not a speculative abstraction layer; no early abstractions beyond the conventions the spec demands |
| VII. SOLID | PASS | `config` package owns layer mechanics only; each future section package owns one section's shape/defaults/validation; dependency direction is parent → section, never section → parent; no fat interfaces |
| Additional Constraints | PASS | New module is added to `go.work`; stdlib only; no JS touched; no secrets or env vars; sections are subpackages inside the `config` module (user directive), and the one-module-per-package rule applies to top-level packages |
| Development Workflow | PASS | Conventional commits; docs updated via `README.md`; no dev/build mode involved for a library |

**Post-Phase 1 re-check**: PASS — the design artifacts add no new dependency, setting, or abstraction; contracts match the gates above.

## Project Structure

### Documentation (this feature)

```text
specs/016-shared-config/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── config-file.md   # config.json contract
│   └── library-api.md   # Go API and section conventions
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created here)
```

### Source Code (repository root)

```text
packages/config/
├── go.mod                       # module github.com/kronothepenguin/project-reborn/packages/config
├── config.go                    # type Config struct{}, Load, Must, Get, read/create/parse/Validate
├── config_test.go               # layer behavior tests (stdlib testing)
├── README.md                    # FR-016: config.json is the single configuration source
└── <section>/                   # added later, one package per declared section
    ├── <section>.go             # type <Section> struct{...}, Default<Field>, Validate<Field>, Validate
    └── <section>_test.go

.agents/skills/adding-config-sections/
└── SKILL.md                     # section/shared-setting authoring workflow

.gitignore                       # MODIFIED: ignore the runtime config.json
go.work                          # MODIFIED: add ./packages/config to the use block
```

**Structure Decision**: A single Go module at `packages/config` following the official Go layout (module root package, tests beside the code, no `src/`, no `cmd/`). Sections are ordinary subpackages inside that module — directories `packages/config/<section>` — not separate modules, so `go.work` gains exactly one entry. Root registration is static: the section's struct type is a field of `Config` (`<Section> section.<Section>` with a lowerCamelCase `json` tag), its defaults are composed in `config.go`, and its `Validate()` is called by `Config.Validate()`. Sections never import package `config`; the dependency direction is one-way and testable.

## Complexity Tracking

> No Constitution Check violations. No entries required.
