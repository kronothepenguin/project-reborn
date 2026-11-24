---
type: Reference
title: Layouts
description: The site's two layouts at today's sizes, Holo's font on a 16px base, and where each of Holo's numbers went.
---

# The sizes

- `src/styles/global.css` sets Holo's font, `Verdana, Arial, Helvetica, sans-serif`, as the theme's `--font-sans`. Every
  page, island and shared part of the site takes it.
- The body text is Tailwind's 16px `text-base`, Holo's 11px.
- A width is Holo's times 1240/960, a padding, gap or height Holo's times 4/3, each on Tailwind's scale. Borders,
  corner radii and pictures keep Holo's sizes.

# Community layout

`src/layouts/community.astro`, Holo's `templates/community`.

| Part | Holo | Here |
| --- | --- | --- |
| Page | `#container` 930px, 10px each side | `w-310` (1240px), `px-3.5` |
| Header | #bce0ee, 104px with the 2px black line | `bg-sky-200`, `h-30` and `border-b-2 border-black` |
| Logo | 111x42 of `habbo.png`, 16px from the top | the same box, `top-5` |
| Top bar | left 190, 572 wide, 28 tall, white | `left-61 w-185 h-9 rounded-bl bg-white` |
| Help, Sign Out | 10px | `text-sm` |
| Users online | left 781, top 15, 110 wide, 10px, 10px padding | `left-252 top-5 w-36 text-sm p-3.5` |
| Sub-navigation | 761 wide, 12px on 18px, padding `6px 0 0 20px`, margin right 179 | `w-246`, `text-lg leading-6`, `pt-2 pl-7 pr-58` |
| Footer | 9px #777, links black, padding `0 170px 1em 4px` | `text-xs text-neutral-500`, `pr-55 pb-4 pl-1` |

## The main tabs

`header/main-tabs.astro` draws Holo's `tabs.png` in CSS, as `Button` draws its raised face: the tab's background is
the lower half, `::before` the upper half, inside a 2px outline with 4px top corners. A tab is 36px tall, Holo's 28,
with `px-7 pt-1.5`, 18px text (`text-lg`) and a 6px gap.

| Tab | Outline | Upper half | Lower half |
| --- | --- | --- | --- |
| Normal | `blue-900` | `sky-600` | `sky-700` |
| Hover | `blue-900` | `sky-400` | `sky-600` |
| Green | `lime-800` | `lime-500` | `lime-600` |
| Green hover | `lime-800` | `lime-400` | `lime-500` |
| Selected | `black` | white | white |

- The tabs stand 2px over the header's black line. An unselected tab's bottom border is black and lies on the line;
  the selected tab has none, so its white covers the line and opens into the sub-navigation.
- Housekeeping and "Register now!" are green; Housekeeping alone is bold, in `<b>`, as Holo's.

## The habbo search

`header/habbo-search.astro`: the field, then the search button, on one line, both 32px tall, 4px apart, flush with the
top bar's right edge. The field is 220px, Holo's 171.

# Signed-out layout

`src/layouts/signed-out.astro`, Holo's `templates/login` and `process.css`.

- The page is Holo's 766px box, `w-247` (988px), centred, 16px from the top, on `bg-sky-200`, with `px-7` inside.
- The counts stand on one line under the whole `habbo.png`, each right-aligned in Holo's landing widths, 395 and 310:
  `w-127.5` and `w-100`.
- The footer is Holo's: one line of links separated by ` | `, `text-xs text-neutral-500`, links black.
