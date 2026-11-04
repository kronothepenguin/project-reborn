---
type: Task
title: Declare the staff page and tag fight settings
description: features.staffPage, the two staff boxes with Holo's headings, texts and colours, and features.tagFight are declared and labelled in a Staff Module form.
status: done
phase: p4
depends_on: [p4-01]
packages: [packages/virtual, packages/housekeeping]
holo: [source/holo/install.php, source/holo/housekeeping/content_tool.php]
timestamp: 2026-11-04T01:57:39+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:57:39+00:00"}
---

# Goal

The staff page's switch and boxes, and the tag fight's switch, are settings staff edit in housekeeping.

# Steps

- [x] `features.staffPage` (on), `staffPage.box1Heading`, `staffPage.box1Body`, `staffPage.box1Color`, and the same for box 2, with Holo's defaults from `install.php`.
- [x] The colours are `red`, `blue`, `white` and `green`, labelled Red, Blue, White (no Header) and Green.
- [x] `features.tagFight` (on), as the plan has it.
- [x] A Staff Module form in the Content Management box, with Holo's labels from its content tool, and the tag fight switch in Manage Site Content.
- [x] Tests for the defaults, the labels and the form.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && pnpm test housekeeping-settings
```

Results (2026-11-04T01:57:39+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/virtual` and `packages/housekeeping`.
- `pnpm test housekeeping-settings` passes all 26 checks: the Staff Module saves a multi-line BBCode body and a colour,
  and the screenshot `settings-staff` was read by eye.
- The tests find Holo's seven Staff Module fields with its labels and texts, in the order its content tool sorted them,
  two multi-line bodies and two colour lists with Holo's choices and `green` chosen, Holo's headings as defaults, the tag
  fight switch in Manage Site Content, and refuse a colour outside the list and a blank heading.
- Breaking these on purpose fails a test: a colour field typed, a body on one line, the fields out of order, `White (no
  Header)` labelled `White`, a heading allowed blank, and a changed default heading, which the housekeeping test catches.

Correction (2026-11-04T02:27:04+00:00):

- The check that the form has two multi-line fields and two lists was added after the last green run, and it counted
  the menu's copy of every form too, so `TestTheStaffModuleHasHolosFieldsInHolosOrder` failed in the commit that closed
  this task, and the breakages above were caught by a test that failed anyway.
- The test now reads the form from its own part of the page. `go test -race` passes in `packages/housekeeping`, and each
  breakage above, run again from a passing test, fails it. So does leaving the tag fight switch out of Manage Site
  Content, which `TestEverySettingHasARealLabel` catches.

# Notes

- The labels and help texts are Holo's `setting_title` and `setting_desc`, with `wether` spelled `whether` and
  `staff.php` called `/staff`, as Manage Site Content already did; the bodies add `BBCode is allowed here.`
- The bodies' defaults are Holo's texts as they were, `Holo Hotel` included.
