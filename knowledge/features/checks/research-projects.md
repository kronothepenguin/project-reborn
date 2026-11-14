---
type: Reference
title: "Checks: the projects today"
description: What each project has, what the old gates ran, who depends on whom, and what a fresh worktree needs, read on 2026-11-13.
---

# Projects

Module paths start with `github.com/kronothepenguin/project-reborn/`. Package names start with `@project-reborn/`.

| Folder | `go.mod` | `package.json` | Makefile targets today | Scripts | Tests today |
| --- | --- | --- | --- | --- | --- |
| `apps/cms` | yes | | install, dev | | none |
| `apps/housekeeping` | yes | | install, dev | | none |
| `apps/installer` | yes | | install, dev | | none |
| `apps/server` | yes | | install, dev | | none |
| `packages/astro` | yes | | | | Go |
| `packages/auth` | yes | | | | Go |
| `packages/config` | yes | | | | Go |
| `packages/scheduler` | yes | | | | Go |
| `packages/server` | yes | | install | | Go, 52 test files |
| `packages/store` | yes | | install, generate, check-docs, test | | Go, plus generated code and docs |
| `packages/virtual` | yes | | | | Go |
| `packages/cms` | yes | `cms` | install | dev, build, preview, astro | Go, 47 test files |
| `packages/housekeeping` | yes | `housekeeping` | install | dev, build, preview, astro | Go, 31 test files |
| `packages/installer` | yes | `installer` | install | dev, build, preview, astro | Go |
| `packages/components` | | `components` | | dev, storybook, build-storybook, test, check | Vitest in a browser |
| `packages/director` | | `director` | | test | Vitest, 52 test files, run by nothing |
| `packages/client-r26` | | `client-r26` | | dev, build, preview, test | none; `test` is `vitest`, which watches |
| `tools/create` | yes | | built by the root `make tools` | | Go |
| `tools/tw-color` | | | | | one test, `node --test` |
| `tests/e2e` | | `e2e` | install, test | test | 31 browser suites, run by `make e2e` |

- `packages/cms`, `packages/housekeeping` and `packages/installer` embed their own `dist/` (`//go:embed dist/*`). Their
  `make install` writes a placeholder page; the `build` script writes the real pages, which the Go tests read.
- `packages/components` runs its tests in Playwright's chromium.
- `packages/client-r26/vitest.config.js` includes `src/director/**/__tests__/`, a folder the package lacks.

# What `make gates` ran

1. `frontends`: the `build` script of cms, installer and housekeeping.
2. For each of the 15 Go modules: `gofmt -l` over `git ls-files '*.go'`, `go vet ./...`, `go test ./... -race`.
3. `pnpm --filter @project-reborn/components test` and `check`.
4. In `packages/store`: `go tool sqlc generate`, then `git diff --exit-code -- db.go models.go '*.query.sql.go'`, then
   `make check-docs`.
5. The knowledge check: `python3 -I .agents/skills/documenting-with-okf/scripts/check.py`.

`.github/workflows/ci.yml` and `release.yml` run `make install`, `make gates`, the Playwright install and `make e2e`.
`release` in the root Makefile needs `frontends`.

# Who depends on whom

Go, from `go list -deps -test ./...` in each module. `go mod graph` shows fewer links: the `go.mod` files state only
some of them.

| Module | Imported by | Also reached through others |
| --- | --- | --- |
| `packages/config` | store, virtual, auth, cms, housekeeping, installer, server | every app |
| `packages/store` | virtual, auth, cms, housekeeping, installer, server | every app |
| `packages/virtual` | auth, cms, housekeeping, installer, server | every app |
| `packages/auth` | cms, housekeeping, installer, server | every app |
| `packages/scheduler` | cms, housekeeping, server | apps cms, housekeeping, server |
| `packages/astro` | cms, housekeeping, installer | apps cms, housekeeping, installer |
| `packages/cms` | `packages/housekeeping`, `apps/cms` | `apps/housekeeping` |
| `packages/housekeeping`, `packages/installer`, `packages/server` | their own app | |
| the apps, `tools/create` | nothing | |

JavaScript, from the workspace dependencies of each `package.json`:

| Package | Used by |
| --- | --- |
| `packages/components` | `packages/cms`, `packages/housekeeping`, `packages/installer` |
| `packages/director` | `packages/client-r26` |

A frontend package and the Go package of the same folder are one project, so `packages/components` reaches the three
web packages and, through Go, their apps.

# Commands that list dependants

- Go has no reverse command. This loop finds the modules that import one:
  `for m in $(go list -m); do (cd $(go list -m -f '{{.Dir}}' $m) && go list -deps -test ./... | grep -q "^$P/packages/store") && echo $m; done`
  with `P=github.com/kronothepenguin/project-reborn`.
- pnpm: `pnpm --filter "...@project-reborn/components" ls --depth -1` lists the package and every workspace package
  that depends on it.

# A fresh worktree

- `pnpm install --frozen-lockfile --prefer-offline` brings `node_modules`.
- `make install` at the root writes each frontend's placeholder `dist/` and builds the tools.
- `packages/components` needs Playwright's chromium, as CI installs it.
- `git worktree remove` takes `--force` once `node_modules` exist and `git status` is clean.
