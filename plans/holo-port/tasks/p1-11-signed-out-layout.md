---
type: Task
title: Match the signed-out layout to Holo
description: Give the signed-out pages Holo's titles, meta tags, header stats, logo link and footer.
status: done
phase: p1
depends_on: []
packages: [packages/store, packages/cms]
holo: [source/holo/templates/login/subheader.php, source/holo/templates/login/header.php, source/holo/templates/login/footer.php]
timestamp: 2026-11-01T18:24:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:24:47+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for what every signed-out page shares.

# Steps

- [x] `CountAvatars` query, with its OKF docs.
- [x] `hotelStatus` carries the names and the registered count, and every page on the layout fills it in.
- [x] Titles: `<short name> ~ Home`, as Holo prints when a page sets no name, and `~ Register` on `/register`.
- [x] `description` and `keywords` meta tags.
- [x] The header shows `N users online now` and `N registered users`, and the logo links to `/`.
- [x] The footer links are separated by ` | `.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01T18:24:47+00:00):

- The CMS builds, and every built page keeps its `[[ ]]` placeholders. The titles are `[[ .ShortName ]] ~ Home`,
  `~ Register` on `/register` and `~ [[ .Habbo ]]` on `/me`, and the maintenance page keeps Holo's bare short name.
- `sqlc generate` changes nothing further, `make check-docs` and the store tests pass.
- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, with a new test for the header on every page.

# Notes

- Holo's process pages never set `$pagename`, so they all read `~ Home`, not only the landing page. This replaces the
  legal titles of [p1-10](/tasks/p1-10-register-page-title.md).
- Holo's `registered users` counted its `users` table, which held one row per habbo, so the header counts habbos.
- `mePage.Name` became `Habbo` and `registerPage.Name` too, because they would have hidden the hotel's name from the
  layout.
