---
type: Task
title: Edit long texts and choices in the settings
description: Housekeeping's settings forms gain a multi-line field and a field with a fixed list of choices, validated by the settings catalogue.
status: todo
phase: p4
depends_on: []
packages: [packages/housekeeping, packages/virtual]
holo: [source/holo/housekeeping/content_tool.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

A setting can be a long text or one of a fixed list, edited as Holo's content tool did ([0077](/decisions/0077-staff-boxes-in-bbcode.md)).

# Steps

- [ ] A field kind for long text, rendered as a multi-line field that keeps its line breaks.
- [ ] A field kind for a fixed list of choices, each with a value and a label, rendered as a select.
- [ ] The settings catalogue validates a choice against its list.
- [ ] Tests: a long text with line breaks saved and shown again, a choice saved, a value outside the list refused.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && pnpm test housekeeping-settings
```

# Notes

- None yet.
