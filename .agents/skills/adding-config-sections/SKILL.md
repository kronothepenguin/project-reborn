---
name: adding-config-sections
description: Adds a startup key to config.json through packages/config: section package layout, lowerCamelCase json tags, per-field default and validate functions, root registration on Config, and the mandatory tests. Use when a program needs a value before the database opens (a path, a port) or when extending packages/config. Values that can change at runtime are settings declared in the packages/virtual catalogue instead.
---

# Adding configuration sections

`config.json` holds only the values a program needs before the database opens, such as the database path and the ports. A value that can change while the program runs (site name, maintenance, limits, toggles) is a setting: declare it in the catalogue of `packages/virtual` (see `packages/virtual/README.md`), not here. No consumer parses `config.json` or reads environment variables. Read `packages/config/README.md` for the file contract.

Decide where the key belongs:

| Key | Home |
| --- | --- |
| Read before the database opens, by one component | Section package `packages/config/<section>` |
| Read before the database opens, by the whole project | Field directly on `Config` in `packages/config/config.go` |
| Can change while the program runs | Not config: a setting in the `packages/virtual` catalogue |

## Workflow: add a section

1. Create `packages/config/<section>/<section>.go`:

   ```go
   package <section>

   type <Section> struct {
       <Field> <Type> `json:"<lowerCamelField>"`
   }

   func Default<Field>() <Type> { ... }

   func Validate<Field>(value <Type>) error { ... }

   func (s <Section>) Validate() error {
       if err := Validate<Field>(s.<Field>); err != nil {
           return fmt.Errorf("<lowerCamelField>: %w", err)
       }
       return nil
   }
   ```

2. Register the section in `packages/config/config.go` in exactly three places: the `Config` struct field, the `defaults()` composition, and the `Config.Validate()` aggregation.

   ```go
   import ".../packages/config/<section>"

   type Config struct {
       <Section> <section>.<Section> `json:"<lowerCamelSection>"`
   }

   func defaults() *Config {
       return &Config{<Section>: <section>.<Section>{<Field>: <section>.Default<Field>()}}
   }

   func (c *Config) Validate() error {
       if err := c.<Section>.Validate(); err != nil {
           return fmt.Errorf("<lowerCamelSection>.%w", err)
       }
       return nil
   }
   ```

   The section prefix makes every error name the full key path (`cms.port`), the same path `virtual.Settings` uses
   for the value (`GetInt("cms.port")`).

3. Add `packages/config/<section>/<section>_test.go` covering the unit behavior: `Default<Field>()` satisfies `Validate<Field>()`, `Validate<Field>()` accepts and rejects representative values, and the struct round-trips its lowerCamelCase `json` tags.

4. Add the full-pipeline tests in `packages/config` (`package config`, for example `packages/config/<section>_pipeline_test.go`) where the `resetLoadState` helper lives. Every case calls `t.Chdir(t.TempDir())`, resets the load state, and writes or omits `config.json`.

5. Run the gates from `packages/config`:

   ```sh
   gofmt -l . && go vet ./... && go test ./...
   ```

## Workflow: add a shared root key

1. In `packages/config/config.go`, add the field to `Config` with a lowerCamelCase `json` tag, and declare `Default<Field>()` and `Validate<Field>()` beside it.
2. Compose the default in `defaults()` and call `Validate<Field>(c.<Field>)` in `Config.Validate()`, prefixing the key in the returned error.
3. Add the same unit and full-pipeline tests.

## Mandatory tests for every declaration

Full-pipeline tests (package `config`):

- Create and defaults: with no `config.json`, `Load()` succeeds, the key holds its declared default, and the created file contains that default.
- Missing key: an existing file without the key returns the default; the file stays byte-identical.
- Explicit value: a value in the file wins over the default.
- Wrong type: a string where a number is declared fails; the error names `config.json` and the key with the expected type.
- Out of range: a value rejected by `Validate<Field>` fails; the error names the file, the key, and the allowed range.

Unit tests (section package):

- The default satisfies its validator.
- The validator accepts valid values and rejects invalid ones.
- The struct round-trips its lowerCamelCase `json` tags.

## Contribution checklist

```text
New configuration declaration:
- [ ] section package under packages/config/<section>, or root field in packages/config/config.go
- [ ] every field carries a lowerCamelCase json tag
- [ ] every field has Default<Field>() and Validate<Field>()
- [ ] Validate() aggregates the per-field rules and prefixes the key
- [ ] root registration in config.go: struct field, defaults(), Validate()
- [ ] defaults satisfy their own validators
- [ ] unit tests cover defaults, validators, and json tags
- [ ] full-pipeline tests in package config cover create/defaults, missing key, explicit value, wrong type, out of range
- [ ] gofmt -l ., go vet ./..., and go test ./... pass from packages/config
```

## Gotchas

- Never rewrite an existing file: the only write is the create-when-absent path, so missing keys and unknown keys stay as written.
- Ignore unrecognized keys: never call `json.DisallowUnknownFields`.
- No environment variables: `config.json` in the working directory is the only source.
- Defaults must satisfy their own validators; a bad default is a programming error the tests catch.
- Keys are lowerCamelCase, for section names and field tags alike.
- One declaration per key: every consumer uses the same `Default<Field>` and `Validate<Field>`.
- Sections never import package `config`; the dependency direction is parent to section.
- Adding a declaration changes no existing declaration, default, or rule.
- Loading happens once per process through `sync.Once`; only tests in package `config` can reset that state with the `resetLoadState` helper.
