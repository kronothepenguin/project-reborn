---
type: Task
title: Declare the homes settings
description: Declare homes.maxItems, homes.noteMaxLength, homes.maxTags and features.smilies with Holo's values, and label them on the settings forms.
status: todo
phase: p3
depends_on: []
packages: [packages/virtual, packages/housekeeping]
holo: [source/holo/user_profile.php, source/holo/store.php, source/holo/tags_ajax.php, source/holo/install.php]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

The limits of homes and the smilies switch are settings that staff can change.

# Steps

- [ ] `homes.maxItems` 200, `homes.noteMaxLength` 500 and `homes.maxTags` 20, Holo's numbers.
- [ ] `features.smilies`, on, the switch Holo read under the wrong key.
- [ ] Labels and help on the housekeeping settings forms.

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
