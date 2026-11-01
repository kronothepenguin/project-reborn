---
type: Task
title: Fix the tools/create templates
description: End every template with a newline, so that a generated project passes gofmt, and test it.
status: todo
phase: p0
depends_on: []
packages: [tools/create]
holo: []
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Generated code must pass the same checks as hand-written code, before `make create name=housekeeping` runs in HK-A.

# Steps

- [ ] Every template ends with a newline.
- [ ] A test generates a project and checks that each file ends with a newline and each `.go` file is formatted.

# Verification

```sh
cd tools/create && gofmt -l . && go vet ./... && go test ./... -race
```

# Notes

- None yet.
