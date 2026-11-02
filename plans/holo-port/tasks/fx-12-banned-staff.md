---
type: Task
title: Send banned staff to the CMS
description: A banned user who opens housekeeping goes to site.url, where the CMS shows Holo's ban message.
status: done
phase: fx
depends_on: []
packages: [packages/housekeeping]
holo: []
timestamp: 2026-11-02T02:36:34+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T02:36:34+00:00"}
---

# Goal

A banned staff member reads the same message as everyone else.

# Steps

- [x] `Staff` redirects a banned user to `site.url` and leaves the session to the CMS.
- [x] Update `plans/holo-port/reference/holo-differences.md`.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T02:36:34+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`.
- `make e2e` passed all 374 checks. In a real browser, a banned user who opened housekeeping read Holo's message on the CMS, and
  their session was gone afterwards.
- A break made on purpose, letting a banned user in, was caught.

# Notes

- `together` had a race from [fx-10](/tasks/fx-10-settings-refresh.md): it waited for the first setting it had saved, then read
  the last one at once. It waits for that one too now, and passed three times in a row.
