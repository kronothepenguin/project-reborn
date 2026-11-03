---
type: Task
title: Apply automatic updates at start
description: When the CMS or housekeeping starts, it saves a copy and applies the waiting updates up to the last one marked automatic, shows an error page when one fails, and a test keeps sign-in working on the database start-up leaves.
status: done
phase: up
depends_on: [up-06]
packages: [packages/store, packages/cms, packages/housekeeping]
holo: []
timestamp: 2026-11-03T23:32:28+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T21:02:31+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T23:32:28+00:00"}
---

# Goal

Staff can always sign in and reach the update page, and an update that fails at start is shown instead of breaking the
hotel silently ([0071](/decisions/0071-sign-in-updates-apply-at-start.md)).

# Steps

- [x] `cms.New` and `housekeeping.New` save a copy and apply the waiting updates up to the last automatic one, so
  `apps/**/cmd/**` stays as it is. Nothing is copied when no automatic update waits.
- [x] A failure goes to the log, and every page answers with an error page and status 503, which says that the hotel could
  not be updated. The next start tries again.
- [x] A CMS test signs in, and a housekeeping test opens the update page, on the database as start-up leaves it: with
  every update up to the last automatic one, then with each later one.
- [x] Tests with updates written for them: start-up applies up to the mark and no further, a failure shows the error page,
  and a second program finds the updates applied.

# Verification

```sh
# gofmt, go vet and go test -race in packages/store, packages/cms and packages/housekeeping
```

Breaking these on purpose must fail a test: applying past the last automatic update, skipping the copy, and serving pages
after a failure.

Results (2026-11-03T23:32:28+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/auth`, `packages/cms`,
  `packages/housekeeping` and `packages/installer`, and `make check-docs` passes.
- `pnpm test together signed-out me maintenance housekeeping-access housekeeping-admin` passes all 313 checks on the
  production binaries.
- The store's tests apply the waiting updates up to the last automatic one and no further, take every update before
  that mark, save a copy only when something automatic waits, keep a failure, and leave nothing for a second program.
- The routers' tests, with lists of updates made for them, show the error page on every page after a failed start, and
  the programs' tests do the same on a database whose updates cannot be read, on every route but the files.
- `TestSignInWorksOnTheDatabaseStartUpLeaves` and `TestTheUpdatePageOpensOnTheDatabaseStartUpLeaves` sign in on the
  database of each older release. Tried with a column added to `sessions`, they failed on every older database until the
  update carried `-- automatic`, then passed; a column on `users`, which sign-in does not read, passed without it.
- Breaking these on purpose fails a test: applying past the last mark, only up to the first mark, no copy, a copy with
  nothing automatic, a failure not kept, pages served after a failure in either program, the sign-in and sign-out routes
  outside the guard, housekeeping's pages outside it, and a start-up that applies nothing.

# Notes

- None of the first four updates is automatic.
- The tests need a set of updates other than the embedded one, and the programs take options only for the resolver and
  the static files. The user chose to pass a test's updates through the internal routers
  ([0073](/decisions/0073-update-lists-reach-tests-through-the-router.md)).
- `store.Connect` opens a database and writes nothing, so a test builds the database an older release left with
  `ApplyUpdates`; `Open` is `Connect` with a new database's updates.
- The guard stands outside the session reader, because the new code's sessions may need the update that failed.
  Housekeeping's files stay outside it, so the error page may still find its styles.
- An exercise of the sign-in tests used a copy of the store files, restored byte for byte afterwards.
