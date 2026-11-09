---
type: Task
title: Handle the names whose folder the go tool treats specially
description: tools/create accepts internal, vendor and testdata, whose Go package names compile but whose folders the go tool treats specially, so the backend and fullstack projects made from them do not compile or are skipped by go vet ./....
status: done
phase: s0
depends_on: [s0-10]
packages: [tools/create]
client: []
timestamp: 2026-11-09T18:01:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T02:38:54+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:01:15+00:00"}
---

# Goal

Every name `tools/create` accepts makes, with the fullstack and the backend templates, Go that compiles and that the
gates check, as [s0-10](/tasks/s0-10-go-names-that-clash.md)'s goal says.

# Steps

- [x] Ask the user what `tools/create` does with a name whose folder the go tool treats specially: `internal`,
  `vendor` or `testdata`. Record the answer as a decision:
  [0026](/decisions/0026-refuse-names-the-go-tool-treats-specially.md).
- [x] `tools/create` does so for each such name.
- [x] Tests: for each template, each such name is handled as the decision says.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

In a throwaway worktree, `make create` with such names in both Go templates, then `go vet ./...` and
`go test ./... -race` in the folders it makes, if the decision makes any; then the worktree and its branch are
removed.

Results:

- In `tools/create`, `gofmt -l .` lists nothing, `go vet ./...` passes and `go test ./... -race` passes, with
  `TestValidateNameRefusesNamesTheGoToolTreatsSpecially`: the backend and fullstack templates refuse `internal`,
  `testdata` and `vendor` with `name cannot be <name>: the go tool treats a folder named <name> specially`, the client
  template takes them, and every template takes `inter-nal`, `test-data`, `ven-dor`, `internals` and `vendors`.
- The decision makes no project, so no throwaway worktree was needed: the built `create` exits 1 with that message for
  each of the three names in both Go templates, and makes nothing; with `-dry-run`, the client template exits 0 for
  each.

# Notes

- Found by [s0-10](/tasks/s0-10-go-names-that-clash.md) in its throwaway worktree, where every other name of 218
  compiled or was refused as [0025](/decisions/0025-refuse-names-whose-go-package-cannot-compile.md) says. The Go
  package names are not the cause: `inter-nal`, `ven-dor` and `test-data`, which give the same package names, compile.
  - `internal`: Go lets only code under `packages/` import a path that ends in `/internal`, so the runners fail with
    `use of internal package github.com/kronothepenguin/project-reborn/packages/internal not allowed`, in both
    templates.
  - `vendor`: the go tool reads a path through `packages/vendor` as a vendored one, so the package itself fails with
    `github.com/kronothepenguin/project-reborn/packages/vendor/internal/router must be imported as internal/router`, in
    both templates.
  - `testdata`: everything compiles, but the go tool's `./...` skips folders named `testdata`, so it never reaches
    `cmd/testdata`. In a backend, `go vet ./...` in `apps/testdata` matches no packages and exits 1, which fails
    `make gates`; in a fullstack project, the gates pass without checking its runner `cmd/testdata`.
- The client template has no Go, so these rules of the go tool do not reach it.
