---
type: Task
title: Show the community page
description: GET /community shows the random habbos, the news promo, the tag cloud with its search, and the banners, as Holo's community.php.
status: todo
phase: p4
depends_on: [p4-03, p4-08]
packages: [packages/cms, tests/e2e]
holo: [source/holo/community.php, source/holo/includes/news_headlines.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

Anyone reads the community page, as in Holo.

# Steps

- [ ] Random habbos: an island placing 18 random habbos on Holo's grid, each with a tooltip of name, online state, creation date and motto, and a link to its home.
- [ ] The news promo: the two newest articles' top stories, turning every 10 seconds with a fade and pausing under the pointer, the next two as a list, and `More news »`, leaving out empty items.
- [ ] The tag cloud box `Users like..` and its search form.
- [ ] The banners column: the enabled banners, each image and text linking to its address in a new window.
- [ ] Tests and a browser suite `community`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && pnpm test community
```

# Notes

- Recommended rooms wait for the game server ([0013](/decisions/0013-defer-game-server-features.md)).
