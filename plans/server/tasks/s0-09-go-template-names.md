---
type: Task
title: Make the Go templates work for every name tools/create accepts
description: A fullstack or backend name with a '-' gives a Go package that does not compile, and a name that sorts after store gives imports that gofmt reorders; every name validateName accepts makes Go that compiles and passes gofmt.
status: todo
phase: s0
depends_on: [s0-02]
packages: [tools/create]
client: []
timestamp: 2026-11-06T17:54:14+00:00
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
- [ ] The generated Go passes `gofmt` for a name that sorts after `store`. Today `tracker` gives import blocks where
  `packages/tracker` comes before `packages/store`, which `gofmt` reorders.
- [ ] Tests: for both Go templates, a name with a `-` and a name after `store` are handled as the decision says, and
  the generated Go passes `gofmt`.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

In a throwaway worktree, `make create name=tracker` and `make create name=tracker2 template=backend`, then `gofmt -l`,
`go vet ./...` and `go test ./... -race` in their four folders, and the same for a name with a `-` if the decision
keeps such names; then the worktree and its branch are removed.

# Notes

- Found by [s0-02](/tasks/s0-02-create-templates.md). Both problems are older than it, and the fullstack template has
  them too; `plans/holo-port/tasks/hk-a-01-create-templates.md` noted the `-` one.
- Runs on the branch `s0`.
