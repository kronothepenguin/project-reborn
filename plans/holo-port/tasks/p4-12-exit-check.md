---
type: Task
title: Verify P4
description: Every exit criterion of P4 holds from a clean checkout, in a real browser, with p4-housekeeping merged.
status: done
phase: p4
depends_on: [p4-01, p4-02, p4-03, p4-04, p4-05, p4-06, p4-07, p4-08, p4-09, p4-10, p4-11, p4-13, p4-14, p4-15, p4-16, p4-17]
packages: [packages/cms, packages/housekeeping, packages/store, packages/virtual, tests/e2e]
holo: []
timestamp: 2026-11-04T17:03:28+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T17:03:28+00:00"}
---

# Goal

P4 meets its [exit criteria](/phases/p4-community.md#exit-criteria).

# Steps

- [x] `p4-housekeeping` merged into `main`, with every gate passing on the result.
- [x] From a clean checkout: `make install`, `make gates` and `make e2e`, with the tree unchanged after each.
- [x] Read every screenshot of the phase.
- [x] Record the differences from Holo in [Where the port differs from Holo](/reference/holo-differences.md).
- [x] Close the phase.

# Verification

```sh
make install && make gates && make e2e
```

Results (2026-11-04T17:03:28+00:00):

- `p4-housekeeping` and `p4-images` are merged into `main` (`860e19c8`, `e575e4ec`), with every gate and every browser
  check passing on each result.
- From a fresh clone of `952ca6da`: `make install`, `make gates` and `make e2e` pass, and the tree is unchanged after
  each. The gates cover the 13 Go modules, the 125 component tests and the Svelte check; the browser run passes all 800
  checks in 24 suites.
- The exit criteria hold in the browser: guests read the community, news, tags and staff pages (`community`, `news`,
  `tags`, `staff`); tag search, tagging yourself and the tag fight work (`tags`, `me`); and an article and a banner written
  in housekeeping appear on the site (`housekeeping-news`, `housekeeping-banners`).
- Every screenshot of the phase was read: the news, tags, community, staff, Me and landing pages, the settings' Staff
  Module, and housekeeping's news editor in each mode, the banners and the Uploaded Images page.
- The differences from Holo are recorded with each task, and the list's introduction now names P3 and P4.

# Notes

- The exit criteria had no browser check that housekeeping's news and banners reach the site; this task added them to
  `housekeeping-news` and `housekeeping-banners`.
- `reference/architecture.md` says where uploaded pictures live and why housekeeping loads them from `site.url`.
