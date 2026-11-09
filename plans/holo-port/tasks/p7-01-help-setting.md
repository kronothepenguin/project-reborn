---
type: Task
title: Declare the help setting
description: help.messageMaxLength is declared with 65535 and labelled in housekeeping, in a Help form, so that staff set the longest question a help request takes.
status: done
phase: p7
depends_on: []
packages: [packages/virtual, packages/housekeeping, tests/e2e]
holo: [source/holocms/iot/go.php]
timestamp: 2026-11-09T18:23:06+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:04:21+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:23:06+00:00"}
---

# Goal

The setting P7 reads exists, and housekeeping changes it ([0109](/decisions/0109-help-request-lengths.md)).

# Steps

- [x] The catalogue declares `help.messageMaxLength` 65535, from 1 to 65535.
- [x] Housekeeping labels it in a `Help` form after `Club`, as `Groups` and `Club` hold their numbers:
  `Question Length`, with the help `The most characters in the question of a help request.`
- [x] Unit tests of the declaration and the form, and the `housekeeping-settings` browser suite checks the form.
- [x] [Holo's differences](/reference/holo-differences.md) lists the `Help` form beside the `Club` form.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && node run.mjs housekeeping-settings
```

Results (2026-11-09T18:23:06+00:00):

- `gofmt` lists nothing and `go vet` passes in `packages/virtual` and `packages/housekeeping`; `go test -race` passes
  in both, the housekeeping package in 202 seconds.
- The `packages/virtual` test finds `help.messageMaxLength` at 65535, and 1 and 65535 taken, 0 and 65536 refused. The
  housekeeping tests find the `Help` form after `Club`, named `Help`, with `Question Length` of 65535 and its help,
  save 2000, and refuse 0 and 65536 with `help.messageMaxLength: must be between 1 and 65535`.
- `node run.mjs housekeeping-settings help forum housekeeping-users` passes all 165 checks: `housekeeping-settings`
  finds the `Help` form holding `Question Length` of 65535 and saves 2000, and `help` finds a question past the
  setting refused.

# Notes

- Runs on the branch `p7`.
