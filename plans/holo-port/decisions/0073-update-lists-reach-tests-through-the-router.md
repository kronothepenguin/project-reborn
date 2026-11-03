---
type: Decision
title: Update lists reach tests through the internal routers
description: The update check takes its list of updates; cms.New and housekeeping.New give it the binary's own, and the error page of a failed automatic update is tested through each program's internal router.
status: accepted
timestamp: 2026-11-03T23:16:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T23:16:21+00:00"}
tags: [store, cms, housekeeping, updates, tests]
---

# Decision

- `store.UpdateCheck` takes the list of updates it watches. `cms.New` and `housekeeping.New` give it the updates the
  binary carries.
- The error page of a failed automatic update is tested in each program's internal router tests, which build the router
  with a list of updates made for the test.
- `cms.New` and `housekeeping.New` get no new option, and nothing global changes, so
  [0029](/decisions/0029-package-level-settings-and-auth.md)'s options stay the resolver and the static files.

# Context

None of the first updates is automatic, so no real update can fail at start in a test. Asked how a test should give the
programs a failing update, the user chose "Internal router" over a test-only option, an exported package variable and
testing in `packages/store` alone.

# Consequences

- [up-07](/tasks/up-07-automatic-updates.md) builds the check this way.
