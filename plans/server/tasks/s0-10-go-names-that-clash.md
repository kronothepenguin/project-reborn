---
type: Task
title: Handle the names whose Go package cannot compile
description: tools/create accepts names whose Go package name is a Go keyword or main, or a name the generated Go already uses, such as log, http, db or new, and the projects it makes from them do not compile.
status: todo
phase: s0
depends_on: [s0-09]
packages: [tools/create]
client: []
timestamp: 2026-11-07T00:25:22+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-07T00:25:22+00:00"}
---

# Goal

Every name `tools/create` accepts makes, with the fullstack and the backend templates, Go that compiles, as
[s0-09](/tasks/s0-09-go-template-names.md)'s goal says.

# Steps

- [ ] Ask the user what `tools/create` does with a name whose Go package name
  ([0024](/decisions/0024-go-package-names-drop-the-dash.md)) the generated Go cannot use: a Go keyword such as `func`
  or `go`, `main`, or a name the generated files already use. Record the answer as a decision.
- [ ] `tools/create` does so for every such name, including the names that become one once their dashes are dropped
  (`go-to` gives `goto`).
- [ ] Tests: for both Go templates, each such name is handled as the decision says.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

In a throwaway worktree, `make create` with such names in both Go templates, then `go vet ./...` and
`go test ./... -race` in the folders it makes, if the decision makes any; then the worktree and its branch are
removed.

# Notes

- Found by [s0-09](/tasks/s0-09-go-template-names.md) in its throwaway worktree, once the dash and the import order were
  fixed. `go vet ./...` fails in the folders made for these names:
  - with both templates: `main` ("is a program, not an importable package"); `log` and `http`, which the runners
    import ("redeclared in this block"); `db`, the runners' variable, which hides the package (`db.New undefined`); and
    `new`, whose type `New` meets the function `New` ("redeclared in this block");
  - with the fullstack template, besides those: `fs`, `url` and `httputil`, which its runners import; `err`,
    `resolver` and `proxy`, variables of its runners; `nil`, which its runners compare with `err`; and `option`, whose
    type meets `Option`.
- A Go keyword such as `func` makes nothing since s0-09: the generated Go does not parse, so `create` stops with
  `create: templates/backend/apps/[[name]]/cmd/[[name]]/main.go.tmpl: 14:11: expected '(', found '.'` and removes the
  folders it made.
- `c`, `mux`, `server`, `router`, `sql` and `embed` compile, and so does `nil` with the backend template.
