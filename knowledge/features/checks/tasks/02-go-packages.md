---
type: Task
title: Give the Go packages their make check
description: The seven Go packages without a frontend include the shared recipe, and the store adds its own two checks.
scope: [packages/astro, packages/auth, packages/config, packages/scheduler, packages/server, packages/store, packages/virtual]
depends_on: [01-recipe-and-dependants]
skills: [testing-behaviours]
---

# Goal

Each of the seven packages checks itself. This task implements this behaviour of the spec, for these projects:

- A project whose code is right, `make check` runs in its folder: it passes.

# Context

- [Spec](/features/checks/spec.md)
- [Plan](/features/checks/plan.md): the Go steps, and where the store's own checks go
- [The projects today](/features/checks/research-projects.md): the Makefile targets each package has, and what the old
  gates ran in the store
- `packages/store/knowledge/adding-persisted-data.md`: the store's generator command and its documentation check
- `tools/checks/knowledge/recipe.md`: how a project includes the recipe, what it runs, and how a project adds its own
  steps
- The tests of `packages/server` have deadlines of a few seconds, and three other slaves run checks at the same time:
  when one of its tests times out, run its check again alone before reviewing the code

# Steps

1. Each package's Makefile includes `../../make/check.mk`. A package without a Makefile gets one.
2. `packages/store`: `check` also runs the generated-code check (`go tool sqlc generate`, then
   `git diff --exit-code -- db.go models.go '*.query.sql.go'`) and `check-docs`. Its `test` target goes: the recipe
   covers it.
3. A README or a knowledge file of these packages that gives check commands under the word "gates" now says
   `make check`.
4. Run `make check` in each package. A failure starts a review of the code: report what it shows before changing a
   test.

# Checks

- `make check` passes in each of the seven folders.
- `make check` in `packages/store` fails after a hand edit of `models.go`, and passes once the edit is undone.
- `python3 -I .agents/skills/documenting-with-okf/scripts/check.py` exits 0.
