---
type: Task
title: Generate dotfile templates in tools/create
description: tools/create embeds templates/* without all:, so the .air.toml template is never generated and make dev of a new app has no air config.
status: todo
phase: p0
depends_on: []
packages: [tools/create]
holo: []
timestamp: 2026-10-28T01:30:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-28T01:30:19+00:00"}
---

# Goal

`make create name=<app>` writes `apps/<app>/.air.toml` from its template, so `make dev` works in a fresh app.

# Steps

- [ ] Embed the templates with `all:` in `tools/create/cmd/create/writer.go`. `//go:embed templates/*` skips files
      whose names start with `.` or `_`.
- [ ] Rebuild the tool (`make tools`) and confirm that `make create name=<name> dry-run=1` lists `.air.toml`.

# Verification

```sh
cd tools/create && go build ./... && go vet ./... && go test ./...
make create name=probe dry-run=1 | grep -F .air.toml
```

# Notes

- Found in [p0-10](/tasks/p0-10-installer.md): the scaffold of `apps/installer` had no `.air.toml`, so it was written
  by hand from the template.
- `apps/cms/.air.toml` differs from the template only in `include_file`.
