---
type: Task
title: Find habbos by tag and fight tags
description: GET /tags shows the tag cloud, the tag fight and a search for habbos with a tag, POST /tags tags the active habbo, and POST /tags/fight answers a fight, as Holo's tags pages.
status: done
phase: p4
depends_on: []
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holo/tags.php, source/holo/tagfight.php, source/holo/tagcloud.php]
timestamp: 2026-11-04T02:43:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T02:43:47+00:00"}
---

# Goal

Anyone finds habbos by tag and fights tags, and a habbo tags itself, as in Holo.

# Steps

- [x] The tag cloud: 20 random tags in use, sized 100% to 200% by count, as a component the community, landing and Me pages reuse.
- [x] The search: the habbos with the tag, up to 20, with their avatar, home link, motto and tags, and Holo's count texts.
- [x] Tag yourself: `POST /tags` with P3's rules for the active habbo.
- [x] The tag fight: an island with Holo's GIFs, its 3-second fight and its texts, and `POST /tags/fight`; `features.tagFight` hides it.
- [x] The store's tag operations and their docs; the 210/560/160 columns of `body#tags`.
- [x] Tests and a browser suite `tags`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && pnpm test tags
```

Results (2026-11-04T02:43:47+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms` and `packages/store`; `make check-docs` and
  `go tool sqlc diff` pass in `packages/store`.
- `pnpm test tags` passes all 18 checks: the title and sub-tab; the cloud sized 200% and 100% without an archived
  habbo's tag; `No results` before a search; a search from the cloud with Holo's count in the title and `1 - 2 / 2`, the
  habbos in the order they took the tag with their avatar, motto and tags; a search lowered and finding no archived
  habbo; a fight won by the first tag, then `Again?` with an empty form and `Start`, then a tie; tagging yourself from a
  search; and `features.tagFight` off hiding the fight. The screenshots `tags`, `tags-search`, `tags-fight` and
  `tags-tagged` were read by eye.
- The store tests count the cloud's habbos without archived ones, list a tag's habbos in the order they took it, and
  count a tag exactly. The CMS tests find Holo's sizes, 20 tags in the cloud and 20 habbos in a search, the search
  lowered and exact, the offer to tag yourself only for a valid tag the habbo lacks and has room for, the post that adds
  it or quietly refuses it, the fight's counts with MySQL's comparison, its 400s, the switch and maintenance.
- Breaking these on purpose fails a test: 21 tags or habbos, sizes not from the least carried, a spread of 0, the
  search keeping its case or searching nothing, the offer for a tag the habbo has, past the limit or invalid, the fight
  keeping case or trailing spaces, taking empty tags or ignoring its switch, the page ignoring the switch, the redirect
  unescaped, the added tag keeping its case, results without their tags, guests tagging, the fight open during
  maintenance, and each query counting archived habbos, matching a pattern or listing by name.

# Notes

- Holo's float arithmetic for the cloud's sizes gives the same percentages as exact arithmetic for every spread up to
  2000, so the port keeps Holo's formula.
- The fight compares a typed tag as MySQL compared Holo's: in any case and without trailing spaces. The island tells the
  winner from the two counts, as Holo's page did, and a failed request brings the form back with what was typed.
- `POST /tags` and `POST /me/tags` share `addProfileTag`, P3's rules.
- An archived habbo leaves the lists ([0058](/decisions/0058-habbos-are-archived.md)), so its tags leave the cloud, the
  search and the fight.
