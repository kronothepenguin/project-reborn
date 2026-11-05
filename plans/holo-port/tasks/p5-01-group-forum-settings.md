---
type: Task
title: Declare the group and forum settings
description: The groups.* numbers, features.groupPurchase, features.forum and forum.spamSeconds are declared with Holo's values and labelled in housekeeping, in a Groups form, the content options and a Discussion Board Module form.
status: todo
phase: p5
depends_on: []
packages: [packages/virtual, packages/housekeeping, tests/e2e]
holo: [source/holo/install.php, source/holo/housekeeping/content_tool.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

The settings that P5 reads exist with Holo's values, and housekeeping changes them
([0082](/decisions/0082-group-limits-per-user-and-habbo.md), [0084](/decisions/0084-group-names-and-descriptions.md),
[0091](/decisions/0091-forum-spam-check.md)).

# Steps

- [ ] The catalogue declares `groups.price` 20, `groups.maxOwned` 3, `groups.maxMemberships` 10,
  `groups.maxMembers` 500, `groups.nameMaxLength` 25 and `groups.descriptionMaxLength` 200, each with bounds.
- [ ] It declares `features.groupPurchase` and `features.forum`, on as in Holo, and `forum.spamSeconds` 30.
- [ ] Housekeeping labels them:
  - a `Groups` form for the numbers;
  - `Group Purchasing Enabled` with Holo's help in `Manage Content Options`, where Holo's General Options had it;
  - a `Discussion Board Module` form, Holo's content category 4, with `Forum Enabled`, `Smilies Enabled` (moved
    from `Manage Content Options`) and the spam seconds.
- [ ] Unit tests of the declarations and the forms, and the `housekeeping-settings` browser suite checks the new forms.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && node run.mjs housekeeping-settings
```

# Notes

- The plan's `groups` config section became settings in the catalogue, as every section did with FX.
