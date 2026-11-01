---
type: Task
title: Match the landing page to Holo
description: Give the landing page Holo's sign-in texts, remember-me bubble, advert, no-JavaScript box and age-limit message, with a new Bubble primitive.
status: done
phase: p1
depends_on: [p1-11]
packages: [packages/components, packages/cms]
holo: [source/holo/index.php, source/holo/templates/login/column1.php, source/holo/web-gallery/static/js/fullcontent.js]
timestamp: 2026-11-01T18:35:36+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:35:36+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `index.php`.

# Steps

- [x] `Bubble` primitive with story and test, moved here from P2 because this is its first use.
- [x] The login box uses Holo's texts: `Sign in`, `Register`, `I forgot my username/password`.
- [x] Ticking `Remember me` shows Holo's warning bubble, without JavaScript.
- [x] The party advert under the login box links to `/register`.
- [x] Without JavaScript the promo shows the join box and `Enable JavaScript`.
- [x] `/?ageLimit=true` shows `You are too young to register.`
- [x] Blank fields keep their message, and the username is no longer trimmed.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/cms build
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01T18:35:36+00:00):

- 116 component tests and `svelte-check` pass, and the CMS builds with the advert, the bubble and the `noscript` box in
  `index.html`.
- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`, with tests for the age message and an untrimmed username.
- The bubble's toggle and the page in a browser are checked in [p1-18](/tasks/p1-18-exit-check-as-holo.md).

# Notes

- The remember-me bubble needs no JavaScript: `group-has-checked:` shows it while the box is ticked, as Holo's script did.
- `Bubble` was planned for P2; this is its first use.
- The texts `Sign in`, `Register` and `I forgot my username/password` come from Holo's `locale/en/login.php` and replace
  the shell's `Sign In`, `Register for free` and `I forgot my password/username`.
- Holo's tag cloud on this page waits for [P4](/phases/p4-community.md), with the tags.
