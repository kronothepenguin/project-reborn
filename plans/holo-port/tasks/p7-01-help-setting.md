---
type: Task
title: Declare the help setting
description: help.messageMaxLength is declared with 65535 and labelled in housekeeping, in a Help form, so that staff set the longest question a help request takes.
status: todo
phase: p7
depends_on: []
packages: [packages/virtual, packages/housekeeping, tests/e2e]
holo: [source/holocms/iot/go.php]
timestamp: 2026-11-09T18:04:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:04:21+00:00"}
---

# Goal

The setting P7 reads exists, and housekeeping changes it ([0109](/decisions/0109-help-request-lengths.md)).

# Steps

- [ ] The catalogue declares `help.messageMaxLength` 65535, from 1 to 65535.
- [ ] Housekeeping labels it in a `Help` form after `Club`, as `Groups` and `Club` hold their numbers:
  `Question Length`, with the help `The most characters in the question of a help request.`
- [ ] Unit tests of the declaration and the form, and the `housekeeping-settings` browser suite checks the form.
- [ ] [Holo's differences](/reference/holo-differences.md) lists the `Help` form beside the `Club` form.

# Verification

```sh
# gofmt, go vet and go test -race in packages/virtual and packages/housekeeping
cd tests/e2e && node run.mjs housekeeping-settings
```

# Notes

- Runs on the branch `p7`.
