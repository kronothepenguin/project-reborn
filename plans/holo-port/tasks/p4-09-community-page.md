---
type: Task
title: Show the community page
description: GET /community shows the random habbos, the news promo, the tag cloud with its search, and the banners, as Holo's community.php.
status: done
phase: p4
depends_on: [p4-03, p4-08]
packages: [packages/cms, tests/e2e]
holo: [source/holo/community.php, source/holo/includes/news_headlines.php]
timestamp: 2026-11-04T16:13:24+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T16:13:24+00:00"}
---

# Goal

Anyone reads the community page, as in Holo.

# Steps

- [x] Random habbos: an island placing 18 random habbos on Holo's grid, each with a tooltip of name, online state, creation date and motto, and a link to its home.
- [x] The news promo: the two newest articles' top stories, turning every 10 seconds with a fade and pausing under the pointer, the next two as a list, and `More news »`, leaving out empty items.
- [x] The tag cloud box `Users like..` and its search form.
- [x] The banners column: the enabled banners, each image and text linking to its address in a new window.
- [x] Tests and a browser suite `community`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && pnpm test community
```

Results (2026-11-04T16:13:24+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`.
- `pnpm test community` passes all 16 checks: the title and sub-tab; the grid with every habbo that is not archived,
  drawn within 0.7 seconds from the imager, the first where Holo put it; a habbo's tooltip with its name, creation date
  and motto; the newest article first with its picture and `Read more »`, the next two listed with their dates and
  `More news »`; the second story turning in after 10 seconds, waiting while the pointer is over the stories and turning
  again once it leaves; the cloud in `Users like..`; the enabled banner's picture and text in a new window, without the
  disabled one; the search form; and a habbo opening its home. `pnpm test tags` passes too. The screenshots
  `community` and `community-tooltip` were read by eye.
- The tests find the habbos that are not archived with Holo's creation date and their motto, 18 at most, the two newest
  articles as top stories with their pictures and the next two dated, fewer items with fewer articles, the cloud, the
  enabled banners in their order, and maintenance.
- Breaking these on purpose fails a test: 19 habbos, one or three top stories, five in the promo, the creation date in
  the news format, a top story without its picture, the list undated, disabled banners shown, a banner's text from its
  link, no cloud, and the page open during maintenance.

# Notes

- Recommended rooms wait for the game server ([0013](/decisions/0013-defer-game-server-features.md)).
- Holo gave pages without a `body_id` no column widths, so the page takes the 460/310/160 of `body#home`, which fits its
  435-pixel grid and its 300-pixel stories.
- Each habbo on the grid links over its whole picture, where Holo's image map took a 40 by 50 area of it, and the
  tooltip keeps Holo's hook: its bottom right 85 pixels right of and 40 below the habbo's top right.
- The islands read their data on mount: an `$effect` that wrote the habbos and read them again looped until Svelte
  stopped it.
- The tag cloud's tags are no longer underlined until the pointer is over them, as in Holo's `.habblet` boxes; this
  changes the tags page too.
- Recommended rooms wait for the game server ([0013](/decisions/0013-defer-game-server-features.md)).
