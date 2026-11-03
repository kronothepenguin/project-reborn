---
type: Task
title: Show a home
description: GET /home/{name} and GET /home?name= show a habbo's home to anyone, with its items, background and profile widget, and Holo's pages for unknown and banned habbos.
status: todo
phase: p3
depends_on: [p3-02, p3-03]
packages: [packages/cms, packages/components, packages/store]
holo: [source/holo/user_profile.php, source/holo/web-gallery/styles/myhabbo/myhabbo.css, source/holo/web-gallery/styles/myhabbo/skins.css]
timestamp: 2026-11-03T17:26:52+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-03T17:26:52+00:00"}
---

# Goal

Guests and habbos read any home as Holo shows it.

# Steps

- [ ] The playground with its background, stickers and notes, read from the home's items.
- [ ] The profile widget: name, status, created date, badge, figure, motto and tags.
- [ ] The club banner beside the playground for owners without club.
- [ ] `Page not found!` for an unknown or archived habbo, and `User is Banned` for a banned one.
- [ ] The Badge and Tag primitives.
- [ ] The Edit button for the owner, on every one of their habbos ([0065](/decisions/0065-owners-edit-all-their-homes.md)).

# Verification

```sh
# gofmt, go vet and go test -race in every module touched
make e2e
```

# Notes

- None yet.
