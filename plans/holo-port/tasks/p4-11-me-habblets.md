---
type: Task
title: Fill the Me page's habblets and the landing's tag cloud
description: The Me page gains the tags habblet, the news promo and the banners column, and the landing page Holo's tag cloud.
status: done
phase: p4
depends_on: [p4-08, p4-09]
packages: [packages/cms, tests/e2e]
holo: [source/holo/me.php, source/holo/tags_ajax.php, source/holo/templates/login/column1.php]
timestamp: 2026-11-04T16:36:30+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T16:36:30+00:00"}
---

# Goal

The Me and landing pages show what Holo's showed in P4's scope.

# Steps

- [x] The tags habblet: `Others Like...` with the tag cloud and `My Tags` with Holo's info texts, the habbo's tags, removing and adding through `/me/tags`, a question, and Holo's dialog for an invalid tag.
- [x] The news promo and the banners column, as on the community page.
- [x] The landing page's `<shortname>'s like` and tag cloud.
- [x] Tests, and browser checks in the `me` and `signed-out` suites.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms
cd tests/e2e && pnpm test me signed-out
```

Results (2026-11-04T16:36:30+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/cms`.
- `pnpm test me signed-out` passes all 103 checks: the tags habblet opening on My Tags with Holo's text for no tags, a
  tag added and counted, Holo's dialog for an invalid tag, Holo's text at the limit with the form gone, Others Like...
  with the cloud and its search form, the news promo and the banners on the Me page, a tag removed with the form back,
  and the landing page's `Reborn's like` with its cloud. The screenshots `me-habblets`, `me-tags-dialog` and `landing`
  were read by eye.
- The tests find the active habbo's tags, the limit from `homes.maxTags`, the cloud, the news promo and the banners on
  the Me page, none for a habbo without them, and the cloud on the landing page, after a failed sign-in too.
- Breaking these on purpose fails a test: no tags, cloud, news or banners on the Me page, Holo's 20 instead of the
  setting, and no cloud on the landing page.

# Notes

- The habblet is an island over the page's data: the habbo's tags and limit, and the cloud of Others Like..., drawn by
  the page and moved into its tab, where Holo loaded `tagcloud.php` when the tab opened. Adding and removing go through
  P3's `/me/tags`, so the rules are `homes.maxTags` and `^[a-z0-9]{2,20}$`.
- The question is one of the Me page's sixteen, asked again after every change; Holo asked from an older list then.
- Every test habbo now has a profile and a home, as every habbo has, since the Me page reads its tags.
- `Input` takes its classes from a `class` passed to it, so the habblet's field is a plain input, as P3's tag panel's.
