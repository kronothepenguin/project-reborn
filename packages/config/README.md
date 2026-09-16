# config

Shared configuration layer for Project Reborn. `config.json` in the process working directory is the project's only configuration source; environment variables are never consulted.

## Usage

```go
package main

import "github.com/kronothepenguin/project-reborn/packages/config"

func main() {
	cfg := config.Get() // or config.Load() for the error
	_ = cfg
}
```

- `Load() (*Config, error)` reads or creates `config.json` once per process and caches the result.
- `Must() *Config` returns the loaded configuration or panics with the load error, like `template.Must`.
- `Get() *Config` is the singleton accessor; the first call goes through `Must()`.

Loading is the first thing a program does. An unreadable file, invalid JSON, or a wrong value stops the program before it runs, with an error naming `config.json` and the offending key.

## File behavior

- Absent `config.json`: created with the declared defaults (`{}\n` today — pretty-printed JSON plus a trailing newline, mode `0644`).
- Key missing from an existing file: the declared default is returned; the file is not modified.
- Key present: the file's value wins over the default.
- Existing files are never rewritten: formatting, ordering, and unrecognized keys stay as written.
- Keys are lowerCamelCase.

## Declaring settings

The base layer declares no setting. Components add sections and shared root settings, one declaration at a time, each with its own default and validation rule. The step-by-step workflow, worked example, tests, and gotchas live in the `adding-config-sections` skill at `.agents/skills/adding-config-sections/SKILL.md`.

Conventions:

- Default per field: `func Default<Field>() <Type>`.
- Validation per field: `func Validate<Field>(value <Type>) error`; the section's `Validate()` and `Config.Validate()` aggregate the per-field rules.
- A section lives in its own package under `packages/config/<section>` and registers on `Config` in `config.go`; a shared setting is declared directly on `Config`.
- Defaults must satisfy their own validators.

Gates, from `packages/config`:

```sh
gofmt -l .
go vet ./...
go test ./...
```
