---
type: Task
title: Build the account pages' frame and Looks
description: Port the settings navigation, the Join Club box and the Looks tab, with the editor listening as Holo's settings.js does.
status: done
phase: p2
depends_on: [p2-02]
packages: [packages/store, packages/cms]
holo: [source/holocms/account.php, source/holocms/web-gallery/static/js/settings.js]
timestamp: 2026-11-01T21:13:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:13:31+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for the frame of `account.php` and its first tab.

# Steps

- [x] `GET /account` goes to `/account/looks`.
- [x] `account/settings-nav` and the `Join <short name> Club` box for habbos outside the club.
- [x] `GET/POST /account/looks`, with Holo's texts.
- [x] `habbo/avatar-editor` gains what `settings.js` listens to: `setAllowedToProceed` for the save button, and the club and
      old-figure notices. `/register` stays as it is.
- [x] Tests.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then change a look in a real Chromium, and check `/register` still ignores `setAllowedToProceed`.

Results (2026-11-01T21:13:31+00:00):

- The CMS builds, and `gofmt`, `go vet` and `go test -race` pass in `packages/store` and `packages/cms`, with the component
  tests.
- A script drove the production binary in a real Chromium through 13 checks with no failure and an empty server log:
  `/account` opening on Looks, the save button starting and staying disabled until the editor allows it, the club and
  old-figure notices, saving a look to the database, the Join Club box, and `/register` still getting no such callback.
- The page was compared with a render of Holo's own CSS, with the real editor in it.
- Mutation checks: each of these, applied on purpose, failed a test: any gender, any figure, a failed form answering 200, and
  guests reaching the page.

# Notes

- Holo's `Save changes` starts disabled, and its Flash editor opened it five seconds after drawing a look the club
  allows. The HTML5 editor keeps it closed until it is touched, so `/register` must not take the editor's answer, and
  the looks page opens it after those five seconds itself ([0107](/decisions/0107-save-opens-after-the-first-look.md)).
  This note first said that Holo keeps `Save changes` disabled until the editor is touched;
  [p6-06](/tasks/p6-06-club-wardrobe.md) found the five seconds in the decompiled Flash.
- The installer's administrator look holds a club item, so that habbo sees the club notice until it picks another look. Holo's
  `settings.js` behaves the same way.
- The wardrobe waits for [P6](/phases/p6-economy.md).
- `Habbos` is a new entry in Holo's list, for [p2-06](/tasks/p2-06-several-habbos.md).
