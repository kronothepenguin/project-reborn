# Contract: `packages/config` Go API

**Feature**: `016-shared-config` | **Module**: `github.com/kronothepenguin/project-reborn/packages/config`

The package is the only configuration entry point. Consumers never parse `config.json` themselves (FR-003) and never read environment variables (FR-002).

## Public surface

```go
package config

type Config struct{} // empty in this release; sections and shared settings register here

func Load() (*Config, error) // once-only read/create/parse; returns the same instance/error afterwards
func Must() *Config          // Load() or panic on error — template.Must shape
func Get() *Config           // calls Must(Load); never returns nil
func (c *Config) Validate() error // validates declared settings; nil when none
```

- `Load` may be called from any goroutine; the first call performs the work, later calls reuse the result (FR-010).
- `Must` and `Get` panic with the load error; there is no fallback and no retry (C4, FR-020).
- Loading is the first thing a program does; no other component starts before it succeeds (FR-020).

## Errors

All load failures are wrapped as `config: config.json: <detail>`. The detail names the offending key and the expected form when a key is at fault (FR-009), e.g.:

- `config: config.json: invalid JSON: unexpected end of JSON input`
- `config: config.json: <key>: expected <type>, got <value>`
- `config: config.json: <key>: <expected form or range>`

Exact wording is not contractual; naming the file and the key with the expected form is.

## Section extension contract

A section is a package at `packages/config/<section>` inside this module (no separate `go.mod`). It MUST declare:

```go
package <section>

type <Section> struct {
    <Field> <Type> `json:"<lowerCamelField>"`
}

func Default<Field>() <Type>
func Validate<Field>(value <Type>) error
func (s <Section>) Validate() error
```

and package `config` MUST register it in `config.go`:

```go
import ".../packages/config/<section>"

type Config struct {
    <Section> <section>.<Section> `json:"<lowerCamelSection>"`
}

func defaults() *Config {
    return &Config{<Section>: <section>.<Section>{<Field>: <section>.Default<Field>()}}
}

func (c *Config) Validate() error {
    if err := c.<Section>.Validate(); err != nil { return err }
    return nil
}
```

A shared root setting is declared the same way but directly in `config.go`: a field on `Config` with its `json` tag, `Default<Field>()`, `Validate<Field>()`, and a call in `Config.Validate()`.

Invariants:

- One declaration per setting; every consumer uses the same declaration (FR-019).
- Defaults satisfy their validators; validators state the expected form/range.
- Sections never import package `config`; the dependency direction is parent → section.
- Adding a declaration changes no existing declaration, default, or rule (SC-006).
- No environment variables, no other configuration source (FR-002).

The step-by-step workflow, worked example, tests, and gotchas live in the `adding-config-sections` skill.
