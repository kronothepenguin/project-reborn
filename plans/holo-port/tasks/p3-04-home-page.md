---
type: Task
title: Show a home
description: GET /home/{name} and GET /home?name= show a habbo's home to anyone, with its items, background and profile widget, and Holo's pages for unknown and banned habbos.
status: done
phase: p3
depends_on: [p3-02, p3-03]
packages: [packages/cms, packages/components, packages/store]
holo: [source/holo/user_profile.php, source/holo/web-gallery/styles/myhabbo/myhabbo.css, source/holo/web-gallery/styles/myhabbo/skins.css]
timestamp: 2026-11-03T18:34:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-03T18:34:45+00:00"}
---

# Goal

Guests and habbos read any home as Holo shows it.

# Steps

- [x] The playground with its background, stickers and notes, read from the home's items.
- [x] The profile widget: name, status, created date, badge, figure, motto and tags.
- [x] The club banner beside the playground for owners without club.
- [x] `Page not found!` for an unknown or archived habbo, and `User is Banned` for a banned one.
- [x] The Badge and Tag primitives.
- [x] The Edit button for the owner, on every one of their habbos ([0065](/decisions/0065-owners-edit-all-their-homes.md)).

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

Results (2026-11-03T18:34:45+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms` and `packages/store`, and `make check-docs` passes.
- `pnpm test homes signed-out me looks details habbos` passes all 169 checks in a real browser: a guest reads a home with
  its note, sticker and profile widget in their skins, the owner sees `Edit` on their habbos and nobody else does, and an
  unknown habbo gets Holo's `Page not found!`.
- The screenshots `home-guest` and `home-own` were read by eye.

# Notes

- Holo's skins are `src/styles/homes.css`, turned from `skins.css` by a script, keyed by `data-widget-skin` and
  `data-note-skin`, since an item's skin is runtime data.
- A home is under Me, as `My Page`, when it is the active habbo's, and under Community otherwise, as Holo's `myprofile`
  and `profile`.
