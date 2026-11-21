# reborn

Builds the whole hotel on one database handle: the site, housekeeping, the installer and the game. It mounts the
installer, or the site and housekeeping, on a mux it receives, and starts and stops the game. `apps/reborn` is its
runner and owns the HTTP server.

How it works: `knowledge/index.md`.

Its Astro project serves every site's pages from one dev server and builds them into one `dist`
(`knowledge/dev-server.md`):

```sh
pnpm --filter @project-reborn/reborn dev
pnpm --filter @project-reborn/reborn build
```

Check, from `packages/reborn`, after `make install` in `apps/reborn`, which gives the frontends their `dist/`:

```sh
make check
```
