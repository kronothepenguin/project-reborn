---
type: Reference
title: Pages
description: How Go page structs feed the Astro pages, and how a page answers a form that fails.
---

# Page structs

- A Go handler fills a page struct, and the Astro page reads it through `[[ ]]` templates.
- Page structs on the `signed-out` layout embed `hotelStatus`, because the layout reads its names and counts and
  rendering fails without them.
- A page's field must keep a name apart from the layout's fields: a field named like the layout's hides it.
  `TestNoPageHidesAFieldOfTheLayout` in `internal/router/pages_test.go` guards every CMS page.

# Forms

- A form that fails answers 422 with the page it came from (`Router.invalid`).

# Astro

- Astro's HTML compression drops a line break between two tags, so a page writes a needed space between two tags as
  `{" "}`.
