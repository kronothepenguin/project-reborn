---
type: Task
title: Build the community layout
description: Port Holo's community header, main tabs, sub-tabs, habbo search, mini login, footer and maintenance alert into layouts/community.astro.
status: done
phase: p2
depends_on: []
packages: [packages/virtual, packages/cms]
holo: [source/holo/templates/community/header.php, source/holo/templates/community/footer.php, source/holo/templates/community/subheader.php]
timestamp: 2026-11-01T21:02:34+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:02:34+00:00"}
---

# Goal

Give every signed-in page Holo's chrome, for guests and for signed-in users ([0034](/decisions/0034-behaviour-matches-holo.md)).

# Steps

- [x] `layouts/community.astro`, taking the active main tab and sub-tab as props, with Holo's three sub-tab groups.
- [x] `header/main-tabs`: the habbo's name or `Register now!`, Community, Credits, and Housekeeping with `housekeeping.access`.
- [x] `header/sub-tabs`, `header/user-menu` (Help, Sign Out, and a link to switch with several habbos),
      `header/habbo-search` and `header/mini-login`.
- [x] `N users online now`, `<site> is offline`, and the page background.
- [x] Staff passing maintenance see `Alert: The site is currently turned off!` above and below the page.
- [x] `site.housekeepingUrl`, because a housekeeping running alone is on another port.
- [x] The signed-out footer shows `Housekeeping` to staff.
- [x] `/me` moves to the layout. Tests.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then look at both header states in a real Chromium, next to the render of Holo's own CSS.

Results (2026-11-01T21:02:34+00:00):

- The CMS builds, and `gofmt`, `go vet` and `go test -race` pass in `packages/virtual` and `packages/cms`, with tests for the
  Housekeeping tab, its setting, the signed-out footer, the maintenance alert and the switch link. Component tests pass.
- The signed-in and guest headers were compared in a real Chromium with a render of Holo's own CSS and images: main tabs,
  sub-tabs, offline text, search box, online box, and the guest box that shows its labels on hover or focus.
- The guest header has no page yet, so it was checked by rendering the built template with guest data.

# Notes

- This task fixed a bug from [p1-15](/tasks/p1-15-landing-as-holo.md): `Bubble` carries `relative`, so `absolute` from its
  caller lost and the remember-me bubble pushed the page down. A wrapper now positions it, and in the browser the link below
  it no longer moves.
- `site.housekeepingUrl` exists because a housekeeping running alone is on another port, so `/housekeeping` would be a dead
  link on the CMS. Its default is the path, which suits the orchestrator.
- `My Friends`, `My Groups` and `My Rooms` wait for their phases, and `Enter <site>` waits for the client, so the guest header
  says `<site> is offline` as the signed-in one does.
- Links to pages that do not exist yet, such as `/community` and `/credits`, are in place as Holo has them, and answer 404
  until their phases.
