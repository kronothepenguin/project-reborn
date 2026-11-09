---
type: Task
title: Add S2's settings
description: Declare the ten session parameters and the client version the server accepts in the settings catalogue, and edit them in housekeeping.
status: done
phase: s2
depends_on: []
packages: [packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-09T22:22:59+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:22:59+00:00"}
---

# Goal

The settings S2 reads exist in the settings catalogue and in housekeeping: the ten session parameters
([0034](/decisions/0034-session-parameters-are-settings.md)) and the client version the server accepts
([0033](/decisions/0033-one-client-version-from-the-site.md)).

# Steps

- [x] Ask the user the default of the client version, the `client.version.id` the site's external variables will give
  the client ([0033](/decisions/0033-one-client-version-from-the-site.md)); the answer becomes a decision:
  [0040](/decisions/0040-the-accepted-client-version-starts-at-1.md).
- [x] Declare the ten session parameters in `packages/virtual/settings`'s catalogue, with the defaults of
  [0034](/decisions/0034-session-parameters-are-settings.md) and the values the client reads ([hh_entry_init](/reference/r26/hh_entry_init.md), Session parameters): COPPA 0 to 2,
  the five flags 0 or 1, the date format a text with `dd`, `mm` and `yyyy`, the tracking header a text.
- [x] Declare the client version the server accepts.
- [x] Show them in a housekeeping settings form, as the Help form shows `help.messageMaxLength`.
- [x] Tests: the defaults and the ranges in `packages/virtual/settings`, and the form in `packages/housekeeping`.

# Verification

```sh
cd packages/virtual && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

Results:

- `gofmt -l packages/virtual packages/housekeeping` lists nothing.
- `go test ./... -race` passes in `packages/virtual`, with `TestTheGameSettingsHoldTheirDefaults`: the eleven `game.`
  settings hold the defaults of [0034](/decisions/0034-session-parameters-are-settings.md) and
  [0040](/decisions/0040-the-accepted-client-version-starts-at-1.md), the version refuses 0, COPPA refuses -1 and 3,
  and the date format refuses an empty text.
- `go test ./... -race` passes in `packages/housekeeping`, after `make frontends`, with
  `TestTheGameFormHoldsTheClientsSettings`: the Game form follows Help in the menu, shows the version and COPPA as
  numbers, the date format and the tracking header as texts, and the flags as toggles, profile editing on.
- `make gates` runs before the branch is merged.

The settings are `game.clientVersion`, `game.coppa`, `game.vouchers`, `game.parentEmailRequest`,
`game.parentEmailReregistration`, `game.directMail`, `game.dateFormat`, `game.partnerIntegration`,
`game.profileEditing`, `game.trackingHeader` and `game.tutorial`, in `packages/virtual/settings/catalogue.go`, and the
Game form in `packages/housekeeping/internal/router/sections.go`.

# Notes

- Runs on the branch `s2-settings`.
