---
type: Task
title: Give the JavaScript projects their make check
description: components, director, client-r26 and tw-color include the shared recipe, and tw-color and client-r26 get scripts the recipe can run.
scope: [packages/components, packages/director, packages/client-r26, tools/tw-color]
depends_on: [01-recipe-and-dependants]
skills: [testing-behaviours]
---

# Goal

Each of the four projects checks itself. This task implements these behaviours of the spec, for these projects:

- A project whose code is right, `make check` runs in its folder: it passes.
- A project with a `package.json`, `make check` runs: it runs the `build`, `check` and `test` scripts the package
  declares.

# Context

- [Spec](/features/checks/spec.md)
- [Plan](/features/checks/plan.md): the decisions on `tools/tw-color` and on the `test` script of
  `packages/client-r26`
- [The projects today](/features/checks/research-projects.md): each package's scripts, and what a fresh worktree needs
- `packages/components/knowledge/index.md`, `packages/director/knowledge/index.md`,
  `packages/client-r26/knowledge/index.md`, `tools/tw-color/knowledge/index.md`
- `tools/checks/knowledge/recipe.md`: how a project includes the recipe, what it runs, and how a project adds its own
  steps

# Steps

1. Each of the four folders gets a Makefile that includes `../../make/check.mk`.
2. `tools/tw-color` gets a `package.json` with a `test` script that runs its test with `node --test`. The folder sits
   outside the pnpm workspace: check that the recipe runs its script there, and report what it took.
3. `packages/client-r26`: the `test` script becomes `vitest run --passWithNoTests`.
4. A README or a knowledge file of these projects that gives a test command now says `make check`.
5. Run `make check` in each project. A failure starts a review of the code: report what it shows before changing a
   test. `packages/director` has 52 test files that the old gates left out: report each one that fails, with its
   reason.

# Checks

- `make check` passes in each of the four folders, and ends by itself.
- `make check` in `packages/components` runs both its `check` and its `test` script.
- `python3 -I .agents/skills/documenting-with-okf/scripts/check.py` exits 0.
