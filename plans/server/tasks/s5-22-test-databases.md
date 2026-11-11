---
type: Task
title: Copy one prepared database for each CMS and housekeeping test
description: The CMS's and housekeeping's tests copy a database made once with every update applied, in place of applying every update for each test, which the catalogue's seed made too slow for the gates.
status: done
phase: s5
depends_on: [s5-01]
packages: [packages/cms, packages/housekeeping]
client: []
timestamp: 2026-11-11T16:23:13+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T16:23:13+00:00"}
verified:
  - {by: claude-code/claude-fable-5-2, at: "2026-11-11T16:23:13+00:00"}
---

# Goal

The gates keep passing with the catalogue's seed in every new database ([s5-01](/tasks/s5-01-catalogue-tables.md)).

# Steps

- [x] The CMS's and housekeeping's test helpers give each test a copy of a database made once for the package's tests,
  with every update applied.
- [x] Both suites pass, in less time than before the seed.

# Verification

```sh
cd packages/cms && go test . -race
cd packages/housekeeping && go test . -race
make gates
```

Results:

- Under the race detector, the update `0013-catalogue.sql` takes 0.9 s to apply, where the twelve before it take 0.75 s
  together: SQLite's row inserts are slow there whatever the shape of the statements, as timing eight variants of the
  update showed. The CMS's tests make 214 databases and housekeeping's 261, so each suite came to the 10 minutes that
  `go test` allows a package, and the gates of [s5-01](/tasks/s5-01-catalogue-tables.md) failed on the CMS's time-out.
- `newSite` in `packages/cms` and `openDB` in `packages/housekeeping` now copy `freshDatabase`, the bytes of a database
  that `store.Open` made once for the package's tests, and open the copy with `store.Open`, which writes nothing to a
  database that has tables. Only the two test files change.
- The CMS's suite takes 132 s where it took 389 s before the seed, and housekeeping's 146 s where it took 354 s.
- [s5-01](/tasks/s5-01-catalogue-tables.md), [s5-02](/tasks/s5-02-catalogue-state.md) and
  [s5-03](/tasks/s5-03-showing-the-catalogue.md) merge together with this task, on whose branch the gates ran: theirs
  pass only with it.
- `make gates` passes.

# Notes

- Runs on the branch `s5-test-databases`, on top of [s5-03](/tasks/s5-03-showing-the-catalogue.md)'s.
- New work, found when the gates of [s5-01](/tasks/s5-01-catalogue-tables.md) failed on the time `go test` allows a
  package.
