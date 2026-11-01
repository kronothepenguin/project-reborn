---
type: Task
title: Keep the dist placeholder template in tools/create
description: Restore the placeholder template a new app starts with and track it in git, so that every machine generates it.
status: done
phase: p0
depends_on: [p0-21]
packages: [tools/create]
holo: []
timestamp: 2026-11-01T19:53:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:53:31+00:00"}
---

# Goal

A project made with `make create` has its `dist/index.html` from the template, as the user asked. [p0-21](/tasks/p0-21-make-install.md) removed that template.

# Steps

- [x] Restore `templates/packages/[[name]]/dist/index.html.tmpl` with its text.
- [x] Track it in git, because `.gitignore` hides every `dist/` and only this machine had it.
- [x] A test checks that a generated project has the placeholder.
- [x] The generated README says where the placeholder comes from.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

Then run `make create` on a clean checkout, and check that the generated package compiles.

Results (2026-11-01T19:53:31+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `tools/create`, with a new test for the placeholder.
- On a clean worktree of this task's tree, `make install` and `make create name=probe` exited 0. The generated
  `packages/probe/dist/index.html` came from the template, `gofmt -l` listed nothing, and `./apps/probe/...` and
  `./packages/probe` compiled.

# Notes

- The template was never committed, because the root `.gitignore` hides every `dist/`, so [p0-21](/tasks/p0-21-make-install.md)
  deleted the only copy. It is restored from its text in that session, and now tracked with `git add -f`.
- A new project gets its placeholder from this template, and `make install` writes one on a fresh clone of a project, whose
  `dist/` is ignored. Each covers a different moment.
