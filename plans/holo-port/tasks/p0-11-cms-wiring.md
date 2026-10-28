---
type: Task
title: Wire the CMS to config, store, settings and auth
description: The CMS runners open config, store, settings and auth, and the router gets its dependencies, cross-origin protection, sessions and maintenance mode.
status: todo
phase: p0
depends_on: [p0-09, p0-10]
packages: [packages/cms, apps/cms]
holo: [source/holo/core.php, source/holo/maintenance.php]
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

`apps/cms` starts on an installed database with sessions, live settings and cross-origin protection.

# Steps

- [ ] `apps/cms/cmd/cms{,-dev}/main.go`, in order:
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
- [ ] `packages/cms/internal/router/router.go`:
      `Deps{Resolver, DB, Queries, Auth, Settings}`; handlers use `r.deps`.
- [ ] Maintenance middleware: while `site.maintenance` is on and the user lacks `site.maintenanceBypass`, serve
      `maintenance.html` with 503 (the page keeps the login form).
- [ ] Update `apps/cms/AGENTS.md` and `packages/cms/AGENTS.md`: the port now comes from config.

# Verification

```sh
cd packages/cms && pnpm build && go build ./... && go vet ./...
cd apps/cms && go build ./... && go vet ./...
```

After running the installer: start `apps/cms`, `curl -i localhost:17387/` returns 200, and
`curl -i -X POST localhost:17387/ -H 'Sec-Fetch-Site: cross-site'` returns 403.

# Notes

- In development the runners run from the repository root and read the root `config.json`
  ([0027](/decisions/0027-runners-run-from-the-root.md)).
