---
type: Task
title: Give the web packages and the apps their make check
description: The three packages that hold a frontend and a Go package, and the four apps that run the programs, include the shared recipe.
scope: [packages/cms, packages/housekeeping, packages/installer, apps/cms, apps/housekeeping, apps/installer, apps/server]
depends_on: [01-recipe-and-dependants]
skills: [testing-behaviours]
---

# Goal

Each of the seven projects checks itself. This task implements these behaviours of the spec, for these projects:

- A project whose code is right, `make check` runs in its folder: it passes.
- A project with both, `make check` runs: the `build` script runs first, so the Go tests and the Go build see what it
  made.

# Context

- [Spec](/features/checks/spec.md)
- [Plan](/features/checks/plan.md)
- [The projects today](/features/checks/research-projects.md): the embedded `dist/`, the Makefile targets each project
  has, and what a fresh worktree needs
- [Frontend pages](/frontend-pages.md): how a frontend builds and where its pages land
- [How the programs work together](/programs.md): the runners
- [Soft rules](/rules.md): `apps/**/cmd/**` holds the user's runners; this task leaves them as they are
- `tools/checks/knowledge/recipe.md`: how a project includes the recipe, what it runs, and how a project adds its own
  steps
- A fresh worktree runs `pnpm install --frozen-lockfile --prefer-offline` and `make install` first: the Go packages
  embed `dist/`, and `packages/housekeeping` imports `packages/cms`

# Steps

1. The Makefile of each of the three packages includes `../../make/check.mk` beside its `install` target.
2. The Makefile of each of the four apps includes it beside its `install` and `dev` targets. An app has no tests, so
   its check vets and builds.
3. A README or a knowledge file of these projects that gives check commands under the word "gates" now says
   `make check`.
4. Run `make check` in each project. A failure starts a review of the code: report what it shows before changing a
   test.

# Checks

- `make check` passes in each of the seven folders.
- In `packages/cms`, `make check` builds the pages before the Go tests run: its output shows the order.
- `python3 -I .agents/skills/documenting-with-okf/scripts/check.py` exits 0.
