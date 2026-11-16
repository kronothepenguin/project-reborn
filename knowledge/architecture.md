---
type: Architecture
title: Monorepo architecture
description: The apps are runners and the packages hold the full applications, in one Go and one pnpm workspace.
---

# Apps and packages

The apps are runners. The packages hold the code of the full applications, because one runner, `reborn`, embeds
every other app. A package with a frontend exports its build as `DistFS`, so `reborn` serves the same frontend.

[How the programs work together](/programs.md)

# Projects

| Folder | What it is |
| --- | --- |
| `apps/cms` | Thin runner for `packages/cms`. |
| `apps/housekeeping` | Thin runner for `packages/housekeeping`. |
| `apps/installer` | Thin runner for `packages/installer`. |
| `apps/reborn` | Thin runner for `packages/reborn`. |
| `apps/server` | Thin runner for `packages/server`. |
| `packages/assets` | Everything about the hotel's assets; `dcr` keeps the client's external variables and texts in the database and writes them out for the client. |
| `packages/astro` | Turns Astro pages into Go `html/template` templates, from the embedded `dist` or the Astro dev server. |
| `packages/auth` | Sign-in, sessions, access attributes and password resets for the CMS, housekeeping and installer. |
| `packages/client-r26` | The R26 client's casts, Lingo scripts with their JavaScript translations, as a Vite app on `packages/director`. |
| `packages/cms` | The public site: a Go module with its Astro (Svelte + Tailwind) frontend embedded. |
| `packages/components` | The project's design system: UI components shared across the project's applications. |
| `packages/config` | Shared configuration layer for Project Reborn. |
| `packages/director` | A JavaScript reimplementation of the Shockwave (Director) player that runs Lingo movies. |
| `packages/housekeeping` | Housekeeping, the staff panel under `/housekeeping`: a Go module with its Astro frontend embedded. |
| `packages/installer` | Writes `config.json`, creates the database, the site settings and the first administrator. |
| `packages/reborn` | Runs the whole hotel in one process: the site, housekeeping and the game server on one database handle. |
| `packages/scheduler` | Runs tasks on a timer, inside the process, like a small cron. |
| `packages/server` | The game server: speaks the R26 client's protocol on the `info` and `mus` WebSocket listeners. |
| `packages/store` | Persistence: opens the SQLite file, applies the update files and provides the typed operations. |
| `packages/virtual` | In-memory state of Project Reborn's entities, one package per entity. |
| `tools/checks` | Lists the projects that depend on a project (`make dependants`), and tests the shared check recipe `make/check.mk` and the root check `make/check-all.mk`. |
| `tools/create` | Scaffolds a new project from the `fullstack`, `backend` or `client` template. |
| `tools/tw-color` | Maps legacy CSS colors to the closest color in the Tailwind CSS v4 palette. |
| `tests/e2e` | Real Chromium against the production binaries. |

# Workspaces

- `go.work` holds the Go modules.
- `pnpm-workspace.yaml` holds the JavaScript projects: `apps/*`, `packages/*` and `tests/*`.
