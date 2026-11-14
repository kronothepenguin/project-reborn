---
type: Playbook
title: Checks
description: How to check one project, the projects that depend on it, the whole repository and the browser suites, and what a fresh worktree needs first.
---

# One project

Every project of `apps/`, `packages/` and `tools/` has a `Makefile` that includes the shared recipe `make/check.mk`:

```sh
make -C packages/store check
```

A `go.mod` brings `gofmt -l`, `go vet ./...`, `go test ./... -race` and `go build -o /dev/null ./...`. A
`package.json` brings its `build`, `check` and `test` scripts. A project adds its own steps, as the store adds its
generated-code and documentation checks. What the recipe runs: `tools/checks/knowledge/recipe.md`.

`gofmt` reads tracked files only: a new Go file counts once `git add` has run.

# Its dependants

A change reaches every project that uses the changed one. From the root:

```sh
make dependants project=packages/store
```

It prints every project that uses the folder, directly or through another project, one a line, and nothing when none
does. Run `make -C <folder> check` in each. How it finds them: `tools/checks/knowledge/dependants.md`.

# Everything

```sh
make check
```

At the root it runs `make check` in every project of `apps/`, `packages/` and `tools/`, one after another, then the
knowledge check. It stops at the first project that fails, with `make check failed in <folder>`. CI runs it on each
push and before a release. The knowledge check alone:

```sh
python3 -I .agents/skills/documenting-with-okf/scripts/check.py
```

# The browser suites

`tests/e2e` stays outside `make check`. A task runs the suites when its checks say so:

```sh
make e2e
```

It builds the programs, installs a throwaway hotel and runs every suite in Chromium.

# A fresh worktree

Before the first check in a new worktree:

1. `pnpm install --frozen-lockfile --prefer-offline` brings `node_modules`.
2. `make install` at the root writes each frontend's placeholder `dist/` and builds the tools.
3. `packages/components` runs its tests in Playwright's chromium, which CI installs with
   `pnpm --filter @project-reborn/e2e exec playwright install --with-deps chromium`.

`git worktree remove` needs `--force` once `node_modules` exist, when `git status` in the worktree is clean.
