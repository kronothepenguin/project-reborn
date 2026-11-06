---
type: Task
title: Declare the economy settings
description: The club prices, days and month limit, the credits page boxes in BBCode and the wardrobe slots are declared with Holo's values and labelled in housekeeping, in a Club form, the content options, a Credits Page form and the Homes form.
status: done
phase: p6
depends_on: []
packages: [packages/virtual, packages/housekeeping, tests/e2e]
holo: [source/holocms/install.php, source/holocms/housekeeping/content_tool.php, source/holocms/club_subscribe.php, source/holocms/club.php, source/holocms/account.php]
timestamp: 2026-11-06T23:08:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T22:30:17+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T23:08:21+00:00"}
---

# Goal

The settings that P6 reads exist with Holo's values, and housekeeping changes them
([0105](/decisions/0105-credits-boxes-in-bbcode.md)).

# Steps

- [x] The catalogue declares Holo's hard-coded club numbers: `club.price1Month` 20, `club.price3Months` 50,
  `club.price6Months` 80 and `club.daysPerMonth` 31, and `club.maxMonths` 6 from `hc-maxmonths`, where 0 means no
  limit; each with bounds.
- [x] It declares `creditsPage.box1Heading` `What are credits?`, `creditsPage.box1Body` (Holo's `credits1`),
  `creditsPage.box2Heading` `Get credits!` and `creditsPage.box2Body`, Holo's `credits2` in BBCode: `credits` in `[b]`,
  without the palm chair picture, and its four list items as lines that start with `* `.
- [x] It declares `homes.wardrobeSlots` 5.
- [x] Housekeeping labels them:
  - a `Club` form for the prices and the days, as `Groups` holds the group numbers;
  - `HC Months Limit` with Holo's help in `Manage Content Options`, where Holo's General Options had it;
  - a `Credits Page` form, Holo's content category 3, between `Staff Module` and `Discussion Board Module`, with
    Holo's labels and help, and the bodies in the BBCode editor with "BBCode is allowed here.", as the staff boxes;
  - `Wardrobe Slots` in the `Homes` form.
- [x] Unit tests of the declarations and the forms, and the `housekeeping-settings` browser suite checks the new
  forms.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && node run.mjs housekeeping-settings
```

Results (2026-11-06T23:08:21+00:00):

- `gofmt` and `go vet` pass in `packages/virtual` and `packages/housekeeping`; `go test -race` passes in both
  (the housekeeping package in 200 seconds).
- `node run.mjs housekeeping-settings housekeeping-banners` passes all 69 checks. The settings suite finds
  `HC Months Limit` of 6 after `Group Purchasing Enabled` in the content options, Holo's 20, 50 and 80 credits and 31
  days in `Club`, saves a month of 30 days, and finds `Wardrobe Slots` of 5 last in `Homes`. In `Credits Page` it finds
  `Credit Content Box 2 Heading`, `Credits Content Box 1`, `Credits Content Box 1 Heading` and
  `Credits Content Box 2` in that order with Holo's headings, both bodies in the BBCode editor, `credits` in bold and
  four lines that start with `* `; a box typed in and saved writes no row, so the editor gives Holo's text back as it
  was declared. The banners suite finds `Credits Page` between `Staff Module` and `Discussion Board Module`. The
  screenshot `settings-credits` was read by eye.
- The `packages/virtual` tests find Holo's values in all ten settings, the second box as five lines, and the bounds:
  each takes its edges and refuses what lies just beyond them. The housekeeping tests find the `Club` and
  `Credits Page` forms with their texts, Holo's order and defaults, only the bodies with the BBCode mark, Holo's help
  of `HC Months Limit`, save every new kind of value, `club.maxMonths` 0 among them, and refuse a month of 32 days, a
  month limit of -1, a blank credits heading and 21 wardrobe slots.
- Through `packages/cms/internal/bbcode`, the second box's default renders `<strong>credits</strong>` and a `<br />`
  before each `* ` line, so each way to earn credits stands on a line of its own, as Holo's `<li>` items did.
- Breaking these on purpose fails a test: a month of 30 days, a month limit with 1 as its least, a 6 months price of
  85, 6 wardrobe slots, the list on one line, `credits` in HTML, a heading allowed blank, Holo's typo fixed, the
  second heading moved after its body, a body without the editor, `HC Months Limit` moved to `Club`, its help without
  Holo's quotes, and `Wardrobe Slots` without a label. In the browser, the `Credits Page` moved after the
  `Discussion Board Module`, `credits` in upper-case codes, which the editor writes back in lower case, and the list on
  one line each fail a check.

# Notes

- Housekeeping keeps Holo's spelling, `Credit Content Box 2 Heading` among it.
- The `Credits Page` lists its fields as Holo's content tool sorted category 3, by title, as the Staff Module does, so
  Holo's misspelt `Credit Content Box 2 Heading` comes first. The labels and help are Holo's `setting_title` and
  `setting_desc`, `Credit Content Box 1` in the first heading's help included; the bodies add
  `BBCode is allowed here.`
- `HC Months Limit` keeps Holo's help and comes after `Group Purchasing Enabled`, where Holo's sort put it.
- The labels and help of the `Club` form and of `Wardrobe Slots` are ours, since Holo wrote those numbers in its code.
- The bounds are ours. A price takes 0 to 1,000,000 credits, as `groups.price` does; a month lasts 1 to 31 days; the
  month limit takes 0 to 120 months, and 0 lifts it; the wardrobe takes 1 to 20 slots. The credits boxes take the
  staff boxes' lengths: a heading of 1 to 100 characters and a body of up to 5000.
- `club` is now a form of its own, so the router's test of a setting declared later uses `example.*` in its place.
- The [differences](/reference/holo-differences.md) list the credits boxes in BBCode, the `Club` form and the
  wardrobe's slots in `Homes`.
