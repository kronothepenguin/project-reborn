---
type: Task
title: Keep the dist placeholder template in tools/create
description: Restore the placeholder template a new app starts with and track it in git, so that every machine generates it.
status: todo
phase: p0
depends_on: [p0-21]
packages: [tools/create]
holo: []
timestamp: 2026-11-01T19:50:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T19:50:41+00:00"}
---

# Goal

A project made with `make create` has its `dist/index.html` from the template, as the user asked. [p0-21](/tasks/p0-21-make-install.md) removed that template.

# Steps

- [ ] Restore `templates/packages/[[name]]/dist/index.html.tmpl` with its text.
- [ ] Track it in git, because `.gitignore` hides every `dist/` and only this machine had it.
- [ ] A test checks that a generated project has the placeholder.
- [ ] The generated README says where the placeholder comes from.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

Then run `make create` on a clean checkout, and check that the generated package compiles.

# Notes

- None yet.
