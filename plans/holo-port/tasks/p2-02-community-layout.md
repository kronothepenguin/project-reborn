---
type: Task
title: Build the community layout
description: Port Holo's community header, main tabs, sub-tabs, habbo search, mini login, footer and maintenance alert into layouts/community.astro.
status: todo
phase: p2
depends_on: []
packages: [packages/virtual, packages/cms]
holo: [source/holo/templates/community/header.php, source/holo/templates/community/footer.php, source/holo/templates/community/subheader.php]
timestamp: 2026-11-01T20:58:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
---

# Goal

Give every signed-in page Holo's chrome, for guests and for signed-in users ([0034](/decisions/0034-behaviour-matches-holo.md)).

# Steps

- [ ] `layouts/community.astro`, taking the active main tab and sub-tab as props, with Holo's three sub-tab groups.
- [ ] `header/main-tabs`: the habbo's name or `Register now!`, Community, Credits, and Housekeeping with `housekeeping.access`.
- [ ] `header/sub-tabs`, `header/user-menu` (Help, Sign Out, and a link to switch with several habbos),
      `header/habbo-search` and `header/mini-login`.
- [ ] `N users online now`, `<site> is offline`, and the page background.
- [ ] Staff passing maintenance see `Alert: The site is currently turned off!` above and below the page.
- [ ] `site.housekeepingUrl`, because a housekeeping running alone is on another port.
- [ ] The signed-out footer shows `Housekeeping` to staff.
- [ ] `/me` moves to the layout. Tests.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then look at both header states in a real Chromium, next to the render of Holo's own CSS.

# Notes

- None yet.
