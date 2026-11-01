---
type: Task
title: Add make install to every project
description: Give each project a make install that creates folders and installs dependencies, have the root one run them, and comment out the root targets of the orchestrator.
status: done
phase: p0
depends_on: [p0-20]
packages: [apps/cms, apps/installer, packages/cms, packages/installer, packages/store, tools/create]
holo: []
timestamp: 2026-11-01T18:21:56+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:21:56+00:00"}
---

# Goal

Implement the install half of [0038](/decisions/0038-project-docs-and-install.md) and the Makefile part of [0039](/decisions/0039-orchestrator-is-a-later-project.md).

# Steps

- [x] `install` in `packages/cms`, `packages/installer`, `apps/cms`, `apps/installer` and `packages/store`.
- [x] A project's `install` writes the placeholder `go:embed` needs in `dist/`, and never overwrites a real build.
- [x] The root `install` runs them.
- [x] The root `dev` and `build` targets become comments that say what they wait for.
- [x] `tools/create` generates the same targets, and finishes with `make install`.
- [x] Docs: the root `README.md` and the project READMEs, including the placeholder sentence.

# Verification

On a fresh clone, without any `pnpm build`:

```sh
make install
go build ./packages/cms ./packages/installer ./apps/cms/... ./apps/installer/...
```

Then `pnpm build` must replace the placeholder, and a second `make install` must keep the real `dist/index.html`.

Results (2026-11-01T18:21:56+00:00):

On a clean worktree of this task's tree, with no ignored files:

- Before `make install`, `go build ./packages/cms` failed with `pattern dist/*: no matching files found`.
- `make install` exited 0 and created `packages/cms/dist`, `packages/installer/dist` and `apps/cms/tmp`.
- `go build ./packages/cms ./packages/installer ./apps/cms/... ./apps/installer/...` then passed with no `pnpm build`.
- After `pnpm build`, a second `make install` left `dist/index.html` byte for byte, at 13183 bytes.
- `git status` stayed clean after `make install`.
- `make create name=probe` exited 0, `gofmt -l` listed nothing, and `./apps/probe/...` and `./packages/probe` built, with
  the placeholder in `packages/probe/dist`.
- `go test -race` passes in `tools/create`, with a new test for the generated install targets.

# Notes

- `go mod download` rewrites `go.work.sum`, so that file is committed here and `make install` leaves no diff.
- The local `dist/index.html.tmpl` is gone: `make install` writes the placeholder, with the same text.
- The root runs `apps/*/` and `packages/store/`: an app's `install` runs its package's, and the other packages have
  nothing of their own to create.
