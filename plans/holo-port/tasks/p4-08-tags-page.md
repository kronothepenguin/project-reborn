---
type: Task
title: Find habbos by tag and fight tags
description: GET /tags shows the tag cloud, the tag fight and a search for habbos with a tag, POST /tags tags the active habbo, and POST /tags/fight answers a fight, as Holo's tags pages.
status: todo
phase: p4
depends_on: []
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holo/tags.php, source/holo/tagfight.php, source/holo/tagcloud.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

Anyone finds habbos by tag and fights tags, and a habbo tags itself, as in Holo.

# Steps

- [ ] The tag cloud: 20 random tags in use, sized 100% to 200% by count, as a component the community, landing and Me pages reuse.
- [ ] The search: the habbos with the tag, up to 20, with their avatar, home link, motto and tags, and Holo's count texts.
- [ ] Tag yourself: `POST /tags` with P3's rules for the active habbo.
- [ ] The tag fight: an island with Holo's GIFs, its 3-second fight and its texts, and `POST /tags/fight`; `features.tagFight` hides it.
- [ ] The store's tag operations and their docs; the 210/560/160 columns of `body#tags`.
- [ ] Tests and a browser suite `tags`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && pnpm test tags
```

# Notes

- None yet.
