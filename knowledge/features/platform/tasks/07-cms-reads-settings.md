---
type: Task
title: The CMS reads its settings from the store
description: The CMS's settings reads go through packages/settings on each use, cms.New loads and refreshes nothing, and a benchmark of its pages before and after is recorded.
scope: [packages/cms]
depends_on: [06-settings-package]
skills: []
---

# Goal

The CMS shows a setting saved in housekeeping on the next page, with nothing refreshing
([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md)
- The declaration of `cms.refresh` goes with [platform 09](/features/platform/tasks/09-game-reads-settings.md), its last
  reader.

# Steps

- [ ] First, a Go benchmark of a few pages through `httptest` on a temporary database (the front page signed out, `/me`,
  a community page): record `ns/op` and allocations in the report.
- [ ] Every `virtual/settings` getter of the CMS becomes `settings.String/Int/Bool(ctx, q, key)`: `q` is the router's
  queries, or the transaction's inside a transaction.
- [ ] `cms.New` no longer calls `settings.Load` nor schedules the reload every `cms.refresh` seconds. The clean-up of
  expired resets and sessions stays.
- [ ] The benchmark again; both results in the report.

# Checks

```sh
make -C packages/cms check
cd packages/cms && go test -run '^$' -bench . ./...
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`.
