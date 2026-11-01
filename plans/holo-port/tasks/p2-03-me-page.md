---
type: Task
title: Build the Me page
description: Port the personal info plate, the inline motto editor and the feed with alerts, birthday, last sign-in and the staff help count.
status: todo
phase: p2
depends_on: [p2-02]
packages: [packages/store, packages/virtual, packages/components, packages/cms]
holo: [source/holo/me.php, source/holo/update_motto.php, source/holo/removefeeditem.php, source/holo/web-gallery/static/js/fullcontent.js]
timestamp: 2026-11-01T20:58:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `me.php`, as far as the phase reaches.

# Steps

- [ ] Queries for the wallet, the club end, the oldest alert, dismissing it, the last sign-in, open help tickets and the motto,
      with their OKF docs.
- [ ] `Spinner` primitive with story, test and catalogue entry.
- [ ] `me/personal-info`: the hotel view, `Hotel Closed`, the avatar linking to `/account/looks`, the motto and the link bar with
      credits and club.
- [ ] `me/motto-editor`: click to edit, `Enter` saves, `Esc` and `Cancel` leave it, and a motto over 38 characters is refused
      by keeping the old one.
- [ ] `me/feed`: staff help count with `housekeeping.help`, the oldest alert with its remove button, the birthday and the last
      sign-in.
- [ ] `features.birthdayNotifications`, on by default as in Holo's seed.
- [ ] Tests.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then edit the motto and dismiss an alert in a real Chromium.

# Notes

- None yet.
