---
type: Rules
title: Soft rules
description: Suggestions on builds, configuration, comments and commits that every agent follows by default.
---

The hard rules are in `AGENTS.md`. These rules are suggestions.

- A program a make target builds goes to `bin/`. The rebuilds of `make dev` go to `tmp/`.
- Configuration comes from the config package or from settings. Environment variables are used when the user asks for
  them.
- Code explains itself. Comments are for complex or unclear functions and algorithms.
- `main` stays local. The user pushes.
- `main` is a straight line: a branch reaches it by a rebase and a fast-forward, with no merge commits.
- A commit has a one-line title that starts with `feat:`, `fix:`, `refactor:` or `docs:`.
