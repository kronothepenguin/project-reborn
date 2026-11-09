---
type: Task
title: Add S2's settings
description: Declare the ten session parameters and the client version the server accepts in the settings catalogue, and edit them in housekeeping.
status: todo
phase: s2
depends_on: []
packages: [packages/virtual, packages/housekeeping]
client: []
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
---

# Goal

The settings S2 reads exist in the settings catalogue and in housekeeping: the ten session parameters
([0034](/decisions/0034-session-parameters-are-settings.md)) and the client version the server accepts
([0033](/decisions/0033-one-client-version-from-the-site.md)).

# Steps

- [ ] Ask the user the default of the client version, the `client.version.id` the site's external variables will give
  the client ([0033](/decisions/0033-one-client-version-from-the-site.md)); the answer becomes a decision.
- [ ] Declare the ten session parameters in `packages/virtual/settings`'s catalogue, with the defaults of
  [0034](/decisions/0034-session-parameters-are-settings.md) and the values the client reads ([hh_entry_init](/reference/r26/hh_entry_init.md), Session parameters): COPPA 0 to 2,
  the five flags 0 or 1, the date format a text with `dd`, `mm` and `yyyy`, the tracking header a text.
- [ ] Declare the client version the server accepts.
- [ ] Show them in a housekeeping settings form, as the Help form shows `help.messageMaxLength`.
- [ ] Tests: the defaults and the ranges in `packages/virtual/settings`, and the form in `packages/housekeeping`.

# Verification

```sh
cd packages/virtual && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s2-settings`.
