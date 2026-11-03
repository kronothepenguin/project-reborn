---
type: Task
title: Build housekeeping's update page
description: GET /housekeeping/updates lists the waiting and applied updates, and POST /housekeeping/updates saves a copy and applies the waiting ones, for holders of housekeeping.database or housekeeping.accessGroups.
status: todo
phase: up
depends_on: [up-04]
packages: [packages/housekeeping, packages/store]
holo: [source/holo/upgrade.php]
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

An administrator applies a release's updates from housekeeping
([0070](/decisions/0070-housekeeping-applies-updates.md)).

# Steps

- [ ] `GET /housekeeping/updates` lists the waiting updates with their number and title, and the applied ones with their
  date, newest first.
- [ ] `POST /housekeeping/updates` saves a copy, applies every waiting update in order, and writes a staff log row with
  the updates applied. A failure shows the update, its error and the copy's path.
- [ ] Holders of `housekeeping.database` or `housekeeping.accessGroups` may use the page, and anyone else gets the
  access-denied page.
- [ ] A link in the Configuration & Setup menu, with housekeeping's components
  ([0060](/decisions/0060-housekeeping-components.md)).
- [ ] Tests: the lists, applying, a failing update, the copy, the permission and the staff log.

# Verification

```sh
cd packages/housekeeping && gofmt -l . && go vet ./... && go test -race ./...
```

Breaking these on purpose must fail a test: the permission, the copy before applying, and the staff log row.

# Notes

- The page works while the hotel is open; [up-06](/tasks/up-06-close-while-waiting.md) closes the hotel around it.
