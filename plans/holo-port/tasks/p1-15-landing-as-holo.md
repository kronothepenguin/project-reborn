---
type: Task
title: Match the landing page to Holo
description: Give the landing page Holo's sign-in texts, remember-me bubble, advert, no-JavaScript box and age-limit message, with a new Bubble primitive.
status: todo
phase: p1
depends_on: [p1-11]
packages: [packages/components, packages/cms]
holo: [source/holo/index.php, source/holo/templates/login/column1.php, source/holo/web-gallery/static/js/fullcontent.js]
timestamp: 2026-11-01T18:13:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T18:13:48+00:00"}
---

# Goal

Implement [0034](/decisions/0034-behaviour-matches-holo.md) for `index.php`.

# Steps

- [ ] `Bubble` primitive with story and test, moved here from P2 because this is its first use.
- [ ] The login box uses Holo's texts: `Sign in`, `Register`, `I forgot my username/password`.
- [ ] Ticking `Remember me` shows Holo's warning bubble, without JavaScript.
- [ ] The party advert under the login box links to `/register`.
- [ ] Without JavaScript the promo shows the join box and `Enable JavaScript`.
- [ ] `/?ageLimit=true` shows `You are too young to register.`
- [ ] Blank fields keep their message, and the username is no longer trimmed.

# Verification

```sh
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/cms build
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- None yet.
