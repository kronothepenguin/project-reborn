---
type: Task
title: Ask for the Housekeeping Address in the installer
description: site.housekeepingUrl defaults to the development address, and the installer's site step asks for it.
status: todo
phase: fx
depends_on: []
packages: [packages/virtual, packages/installer, packages/cms]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

The Housekeeping tab works on a new install.

# Steps

- [ ] `site.housekeepingUrl` defaults to `http://localhost:18465/housekeeping`.
- [ ] The field on the installer's site step, filled from the housekeeping port.
- [ ] Update `plans/holo-port/reference/architecture.md`.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
