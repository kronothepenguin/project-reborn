---
type: Task
title: Give new projects their make check
description: The templates of tools/create give each new project a Makefile that includes the shared recipe, and tools/create checks itself.
scope: [tools/create]
depends_on: [01-recipe-and-dependants]
skills: [applying-go-patterns, use-modern-go, testing-behaviours]
---

# Goal

A project made by `make create` checks itself from its first minute. This task implements this behaviour of the spec:

- A new project made by `make create`, `make check` runs in it: it passes.

# Context

- [Spec](/features/checks/spec.md)
- [Plan](/features/checks/plan.md)
- [The projects today](/features/checks/research-projects.md)
- `tools/create/knowledge/templates.md`: the three kinds of template and what runs after writing
- `tools/create/knowledge/names.md` and `tools/create/knowledge/ports.md`
- `tools/checks/knowledge/recipe.md`: how a project includes the recipe, what it runs, and how a project adds its own
  steps

# Steps

1. Every folder a template writes (`apps/<name>` and `packages/<name>`, for the `fullstack`, `backend` and `client`
   kinds) gets a Makefile that includes `../../make/check.mk`, beside the targets the template has today.
2. `tools/create` gets a Makefile that includes the recipe.
3. A test proves the behaviour: it makes a project from a template, runs `make check` in it, and sees it pass. Build
   the strongest test that runs inside `go test`: a temporary root that holds the recipe and a workspace pointing at
   this repo's modules serves the `backend` kind. Where a kind cannot run its whole check inside `go test`, the test
   proves what it can (the Makefile includes the recipe, the scripts the recipe runs exist), and your report says
   what stays unproven and what would prove it.
4. Update the tests that list the files a template writes.

# Checks

- `make check` in `tools/create` passes.
- In your worktree, `make create name=probe template=backend` followed by `make check` in the two new folders passes.
  Remove the probe folders and their lines in `go.work` afterwards, and show `git status` clean of them.
- `python3 -I .agents/skills/documenting-with-okf/scripts/check.py` exits 0.
