---
type: Task
title: A silent game is logged once per change
description: The site and housekeeping log one line when the game stops answering and one when it answers again, in place of one line per page.
scope: [packages/cms, packages/housekeeping, tests/e2e]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, use-modern-go]
---

# Goal

With the programs run apart and the game down, a program's log stays short: one line for the moment the game's answers
stopped, one for the moment they came back.

# Context

- [Spec](/features/hotel-status/spec.md), the line under `## Next`.
- [Plan](/features/hotel-status/plan.md)
- `packages/cms/internal/router/router.go` (`gameStatus`) and `online.go` (`online`).
- `packages/housekeeping/internal/router/router.go` (`hotelStatus`), `settings.go` (`followSwitches`) and `online.go`.

# Steps

- [ ] Each router holds one unexported memory of whether the game's last answer failed, safe for requests in
  parallel.
- [ ] Every question and command a router sends the game reports its result to that memory. A first failure logs
  `<program>: the game gives no answer` at ERROR with the error; the failures after it log nothing. The first success
  after a failure logs `<program>: the game answers again` at INFO.
- [ ] A request the visitor abandons (`context.Canceled`) leaves the memory as it is.
- [ ] Tests, in each package: ten pages served while the game fails log one line; the next page served while the game
  answers logs the second line; pages after it log nothing.
- [ ] `tests/e2e`: the suites `together` and `housekeeping-maintenance` and the harness expect the new lines.
- [ ] Update `packages/cms/knowledge/runtime.md` and housekeeping's knowledge, move the spec's line up, and the
  plan's row to `Built:`.

# Checks

```sh
make -C packages/cms check
make -C packages/housekeeping check
make e2e
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms` and
`packages/housekeeping`.
