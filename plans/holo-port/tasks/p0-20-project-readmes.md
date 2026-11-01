---
type: Task
title: Replace the project AGENTS.md files with READMEs
description: Rename the AGENTS.md of each project folder to README.md, in the repository and in the tools/create templates, keeping one AGENTS.md at the root.
status: done
phase: p0
depends_on: [p0-19]
packages: [apps/cms, apps/installer, packages/cms, packages/installer, tools/create]
holo: []
timestamp: 2026-11-01T18:19:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:19:49+00:00"}
---

# Goal

Implement the documentation half of [0038](/decisions/0038-project-docs-and-install.md).

# Steps

- [x] `git mv` the four project `AGENTS.md` files to `README.md`.
- [x] Rename the two `AGENTS.md.tmpl` templates to `README.md.tmpl`.
- [x] Fix every reference to the old files outside the history of the bundle.

# Verification

```sh
git ls-files | grep -E '(^|/)AGENTS\.md$'   # only the root file
cd tools/create && go test ./... -race
```

Results (2026-11-01T18:19:49+00:00):

- `git ls-files` lists `AGENTS.md` only at the root.
- `go test -race` passes in `tools/create`, and a generated project gets a `README.md` in both of its folders.
- Outside the history in `tasks/`, `decisions/` and `log.md`, the only mention left is the root file itself.

# Notes

- None.
