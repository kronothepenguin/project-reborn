---
type: Task
title: Declare the staff page and tag fight settings
description: features.staffPage, the two staff boxes with Holo's headings, texts and colours, and features.tagFight are declared and labelled in a Staff Module form.
status: todo
phase: p4
depends_on: [p4-01]
packages: [packages/virtual, packages/housekeeping]
holo: [source/holo/install.php, source/holo/housekeeping/content_tool.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

The staff page's switch and boxes, and the tag fight's switch, are settings staff edit in housekeeping.

# Steps

- [ ] `features.staffPage` (on), `staffPage.box1Heading`, `staffPage.box1Body`, `staffPage.box1Color`, and the same for box 2, with Holo's defaults from `install.php`.
- [ ] The colours are `red`, `blue`, `white` and `green`, labelled Red, Blue, White (no Header) and Green.
- [ ] `features.tagFight` (on), as the plan has it.
- [ ] A Staff Module form in the Content Management box, with Holo's labels from its content tool, and the tag fight switch in Manage Site Content.
- [ ] Tests for the defaults, the labels and the form.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && pnpm test housekeeping-settings
```

# Notes

- None yet.
