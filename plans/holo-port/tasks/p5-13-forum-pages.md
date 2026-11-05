---
type: Task
title: Show the board and its threads
description: GET /forum and GET /forum/threads/{id} show Holo's Discussion Board and its threads ten to a page, with stickies on every page, page links, the jump to the last post, a view counted on every load, and Holo's post boxes, while features.forum is on.
status: todo
phase: p5
depends_on: [p5-01, p5-03, p5-12]
packages: [packages/cms, packages/components, tests/e2e]
holo: [source/holo/forum.php, source/holo/viewthread.php]
timestamp: 2026-11-05T19:06:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T19:06:47+00:00"}
---

# Goal

Anyone reads the board, as on Holo's `forum.php` and `viewthread.php` ([0017](/decisions/0017-guest-read-access.md),
[0087](/decisions/0087-online-picture-stays-offline.md), [0088](/decisions/0088-stickies-head-every-page.md),
[0089](/decisions/0089-archived-habbos-show-as-archived.md), [0094](/decisions/0094-thread-views-count-every-load.md)).

# Steps

- [ ] `GET /forum`: Holo's board with its columns, `View page:` links, the `New Thread` buttons for signed-in
  visitors and Holo's line for guests.
- [ ] `GET /forum/threads/{id}`: the posts 10 a page with `RE:` titles, dates and `Last modified ... by ...`, the
  jump to the last post, and a view counted on every load.
- [ ] Post boxes: the name, the offline picture, `Messages:`, the avatar, the favourite group's badge, the worn badge
  and the motto; an archived habbo shows `archived` with no link and an empty box.
- [ ] With `features.forum` off the pages send visitors to the landing page, as Holo did.
- [ ] A `Pagination` primitive in `packages/components` for the page links, with a story, a test and its export.
- [ ] Go tests, and a browser suite `forum`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
pnpm --filter @project-reborn/components test
cd tests/e2e && node run.mjs forum
```
