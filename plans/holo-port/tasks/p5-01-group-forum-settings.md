---
type: Task
title: Declare the group and forum settings
description: The groups.* numbers, features.groupPurchase, features.forum and forum.spamSeconds are declared with Holo's values and labelled in housekeeping, in a Groups form, the content options and a Discussion Board Module form.
status: done
phase: p5
depends_on: []
packages: [packages/virtual, packages/housekeeping, tests/e2e]
holo: [source/holo/install.php, source/holo/housekeeping/content_tool.php]
timestamp: 2026-11-05T19:18:43+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:18:43+00:00"}
---

# Goal

The settings that P5 reads exist with Holo's values, and housekeeping changes them
([0082](/decisions/0082-group-limits-per-user-and-habbo.md), [0084](/decisions/0084-group-names-and-descriptions.md),
[0091](/decisions/0091-forum-spam-check.md)).

# Steps

- [x] The catalogue declares `groups.price` 20, `groups.maxOwned` 3, `groups.maxMemberships` 10,
  `groups.maxMembers` 500, `groups.nameMaxLength` 25 and `groups.descriptionMaxLength` 200, each with bounds.
- [x] It declares `features.groupPurchase` and `features.forum`, on as in Holo, and `forum.spamSeconds` 30.
- [x] Housekeeping labels them:
  - a `Groups` form for the numbers;
  - `Group Purchasing Enabled` with Holo's help in `Manage Content Options`, where Holo's General Options had it;
  - a `Discussion Board Module` form, Holo's content category 4, with `Forum Enabled`, `Smilies Enabled` (moved
    from `Manage Content Options`) and the spam seconds.
- [x] Unit tests of the declarations and the forms, and the `housekeeping-settings` browser suite checks the new forms.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && node run.mjs housekeeping-settings
```

Results (2026-11-05T19:18:43+00:00):

- `gofmt` and `go vet` pass in `packages/virtual` and `packages/housekeeping`; `go test -race` passes in both
  (the housekeeping package in 196 seconds).
- `node run.mjs housekeeping-settings housekeeping-banners` passes all 61 checks. The settings suite opens every form
  from the menu, finds `Forum Enabled`, `Smilies Enabled` and `Spam Check` in that order with 30 seconds, saves 45,
  finds Holo's six numbers in `Groups`, and `Group Purchasing Enabled` in place of `Smilies Enabled` in the content
  options. The banners suite finds `Discussion Board Module` after `Staff Module` in the Content Management box.
- The housekeeping tests find each new form with its texts, Holo's order and defaults, save every new kind of value,
  and refuse a name length over 100 and a spam check over 3600.
- Breaking these on purpose fails a test: the group switch under another key, `Smilies Enabled` left in the content
  options, a spam check of 31 seconds or with 1 as its least, 4 groups per user, a description of 255, and the board
  or the group switch off by default.

# Notes

- The plan's `groups` config section became settings in the catalogue, as every section did with FX.
- Each category of Holo's content tool is a link of its own, as `Staff Module` already was; `Discussion Board Module`
  follows it, in Holo's order of categories, and the credits page of P6 will go between them.
- `forum.spamSeconds` takes 0 to 3600, and 0 lets every post through. The bounds of the group numbers are ours: Holo
  wrote its values in its code.
- The [differences](/reference/holo-differences.md) list the `Groups` form and the board's form.
