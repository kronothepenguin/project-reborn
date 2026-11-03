---
type: Task
title: Declare the homes settings
description: Declare homes.maxItems, homes.noteMaxLength, homes.maxTags and features.smilies with Holo's values, and label them on the settings forms.
status: done
phase: p3
depends_on: []
packages: [packages/virtual, packages/housekeeping]
holo: [source/holo/user_profile.php, source/holo/store.php, source/holo/tags_ajax.php, source/holo/install.php]
timestamp: 2026-11-03T17:31:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:31:18+00:00"}
---

# Goal

The limits of homes and the smilies switch are settings that staff can change.

# Steps

- [x] `homes.maxItems` 200, `homes.noteMaxLength` 500 and `homes.maxTags` 20, Holo's numbers.
- [x] `features.smilies`, on, the switch Holo read under the wrong key.
- [x] Labels and help on the housekeeping settings forms.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T17:31:18+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/virtual` and `packages/housekeeping`, and the tests of
  `packages/cms` and `packages/installer` pass.
- `pnpm test housekeeping-settings housekeeping-access` passes all 141 checks in a real browser, with the new `Homes` form
  among the settings that open.

# Notes

- Holo's code read `enable-smilies` while its install wrote `smilies-enabled`, so its smilies never showed. Here
  `features.smilies` is on by default, as Holo's install meant.
