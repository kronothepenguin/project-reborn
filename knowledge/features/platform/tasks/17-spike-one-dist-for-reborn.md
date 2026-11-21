---
type: Task
title: "Spike: one dist for reborn"
description: A spike proves whether the Astro project of packages/reborn can build one dist with the pages and files of the site, housekeeping and the installer, served in development and in a release alike.
scope: [packages/reborn]
depends_on: []
skills: [building-astro-components, templating-astro-pages]
---

# Goal

Answer the user's question: "is it possible to merge three project insto reborn? so we have the same for dev and prod,
when build reborn generates its own dist with all the assets from cms, installer and housekeeping."

# Context

- [The runner owns reborn's HTTP server](/decisions/reborn/0015-the-runner-owns-reborns-http-server.md)
- [One dev server for reborn](/decisions/reborn/0009-one-dev-server-for-reborn.md), the dev-only project of today.
- `packages/reborn/astro.config.mjs` and `packages/reborn/knowledge/dev-server.md`.
- `apps/reborn/cmd/reborn/main.go` and `apps/reborn/cmd/reborn-dev/main.go`, for how a runner reads pages and files.

# Steps

- [ ] `astro build` in `packages/reborn` writes one `dist`: the site's pages at `/`, housekeeping's under
  `/housekeeping/`, the installer's under `/installer/`, each site's `public/` files under its base, and the shared
  styles and scripts.
- [ ] Compare each built page with the page of the site's own `dist`: the same HTML apart from file names.
- [ ] A throwaway Go program serves that `dist` with `astro.MakeFSResolver` and `http.FileServerFS`, each site reading
  its pages under its base. Open one page of each site, with styles, pictures and one Svelte island working.
- [ ] The dev server still serves the three sites with live reload.
- [ ] Measure the build time, and the size of `dist` beside the three `dist` folders of today.
- [ ] Before the installation only the installer is mounted: list the paths its pages load outside `/installer/`.

# Report

- Works, works with changes, or fails, with the changes each site needs.
- The measurements, and every surprise.
- Keep the branch unmerged, and delete the worktree.
