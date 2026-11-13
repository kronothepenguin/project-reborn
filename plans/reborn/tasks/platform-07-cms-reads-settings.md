---
type: Task
title: The CMS reads its settings from the store
description: The CMS's settings reads go through packages/settings on each use, cms.New loads and refreshes nothing, and a benchmark of its pages before and after is recorded.
status: todo
slice: platform
depends_on: [platform-06]
packages: [packages/cms]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

The CMS shows a setting saved in housekeeping on the next page, with nothing refreshing
([0006](/decisions/0006-settings-are-read-from-the-store.md)).

# Steps

- [ ] First, a Go benchmark of a few pages through `httptest` on a temporary database (the front page signed out, `/me`,
  a community page): record `ns/op` and allocations here.
- [ ] Every `virtual/settings` getter of the CMS becomes `settings.String/Int/Bool(ctx, q, key)`: `q` is the router's
  queries, or the transaction's inside a transaction.
- [ ] `cms.New` no longer calls `settings.Load` nor schedules the reload every `cms.refresh` seconds. The clean-up of
  expired resets and sessions stays.
- [ ] The benchmark again; both results here.

# Verification

```sh
cd packages/cms && go vet ./... && go test ./... -race && go test -run '^$' -bench . ./...
make e2e
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-07`.
- The declaration of `cms.refresh` goes with [platform-09](/tasks/platform-09-game-reads-settings.md), its last reader.
