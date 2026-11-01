---
type: Task
title: Scaffold housekeeping and guard its routes
description: Generate packages/housekeeping and apps/housekeeping, mount them under /housekeeping alone and on a shared mux, and keep out guests and non-staff.
status: todo
phase: hk-a
depends_on: [hk-a-01, hk-a-02]
packages: [packages/housekeeping, apps/housekeeping]
holo: [source/holo/housekeeping/index.php, source/holo/housekeeping/access_denied.php]
timestamp: 2026-11-01T21:07:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
---

# Goal

`make create name=housekeeping` gives the two projects, and every route under `/housekeeping/` belongs to staff.

# Steps

- [ ] `make create name=housekeeping`.
- [ ] `astro.config.mjs` sets `base: "/housekeeping"`, and the dev resolver's base URL includes it
  ([0003](/decisions/0003-housekeeping-under-prefix.md)).
- [ ] Both runners read `housekeeping.host` and `housekeeping.port`.
- [ ] `New(db, opts...)` loads the settings, builds the same protection as the CMS and registers
  `auth.DeleteExpiredSessions` on `packages/scheduler` every minute
  ([0050](/decisions/0050-expired-sessions-deleted.md)).
- [ ] `Mount` registers only `/housekeeping/...`, and `/housekeeping/` for the static files through `http.StripPrefix`.
- [ ] A guest goes to `site.url`, a banned user loses the session and gets 403, as Holo's `core.php` runs on these pages
  too, and a signed-in user without `housekeeping.access` gets 403.
- [ ] Tests: every route for guests, non-staff and banned users; an empty database; `Mount` alone and on one mux shared
  with the CMS.
- [ ] The READMEs of both projects say what these do.

# Verification

```sh
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
cd apps/housekeeping && gofmt -l cmd && go vet ./... && go build ./...
```

Then break the check on purpose, confirm that a test fails, and restore it.

# Notes

- The static files sit behind the same check as the pages, because `/housekeeping/` is a route too and it serves the
  built templates.
