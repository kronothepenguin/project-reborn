---
type: Task
title: Spike: one Astro dev server for every site
description: A dev-only Astro project in packages/reborn injects the CMS's, housekeeping's and the installer's pages under /, /housekeeping/ and /installer/, and the spike reports whether one page of each renders with its styles and Svelte components and reloads live.
status: todo
slice: platform
depends_on: [platform-04]
packages: [packages/reborn, pnpm-lock.yaml]
sources: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

Know whether reborn's dev runner can proxy one dev server for every site
([0009](/decisions/0009-one-dev-server-for-reborn.md)).

# Steps

- [ ] In `packages/reborn`, beside the Go code: `package.json` (`@project-reborn/reborn`, private, never built for
  release), `astro.config.mjs` with the Svelte integration, Tailwind's Vite plugin and an integration that calls
  `injectRoute` for every page of `packages/cms/src/pages` under `/`, of `packages/housekeeping/src/pages` under
  `/housekeeping/` and of `packages/installer/src/pages` under `/installer/`, and Vite's `server.fs.allow` for the
  repository.
- [ ] One page of each site, fetched from that dev server, has its styles (Tailwind's classes found across the folders)
  and its Svelte components, and a change to its `.astro` file reloads it live.
- [ ] `astro.MakeServerResolver` with the three base addresses resolves one template of each site.
- [ ] Write the findings here: what works, what needed changing in each site (such as an `@source` line in a
  stylesheet), and what does not work.

# Verification

```sh
pnpm install --frozen-lockfile=false
pnpm --filter @project-reborn/reborn dev
make gates
```

Results: written here once run.

# Notes

- Runs on the branch `platform-11`; it changes `pnpm-lock.yaml`, which no other task may change at the same time.
- If it fails, the task is `blocked` with the findings, and the coordinator asks the user
  ([0009](/decisions/0009-one-dev-server-for-reborn.md)).
