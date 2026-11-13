---
type: Task
title: "Spike: one Astro dev server for every site"
description: A dev-only Astro project in packages/reborn injects the CMS's, housekeeping's and the installer's pages under /, /housekeeping/ and /installer/, and the spike reports whether one page of each renders with its styles and Svelte components and reloads live.
scope: [packages/reborn, pnpm-lock.yaml]
depends_on: [04-installer-under-installer]
skills: []
---

# Goal

Know whether reborn's dev runner can proxy one dev server for every site
([0009](/decisions/reborn/0009-one-dev-server-for-reborn.md)).

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- [reborn's dev runner proxies one Astro dev server for every site, after a spike proves
  it](/decisions/reborn/0009-one-dev-server-for-reborn.md)
- It changes `pnpm-lock.yaml`, which no other task may change at the same time.
- If it fails, the slave stops and reports the findings, and the master asks the user
  ([0009](/decisions/reborn/0009-one-dev-server-for-reborn.md)).

# Steps

- [ ] In `packages/reborn`, beside the Go code: `package.json` (`@project-reborn/reborn`, private, never built for
  release), `astro.config.mjs` with the Svelte integration, Tailwind's Vite plugin and an integration that calls
  `injectRoute` for every page of `packages/cms/src/pages` under `/`, of `packages/housekeeping/src/pages` under
  `/housekeeping/` and of `packages/installer/src/pages` under `/installer/`, and Vite's `server.fs.allow` for the
  repository.
- [ ] One page of each site, fetched from that dev server, has its styles (Tailwind's classes found across the folders)
  and its Svelte components, and a change to its `.astro` file reloads it live.
- [ ] `astro.MakeServerResolver` with the three base addresses resolves one template of each site.
- [ ] Write the findings in the report: what works, what needed changing in each site (such as an `@source` line in a
  stylesheet), and what does not work.

# Checks

```sh
pnpm install --frozen-lockfile=false
pnpm --filter @project-reborn/reborn dev
make gates
```
