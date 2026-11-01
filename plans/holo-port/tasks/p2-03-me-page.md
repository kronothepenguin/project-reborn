---
type: Task
title: Build the Me page
description: Port the personal info plate, the inline motto editor and the feed with alerts, birthday, last sign-in and the staff help count.
status: done
phase: p2
depends_on: [p2-02]
packages: [packages/store, packages/virtual, packages/components, packages/cms]
holo: [source/holo/me.php, source/holo/update_motto.php, source/holo/removefeeditem.php, source/holo/web-gallery/static/js/fullcontent.js]
timestamp: 2026-11-01T21:08:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:08:36+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `me.php`, as far as the phase reaches.

# Steps

- [x] Queries for the wallet, the club end, the oldest alert, dismissing it, the last sign-in, open help tickets and the motto,
      with their OKF docs.
- [x] `Spinner` primitive with story, test and catalogue entry.
- [x] `me/personal-info`: the hotel view, `Hotel Closed`, the avatar linking to `/account/looks`, the motto and the link bar with
      credits and club.
- [x] `me/motto-editor`: click to edit, `Enter` saves, `Esc` and `Cancel` leave it, and a motto over 38 characters is refused
      by keeping the old one.
- [x] `me/feed`: staff help count with `housekeeping.help`, the oldest alert with its remove button, the birthday and the last
      sign-in.
- [x] `features.birthdayNotifications`, on by default as in Holo's seed.
- [x] Tests.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then edit the motto and dismiss an alert in a real Chromium.

Results (2026-11-01T21:08:36+00:00):

- `sqlc generate` and `make check-docs` pass, and `gofmt`, `go vet` and `go test -race` pass in `packages/store`,
  `packages/virtual` and `packages/cms`. 118 component tests and `svelte-check` pass.
- A script drove the production binary in a real Chromium through 29 checks with no failure, no script error and an empty
  server log: the plate, the link bar, the staff message, the oldest alert and its lines, the birthday, the last sign-in,
  every way in and out of the motto editor, a motto over 38 characters, a motto holding HTML shown as text, dismissing an
  alert without a reload, and the motto and dismissal without JavaScript.
- The page was compared with a render of Holo's own CSS.
- Mutation checks: each of these, applied on purpose, failed a test:
  - the help count for everyone;
  - a motto limit of 39;
  - a birthday ignoring its setting, and one on the right day of any month;
  - every alert shown as a notification;
  - club days rounded down;
  - `11st` instead of `11th`;
  - dismissing another habbo's alert;
  - the newest alert first.

# Notes

- Holo bugs not ported:
  - `elseif($age == 3 || $age = 33)` assigns, so most birthdays read `33rd`; the port prints the right ordinal;
  - `PersonalInfo.init("")` starts the motto field empty, so the port starts it with the motto;
  - clearing the motto left nothing to click, so the port shows the prompt again.
- `alerts` has no type column: an alert with a sender is Holo's `Message from <short name> Staff`, and one without is its
  `Notification`.
- `GET /me?do=RemoveFeedItem` was a state change on a `GET`, so it is not ported.
- The groups and tags habblets, the news promo, recommended rooms and the banners belong to later phases.
- `Spinner` draws its image from CSS, as `Icon` does. `Textarea` waits for its first use.
