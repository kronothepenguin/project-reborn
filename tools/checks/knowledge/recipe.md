---
type: Reference
title: The check recipe
description: What `make check` runs in a project whose Makefile includes make/check.mk, in which order, and how a project adds its own steps.
resource: make/check.mk
---

# Including it

A project's `Makefile` includes the recipe with its path from the project folder:

```make
include ../../make/check.mk
```

Including it leaves the project's default goal as it was.

# Steps

The steps follow from the files of the project folder.

| File | Step | Command |
| --- | --- | --- |
| `go.mod` | `check-gofmt` | `gofmt -l` over `git ls-files '*.go'`; fails with `not formatted:` and the files |
| `go.mod` | `check-vet` | `go vet ./...` |
| `go.mod` | `check-gotest` | `go test ./... -race` |
| `go.mod` | `check-gobuild` | `go build -o /dev/null ./...`: builds and writes no program into the folder |
| `package.json` | `check-script-build`, `check-script-check`, `check-script-test` | `pnpm run --if-present <script>`: a script the package lacks is skipped |

- The steps run in parallel, in a second make started with `-j --output-sync=target`, so the lines of one step stay
  together.
- When the project has a `package.json`, `check-vet`, `check-gotest` and `check-gobuild` wait for the `build` script:
  a Go package embeds what its frontend builds (`//go:embed dist/*`), and loading the package fails without it.
- `gofmt` sees tracked files only: a new Go file counts once `git add` has run.

# A project's own steps

A project adds its targets as prerequisites of `check`:

```make
check: check-generated check-docs
```

They run first, one after another, then the shared steps run. Only the shared steps run in parallel, so the project's
other targets keep their order.
