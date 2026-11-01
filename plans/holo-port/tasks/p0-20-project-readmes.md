---
type: Task
title: Replace the project AGENTS.md files with READMEs
description: Rename the AGENTS.md of each project folder to README.md, in the repository and in the tools/create templates, keeping one AGENTS.md at the root.
status: todo
phase: p0
depends_on: [p0-19]
packages: [apps/cms, apps/installer, packages/cms, packages/installer, tools/create]
holo: []
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement the documentation half of [0038](/decisions/0038-project-docs-and-install.md).

# Steps

- [ ] `git mv` the four project `AGENTS.md` files to `README.md`.
- [ ] Rename the two `AGENTS.md.tmpl` templates to `README.md.tmpl`.
- [ ] Fix every reference to the old files outside the history of the bundle.

# Verification

```sh
git ls-files | grep -E '(^|/)AGENTS\.md$'   # only the root file
cd tools/create && go test ./... -race
```

# Notes

- None yet.
