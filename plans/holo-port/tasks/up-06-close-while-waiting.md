---
type: Task
title: Close the hotel while updates wait
description: While a database lacks updates, the CMS answers with its maintenance page and housekeeping only with its update page, scheduled tasks wait, and both open once nothing waits.
status: todo
phase: up
depends_on: [up-05]
packages: [packages/cms, packages/housekeeping]
holo: [source/holo/maintenance.php]
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

New code never serves pages from a database it was not written for
([0069](/decisions/0069-waiting-updates-close-the-hotel.md)).

# Steps

- [ ] The CMS answers every page with its maintenance page and status 503, and `site.maintenanceBypass` does not open
  it. Sign-in on that page and the static files still work.
- [ ] After signing in, the maintenance page links to housekeeping's update page at `site.housekeepingUrl`.
- [ ] Housekeeping sends those who may apply updates to its update page, and tells other staff that the hotel is being
  updated.
- [ ] While updates wait, both programs read `migrations` again on each request, and open as soon as nothing waits.
- [ ] Scheduled tasks do not run while updates wait.
- [ ] Tests for both programs: closed with a waiting update, sign-in on the maintenance page, the bypass ignored, and open
  again once another program applied the update.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/housekeeping
cd tests/e2e && pnpm test maintenance housekeeping-access
```

Breaking these on purpose must fail a test: the bypass opening the hotel, a page served while an update waits, and the
hotel staying closed after the updates are applied.

# Notes

- The closed state comes from the database, so it needs no setting and ends by itself.
