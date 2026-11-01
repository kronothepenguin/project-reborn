---
type: Task
title: Label the settings of P2
description: Give the three settings P2 declared while HK-A was on its branch real labels on the settings forms.
status: done
phase: hk-a
depends_on: [hk-a-10]
packages: [packages/housekeeping]
holo: [source/holo/install.php]
timestamp: 2026-11-01T22:53:28+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:52:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:53:28+00:00"}
---

# Goal

`site.housekeepingUrl`, `registration.maxHabbosPerUser` and `features.birthdayNotifications` read like every other setting on the forms, instead of showing their keys.

# Steps

- [x] Add the three settings to the forms, with Holo's text for the birthday setting.
- [x] A test that every declared setting has a form and a real label.

# Verification

```sh
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01T22:53:28+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`.
- `TestEverySettingHasARealLabel` failed with `registration.maxHabbosPerUser has its key as its label` when that label was
  removed on purpose.

# Notes

- The forms keep their fallback, so a setting declared on another branch can still be edited at once. The test makes its
  label part of the next merge.
- Holo's text reads `wether`, which is spelled correctly here, as the other texts are.
