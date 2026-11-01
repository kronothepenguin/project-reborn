---
type: Task
title: Ask for the housekeeping port in the installer
description: The configuration step asks for both ports, as the plan's wizard does, because it is the one time the administrator sets them.
status: done
phase: hk-a
depends_on: [hk-a-02]
packages: [packages/installer]
holo: []
timestamp: 2026-11-01T22:54:09+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:54:09+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:54:09+00:00"}
---

# Goal

The administrator chooses the housekeeping port when installing, as the hotel port, and `config.json` holds it.

# Steps

- [x] The field on `config.astro`, filled with the default.
- [x] `HandleConfigWrite` reads it and refuses a value that is not a port.
- [x] Tests for the form, both refusals and the written file.

# Verification

```sh
pnpm --filter @project-reborn/installer build
cd packages/installer && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01T22:54:09+00:00):

- The installer builds, and `gofmt`, `go vet` and `go test -race` pass in `packages/installer`.
- With the handler writing the default port on purpose, the test failed with `housekeeping port out of range: 303 to "/site",
  want 422 to ""`.
- The final check of [the merge](/tasks/hk-a-13-merge-check.md) runs this form in a real browser.

# Notes

- None.
