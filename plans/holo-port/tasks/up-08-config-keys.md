---
type: Task
title: Offer config.json's new keys in housekeeping
description: packages/config finds the keys config.json lacks and the keys nothing reads, and housekeeping's update page lets an administrator fill the new keys and rewrite config.json.
status: todo
phase: up
depends_on: [up-05]
packages: [packages/config, packages/housekeeping]
holo: []
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

A release's new config.json keys reach the file from housekeeping, without anyone editing it by hand
([0070](/decisions/0070-housekeeping-applies-updates.md)).

# Steps

- [ ] `packages/config` compares config.json with the declared keys: the keys the file lacks, with their defaults, and
  the keys nothing reads, with their values.
- [ ] It rewrites config.json with the existing keys as they are, the new keys, and without the unused ones, after
  `Validate`, through a temporary file renamed over it.
- [ ] The update page lists both. Only the new keys are editable, saving says that the values apply at the next restart,
  and a staff log row records it.
- [ ] Tests: missing, unused and nested keys, a value that fails validation, an untouched file when nothing differs, and
  the permission.
- [ ] [How the programs work together](/reference/architecture.md) says that housekeeping writes config.json's new keys.

# Verification

```sh
# gofmt, go vet and go test -race in packages/config and packages/housekeeping
```

Breaking these on purpose must fail a test: an existing key changed by the rewrite, an unused key kept, and an invalid
value written.
