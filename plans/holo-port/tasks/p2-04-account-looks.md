---
type: Task
title: Build the account pages' frame and Looks
description: Port the settings navigation, the Join Club box and the Looks tab, with the editor listening as Holo's settings.js does.
status: todo
phase: p2
depends_on: [p2-02]
packages: [packages/store, packages/cms]
holo: [source/holo/account.php, source/holo/web-gallery/static/js/settings.js]
timestamp: 2026-11-01T20:58:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for the frame of `account.php` and its first tab.

# Steps

- [ ] `GET /account` goes to `/account/looks`.
- [ ] `account/settings-nav` and the `Join <short name> Club` box for habbos outside the club.
- [ ] `GET/POST /account/looks`, with Holo's texts.
- [ ] `habbo/avatar-editor` gains what `settings.js` listens to: `setAllowedToProceed` for the save button, and the club and
      old-figure notices. `/register` stays as it is.
- [ ] Tests.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then change a look in a real Chromium, and check `/register` still ignores `setAllowedToProceed`.

# Notes

- None yet.
