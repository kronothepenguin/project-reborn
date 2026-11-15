---
type: Reference
title: The root check
description: What `make check` at the repository root runs, in which order, and how it reports a project that fails.
resource: make/check-all.mk
---

# Steps

The root `Makefile` includes `make/check-all.mk`, whose `check`:

1. Runs `make -C <folder> check` in every folder of `apps/*`, `packages/*` and `tools/*` that has a `Makefile`, in
   sorted order, one after another: the server's tests have short deadlines and a loaded machine fails them.
2. Runs the knowledge check, `python3 -I .agents/skills/documenting-with-okf/scripts/check.py`.

It prints `== <folder>` before each project and `== knowledge` before the knowledge check.

# A failure

The first project whose check fails stops the run with `make check failed in <folder>`, and the projects after it and
the knowledge check do not run.

# Outside it

`tests/e2e` holds the browser suites, which `make e2e` runs apart.

# Tests

`tools/checks/root_test.go` builds a tiny root in a temporary folder whose `Makefile` includes the real file, with a
project in each of `apps/`, `packages/` and `tools/`, one in `tests/`, and a stand-in knowledge check.
