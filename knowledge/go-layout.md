---
type: Playbook
title: Go layout
description: Where this repo keeps its Go modules, runners, routes and handlers, and the commands that build and check them, for the applying-go-patterns and reviewing-effective-go skills.
---

# Skills

- `applying-go-patterns` holds the rules: module layout, `Mount`, `internal/router`, handler files and names.
- `reviewing-effective-go` reviews the code against Effective Go; `use-modern-go` owns the newer idioms.

The projects and what each one is: [Monorepo architecture](/architecture.md). The runners and how the programs run:
[How the programs work together](/programs.md). The Astro pages, their handlers and the frontend builds:
[Frontend pages](/frontend-pages.md).

# Folders and modules

| Skill's folder | This repo |
| --- | --- |
| Runners | `apps/` |
| Packages | `packages/` |
| Tools | `tools/` |

- Module base path: `github.com/kronothepenguin/project-reborn`, so `packages/cms` is
  `github.com/kronothepenguin/project-reborn/packages/cms`.
- `go.work` lists every Go module. `packages/client-r26`, `packages/components`, `packages/director` and
  `tools/tw-color` are JavaScript projects, outside `go.work`.
- `pnpm-workspace.yaml` globs `apps/*`, `packages/*` and `tests/*`.
- `apps/<app>/cmd/<app>` is the production runner and `apps/<app>/cmd/<app>-dev` the development runner.
  `apps/server` has `cmd/server` only. `apps/**/cmd/**` belongs to the user ([Soft rules](/rules.md)).
- `tools/create` keeps its command in `tools/create/cmd/create`, and `tools/checks` keeps its
  command in `tools/checks/cmd/dependants`.

# Web apps

| Package | Root and `Mount` | Router |
| --- | --- | --- |
| `packages/cms` | `cms.go`, `func (c *CMS) Mount` | `internal/router` |
| `packages/housekeeping` | `housekeeping.go`, `func (h *Housekeeping) Mount` | `internal/router` |
| `packages/installer` | `installer.go`, `func (i *Installer) Mount` | `internal/router` |

- `router.Deps` of the CMS and housekeeping: `Resolver astro.Resolver`, `DB *sql.DB`, `Queries *store.Queries`,
  `Updates *store.UpdateCheck`. The installer's: `Resolver astro.Resolver`, `Setup *setup.State`.
- The CMS and housekeeping `Mount` wrap each route in middleware with `mux.Handle`:
  `packages/cms/knowledge/runtime.md`.
- Housekeeping routes live under `/housekeeping/`, and its handler files leave the prefix out of their names
  (`/housekeeping/news` → `news.go`): `packages/housekeeping/knowledge/prefix.md`.
- Each web app embeds its Astro build with `//go:embed dist/*` in its root file.
- Behaviour tests of a web app sit at its package root (`packages/cms/*_test.go`).

# Commands

| Command | Where | What it does |
| --- | --- | --- |
| `go build ./... && go vet ./...` | a module directory | Builds and vets that module. |
| `go work sync` | the root | Syncs the workspace; `make install` runs it. |
| `go work use ./<folder>/<name>` | the root | Adds a new module to `go.work`. |
| `make dependants project=<folder>` | the root | Prints the projects that use the folder, directly or through another. |
| `make check` | a project whose `Makefile` includes `make/check.mk` | Runs the shared recipe `make/check.mk`: the Go steps and the package scripts. |
| `make gates` | the root | Builds the frontends, then runs `gofmt -l`, `go vet ./...` and `go test ./... -race` in every module, plus the components, store and knowledge checks. |

At the root, `go build ./...` fails with
`pattern ./...: directory prefix . does not contain modules listed in go.work or their selected dependencies`.

Go programs compile into `tmp/` ([Soft rules](/rules.md)).
