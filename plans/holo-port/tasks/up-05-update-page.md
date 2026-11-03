---
type: Task
title: Build housekeeping's update page
description: GET /housekeeping/updates lists the waiting and applied updates, and POST /housekeeping/updates saves a copy and applies the waiting ones, for holders of housekeeping.database or housekeeping.accessGroups.
status: done
phase: up
depends_on: [up-04]
packages: [packages/housekeeping, packages/store]
holo: [source/holo/upgrade.php]
timestamp: 2026-11-03T22:26:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T22:26:12+00:00"}
---

# Goal

An administrator applies a release's updates from housekeeping
([0070](/decisions/0070-housekeeping-applies-updates.md)).

# Steps

- [x] `GET /housekeeping/updates` lists the waiting updates with their number and title, and the applied ones with their
  date, newest first.
- [x] `POST /housekeeping/updates` saves a copy, applies every waiting update in order, and writes a staff log row with
  the updates applied. A failure shows the update, its error and the copy's path.
- [x] Holders of `housekeeping.database` or `housekeeping.accessGroups` may use the page, and anyone else gets the
  access-denied page.
- [x] A link in the Configuration & Setup menu, with housekeeping's components
  ([0060](/decisions/0060-housekeeping-components.md)).
- [x] Tests: the lists, applying, a failing update, the copy, the permission and the staff log.

# Verification

```sh
cd packages/housekeeping && gofmt -l . && go vet ./... && go test -race ./...
```

Breaking these on purpose must fail a test: the permission, the copy before applying, and the staff log row.

Results (2026-11-03T22:26:12+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, and `make check-docs` passes in
  `packages/store`.
- `pnpm test housekeeping-admin housekeeping-access` passes all 182 checks: the administrator reaches the page from the
  Configuration & Setup menu and finds the four updates applied, and a helper gets Access Denied on it, for a GET and a
  POST.
- The tests list the waiting and the applied updates newest first, apply them after a copy that holds the database from
  before them, write the staff log row, show which update failed with the copy's path, apply nothing when nothing
  waits, and let in holders of `housekeeping.database` or `housekeeping.accessGroups` only.
- Breaking these on purpose fails a test: the permission (one attribute, every attribute, or none), no copy, a copy after
  the updates, no log row or an empty one, a failure shown as success, and the applied list oldest first.

# Notes

- The page works while the hotel is open; [up-06](/tasks/up-06-close-while-waiting.md) closes the hotel around it.
- `RequireAnyAttribute` lets in a user holding one of several attributes; `RequireAttribute` is now that with one.
- The copy's path goes in the staff log and in the page that reports a failure, not in a URL.
- A failure test refuses an update's rows with a trigger, since housekeeping applies the updates the binary carries.
