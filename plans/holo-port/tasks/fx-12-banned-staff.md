---
type: Task
title: Send banned staff to the CMS
description: A banned user who opens housekeeping goes to site.url, where the CMS shows Holo's ban message.
status: todo
phase: fx
depends_on: []
packages: [packages/housekeeping]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

A banned staff member reads the same message as everyone else.

# Steps

- [ ] `Staff` redirects a banned user to `site.url` and leaves the session to the CMS.
- [ ] Update `plans/holo-port/reference/holo-differences.md`.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
