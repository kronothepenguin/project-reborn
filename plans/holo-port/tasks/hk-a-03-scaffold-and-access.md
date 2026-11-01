---
type: Task
title: Scaffold housekeeping and guard its routes
description: Generate packages/housekeeping and apps/housekeeping, mount them under /housekeeping alone and on a shared mux, and keep out guests and non-staff.
status: done
phase: hk-a
depends_on: [hk-a-01, hk-a-02]
packages: [packages/housekeeping, apps/housekeeping]
holo: [source/holo/housekeeping/index.php, source/holo/housekeeping/access_denied.php]
timestamp: 2026-11-01T21:18:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:18:45+00:00"}
---

# Goal

`make create name=housekeeping` gives the two projects, and every route under `/housekeeping/` belongs to staff.

# Steps

- [x] `make create name=housekeeping`.
- [x] `astro.config.mjs` sets `base: "/housekeeping"`, and the dev resolver's base URL includes it
  ([0003](/decisions/0003-housekeeping-under-prefix.md)).
- [x] Both runners read `housekeeping.host` and `housekeeping.port`.
- [x] `New(db, opts...)` loads the settings, builds the same protection as the CMS and registers
  `auth.DeleteExpiredSessions` on `packages/scheduler` every minute
  ([0050](/decisions/0050-expired-sessions-deleted.md)).
- [x] `Mount` registers only `/housekeeping/...`, and `/housekeeping/` for the static files through `http.StripPrefix`.
- [x] A guest goes to `site.url`, a banned user loses the session and gets 403, as Holo's `core.php` runs on these pages
  too, and a signed-in user without `housekeeping.access` gets 403.
- [x] Tests: every route for guests, non-staff and banned users; an empty database; `Mount` alone and on one mux shared
  with the CMS.
- [x] The READMEs of both projects say what these do.

# Verification

```sh
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
cd apps/housekeeping && gofmt -l cmd && go vet ./... && go build ./...
```

Then break the check on purpose, confirm that a test fails, and restore it.

Results (2026-11-01):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, with 11 tests, and `apps/housekeeping` builds.
  `TestItSharesAMuxWithTheCMS` mounts both programs on one mux with one database, and the CMS's session opens housekeeping.
- Seven breaks, one at a time, from a passing baseline, were each caught by a named test: no `housekeeping.access` check,
  guests sent to `/`, bans ignored, static files outside the check, static files keeping the prefix, no cross-origin
  protection, and `/` registered.
- The production binary, from a temporary `config.json` with host `127.0.0.1` and port 18466, listened there and not on
  the default port, created the database in an empty folder, sent a guest to `site.url` with 303, sent `/housekeeping` to
  `/housekeeping/`, and answered 404 on `/`.

# Notes

- The static files sit behind the same check as the pages, because `/housekeeping/` is a route too and it serves the
  built templates.
- The `ServeMux` of Go 1.27 answers 307, not 301, to `/housekeeping`, so the test asserts where it goes and not the code.
- The Access Denied page for staff missing an attribute comes with the layout, in
  [hk-a-04](/tasks/hk-a-04-layout.md).
