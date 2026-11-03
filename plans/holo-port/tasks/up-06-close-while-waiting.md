---
type: Task
title: Close the hotel while updates wait
description: While a database lacks updates, the CMS answers with its maintenance page and housekeeping only with its update page, scheduled tasks wait, and both open once nothing waits.
status: done
phase: up
depends_on: [up-05]
packages: [packages/cms, packages/housekeeping]
holo: [source/holo/maintenance.php]
timestamp: 2026-11-03T22:42:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T22:42:00+00:00"}
---

# Goal

New code never serves pages from a database it was not written for
([0069](/decisions/0069-waiting-updates-close-the-hotel.md)).

# Steps

- [x] The CMS answers every page with its maintenance page and status 503, and `site.maintenanceBypass` does not open
  it. Sign-in on that page and the static files still work.
- [x] After signing in, the maintenance page links to housekeeping's update page at `site.housekeepingUrl`.
- [x] Housekeeping sends those who may apply updates to its update page, and tells other staff that the hotel is being
  updated.
- [x] While updates wait, both programs read `migrations` again on each request, and open as soon as nothing waits.
- [x] Scheduled tasks do not run while updates wait.
- [x] Tests for both programs: closed with a waiting update, sign-in on the maintenance page, the bypass ignored, and open
  again once another program applied the update.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/housekeeping
cd tests/e2e && pnpm test maintenance housekeeping-access
```

Breaking these on purpose must fail a test: the bypass opening the hotel, a page served while an update waits, and the
hotel staying closed after the updates are applied.

Results (2026-11-03T22:42:00+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/cms`, `packages/housekeeping` and
  `packages/installer`, and `make check-docs` passes.
- `pnpm test maintenance housekeeping-access signed-out` passes all 212 checks on the production binaries.
- The tests start each program on a database that lacks updates: the CMS answers every page with the maintenance page,
  the bypass included, while its files load and sign-in works; those who may apply updates find the link to housekeeping
  after signing in, and players do not; housekeeping sends them to its update page and tells other staff that the hotel
  is being updated, while signing out and its files work; both open once the updates are applied; a scheduled task does
  nothing until then.
- Breaking these on purpose fails a test: the bypass opening a waiting hotel, pages served while updates wait, a failed
  sign-in shown on the landing page, the link for everyone or for access managers only, a check that never opens, a task
  that runs while updates wait, no gate in housekeeping, updaters not sent to the update page, and signing out, the files
  or the update page behind the gate.

# Notes

- The closed state comes from the database, so it needs no setting and ends by itself.
- `store.UpdateCheck` holds the closed state for each program, so a program reads `migrations` on each request only
  until nothing waits.
- The CMS's `grant` test helper names its group after the attribute, so a test can grant two attributes.
