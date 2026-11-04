---
type: Task
title: Page the uploaded images in the browser
description: Housekeeping's Uploaded Images list shows ten pictures a page, turned in the browser with Newer and Older links, and the address keeps the page through a delete, a reload and Back.
status: todo
phase: p4
depends_on: [p4-17]
packages: [packages/housekeeping, tests/e2e]
holo: []
timestamp: 2026-11-04T19:46:15+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T19:46:15+00:00"}
---

# Goal

Staff turn the Uploaded Images list ten pictures at a time without reloading it, and stay on their page through a
delete ([0080](/decisions/0080-uploaded-images-in-pages.md)).

# Steps

- [ ] An island, `src/components/images/image-pages.svelte` with `client:only="svelte"`, shows ten rows of the list
  at a time and, under the table, the `Newer` and `Older` links of the other lists. Without JavaScript the list shows
  every row, as before.
- [ ] The island reads the page from the address and writes it there (`?page=3`), so that a reload keeps it and Back
  returns to the page before. A number past the last page shows the last page, and anything else the first.
- [ ] Each delete form carries the page (`POST /housekeeping/images/{id}/delete?page=3`). A delete answers
  `/housekeeping/images?deleted=1&page=3`, and a refused one shows the same page. A page that is not a positive number
  is left out of the answer.
- [ ] Go tests for the page a delete carries, and in the browser suite `housekeeping-images`: the pages, the links, a
  reload, Back, and a delete and a refused delete on the second page.
- [ ] The Uploaded Images row of [holo-differences](/reference/holo-differences.md) names the pages.

# Verification

```sh
# gofmt, go vet and go test -race in packages/housekeeping
cd packages/housekeeping && pnpm build && grep -o 'client="only"' dist/images.html && grep -c '\[\[ .ID \]\]' dist/images.html
cd tests/e2e && pnpm test housekeeping-images housekeeping-news housekeeping-access
make gates
```

# Notes

- Built with the skills `adding-svelte-interactivity`, `building-astro-components`, `templating-astro-pages`,
  `applying-go-patterns`, `use-modern-go` and `reviewing-effective-go`.
- The news editor's gallery is left as it is ([0080](/decisions/0080-uploaded-images-in-pages.md)).
