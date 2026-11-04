---
type: Task
title: Page the uploaded images in the browser
description: Housekeeping's Uploaded Images list shows ten pictures a page, turned in the browser with Newer and Older links, and the address keeps the page through a delete, a reload and Back.
status: done
phase: p4
depends_on: [p4-17]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T20:02:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T19:46:15+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-04T20:02:08+00:00"}
---

# Goal

Staff turn the Uploaded Images list ten pictures at a time without reloading it, and stay on their page through a
delete ([0080](/decisions/0080-uploaded-images-in-pages.md)).

# Steps

- [x] An island, `src/components/images/image-pages.svelte` with `client:only="svelte"`, shows ten rows of the list
  at a time and, under the table, the `Newer` and `Older` links of the other lists. Without JavaScript the list shows
  every row, as before.
- [x] The island reads the page from the address and writes it there (`?page=3`), so that a reload keeps it and Back
  returns to the page before. A number past the last page shows the last page, and anything else the first.
- [x] Each delete form carries the page (`POST /housekeeping/images/{id}/delete?page=3`). A delete answers
  `/housekeeping/images?deleted=1&page=3`, and a refused one shows the same page. A page that is not a positive number
  is left out of the answer.
- [x] Go tests for the page a delete carries, and in the browser suite `housekeeping-images`: the pages, the links, a
  reload, Back, and a delete and a refused delete on the second page.
- [x] The Uploaded Images row of [holo-differences](/reference/holo-differences.md) names the pages.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd packages/housekeeping && pnpm build && grep -o 'client="only"' dist/images.html && grep -c '\[\[ .ID \]\]' dist/images.html
cd tests/e2e && pnpm test housekeeping-images housekeeping-news housekeeping-access
make gates
```

Results (2026-11-04T20:02:08+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`. `TestADeleteReturnsToItsPage` checks that a
  delete answers on the page its form carried (`?page=3`) and leaves out `0`, `-2`, `two` and a missing page.
- `pnpm build` in `packages/housekeeping` passes. `dist/images.html` holds `client="only"` once, `[[ .ID ]]` twice and
  the list's `id="uploaded-images"`. `svelte-check` over `packages/housekeeping` finds 0 errors and 0 warnings.
- From a fresh build, `housekeeping-images`, `housekeeping-news` and `housekeeping-access` pass all 257 checks.
  `housekeeping-images` has 23 checks, 8 of them new:
  - twenty-one uploads show ten a page, newest first, with only `Older` on the first page;
  - `Older` turns to the next ten without loading the page again;
  - the last page holds the oldest picture, with only `Newer`;
  - Back returns to the page before, and a reload keeps it;
  - a delete on the second page answers on the second page, as does a refused one;
  - a page past the last shows the last, and one that is no number the first;
  - without JavaScript the list shows every picture.
  The screenshot `images-pages` shows the second page with `Newer` and `Older` under the table.
- `make gates` passes: `gofmt`, `go vet` and `go test -race` in every module, the 125 component tests, `svelte-check`,
  `sqlc generate` with no diff, and `make check-docs`.
- Breaking these on purpose fails a test, each from a passing run. In Go: accepting a page that is not positive,
  dropping the page, and keeping it only when it does not parse. In the browser: twenty a page, a form that drops the
  page, no Back, no last-page limit, and links that load the page again. The suite passes again once they are undone.
- `pnpm test` with several suites ran coreutils' `test` in a background shell; `node run.mjs` with the same suites runs
  them, as above.

# Notes

- Built with the skills `adding-svelte-interactivity`, `building-astro-components`, `templating-astro-pages`,
  `applying-go-patterns`, `use-modern-go` and `reviewing-effective-go`.
- The news editor's gallery is left as it is ([0080](/decisions/0080-uploaded-images-in-pages.md)).
