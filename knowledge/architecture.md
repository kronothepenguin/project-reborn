---
type: Architecture
title: Monorepo architecture
description: The apps are runners and the packages hold the full applications, in one Go and one pnpm workspace.
---

# Apps and packages

The apps are runners. The packages hold the code of the full applications, because one runner, `reborn`, will embed
every other app. `apps/reborn` is planned.

[How the programs work together](/programs.md)

# Projects

| Folder | What it is |
| --- | --- |
| `apps/cms` | Thin runner for `packages/cms`. |
| `apps/housekeeping` | Thin runner for `packages/housekeeping`. |
| `apps/installer` | Thin runner for `packages/installer`. |
| `apps/server` | Thin runner for `packages/server`. |
| `packages/astro` | astro |
| `packages/auth` | Sign-in, sessions, access attributes and password resets for the CMS, housekeeping and installer. |
| `packages/client-r26` | client-r26 |
| `packages/cms` | Astro (Svelte + Tailwind) frontend embedded in a Go module. |
| `packages/components` | The project's design system: UI components shared across the project's applications. |
| `packages/config` | Shared configuration layer for Project Reborn. |
| `packages/director` | director |
| `packages/housekeeping` | Astro (Svelte + Tailwind) frontend embedded in a Go module. |
| `packages/installer` | Writes `config.json`, creates the database, the site settings and the first administrator. |
| `packages/scheduler` | Runs tasks on a timer, inside the process, like a small cron. |
| `packages/server` | A Go module without a frontend, run by `apps/server`. |
| `packages/store` | Persistence: opens the SQLite file, applies the update files and provides the typed operations. |
| `packages/virtual` | In-memory state of Project Reborn's entities, one package per entity. |
| `tools/create` | create |
| `tools/tw-color` | Maps legacy CSS colors to the closest color in the Tailwind CSS v4 palette. |
| `tests/e2e` | Real Chromium against the production binaries. |

# Workspaces

- `go.work` holds the Go modules.
- `pnpm-workspace.yaml` holds the JavaScript projects: `apps/*`, `packages/*` and `tests/*`.
