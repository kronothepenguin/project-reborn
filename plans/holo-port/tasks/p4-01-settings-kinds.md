---
type: Task
title: Edit long texts and choices in the settings
description: Housekeeping's settings forms gain a multi-line field and a field with a fixed list of choices, validated by the settings catalogue.
status: done
phase: p4
depends_on: []
packages: [packages/housekeeping, packages/virtual]
holo: [source/holocms/housekeeping/content_tool.php]
timestamp: 2026-11-04T01:49:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:49:04+00:00"}
---

# Goal

A setting can be a long text or one of a fixed list, edited as Holo's content tool did ([0077](/decisions/0077-staff-boxes-in-bbcode.md)).

# Steps

- [x] A field kind for long text, rendered as a multi-line field that keeps its line breaks.
- [x] A field kind for a fixed list of choices, each with a value and a label, rendered as a select.
- [x] The settings catalogue validates a choice against its list.
- [x] Tests: a long text with line breaks saved and shown again, a choice saved, a value outside the list refused.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && pnpm test housekeeping-settings
```

Results (2026-11-04T01:49:04+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/virtual` and `packages/housekeeping`.
- `pnpm test housekeeping-settings` passes all 24 checks; no declared setting uses the new fields until
  [p4-02](/tasks/p4-02-staff-settings.md).
- The tests size a long text as Holo's content tool did, one row per 60 characters from 2 to 10, mark a choice's
  selected value without touching the shared list, read Windows line ends as `\n`, refuse a blank required long text and
  a value outside the choices.
- Breaking these on purpose fails a test: the rows uncapped or counted per 30, the wrong choice selected, the shared list
  marked, any choice accepted, line ends kept, and a blank accepted.

# Notes

- The catalogue already had `oneOf`, used by `registration.defaultGender`; the choices reuse it.
