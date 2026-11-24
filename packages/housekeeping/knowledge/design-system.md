---
type: Reference
title: The design system and the chrome
description: How housekeeping's components and layout are built, and the chrome every page struct embeds.
---

# Components

Each component has one look on every page (decision holo-port/0060). The look is its own design system (decision
holo-port/0041), built from `docs/hk.png` and `knowledge/colours.md`.

- Blue navigation and forms, gold data lists through `Box color="gold"` and `Table`, and plain form rows through
  `Table variant="form"`.
- `Box`, `Table` and the submit button, `Button variant="plain" size="compact" type="submit"`, come from
  `packages/components`. A class with `&` in a Svelte component that takes a spread belongs in a
  script constant, because the server renderer escapes a literal class twice.

# The sizes

Housekeeping follows the sizes of the look-and-feel plan: the body is `text-base` (16px) in the theme's `--font-sans`,
`Verdana, Arial, Helvetica, sans-serif`, set in `src/styles/global.css`. Widths grew by 1240/960 (a tab `w-56`, the left
column `w-60`), paddings and gaps by 4/3, on Tailwind's scale. Borders and pictures keep their sizes. Every page fits a
1366px screen with nothing scrolling sideways.

# The layout

`src/layouts/housekeeping.astro` has the grey bar with who is logged in and their previous login, `Log out` beside the
clock box, the tabs over the blue strip, the left column of `Box` sections and the content.

- `Log out` has its own route, `POST /housekeeping/logout`, and lands on `site.url`.
- The clock, `src/components/clock.astro`, shows the server's time in UTC and the local time. Its island
  `clock-time.svelte` ticks both; Go's server date and time stand in its fallback until the island starts.
- The clock's island is the first island of every page, so it carries Astro's script that wakes the page's other
  islands, those inside `[[ if ]]` included.

# The chrome

- Page structs embed `chrome` (`internal/router/router.go`), because the layout reads its fields and rendering fails
  without them.
- A staff member missing an attribute gets `access-denied.html` with 403, in the layout. Anyone without
  `housekeeping.access` gets a plain 403, because the static files are closed to them too.
