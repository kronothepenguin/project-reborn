---
type: Task
title: Ask for the Housekeeping Address in the installer
description: site.housekeepingUrl defaults to the development address, and the installer's site step asks for it.
status: done
phase: fx
depends_on: []
packages: [packages/virtual, packages/installer, packages/cms]
holo: []
timestamp: 2026-11-02T02:21:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:21:52+00:00"}
---

# Goal

The Housekeeping tab works on a new install.

# Steps

- [x] `site.housekeepingUrl` defaults to `http://localhost:18465/housekeeping`.
- [x] The field on the installer's site step, filled from the housekeeping port.
- [x] Update `plans/holo-port/reference/architecture.md`.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:21:52+00:00):

- `gofmt`, `go vet` and the tests pass in `packages/virtual`, `packages/installer`, `packages/cms` and `packages/housekeeping`.
- `make e2e` passed its checks. In a real browser, the site step offered housekeeping on the port chosen a step before, and the
  CMS's tab then led to it on a new install, with nothing to configure.
- Two breaks made on purpose were each caught: the address ignoring the chosen port, and the field not being saved.

# Notes

- None.
