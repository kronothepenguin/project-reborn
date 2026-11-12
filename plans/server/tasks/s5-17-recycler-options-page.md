---
type: Task
title: Port housekeeping's Recycler Options
description: Housekeeping gets HoloCMS's Recycler Options page, which saves the recycler's four settings and writes the staff log.
status: done
phase: s5
depends_on: [s5-16]
packages: [packages/housekeeping]
client: []
timestamp: 2026-11-12T01:20:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-12T01:20:05+00:00"}
---

# Goal

Staff set the recycler's rules as in HoloCMS ([0095](/decisions/0095-s5-builds-four-site-pieces.md)).

# Steps

- [x] The page of `source/holocms/housekeeping/recycler.php`, with its fields, Enable recycler, Minimum owned time,
  Session length and Session expire length, and its texts, saving [s5-16](/tasks/s5-16-recycler.md)'s settings and
  writing the staff log.
- [x] `plans/holo-port/reference/holo-housekeeping.md` lists the page as ported.
- [x] Tests.

# Verification

```sh
cd packages/housekeeping && go test ./... -race
make gates
```

Results:

- Housekeeping's settings gained the form Recycler Options, after Game, with HoloCMS's four fields: Enable recycler,
  Minimum owned time, Session length and Session expire length, for `recycler.enabled`, `recycler.minOwnedMinutes`,
  `recycler.sessionMinutes` and `recycler.timeoutMinutes`
  ([0119](/decisions/0119-recycler-options-is-a-settings-section.md)). `housekeeping.settings` opens it, and a save
  writes the staff log as every settings form does.
- A time-out no longer than the session is refused, by the settings' own rule.
- `plans/holo-port/reference/holo-housekeeping.md` lists `recycler` as ported.
- In `packages/housekeeping`, `go vet ./...` and the settings tests pass with `-race`,
  `TestRecyclerOptionsSavesTheRecyclersSettings` among them. `make gates` passes.

# Notes

- Runs on the branch `s5-recycler-options-page`.
- Settled before it started: the page is a section of housekeeping's settings, opened by `housekeeping.settings`
  ([0119](/decisions/0119-recycler-options-is-a-settings-section.md)).
- Chosen without asking: the labels and the help are HoloCMS's, with the unit, minutes, added to each time, which Holo
  never said, and a help of its own for Session expire length, which had none. The staff log's row is the settings
  forms' `settings.update` with the keys saved, in place of Holo's `Updated Server Settings (Recycler Options)`.
- [s5-16](/tasks/s5-16-recycler.md) alone fails housekeeping's `TestEverySettingHasARealLabel`, since its four settings
  have no form before this task: the two branches go to main together, through this one's gates.
