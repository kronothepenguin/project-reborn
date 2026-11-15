---
type: Rules
title: Soft rules
description: Suggestions on builds, configuration, comments, runners and commits that every agent follows by default.
---

The hard rules are in `AGENTS.md`. These rules are suggestions.

- Go programs compile into `tmp/`.
- Configuration comes from the config package or from settings. Environment variables are used when the user asks for
  them.
- Code explains itself. Comments are for complex or unclear functions and algorithms.
- `apps/**/cmd/**` holds the user's runners. An agent proposes a change there and waits for the user's yes.
- `main` stays local. The user pushes.
- A commit has a one-line title that starts with `feat:`, `fix:`, `refactor:` or `docs:`.
