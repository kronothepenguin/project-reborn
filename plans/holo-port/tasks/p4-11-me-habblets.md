---
type: Task
title: Fill the Me page's habblets and the landing's tag cloud
description: The Me page gains the tags habblet, the news promo and the banners column, and the landing page Holo's tag cloud.
status: todo
phase: p4
depends_on: [p4-08, p4-09]
packages: [packages/cms, tests/e2e]
holo: [source/holo/me.php, source/holo/tags_ajax.php, source/holo/templates/login/column1.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

The Me and landing pages show what Holo's showed in P4's scope.

# Steps

- [ ] The tags habblet: `Others Like...` with the tag cloud and `My Tags` with Holo's info texts, the habbo's tags, removing and adding through `/me/tags`, a question, and Holo's dialog for an invalid tag.
- [ ] The news promo and the banners column, as on the community page.
- [ ] The landing page's `<shortname>'s like` and tag cloud.
- [ ] Tests, and browser checks in the `me` and `signed-out` suites.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && pnpm test me signed-out
```

# Notes

- None yet.
