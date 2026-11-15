---
type: Decision
title: Project folders hold a README and a make install
description: AGENTS.md stays only at the repository root, project folders document themselves in README.md, and every project and the root have a make install.
status: accepted
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
tags: [process, tooling]
---

# Decision

- One `AGENTS.md` lives at the repository root. Project folders use `README.md` instead.
- Each project folder (`apps/<app>` and `packages/<app>`) has a `make install`, and so does the root.
- A project's `make install` creates folders and installs dependencies: the minimum needed to develop and run it. That
  includes the placeholder `go:embed` needs in `dist/` before the first `pnpm build`.
- `tools/create` generates the same files.

# Context

The docs claimed a `dist/index.html` placeholder that `.gitignore` keeps out of the repository, so `go build` failed on a
fresh clone. The user answered: "i would prefer just remove the AGENTS.md from project folders and use a README.ms
instead, keep one AGENTS.md/CLAUDE.md at root or just create a `make install` entry in the Makefile, i mean one `make
install` per project and one `make install` in the root. project's make install just creates folders and install deps,
the minimal needed to dev and run projects".

The agent read the two parts as both wanted: they do not conflict, and the second one fixes the fresh clone.

# Consequences

- A fresh clone compiles after `make install`, before any `pnpm build`.
