# Phase 1 Data Model: Shared Configuration Layer

**Feature**: `016-shared-config` | **Date**: 2026-09-15

This feature has no database. The entities are the configuration document, its Go representation, and the runtime state of the once-only load.

## Entity overview

| Entity | Spec ref | Go representation | Lifetime |
|--------|----------|-------------------|----------|
| Configuration file | FR-001, C5 | `config.json` in the working directory | On disk; created when absent, never rewritten |
| Root configuration | C6, FR-017 | `type Config struct{}` in package `config` | One per process, loaded once |
| Section | C6, FR-018 | Subpackage `packages/config/<section>` + `type <Section> struct{...}` | Compile time |
| Shared setting | C6, FR-018 | Field directly on `Config` plus `Default<Field>` / `Validate<Field>` in `config.go` | Compile time |
| Default | FR-004, FR-006 | `func Default<Field>() <Type>` | Compile time |
| Validation rule | FR-008, FR-019 | `func Validate<Field>(value <Type>) error` + aggregate `Validate()` | Compile time / load time |
| Consumer | FR-003 | Any Go code in the workspace calling `config.Load/Must/Get` | Runtime |
| Load state | FR-010, FR-020 | `sync.Once` + cached `*Config` + cached `error` | Process lifetime |

## Configuration file (`config.json`)

- **Location**: the process working directory, filename exactly `config.json`; no search, no override (C5, FR-014).
- **Content**: one JSON object. Each declared section is a property named by its lowerCamelCase tag; each shared setting is a property at the root (R10/R11).
- **Unknown properties**: preserved in the file, ignored by the loader (FR-015).
- **Ordering/formatting**: irrelevant on read; explicitly not normalized (FR-011).
- **Created form**: pretty-printed JSON of the declared defaults with a trailing newline, mode `0644`; with no declared setting it is a valid empty object plus a trailing newline (`{}\n`), satisfying SC-010.
- **Write policy**: created only when absent with `os.WriteFile` (mode `0644`); any other outcome of a read error stops the load (R4/R5).

## Root configuration (`Config`)

Empty in this release (FR-013, FR-017). The extension shape, applied later by the skill:

```go
type Config struct {
    // one field per section and per shared setting, e.g.
    // Server server.Server `json:"server"`
    // Port   int           `json:"port"`
}
```

Invariants:

- Field name is the declared name; `json` tag is its lowerCamelCase file key.
- A section field's type is the section struct from its subpackage (value, never pointer).
- A shared setting field has a `Default<Field>()` and a `Validate<Field>()` in package `config`.
- `defaults() *Config` constructs the instance with every declared default.
- `Config.Validate()` returns nil today; with declarations it calls each root `Validate<Field>` and each section's `Validate()`, prefixing root keys.

## Section (`packages/config/<section>`)

```go
package <section>

type <Section> struct {
    <Field> <Type> `json:"<lowerCamelField>"`
}

func Default<Field>() <Type> { ... }

func Validate<Field>(value <Type>) error { ... }

func (s <Section>) Validate() error { ... }
```

Invariants:

- Directory, package, and section name match; the type is `<Section>` PascalCase.
- Every field has exactly one `Default<Field>()` and one `Validate<Field>()`; defaults MUST satisfy their own validators.
- `Validate()` names its own keys in returned errors, so `Load` can report `config.json: <key>: <expected form>`.
- No section imports package `config`; only package `config` imports sections (one-way dependency).

## Load state machine

```text
unloaded ──Load/Must/Get──► loading ──success──► loaded   (*Config cached, error nil)
                                  └──failure──► failed   (*Config nil, error cached; never retried)
```

- `Load` drives the transition inside `sync.Once`; every caller observes the same `*Config` or the same `error` (R2).
- Read pipeline: `ReadFile` → `ErrNotExist` ? create-with-defaults : parse bytes → unmarshal over defaults → `Validate()`.
- `Must` converts `failed` into a panic; `Get` calls `Must(Load)` (user decision). There is no fallback path from `failed` (C4).
- No state transition writes to an existing file (FR-011).

## Validation rules

| Rule | Where | Failure outcome |
|------|-------|-----------------|
| File readable as JSON | `json.Unmarshal` | load error: `config: config.json: invalid JSON: ...` |
| Value matches its Go type | `json.Unmarshal` | load error: `config: config.json: <key>: expected <type>, got <value>` |
| Value satisfies `Validate<Field>` | `Config.Validate()` / section `Validate()` | load error naming file, key, expected form/range |
| Default satisfies `Validate<Field>` | section/root tests | test failure (a programming error) |
| Key missing | pre-filled defaults | default returned; file untouched |
| Key unrecognized | decoder skips | ignored; file untouched |

No rule ever falls back to a default for a present-but-invalid value (FR-008).
