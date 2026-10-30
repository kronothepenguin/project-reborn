---
type: Task
title: Wire the CMS to config, store, settings and auth
description: The CMS runners open config, store, settings and auth, and the router gets its dependencies, cross-origin protection, sessions and maintenance mode.
status: done
phase: p0
depends_on: [p0-09, p0-10]
packages: [packages/cms, apps/cms]
holo: [source/holo/core.php, source/holo/maintenance.php]
timestamp: 2026-10-28T02:06:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-28T02:06:46+00:00"}
---

# Goal

`apps/cms` starts on an installed database with sessions, live settings and cross-origin protection.

# Steps

- [x] `apps/cms/cmd/cms{,-dev}/main.go`, in order:
  1. `config.Get()`; exit with "run the installer" when `cfg.Store.Path` is missing.
  2. `store.Must(store.Open(...))`.
  3. `virtual.LoadSettings`.
  4. `auth.New(db, s)`.
  5. `cms.New(..., WithDB, WithSettings, WithAuth)`.
  6. `http.Server` on `cfg.CMS.Port` with
     `http.NewCrossOriginProtection().Handler(a.Sessions(mux))`, wrapped in `auth.RealIP(cfg.Proxy)`
     ([0028](/decisions/0028-trusted-proxies-in-config.md)).
  7. When the CMS runs alone, `Reload` every `cms.refresh` seconds, reading the interval again after each
     reload; in one binary with housekeeping nothing reloads ([0024](/decisions/0024-settings-catalogue-and-getters.md)).
- [x] `packages/cms/internal/router/router.go`:
      `Deps{Resolver, DB, Queries, Auth, Settings}`; handlers use `r.deps`.
- [x] Maintenance middleware: while `site.maintenance` is on and the user lacks `site.maintenanceBypass`, serve
      `maintenance.html` with 503 (the page keeps the login form).
- [x] Update `apps/cms/AGENTS.md` and `packages/cms/AGENTS.md`: the port now comes from config.

# Verification

```sh
cd packages/cms && pnpm build && go build ./... && go vet ./...
cd apps/cms && go build ./... && go vet ./...
```

After running the installer: start `apps/cms`, `curl -i localhost:17387/` returns 200, and
`curl -i -X POST localhost:17387/ -H 'Sec-Fetch-Site: cross-site'` returns 403.

Results (2026-10-28T02:06:46+00:00):

- `pnpm build` built `index`, `register` and `maintenance`. The maintenance page keeps three `[[ .ShortName ]]`
  placeholders, in its title and both texts, and its sign-in form posts to `/`.
- `go build ./...` and `go vet ./...` pass in `packages/cms` and `apps/cms`.
- `go test ./... -race` passes in `packages/cms`. `TestMaintenance` checks, with maintenance on:
  - guests get the 503 page on `/`, `GET /register` and `POST /register`;
  - `POST /` and static files stay open;
  - a player without the bypass gets 503, and staff with it see the site;
  - with maintenance off, the site is back.
- `ReloadEvery` (`packages/virtual`) has a test that sees a row written to the database within about a second and
  stops when its context ends.
- End-to-end run of the production binaries:
  - in an empty directory the CMS exits with "config.json is missing; run the installer first" and creates
    nothing;
  - after the installer, `GET /` and `GET /register` return 200, the cross-site `POST /` returns 403, and a
    same-origin one returns 200;
  - a `site.maintenance` row written straight into the database turned `/` into the 503 page in 0.89 s, naming the
    hotel and showing the sign-in form; deleting the row brought `/` back in 1.04 s.
- `gofmt`, `go vet` and `go test -race` pass in `packages/config`, `auth`, `virtual`, `store`, `cms` and
  `installer`, in `apps/cms` and `apps/installer`, and in `tools/create`.

# Notes

Changes from the steps:

- Step 1 checks that `config.json` exists before loading it, because `config.Load` would otherwise write a default
  file and the installer would skip its config step. The filename is now the exported `config.Filename`, which the
  installer also uses. Load errors exit with a message instead of the panic of `config.Get`.
- The maintenance gate wraps the page routes in `Mount` (`GET /`, `GET /register` and `POST /register`). The
  sign-in `POST /` and the static files stay open, so staff can sign in and the page keeps its images.
- Step 7 uses the new `virtual.Settings.ReloadEvery(ctx, db, "cms.refresh")`, which the runner starts in a goroutine
  and which housekeeping can reuse.

Pages:

- `maintenance.astro` ports Holo's `maintenance.php`: Frank's and Greggers' texts with the site's short name, their
  two GIFs (copied to `src/assets/maintenance/`), the mapping's cyan-950 background, and the sign-in box.
- The sign-in card of `index.astro` moved to `src/components/landing/login-box.astro`, the name P1 gives it, because
  the maintenance page is its second use. It gained `action="/"` and a `links` prop that hides the register and
  forgot links during maintenance.
- `POST /` is still the stub; signing in is P1's work.
- The two runners repeat the same wiring, as the generator's runners already did.
- `apps/cms/.air.toml` also watches `auth`, `config`, `store` and `virtual`.

Open:

- The CMS still binds `localhost`. A runner inside a container or pod must listen on all interfaces, which needs a
  decision when deployment comes.
