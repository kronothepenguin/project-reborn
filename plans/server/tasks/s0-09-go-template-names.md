---
type: Task
title: Make the Go templates work for every name tools/create accepts
description: A fullstack or backend name with a '-' gives a Go package that does not compile, and a name that sorts after store gives imports that gofmt reorders; every name validateName accepts makes Go that compiles and passes gofmt.
status: done
phase: s0
depends_on: [s0-02]
packages: [tools/create]
client: []
timestamp: 2026-11-07T00:25:22+00:00
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:25:22+00:00"}
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T17:54:14+00:00"}
---

# Goal

Every name `tools/create` accepts makes, with the fullstack and the backend templates, Go that compiles and passes
`gofmt`.

# Steps

- [x] Ask the user what a fullstack or backend name with a `-` becomes: `validateName` accepts `a-b`, and the
  templates write `package a-b`, which does not compile. Record the answer as a decision:
  [0024](/decisions/0024-go-package-names-drop-the-dash.md), the Go package drops the dash, and folders and module
  paths keep it.
- [x] The templates follow [0024](/decisions/0024-go-package-names-drop-the-dash.md): `package gameserver` and the
  type `Gameserver` for `game-server`, whose runners import `gameserver "…/packages/game-server"` and call
  `gameserver.New`, while every folder, file name and module path keeps the dash.
- [x] The generated Go passes `gofmt` for a name that sorts after `store`. Today `tracker` gives import blocks where
  `packages/tracker` comes before `packages/store`, which `gofmt` reorders.
- [x] Tests: for both Go templates, a name with a `-` and a name after `store` are handled as the decision says, and
  the generated Go passes `gofmt`.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

In a throwaway worktree, `make create name=tracker` and `make create name=tracker2 template=backend`, then `gofmt -l`,
`go vet ./...` and `go test ./... -race` in their four folders, and the same for a name with a `-` if the decision
keeps such names; then the worktree and its branch are removed.

Run on 2026-11-07: `gofmt -l .` lists nothing, `go vet ./...` reports nothing, and the tests pass:

```text
ok  	github.com/kronothepenguin/project-reborn/tools/create/cmd/create	1.255s
```

- `TestWriteDropsTheDashFromThePackageName` checks, for both Go templates and `game-server`, `package gameserver`,
  the type `Gameserver`, the runners' import named `gameserver` and their calls of `gameserver.New`, `WithResolver`,
  `WithStatic` and `DistFS`, the module paths with the dash, and that no Go file uses `game-server.` as a name.
- `TestWriteSortsTheImports` checks the order of the import blocks for `tracker`, after `store`, in both templates, and
  for `admin`, before `astro`, in the fullstack one. `TestWriteImportsAPackageNamedAfterItsFolderPlainly` checks that a
  name without a dash is imported without a name, as before.
- `TestWriteGeneratesFormattedFiles` now runs every template with `probe`, `admin`, `tracker` and `game-server`.
- Broken on purpose: without the `go/format` step in `write`, `TestWriteGeneratesFormattedFiles` finds 8 files not
  formatted (backend `tracker`, fullstack `tracker` and `admin`) and `TestWriteSortsTheImports` fails 7 times. With
  `Package` keeping the dash, `write` refuses `game-server` (`1:13: expected ';', found '-'`) and both tests of
  `game-server` fail. Restored, all pass.
- The templates, rendered by the tool of `main` and by this one, give the same 144 files byte for byte for `demo`,
  `server`, `probe` and `housekeeping` in the three templates.
- In the throwaway worktree `s0-09-probe`, made from `s0` with these changes, `make create name=tracker`,
  `make create name=tracker2 template=backend`, `make create name=web-shop` and
  `make create name=game-server template=backend` each exited 0. In their eight folders `gofmt -l .` lists nothing, and
  `go vet ./...` and `go test ./... -race` pass; the four runners also build. The runner of `game-server` imports
  `gameserver "github.com/kronothepenguin/project-reborn/packages/game-server"` and calls `gameserver.New(db)`. The
  worktree and its branch were removed.

# Notes

- Found by [s0-02](/tasks/s0-02-create-templates.md). Both problems are older than it, and the fullstack template has
  them too; `plans/holo-port/tasks/hk-a-01-create-templates.md` noted the `-` one.
- Runs on the branch `s0`.
- `write` runs every Go file it renders through `go/format`, which sorts the imports as `gofmt` does, so the order no
  longer depends on the name. The same problem hit fullstack names that sort before `astro`, such as `admin`. A
  rendered Go file that does not parse now stops `create`, which removes the folders it made, as for any error of
  `write`.
- The type keeps the rule of the names without a dash: the package name with its first letter in upper case, so
  `game-server` gives `Gameserver`. No decision names it; this follows the existing rule.
- The runners name their import of a package whose name differs from its folder, as `goimports` writes such an import.
  A name without a dash is imported without a name, so today's projects come out as before.
- Still failing, found in the throwaway worktree: names whose Go package name is a Go keyword or `main`, or a name the
  generated Go already uses, such as `log`, `http`, `db` or `new`. They are [s0-10](/tasks/s0-10-go-names-that-clash.md).
