---
type: Task
title: Fix the tools/create templates
description: End every template with a newline, so that a generated project passes gofmt, and test it.
status: done
phase: p0
depends_on: []
packages: [tools/create]
holo: []
timestamp: 2026-11-01T18:19:33+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:19:33+00:00"}
---

# Goal

Generated code must pass the same checks as hand-written code, before `make create name=housekeeping` runs in HK-A.

# Steps

- [x] Every template ends with a newline.
- [x] A test generates a project and checks that each file ends with a newline and each `.go` file is formatted.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

Results (2026-11-01T18:19:33+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `tools/create`.
- `TestWriteGeneratesFormattedFiles` generates a project and checks each file. Against the old templates it failed on
  every template and on the three generated `.go` files.

# Notes

- `templates/packages/[[name]]/dist/index.html.tmpl` is hidden by `.gitignore` and was never committed, so only this
  machine generated a placeholder. [p0-21](/tasks/p0-21-make-install.md) moves that job to `make install`.
