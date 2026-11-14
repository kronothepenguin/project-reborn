---
type: Task
title: Housekeeping and the installer read their settings from the store
description: Housekeeping's and the installer's settings reads and writes go through packages/settings, and neither loads settings at start.
scope: [packages/housekeeping, packages/installer]
depends_on: [06-settings-package, 04-installer-under-installer]
skills: []
---

# Goal

Housekeeping and the installer hold no copy of the settings
([0006](/decisions/reborn/0006-settings-are-read-from-the-store.md)).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [Every program reads settings from the store, and nothing
  refreshes](/decisions/reborn/0006-settings-are-read-from-the-store.md)
- Runs after [platform 04](/features/platform/tasks/04-installer-under-installer.md), which changes
  the installer too.

# Steps

- [ ] Housekeeping's 14 reads, and its writes on the settings and note pages, go through `packages/settings` with the
  router's queries, or the transaction's inside a transaction. `housekeeping.New` no longer calls `settings.Load`.
- [ ] The installer's 9 reads and its writes in the site step go through `packages/settings`; `internal/setup` no
  longer calls `settings.Load`.
- [ ] The tests of both packages pass unchanged in what they check.

# Checks

```sh
make -C packages/housekeeping check
make -C packages/installer check
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/housekeeping`,
`packages/installer`.
