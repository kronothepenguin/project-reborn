# config

Shared configuration layer for Project Reborn. `config.json` in the process working directory is the project's only configuration source; environment variables are never consulted. It holds only the values a program needs before the database opens, such as the database path and the ports. Values that can change while a program runs (site name, maintenance, limits) are settings: they are declared in `packages/virtual` and stored in the database, never here.

## Usage

```go
package main

import "github.com/kronothepenguin/project-reborn/packages/config"

func main() {
	cfg := config.Get() // or config.Load() for the error
	_ = cfg.CMS.Port
}
```

- `Load() (*Config, error)` reads or creates `config.json` once per process and caches the result.
- `Must() *Config` returns the loaded configuration or panics with the load error, like `template.Must`.
- `Get() *Config` is the singleton accessor; the first call goes through `Must()`.
- `Create(cfg *Config) error` validates `cfg` and writes it as `config.json`, failing with an error that wraps `fs.ErrExist` when the file already exists. Only the installer calls it, and it must do so before anything calls `Load`, which would create the file with the defaults.

Loading is the first thing a program does. An unreadable file, invalid JSON, or a wrong value stops the program before it runs, with an error naming `config.json` and the full key path, for example `config: config.json: cms.port: must be between 1 and 65535, got 70000`.

## File behavior

- Absent `config.json`: created with the declared defaults (pretty-printed JSON plus a trailing newline, mode `0644`).
- Key missing from an existing file: the declared default is returned; the file is not modified.
- Key present: the file's value wins over the default.
- Existing files are never rewritten: formatting, ordering, and unrecognized keys stay as written. `Create` writes only when the file is absent.
- Keys are lowerCamelCase.

## Declared keys

| Key | Type | Default | Allowed |
| --- | --- | --- | --- |
| `store.path` | string | `habbo.db` | non-empty, no `?` or `#` |
| `cms.port` | int | 17387 | 1–65535 |

`virtual.Settings` exposes these values under the same key paths (`GetInt("cms.port")`), and a settings row never overrides them.

## Declaring keys

A key belongs here only when a program reads it before the database opens. Components add sections and shared root keys, one declaration at a time, each with its own default and validation rule. The step-by-step workflow, worked example, tests, and gotchas live in the `adding-config-sections` skill at `.agents/skills/adding-config-sections/SKILL.md`.

Conventions:

- Default per field: `func Default<Field>() <Type>`.
- Validation per field: `func Validate<Field>(value <Type>) error`; the section's `Validate()` prefixes the field key and `Config.Validate()` prefixes the section key, so errors carry the full key path.
- A section lives in its own package under `packages/config/<section>` and registers on `Config` in `config.go`; a shared key is declared directly on `Config`.
- Defaults must satisfy their own validators.

Gates, from `packages/config`:

```sh
gofmt -l .
go vet ./...
go test ./...
```
