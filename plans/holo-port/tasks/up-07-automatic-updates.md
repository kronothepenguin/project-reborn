---
type: Task
title: Apply automatic updates at start
description: When the CMS or housekeeping starts, it saves a copy and applies the waiting updates up to the last one marked automatic, shows an error page when one fails, and a test keeps sign-in working on the database start-up leaves.
status: todo
phase: up
depends_on: [up-06]
packages: [packages/store, packages/cms, packages/housekeeping]
holo: []
timestamp: 2026-11-03T21:02:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
---

# Goal

Staff can always sign in and reach the update page, and an update that fails at start is shown instead of breaking the
hotel silently ([0071](/decisions/0071-sign-in-updates-apply-at-start.md)).

# Steps

- [ ] `cms.New` and `housekeeping.New` save a copy and apply the waiting updates up to the last automatic one, so
  `apps/**/cmd/**` stays as it is. Nothing is copied when no automatic update waits.
- [ ] A failure goes to the log, and every page answers with an error page and status 503, which says that the hotel could
  not be updated. The next start tries again.
- [ ] A CMS test signs in, and a housekeeping test opens the update page, on the database as start-up leaves it: with
  every update up to the last automatic one, then with each later one.
- [ ] Tests with updates written for them: start-up applies up to the mark and no further, a failure shows the error page,
  and a second program finds the updates applied.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store, packages/cms and packages/housekeeping
```

Breaking these on purpose must fail a test: applying past the last automatic update, skipping the copy, and serving pages
after a failure.

# Notes

- None of the first four updates is automatic.
- The tests need a set of updates other than the embedded one, and the programs take options only for the resolver and
  the static files. How a test passes its own updates is asked to the user when the task starts.
