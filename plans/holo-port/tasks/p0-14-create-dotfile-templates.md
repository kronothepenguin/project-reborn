---
type: Task
title: Generate dotfile templates in tools/create
description: tools/create embeds templates/* without all:, so the .air.toml template is never generated and make dev of a new app has no air config.
status: done
phase: p0
depends_on: []
packages: [tools/create]
holo: []
timestamp: 2026-10-28T01:42:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:30:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:42:49+00:00"}
---

# Goal

`make create name=<app>` writes `apps/<app>/.air.toml` from its template, so `make dev` works in a fresh app.

# Steps

- [x] Embed the templates with `all:` in `tools/create/cmd/create/writer.go`. `//go:embed templates/*` skips files
      whose names start with `.` or `_`.
- [x] Rebuild the tool (`make tools`) and confirm that `make create name=<name> dry-run=1` lists `.air.toml`.

# Verification

```sh
cd tools/create && go build ./... && go vet ./... && go test ./...
make create name=probe dry-run=1 | grep -F .air.toml
```

Results (2026-10-28T01:42:49+00:00):

- `go build ./...` and `go vet ./...` pass, and `go test ./...` is ok with 3 tests.
- The new test, `writer_test.go`, renders the templates into a temporary root and reads the generated `.air.toml`. It
  passes with `all:templates` and fails with the old `templates/*`.
- After `make tools`, `make create name=probe dry-run=1` lists `apps/probe/.air.toml`. Nothing was created.

# Notes

- Found in [p0-10](/tasks/p0-10-installer.md): the scaffold of `apps/installer` had no `.air.toml`, so it was written
  by hand from the template.
- `apps/cms/.air.toml` differed from the template only in `include_file`.
- [p0-15](/tasks/p0-15-runners-from-root.md) extended the test to check the root-relative runner files.
