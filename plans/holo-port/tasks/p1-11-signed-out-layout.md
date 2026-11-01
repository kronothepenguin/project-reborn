---
type: Task
title: Match the signed-out layout to Holo
description: Give the signed-out pages Holo's titles, meta tags, header stats, logo link and footer.
status: todo
phase: p1
depends_on: []
packages: [packages/store, packages/cms]
holo: [source/holo/templates/login/subheader.php, source/holo/templates/login/header.php, source/holo/templates/login/footer.php]
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for what every signed-out page shares.

# Steps

- [ ] `CountAvatars` query, with its OKF docs.
- [ ] `hotelStatus` carries the names and the registered count, and every page on the layout fills it in.
- [ ] Titles: `<short name> ~ Home`, as Holo prints when a page sets no name, and `~ Register` on `/register`.
- [ ] `description` and `keywords` meta tags.
- [ ] The header shows `N users online now` and `N registered users`, and the logo links to `/`.
- [ ] The footer links are separated by ` | `.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- None yet.
