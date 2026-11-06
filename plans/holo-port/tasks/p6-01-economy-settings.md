---
type: Task
title: Declare the economy settings
description: The club prices, days and month limit, the credits page boxes in BBCode and the wardrobe slots are declared with Holo's values and labelled in housekeeping, in a Club form, the content options, a Credits Page form and the Homes form.
status: todo
phase: p6
depends_on: []
packages: [packages/virtual, packages/housekeeping, tests/e2e]
holo: [source/holocms/install.php, source/holocms/housekeeping/content_tool.php, source/holocms/club_subscribe.php, source/holocms/club.php, source/holocms/account.php]
timestamp: 2026-11-06T22:30:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
---

# Goal

The settings that P6 reads exist with Holo's values, and housekeeping changes them
([0105](/decisions/0105-credits-boxes-in-bbcode.md)).

# Steps

- [ ] The catalogue declares Holo's hard-coded club numbers: `club.price1Month` 20, `club.price3Months` 50,
  `club.price6Months` 80 and `club.daysPerMonth` 31, and `club.maxMonths` 6 from `hc-maxmonths`, where 0 means no
  limit; each with bounds.
- [ ] It declares `creditsPage.box1Heading` `What are credits?`, `creditsPage.box1Body` (Holo's `credits1`),
  `creditsPage.box2Heading` `Get credits!` and `creditsPage.box2Body`, Holo's `credits2` in BBCode: `credits` in `[b]`,
  without the palm chair picture, and its four list items as lines that start with `* `.
- [ ] It declares `homes.wardrobeSlots` 5.
- [ ] Housekeeping labels them:
  - a `Club` form for the prices and the days, as `Groups` holds the group numbers;
  - `HC Months Limit` with Holo's help in `Manage Content Options`, where Holo's General Options had it;
  - a `Credits Page` form, Holo's content category 3, between `Staff Module` and `Discussion Board Module`, with
    Holo's labels and help, and the bodies in the BBCode editor with "BBCode is allowed here.", as the staff boxes;
  - `Wardrobe Slots` in the `Homes` form.
- [ ] Unit tests of the declarations and the forms, and the `housekeeping-settings` browser suite checks the new
  forms.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && node run.mjs housekeeping-settings
```

# Notes

- Housekeeping keeps Holo's spelling, `Credit Content Box 2 Heading` among it.
