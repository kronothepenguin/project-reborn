---
type: Reference
title: Layouts
description: The site's two layouts and its pages as Holo's, at Holo's sizes in Tailwind's closest common classes, and where each of Holo's numbers went.
---

# The sizes

- `src/styles/global.css` sets Holo's font, `Verdana, Arial, Helvetica, sans-serif`, as the theme's `--font-sans`. Every
  page, island and shared part of the site takes it.
- Both layouts set `text-xs` at their root: Holo's 11px text is Tailwind's 12px.
- A size is Tailwind's common class closest to Holo's pixels:

| Holo | Here |
| --- | --- |
| 9px, 10px, 11px, 12px text | `text-xs` |
| 14px text | `text-sm` |
| 16px text | `text-base` |
| 18px text | `text-lg` |
| 3px to 5px of padding, margin or gap | `1` (4px) or `1.5` (6px) |
| 7px, 8px | `2` (8px) |
| 10px | `2.5` |
| 14px, 15px, 16px | `3.5`, `4` |

- Widths that set the page's grid keep Holo's pixels, as arbitrary values: the 930px page, its columns, the header's
  parts and the fields Holo sized. So do borders, corner radii and pictures: a picture keeps its own size and fills
  its box as Holo's.
- Line heights are Tailwind's for the class, but where Holo set one: the title bars' 17px, the sub-navigation's 18px.

# Community layout

`src/layouts/community.astro`, Holo's `templates/community/header.php` and `style.css`.

## The page

- The page is Holo's 930px, centred, with 10px at each side (`px-2.5`) and `min-w-[950px]`.
- `main` starts 4px under the sub-navigation (`pt-1`), Holo's `#content` 5px.
- A page lays out its own columns, Holo's: 460 / 310 / 160 on the Me, community and staff pages, 210 / 560 / 160 on
  news and tags. A box's margin, Holo's `0 8px 7px 0`, is `mr-2 mb-2`; a box of the last column has no right margin.

## The header

The header is 104px: a 102px box (`h-[102px]`) over a 2px black line (`border-b-2`), its parts placed where Holo's
stood.

| Part | Holo | Here |
| --- | --- | --- |
| Logo | 111x42 of `habbo.png`, 16px from the top | `top-4`, `h-[42px] w-[111px] overflow-hidden` |
| Top bar | left 190, 572 wide, 28 tall, white | `left-[190px] w-[572px]`, `h-7 rounded-b bg-white` |
| Help, Sign Out | 10px | `text-xs` |
| Habbo search | the field 171x27, at the bar's right edge | `w-[171px] p-1`, its button as tall, 4px apart |
| Mini login | right 0, top 7, 300px, 420px while pointed at; fields 128px | `top-[7px] right-0 min-w-[300px]`, `hover:min-w-[420px]`; fields `w-32` |
| Users online | left 781, top 15, 110 wide, 10px text, 18px and 22px around it | `left-[781px] top-[15px] w-[110px]`, `px-5.5 py-4.5`, `rounded-lg` |

- The mini login's help line stays on one line in `text-xs`, so the box grows to its width, past Holo's 300px.
- The mini login is `olive-400`, its help line `olive-500`, the closest of Holo's two greys.

## The main tabs

`header/main-tabs.astro` draws Holo's `tabs.png` in CSS, as `Button` draws its raised face: the tab's background is
the lower half, `::before` the upper 12px, inside a 2px outline with 4px top corners. A tab is Holo's 28px (`h-7`),
with `text-xs`, Holo's 12px, 22px of padding at each side (`px-5` inside the outline) and 6px above (`pt-1`), the tabs
6px apart (`gap-1.5`), Holo's 5px.

| Tab | Outline | Upper half | Lower half |
| --- | --- | --- | --- |
| Normal | `blue-900` | `sky-600` | `sky-700` |
| Hover | `blue-900` | `sky-400` | `sky-600` |
| Green | `lime-800` | `lime-500` | `lime-600` |
| Green hover | `lime-800` | `lime-400` | `lime-500` |
| Selected | `black` | white | white |

- The tabs stand on the header's black line (`-bottom-0.5`). An unselected tab's bottom border is black and lies on
  the line; the selected tab has none, so its white covers the line and opens into the sub-navigation.
- Housekeeping and "Register now!" are green; Housekeeping alone is bold, in `<b>`, as Holo's.

## The sub-navigation

Holo's `#navi2`: a 761px white bar, 1px from the page's left, with 1px `black/20` sides and a 3px `black/20` bottom with
rounded corners (`navi2-borders.png` and `navi2-bottom.png`): `ml-px w-[761px] rounded-b-md border-x border-b-[3px]`.
Its items are `text-xs` on `leading-4.5`, Holo's 12px on 18px, 6px from the top and 20px from the left (`pt-1.5 pl-5`),
with 6px of white under them (`pb-1.5`), so the bar is Holo's 33px. Items are separated by a thin line 1.3em away on
each side; the selected one is bold and black, a link underlined while pointed at.

## The footer

Holo's: `pr-[170px] pl-1 pb-3`, two lines in `text-xs text-neutral-500`, Holo's 9px #777, links black.

# Signed-out layout

`src/layouts/signed-out.astro`, Holo's `templates/login` and `process.css`.

- The page is Holo's 758px box (`w-[758px]` inside a centred 766px container), 12px from the top (`mt-3`), with 20px
  inside at each side (`px-5`), Holo's 21.
- The header is Holo's 70px: the whole `habbo.png` 16px from the top, then the counts on one line 56px from the top,
  each right-aligned in Holo's widths, 395 and 310.
- The footer is Holo's: one line of links separated by ` | `, `text-xs text-neutral-500`, links black, 16px above it
  and 12px under it.

# Pages

- The front page: Holo's columns of 404 and 310px, 18px under the header (`pt-4.5`); the sign-in box with Holo's rows
  (labels 75px, fields 99px, the rows under them from 80px); the party picture 8px under it; the tag cloud under both
  columns, `px-4 py-2`.
- The community page: Random Habbos in the first column, its stripes filling the box under the title as Holo's list
  container, Holo's 435x230 grid at its left at its own size; the news and the tag cloud in the second; the banners in
  the third.
- The Me page: the personal info, 450px, with the hotel view filling its top at its own size, 450x143; the Groups and
  Tags boxes are `Paper`s with the tabs at the top, 4px under the frame, so the line under their tabs runs the box's
  full width; the news; the banners.
- A top story is Holo's 300x187 box with its picture at its own size at the left, on Holo's olive.
- A box's content sits where Holo's does. `Card` insets its content 8px and 16px, Holo's `box-content`; where Holo
  set no `box-content`, as in the news, tags, credits, club and transactions boxes, the content takes the inset back
  with `-mx-4 -mt-2 -mb-0.5` and sets Holo's own padding.
- Holo's `p` has no margin and 1em under it: a paragraph of Holo is `pb-3`.
- News, an article, staff, tags and a tag's search, credits and the transactions, club, the account pages, register,
  forgot and the client's error pages were set beside Holo's at 1366px. The reset page takes the forgot page's left
  box; the account's Habbos and Furni take the account layout.
- The account pages flow as Holo's settings forms: headings 4px apart, fields Holo's 243px (`size="32"`), steps with
  the number floating left of the step and 1.2em between steps. Register keeps Holo's two floats, 435px and 269px,
  centred bold labels and fields of 230px.
- The client's error pages stand on Habbo's black page, the box 448px and centred, 88px under the top of the
  content, as Habbo's `habboclient.css` that Holo's page loads.
- Home pages keep their canvas: the playground, its widgets, notes and stickers, and their dialogs keep Holo's pixels.
  The Help Tool's window and the client's top bar keep theirs too.
- BBCode's `[size=small]` is `text-[10px]` and `[size=large]` `text-base`, Holo's `<font size>` 1 and 3; the quote
  box is `m-[3px] mb-2.5 p-[5px]`. `src/bbcode.ts` of the components and `internal/bbcode` change together.
