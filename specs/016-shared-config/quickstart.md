# Quickstart: Shared Configuration Layer

**Feature**: `016-shared-config` | **Date**: 2026-09-15

Runnable scenarios that prove the layer works end-to-end. File contract: [contracts/config-file.md](./contracts/config-file.md); API and section conventions: [contracts/library-api.md](./contracts/library-api.md).

## Prerequisites

- Go 1.27 or newer (workspace version in `go.work`).
- Repository checked out with `./packages/config` present in the `go.work` `use` block (added by this feature).
- No configuration is ever taken from environment variables; none of the scenarios below set one.

## Automated verification

From `packages/config`:

```sh
go vet ./...
go test ./...
```

Expected: both pass. The suite covers, with the empty base layer:

- no `config.json` → created with declared defaults and returned (SC-002, SC-010);
- declared key missing from an existing file → default returned and file bytes unchanged (SC-003);
- explicit values win over defaults (FR-007);
- invalid or empty JSON → load fails naming `config.json` (FR-008, FR-009);
- unknown keys ignored and left untouched (FR-015);
- `Get`/`Must` return the same instance and panic on a wrong configuration (C4);
- the file is read from the process working directory (SC-009);
- no environment variable is consulted (SC-005).

Wrong-type and out-of-range scenarios require a declared key; they arrive with the first section and are mandatory tests in the `adding-config-sections` skill. Until then the read pipeline already routes through `json.Unmarshal` and `Config.Validate()`.

## Manual scenario: first use creates the file

In a scratch directory, with a consumer whose module replaces the local package:

```sh
repo=/absolute/path/to/project-reborn
work=$(mktemp -d)
cd "$work"
cat > go.mod <<EOF
module scratch

go 1.27

require github.com/kronothepenguin/project-reborn/packages/config v0.0.0

replace github.com/kronothepenguin/project-reborn/packages/config => $repo/packages/config
EOF
cat > main.go <<'EOF'
package main

import (
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/config"
)

func main() {
	fmt.Printf("%+v\n", config.Must())
}
EOF
go mod tidy
go run .
ls -l config.json && cat config.json
```

Expected: the program runs; `config.json` exists, mode `0644`, containing a valid empty object (`{}\n`); a second `go run .` prints the same value and leaves the file byte-identical.

## Manual scenario: a wrong configuration stops the program

In the same scratch directory:

```sh
printf '{' > config.json
go run .
```

Expected: non-zero exit before `main` does any work; the panic message names `config.json` and the invalid JSON. Correct the file and re-run; the program runs.

## Manual scenario: hand-edited files are respected

```sh
printf '{\n  "future": true\n}\n' > config.json
sha256sum config.json
go run .
sha256sum config.json
```

Expected: the program runs (the unknown key is ignored by the layer) and both hashes are identical — the file was not rewritten (FR-011, FR-015).

## Documentation and skill checks

- `packages/config/README.md` states that `config.json` in the working directory is the single configuration source and points to the skill (FR-016).
- `.agents/skills/adding-config-sections/SKILL.md` exists and documents, with a worked example and verification steps: section package location `packages/config/<section>`, the struct/`Default<Field>`/`Validate<Field>`/`Validate` conventions, root registration on `Config`, lowerCamelCase keys, shared root settings, tests, and the gotchas (never rewrite the file, ignore unknown keys, no env vars, defaults must validate).
