---
type: Task
title: Add make install to every project
description: Give each project a make install that creates folders and installs dependencies, have the root one run them, and comment out the root targets of the orchestrator.
status: todo
phase: p0
depends_on: [p0-20]
packages: [apps/cms, apps/installer, packages/cms, packages/installer, packages/store, tools/create]
holo: []
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement the install half of [0038](/decisions/0038-project-docs-and-install.md) and the Makefile part of [0039](/decisions/0039-orchestrator-is-a-later-project.md).

# Steps

- [ ] `install` in `packages/cms`, `packages/installer`, `apps/cms`, `apps/installer` and `packages/store`.
- [ ] A project's `install` writes the placeholder `go:embed` needs in `dist/`, and never overwrites a real build.
- [ ] The root `install` runs them.
- [ ] The root `dev` and `build` targets become comments that say what they wait for.
- [ ] `tools/create` generates the same targets, and finishes with `make install`.
- [ ] Docs: the root `README.md` and the project READMEs, including the placeholder sentence.

# Verification

On a fresh clone, without any `pnpm build`:

```sh
make install
go build ./packages/cms ./packages/installer ./apps/cms/... ./apps/installer/...
```

Then `pnpm build` must replace the placeholder, and a second `make install` must keep the real `dist/index.html`.

# Notes

- None yet.
