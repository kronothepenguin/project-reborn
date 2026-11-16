---
type: Playbook
title: Go layout
description: Where this repo keeps its Go modules, runners, routes and handlers, and the commands that build and check them, for the applying-go-patterns skill.
---

# Skills

- `applying-go-patterns` holds the rules: design, module layout, `New`, `Inject`, `Mount`, `internal/router`, handler
  files and names.
- `use-modern-go` holds the newer idioms. `gofmt` and `go vet` check the rest.

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
- `apps/<app>/cmd/<app>` is the production runner. A runner whose package ships a frontend also has
  `apps/<app>/cmd/<app>-dev`, the development runner: the CMS, housekeeping and the installer. `apps/server` has
  `cmd/server` only.
- `tools/create` keeps its command in `tools/create/cmd/create`, and `tools/checks` keeps its
  command in `tools/checks/cmd/dependants`.
- `packages/server` keeps its supporting packages under `internal/`: `encoding`, `game`, `r26` and `transport`.

# Web apps

| Package | Root and `Mount` | Router |
| --- | --- | --- |
| `packages/cms` | `cms.go`, `func (c *CMS) Mount` | `internal/router` |
| `packages/housekeeping` | `housekeeping.go`, `func (h *Housekeeping) Mount` | `internal/router` |
| `packages/installer` | `installer.go`, `func (i *Installer) Mount` | `internal/router` |

- `router.Deps` of the CMS and housekeeping: `Resolver astro.Resolver`, `DB *sql.DB`, `Queries *store.Queries`, built
  from `DB`, `Updates *store.UpdateCheck`, and `Habbos services.Habbos`, handed over with `Inject`. The installer's:
  `Resolver astro.Resolver`, `Setup *setup.State`.
- The CMS and housekeeping `Mount` wrap each route in middleware with `mux.Handle`:
  `packages/cms/knowledge/runtime.md`.
- Housekeeping routes live under `/housekeeping/`: `packages/housekeeping/knowledge/prefix.md`. Every route shares the
  prefix, so its handler files leave it out (`/housekeeping/news` → `news.go`), as `applying-go-patterns` says.
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
| `make check` | the root | Runs `make check` in every project of `apps/`, `packages/` and `tools/`, one after another, then the knowledge check ([Checks](/checks.md)). |

At the root, `go build ./...` fails with
`pattern ./...: directory prefix . does not contain modules listed in go.work or their selected dependencies`.

A program a make target builds goes to `bin/`, and the rebuilds of `make dev` go to `tmp/` ([Soft rules](/rules.md)).
